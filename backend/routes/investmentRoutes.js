
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createInvestment
} = require("../controllers/investController");

router.post("/", auth, createInvestment);

module.exports = router;
