import Withdrawal from "../models/Withdrawal.js";

export async function getUserWithdrawalTotals(userId) {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const daily = await Withdrawal.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startOfDay },
        status: { $ne: "failed" },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const monthly = await Withdrawal.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startOfMonth },
        status: { $ne: "failed" },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    dailyTotal: daily[0]?.total || 0,
    monthlyTotal: monthly[0]?.total || 0,
  };
}
