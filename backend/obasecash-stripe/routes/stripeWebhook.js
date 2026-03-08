const express = require("express");
const Stripe = require("stripe");
const Wallet = require("../models/Wallet");
const Payment = require("../models/Payment");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed", err.message);
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const sessionId = session.id;
    const amount = session.amount_total / 100;
    const currency = session.currency;
    const userRef = session.metadata?.userRef;

    if (!userRef) return res.json({ received: true });

    // prevent double credit
    const exists = await Payment.findOne({ stripeSessionId: sessionId });
    if (exists) return res.json({ received: true });

    await Payment.create({
      stripeSessionId: sessionId,
      amount,
      currency,
      userRef,
      status: "completed"
    });

    const wallet = await Wallet.findOneAndUpdate(
      { userRef },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    console.log("Wallet credited:", wallet.balance);
  }

  res.json({ received: true });
});

module.exports = router;
