const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const Investment = require('../models/Investment');

router.get('/', adminAuth, async (req, res) => {
  const data = await Investment.find().populate('userId planId');
  res.json(data);
});

module.exports = router;

