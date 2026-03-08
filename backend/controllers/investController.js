

const Investment = require("../models/Investment");
const Plan = require("../models/Plan");
const Wallet = require("../models/Wallet");
const User = require("../models/User");


// =============================
// USER CREATE INVESTMENT
// =============================
exports.createInvestment = async (req, res) => {
  try {
    const { planId, amount } = req.body;

    const userId = req.user.id;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // deduct wallet
    wallet.balance -= amount;
    await wallet.save();

    const investment = await Investment.create({
      user: userId,
      plan: planId,
      amount,
      profitPercent: plan.profitPercent,
      durationDays: plan.durationDays,
      status: "active",
      startDate: new Date()
    });

    

// ✅ set endDate + nextProfitAt from plan
const now = new Date();

inv.startDate = now;
inv.endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

// first profit in 1 interval
inv.nextProfitAt =
  plan.profitInterval === "hourly"
    ? new Date(now.getTime() + 60 * 60 * 1000)
    : new Date(now.getTime() + 24 * 60 * 60 * 1000);

await inv.save();

    res.json({
      success: true,
      message: "Investment created successfully",
      investment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// =============================
// USER GET MY INVESTMENTS
// =============================
exports.getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({
      user: req.user.id
    }).populate("plan");

    res.json(investments);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// =============================
// CALCULATE PROFIT
// =============================
exports.calculateProfit = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    const profit =
      (investment.amount * investment.profitPercent) / 100;

    res.json({
      amount: investment.amount,
      profit,
      total: investment.amount + profit
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// =============================
// ADMIN GET ALL INVESTMENTS
// =============================
exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate("user", "name email")
      .populate("plan");

    res.json(investments);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// =============================
// ADMIN APPROVE INVESTMENT
// =============================
exports.approveInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    investment.status = "active";
    await investment.save();

    res.json({ message: "Investment approved" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// =============================
// ADMIN COMPLETE INVESTMENT
// (Pay profit to wallet)
// =============================
exports.completeInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.status === "completed") {
      return res.status(400).json({ message: "Already completed" });
    }

    const wallet = await Wallet.findOne({
      user: investment.user
    });

    const profit =
      (investment.amount * investment.profitPercent) / 100;

    const totalReturn = investment.amount + profit;

    wallet.balance += totalReturn;
    await wallet.save();

    investment.status = "completed";
    investment.completedAt = new Date();
    await investment.save();

    res.json({
      message: "Investment completed and wallet credited",
      totalReturn
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

