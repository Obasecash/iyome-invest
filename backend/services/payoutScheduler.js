const Investment = require("../models/Investment");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

console.log("payoutScheduler.js has loaded...");

async function payoutInvestments() {
    try {
        console.log("Checking investments for payouts...");

        const now = new Date();

        // Find all matured investments
        const matured = await Investment.find({
            status: "active",
            endDate: { $lte: now },
        });

        console.log("Matured investments found:", matured.length);

        for (const inv of matured) {

            // Log each matured investment
            console.log(
                "Matured investment found:",
                inv._id,
                inv.plan,
                inv.expectedReturn
            );

            const user = await User.findById(inv.user);
            if (!user) continue;

            // Credit user wallet
            user.walletBalance += inv.expectedReturn;
            await user.save();

            // Mark investment as completed
            inv.status = "completed";
            await inv.save();

            // Log transaction
            await Transaction.create({
                user: user._id,
                type: "profit",
                amount: inv.expectedReturn,
                method: "auto-payout",
                status: "success",
                description: `Auto payout for ${inv.plan} plan`,
            });

            console.log(`Paid ${inv.expectedReturn} XAF to ${user.email}`);
        }

    } catch (err) {
        console.log("Scheduler error:", err);
    }
}

function startPayoutScheduler() {
    console.log("Payout Scheduler Started...");

    // Run every 30 seconds
    setInterval(payoutInvestments, 30000);
}

module.exports = { startPayoutScheduler };
