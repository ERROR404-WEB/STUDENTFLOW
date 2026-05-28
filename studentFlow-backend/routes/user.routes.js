const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Admin creates users manually 
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can create users" });
    }

    const { name, email, password, role } = req.body;

    const allowedRoles = [
      "COUNSELLOR",
      "QA_OFFICER",
      "ADMISSION_OFFICER",
      "VISA_OFFICER",
      "ENROLMENT_OFFICER"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid internal role" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;