const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendDisbursement } = require("../services/mtnDisburseService");
const { v4: uuidv4 } = require("uuid");

router.post("/auto", auth, async (req, res) => {
  try {
    const { amount, phone } = req.body;

    if (!amount || !phone) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const reference = uuidv4();

    const tx = await Transaction.create({
      user: user._id,
      type: "withdraw",
      method: "momo",
      phone,
      amount,
      reference,
      status: "processing",
    });

    const success = await sendDisbursement({
      amount,
      phone,
      reference,
    });

    if (success) {
      user.walletBalance -= amount;
      await user.save();

      tx.status = "completed";
      await tx.save();

      return res.json({ message: "Withdrawal successful" });
    }

    tx.status = "failed";
    await tx.save();

    res.status(500).json({ message: "Withdrawal failed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
