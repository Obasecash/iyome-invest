const axios = require("axios");
const { v4: uuid } = require("uuid");

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET;
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;



// =============================
// FLUTTERWAVE MOBILE / BANK
// =============================

async function flutterwavePayout(withdraw) {

  const tx_ref = "WD-" + uuid();

  const payload = {
    account_bank: withdraw.bankCode || "MPS", // mobile money
    account_number: withdraw.account,
    amount: withdraw.amount,
    currency: "XAF",
    narration: "Iyome Withdraw",
    reference: tx_ref,
    beneficiary_name: withdraw.accountName || "User"
  };

  const res = await axios.post(
    "https://api.flutterwave.com/v3/transfers",
    payload,
    {
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    success: true,
    reference: res.data.data.reference
  };
}



// =============================
// PAYPAL PAYOUT
// =============================

async function paypalPayout(withdraw) {

  const auth = Buffer.from(
    PAYPAL_CLIENT + ":" + PAYPAL_SECRET
  ).toString("base64");

  const tokenRes = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  const accessToken = tokenRes.data.access_token;

  const payout = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/payments/payouts",
    {
      sender_batch_header: {
        sender_batch_id: "batch_" + Date.now(),
        email_subject: "You have a payout!"
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: withdraw.amount,
            currency: "USD"
          },
          receiver: withdraw.paypalEmail,
          note: "Iyome payout"
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    success: true,
    reference: payout.data.batch_header.payout_batch_id
  };
}



// =============================
// MAIN ROUTER
// =============================

async function sendPayout(withdraw) {

  if (withdraw.method === "paypal") {
    return paypalPayout(withdraw);
  }

  // MTN / Orange / Bank → Flutterwave
  return flutterwavePayout(withdraw);
}



async function payoutToProvider({ method, account, amount }) {
  // ✅ Plug provider logic here later:
  // - MTN MoMo API
  // - Orange Money API
  // - Bank transfer API

  // For now: simulate success
  return {
    success: true,
    providerRef: "SIM-" + Date.now(),
    message: "Payout simulated (connect provider later)",
  };
}



const axios = require("axios");

/*
  MAIN PAYOUT DISPATCHER
  method = momo | orange | bank | paypal
*/

async function sendPayout({ method, amount, account, name, reference }) {
  switch (method) {
    case "momo":
      return await sendMTNMoMo(amount, account, name, reference);

    case "orange":
      return await sendOrangeMoney(amount, account, name, reference);

    case "bank":
      return await sendBankTransfer(amount, account, name, reference);

    case "paypal":
      return await sendPaypal(amount, account, name, reference);

    default:
      throw new Error("Unsupported payout method");
  }
}

/* ============================
   MTN MOMO
============================ */

async function sendMTNMoMo(amount, phone, name, reference) {
  try {
    // 🔴 Replace with real MTN API later
    console.log("MTN MoMo payout:", phone, amount);

    return {
      success: true,
      provider: "MTN",
      reference: reference || Date.now(),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ============================
   ORANGE MONEY
============================ */

async function sendOrangeMoney(amount, phone, name, reference) {
  try {
    console.log("Orange payout:", phone, amount);

    return {
      success: true,
      provider: "ORANGE",
      reference: reference || Date.now(),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ============================
   BANK TRANSFER
============================ */

async function sendBankTransfer(amount, account, name, reference) {
  try {
    console.log("Bank payout:", account, amount);

    return {
      success: true,
      provider: "BANK",
      reference: reference || Date.now(),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ============================
   PAYPAL
============================ */

async function sendPaypal(amount, email, name, reference) {
  try {
    console.log("PayPal payout:", email, amount);

    return {
      success: true,
      provider: "PAYPAL",
      reference: reference || Date.now(),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}



// This is the single place you later plug real APIs.
// For now, it returns success with a reference so your system is stable.

async function sendPayout(withdraw) {
  const { method, amount, account, paypalEmail, bankCode } = withdraw;

  // ✅ IMPORTANT: replace these with REAL API calls once you have live credentials.
  // If no live credentials yet, keep this simulation so your platform works.

  if (method === "paypal") {
    if (!paypalEmail) return { success: false, provider: "paypal", error: "Missing paypalEmail" };
    return { success: true, provider: "paypal", providerRef: "PAYPAL-" + Date.now() };
  }

  if (method === "bank") {
    if (!account || !bankCode) return { success: false, provider: "bank", error: "Missing bank account or bankCode" };
    return { success: true, provider: "bank", providerRef: "BANK-" + Date.now() };
  }

  if (method === "mtn") {
    if (!account) return { success: false, provider: "mtn", error: "Missing MTN phone" };
    return { success: true, provider: "mtn", providerRef: "MTN-" + Date.now() };
  }

  if (method === "orange") {
    if (!account) return { success: false, provider: "orange", error: "Missing Orange phone" };
    return { success: true, provider: "orange", providerRef: "ORANGE-" + Date.now() };
  }

  return { success: false, provider: "unknown", error: "Unsupported method" };
}

module.exports = { sendPayout };




module.exports = { sendPayout };





module.exports = { payoutToProvider };




