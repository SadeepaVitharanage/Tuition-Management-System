const express = require('express');
const router = express.Router();
const { scanStudent } = require('../controllers/scanController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:admissionNumber', protect, authorize('admin', 'teacher'), scanStudent);

module.exports = router;