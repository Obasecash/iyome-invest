import express from "express";
import Withdrawal from "../models/Withdrawal.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/withdrawals", auth, async (req, res) => {
  const withdrawals = await Withdrawal.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(withdrawals);
});

export default router;
