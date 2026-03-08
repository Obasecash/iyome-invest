const express = require("express");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendMoney } = require("../services/mtnDisbursement");

const router = express.Router();

router.post("/auto", auth, async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (user.walletBalance < amount) {
      return res.json({ message: "Insufficient balance" });
    }

    const reference = uuidv4();

    // deduct first (safe)
    user.walletBalance -= Number(amount);
    await user.save();

    await Transaction.create({
      user: user._id,
      type: "withdraw",
      method: "momo",
      amount,
      phone,
      reference,
      status: "processing"
    });

    await sendMoney({ referenceId: reference, amount, phone });

    res.json({ message: "Withdrawal sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
});

module.exports = router;
