const PaymentRequest = require('../models/PaymentRequest');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @POST /api/payment-requests ← student submits
const submitPaymentRequest = async (req, res) => {
  try {
    const {
      classId, feeRecordId, amount, method, month,
      cardHolderName, cardLastFour, cardType,
      bankName, transactionRef, notes,
    } = req.body;

    if (!classId || !amount || !method) {
      return res.status(400).json({ message: 'classId, amount and method are required' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.status === 'suspended') {
      return res.status(403).json({
        message: `Your account is suspended. Reason: ${student.suspendReason || 'Contact admin'}. Please contact the institute to resolve your suspension before making payments.`,
        suspended: true,
        reason: student.suspendReason,
      });
    }

    // Resolve feeRecordId
    let resolvedFeeRecordId = null;
    if (feeRecordId && feeRecordId !== 'undefined' && mongoose.Types.ObjectId.isValid(feeRecordId)) {
      resolvedFeeRecordId = feeRecordId;
    } else {
      const feeRecord = await FeeRecord.findOne({
        studentId: student._id,
        classId,
        month,
        status: { $in: ['unpaid', 'overdue'] },
      }).sort({ createdAt: -1 });
      resolvedFeeRecordId = feeRecord?._id || null;
    }

    // ── Auto approve card payments ────────────────────────────
    if (method === 'card') {
      const receiptNumber = 'CARD-' + Date.now().toString().slice(-6);

      const request = await PaymentRequest.create({
        studentId: student._id,
        classId,
        feeRecordId: resolvedFeeRecordId,
        amount,
        method,
        month: month || undefined,
        cardHolderName: cardHolderName || undefined,
        cardLastFour: cardLastFour || undefined,
        status: 'approved',
        reviewedAt: new Date(),
        receiptNumber,
      });

      // Mark this specific month's fee as paid
      if (resolvedFeeRecordId) {
        await FeeRecord.findByIdAndUpdate(resolvedFeeRecordId, {
          status: 'paid', paidAt: new Date(),
        });
      } else if (month) {
        await FeeRecord.findOneAndUpdate(
          { studentId: student._id, classId, month },
          { status: 'paid', paidAt: new Date() }
        );
      }

      // Create payment record
      await Payment.create({
        feeRecordId: resolvedFeeRecordId || new mongoose.Types.ObjectId(),
        studentId: student._id,
        classId,
        amount,
        method: 'card',
        month: month || undefined,
        receiptNumber,
        collectedBy: req.user._id,
      });

      // ── Try re-enroll — only succeeds if ALL months now paid ─
      const { reEnrollAfterPayment } = require('../middleware/paymentEnforcer');
      const reEnrollResult = await reEnrollAfterPayment(student._id, classId);

      return res.status(201).json({
        success: true,
        autoApproved: true,
        receiptNumber,
        reEnrolled: reEnrollResult.success && reEnrollResult.reEnrolled,
        stillOwed: reEnrollResult.unpaidMonths || [],
        remainingAmount: reEnrollResult.remainingAmount || 0,
        message: reEnrollResult.success
          ? 'Payment approved! You have been re-enrolled.'
          : `Payment approved! Still need to pay: ${reEnrollResult.reason}`,
        requestId: request._id,
      });
    }

    // ── Cash / Bank Transfer → pending approval ───────────────
    const request = await PaymentRequest.create({
      studentId: student._id,
      classId,
      feeRecordId: resolvedFeeRecordId,
      amount,
      method,
      month: month || undefined,
      cardHolderName: cardHolderName || undefined,
      cardLastFour: cardLastFour || undefined,
      bankName: bankName || undefined,
      transactionRef: transactionRef || undefined,
      notes: notes || undefined,
      slipUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      slipFileName: req.file?.originalname || undefined,
    });

    res.status(201).json({
      success: true,
      autoApproved: false,
      message: 'Payment request submitted. Admin will approve shortly.',
      requestId: request._id,
    });
  } catch (e) {
    console.error('Submit payment request error:', e.message);
    res.status(500).json({ message: e.message });
  }
};

// @GET /api/payment-requests ← admin sees all
const getPaymentRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await PaymentRequest.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('classId', 'name subject')
      .sort({ createdAt: -1 });
    res.json({ count: requests.length, requests });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @GET /api/payment-requests/my ← student sees own
const getMyPaymentRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const requests = await PaymentRequest.find({ studentId: student._id })
      .populate('classId', 'name subject')
      .sort({ createdAt: -1 });
    res.json({ count: requests.length, requests });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @PATCH /api/payment-requests/:id/approve ← admin
const approvePaymentRequest = async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id)
      .populate('studentId')
      .populate('classId');

    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Already ${request.status}` });
    }

    let feeRecordId = request.feeRecordId;
    if (!feeRecordId) {
      const feeRecord = await FeeRecord.findOne({
        studentId: request.studentId._id,
        classId: request.classId._id,
        month: request.month,
        status: { $in: ['unpaid', 'overdue'] },
      }).sort({ createdAt: -1 });
      feeRecordId = feeRecord?._id;
    }

    const payment = await Payment.create({
      feeRecordId: feeRecordId || new mongoose.Types.ObjectId(),
      studentId: request.studentId._id,
      classId: request.classId._id,
      amount: request.amount,
      method: request.method,
      collectedBy: req.user._id,
    });

    if (feeRecordId) {
      await FeeRecord.findByIdAndUpdate(feeRecordId, {
        status: 'paid', paidAt: new Date(),
      });
    }

    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // ── Try re-enroll — only succeeds if ALL months now paid ──
    const { reEnrollAfterPayment } = require('../middleware/paymentEnforcer');
    const reEnrollResult = await reEnrollAfterPayment(
      request.studentId._id,
      request.classId._id
    );

    res.json({
      message: 'Payment approved',
      receiptNumber: payment.receiptNumber,
      reEnrolled: reEnrollResult.success && reEnrollResult.reEnrolled,
      stillOwed: reEnrollResult.unpaidMonths || [],
    });
  } catch (e) {
    console.error('Approve payment request error:', e.message);
    res.status(500).json({ message: e.message });
  }
};

// @PATCH /api/payment-requests/:id/reject ← admin
const rejectPaymentRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await PaymentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Already ${request.status}` });
    }
    request.status = 'rejected';
    request.rejectReason = reason || 'No reason provided';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    res.json({ message: 'Payment rejected' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  submitPaymentRequest,
  getPaymentRequests,
  getMyPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
};