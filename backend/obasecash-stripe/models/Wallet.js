const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Wallet", walletSchema);
