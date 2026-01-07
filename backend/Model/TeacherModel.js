const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subject: { type: String, default: 'Not Assigned' },
  // group assignment for the teacher (which student group they lead/are responsible for)
  group: { type: String, enum: ['සීල', 'සමාධි', 'ප්‍රඥා', 'Unassigned'], default: 'Unassigned' },
  photo: { type: String },
  classes: { type: [String], default: [] },
  phone: { type: String },
  address: { type: String },
  joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
