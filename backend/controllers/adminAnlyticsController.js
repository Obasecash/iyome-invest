const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

exports.stats = async (req, res) => {
  try {
    const users = await User.countDocuments();

    const totalWallet = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const lockedWallet = await Wallet.aggregate([
      { $group: { _id: null, locked: { $sum: "$lockedBalance" } } },
    ]);

    const totalWithdrawFees = await Transaction.aggregate([
      { $match: { type: "withdraw_fee" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const pendingWithdraws = await Withdraw.countDocuments({ status: "pending" });

    res.json({
      users,
      totalWalletBalance: totalWallet[0]?.total || 0,
      lockedBalance: lockedWallet[0]?.locked || 0,
      totalWithdrawFees: totalWithdrawFees[0]?.total || 0,
      pendingWithdraws,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};