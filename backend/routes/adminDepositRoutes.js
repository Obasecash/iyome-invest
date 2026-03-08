const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

// IMPORTANT: match folder name "Controllers"
const {
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
} = require("../controllers/adminDepositController");

// /api/admin/deposits
router.get("/", adminAuth, getAllDeposits);
router.put("/approve/:id", adminAuth, approveDeposit);
router.put("/reject/:id", adminAuth, rejectDeposit);

module.exports = router;