const express = require('express');
const router = express.Router();
const { getCourseWork, addCourseWork, deleteCourseWork } = require('../controllers/courseWorkController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

router.get('/:classId', protect, getCourseWork);
router.post('/:classId', protect, authorize('teacher', 'admin'), upload.single('file'), addCourseWork);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourseWork);

module.exports = router;