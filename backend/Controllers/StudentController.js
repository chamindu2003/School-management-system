const Student = require('../Model/StudentModel');
const User = require('../Model/UserModel');

exports.getAllStudents = async (req, res) => {
    try{
    // If an email query param is provided, return the matching student
    if (req.query.email) {
      const student = await Student.findOne({ email: req.query.email });
      return res.status(200).json({ student });
    }

    // If a class query param is provided, return students of that class
    if (req.query.class) {
      const className = req.query.class;
      const studentsByClass = await Student.find({ class: className });
      return res.status(200).json({ students: studentsByClass });
    }

    const students = await Student.find();
    res.status(200).json({ students });

    }catch(err){
        res.status(500).json({message: err.message});
    }
};

exports.getStudentById = async (req, res) => {
    try{
        const student = await Student.findById(req.params.id).populate('userId', 'name email role');
        if (!student) return res.status(404).json({message:'student not found'});
        res.status(200).json({ student });
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getStudentByUserId = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.params.userId }).populate('userId', 'name email role');
        if (!student) return res.status(404).json({ message: 'Student profile not found for this user' });
        res.status(200).json({ student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createStudent = async (req, res) => {
  const { userId, name, email, rollNumber, class: studentClass, phone, dateOfBirth, address } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    // Validate user exists and has student role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'student') {
      return res.status(400).json({ message: 'User must have student role' });
    }

    // Check if student profile already exists for this user
    const existingStudent = await Student.findOne({ userId });
    if (existingStudent) {
      return res.status(409).json({ message: 'Student profile already exists for this user' });
    }

    // Check for duplicate roll number
    const duplicateRoll = await Student.findOne({ rollNumber });
    if (duplicateRoll) {
      return res.status(409).json({ message: 'Roll number already exists' });
    }

    const student = new Student({ userId, name, email, rollNumber, class: studentClass, phone, dateOfBirth, address });
    await student.save();
    res.status(201).json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----- Student-facing data endpoints (demo/static) -----
exports.getDashboard = async (req, res) => {
  const { email } = req.query;
  try {
    const student = email ? await Student.findOne({ email }) : null;
    res.status(200).json({
      name: student?.name || 'Student',
      class: student?.class || '10-A',
      rollNumber: student?.rollNumber || 'RN-001',
      summary: {
        attendancePercent: 92,
        subjectsCount: 6,
        upcomingExams: [{ subject: 'Math', date: '2026-01-10' }]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubjects = async (_req, res) => {
  res.status(200).json({
    subjects: [
      { name: 'Mathematics', teacher: 'Mr. Kumar' },
      { name: 'Science', teacher: 'Ms. Rao' },
      { name: 'English', teacher: 'Mrs. Sharma' },
      { name: 'Social Studies', teacher: 'Mr. Das' },
      { name: 'Computer', teacher: 'Ms. Verma' }
    ]
  });
};

exports.getTimetable = async (_req, res) => {
  res.status(200).json({
    week: {
      Monday: ['Math', 'Science', 'English'],
      Tuesday: ['Social', 'Computer', 'Math'],
      Wednesday: ['Science', 'English', 'Computer'],
      Thursday: ['Math', 'Social', 'Science'],
      Friday: ['English', 'Computer', 'Math']
    }
  });
};

exports.getAttendance = async (_req, res) => {
  res.status(200).json({
    today: 'Present',
    monthlyPercent: 92,
    history: [
      { date: '2025-12-18', status: 'Present' },
      { date: '2025-12-17', status: 'Absent' },
      { date: '2025-12-16', status: 'Present' }
    ]
  });
};

exports.getExamResults = async (_req, res) => {
  res.status(200).json({
    results: [
      { subject: 'Math', marks: 88, grade: 'A' },
      { subject: 'Science', marks: 76, grade: 'B+' },
      { subject: 'English', marks: 81, grade: 'A-' }
    ],
    total: 245,
    averagePercent: 81.6
  });
};

exports.getAnnouncements = async (_req, res) => {
  res.status(200).json({
    announcements: [
      { title: 'Annual Day', message: 'Annual Day on Jan 20', date: '2026-01-05' },
      { title: 'Holiday', message: 'School closed on Dec 25', date: '2025-12-25' }
    ]
  });
};

exports.getMaterials = async (_req, res) => {
  res.status(200).json({
    materials: [
      { title: 'Math Algebra Notes', type: 'PDF', url: '/files/math-algebra.pdf' },
      { title: 'Science Lab Manual', type: 'PDF', url: '/files/science-lab.pdf' }
    ]
  });
};
