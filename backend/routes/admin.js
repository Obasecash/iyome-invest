const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// 🔹 Get all pending deposits
router.get("/pendeing-deposits", adminAuth, async (req, res) => {
  try {
     const deposits = await Transaction.find({ status: "pending" })
  .populate("user", "name email")
  .sort({ createdAt: -1 });

  
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Confirm deposit
router.post("/confirm-deposit/:id", adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction Not found" });

    if (tx.status === "completed") {
      return res.status(400).json({ message: "Already confirmed" });
    }

    tx.status = "completed";
    await tx.save();

    const user = await User.findById(tx.user);
    user.walletBalance += tx.amount;
    await user.save();

    res.json({ message: "Deposit confirmed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
