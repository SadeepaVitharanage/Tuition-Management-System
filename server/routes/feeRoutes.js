const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/generate', authorize('admin'), generateMonthlyFees);
router.post('/pay', authorize('admin'), payFee);
router.get('/outstanding', authorize('admin'), getOutstandingFees);
router.get('/reports/monthly', authorize('admin'), getMonthlyReport);
router.get('/reports/daterange', authorize('admin'), getDateRangeReport);
router.get('/reports/teacher/:teacherId', authorize('admin'), getTeacherReport);
router.delete('/payments/:id/void', authorize('admin'), voidPayment);
router.get('/payments/student/:studentId', getStudentPayments);

// ── Student own fees (auto marks overdue) ─────────────────────
router.get('/student', getMyFees);
router.get('/student/:studentId', getStudentFees);

module.exports = router;