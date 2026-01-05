const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middleware/authMiddleware');
const {
  markAttendance,
  markBulkAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceReport,
  editAttendance
} = require('../Controllers/AttendanceController');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Mark attendance
router.post('/mark', markAttendance);

// Mark bulk attendance
router.post('/mark-bulk', markBulkAttendance);

// Get class attendance for a date
router.get('/class', getClassAttendance);

// Get student attendance history
router.get('/student', getStudentAttendance);

// Get attendance report
router.get('/report', getAttendanceReport);

// Edit attendance
router.put('/:attendanceId', editAttendance);

module.exports = router;
