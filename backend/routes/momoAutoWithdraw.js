const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendMomo } = require("../services/momoAutoWithdraw");

router.post("/auto", auth, async (req, res) => {
  try {
    const { amount, phone } = req.body;

    if (!amount || !phone) {
      return res.json({ message: "Invalid request" });
    }

    const user = await User.findById(req.user.id);

    if (user.walletBalance < amount) {
      return res.json({ message: "Insufficient balance" });
    }

    const reference = uuidv4();

    // Deduct wallet
    user.walletBalance -= amount;
    await user.save();

    // Save transaction
    await Transaction.create({
      user: user._id,
      type: "withdraw",
      method: "momo",
      amount,
      phone,
      reference,
      status: "processing"
    });

    // Send MTN MoMo automatically
    await sendMomo({ amount, phone, reference });

    // Mark completed
    await Transaction.updateOne(
      { reference },
      { status: "completed" }
    );

    res.json({ message: "Withdrawal sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Auto withdrawal failed" });
  }
});

module.exports = router;
