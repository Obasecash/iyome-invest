
// backend/server.js

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.json());

/* =========================
   ROUTES
========================= */

const authRoutes = require("./routes/authRoutes");
const investorRoutes = require("./routes/investorRoutes");
const depositRoutes = require("./routes/depositRoutes");
const walletRoutes = require("./routes/walletRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const withdrawRoutes = require("./routes/withdrawRoutes");
const adminWithdrawRoutes = require("./routes/adminWithdrawRoutes");
const adminDepositRoutes = require("./routes/adminDepositRoutes");
const adminPlanRoutes = require("./routes/adminPlanRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const helmet = require("helmet");
const morgan = require("morgan");



/* =========================
   STATIC FRONTEND
========================= */

app.use(express.static(path.join(__dirname, "public")));
/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/invest", investmentRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/admin/withdraw", adminWithdrawRoutes);
app.use("/api/admin/deposits", adminDepositRoutes);
app.use("/api/admin/plans", adminPlanRoutes);
app.use("/api/transactions", transactionRoutes);
app.use(helmet());
app.use(morgan("dev"));


/* =========================
   ROOT TEST
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 4242;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Mongo Error:", err.message);
  }
}

start();


