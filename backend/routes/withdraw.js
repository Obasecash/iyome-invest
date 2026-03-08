const express = require("express");
const router = express.Router();

const { createWithdraw } = require("../Controllers/withdrawController");

router.post("/", createWithdraw);

module.exports = router;
