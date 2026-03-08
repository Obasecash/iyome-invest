const axios = require("axios");

const BASE_URL =
  process.env.MTN_ENV === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

/* Get Access Token */
async function getMomoToken() {
  const res = await axios.post(
    `${BASE_URL}/collection/token/`,
    {},
    {
      headers: {
        "Ocp-Apim-Subscription-Key":
          process.env.MOMO_COLLECTION_SUB_KEY,
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MOMO_COLLECTION_USER_ID}:${process.env.MOMO_COLLECTION_API_KEY}`
          ).toString("base64"),
      },
    }
  );
  return res.data.access_token;
}

module.exports = { getMomoToken, BASE_URL };
