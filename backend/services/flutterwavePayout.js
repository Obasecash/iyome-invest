const axios = require("axios");

const FLW_BASE = "https://api.flutterwave.com/v3";
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

function flwHeaders() {
  if (!FLW_SECRET_KEY) throw new Error("Missing FLW_SECRET_KEY");
  return { Authorization: `Bearer ${FLW_SECRET_KEY}` };
}

// Bank transfer payout
async function payoutBank({ amount, currency = "XAF", accountNumber, bankCode, narration, beneficiaryName }) {
  const res = await axios.post(
    `${FLW_BASE}/transfers`,
    {
      amount,
      currency,
      account_number: accountNumber,
      account_bank: bankCode,
      narration: narration || "Iyome withdraw",
      beneficiary_name: beneficiaryName || "Beneficiary",
    },
    { headers: flwHeaders() }
  );
  return res.data; // contains data.id, data.reference, etc.
}

// Mobile money payout (MTN/Orange via aggregator route code)
async function payoutMobileMoney({ amount, currency = "XAF", phone, routeCode, narration }) {
  const res = await axios.post(
    `${FLW_BASE}/transfers`,
    {
      amount,
      currency,
      account_number: phone,
      account_bank: routeCode, // e.g. your FLW momo route code (country/operator)
      narration: narration || "Iyome withdraw",
    },
    { headers: flwHeaders() }
  );
  return res.data;
}

module.exports = { payoutBank, payoutMobileMoney };