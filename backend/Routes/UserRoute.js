const express = require("express");
const router = express.Router();

const User = require("../Model/UserModel");
const UserControl = require("../Controllers/UserControl");
const multer = require('multer');
const path = require('path');

// Ensure uploads directory exists under backend/public/uploads
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Accept optional `photo` on signup
router.post("/", upload.single('photo'), UserControl.addUser);
router.post("/login", UserControl.loginUser);
router.get("/", UserControl.getAllUsers);
router.get("/:id", UserControl.getUserById);
router.put("/:id", upload.single('photo'), UserControl.updateUser);
router.delete("/:id", UserControl.deleteUser);

module.exports = router;
