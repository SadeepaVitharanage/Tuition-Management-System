const Student = require('../models/Student');
const Class = require('../models/Class');
const FeeRecord = require('../models/FeeRecord');
const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');

// @GET /api/scan/:admissionNumber
const scanStudent = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    const student = await Student.findOne({ admissionNumber })
      .populate('userId', 'name email isActive')
      .populate({
        path: 'enrolledClasses',
        populate: {
          path: 'teacherId',
          populate: { path: 'userId', select: 'name' }
        }
      })
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!student) {
      return res.status(404).json({ message: `No student found with admission number ${admissionNumber}` });
    }

    if (!student.userId) {
      return res.status(403).json({ message: 'Student account not found' });
    }

    const now = new Date();
    const currentMonth = new Date().toISOString().slice(0, 7);

    // ── Auto-mark overdue (current + past only) ───────────────
    await FeeRecord.updateMany(
      {
        studentId: student._id,
        status: 'unpaid',
        dueDate: { $lt: now },
        month: { $lte: currentMonth },
      },
      { status: 'overdue' }
    );

    // ── Reset future fees wrongly marked overdue ──────────────
    await FeeRecord.updateMany(
      { studentId: student._id, status: 'overdue', month: { $gt: currentMonth } },
      { status: 'unpaid' }
    );

    // ── Build class summary ───────────────────────────────────
    const classSummary = await Promise.all(
      student.enrolledClasses.map(async (cls) => {

        // Check current month fee record
        let currentFeeRecord = await FeeRecord.findOne({
          studentId: student._id,
          classId: cls._id,
          month: currentMonth,
        });

        // ── Auto-create if missing (new enrollment) ───────────
        if (!currentFeeRecord) {
          const dueDate = new Date(now.getFullYear(), now.getMonth(), 21);
          currentFeeRecord = await FeeRecord.create({
            studentId: student._id,
            classId: cls._id,
            amount: cls.monthlyFee,
            month: currentMonth,
            dueDate,
            status: 'unpaid',
          });
          console.log(`💰 Auto-created fee record: ${student.admissionNumber} → ${cls.name} (${currentMonth})`);
        }

        // All unpaid/overdue for this class (current + past only)
        const allUnpaidFees = await FeeRecord.find({
          studentId: student._id,
          classId: cls._id,
          status: { $in: ['unpaid', 'overdue'] },
          month: { $lte: currentMonth },
        }).sort({ month: 1 });

        // Pay oldest first
        const feeToPayRecord = allUnpaidFees[0] || currentFeeRecord;

        // Attendance
        const sessions = await ClassSession.find({ classId: cls._id, status: 'completed' });
        const sessionIds = sessions.map(s => s._id);
        const totalSessions = sessionIds.length;
        const presentCount = await Attendance.countDocuments({
          studentId: student._id,
          sessionId: { $in: sessionIds },
          status: { $in: ['present', 'late'] },
        });
        const attendancePercentage = totalSessions > 0
          ? Math.round((presentCount / totalSessions) * 100)
          : null;

        return {
          classId: cls._id,
          name: cls.name,
          subject: cls.subject,
          grade: cls.grade,
          hall: cls.hall,
          schedule: cls.schedule,
          monthlyFee: cls.monthlyFee,
          teacher: cls.teacherId?.userId?.name || 'Not assigned',
          feeStatus: currentFeeRecord.status,
          feePaidThisMonth: currentFeeRecord.status === 'paid',
          feeRecordId: feeToPayRecord?._id || null,
          totalUnpaidMonths: allUnpaidFees.length,
          totalOutstandingAmount: allUnpaidFees.reduce((sum, f) => sum + f.amount, 0),
          oldestUnpaidMonth: allUnpaidFees[0]?.month || null,
          attendancePercentage: attendancePercentage !== null ? `${attendancePercentage}%` : 'No sessions yet',
          attendanceRisk: attendancePercentage !== null && attendancePercentage < 80,
        };
      })
    );

    // ── Outstanding fees (current + past only) ────────────────
    const outstandingFees = await FeeRecord.find({
      studentId: student._id,
      status: { $in: ['unpaid', 'overdue'] },
      month: { $lte: currentMonth },
    }).populate('classId', 'name subject').sort({ month: 1 });

    const totalOutstanding = outstandingFees.reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      student: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        name: student.userId.name,
        email: student.userId.email,
        school: student.school,
        grade: student.grade,
        medium: student.medium,
        stream: student.stream,
        status: student.status,
        suspendReason: student.suspendReason || null,
        parent: {
          name: student.parentId?.userId?.name || null,
          email: student.parentId?.userId?.email || null,
          contact: student.parentId?.contactNumber || null,
        },
      },
      enrolledClasses: classSummary,
      outstandingFees: {
        total: totalOutstanding,
        records: outstandingFees.map(f => ({
          feeRecordId: f._id,
          class: f.classId?.name,
          subject: f.classId?.subject,
          amount: f.amount,
          month: f.month,
          status: f.status,
          dueDate: f.dueDate,
        }))
      },
      scannedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { scanStudent };