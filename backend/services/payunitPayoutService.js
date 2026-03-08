const axios = require("axios");
const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal"); // you already have this
const MODE = (process.env.PAYUNIT_MODE || "mock").toLowerCase();
const BASE_URL = process.env.PAYUNIT_BASE_URL || "https://gateway.payunit.net/api";

exports.sendPayout = async ({ amount, method, note, userId, withdrawalId }) => {
  const numericAmount = Number(amount || 0);

  if (!numericAmount || !userId) {
    return { success: false, message: "Invalid payout amount or user." };
  }

  // ======================================
  // MOCK: just create withdrawal record
  // ======================================
  if (MODE === "mock") {
    const wd = await Withdrawal.create({
      user: userId,
      amount: numericAmount,
      method,
      note,
      status: "pending_manual", // admin will mark as paid
      provider: "mock",
    });

    // wallet balance already reduced by controller
    return { success: true, providerRef: wd._id.toString(), mode: "mock" };
  }

  // ======================================
  // REAL PAYUNIT DISBURSE (later)
  // ======================================
  try {
    const response = await axios.post(
      `${BASE_URL}/disburse`,
      {
        amount: numericAmount,
        // TODO: fill fields from PayUnit disbursement docs
        description: "IyomeInvest Withdrawal",
        method,
        note,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.PAYUNIT_API_KEY,
          "X-MERCHANT-ID": process.env.PAYUNIT_MERCHANT_ID,
          "X-API-SECRET": process.env.PAYUNIT_API_PASSWORD,
        },
      }
    );

    if (response.data && response.data.status === "success") {
      return { success: true, providerRef: response.data.reference || "" };
    }

    return { success: false, message: "PayUnit payout failed." };
  } catch (err) {
    console.error("PayUnit payout error:", err.response?.data || err.message);
    return { success: false, message: "PayUnit payout error." };
  }
};
