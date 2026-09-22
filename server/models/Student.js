const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
    admissionNumber: { type: String, unique: true, trim: true },
    school: { type: String, required: [true, 'School is required'], trim: true },
    grade: { type: String, required: [true, 'Grade is required'], enum: ['Grade 12', 'Grade 13'] },
    medium: { type: String, required: [true, 'Medium is required'], enum: ['Sinhala', 'Tamil', 'English'] },
    stream: { type: String, enum: ['Physical Science', 'Biological Science', 'Commerce', 'Arts', 'Technology'] },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },

    // ── Suspension info ───────────────────────────────────────────
    suspendReason: { type: String, default: null },
    suspendedAt: { type: Date, default: null },
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  },
  { timestamps: true }
);

studentSchema.pre('save', async function (next) {
  if (!this.admissionNumber) {
    const count = await mongoose.model('Student').countDocuments();
    this.admissionNumber = `XE${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);