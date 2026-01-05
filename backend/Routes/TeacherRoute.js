const express = require('express');
const router = express.Router();
const {
  getAllTeachers,
  getTeacherById,
  getTeacherByEmail,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../Controllers/TeacherController');

router.get('/', getAllTeachers);
router.get('/by-email', getTeacherByEmail);
router.get('/:id', getTeacherById);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
