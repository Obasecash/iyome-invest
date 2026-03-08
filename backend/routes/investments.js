
const express = require("express");
const Wallet = require("../models/Wallet");
const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();

/* GET PLANS */
router.get("/plans", async (req, res) => {
  const plans = await InvestmentPlan.find();
  res.json(plans);
});

/* CREATE INVESTMENT */
router.post("/create", async (req, res) => {
  const { email, planId, amount } = req.body;

  const plan = await InvestmentPlan.findById(planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  if (amount < plan.minAmount || amount > plan.maxAmount) {
    return res.status(400).json({ message: "Invalid amount for this plan" });
  }

  const wallet = await Wallet.findOne({ email });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ message: "Insufficient wallet balance" });
  }

  wallet.balance -= amount;
  await wallet.save();

  const investment = await Investment.create({
    email,
    planName: plan.name,
    amount,
    dailyROI: plan.dailyROI,
    durationDays: plan.durationDays
  });

  res.json({ message: "Investment started", investment });
});

/* GET USER INVESTMENTS */
router.get("/:email", async (req, res) => {
  const investments = await Investment.find({ email: req.params.email });
  res.json(investments);
});

module.exports = router;
