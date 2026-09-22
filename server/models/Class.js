const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: [
        'Mathematics', 'Combined Mathematics', 'Physics', 'Chemistry',
        'Biology', 'ICT', 'Economics', 'Accounting', 'Business Studies',
        'History', 'Geography', 'Sinhala', 'English', 'Tamil',
      ],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: ['Grade 12', 'Grade 13', 'Both'],
    },
    medium: {
      type: String,
      enum: ['Sinhala', 'Tamil', 'English'],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    hall: {
      type: String,
      enum: ['Hall 1', 'Hall 2', 'Hall 3'],
    },
    schedule: {
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: { type: String },
      endTime: { type: String },
      durationMins: { type: Number, default: 90 },
    },
    monthlyFee: {
      type: Number,
      required: [true, 'Monthly fee is required'],
    },
    minCapacity: {
      type: Number,
      default: 5,
    },
    maxCapacity: {
      type: Number,
      default: 40,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);