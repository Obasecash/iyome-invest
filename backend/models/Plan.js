const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minAmount: { type: Number, default: 0 },

    // ✅ ROI settings
    roiPercent: { type: Number, required: true }, // e.g 30 means 30% total ROI
    durationDays: { type: Number, required: true }, // e.g 30 days

    // ✅ profit interval: "daily" or "hourly"
    profitInterval: { type: String, enum: ["daily", "hourly"], default: "daily" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);