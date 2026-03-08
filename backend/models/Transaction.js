const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw_request",
        "withdraw_fee",
        "withdraw_approved",
        "withdraw_rejected",
        "profit",
        "investment",
        "referral_bonus",
      ],
    },

    amount: { type: Number, default: 0 },
    status: { type: String, default: "completed" },
    reference: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
