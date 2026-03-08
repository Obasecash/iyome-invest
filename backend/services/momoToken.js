const axios = require("axios");

const baseURL =
  process.env.MOMO_ENV === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

async function getToken(userId, apiKey, subKey, type) {
  const auth = Buffer.from(`${userId}:${apiKey}`).toString("base64");

  const res = await axios.post(
    `${baseURL}/${type}/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Ocp-Apim-Subscription-Key": subKey
      }
    }
  );

  return res.data.access_token;
}

module.exports = { getToken, baseURL };
