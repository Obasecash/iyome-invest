const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const Transaction = require("../models/Transaction");

// GET all pending MoMo deposits
router.get("/pending", adminAuth, async (req, res) => {
  try {
    const txs = await Transaction.find({
      type: "deposit",
      method: "momo",
      status: "processing"
    }).populate("user", "email phone");

    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load deposits" });
  }
});

module.exports = router;
