const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    qualifications: {
      type: String,
      trim: true,
    },
    subjectExpertise: [
      {
        type: String,
        enum: [
          'Mathematics',
          'Combined Mathematics',
          'Physics',
          'Chemistry',
          'Biology',
          'ICT',
          'Economics',
          'Accounting',
          'Business Studies',
          'History',
          'Geography',
          'Sinhala',
          'English',
          'Tamil',
        ],
      },
    ],
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);