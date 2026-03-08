const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const User = require("../models/User");

/**
 * MTN MOMO WEBHOOK
 * MTN sends payment status updates here
 */
router.post("/momo/webhook", async (req, res) => {
  try {
    const {
      referenceId,
      status
    } = req.body;

    if (!referenceId || !status) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const tx = await Transaction.findOne({ reference: referenceId });

    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Prevent double processing
    if (tx.status === "success") {
      return res.json({ message: "Already processed" });
    }

    if (status === "SUCCESSFUL") {
      tx.status = "success";
      await tx.save();

      // CREDIT WALLET
      const user = await User.findById(tx.user);
      if (user) {
        user.walletBalance += tx.amount;
        await user.save();
      }
    }

    if (status === "FAILED") {
      tx.status = "failed";
      await tx.save();
    }

    res.json({ message: "Webhook processed" });

  } catch (err) {
    console.error("MoMo webhook error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
