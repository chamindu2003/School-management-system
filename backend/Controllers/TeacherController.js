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
  const { name, email, subject, classes, phone, address, joiningDate, group } = req.body;
  const file = req.file;
  try {
    // Allow creating a teacher record even if subject/classes are not yet assigned
    const parsedClasses = Array.isArray(classes) ? classes : (typeof classes === 'string' ? classes.split(',').map(c => c.trim()).filter(Boolean) : []);
    const teacherData = {
      name,
      email,
      subject: subject || undefined,
      group: group || 'Unassigned',
      classes: parsedClasses,
      phone,
      address,
      joiningDate
    };
    if (file) {
      teacherData.photo = `/uploads/${file.filename}`;
    }
    const teacher = new Teacher(teacherData);
    await teacher.save();
    res.status(201).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    // If multipart/form-data contained a file, multer placed it on req.file
    if (req.file) {
      req.body.photo = `/uploads/${req.file.filename}`;
    }
    if (req.body.classes && typeof req.body.classes === 'string') {
      req.body.classes = req.body.classes.split(',').map(c => c.trim()).filter(Boolean);
    }
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
