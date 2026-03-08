const Transaction = require("../models/Transaction");

exports.getUserTransactions = async (req, res) => {
  try {
    const list = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions: list,
    });
  } catch (err) {
    console.error("Get user transactions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
