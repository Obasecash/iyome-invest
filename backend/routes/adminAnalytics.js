const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Payment = require("../models/Payment");
const Investment = require("../models/Investment");

const router = express.Router();

router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [
      users,
      wallets,
      payments,
      investments,
      pendingMoMo,
    ] = await Promise.all([
      User.countDocuments(),
      Wallet.find(),
      Payment.find({ status: "paid" }),
      Investment.find(),
      Payment.countDocuments({ method: "momo", status: "pending" }),
    ]);

    const totalWalletBalance = wallets.reduce(
      (sum, w) => sum + w.balance,
      0
    );

    const totalDeposits = payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const totalInvested = investments.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    res.json({
      users,
      totalWalletBalance,
      totalDeposits,
      totalInvested,
      pendingMoMo,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

module.exports = router;
