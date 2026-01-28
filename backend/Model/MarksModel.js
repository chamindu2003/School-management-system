const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String
  },
  remarks: {
    type: String
  },
  publishedStatus: {
    type: Boolean,
    default: false
  },
  publishedDate: {
    type: Date
  }
}, { timestamps: true });

// Calculate percentage and grade before saving
MarksSchema.pre('save', function(next) {
  // Protect against missing/invalid totalMarks
  const total = (typeof this.totalMarks === 'number' && this.totalMarks > 0) ? this.totalMarks : 100;
  this.percentage = (this.marksObtained / total) * 100;

  // Calculate grade
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C';
  else this.grade = 'F';

  if (typeof next === 'function') return next();
});

// Index for quick queries
MarksSchema.index({ teacher: 1, subject: 1 });
MarksSchema.index({ student: 1, subject: 1 });
MarksSchema.index({ examName: 1 });

module.exports = mongoose.model('Marks', MarksSchema);
