const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle events
    if (event.type === "checkout.session.completed") {
      console.log("✅ Checkout completed:", event.data.object.id);
    }

    if (event.type === "payment_intent.succeeded") {
      console.log("💰 Payment succeeded");
    }

    res.json({ received: true });
  }
);

module.exports = router;
