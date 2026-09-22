const Student = require('../models/Student');
const Class = require('../models/Class');
const FeeRecord = require('../models/FeeRecord');

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
const getCurrentWeekOfMonth = () => Math.ceil(new Date().getDate() / 7);

// ── Auto-generate fee records for current month ───────────────────
// Runs on 1st of every month
const autoGenerateMonthlyFees = async () => {
  try {
    const month = getCurrentMonth();
    const now = new Date();

    console.log(`💰 Auto-generating fee records for ${month}...`);

    const classes = await Class.find({ status: 'active' })
      .populate('enrolledStudents');

    let generated = 0;
    let skipped = 0;

    for (const cls of classes) {
      for (const student of cls.enrolledStudents) {

        // Skip if already generated
        const existing = await FeeRecord.findOne({
          studentId: student._id,
          classId: cls._id,
          month,
        });

        if (existing) { skipped++; continue; }

        // Due date = 21st of current month (week 3)
        const [yearStr, monthStr] = month.split('-');
        const dueDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 21);

        await FeeRecord.create({
          studentId: student._id,
          classId: cls._id,
          amount: cls.monthlyFee,
          month,
          dueDate,
          status: 'unpaid',
        });

        generated++;
      }
    }

    console.log(`✅ Auto-generated ${generated} fee records for ${month}, skipped ${skipped}`);
    return { generated, skipped, month };
  } catch (err) {
    console.error('Auto-generate fees error:', err.message);
  }
};

// ── Mark overdue — ONLY current and past months ───────────────────
const autoMarkOverdue = async () => {
  try {
    const now = new Date();
    const currentMonth = getCurrentMonth();

    // Only mark overdue if dueDate passed AND it's current or past month
    await FeeRecord.updateMany(
      {
        status: 'unpaid',
        dueDate: { $lt: now },
        month: { $lte: currentMonth }, // never mark future months overdue
      },
      { status: 'overdue' }
    );

    // ── Safety: reset any future fees wrongly marked overdue ──────
    await FeeRecord.updateMany(
      {
        status: 'overdue',
        month: { $gt: currentMonth }, // future months
      },
      { status: 'unpaid' }
    );
  } catch (err) {
    console.error('Auto mark overdue error:', err.message);
  }
};

// ── Enforce payment deadline (week 3+) ───────────────────────────
const enforcePaymentDeadlines = async () => {
  try {
    const weekOfMonth = getCurrentWeekOfMonth();
    if (weekOfMonth < 3) {
      console.log(`📅 Week ${weekOfMonth} — Payment deadline not reached yet`);
      return;
    }

    console.log('🔒 Running payment enforcement check...');
    const month = getCurrentMonth(); // ONLY current month
    const classes = await Class.find({ status: 'active' });
    let blockedCount = 0;

    for (const cls of classes) {
      const enrolledStudents = [...cls.enrolledStudents];

      for (const studentId of enrolledStudents) {

        // ── Only check CURRENT month + any past unpaid ────────
        const currentFee = await FeeRecord.findOne({
          studentId,
          classId: cls._id,
          month, // only current month
        });

        const pastUnpaid = await FeeRecord.find({
          studentId,
          classId: cls._id,
          status: { $in: ['unpaid', 'overdue'] },
          month: { $lte: month }, // current + past only, NOT future
        });

        const currentPaid = currentFee?.status === 'paid';
        const hasOverdue = pastUnpaid.length > 0;

        if (!currentPaid || hasOverdue) {
          // Mark unpaid as overdue
          for (const fee of pastUnpaid) {
            if (fee.status === 'unpaid') {
              fee.status = 'overdue';
              await fee.save();
            }
          }

          // Unenroll from class
          await Class.findByIdAndUpdate(cls._id, {
            $pull: { enrolledStudents: studentId },
          });
          await Student.findByIdAndUpdate(studentId, {
            $pull: { enrolledClasses: cls._id },
          });

          blockedCount++;
          console.log(`🚫 Unenrolled student ${studentId} from ${cls.name}`);
        }
      }
    }

    console.log(`✅ Payment enforcement done: ${blockedCount} students blocked`);
  } catch (err) {
    console.error('Payment enforcement error:', err.message);
  }
};

// ── Re-enroll after payment ───────────────────────────────────────
const reEnrollAfterPayment = async (studentId, classId) => {
  try {
    const student = await Student.findById(studentId);
    const cls = await Class.findById(classId);
    if (!student || !cls) return { success: false, reason: 'Not found' };

    const currentMonth = getCurrentMonth();

    // Check ONLY current + past months (not future)
    const outstandingFees = await FeeRecord.find({
      studentId,
      classId,
      status: { $in: ['unpaid', 'overdue'] },
      month: { $lte: currentMonth }, // ignore future months
    });

    if (outstandingFees.length > 0) {
      const unpaidMonths = outstandingFees.map(f => f.month).join(', ');
      return {
        success: false,
        reason: `Still has unpaid fees for: ${unpaidMonths}`,
        unpaidMonths: outstandingFees.map(f => f.month),
        remainingAmount: outstandingFees.reduce((sum, f) => sum + f.amount, 0),
      };
    }

    // All paid — re-enroll
    const alreadyEnrolled = cls.enrolledStudents.map(String).includes(String(studentId));
    if (alreadyEnrolled) return { success: true, alreadyEnrolled: true };

    if (cls.enrolledStudents.length >= cls.maxCapacity) {
      return { success: false, reason: 'Class is full' };
    }

    await Class.findByIdAndUpdate(classId, {
      $addToSet: { enrolledStudents: studentId },
    });
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledClasses: classId },
    });

    console.log(`✅ Re-enrolled student ${studentId} in ${cls.name}`);
    return { success: true, reEnrolled: true };
  } catch (err) {
    console.error('Re-enroll error:', err.message);
    return { success: false, reason: err.message };
  }
};

// ── Start all cron jobs ───────────────────────────────────────────
const startPaymentEnforcementCron = () => {
  try {
    const cron = require('node-cron');

    // ── 1st of every month at 00:01 → auto-generate fees ─────
    cron.schedule('1 0 1 * *', async () => {
      console.log('💰 Monthly fee auto-generation running...');
      await autoGenerateMonthlyFees();
    });

    // ── Daily at midnight → mark overdue ─────────────────────
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ Daily overdue check running...');
      await autoMarkOverdue();
    });

    // ── Hourly from week 3 → enforce payment deadlines ───────
    cron.schedule('0 * * * *', async () => {
      const week = getCurrentWeekOfMonth();
      if (week >= 3) {
        await autoMarkOverdue();
        await enforcePaymentDeadlines();
      }
    });

    console.log('✅ Payment enforcement cron jobs started');
  } catch (err) {
    console.log('⚠️ node-cron not installed. Run: npm install node-cron');
  }
};

module.exports = {
  startPaymentEnforcementCron,
  autoGenerateMonthlyFees,
  enforcePaymentDeadlines,
  reEnrollAfterPayment,
  autoMarkOverdue,
};