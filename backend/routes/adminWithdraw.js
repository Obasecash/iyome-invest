
const router = require("express").Router();
const Withdrawal = require("../models/Withdraw");
const adminAuth = require("../middleware/adminAuth");

// View pending withdrawals
router.get("/", adminAuth, async (req, res) => {
  const withdrawals = await Withdrawal.find({ status: "pending" }).populate("userId");
  res.json(withdrawals);
});

// Approve withdrawal
router.post("/approve/:id", adminAuth, async (req, res) => {
  const wd = await Withdrawal.findById(req.params.id);
  if (!wd) return res.status(404).json({ message: "Not found" });

  wd.status = "approved";
  await wd.save();

  res.json({ message: "Withdrawal approved" });
});


const express = require("express");


router.get("/", (req, res) => {
  res.json({ message: "Admin withdraw route working" });
});



module.exports = router;


