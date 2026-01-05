const express = require('express');
const router = express.Router();
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignTeacher,
  assignStudent,
  removeStudent
} = require('../Controllers/ClassController');

router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.post('/assign-teacher', assignTeacher);
router.post('/assign-student', assignStudent);
router.post('/remove-student', removeStudent);

module.exports = router;
