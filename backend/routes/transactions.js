// backend/routes/transactions.js

const router = require("express").Router();
const authUser = require("../middleware/authUser");
const Transaction = require("../models/Transaction");

// GET /api/transactions/my  → user’s last 50 transactions
router.get("/my", authUser, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions,
    }); 
  } catch (err) {
    console.error("Get user transactions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
