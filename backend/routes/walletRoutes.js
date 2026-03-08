

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Wallet = require("../models/Wallet");


router.get("/my", auth, async (req, res) => {
  try {

    const wallet = await Wallet.findOne({ user: req.user.id });

    res.json({
      balance: wallet ? wallet.balance : 0
    });

  } catch (err) {
    res.status(500).json({ message: "Wallet error" });
  }
});

module.exports = router;