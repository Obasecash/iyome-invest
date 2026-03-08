// backend/services/flutterwavePayout.js
const axios = require("axios");

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_BASE = "https://api.flutterwave.com/v3";

function flwHeaders() {
  if (!FLW_SECRET_KEY) throw new Error("Missing FLW_SECRET_KEY");
  return { Authorization: `Bearer ${FLW_SECRET_KEY}` };
}

// BANK TRANSFER
async function payoutBank({ amount, currency = "XAF", account, bankCode, narration, beneficiaryName }) {
  const res = await axios.post(
    `${FLW_BASE}/transfers`,
    {
      amount,
      currency,
      account_number: account,
      account_bank: bankCode,
      narration: narration || "Iyome withdrawal",
      beneficiary_name: beneficiaryName || "Beneficiary",
    },
    { headers: flwHeaders() }
  );
  return res.data;
}

// MOBILE MONEY (coverage varies by country/operator)
// In practice you may need the right "account_bank" value per route/operator from Flutterwave docs/dashboard.
async function payoutMobileMoney({ amount, currency = "XAF", phone, accountBank, narration }) {
  const res = await axios.post(
    `${FLW_BASE}/transfers`,
    {
      amount,
      currency,
      account_number: phone,
      account_bank: accountBank, // e.g. specific bank code for “Francophone Mobile Money” route (check Flutterwave dashboard/docs for Cameroon)
      narration: narration || "Iyome withdrawal",
    },
    { headers: flwHeaders() }
  );
  return res.data;
}

module.exports = { payoutBank, payoutMobileMoney };