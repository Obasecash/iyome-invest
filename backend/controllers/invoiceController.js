const axios = require("axios");

exports.createInvoice = async (req, res) => {
    try {
        const { amount, description } = req.body;

        const response = await axios.post(
            "https://api.payunit.net/api/invoice/create",
            {
                amount: amount,
                description: description,
                transaction_id: "INV-" + Date.now(),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": process.env.PAYUNIT_API_KEY,
                    "X-MERCHANT-ID": process.env.PAYUNIT_MERCHANT_ID,
                    "X-API-SECRET": process.env.PAYUNIT_API_PASSWORD
                }
            }
        );

        return res.json({ invoice: response.data });

    } catch (error) {
        console.error("Invoice error:", error.response?.data || error.message);
        res.status(500).json({ message: "Invoice failed" });
    }
};
