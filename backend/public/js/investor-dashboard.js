document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Please login again");

    // 1. Fetch user info
    const userData = await authFetch(`/api/users/${userId}`);
    const user = userData.user || userData; // works whether backend returns {user: {...}} or just {...}

    document.getElementById("userName").innerText = user.name;
    document.getElementById("walletBalance").innerText = user.walletBalance || 0;
    document.getElementById("referralCode").innerText =
      user.referralCode || "Not set";
    document.getElementById("referralBonus").innerText =
      user.referralBonusBalance || 0;

    // 2. Fetch transactions
    const transData = await authFetch("/api/transactions/my");
    const list = document.getElementById("recentTransactions");
    list.innerHTML = "";

    if (!transData.transactions || transData.transactions.length === 0) {
      list.innerHTML = "<p>No transactions yet</p>";
    } else {
      transData.transactions.forEach((t) => {
        const item = document.createElement("div");
        item.className = "transaction-item";
        item.innerHTML = `
          <p><strong>Type:</strong> ${t.type}</p>
          <p><strong>Amount:</strong> ${t.amount} XAF</p>
          <p><strong>Date:</strong> ${new Date(t.createdAt).toLocaleString()}</p>
          <hr>
        `;
        list.appendChild(item);
      });
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Failed to load dashboard: " + err.message);
  }
});


