const express = require("express");
const router = express.Router();

const {
  getAllWithdraws,
  approveWithdraw,
  rejectWithdraw
} = require("../controllers/adminWithdrawController");

router.get("/", getAllWithdraws);
router.put("/approve/:id", approveWithdraw);
router.put("/reject/:id", rejectWithdraw);

module.exports = router;