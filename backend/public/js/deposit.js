console.log("deposit.js loaded");

const payBtn = document.getElementById("payBtn");

payBtn.addEventListener("click", async () => {
  alert("Deposit button clicked ✅");

  const amount = document.getElementById("amount").value;
  const phone = document.getElementById("phone").value;
  const reference = document.getElementById("reference").value;

  if (!amount || !phone || !reference) {
    return alert("Fill all fields");
  }

  const res = await fetch("/api/momo/deposit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ amount, phone, reference })
  });

  const data = await res.json();
  alert(data.message || "Request sent");

  if (data.referenceId) {
    document.getElementById("momoInfo").style.display = "block";
    document.getElementById("refText").innerText = data.referenceId;
    startCheckingPayment(data.referenceId);
  }
});
