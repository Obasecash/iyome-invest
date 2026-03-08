const router = require("express").Router();
const Investment = require("../models/Investment");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const investments = await Investment.find({ userId: req.user.id })
    .populate("planId")
    .sort({ createdAt: -1 });

  res.json(investments);
});

module.exports = router;
