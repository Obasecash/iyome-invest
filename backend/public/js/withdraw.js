// public/js/withdraw.js

// Helper to get auth token (same style as your other files)
function getAuthToken() {
  return localStorage.getItem("token");
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("withdrawBtn");
  if (!btn) return;

  btn.addEventListener("click", withdrawNow);
});

async function withdrawNow() {
  const amountInput  = document.getElementById("withdrawAmount");
  const methodSelect = document.getElementById("withdrawMethod");
  const noteInput    = document.getElementById("withdrawNote");
  const statusEl     = document.getElementById("withdrawStatus");

  const amount = Number(amountInput.value);
  const method = methodSelect.value;
  const note   = noteInput.value.trim();

  statusEl.style.color = "red";

  if (!amount || amount <= 0) {
    statusEl.textContent = "Please enter a valid amount.";
    return;
  }

  if (!note) {
    statusEl.textContent = "Please enter phone/bank details.";
    return;
  }

  const token = getAuthToken();
  if (!token) {
    alert("You are not logged in. Please login again.");
    window.location.href = "login.html";
    return;
  }

  statusEl.textContent = "Sending withdrawal request...";

  try {
    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        amount,
        method,        // MTN_MOMO / ORANGE_MONEY / BANK_TRANSFER
        note,          // phone or bank details
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      statusEl.style.color = "limegreen";
      statusEl.textContent = "Withdrawal started automatically. You will receive the money soon.";
    } else {
      statusEl.textContent =
        data.message || "Withdrawal failed. Please try again.";
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Network error. Please try again.";
  }
}



function withdraw() {
  fetch("/api/withdrawals/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      amount: document.getElementById("amount").value
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
  });
}
