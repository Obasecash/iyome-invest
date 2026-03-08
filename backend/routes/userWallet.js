const router = require("express").Router();
const Wallet = require("../models/Wallet");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user.id });
  res.json(wallet || { balance: 0 });
});

module.exports = router;
