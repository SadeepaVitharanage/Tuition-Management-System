const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    feeRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeRecord',
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'online'],
      default: 'cash',
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ['completed', 'voided'],
      default: 'completed',
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    voidReason: {
      type: String,
    },
    voidedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    feeRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeRecord',
      required: false,  // ← change from required: true
    },
  },
  { timestamps: true }
);

// Auto generate receipt number
paymentSchema.pre('save', async function (next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.receiptNumber = `RCP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);