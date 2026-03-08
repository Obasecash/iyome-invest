const Investment = require("../models/Investment");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

function addHours(date, h) {
  return new Date(date.getTime() + h * 60 * 60 * 1000);
}
function addDays(date, d) {
  return new Date(date.getTime() + d * 24 * 60 * 60 * 1000);
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

module.exports = async function runProfitEngine() {
  const now = new Date();

  // ✅ pick all active investments that are due for profit
  const dueInvestments = await Investment.find({
    status: "active",
    nextProfitAt: { $ne: null, $lte: now },
  }).populate("plan");

  for (const inv of dueInvestments) {
    try {
      if (!inv.plan) continue;

      const plan = inv.plan;

      // ✅ if investment expired -> complete it
      if (inv.endDate && now >= inv.endDate) {
        inv.status = "completed";
        inv.nextProfitAt = null;
        await inv.save();
        continue;
      }

      // ✅ calculate profit per interval
      const totalProfitForWholePlan = (inv.amount * plan.roiPercent) / 100;

      let intervals;
      if (plan.profitInterval === "hourly") {
        intervals = plan.durationDays * 24;
      } else {
        intervals = plan.durationDays;
      }

      if (!intervals || intervals <= 0) intervals = plan.durationDays || 1;

      const profitPerInterval = totalProfitForWholePlan / intervals;

      // ✅ idempotency guard (avoid double pay in same minute)
      // If lastProfitAt exists and is too close, skip
      if (inv.lastProfitAt) {
        const diffMs = now.getTime() - new Date(inv.lastProfitAt).getTime();
        if (diffMs < 30 * 1000) continue; // 30 seconds guard
      }

      // ✅ credit user wallet
      const wallet = await Wallet.findOne({ user: inv.user });
      if (!wallet) continue;

      const profit = round2(profitPerInterval);

      wallet.balance += profit;
      await wallet.save();

      inv.totalProfitAccrued += profit;
      inv.totalProfitPaid += profit;
      inv.lastProfitAt = now;

      // ✅ schedule next profit
      if (plan.profitInterval === "hourly") {
        inv.nextProfitAt = addHours(now, 1);
      } else {
        inv.nextProfitAt = addDays(now, 1);
      }

      // ✅ if endDate reached after next schedule, clamp
      if (inv.endDate && inv.nextProfitAt > inv.endDate) {
        inv.nextProfitAt = inv.endDate;
      }

      await inv.save();

      // ✅ ledger transaction
      await Transaction.create({
        user: inv.user,
        type: "profit",
        amount: profit,
        status: "completed",
        reference: String(inv._id),
        description: `ROI Profit credited (${plan.name})`,
      });

      console.log("✅ Profit credited:", inv.user.toString(), profit);
    } catch (e) {
      console.log("Profit engine error:", e.message);
    }
  }
};