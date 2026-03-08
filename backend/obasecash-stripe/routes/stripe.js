const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ message: "priceId is required" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
});

module.exports = router;
