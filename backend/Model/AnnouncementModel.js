const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  announcementType: {
    type: String,
    enum: ['General', 'Exam Schedule', 'Class Notice', 'Holiday', 'Important'],
    required: true
  },
  targetClass: {
    type: String
  },
  targetAudience: {
    type: String,
    enum: ['Teachers', 'Students', 'Parents', 'All'],
    default: 'All'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

AnnouncementSchema.index({ publishDate: -1 });
AnnouncementSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
