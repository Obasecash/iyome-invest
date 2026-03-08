const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { requestToPay } = require("../services/mtnCollection");
const auth = require("../middleware/auth"); // JWT middleware

router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount, phone, reference } = req.body;

    // 1️⃣ Get logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Generate referenceId for MTN
    const referenceId = require("uuid").v4();

    // 3️⃣ 👉 CREATE TRANSACTION HERE (THIS IS YOUR ANSWER)
    const tx = await Transaction.create({
      user: user._id,
      type: "deposit",
      method: "momo",
      amount,
      referenceId,
      status: "pending"
    });

    // 4️⃣ Call MTN MoMo
    await requestToPay({
      amount,
      phone,
      reference: reference || user.email,
      referenceId
    });

    // 5️⃣ Respond to frontend
    res.json({
      message: "MTN MoMo request sent. Approve on your phone.",
      referenceId
    });

  } catch (err) {
    console.error("MoMo deposit error:", err);
    res.status(500).json({ message: "MoMo deposit failed" });
  }
});

// ✅ CHECK MTN MOMO PAYMENT STATUS
router.get("/check/:referenceId", async (req, res) => {
  try {
    const { referenceId } = req.params;

    // 1. Find transaction
    const tx = await Transaction.findOne({ reference: referenceId });
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 2. If already successful, stop (ANTI DOUBLE CREDIT)
    if (tx.status === "success") {
      return res.json({
        message: "Payment already completed",
        status: tx.status
      });
    }

    // 3. Get MTN access token
    const token = await getMtnAccessToken();

    // 4. Ask MTN for payment status
    const response = await axios.get(
      `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key":
            process.env.MTN_COLLECTION_SUBSCRIPTION_KEY
        }
      }
    );

    const mtnStatus = response.data.status;

    // 5. Update transaction status
    if (mtnStatus === "SUCCESSFUL") {
  // 🛑 STOP DOUBLE CREDIT
  if (tx.status !== "success") {
    tx.status = "success";
    await tx.save();

    // ✅ CREDIT USER WALLET
    const user = await User.findById(tx.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance += tx.amount;
    await user.save();
  }


    } else if (mtnStatus === "FAILED") {
      
      tx.status = "failed";
      await tx.save();
    }

    res.json({
      referenceId,
      mtnStatus,
      transactionStatus: tx.status
    });
  } catch (err) {
    console.error("MTN status check error:", err.response?.data || err.message);
    res.status(500).json({ message: "MTN status check failed" });
  }
});


module.exports = router;
