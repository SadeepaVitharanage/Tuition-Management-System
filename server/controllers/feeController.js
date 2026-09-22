const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Class = require('../models/Class');

// ── Helper: auto-mark overdue (current/past only) ─────────────────
const autoMarkOverdue = async () => {
  const now = new Date();
  const currentMonth = new Date().toISOString().slice(0, 7);

  await FeeRecord.updateMany(
    { status: 'unpaid', dueDate: { $lt: now }, month: { $lte: currentMonth } },
    { status: 'overdue' }
  );

  // Reset future fees wrongly marked overdue
  await FeeRecord.updateMany(
    { status: 'overdue', month: { $gt: currentMonth } },
    { status: 'unpaid' }
  );
};

// @POST /api/fees/generate ← admin only
const generateMonthlyFees = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) return res.status(400).json({ message: 'Month is required (format: 2026-04)' });

    // ── Block future month generation ─────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (month > currentMonth) {
      return res.status(400).json({
        message: `Cannot generate fees for future month (${month}). Current month is ${currentMonth}.`,
        blocked: true,
      });
    }

    const [yearStr, monthStr] = month.split('-');
    const targetYear = parseInt(yearStr);
    const targetMonth = parseInt(monthStr);
    const targetDate = new Date(targetYear, targetMonth - 1, 1);

    const classes = await Class.find({ status: 'active' }).populate('enrolledStudents');

    let generated = 0;
    let skipped = 0;

    for (const cls of classes) {
      for (const student of cls.enrolledStudents) {

        // Only generate from enrollment month onwards
        const enrollmentDate = new Date(student.createdAt || cls.startDate || new Date());
        const enrollFirstDay = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth(), 1);
        if (targetDate < enrollFirstDay) { skipped++; continue; }

        // Skip if already exists
        const existing = await FeeRecord.findOne({
          studentId: student._id, classId: cls._id, month,
        });
        if (existing) { skipped++; continue; }

        // Due date = 21st of month
        const dueDate = new Date(targetYear, targetMonth - 1, 21);

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

    res.status(201).json({
      message: 'Monthly fees generated successfully',
      generated, skipped, month,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/fees/pay ← admin only (scan & pay)
const payFee = async (req, res) => {
  try {
    const { feeRecordId, method } = req.body;
    if (!feeRecordId) return res.status(400).json({ message: 'feeRecordId is required' });

    const feeRecord = await FeeRecord.findById(feeRecordId);
    if (!feeRecord) return res.status(404).json({ message: 'Fee record not found' });
    if (feeRecord.status === 'paid') return res.status(400).json({ message: 'Fee already paid' });

    const receiptNumber = 'CASH-' + Date.now().toString().slice(-6);

    const payment = await Payment.create({
      feeRecordId: feeRecord._id,
      studentId: feeRecord.studentId,
      classId: feeRecord.classId,
      amount: feeRecord.amount,
      method: method || 'cash',
      receiptNumber,
      collectedBy: req.user._id,
      paidAt: new Date(),
      status: 'completed',
    });

    feeRecord.status = 'paid';
    feeRecord.paidAt = new Date();
    await feeRecord.save();

    try {
      const { reEnrollAfterPayment } = require('../middleware/paymentEnforcer');
      await reEnrollAfterPayment(feeRecord.studentId, feeRecord.classId);
    } catch (err) {
      console.log('Re-enroll check failed:', err.message);
    }

    const populated = await Payment.findById(payment._id)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('classId', 'name subject')
      .populate('collectedBy', 'name');

    res.status(201).json({
      message: 'Payment recorded successfully',
      receipt: {
        receiptNumber: payment.receiptNumber,
        studentName: populated.studentId?.userId?.name,
        admissionNumber: populated.studentId?.admissionNumber,
        class: populated.classId?.name,
        subject: populated.classId?.subject,
        amount: payment.amount,
        method: payment.method,
        collectedBy: populated.collectedBy?.name,
        paidAt: payment.paidAt,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/student ← student own fees
const getMyFees = async (req, res) => {
  try {
    await autoMarkOverdue();

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const currentMonth = new Date().toISOString().slice(0, 7);

    const fees = await FeeRecord.find({
      studentId: student._id,
      month: { $lte: currentMonth },
    })
      .populate('classId', 'name subject monthlyFee')
      .sort({ month: -1 });

    const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const totalUnpaid = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      fees,
      summary: { totalPaid, totalUnpaid, totalRecords: fees.length }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/student/:studentId ← admin
const getStudentFees = async (req, res) => {
  try {
    await autoMarkOverdue();

    const { month, status } = req.query;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const filter = {
      studentId: req.params.studentId,
      month: { $lte: currentMonth }, // never show future
    };
    if (month) filter.month = month;
    if (status) filter.status = status;

    const fees = await FeeRecord.find(filter)
      .populate('classId', 'name subject monthlyFee')
      .sort({ month: -1 });

    const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const totalUnpaid = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      fees,
      summary: { totalPaid, totalUnpaid, totalRecords: fees.length }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/outstanding ← admin
const getOutstandingFees = async (req, res) => {
  try {
    await autoMarkOverdue();

    const currentMonth = new Date().toISOString().slice(0, 7);

    const fees = await FeeRecord.find({
      status: { $in: ['unpaid', 'overdue'] },
      month: { $lte: currentMonth }, // only current + past
    })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'parentId', populate: { path: 'userId', select: 'name email' } }
        ]
      })
      .populate('classId', 'name subject')
      .sort({ dueDate: 1 });

    const total = fees.reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({ count: fees.length, totalOutstanding: total, fees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/payments/student/:studentId ← all roles
const getStudentPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.params.studentId,
      status: 'completed',
    })
      .populate('classId', 'name subject')
      .populate('collectedBy', 'name')
      .sort({ paidAt: -1 });

    res.status(200).json({ count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/fees/payments/:id/void ← admin
const voidPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status === 'voided') return res.status(400).json({ message: 'Already voided' });

    payment.status = 'voided';
    payment.voidedBy = req.user._id;
    payment.voidReason = reason || 'No reason provided';
    payment.voidedAt = new Date();
    await payment.save();

    await FeeRecord.findByIdAndUpdate(payment.feeRecordId, {
      status: 'unpaid', paidAt: null,
    });

    res.status(200).json({
      message: 'Payment voided successfully',
      receiptNumber: payment.receiptNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/reports/monthly ← admin
const getMonthlyReport = async (req, res) => {
  try {
    await autoMarkOverdue();

    const { month } = req.query;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const filter = { month: { $lte: currentMonth } }; // never show future
    if (month) filter.month = month;

    const fees = await FeeRecord.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('classId', 'name subject');

    const totalGenerated = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const totalUnpaid = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      month: month || 'All months',
      summary: {
        totalGenerated,
        totalCollected,
        totalUnpaid,
        collectionRate: totalGenerated > 0
          ? `${Math.round((totalCollected / totalGenerated) * 100)}%`
          : '0%',
      },
      records: fees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/reports/daterange ← admin
const getDateRangeReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'from and to dates required' });

    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      status: 'completed',
      paidAt: { $gte: fromDate, $lte: toDate },
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('classId', 'name subject')
      .populate('collectedBy', 'name')
      .sort({ paidAt: 1 });

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    const byDate = {};
    payments.forEach(p => {
      const date = new Date(p.paidAt).toLocaleDateString('en-GB');
      if (!byDate[date]) byDate[date] = { date, count: 0, total: 0 };
      byDate[date].count++;
      byDate[date].total += p.amount;
    });

    res.status(200).json({
      from, to,
      totalCollected,
      totalPayments: payments.length,
      byDate: Object.values(byDate),
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/fees/reports/teacher/:teacherId ← admin
const getTeacherReport = async (req, res) => {
  try {
    await autoMarkOverdue();

    const { month } = req.query;
    const Teacher = require('../models/Teacher');
    const currentMonth = new Date().toISOString().slice(0, 7);

    const teacher = await Teacher.findById(req.params.teacherId)
      .populate('userId', 'name email');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const classes = await Class.find({ teacherId: teacher._id });
    const classIds = classes.map(c => c._id);

    const filter = {
      classId: { $in: classIds },
      month: { $lte: currentMonth }, // never show future
    };
    if (month) filter.month = month;

    const fees = await FeeRecord.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('classId', 'name subject monthlyFee');

    const classReports = classes.map(cls => {
      const classFees = fees.filter(f => f.classId?._id?.toString() === cls._id.toString());
      const paid = classFees.filter(f => f.status === 'paid');
      const unpaid = classFees.filter(f => f.status !== 'paid');
      return {
        className: cls.name,
        subject: cls.subject,
        enrolledCount: cls.enrolledStudents?.length || 0,
        monthlyFee: cls.monthlyFee,
        totalGenerated: classFees.reduce((s, f) => s + f.amount, 0),
        totalCollected: paid.reduce((s, f) => s + f.amount, 0),
        totalUnpaid: unpaid.reduce((s, f) => s + f.amount, 0),
        paidCount: paid.length,
        unpaidCount: unpaid.length,
        collectionRate: classFees.length > 0
          ? Math.round((paid.length / classFees.length) * 100)
          : 0,
      };
    });

    const totalCollected = classReports.reduce((s, c) => s + c.totalCollected, 0);
    const totalGenerated = classReports.reduce((s, c) => s + c.totalGenerated, 0);

    res.status(200).json({
      teacher: {
        name: teacher.userId?.name,
        email: teacher.userId?.email,
        subjects: teacher.subjectExpertise,
      },
      month: month || 'All time',
      totalClasses: classes.length,
      totalCollected,
      totalGenerated,
      collectionRate: totalGenerated > 0
        ? Math.round((totalCollected / totalGenerated) * 100)
        : 0,
      classReports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateMonthlyFees,
  payFee,
  getMyFees,
  getStudentFees,
  getStudentPayments,
  voidPayment,
  getMonthlyReport,
  getOutstandingFees,
  getDateRangeReport,
  getTeacherReport,
};