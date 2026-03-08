import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// MongoDB connect (use your same cluster)
mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });

// Transaction schema reference (same as your main app)
const transactionSchema = new mongoose.Schema({
  investorId: String,
  externalId: String,
  type: String,
  amount: Number,
  currency: String,
  status: String,
  hash: String,
  blockHash: String,
  createdAt: Date,
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// API: list latest transactions
app.get("/api/transactions", async (req, res) => {
  const tx = await Transaction.find().sort({ createdAt: -1 }).limit(50);
  res.json(tx);
});

// API: search by reference
app.get("/api/transactions/:ref", async (req, res) => {
  const tx = await Transaction.findOne({ externalId: req.params.ref });
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  res.json(tx);
});

// Serve homepage
app.get("/", (req, res) =>
  res.sendFile(path.join(process.cwd(), "public/index.html"))
);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`🌐 Iyome Explorer running on ${port}`));
