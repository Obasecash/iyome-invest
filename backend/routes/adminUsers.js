const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");

// GET ALL USERS
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
