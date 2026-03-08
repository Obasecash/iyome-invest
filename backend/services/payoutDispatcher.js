const { payoutBank, payoutMobileMoney } = require("./flutterwavePayout");
const { payoutPayPal } = require("./paypalPayout");

async function dispatchPayout(withdraw) {
  const amount = Number(withdraw.amount);
  const method = withdraw.method;

  if (method === "paypal") {
    if (!withdraw.paypalEmail) return { success: false, error: "Missing paypalEmail" };
    const r = await payoutPayPal({
      email: withdraw.paypalEmail,
      amount,
      currency: "USD",
      idempotencyKey: `wd_${withdraw._id}`,
    });
    return {
      success: true,
      provider: "paypal",
      providerRef: r?.batch_header?.payout_batch_id || "",
      raw: r,
    };
  }

  // MTN/Orange via Flutterwave route
  if (method === "mtn" || method === "orange") {
    const routeCode = process.env.FLW_MOMO_ROUTE_CODE;
    if (!routeCode) return { success: false, error: "Missing FLW_MOMO_ROUTE_CODE" };
    if (!withdraw.account) return { success: false, error: "Missing phone account" };

    const r = await payoutMobileMoney({
      amount,
      currency: "XAF",
      phone: withdraw.account,
      routeCode,
    });

    return {
      success: true,
      provider: "flutterwave",
      providerRef: r?.data?.id ? String(r.data.id) : "",
      raw: r,
    };
  }

  // Bank transfer via Flutterwave
  if (method === "bank") {
    if (!withdraw.account || !withdraw.bankCode) return { success: false, error: "Missing bank account/bankCode" };

    const r = await payoutBank({
      amount,
      currency: "XAF",
      accountNumber: withdraw.account,
      bankCode: withdraw.bankCode,
      beneficiaryName: withdraw.accountName,
    });

    return {
      success: true,
      provider: "flutterwave",
      providerRef: r?.data?.id ? String(r.data.id) : "",
      raw: r,
    };
  }

  return { success: false, error: "Unsupported method" };
}

module.exports = { dispatchPayout };