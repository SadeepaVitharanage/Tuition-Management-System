const express = require('express');
const router = express.Router();
const {
  applyRegistration,
  getPendingRequests,
  approveRegistration,
  rejectRegistration,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// Public route - no token needed
router.post('/apply', applyRegistration);

// Admin only routes
router.get('/pending', protect, authorize('admin'), getPendingRequests);
router.patch('/:id/approve', protect, authorize('admin'), approveRegistration);
router.patch('/:id/reject', protect, authorize('admin'), rejectRegistration);

module.exports = router;