const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

router.post("/deposit", auth, async (req, res) => {
  const { amount } = req.body;

  const tx = await Transaction.create({
    user: req.user.id,
    type: "deposit",
    amount,
    status: "pending"
  });

  res.json({ message: "Deposit submitted", tx });
});

module.exports = router;
