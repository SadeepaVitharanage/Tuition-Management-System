const Student = require('../models/Student');
const Parent = require('../models/Parent');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');

// @GET /api/parent/dashboard  ← parent only
const getParentDashboard = async (req, res) => {
  try {
    // Find parent profile
    const parent = await Parent.findOne({ userId: req.user._id })
      .populate({
        path: 'students',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'enrolledClasses', select: 'name subject hall schedule monthlyFee' }
        ]
      });

    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    // Build dashboard for each child
    const childrenData = await Promise.all(
      parent.students.map(async (student) => {

        // Fee summary
        const fees = await FeeRecord.find({ studentId: student._id })
          .populate('classId', 'name subject');

        const unpaidFees = fees.filter(f =>
          f.status === 'unpaid' || f.status === 'overdue'
        );
        const totalOutstanding = unpaidFees.reduce((sum, f) => sum + f.amount, 0);

        // Recent payments
        const recentPayments = await Payment.find({
          studentId: student._id,
          status: 'completed',
        })
          .populate('classId', 'name subject')
          .sort({ paidAt: -1 })
          .limit(5);

        // Attendance per class
        const attendanceSummary = await Promise.all(
          student.enrolledClasses.map(async (cls) => {
            const sessions = await ClassSession.find({
              classId: cls._id,
              status: 'completed',
            });

            const sessionIds = sessions.map(s => s._id);
            const totalSessions = sessionIds.length;

            const presentCount = await Attendance.countDocuments({
              studentId: student._id,
              sessionId: { $in: sessionIds },
              status: { $in: ['present', 'late'] },
            });

            const percentage = totalSessions > 0
              ? Math.round((presentCount / totalSessions) * 100)
              : null;

            return {
              className: cls.name,
              subject: cls.subject,
              hall: cls.hall,
              schedule: cls.schedule,
              totalSessions,
              presentCount,
              percentage: percentage !== null ? `${percentage}%` : 'No sessions yet',
              atRisk: percentage !== null && percentage < 80,
              risk: percentage < 60 ? 'critical' : percentage < 80 ? 'warning' : 'good',
            };
          })
        );

        return {
          student: {
            name: student.userId.name,
            email: student.userId.email,
            admissionNumber: student.admissionNumber,
            grade: student.grade,
            school: student.school,
            stream: student.stream,
            status: student.status,
          },
          fees: {
            totalOutstanding,
            unpaidCount: unpaidFees.length,
            unpaidFees: unpaidFees.map(f => ({
              class: f.classId?.name,
              subject: f.classId?.subject,
              amount: f.amount,
              month: f.month,
              dueDate: f.dueDate,
            })),
          },
          recentPayments: recentPayments.map(p => ({
            receiptNumber: p.receiptNumber,
            class: p.classId?.name,
            amount: p.amount,
            method: p.method,
            paidAt: p.paidAt,
          })),
          attendance: attendanceSummary,
        };
      })
    );

    res.status(200).json({
      parent: {
        name: req.user.name,
        email: req.user.email,
        contact: parent.contactNumber,
      },
      children: childrenData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getParentDashboard };