const Investment = require("./models/Investment");
const Wallet = require("./models/Wallet");

function startDailyROIJob() {
  setInterval(async () => {
    try {

      const investments = await Investment.find({ status: "active" });

      for (let inv of investments) {

        const today = new Date();
        const last = new Date(inv.lastPaidDate || inv.startDate);

        const diffDays =
          Math.floor((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays >= 1) {

          const profit = (inv.amount * inv.dailyROI) / 100;

          inv.totalEarned += profit;
          inv.lastPaidDate = today;

          await inv.save();

          const wallet = await Wallet.findOne({ user: inv.user });

          if (wallet) {
            wallet.balance += profit;
            await wallet.save();
          }
        }
      }

      console.log("✅ ROI processed");

    } catch (err) {
      console.log("ROI error:", err.message);
    }
  }, 60 * 60 * 1000); // every hour check
}


async function addProfit(userId, amount) {
  const Wallet = require("./models/Wallet");
  const Transaction = require("./models/Transaction");

  await Transaction.create({
    user: userId,
    type: "profit",
    amount,
    status: "success",
    description: "Daily ROI Profit"
  });

  await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount } },
    { upsert: true, new: true }
  );
}
