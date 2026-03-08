const paypal = require("@paypal/payouts-sdk");

function paypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();

  if (!clientId || !secret) throw new Error("Missing PayPal credentials");

  const env =
    mode === "live"
      ? new paypal.core.LiveEnvironment(clientId, secret)
      : new paypal.core.SandboxEnvironment(clientId, secret);

  return new paypal.core.PayPalHttpClient(env);
}

async function payoutPayPal({ email, amount, currency = "USD", idempotencyKey }) {
  const request = new paypal.payouts.PayoutsPostRequest();

  // PayPal supports idempotency via PayPal-Request-Id :contentReference[oaicite:6]{index=6}
  request.headers["PayPal-Request-Id"] = idempotencyKey || `iyome_${Date.now()}`;

  request.requestBody({
    sender_batch_header: {
      sender_batch_id: `iyome_${Date.now()}`,
      email_subject: "Iyome Withdrawal",
    },
    items: [
      {
        recipient_type: "EMAIL",
        receiver: email,
        amount: { value: String(amount), currency },
        note: "Iyome payout",
      },
    ],
  });

  const response = await paypalClient().execute(request);
  return response.result; // includes payout_batch_id
}

module.exports = { payoutPayPal };