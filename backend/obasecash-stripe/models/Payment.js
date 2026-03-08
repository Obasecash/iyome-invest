const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  stripeSessionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number, // stored in cents
    required: true,
  },
  currency: {
    type: String,
    default: "usd",
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
