const express = require("express");
const router = express.Router();

const User = require("../Model/UserModel");
const UserControl = require("../Controllers/UserControl");

router.post("/", UserControl.addUser);
router.post("/login", UserControl.loginUser);
router.get("/", UserControl.getAllUsers);
router.get("/:id", UserControl.getUserById);
router.put("/:id", UserControl.updateUser);
router.delete("/:id", UserControl.deleteUser);

module.exports = router;
