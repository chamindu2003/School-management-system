const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateMarks, updateTask, deleteTask } = require('../Controllers/TaskController');
const authenticateToken = require('../Middleware/authMiddleware');

// public list
router.get('/', getTasks);

// require auth for creating/updating
router.post('/', authenticateToken, createTask);
router.put('/:taskId/marks', authenticateToken, updateMarks);
router.put('/:taskId', authenticateToken, updateTask);
router.delete('/:taskId', authenticateToken, deleteTask);

module.exports = router;
