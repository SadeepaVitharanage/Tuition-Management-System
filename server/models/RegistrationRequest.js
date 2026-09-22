const mongoose = require('mongoose');

const registrationRequestSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    studentEmail: {
      type: String,
      required: [true, 'Student email is required'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: 'XenEdu@1234',
    },
    school: {
      type: String,
      required: [true, 'School is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: ['Grade 12', 'Grade 13'],
    },
    medium: {
      type: String,
      required: [true, 'Medium is required'],
      enum: ['Sinhala', 'Tamil', 'English'],
    },
    stream: {
      type: String,
      required: [true, 'Stream is required'],
      enum: ['Physical Science', 'Biological Science', 'Commerce', 'Arts', 'Technology'],
    },
    parentName: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true,
    },
    parentEmail: {
      type: String,
      required: [true, 'Parent email is required'],
      lowercase: true,
      trim: true,
    },
    parentContact: {
      type: String,
      required: [true, 'Parent contact is required'],
      trim: true,
    },
    parentAddress: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectedReason: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RegistrationRequest', registrationRequestSchema);