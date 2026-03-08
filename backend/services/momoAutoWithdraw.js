const axios = require("axios");
const { getToken, baseURL } = require("./momoToken");

async function sendMomo({ amount, phone, reference }) {
  const token = await getToken(
    process.env.MOMO_DISBURSE_USER_ID,
    process.env.MOMO_DISBURSE_API_KEY,
    process.env.MOMO_DISBURSE_SUB_KEY,
    "disbursement"
  );

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
      payeeNote: "Withdrawal"
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
}

module.exports = { sendMomo };
