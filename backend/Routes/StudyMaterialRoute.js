const express = require('express');
const router = express.Router();
const authenticateToken = require('../Middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const {
  uploadStudyMaterial,
  getClassMaterials,
  getTeacherMaterials,
  getSubjectMaterials,
  getMaterialsForClassPublic,
  deleteStudyMaterial,
  updateStudyMaterial
} = require('../Controllers/StudyMaterialController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Apply auth middleware to all routes
router.use(authenticateToken);

// Upload study material
router.post('/upload', upload.single('file'), uploadStudyMaterial);

// Get class materials
router.get('/class', getClassMaterials);

// Get materials for a class (students view)
router.get('/for-class', getMaterialsForClassPublic);

// Get all teacher materials
router.get('/', getTeacherMaterials);

// Get subject materials
router.get('/subject', getSubjectMaterials);

// Delete material
router.delete('/:materialId', deleteStudyMaterial);

// Update material info
router.put('/:materialId', updateStudyMaterial);

module.exports = router;
