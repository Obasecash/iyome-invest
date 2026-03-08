const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const orange = require("../services/orangeCollectionService");

router.post("/auto", auth, async (req, res) => {
  try {
    const { amount, phone } = req.body;

    const reference = uuidv4();

    await Transaction.create({
      user: req.user.id,
      type: "deposit",
      method: "orange",
      amount,
      phone,
      reference,
      status: "pending"
    });

    await orange.requestOrangePay({ amount, phone, reference });

    res.json({
      message: "Orange Money prompt sent",
      reference
    });
  } catch (err) {
    res.status(500).json({ message: "Orange deposit failed" });
  }
});

router.get("/confirm/:reference", auth, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ reference });
    if (!tx) return res.status(404).json({ message: "Not found" });

    const status = await orange.checkOrangeStatus(reference);

    if (status.status !== "SUCCESS") {
      return res.json({ status: status.status });
    }

    const user = await User.findById(tx.user);
    user.walletBalance += tx.amount;
    tx.status = "completed";

    await user.save();
    await tx.save();

    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ message: "Confirm failed" });
  }
});

module.exports = router;
