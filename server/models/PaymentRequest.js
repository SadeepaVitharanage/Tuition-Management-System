const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  feeRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeRecord',
    required: false,  // ← was implicitly required, now explicitly optional
  },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['card', 'cash', 'bank_transfer'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  cardHolderName: { type: String },
  cardLastFour: { type: String },
  slipUrl: { type: String },
  slipFileName: { type: String },
  bankName: { type: String },
  transactionRef: { type: String },
  notes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);