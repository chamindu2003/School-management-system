const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
  getAllTeachers,
  getTeacherById,
  getTeacherByEmail,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../Controllers/TeacherController');

// setup uploads directory (same location as users uploads)
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', getAllTeachers);
router.get('/by-email', getTeacherByEmail);
router.get('/:id', getTeacherById);
// Accept optional 'photo' file for create/update
router.post('/', upload.single('photo'), createTeacher);
router.put('/:id', upload.single('photo'), updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
