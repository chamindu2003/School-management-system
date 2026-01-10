const express = require('express');
const router = express.Router();
const ContactController = require('../Controllers/ContactController');

router.post('/', ContactController.createMessage);

// Admin endpoints
router.get('/unread-count', ContactController.getUnreadCount);
router.get('/', ContactController.listMessages);
router.put('/:id/read', ContactController.markRead);

module.exports = router;
