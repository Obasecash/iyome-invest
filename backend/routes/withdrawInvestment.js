const express = require('express');
const router = express.Router();

const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');

router.post('/withdraw', async (req, res) => {
  const { investmentId, userId } = req.body;

  const inv = await Investment.findOne({
    _id: investmentId,
    userId,
    status: 'matured'
  });

  if (!inv) {
    return res.status(400).json({ message: 'Investment not ready' });
  }

  const wallet = await Wallet.findOne({ userId });
  wallet.balance += inv.expectedReturn;
  await wallet.save();

  inv.status = 'withdrawn';
  await inv.save();

  res.json({ message: 'Withdrawal successful' });
});

module.exports = router;
