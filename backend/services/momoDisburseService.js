const axios = require("axios");

async function getDisburseToken() {
  const res = await axios.post(
    `${process.env.MTN_DISBURSE_URL}/disbursement/token/`,
    {},
    {
      auth: {
        username: process.env.MTN_DISBURSE_USER_ID,
        password: process.env.MTN_DISBURSE_API_KEY
      },
      headers: {
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_DISBURSE_SUBSCRIPTION_KEY
      }
    }
  );
  return res.data.access_token;
}

async function sendDisbursement({ amount, phone, reference }) {
  const token = await getDisburseToken();

  await axios.post(
    `${process.env.MTN_DISBURSE_URL}/disbursement/v1_0/transfer`,
    {
      amount: amount.toString(),
      currency: "XAF",
      externalId: reference,
      payee: {
        partyIdType: "MSISDN",
        partyId: phone
      },
      payerMessage: "Iyome Withdrawal",
      payeeNote: "Wallet withdrawal"
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": "sandbox",
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_DISBURSE_SUBSCRIPTION_KEY
      }
    }
  );
}

module.exports = { sendDisbursement };
