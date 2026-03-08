// Load numbers for top stats
async function loadOverview() {
  try {
    const data = await adminFetch("/admin/overview");

    document.getElementById("statUsers").textContent = data.totalUsers;
    document.getElementById("statInvested").textContent = "$" + data.totalInvestments;
    document.getElementById("statDeposits").textContent = "$" + data.totalDeposits;
    document.getElementById("statWithdrawals").textContent = "$" + data.totalWithdrawals;
    document.getElementById("statProfits").textContent = "$" + data.totalProfits;
  } catch (err) {
    alert("Failed to load overview: " + err.message);
  }
}

// Simple bar chart using CSS (no external library)
async function loadTxMixChart() {
  try {
    // get all transactions and group in JS
    const txs = await adminFetch("/admin/transactions?type=all");
    const counts = {
      deposit: 0,
      withdrawal: 0,
      investment: 0,
      profit: 0,
      credit: 0,
      debit: 0
    };

    txs.forEach(t => {
      if (counts[t.type] !== undefined) {
        counts[t.type]++;
      }
    });

    const max = Math.max(...Object.values(counts), 1);
    const chart = document.getElementById("txMixChart");
    chart.innerHTML = "";

    Object.entries(counts).forEach(([type, value]) => {
      const height = (value / max) * 100;

      const bar = document.createElement("div");
      bar.className = "chart-bar";

      bar.innerHTML = `
        <div class="chart-bar-inner" style="height:${height}%"></div>
        <div class="chart-bar-label">${type}<br/><span>${value}</span></div>
      `;

      chart.appendChild(bar);
    });
  } catch (err) {
    alert("Failed to load transaction mix: " + err.message);
  }
}

loadOverview();
loadTxMixChart();
