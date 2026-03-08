const router = require("express").Router();
const adminAuth = require("../middleware/adminAuth");
const PayoutJob = require("../models/PayoutJob");

router.get("/", adminAuth, async (req, res) => {
  const jobs = await PayoutJob.find().populate("withdraw").sort({ createdAt: -1 });
  res.json(jobs);
});

module.exports = router;