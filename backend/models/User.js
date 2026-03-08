const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  accountNumber: {
    type: String,
    unique: true
  },

  balance: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  referralCode: { type: String, unique: true },
referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
referralCount: { type: Number, default: 0 },
});

// ✅ Generate unique account number automatically
userSchema.pre("save", function (next) {
  if (!this.accountNumber) {
    const rand = Math.floor(1000000000 + Math.random() * 9000000000);
    this.accountNumber = "IY" + rand;
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = ("IYO" + Math.random().toString(36).substring(2, 8)).toUpperCase();
  }
  next();
});


module.exports = mongoose.model("User", userSchema);