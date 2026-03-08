// backend/routes/momo.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth"); // must set req.user.id and req.user.email
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const { requestToPay, getPaymentStatus } = require("../services/mtnCollections");

const router = express.Router();

/**
 * POST /api/momo/deposit/auto
 * body: { amount, phone }
 * -> creates pending transaction
 * -> sends MTN request-to-pay
 */
router.post("/deposit/auto", auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const phone = String(req.body.phone || "").trim();

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const referenceId = uuidv4();

    await Transaction.create({
      user: user._id,
      type: "deposit",
      method: "momo",
      amount,
      phone,
      currency: "XAF",
      reference: referenceId,
      status: "processing",
    });

    await requestToPay({
      referenceId,
      amount,
      phone,
      currency: "XAF",
      externalId: String(user._id),
    });

    res.json({
      message: "MTN MoMo request sent. Please approve on your phone.",
      referenceId,
    });
  } catch (err) {
    console.error("momo deposit auto error:", err?.response?.data || err.message);
    res.status(500).json({ message: "MoMo deposit failed", error: err?.response?.data || err.message });
  }
});

/**
 * GET /api/momo/deposit/status/:referenceId
 * -> checks MTN status
 * -> if SUCCESSFUL => credit wallet once
 */
router.get("/deposit/status/:referenceId", auth, async (req, res) => {
  try {
    const { referenceId } = req.params;

    const tx = await Transaction.findOne({ reference: referenceId, type: "deposit", method: "momo" });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    // only owner can check
    if (String(tx.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const statusData = await getPaymentStatus(referenceId);

    // MTN statuses usually: "PENDING", "SUCCESSFUL", "FAILED"
    const mtnStatus = String(statusData.status || "").toUpperCase();

    if (mtnStatus === "SUCCESSFUL" && tx.status !== "completed") {
      const user = await User.findById(tx.user);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.walletBalance = Number(user.walletBalance || 0) + Number(tx.amount);
      await user.save();

      tx.status = "completed";
      tx.raw = statusData;
      await tx.save();
    }

    if (mtnStatus === "FAILED") {
      tx.status = "failed";
      tx.raw = statusData;
      await tx.save();
    }

    res.json({
      success: true,
      referenceId,
      mtnStatus,
      localStatus: tx.status,
      data: statusData,
    });
  } catch (err) {
    console.error("momo deposit status error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Status check failed", error: err?.response?.data || err.message });
  }
});

module.exports = router;
