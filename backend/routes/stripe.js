const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session (Deposit with card)
router.post("/create-checkout-session", auth, async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ message: "Missing priceId" });
    }

    // create pending transaction first
    const reference = uuidv4();

    await Transaction.create({
      user: req.user.id,
      type: "deposit",
      method: "stripe",
      amount: 0, // we’ll fill from webhook
      reference,
      status: "pending"
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        reference,
        userId: req.user.id
      },
      success_url: `${process.env.CLIENT_URL}/deposit-success.html`,
      cancel_url: `${process.env.CLIENT_URL}/deposit-cancel.html`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
