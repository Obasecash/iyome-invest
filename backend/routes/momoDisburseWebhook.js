const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const User = require("../models/User");

router.post("/momo-disburse", async (req, res) => {
  const { externalId, status } = req.body;

  const tx = await Transaction.findOne({ reference: externalId });
  if (!tx) return res.sendStatus(404);

  if (status === "FAILED") {
    // refund user
    const user = await User.findById(tx.user);
    user.walletBalance += tx.amount;
    await user.save();

    tx.status = "failed";
    await tx.save();
  }

  if (status === "SUCCESSFUL") {
    tx.status = "completed";
    await tx.save();
  }

  res.sendStatus(200);
});

module.exports = router;
