const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  stripeSessionId: { type: String, unique: true },
  amount: Number,
  currency: String,
  userRef: String,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
