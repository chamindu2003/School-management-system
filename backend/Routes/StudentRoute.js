const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const StudentControl = require("../Controllers/StudentController");

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Accept optional photo on create/update
router.post("/", upload.single('photo'), StudentControl.createStudent);
router.get("/", StudentControl.getAllStudents);
router.get("/by-user/:userId", StudentControl.getStudentByUserId);
router.get("/:id", StudentControl.getStudentById);
router.put("/:id", upload.single('photo'), StudentControl.updateStudent);
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