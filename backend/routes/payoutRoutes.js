const express = require("express");
const router = express.Router();
const payout = require("../Controllers/payoutController");

router.post("/withdraw", payout.sendPayout);

module.exports = router;
