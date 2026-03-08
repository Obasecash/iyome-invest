const Deposit = require("../models/Deposit");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");


// Create deposit request
exports.createDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Find wallet
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0
      });
    }

    // Update balance
    wallet.balance += Number(amount);
    await wallet.save();

    // Save transaction
    await Transaction.create({
      user: userId,
      type: "deposit",
      amount,
      status: "success",
      description: "Wallet Deposit"
    });

    res.json({
      success: true,
      balance: wallet.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Deposit error" });
  }
};


// Approve deposit (admin simulation)
const Deposit = require("../models/Deposit");
const Wallet = require("../models/Wallet");

exports.createDeposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const deposit = await Deposit.create({
      user: req.user.id,
      amount
    });

    res.json({
      success: true,
      message: "Deposit request created",
      deposit
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

