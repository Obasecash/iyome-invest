const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { signAccess } = require("../utils/jwt");
const Wallet = require("../models/Wallet");

/*
==============================
REGISTER
==============================
*/
exports.register = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      walletBalance: 0,
      role: "user",
      isActive: true // VERY IMPORTANT
    });

    // Referral system
    if (referralCode) {
      const refUser = await User.findById(referralCode);
      if (refUser) {
        newUser.referredBy = refUser._id;
      }
    }

    await newUser.save();


    // 🔥 CREATE WALLET AUTOMATICALLY
await Wallet.create({
  user: newUser._id,
  balance: 0
});


    res.status(201).json({
      success: true,
      message: "Registration successful"
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/*
==============================
LOGIN
==============================
*/
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if suspended
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account suspended" });
    }

    // Create token
    const { signAccess } = require("../utils/jwt");

const token = signAccess({ id: user._id });


    res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
