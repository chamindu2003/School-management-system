const Teacher = require('../Model/TeacherModel');

exports.getAllTeachers = async (_req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({ teachers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher by email (used after login to hydrate teacher profile)
exports.getTeacherByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  const { name, email, subject, classes, phone, address, joiningDate } = req.body;
  try {
    // Allow creating a teacher record even if subject/classes are not yet assigned
    const teacher = new Teacher({
      name,
      email,
      subject: subject || undefined,
      classes: Array.isArray(classes) ? classes : [],
      phone,
      address,
      joiningDate
    });
    await teacher.save();
    res.status(201).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
