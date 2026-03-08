

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));



const Stripe = require("stripe");
const stripe = new
Stripe(process.env.STRIPE_SECRET_KEY);


const app = express();

/* ======================
   STRIPE WEBHOOK FIRST
   ====================== */
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  require("./routes/stripeWebhook")
);

/* ======================
   NORMAL MIDDLEWARE
   ====================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   STRIPE ROUTES
   ====================== */
app.use("/api/stripe", require("./routes/stripe"));


const Payment = require("./models/Payment");
const Wallet = require("./models/Wallet");

app.post("/create-checkout-session", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const email = req.body.email; // frontend must send this

    if (!amount || amount <= 0 || !email) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // 1️⃣ Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Iyome Investment",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:4242/success.html",
      cancel_url: "http://localhost:4242/cancel.html",
    });

    // 2️⃣ Find or create wallet
    let wallet = await Wallet.findOne({ email });

    if (!wallet) {
      wallet = await Wallet.create({
        email,
        balance: 0,
      });
    }

    // 3️⃣ Credit wallet
    wallet.balance += amount;
    wallet.updatedAt = new Date();
    await wallet.save();

    // 4️⃣ Save payment record
    await Payment.create({
      email,
      walletEmail: email,
      amount,
      currency: "usd",
      stripeSessionId: session.id,
      status: "paid",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



/* ======================
   STATIC FILES
   ====================== */
app.use(express.static(path.join(__dirname, "public")));

/* ======================
   START SERVER
   ====================== */
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Obasecash Stripe running on http://localhost:${PORT}`);
});
