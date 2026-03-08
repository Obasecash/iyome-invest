const axios = require("axios");

async function sendOrangeMoney({ amount, phone, reference }) {
  const res = await axios.post(
    process.env.ORANGE_MONEY_API_URL,
    {
      amount,
      phone,
      reference,
      currency: "XAF",
      description: "Iyome Invest Withdrawal"
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.ORANGE_MONEY_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!res.data || res.data.status !== "SUCCESS") {
    throw new Error("Orange Money transfer failed");
  }

  return res.data;
}

module.exports = { sendOrangeMoney };
