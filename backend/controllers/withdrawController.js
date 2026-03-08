const Withdraw = require("../models/Withdraw");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const config = require("../config/withdrawConfig");
const { notifyEmail } = require("../services/notify");

exports.createWithdraw = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method, account } = req.body;

    const amt = Number(amount || 0);
    if (amt < config.MIN_WITHDRAW) {
      return res.status(400).json({ message: `Minimum withdraw is ${config.MIN_WITHDRAW}` });
    }

    const fee = (amt * config.WITHDRAW_FEE_PERCENT) / 100;
    const total = amt + fee;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (wallet.balance < total) {
      return res.status(400).json({ message: "Insufficient balance (amount + fee)" });
    }

    // ✅ lock amount, take fee immediately (platform earns fee)
    wallet.balance -= total;
    wallet.lockedBalance += amt;
    await wallet.save();

    const withdraw = await Withdraw.create({
      user: userId,
      amount: amt,
      fee,
      netAmount: amt, // if you want net = amt (fee separate)
      method,
      account,
      status: "pending",
    });

    await Transaction.create({
      user: userId,
      type: "withdraw_request",
      amount: amt,
      description: `Withdraw request (${method})`,
      reference: String(withdraw._id),
    });

    await Transaction.create({
      user: userId,
      type: "withdraw_fee",
      amount: fee,
      description: `Withdraw fee ${config.WITHDRAW_FEE_PERCENT}%`,
      reference: String(withdraw._id),
    });

    // Email (optional)
    // You can fetch user email if you want, or skip here.

    res.json({ success: true, message: "Withdraw submitted", withdraw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.getMyWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json(withdraws);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};