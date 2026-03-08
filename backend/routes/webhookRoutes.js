const router = require("express").Router();
const Withdraw = require("../models/Withdraw");
const PayoutJob = require("../models/PayoutJob");

// Flutterwave webhook
router.post("/flutterwave", async (req, res) => {
  try {
    const hash = req.headers["verif-hash"];
    if (!hash || hash !== process.env.FLW_WEBHOOK_HASH) {
      return res.status(401).send("Unauthorized");
    }

    const event = req.body;

    // Example: transfer.completed / transfer.failed (event structure depends on FLW)
    const providerRef = event?.data?.id ? String(event.data.id) : null;
    const status = event?.data?.status;

    if (providerRef) {
      const withdraw = await Withdraw.findOne({ provider: "flutterwave", providerRef });
      if (withdraw) {
        if (status === "SUCCESSFUL" || status === "successful") {
          withdraw.status = "paid";
          withdraw.paidAt = new Date();
        } else if (status === "FAILED" || status === "failed") {
          withdraw.status = "failed";
          withdraw.failReason = event?.data?.complete_message || "Flutterwave failed";
        }
        await withdraw.save();

        // also update job
        const job = await PayoutJob.findOne({ withdraw: withdraw._id });
        if (job) {
          job.status = withdraw.status === "paid" ? "success" : "failed";
          job.lastError = withdraw.failReason || "";
          await job.save();
        }
      }
    }

    return res.sendStatus(200);
  } catch (e) {
    return res.sendStatus(200);
  }
});

module.exports = router;