const Withdraw = require("../models/Withdraw");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const PayoutJob = require("../models/PayoutJob");

const { notifyEmail } = require("../services/notify");



// =========================
// GET ALL
// =========================

exports.getAllWithdraws = async (req, res) => {
  try {
    const list = await Withdraw.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// =========================
// GET PENDING
// =========================

exports.getPendingWithdraws = async (req, res) => {
  try {
    const list = await Withdraw.find({ status: "pending" })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// =========================
// APPROVE WITHDRAW
// =========================

exports.approveWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw)
      return res.status(404).json({ message: "Withdraw not found" });

    if (withdraw.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    withdraw.status = "approved";
    withdraw.processedAt = new Date();

    await withdraw.save();

    // queue payout job
    await PayoutJob.findOneAndUpdate(
      { withdraw: withdraw._id },
      { status: "queued" },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Approved. Payout queued." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// =========================
// REJECT WITHDRAW
// =========================

exports.rejectWithdraw = async (req, res) => {
  try {
    const { reason } = req.body;

    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw)
      return res.status(404).json({ message: "Withdraw not found" });

    if (withdraw.status === "rejected")
      return res.status(400).json({ message: "Already rejected" });

    if (withdraw.status === "approved" || withdraw.status === "paid")
      return res.status(400).json({ message: "Cannot reject approved/paid withdraw" });

    const wallet = await Wallet.findOne({ user: withdraw.user });

    if (!wallet)
      return res.status(404).json({ message: "Wallet not found" });

    // return locked funds
    wallet.lockedBalance -= withdraw.amount;
    if (wallet.lockedBalance < 0) wallet.lockedBalance = 0;

    wallet.balance += withdraw.amount;

    await wallet.save();

    withdraw.status = "rejected";
    withdraw.reason = reason || "Rejected by admin";
    withdraw.processedAt = new Date();

    await withdraw.save();

    await Transaction.create({
      user: withdraw.user,
      type: "withdraw_rejected",
      amount: withdraw.amount,
      description: `Withdraw rejected: ${withdraw.reason}`,
      reference: String(withdraw._id),
    });

    const user = await User.findById(withdraw.user);

    if (user?.email) {
      await notifyEmail(
        user.email,
        "Withdrawal Rejected",
        `Your withdrawal of ${withdraw.amount} was rejected. Reason: ${withdraw.reason}`
      );
    }

    res.json({ success: true, message: "Withdraw rejected" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// =========================
// MARK AS PAID (Worker or Manual)
// =========================

exports.markPaid = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw)
      return res.status(404).json({ message: "Withdraw not found" });

    if (withdraw.status !== "approved")
      return res.status(400).json({ message: "Withdraw must be approved first" });

    const wallet = await Wallet.findOne({ user: withdraw.user });

    if (wallet) {
      wallet.lockedBalance -= withdraw.amount;
      if (wallet.lockedBalance < 0) wallet.lockedBalance = 0;
      await wallet.save();
    }

    withdraw.status = "paid";
    withdraw.paidAt = new Date();

    await withdraw.save();

    await Transaction.create({
      user: withdraw.user,
      type: "withdraw_paid",
      amount: withdraw.amount,
      description: "Withdrawal completed",
      reference: String(withdraw._id),
    });

    res.json({ success: true, message: "Marked as paid" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};