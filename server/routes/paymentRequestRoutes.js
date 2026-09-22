const express = require('express');
const router = express.Router();
const {
  submitPaymentRequest,
  getPaymentRequests,
  getMyPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
} = require('../controllers/paymentRequestController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

router.post('/', protect, authorize('student'), upload.single('slip'), submitPaymentRequest);
router.get('/', protect, authorize('admin'), getPaymentRequests);
router.get('/my', protect, authorize('student'), getMyPaymentRequests);
router.patch('/:id/approve', protect, authorize('admin'), approvePaymentRequest);
router.patch('/:id/reject', protect, authorize('admin'), rejectPaymentRequest);

module.exports = router;