const Plan = require("../models/Plan");

exports.createPlan = async (req, res) => {
  try {
    const { name, minAmount, maxAmount, dailyRate, durationDays } = req.body;

    const plan = await Plan.create({
      name,
      minAmount,
      maxAmount,
      dailyRate,
      durationDays
    });

    res.json({ success: true, plan });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getPlans = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};