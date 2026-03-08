const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const baseURL =
  process.env.MOMO_ENV === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

/* GET TOKEN */
async function getToken() {
  const auth = Buffer.from(
    `${process.env.MOMO_DISBURSE_USER_ID}:${process.env.MOMO_DISBURSE_API_KEY}`
  ).toString("base64");

  const res = await axios.post(
    `${baseURL}/disbursement/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Ocp-Apim-Subscription-Key": process.env.MOMO_DISBURSE_SUB_KEY
      }
    }
  );

  return res.data.access_token;
}

/* SEND MONEY */
async function sendMoney({ amount, phone, reference }) {
  const token = await getToken();

  await axios.post(
    `${baseURL}/disbursement/v1_0/transfer`,
    {
      amount: amount.toString(),
      currency: "XAF",
      externalId: reference,
      payee: {
        partyIdType: "MSISDN",
        partyId: phone
      },
      payerMessage: "Iyome Invest Withdrawal",
      payeeNote: "Withdrawal payment"
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": process.env.MOMO_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": process.env.MOMO_DISBURSE_SUB_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  return true;
}

module.exports = { sendMoney };
