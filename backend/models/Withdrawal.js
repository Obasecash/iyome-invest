const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      default: "momo",
    },

    phone: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);