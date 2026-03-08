const axios = require("axios");

const BASE_URL = process.env.PAYUNIT_BASE_URL;

async function initializePayment(amount, userId, description) {
    try {
        const body = {
            amount: amount,
            currency: "XAF",
            merchant_id: process.env.PAYUNIT_MERCHANT_ID,
            api_key: process.env.PAYUNIT_API_KEY,
            password: process.env.PAYUNIT_API_PASSWORD,
            description,
            return_url: process.env.PAYUNIT_RETURN_URL,
            notify_url: process.env.PAYUNIT_NOTIFY_URL,
        };

        const res = await axios.post(`${BASE_URL}v2/pay`, body);
        return res.data;
    } catch (err) {
        console.log("PayUnit Error:", err.message);
        return null;
    }
}

module.exports = { initializePayment };
