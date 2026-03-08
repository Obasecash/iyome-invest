const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount, phone } = req.body;

    if (!amount || !phone) {
      return res.status(400).json({ message: "Amount and phone required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tx = await Transaction.create({
      user: user._id,
      type: "deposit",
      method: "orange",
      amount,
      phone,
      status: "processing"
    });

    user.walletBalance += Number(amount);
    await user.save();

    tx.status = "completed";
    await tx.save();

    res.json({ message: "Orange Money deposit successful" });
  } catch (err) {
    res.status(500).json({ message: "Orange deposit failed" });
  }
});

module.exports = router;
