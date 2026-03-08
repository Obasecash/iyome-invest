const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const Wallet = require('../models/Wallet');

router.get('/', adminAuth, async (req, res) => {
  res.json(await Wallet.find().populate('userId'));
});

module.exports = router;
