const express = require('express');
const router = express.Router();
const {
  getTeacherAnnouncements,
  getExamSchedules,
  getClassAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements
} = require('../Controllers/AnnouncementController');

// Get announcements for teacher
router.get('/', getTeacherAnnouncements);

// Admin: get all announcements
router.get('/all', getAllAnnouncements);

// Get exam schedules
router.get('/exam-schedules', getExamSchedules);

// Get class announcements
router.get('/class', getClassAnnouncements);

// Get announcement by ID
router.get('/:announcementId', getAnnouncementById);

// Admin: create announcement
router.post('/', createAnnouncement);

// Admin: update announcement
router.put('/:announcementId', updateAnnouncement);

// Admin: delete announcement
router.delete('/:announcementId', deleteAnnouncement);

module.exports = router;
