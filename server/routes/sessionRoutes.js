const express = require('express');
const router = express.Router();
const {
  generateMonthSessions,
  getClassSessions,
  getTeacherSessions,
  cancelSession,
  rescheduleSession,
  completeSession,
  createSession,
} = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/generate', authorize('admin'), generateMonthSessions);
router.post('/', authorize('admin'), createSession);
router.get('/teacher', authorize('teacher'), getTeacherSessions);
router.get('/class/:classId', getClassSessions);
router.patch('/:id/cancel', authorize('admin'), cancelSession);
router.patch('/:id/reschedule', authorize('admin'), rescheduleSession);
router.patch('/:id/complete', authorize('teacher', 'admin'), completeSession);

module.exports = router;