const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    // ✅ profit tracking
    totalProfitAccrued: { type: Number, default: 0 },
    totalProfitPaid: { type: Number, default: 0 },

    lastProfitAt: { type: Date, default: null }, // stops double-paying
    nextProfitAt: { type: Date, default: null }, // schedule profit

    // optional
    reference: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
