const express = require("express");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    const transactions = await Transaction
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        name: req.user.name,
        email: req.user.email
      },
      walletBalance: wallet ? wallet.balance : 0,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
});

module.exports = router;
