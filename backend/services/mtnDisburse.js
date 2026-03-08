const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const getDisbursementToken = require("./mtnDisbursementToken");

async function sendMomoPayout({ amount, phone, reference }) {
  const token = await getDisbursementToken();
  const refId = uuidv4();

  await axios.post(
    `${process.env.MTN_BASE_URL}/disbursement/v1_0/transfer`,
    {
      amount: amount.toString(),
      currency: "XAF",
      externalId: reference,
      payee: {
        partyIdType: "MSISDN",
        partyId: phone,
      },
      payerMessage: "Iyome Withdrawal",
      payeeNote: "Withdrawal successful",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": refId,
        "X-Target-Environment": process.env.MTN_TARGET_ENVIRONMENT,
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return refId;
}

module.exports = sendMomoPayout;
