const ClassModel = require('../Model/ClassModel');
const Teacher = require('../Model/TeacherModel');
const Student = require('../Model/StudentModel');

exports.getAllClasses = async (_req, res) => {
  try {
    const classes = await ClassModel.find();
    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id)
      .populate('students', 'name email rollNumber')
      .populate('teacher', 'name email subject');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ cls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { name, section, subjects } = req.body;
    const cls = new ClassModel({ name, section, subjects: Array.isArray(subjects) ? subjects : [] });
    await cls.save();
    res.status(201).json({ cls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const update = req.body;
    if (update.subjects && !Array.isArray(update.subjects)) {
      update.subjects = [];
    }
    const cls = await ClassModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ cls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await ClassModel.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign teacher to a class with a subject
exports.assignTeacher = async (req, res) => {
  try {
    const { className, teacherId, subject } = req.body;
    if (!className || !teacherId || !subject) {
      return res.status(400).json({ message: 'className, teacherId and subject are required' });
    }

    // Ensure class exists
    const cls = await ClassModel.findOne({ name: className });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // Update teacher's subject and classes array
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    teacher.subject = subject;
    const classes = new Set([...(teacher.classes || []), className]);
    teacher.classes = Array.from(classes);
    await teacher.save();

    // Ensure subject is present in class subjects list
    const classSubjects = new Set([...(cls.subjects || []), subject]);
    cls.subjects = Array.from(classSubjects);
    await cls.save();

    res.status(200).json({ message: 'Teacher assigned', teacher, cls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign student to a class
exports.assignStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    
    if (!classId || !studentId) {
      return res.status(400).json({ message: 'classId and studentId are required' });
    }

    // Validate class exists
    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if student is already in the class
    if (cls.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already assigned to this class' });
    }

    // Add student to class
    cls.students.push(studentId);
    await cls.save();

    // Update student's class field
    student.class = cls.name;
    await student.save();

    res.status(200).json({ message: 'Student assigned to class', cls, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove student from a class
exports.removeStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    
    if (!classId || !studentId) {
      return res.status(400).json({ message: 'classId and studentId are required' });
    }

    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // Remove student from class
    cls.students = cls.students.filter(id => id.toString() !== studentId);
    await cls.save();

    res.status(200).json({ message: 'Student removed from class', cls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
