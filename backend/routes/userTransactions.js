const router = require("express").Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const tx = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(tx);
});

module.exports = router;
