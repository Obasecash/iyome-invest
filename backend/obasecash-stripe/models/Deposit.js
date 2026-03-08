const mongoose = require("mongoose");

const DepositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  reference: String,
}, { timestamps: true });

module.exports = mongoose.model("Deposit", DepositSchema);
