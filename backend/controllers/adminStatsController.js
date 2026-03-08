const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();

    const wallets = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const withdrawals = await Withdraw.aggregate([
      { $group: { _id: null, total } }
    ]);

    res.json({
      users,
      totalWallet: wallets[0]?.total || 0,
      withdrawals: withdrawals[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};