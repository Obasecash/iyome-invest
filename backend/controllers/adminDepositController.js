const Deposit = require("../models/Deposit");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

// GET all deposits (latest first)
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    console.error("getAllDeposits error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// APPROVE deposit
exports.approveDeposit = async (req, res) => {
  try {
    const dep = await Deposit.findById(req.params.id).populate("user");
    if (!dep) return res.status(404).json({ message: "Deposit not found" });
    if (dep.status === "approved") return res.json({ message: "Already approved" });

    dep.status = "approved";
    await dep.save();

    // Update wallet
    const wallet = await Wallet.findOne({ user: dep.user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance = Number(wallet.balance || 0) + Number(dep.amount || 0);
    await wallet.save();

    // ✅ Referral bonus (optional)
    // If user was referredBy, give bonus to referrer
    const user = await User.findById(dep.user._id);
    if (user?.referredBy) {
      const bonus = Math.floor(Number(dep.amount || 0) * 0.05); // 5% bonus (change if you want)
      const refWallet = await Wallet.findOne({ user: user.referredBy });
      if (refWallet && bonus > 0) {
        refWallet.balance = Number(refWallet.balance || 0) + bonus;
        await refWallet.save();
      }
    }

    res.json({ success: true, message: "Deposit approved", walletBalance: wallet.balance });
  } catch (err) {
    console.error("approveDeposit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REJECT deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const dep = await Deposit.findById(req.params.id);
    if (!dep) return res.status(404).json({ message: "Deposit not found" });

    dep.status = "rejected";
    await dep.save();

    res.json({ success: true, message: "Deposit rejected" });
  } catch (err) {
    console.error("rejectDeposit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};