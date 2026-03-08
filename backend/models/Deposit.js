
const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "pending"
  },
  method: {
    type: String,
    default: "manual"
  }
}, { timestamps: true });

module.exports = mongoose.model("Deposit", depositSchema);

