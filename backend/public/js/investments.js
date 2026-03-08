document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await authFetch("/api/investments/my");

    document.getElementById("totalInvested").innerText = res.totalInvested;
    document.getElementById("totalProfit").innerText = res.totalProfit;

    const list = document.getElementById("investmentsList");
    list.innerHTML = "";

    if (res.investments.length === 0) {
      list.innerHTML = "<p>No investments yet.</p>";
      return;
    }

    res.investments.forEach(inv => {
      const item = document.createElement("div");
      item.className = "investment-item";

      const remaining = new Date(inv.endDate) - new Date();
      const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

      item.innerHTML = `
        <p><strong>Plan:</strong> ${inv.plan}</p>
        <p><strong>Amount:</strong> ${inv.amount} XAF</p>
        <p><strong>Expected Return:</strong> ${inv.expectedReturn} XAF</p>
        <p><strong>Status:</strong> ${inv.status}</p>
        <p><strong>Maturity:</strong> ${new Date(inv.endDate).toLocaleString()}</p>
        <p><strong>Days Remaining:</strong> 
          ${inv.status === "completed" ? "Completed" : daysLeft + " days"}
        </p>
        <hr>
      `;

      list.appendChild(item);
    });

  } catch (err) {
    alert("Failed to load investments: " + err.message);
  }
});



const email = "iyomeafrica@gmail.com";

fetch(`/api/investments/${email}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("list").innerHTML = data.map(inv => `
      <div>
        <strong>${inv.planName}</strong><br>
        Invested: $${(inv.amount/100).toFixed(2)}<br>
        Profit: $${(inv.totalProfit/100).toFixed(2)}<br>
        Days: ${inv.daysCompleted}/${inv.durationDays}<br>
        Status: ${inv.status}
      </div><hr>
    `).join("");
  });
