// backend/services/mtnCollections.js
const axios = require("axios");

function envOrThrow(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

const BASE_URL = envOrThrow("MTN_COLLECTION_URL");
const SUB_KEY = envOrThrow("MTN_COLLECTION_SUBSCRIPTION_KEY");
const TARGET_ENV = envOrThrow("MTN_ENV");
const USER_ID = envOrThrow("MTN_USER_ID");
const API_KEY = envOrThrow("MTN_API_KEY");

async function getAccessToken() {
  const url = `${BASE_URL}/collection/token/`;
  const res = await axios.post(url, null, {
    headers: {
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      Authorization: "Basic " + Buffer.from(`${USER_ID}:${API_KEY}`).toString("base64"),
    },
  });
  return res.data.access_token;
}

async function requestToPay({ referenceId, amount, phone, currency = "XAF", externalId }) {
  const token = await getAccessToken();

  const url = `${BASE_URL}/collection/v1_0/requesttopay`;
  await axios.post(
    url,
    {
      amount: String(amount),
      currency,
      externalId: externalId || referenceId,
      payer: { partyIdType: "MSISDN", partyId: phone },
      payerMessage: "IyomeAfrica Deposit",
      payeeNote: "Wallet funding",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": TARGET_ENV,
        "Ocp-Apim-Subscription-Key": SUB_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return { success: true, referenceId };
}

async function getPaymentStatus(referenceId) {
  const token = await getAccessToken();
  const url = `${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": TARGET_ENV,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
    },
  });

  // res.data example: { amount, currency, financialTransactionId, payer, status: "SUCCESSFUL" / "FAILED" / "PENDING" }
  return res.data;
}

module.exports = { requestToPay, getPaymentStatus };
