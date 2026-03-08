const express = require("express");
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.get("/transactions", auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1
    });
    res.json(txs);
  } catch (err) {
    console.error("User history error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
