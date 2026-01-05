const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subject: { type: String, default: 'Not Assigned' },
  classes: { type: [String], default: [] },
  phone: { type: String },
  address: { type: String },
  joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
