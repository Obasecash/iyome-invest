const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendOrangeMoney } = require("../services/orangeMoneyService");

/**
 * AUTO ORANGE MONEY WITHDRAW
 */
router.post("/auto", auth, async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { amount, phone } = req.body;

    if (!amount || amount <= 0 || !phone) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (amount > 100000) {
      throw new Error("Maximum withdrawal is 100,000 XAF");
    }

    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new Error("User not found");

    if (user.walletBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const reference = uuidv4();

    // 1️⃣ HOLD FUNDS
    user.walletBalance -= amount;
    await user.save();

    // 2️⃣ CREATE TRANSACTION
    const tx = await Transaction.create([{
      user: user._id,
      type: "withdraw",
      method: "orange",
      amount,
      phone,
      reference,
      status: "processing"
    }], { session });

    // 3️⃣ SEND ORANGE MONEY
    await sendOrangeMoney({ amount, phone, reference });

    // 4️⃣ SUCCESS
    tx[0].status = "completed";
    await tx[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Orange Money withdrawal successful",
      reference
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("ORANGE WITHDRAW ERROR:", err.message);

    // REFUND USER
    if (req.user?.id && req.body?.amount) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { walletBalance: req.body.amount }
      });
    }

    res.status(500).json({
      message: err.message || "Withdrawal failed"
    });
  }
});

module.exports = router;
