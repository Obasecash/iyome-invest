const axios = require("axios");

async function getDisburseToken() {
  const res = await axios.post(
    `${process.env.MTN_DISBURSE_URL}/disbursement/token/`,
    {},
    {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MTN_DISBURSE_SUBSCRIPTION_KEY,
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MTN_DISBURSE_USER_ID}:${process.env.MTN_DISBURSE_API_KEY}`
          ).toString("base64"),
      },
    }
  );

  return res.data.access_token;
}

async function sendDisbursement({ amount, phone, reference }) {
  const token = await getDisburseToken();

  const res = await axios.post(
    `${process.env.MTN_DISBURSE_URL}/disbursement/v1_0/transfer`,
    {
      amount: amount.toString(),
      currency: "XAF",
      externalId: reference,
      payee: {
        partyIdType: "MSISDN",
        partyId: phone,
      },
      payerMessage: "Iyome Investment Withdrawal",
      payeeNote: "Withdrawal processed",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_DISBURSE_SUBSCRIPTION_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return res.status === 202;
}

module.exports = { sendDisbursement };
