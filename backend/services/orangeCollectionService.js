const axios = require("axios");

async function requestOrangePay({ amount, phone, reference }) {
  const res = await axios.post(
    process.env.ORANGE_MONEY_COLLECTION_URL,
    {
      amount,
      phone,
      reference,
      currency: "XAF",
      description: "Iyome Invest Deposit"
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.ORANGE_MONEY_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!res.data || res.data.status !== "PENDING") {
    throw new Error("Orange deposit failed");
  }
}

async function checkOrangeStatus(reference) {
  const res = await axios.get(
    `${process.env.ORANGE_MONEY_COLLECTION_URL}/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ORANGE_MONEY_TOKEN}`
      }
    }
  );

  return res.data;
}

module.exports = { requestOrangePay, checkOrangeStatus };
