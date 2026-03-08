


const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


// =============================
// USER — CREATE DEPOSIT REQUEST
// =============================
router.post("/create", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const tx = await Transaction.create({
      user: req.user.id,
      type: "deposit",
      amount: Number(amount),
      status: "pending",
      description: "Wallet Deposit"
    });

    res.json({
      success: true,
      message: "Deposit request created",
      tx
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// =============================
// ADMIN — APPROVE DEPOSIT
// =============================
router.post("/approve/:id", auth, admin, async (req, res) => {
  try {

    const tx = await Transaction.findById(req.params.id);

    if (!tx) return res.status(404).json({ message: "Not found" });

    if (tx.type !== "deposit") {
      return res.status(400).json({ message: "Not a deposit" });
    }

    if (tx.status === "success") {
      return res.json({ message: "Already approved" });
    }

    tx.status = "success";
    await tx.save();

    const wallet = await Wallet.findOneAndUpdate(
      { user: tx.user },
      { $inc: { balance: tx.amount } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Deposit approved",
      wallet
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// =============================
// ADMIN — GET ALL DEPOSITS
// =============================
router.get("/all", auth, admin, async (req, res) => {
  try {

    const deposits = await Transaction.find({ type: "deposit" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(deposits);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;