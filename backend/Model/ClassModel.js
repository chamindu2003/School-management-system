const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  section: { type: String },
  subjects: { type: [String], default: [] },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
