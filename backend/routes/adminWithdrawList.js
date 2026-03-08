const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const adminAuth = require("../middleware/adminAuth");

router.get("/pending", adminAuth, async (req, res) => {
  const withdrawals = await Transaction.find({
    type: "withdraw",
    method: "momo",
    status: "pending"
  }).populate("user", "email");

  res.json(withdrawals);
});

router.post("/confirm", adminAuth, async (req, res) => {
  const { transactionId } = req.body;

  const tx = await Transaction.findById(transactionId);
  if (!tx) return res.status(404).json({ message: "Not found" });

  tx.status = "completed";
  await tx.save();

  res.json({ message: "Withdrawal confirmed" });
});

module.exports = router;
