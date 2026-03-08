const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
    userId: String,
    amount: Number,
    phone: String,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payout", payoutSchema);
