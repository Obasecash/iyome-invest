// backend/models/WithdrawalRequest.js
const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    adminNote: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
