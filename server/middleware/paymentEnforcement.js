const FeeRecord = require('../models/FeeRecord');
const Student = require('../models/Student');
const Class = require('../models/Class');

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
const getCurrentWeekOfMonth = () => Math.ceil(new Date().getDate() / 7);

// ── Change to `() => true` for testing, revert after ─────────────
const isPaymentDeadlinePassed = () => getCurrentWeekOfMonth() > 3;

const checkStudentPayment = async (studentId, classId) => {
  const month = getCurrentMonth();
  const feeRecord = await FeeRecord.findOne({ studentId, classId, month });
  const weekOfMonth = getCurrentWeekOfMonth();
  const deadlinePassed = isPaymentDeadlinePassed();
  const isPaid = feeRecord?.status === 'paid';

  // Also check for any previous unpaid months
  const allUnpaid = await FeeRecord.find({
    studentId,
    classId,
    status: { $in: ['unpaid', 'overdue'] },
  });

  const hasAnyUnpaid = allUnpaid.length > 0;

  return {
    month,
    weekOfMonth,
    deadlinePassed,
    feeRecord,
    isPaid,
    hasAnyUnpaid,
    unpaidMonths: allUnpaid.map(f => f.month),
    isUnpaid: !feeRecord || feeRecord.status === 'unpaid' || feeRecord.status === 'overdue',
    // Blocked if deadline passed AND has any unpaid month (current or previous)
    isBlocked: deadlinePassed && (hasAnyUnpaid || !isPaid),
  };
};

const getStudentPaymentStatus = async (studentId) => {
  const student = await Student.findById(studentId).populate('enrolledClasses');
  if (!student) return [];

  const month = getCurrentMonth();
  const weekOfMonth = getCurrentWeekOfMonth();
  const deadlinePassed = isPaymentDeadlinePassed();

  return await Promise.all(
    student.enrolledClasses.map(async (cls) => {
      const feeRecord = await FeeRecord.findOne({ studentId, classId: cls._id, month });
      const allUnpaid = await FeeRecord.find({
        studentId,
        classId: cls._id,
        status: { $in: ['unpaid', 'overdue'] },
      });
      const isPaid = feeRecord?.status === 'paid';
      const hasAnyUnpaid = allUnpaid.length > 0;
      const isBlocked = deadlinePassed && (hasAnyUnpaid || !isPaid);

      return {
        classId: cls._id,
        className: cls.name,
        subject: cls.subject,
        monthlyFee: cls.monthlyFee,
        month,
        weekOfMonth,
        deadlinePassed,
        isPaid,
        hasAnyUnpaid,
        unpaidMonths: allUnpaid.map(f => f.month),
        isBlocked,
        feeStatus: feeRecord?.status || 'not_generated',
        daysUntilDeadline: deadlinePassed ? 0 : Math.max(0, 21 - new Date().getDate()),
      };
    })
  );
};

module.exports = {
  checkStudentPayment,
  getStudentPaymentStatus,
  getCurrentMonth,
  getCurrentWeekOfMonth,
  isPaymentDeadlinePassed,
};