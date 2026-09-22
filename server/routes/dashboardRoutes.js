const express = require('express');
const router = express.Router();
const { getStudentDashboard } = require('../controllers/studentDashboardController');
const { getParentDashboard } = require('../controllers/parentDashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/parent', protect, authorize('parent'), getParentDashboard);

module.exports = router;