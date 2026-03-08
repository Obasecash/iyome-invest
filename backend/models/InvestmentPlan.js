// backend/models/InvestmentPlan.js
const mongoose = require("mongoose");

const InvestmentPlanSchema = new mongoose.Schema({
  name: String,
  minAmount: Number,   // cents
  maxAmount: Number,   // cents
  dailyROI: Number,    // percentage (e.g. 2 = 2%)
  durationDays: Number // how long investment runs
});

module.exports = mongoose.model("InvestmentPlan", InvestmentPlanSchema);
