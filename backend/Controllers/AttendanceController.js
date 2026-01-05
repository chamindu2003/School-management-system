const Attendance = require('../Model/AttendanceModel');
const Student = require('../Model/StudentModel');
const Teacher = require('../Model/TeacherModel');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, class: className, date, status, remarks } = req.body;
    const teacherId = req.user.id; // Assuming authentication middleware sets user

    // Check if attendance already exists for the day
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      class: className,
      date: new Date(date).setHours(0, 0, 0, 0)
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.remarks = remarks;
      existingAttendance.lastUpdatedBy = teacherId;
      await existingAttendance.save();
      return res.status(200).json({ 
        message: 'Attendance updated successfully',
        attendance: existingAttendance 
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      teacher: teacherId,
      student: studentId,
      class: className,
      date: new Date(date),
      status,
      remarks,
      createdBy: teacherId
    });

    await attendance.save();
    res.status(201).json({ 
      message: 'Attendance marked successfully',
      attendance 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark bulk attendance
exports.markBulkAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body; // Array of { studentId, status, remarks }
    const { class: className, date } = req.body;
    const teacherId = req.user.id;

    const savedRecords = [];

    for (const record of attendanceRecords) {
      const existingAttendance = await Attendance.findOne({
        student: record.studentId,
        class: className,
        date: new Date(date).setHours(0, 0, 0, 0)
      });

      if (existingAttendance) {
        existingAttendance.status = record.status;
        existingAttendance.remarks = record.remarks;
        existingAttendance.lastUpdatedBy = teacherId;
        await existingAttendance.save();
        savedRecords.push(existingAttendance);
      } else {
        const attendance = new Attendance({
          teacher: teacherId,
          student: record.studentId,
          class: className,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks,
          createdBy: teacherId
        });
        await attendance.save();
        savedRecords.push(attendance);
      }
    }

    res.status(201).json({ 
      message: 'Bulk attendance marked successfully',
      records: savedRecords 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance for a class on a specific date
exports.getClassAttendance = async (req, res) => {
  try {
    const { class: className, date } = req.query;
    const teacherId = req.user.id;

    const attendance = await Attendance.find({
      teacher: teacherId,
      class: className,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999)
      }
    }).populate('student', 'name rollNumber email');

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student attendance history
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId, class: className } = req.query;

    // Allow students or teachers to fetch attendance for a student
    const query = { student: studentId };
    if (className) query.class = className;

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Calculate attendance percentage
    const total = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = total > 0 ? ((presentDays / total) * 100).toFixed(2) : 0;

    res.status(200).json({ 
      attendance,
      summary: {
        totalDays: total,
        presentDays,
        absentDays: attendance.filter(a => a.status === 'Absent').length,
        lateDays: attendance.filter(a => a.status === 'Late').length,
        leaveDays: attendance.filter(a => a.status === 'Leave').length,
        attendancePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance report for a class
exports.getAttendanceReport = async (req, res) => {
  try {
    const { class: className, startDate, endDate } = req.query;
    const teacherId = req.user.id;

    const attendance = await Attendance.find({
      teacher: teacherId,
      class: className,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('student', 'name rollNumber');

    // Group by student
    const studentReport = {};
    attendance.forEach(record => {
      if (!studentReport[record.student._id]) {
        studentReport[record.student._id] = {
          studentId: record.student._id,
          studentName: record.student.name,
          rollNumber: record.student.rollNumber,
          totalDays: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0
        };
      }
      studentReport[record.student._id].totalDays++;
      studentReport[record.student._id][record.status.toLowerCase()]++;
    });

    res.status(200).json({ 
      report: Object.values(studentReport)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit attendance (same day or within allowed time)
exports.editAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;
    const teacherId = req.user.id;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if teacher is the one who created it
    if (attendance.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Unauthorized to edit this record' });
    }

    // Check if it's same day or within 24 hours (can be modified)
    const attendanceDate = new Date(attendance.date);
    const today = new Date();
    const dayDiff = Math.floor((today - attendanceDate) / (1000 * 60 * 60 * 24));

    if (dayDiff > 1) {
      return res.status(400).json({ message: 'Cannot edit attendance after 24 hours' });
    }

    attendance.status = status;
    attendance.remarks = remarks;
    attendance.lastUpdatedBy = teacherId;
    await attendance.save();

    res.status(200).json({ 
      message: 'Attendance updated successfully',
      attendance 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
