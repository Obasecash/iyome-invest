const express = require("express");
const router = express.Router();
const { requestToPay } = require("../services/mtnCollection");

router.post("/deposit", async (req, res) => {
  try {
    const { amount, phone } = req.body;

    const referenceId = await requestToPay({
      amount,
      phone,
      reference: phone
    });

    res.json({
      success: true,
      message: "MoMo prompt sent",
      referenceId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "MTN error" });
  }
});

module.exports = router;
