const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  updateStatus,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getStudents);
router.post('/', authorize('admin'), createStudent);
router.get('/:id', authorize('admin', 'teacher'), getStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.patch('/:id/status', authorize('admin'), updateStatus);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;