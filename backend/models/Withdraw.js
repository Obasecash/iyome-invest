const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    amount: Number,

    fee: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },

    method: String,
    account: String,

    status: {
      type: String,
      enum: ["pending", "processing", "approved", "paid", "rejected"],
      default: "pending",
    },

    reason: String,
    processedAt: Date,
    paidAt: Date,

    provider: { type: String, default: "" },
    providerRef: { type: String, default: "" },

    failReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdraw", withdrawSchema);