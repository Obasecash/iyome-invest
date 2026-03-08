const axios = require("axios");
const { v4: uuid } = require("uuid");
const { getMtnAccessToken } = require("./mtnAuth.js");

async function requestToPay({ amount, phone, reference }) {
  const token = await getMtnAccessToken();
  const referenceId = uuid();

  await axios.post(
    `${process.env.MTN_COLLECTION_BASE_URL}/collection/v1_0/requesttopay`,
    {
      amount,
      currency: "XAF",
      externalId: reference,
      payer: {
        partyIdType: "MSISDN",
        partyId: phone
      },
      payerMessage: "IyomeAfrica Deposit",
      payeeNote: "Wallet funding"
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": process.env.MTN_ENV,
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_COLLECTION_SUBSCRIPTION_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  return referenceId;
}

async function checkPayment(referenceId) {
  const token = await getMtnAccessToken();

  const res = await axios.get(
    `${process.env.MTN_COLLECTION_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": process.env.MTN_ENV,
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_COLLECTION_SUBSCRIPTION_KEY
      }
    }
  );

  return res.data;
}

module.exports = {
  requestToPay,
  checkPayment
};
