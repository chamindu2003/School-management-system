const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  room: { type: String },
  timeFrom: { type: String, required: true },
  timeTo: { type: String, required: true },
  // Either a specific date OR a dayOfWeek (0=Sunday .. 6=Saturday)
  date: { type: Date },
  dayOfWeek: { type: Number, min: 0, max: 6 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
