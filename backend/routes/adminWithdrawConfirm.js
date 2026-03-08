const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

router.post("/confirm", adminAuth, async (req, res) => {
  const { transactionId } = req.body;

  const tx = await Transaction.findById(transactionId);
  if (!tx || tx.status !== "pending") {
    return res.json({ message: "Invalid transaction" });
  }

  const user = await User.findById(tx.user);

  if (user.walletBalance < tx.amount) {
    return res.json({ message: "User balance insufficient" });
  }

  user.walletBalance -= tx.amount;
  tx.status = "completed";

  await user.save();
  await tx.save();

  res.json({ message: "Withdrawal approved & wallet debited" });
});

module.exports = router;
