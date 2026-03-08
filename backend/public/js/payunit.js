async function payWithPayUnit() {
  const amountEl = document.getElementById("depositAmount");
  const statusEl = document.getElementById("statusMsg");

  const amount = Number(amountEl.value || 0);
  const userId = localStorage.getItem("userId");

  statusEl.style.color = "orange";
  statusEl.textContent = "";

  if (!amount || amount <= 0) {
    statusEl.style.color = "red";
    statusEl.textContent = "Please enter a valid amount.";
    return;
  }

  if (!userId) {
    statusEl.style.color = "red";
    statusEl.textContent = "Please login first.";
    return;
  }

  statusEl.textContent = "Contacting PayUnit...";

  try {
    const res = await fetch("/api/payunit/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        userId,
        description: "IyomeInvest Wallet Deposit",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      statusEl.style.color = "red";
      statusEl.textContent = data.message || "Payment failed.";
      console.error("Init error:", data);
      return;
    }

    // MODE = mock  -> deposit already credited
    if (data.mode === "mock") {
      statusEl.style.color = "#00ff66";
      statusEl.textContent =
        "Deposit successful (mock). New balance: " +
        (data.walletBalance ?? "") +
        " XAF";

      return;
    }

    // MODE = payunit -> redirect to hosted payment_url
    if (data.payment_url) {
      statusEl.style.color = "orange";
      statusEl.textContent = "Redirecting to PayUnit...";
      window.location.href = data.payment_url;
      return;
    }

    statusEl.style.color = "red";
    statusEl.textContent = "Unexpected response from server.";
  } catch (e) {
    console.error(e);
    statusEl.style.color = "red";
    statusEl.textContent = "Network error. Please try again.";
  }
}
