const router = require("express").Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

router.get("/", auth, async (req, res) => {
  const tx = await Transaction.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(tx);
});

module.exports = router;