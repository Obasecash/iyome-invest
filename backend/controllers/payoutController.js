const axios = require("axios");

exports.sendPayout = async (req, res) => {
    try {
        const { amount, phone, description } = req.body;

        const response = await axios.post(
            "https://api.payunit.net/api/disbursement/make",
            {
                amount: amount,
                transaction_id: "WD-" + Date.now(),
                description: description,
                phone_number: phone,
                return_url: process.env.PAYUNIT_DISBURSE_NOTIFY_URL
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": process.env.PAYUNIT_DISBURSE_API_KEY,
                    "X-MERCHANT-ID": process.env.PAYUNIT_DISBURSE_MERCHANT_ID,
                    "X-API-SECRET": process.env.PAYUNIT_DISBURSE_PASSWORD
                }
            }
        );

        if (response.data && response.data.status === "success") {
            return res.json({ message: "Payout initiated", data: response.data });
        } else {
            return res.status(400).json({ message: "Payout failed", data: response.data });
        }

    } catch (error) {
        console.error("PAYUNIT PAYOUT ERROR:", error.response?.data || error.message);
        return res.status(500).json({ error: "Payment failed", details: error.message });
    }
};
