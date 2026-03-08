// MTN MoMo: COLLECTION (deposit) + DISBURSEMENT (withdraw)
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");

// ---------- ENV SETTINGS ----------
const BASE = process.env.MTN_BASE || "https://proxy.momoapi.mtn.com";
const SUB_KEY = process.env.MTN_SUB_KEY;
const API_USER = process.env.MTN_API_USER;
const API_KEY = process.env.MTN_API_KEY;
const TARGET_ENV = process.env.MTN_TARGET_ENV || "sandbox";
const CALLBACK_URL = process.env.MOMO_CALLBACK_URL;

// ---------- TOKEN GENERATOR ----------
async function getAccessToken(path = "collection") {
  const resp = await fetch(`${BASE}/${path}/token/`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${API_USER}:${API_KEY}`).toString("base64"),
      "Ocp-Apim-Subscription-Key": SUB_KEY
    }
  });
  if (!resp.ok) throw new Error(`${path} token failed`);
  const j = await resp.json();
  return j.access_token;
}

// ---------- COLLECTION (customer pays merchant) ----------
async function startCollection({ tx }) {
  const token = await getAccessToken("collection");
  const ref = uuidv4();

  const body = {
    amount: String(tx.amount),
    currency: tx.currency || "XAF",
    externalId: String(tx._id),
    payer: { partyIdType: "MSISDN", partyId: tx.momoNumber },
    payerMessage: "Iyome Invest deposit",
    payeeNote: "Iyome Invest"
  };

  const resp = await fetch(`${BASE}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Reference-Id": ref,
      "X-Target-Environment": TARGET_ENV,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      "X-Callback-Url": CALLBACK_URL,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (![202,200].includes(resp.status)) {
    const errTxt = await resp.text();
    throw new Error("MTN collection failed: " + errTxt);
  }

  tx.providerRef = ref;
  tx.status = "processing";
  await tx.save();

  return {
    message: "MTN MoMo payment request sent — confirm on phone.",
    transactionId: tx._id,
    providerRef: ref
  };
}

// ---------- DISBURSEMENT (merchant pays customer) ----------
async function startPayout({ tx }) {
  const token = await getAccessToken("disbursement");
  const ref = uuidv4();

  const body = {
    amount: String(tx.amount),
    currency: tx.currency || "XAF",
    externalId: String(tx._id),
    payee: { partyIdType: "MSISDN", partyId: tx.momoNumber },
    payerMessage: "Iyome Payout",
    payeeNote: "Iyome Profit"
  };

  const resp = await fetch(`${BASE}/disbursement/v1_0/transfer`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Reference-Id": ref,
      "X-Target-Environment": TARGET_ENV,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      "X-Callback-Url": CALLBACK_URL,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (![202,200].includes(resp.status)) {
    const errTxt = await resp.text();
    throw new Error("MTN disbursement failed: " + errTxt);
  }

  tx.providerRef = ref;
  tx.status = "processing";
  await tx.save();

  return {
    message: "MTN MoMo payout started — check recipient phone.",
    transactionId: tx._id,
    providerRef: ref
  };
}

module.exports = { startCollection, startPayout };
