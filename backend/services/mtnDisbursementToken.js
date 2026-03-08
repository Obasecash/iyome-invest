const axios = require("axios");

async function getDisbursementToken() {
  const res = await axios.post(
    `${process.env.MTN_BASE_URL}/disbursement/token/`,
    {},
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MTN_DISBURSEMENT_USER_ID}:${process.env.MTN_DISBURSEMENT_API_KEY}`
          ).toString("base64"),
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
      },
    }
  );

  return res.data.access_token;
}

module.exports = getDisbursementToken;
