const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  materialType: {
    type: String,
    enum: ['Note', 'Assignment', 'Resource', 'Video', 'Other'],
    required: true
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  videoUrl: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

StudyMaterialSchema.index({ teacher: 1, class: 1, subject: 1 });
StudyMaterialSchema.index({ class: 1 });

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
