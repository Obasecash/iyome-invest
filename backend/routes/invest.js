const express = require('express');
const router = express.Router();

const Wallet = require('../models/Wallet');
const Investment = require('../models/Investment');
const InvestmentPlan = require('../models/InvestmentPlan');

// POST /api/invest
router.post('/', async (req, res) => {
  const { userId, planId, amount } = req.body;

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ message: 'Insufficient wallet balance' });
  }

  const plan = await InvestmentPlan.findById(planId);
  if (!plan || !plan.active) {
    return res.status(400).json({ message: 'Invalid plan' });
  }

  if (amount < plan.minAmount || amount > plan.maxAmount) {
    return res.status(400).json({ message: 'Amount not allowed for this plan' });
  }

  // Calculate ROI & maturity
  const expectedReturn = amount + (amount * plan.roiPercent / 100);
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + plan.lockDays);

  // Deduct wallet
  wallet.balance -= amount;
  await wallet.save();

  // Create investment
  const investment = await Investment.create({
    userId,
    planId,
    amount,
    roiPercent: plan.roiPercent,
    expectedReturn,
    maturityDate
  });

  res.json({
    message: 'Investment successful',
    investment
  });
});

module.exports = router;
