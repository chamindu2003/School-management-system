const Announcement = require('../Model/AnnouncementModel');

// Get announcements for teachers
exports.getTeacherAnnouncements = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { targetAudience: 'Teachers' },
        { targetAudience: 'All' }
      ]
    })
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('admin', 'name email');

    const total = await Announcement.countDocuments({
      isActive: true,
      $or: [
        { targetAudience: 'Teachers' },
        { targetAudience: 'All' }
      ]
    });

    res.status(200).json({ 
      announcements,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exam schedules
exports.getExamSchedules = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      announcementType: 'Exam Schedule',
      isActive: true,
      $or: [
        { targetAudience: 'Teachers' },
        { targetAudience: 'All' }
      ]
    })
    .sort({ publishDate: -1 })
    .populate('admin', 'name email');

    res.status(200).json({ announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get class-specific announcements
exports.getClassAnnouncements = async (req, res) => {
  try {
    const { className } = req.query;

    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { targetClass: className },
        { targetClass: { $exists: false } },
        { targetAudience: 'All' }
      ]
    })
    .sort({ publishDate: -1 })
    .populate('admin', 'name email');

    res.status(200).json({ announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findById(announcementId)
      .populate('admin', 'name email');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all announcements (Admin)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    const announcements = await Announcement.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('admin', 'name email');
    const total = await Announcement.countDocuments(query);
    res.status(200).json({
      announcements,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create announcement (Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      announcementType,
      targetClass,
      targetAudience = 'All',
      publishDate,
      attachments = []
    } = req.body;

    if (!title || !description || !announcementType) {
      return res.status(400).json({ message: 'title, description, and announcementType are required' });
    }

    const adminId = (req.user && req.user.id) || req.body.adminId;
    if (!adminId) {
      return res.status(401).json({ message: 'Admin identity required' });
    }

    const announcement = new Announcement({
      admin: adminId,
      title,
      description,
      announcementType,
      targetClass,
      targetAudience,
      publishDate: publishDate ? new Date(publishDate) : Date.now(),
      attachments,
      isActive: true
    });

    await announcement.save();
    const populated = await announcement.populate('admin', 'name email');
    res.status(201).json({ message: 'Announcement created', announcement: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update announcement (Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const update = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      update,
      { new: true }
    ).populate('admin', 'name email');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement updated', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete announcement (Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const deleted = await Announcement.findByIdAndDelete(announcementId);

    if (!deleted) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
