const paypal = require("@paypal/payouts-sdk");

function client() {
  return new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  );
}

async function sendPayPal(email, amount) {

  const request = new paypal.payouts.PayoutsPostRequest();

  request.requestBody({
    sender_batch_header: {
      sender_batch_id: Date.now().toString(),
      email_subject: "Iyome Withdrawal"
    },
    items: [{
      recipient_type: "EMAIL",
      amount: {
        value: amount,
        currency: "USD"
      },
      receiver: email,
      note: "Iyome payout"
    }]
  });

  const response = await client().execute(request);
  return response;
}

module.exports = { sendPayPal };