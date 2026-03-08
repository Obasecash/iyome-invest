const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Transaction = require("../models/Transaction");
const { getMomoToken, BASE_URL } = require("../services/momoCollectionService");

exports.momoDeposit = async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const userId = req.user.id;

    if (!amount || !phone) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const reference = uuidv4();
    const token = await getMomoToken();

    // Save transaction
    await Transaction.create({
      user: userId,
      type: "deposit",
      method: "momo",
      amount,
      phone,
      reference,
      status: "processing",
    });

    await axios.post(
      `${BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: "XAF",
        externalId: reference,
        payer: {
          partyIdType: "MSISDN",
          partyId: phone,
        },
        payerMessage: "Iyome Invest Deposit",
        payeeNote: "Wallet funding",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": reference,
          "X-Target-Environment": process.env.MOMO_TARGET_ENV,
          "Ocp-Apim-Subscription-Key":
            process.env.MOMO_COLLECTION_SUB_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "MTN MoMo prompt sent. Please approve on your phone.",
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "MoMo deposit failed" });
  }
};
