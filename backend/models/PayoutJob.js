const mongoose = require("mongoose");

const payoutJobSchema = new mongoose.Schema(
  {
    withdraw: { type: mongoose.Schema.Types.ObjectId, ref: "Withdraw", required: true, unique: true },

    status: {
      type: String,
      enum: ["queued", "processing", "success", "failed"],
      default: "queued",
    },

    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },

    lastError: { type: String, default: "" },

    provider: { type: String, default: "" },
    providerRef: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PayoutJob || mongoose.model("PayoutJob", payoutJobSchema);