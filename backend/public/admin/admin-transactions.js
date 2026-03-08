document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.querySelector("#adminTxnTable tbody");

  try {
    const txs = await adminAuthFetch("/api/admin/transactions");

    if (!tbody) return;

    tbody.innerHTML = "";

    txs.forEach((t) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.user?.email || "-"}</td>
        <td>${t.type}</td>
        <td>${t.amount} XAF</td>
        <td>${t.status}</td>
        <td>${new Date(t.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    alert("Failed to load transactions: " + err.message);
  }
});
