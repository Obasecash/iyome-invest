import axios from "axios";

export async function getDisbursementToken() {
  const res = await axios.post(
    `${process.env.MTN_BASE_URL}/disbursement/token/`,
    {},
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MTN_DISBURSEMENT_API_USER}:${process.env.MTN_DISBURSEMENT_API_KEY}`
          ).toString("base64"),
        "Ocp-Apim-Subscription-Key":
          process.env.MTN_DISBURSEMENT_SUBSCRIPTION_KEY,
      },
    }
  );

  return res.data.access_token;
}
