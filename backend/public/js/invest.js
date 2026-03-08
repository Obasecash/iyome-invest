const investBtn = document.getElementById("investBtn");

if (investBtn) {
  investBtn.addEventListener("click", async () => {
    const amount = Number(document.getElementById("investAmount").value);
    const plan = document.getElementById("investPlan").value;

    if (!amount || amount <= 0) {
      return alert("Enter a valid amount");
    }

    try {
      const res = await authFetch("/api/investments/create", {
        method: "POST",
        body: JSON.stringify({ amount, plan }),
      });

      alert(res.message || "Investment created!");
      window.location.href = "/investor-dashboard.html";
    } catch (err) {
      alert("Investment failed: " + err.message);
    }
  });
}
