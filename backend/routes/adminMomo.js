const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

/**
 * POST /api/admin/momo/confirm
 * Body: { transactionId }
 */
router.post("/confirm", adminAuth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID required" });
    }

    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (tx.status === "completed") {
      return res.status(400).json({ message: "Transaction already completed" });
    }

    const user = await User.findById(tx.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ CREDIT WALLET
    user.walletBalance += tx.amount;
    await user.save();

    // ✅ UPDATE TRANSACTION
    tx.status = "completed";
    await tx.save();

    res.json({
      message: "MTN MoMo deposit confirmed and wallet credited",
      walletBalance: user.walletBalance
    });

  } catch (err) {
    console.error("Admin MoMo confirm error:", err);
    res.status(500).json({ message: "Confirmation failed" });
  }
});

module.exports = router;
