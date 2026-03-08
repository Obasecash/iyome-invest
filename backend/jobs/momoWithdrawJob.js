const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { checkTransfer } = require("../services/mtnDisburse");

async function processPendingWithdrawals() {
  try {
    const pending = await Transaction.find({
      type: "withdraw",
      method: "momo",
      status: "processing"
    });

    if (!pending.length) {
      return;
    }

    console.log(`🔄 Checking ${pending.length} pending withdrawals`);

    for (const tx of pending) {
      try {
        const statusData = await checkTransfer(tx.reference);
        const mtnStatus = String(statusData.status || "").toUpperCase();

        if (mtnStatus === "SUCCESSFUL") {
          tx.status = "completed";
          tx.raw = statusData;
          await tx.save();

          console.log(`✅ Withdrawal completed: ${tx.reference}`);
        }

        if (mtnStatus === "FAILED") {
          // refund wallet
          const user = await User.findById(tx.user);
          if (user) {
            user.walletBalance =
              Number(user.walletBalance || 0) + Number(tx.amount);
            await user.save();
          }

          tx.status = "failed";
          tx.raw = statusData;
          await tx.save();

          console.log(`❌ Withdrawal failed & refunded: ${tx.reference}`);
        }

      } catch (innerErr) {
        console.error(
          `⚠️ Error checking withdrawal ${tx.reference}:`,
          innerErr?.response?.data || innerErr.message
        );
      }
    }

  } catch (err) {
    console.error("❌ Withdrawal scheduler error:", err.message);
  }
}

module.exports = processPendingWithdrawals;
