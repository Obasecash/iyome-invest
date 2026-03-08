const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // deposit | withdraw | investment | profit | referral
    type: {
      type: String,
      enum: ["deposit", "withdraw", "investment", "profit", "referral"],
      required: true,
    },

    amount: { type: Number, required: true },

    method: { type: String }, // MoMo, PayPal, Plan name, etc.

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },

    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
