const express = require("express");
const Wallet = require("../models/Wallet");

const router = express.Router();

/* GET USER WALLET */
router.get("/balance", async (req, res) => {
  try {
    const userRef = req.user?.id || req.headers["x-user-ref"];

    if (!userRef) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let wallet = await Wallet.findOne({ userRef });

    if (!wallet) {
      wallet = await Wallet.create({ userRef, balance: 0 });
    }

    res.json({
      balance: wallet.balance,
      currency: "USD"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
