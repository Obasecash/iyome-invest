

const User = require("../models/User");
const Deposit = require("../models/Deposit");
const Transaction = require("../models/Transaction");
const Investment = require("../models/Investment");
const Plan = require("../models/Plan");

const { sendMail } = require("../utils/email");

// =========================
// ADMIN STATS
// =========================
exports.getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();

    const activeInvestments = await Investment.countDocuments({ status: "active" });

    const totalDepositsAgg = await Transaction.aggregate([
      { $match: { type: "deposit", status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalWithdrawalsAgg = await Transaction.aggregate([
      { $match: { type: "withdraw", status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      usersCount,
      activeInvestments,
      totalDeposits: totalDepositsAgg[0]?.total || 0,
      totalWithdrawals: totalWithdrawalsAgg[0]?.total || 0,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// PLANS
// =========================
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });
    res.json({ plans });
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.json({ message: "Plan created", plan });
  } catch (err) {
    console.error("Create plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Plan updated", plan });
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// INVESTMENTS (ADMIN VIEW)
// =========================
exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ investments });
  } catch (err) {
    console.error("Admin investments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// DEPOSITS (ADMIN VIEW)
// =========================
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ deposits });
  } catch (err) {
    console.error("Get deposits error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ APPROVE DEPOSIT (credit wallet + transaction + email)
exports.approveDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });

    if (deposit.status === "approved")
      return res.json({ message: "Already approved" });

    const user = await User.findById(deposit.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    // credit wallet
    user.wallet = Number(user.wallet || 0) + Number(deposit.amount || 0);
    await user.save();

    // update deposit status
    deposit.status = "approved";
    await deposit.save();

    // log transaction
    await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: deposit.amount,
      status: "success",
      note: "Admin approved deposit",
    });

    // ✅ EMAIL
    try {
      await sendMail(
        user.email,
        "Deposit Approved ✅",
        `Hello ${user.name || ""}, your deposit of ${deposit.amount} has been approved and your wallet has been credited.`
      );
    } catch (emailErr) {
      console.log("Email failed (still approved):", emailErr.message);
    }

    res.json({ message: "Deposit approved ✅" });
  } catch (err) {
    console.error("Approve deposit error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ❌ REJECT DEPOSIT (status + email)
exports.rejectDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });

    if (deposit.status === "rejected")
      return res.json({ message: "Already rejected" });

    const user = await User.findById(deposit.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    deposit.status = "rejected";
    await deposit.save();

    // log transaction (optional)
    await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: deposit.amount,
      status: "failed",
      note: "Admin rejected deposit",
    });

    // email
    try {
      await sendMail(
        user.email,
        "Deposit Rejected ❌",
        `Hello ${user.name || ""}, your deposit of ${deposit.amount} was rejected. If you believe this is a mistake, contact support: sales@iyomeinvestp.com`
      );
    } catch (emailErr) {
      console.log("Email failed (still rejected):", emailErr.message);
    }

    res.json({ message: "Deposit rejected ❌" });
  } catch (err) {
    console.error("Reject deposit error:", err);
    res.status(500).json({ error: err.message });
  }
};



