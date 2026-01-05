const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middleware/authMiddleware');
const { createSchedule, getClassSchedule, deleteSchedule } = require('../Controllers/ScheduleController');

router.use(authenticateToken);

// Create schedule (teacher/admin)
router.post('/', createSchedule);

// Get schedule for class (query: className, date)
router.get('/class', getClassSchedule);

// Delete schedule
router.delete('/:id', deleteSchedule);

module.exports = router;
