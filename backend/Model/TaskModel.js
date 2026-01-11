const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedGroups: [{ type: String, enum: ['සීල','සමාධි','ප්‍රඥා'] }],
  // marksByGroup stores a numeric mark per group
  marksByGroup: [{ group: { type: String, enum: ['සීල','සමාධි','ප්‍රඥා'] }, marks: { type: Number, default: null } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
