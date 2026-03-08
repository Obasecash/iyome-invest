const axios = require("axios");

let cachedToken = null;
let tokenExpiry = 0;

async function getMtnAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await axios.post(
    `${process.env.MTN_COLLECTION_BASE_URL}/collection/token/`,
    {},
    {
      auth: {
        username: process.env.MTN_COLLECTION_USER_ID,
        password: process.env.MTN_COLLECTION_API_KEY
      },
      headers: {
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_COLLECTION_SUBSCRIPTION_KEY
      }
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + res.data.expires_in * 1000;

  return cachedToken;
}

module.exports = { getMtnAccessToken };
