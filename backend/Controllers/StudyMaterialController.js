const StudyMaterial = require('../Model/StudyMaterialModel');
const path = require('path');
const fs = require('fs').promises;

// Upload study material
exports.uploadStudyMaterial = async (req, res) => {
  try {
    const { title, description, subject, class: className, materialType } = req.body;
    const teacherId = req.user.id;
    
    // Support two modes: file upload (PDF/etc.) or video link (materialType === 'Video')
    const file = req.file;
    const videoUrl = req.body.videoUrl;

    if (materialType === 'Video') {
      if (!videoUrl) return res.status(400).json({ message: 'videoUrl is required for Video material' });
      const material = new StudyMaterial({
        teacher: teacherId,
        title,
        description,
        subject,
        class: className,
        materialType,
        videoUrl
      });
      await material.save();
      return res.status(201).json({ message: 'Video material saved', material });
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const material = new StudyMaterial({
      teacher: teacherId,
      title,
      description,
      subject,
      class: className,
      materialType,
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.originalname
    });

    await material.save();
    res.status(201).json({ 
      message: 'Study material uploaded successfully',
      material 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get study materials for a class
exports.getClassMaterials = async (req, res) => {
  try {
    const { class: className } = req.query;
    const teacherId = req.user.id;

    const materials = await StudyMaterial.find({
      teacher: teacherId,
      class: className
    }).sort({ uploadDate: -1 });

    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all study materials by teacher
exports.getTeacherMaterials = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const materials = await StudyMaterial.find({
      teacher: teacherId
    }).sort({ uploadDate: -1 });

    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public for authenticated users: Get study materials for a class (all teachers)
exports.getMaterialsForClassPublic = async (req, res) => {
  try {
    const { class: className } = req.query;

    const materials = await StudyMaterial.find({
      class: className
    }).sort({ uploadDate: -1 });

    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get study materials by subject
exports.getSubjectMaterials = async (req, res) => {
  try {
    const { subject, class: className } = req.query;
    const teacherId = req.user.id;

    const materials = await StudyMaterial.find({
      teacher: teacherId,
      subject,
      class: className
    }).sort({ uploadDate: -1 });

    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete study material
exports.deleteStudyMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user.id;

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Unauthorized to delete this material' });
    }

    // Delete file from server
    try {
      const filePath = path.join(__dirname, '../public', material.fileUrl);
      await fs.unlink(filePath);
    } catch (err) {
      console.log('File deletion error:', err);
    }

    await StudyMaterial.findByIdAndDelete(materialId);
    res.status(200).json({ message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update study material info
exports.updateStudyMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, description } = req.body;
    const teacherId = req.user.id;

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Unauthorized to update this material' });
    }

    material.title = title || material.title;
    material.description = description || material.description;
    await material.save();

    res.status(200).json({ 
      message: 'Study material updated successfully',
      material 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
