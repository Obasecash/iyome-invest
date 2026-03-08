// backend/controllers/investmentController.js

const InvestmentPlan = require("../models/InvestmentPlan");
const Investment = require("../models/Investment");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");



/* ===============================
   GET ALL ACTIVE PLANS
================================ */
exports.getPlans = async (req, res) => {
  try {

    const plans = await InvestmentPlan
      .find({ isActive: true })
      .sort("minAmount");

    res.json(plans);

  } catch (err) {
    console.error("getPlans error:", err);
    res.status(500).json({ message: "Failed to load plans" });
  }
};



/* ===============================
   CREATE INVESTMENT
================================ */
exports.createInvestment = async (req, res) => {
  try {

    const { amount, planName } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct wallet
    wallet.balance -= amount;
    await wallet.save();


    // Create investment
    const investment = await Investment.create({
      user: userId,
      planName,
      amount,
      dailyROI: 5,
      durationDays: 30,
      lastPaidDate: new Date(),
      status: "active"
    });


    // Record transaction
    await Transaction.create({
      user: userId,
      type: "investment",
      amount,
      status: "completed",
      reference: "INV-" + Date.now()
    });


    res.json({
      success: true,
      message: "Investment created successfully",
      investment
    });

  } catch (err) {
    console.error("createInvestment error:", err);
    res.status(500).json({ message: "Investment error" });
  }
};



/* ===============================
   GET USER INVESTMENTS
================================ */
exports.getMyInvestments = async (req, res) => {
  try {

    const userId = req.user.id;

    const investments = await Investment
      .find({ user: userId })
      .sort("-createdAt");

    res.json(investments);

  } catch (err) {
    console.error("getMyInvestments error:", err);
    res.status(500).json({ message: "Failed to load investments" });
  }
};