const PayoutJob = require("../models/PayoutJob");
const Withdraw = require("../models/Withdraw");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { sendPayout } = require("../services/payoutService");
const { dispatchPayout } = require("../services/payoutDispatcher");

module.exports = async function payoutWorker() {
  // Pick 1 queued job (safe single worker style)
  const job = await PayoutJob.findOneAndUpdate(
    { status: "queued", attempts: { $lt: 5 } },
    { status: "processing" },
    { sort: { createdAt: 1 }, new: true }
  );

  if (!job) return;

  const withdraw = await Withdraw.findById(job.withdraw);
  if (!withdraw) {
    job.status = "failed";
    job.lastError = "Withdraw not found";
    await job.save();
    return;
  }

  // ✅ idempotency: if already paid, stop
  if (withdraw.status === "paid") {
    job.status = "success";
    await job.save();
    return;
  }

  // Only process approved withdraws
  if (withdraw.status !== "approved") {
    job.status = "queued";
    await job.save();
    return;
  }

  // mark withdraw processing
  withdraw.status = "processing";
  await withdraw.save();

  try {
    job.attempts += 1;
    await job.save();

    const result = await sendPayout(withdraw);

    if (!result.success) {
      throw new Error(result.error || "Payout failed");
    }

    // ✅ success: release locked balance
    const wallet = await Wallet.findOne({ user: withdraw.user });
    if (wallet) {
      wallet.lockedBalance = Number(wallet.lockedBalance || 0) - Number(withdraw.amount || 0);
      if (wallet.lockedBalance < 0) wallet.lockedBalance = 0;
      await wallet.save();
    }

    withdraw.status = "paid";
    withdraw.paidAt = new Date();
    withdraw.provider = result.provider || "";
    withdraw.providerRef = result.providerRef || "";
    withdraw.failReason = "";
    await withdraw.save();

    await Transaction.create({
      user: withdraw.user,
      type: "withdraw_approved",
      amount: withdraw.amount,
      status: "completed",
      reference: String(withdraw._id),
      description: `Withdraw paid via ${withdraw.provider} ref=${withdraw.providerRef}`,
    });

    job.status = "success";
    job.provider = withdraw.provider;
    job.providerRef = withdraw.providerRef;
    job.lastError = "";
    await job.save();
  } catch (err) {
    withdraw.status = "approved"; // back to approved so worker can retry
    withdraw.failReason = err.message;
    await withdraw.save();

    job.lastError = err.message;

    if (job.attempts >= job.maxAttempts) {
      job.status = "failed";
      // You can decide: keep withdraw approved, or mark failed:
      withdraw.status = "failed";
      await withdraw.save();
    } else {
      job.status = "queued"; // retry later
    }

    await job.save();
  }
};


const result = await dispatchPayout(withdraw);

if (!result.success) throw new Error(result.error || "Payout failed");

withdraw.provider = result.provider;
withdraw.providerRef = result.providerRef;