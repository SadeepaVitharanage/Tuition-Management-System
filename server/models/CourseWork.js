const mongoose = require('mongoose');

const courseWorkSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['recording', 'instruction', 'assignment', 'notes'],
    default: 'instruction',
  },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  link: { type: String },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('CourseWork', courseWorkSchema);