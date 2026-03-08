async function payWithMomo() {
  const phone = document.getElementById("phone").value;
  const amount = document.getElementById("amount").value;

  const res = await fetch("/api/momo/requestToPay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount })
  });

  const data = await res.json();
  console.log(data);

  if (data.success) {
    alert("MoMo request sent! Please approve on your phone.");
  } else {
    alert("MoMo error: " + data.error);
  }
}
