
const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/initialize", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: amount * 100
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data.data);
  } catch (err) {
    res.status(500).json({ error: "Paystack init failed" });
  }
});


router.get("/callback", async (req, res) => {
  try {
    const { reference } = req.query;

    const verify = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
        }
      }
    );

    const data = verify.data.data;

    if (data.status !== "success") {
      return res.redirect("/deposit-failed.html");
    }

    await Transaction.create({
      user: data.customer.email,
      type: "deposit",
      amount: data.amount / 100,
      status: "completed",
      reference
    });

    res.redirect("/deposit-success.html");
  } catch (err) {
    console.error(err);
    res.redirect("/deposit-failed.html");
  }
});



module.exports = router;
