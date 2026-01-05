const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middleware/authMiddleware');
const {
  enterMarks,
  enterBulkMarks,
  getMarks,
  getStudentMarks,
  getClassPerformance,
  updateMarks,
  publishMarks
} = require('../Controllers/MarksController');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Enter marks
router.post('/enter', enterMarks);

// Enter bulk marks
router.post('/enter-bulk', enterBulkMarks);

// Get marks for a subject and exam
router.get('/exam', getMarks);

// Get student marks
router.get('/student', getStudentMarks);

// Get class performance
router.get('/performance', getClassPerformance);

// Update marks
router.put('/:marksId', updateMarks);

// Publish marks
router.post('/publish', publishMarks);

module.exports = router;
