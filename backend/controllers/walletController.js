

// backend/controllers/walletController.js

const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");


// ===============================
// ENSURE WALLET EXISTS
// ===============================
async function ensureWallet(userId) {
  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      currency: "USD"
    });
  }

  return wallet;
}


// ===============================
// GET INVESTOR PROFILE
// ===============================
exports.getInvestorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wallet = await ensureWallet(userId);

    const totalInvested = await Transaction.aggregate([
      { $match: { user: user._id, type: "investment", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalWithdrawn = await Transaction.aggregate([
      { $match: { user: user._id, type: "withdrawal", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      name: user.fullname,
      email: user.email,
      balance: wallet.balance,
      totalInvested: totalInvested[0]?.total || 0,
      totalWithdrawn: totalWithdrawn[0]?.total || 0
    });

  } catch (err) {
    console.error("getInvestorProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// CREATE DEPOSIT REQUEST
// ===============================
exports.createDepositRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const tx = await Transaction.create({
      user: userId,
      type: "deposit",
      amount,
      status: "pending",
      reference: "DEP-" + Date.now()
    });

    res.json({
      message: "Deposit request created. Admin will confirm.",
      transaction: tx
    });

  } catch (err) {
    console.error("createDepositRequest error:", err);
    res.status(500).json({ message: "Failed to create deposit request" });
  }
};


// ===============================
// ADMIN APPROVE DEPOSIT
// ===============================
exports.adminApproveDeposit = async (req, res) => {
  try {
    const { txId } = req.body;

    const tx = await Transaction.findById(txId);

    if (!tx || tx.type !== "deposit") {
      return res.status(404).json({ message: "Deposit transaction not found" });
    }

    if (tx.status === "completed") {
      return res.status(400).json({ message: "Already completed" });
    }

    const wallet = await ensureWallet(tx.user);

    wallet.balance += tx.amount;
    await wallet.save();

    tx.status = "completed";
    await tx.save();

    res.json({
      message: "Deposit approved and wallet credited",
      wallet,
      transaction: tx
    });

  } catch (err) {
    console.error("adminApproveDeposit error:", err);
    res.status(500).json({ message: "Failed to approve deposit" });
  }
};


// ===============================
// GET MY TRANSACTIONS
// ===============================
exports.getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });

  } catch (err) {
    console.error("getMyTransactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// GET WALLET BALANCE
// ===============================
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    res.json({
      balance: wallet ? wallet.balance : 0
    });

  } catch (err) {
    res.status(500).json({ message: "Wallet error" });
  }
};



