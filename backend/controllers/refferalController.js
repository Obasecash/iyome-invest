const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const REF_BONUS = 500; // change if you want

exports.applyReferral = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) return res.status(400).json({ message: "Referral code required" });

    const me = await User.findById(userId);
    if (me.referredBy) return res.status(400).json({ message: "Referral already applied" });

    const refUser = await User.findOne({ referralCode: code });
    if (!refUser) return res.status(404).json({ message: "Invalid referral code" });

    if (String(refUser._id) === String(me._id)) {
      return res.status(400).json({ message: "You cannot refer yourself" });
    }

    me.referredBy = refUser._id;
    await me.save();

    refUser.referralCount += 1;
    await refUser.save();

    // ✅ bonus to referrer wallet
    const refWallet = await Wallet.findOne({ user: refUser._id });
    if (refWallet) {
      refWallet.balance += REF_BONUS;
      await refWallet.save();
    }

    await Transaction.create({
      user: refUser._id,
      type: "referral_bonus",
      amount: REF_BONUS,
      description: `Referral bonus for inviting ${me.email || "a user"}`,
    });

    res.json({ success: true, message: "Referral applied successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};