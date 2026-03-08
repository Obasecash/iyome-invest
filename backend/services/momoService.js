const axios = require("axios");

const BASE_URL = process.env.MTN_BASE_URL;

async function getMomoToken() {
  const res = await axios.post(
    `${BASE_URL}/collection/token/`,
    {},
    {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY,
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MTN_USER_ID}:${process.env.MTN_API_KEY}`
          ).toString("base64")
      }
    }
  );

  return res.data.access_token;
}

async function requestPayment({ amount, phone, reference }) {
  const token = await getMomoToken();

  await axios.post(
    `${BASE_URL}/collection/v1_0/requesttopay`,
    {
      amount: amount.toString(),
      currency: "XAF",
      externalId: reference,
      payer: {
        partyIdType: "MSISDN",
        partyId: phone
      },
      payerMessage: "Iyome Invest deposit",
      payeeNote: "Wallet funding"
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": process.env.MTN_ENV,
        "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY,
        "Content-Type": "application/json"
      }
    }
  );
}

module.exports = { requestPayment };
