const express = require('express');
const router = express.Router();
const {
  markByBarcode,
  markBulk,
  getSessionAttendance,
  getStudentAttendance,
  getAbsentAlerts,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/scan', authorize('admin', 'teacher'), markByBarcode);
router.post('/session/:sessionId', authorize('admin', 'teacher'), markBulk);
router.get('/session/:sessionId', authorize('admin', 'teacher'), getSessionAttendance);
router.get('/alerts', authorize('admin', 'teacher'), getAbsentAlerts);
router.get('/student/:studentId', getStudentAttendance);
router.patch('/:id', authorize('admin', 'teacher'), updateAttendance);
router.delete('/:id', authorize('admin'), deleteAttendance);

module.exports = router;