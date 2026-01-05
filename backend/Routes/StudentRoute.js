const express = require("express");
const router = express.Router();
const StudentControl = require("../Controllers/StudentController");

router.post("/", StudentControl.createStudent);
router.get("/", StudentControl.getAllStudents);
router.get("/by-user/:userId", StudentControl.getStudentByUserId);
router.get("/:id", StudentControl.getStudentById);
router.put("/:id", StudentControl.updateStudent);
router.delete("/:id", StudentControl.deleteStudent);

// Student-facing data routes
router.get("/dashboard/info", StudentControl.getDashboard);
router.get("/dashboard/subjects", StudentControl.getSubjects);
router.get("/dashboard/timetable", StudentControl.getTimetable);
router.get("/dashboard/attendance", StudentControl.getAttendance);
router.get("/dashboard/exams", StudentControl.getExamResults);
router.get("/dashboard/announcements", StudentControl.getAnnouncements);
router.get("/dashboard/materials", StudentControl.getMaterials);

module.exports = router;