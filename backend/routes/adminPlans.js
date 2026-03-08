const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const InvestmentPlan = require('../models/InvestmentPlan');

// create
router.post('/', adminAuth, async (req, res) => {
  const plan = await InvestmentPlan.create(req.body);
  res.json(plan);
});

// list
router.get('/', adminAuth, async (req, res) => {
  res.json(await InvestmentPlan.find());
});

// toggle active
router.patch('/:id/toggle', adminAuth, async (req, res) => {
  const plan = await InvestmentPlan.findById(req.params.id);
  plan.active = !plan.active;
  await plan.save();
  res.json(plan);
});

module.exports = router;
