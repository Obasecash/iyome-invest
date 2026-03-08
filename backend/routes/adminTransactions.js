const express = require("express");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  const tx = await Transaction.find().populate("user", "email");
  res.json(tx);
});

router.put("/:id/approve", adminAuth, async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx || tx.status === "completed") return res.json({ message: "Invalid" });

  const wallet = await Wallet.findOne({ user: tx.user });

  if (tx.type === "deposit") {
    wallet.balance += tx.amount;
  } else {
    wallet.balance -= tx.amount;
  }

  tx.status = "completed";
  await wallet.save();
  await tx.save();

  res.json({ message: "Transaction approved" });
});

module.exports = router;
