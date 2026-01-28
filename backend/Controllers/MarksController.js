const Marks = require('../Model/MarksModel');
const Student = require('../Model/StudentModel');
const Teacher = require('../Model/TeacherModel');

// Enter marks
exports.enterMarks = async (req, res) => {
  try {
    const { studentId, subject, examName, marksObtained, totalMarks, remarks } = req.body;
    const teacherId = req.user.id;

    console.log('enterMarks called', { teacherId, studentId, subject, examName, marksObtained });

    // Verify student exists and belongs to a class assigned to this teacher
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let teacher = await Teacher.findById(teacherId);
    // If teacher profile isn't present, skip class-assignment validation
    if (!teacher) {
      teacher = { classes: [] };
    }

    console.log('teacher classes for validation', teacher.classes);

    if (teacher.classes && teacher.classes.length > 0 && !teacher.classes.includes(student.class)) {
      return res.status(403).json({ message: 'You are not assigned to this student\'s class' });
    }

    // Check if marks already exist for this student, exam, and subject
    const existingMarks = await Marks.findOne({
      student: studentId,
      subject,
      examName,
      teacher: teacherId
    });

    if (existingMarks && existingMarks.publishedStatus) {
      return res.status(400).json({ message: 'Cannot modify published marks' });
    }

    if (existingMarks) {
      // Update existing marks
      existingMarks.marksObtained = marksObtained;
      existingMarks.totalMarks = totalMarks || 100;
      existingMarks.remarks = remarks;
      await existingMarks.save();
      return res.status(200).json({ 
        message: 'Marks updated successfully',
        marks: existingMarks 
      });
    }

    // Create new marks record
    const marks = new Marks({
      teacher: teacherId,
      student: studentId,
      subject,
      examName,
      marksObtained,
      totalMarks: totalMarks || 100,
      remarks
    });

    await marks.save();
    res.status(201).json({ 
      message: 'Marks entered successfully',
      marks 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enter bulk marks
exports.enterBulkMarks = async (req, res) => {
  try {
    const { marksRecords, subject, examName, totalMarks } = req.body;
    const teacherId = req.user.id;

    console.log('enterBulkMarks called', { teacherId, subject, examName, recordsCount: Array.isArray(marksRecords) ? marksRecords.length : 0 });
    const savedRecords = [];
    const skippedRecords = [];

    // Load teacher once; if missing, skip class validation (legacy users)
    const teacher = (await Teacher.findById(teacherId)) || { classes: [] };

    for (const record of marksRecords) {
      console.log('processing record', { studentId: record.studentId, marksObtained: record.marksObtained });
      const student = await Student.findById(record.studentId);
      if (!student) {
        skippedRecords.push({ studentId: record.studentId, reason: 'Student not found' });
        continue;
      }

      // Skip if teacher not assigned to this student's class
      if (teacher.classes && teacher.classes.length > 0 && !teacher.classes.includes(student.class)) {
        skippedRecords.push({ studentId: record.studentId, reason: 'Teacher not assigned to student class' });
        continue;
      }

      const existingMarks = await Marks.findOne({
        student: record.studentId,
        subject,
        examName,
        teacher: teacherId
      });

      if (existingMarks && existingMarks.publishedStatus) {
        skippedRecords.push({ studentId: record.studentId, reason: 'Published - cannot modify' });
        continue; // Skip published marks
      }

      if (existingMarks) {
        existingMarks.marksObtained = record.marksObtained;
        existingMarks.remarks = record.remarks;
        await existingMarks.save();
        savedRecords.push(existingMarks);
      } else {
        const marks = new Marks({
          teacher: teacherId,
          student: record.studentId,
          subject,
          examName,
          marksObtained: record.marksObtained,
          totalMarks: totalMarks || 100,
          remarks: record.remarks
        });
        await marks.save();
        savedRecords.push(marks);
      }
    }

    res.status(201).json({ 
      message: 'Bulk marks processed',
      records: savedRecords,
      skipped: skippedRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marks for a subject and exam
exports.getMarks = async (req, res) => {
  try {
    const { subject, examName } = req.query;
    const teacherId = req.user.id;

    const marks = await Marks.find({
      teacher: teacherId,
      subject,
      examName
    }).populate('student', 'name rollNumber email class');

    res.status(200).json({ marks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student marks
exports.getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.query;

    // Allow retrieving marks for a student (teacher filter removed)
    const marks = await Marks.find({ student: studentId }).sort({ examName: 1 }).populate('teacher', 'name');

    // Calculate performance summary
    const totalMarksData = marks.reduce((acc, mark) => {
      if (!acc[mark.subject]) {
        acc[mark.subject] = { exams: [], totalPercentage: 0, count: 0 };
      }
      acc[mark.subject].exams.push({
        examName: mark.examName,
        percentage: mark.percentage,
        grade: mark.grade,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks
      });
      acc[mark.subject].totalPercentage += (mark.percentage || 0);
      acc[mark.subject].count++;
      return acc;
    }, {});

    // Calculate average per subject
    const subjectPerformance = {};
    for (const subject in totalMarksData) {
      subjectPerformance[subject] = {
        averagePercentage: (totalMarksData[subject].totalPercentage / totalMarksData[subject].count).toFixed(2),
        exams: totalMarksData[subject].exams
      };
    }

    res.status(200).json({ 
      marks,
      performance: subjectPerformance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marks for the authenticated student
exports.getMyMarks = async (req, res) => {
  try {
    const studentId = req.user && req.user.id;
    if (!studentId) return res.status(401).json({ message: 'Authentication required' });

    const marks = await Marks.find({ student: studentId }).sort({ examName: 1 }).populate('teacher', 'name');

    const totalMarksData = marks.reduce((acc, mark) => {
      if (!acc[mark.subject]) {
        acc[mark.subject] = { exams: [], totalPercentage: 0, count: 0 };
      }
      acc[mark.subject].exams.push({
        examName: mark.examName,
        percentage: mark.percentage,
        grade: mark.grade,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks
      });
      acc[mark.subject].totalPercentage += (mark.percentage || 0);
      acc[mark.subject].count++;
      return acc;
    }, {});

    const subjectPerformance = {};
    for (const subject in totalMarksData) {
      subjectPerformance[subject] = {
        averagePercentage: (totalMarksData[subject].totalPercentage / totalMarksData[subject].count).toFixed(2),
        exams: totalMarksData[subject].exams
      };
    }

    res.status(200).json({ marks, performance: subjectPerformance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get class performance
exports.getClassPerformance = async (req, res) => {
  try {
    const { subject, examName } = req.query;
    const teacherId = req.user.id;

    const marks = await Marks.find({
      teacher: teacherId,
      subject,
      examName
    }).populate('student', 'name rollNumber class');

    // Calculate statistics
    const totalStudents = marks.length;
    const totalMarksSum = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const averageMarks = totalMarksSum / totalStudents;
    const highestMarks = Math.max(...marks.map(m => m.marksObtained));
    const lowestMarks = Math.min(...marks.map(m => m.marksObtained));
    const topPerformers = marks.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
    const weakStudents = marks.sort((a, b) => a.percentage - b.percentage).slice(0, 5);

    res.status(200).json({ 
      statistics: {
        totalStudents,
        averageMarks: averageMarks.toFixed(2),
        highestMarks,
        lowestMarks,
        topPerformers,
        weakStudents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update marks (before publishing)
exports.updateMarks = async (req, res) => {
  try {
    const { marksId } = req.params;
    const { marksObtained, remarks } = req.body;
    const teacherId = req.user.id;

    const marks = await Marks.findById(marksId);
    if (!marks) {
      return res.status(404).json({ message: 'Marks record not found' });
    }

    if (marks.publishedStatus) {
      return res.status(400).json({ message: 'Cannot modify published marks' });
    }

    if (marks.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Unauthorized to modify these marks' });
    }

    marks.marksObtained = marksObtained;
    marks.remarks = remarks;
    await marks.save();

    res.status(200).json({ 
      message: 'Marks updated successfully',
      marks 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publish marks
exports.publishMarks = async (req, res) => {
  try {
    const { marksIds } = req.body;
    const teacherId = req.user.id;

    const updated = await Marks.updateMany(
      { 
        _id: { $in: marksIds },
        teacher: teacherId,
        publishedStatus: false
      },
      { 
        publishedStatus: true,
        publishedDate: new Date()
      }
    );

    res.status(200).json({ 
      message: 'Marks published successfully',
      modifiedCount: updated.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
