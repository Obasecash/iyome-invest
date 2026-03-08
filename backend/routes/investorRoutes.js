const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Investment = require("../models/Investment");
const Withdraw = require("../models/Withdraw");

const { getInvestorProfile } = require("../controllers/walletController");


// PROFILE
router.get("/me", auth, getInvestorProfile);


// INVESTMENTS
router.get("/investments", auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// WITHDRAWALS
router.get("/withdrawals", auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
