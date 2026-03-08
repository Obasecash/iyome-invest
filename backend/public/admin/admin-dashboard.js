// 🔐 Protect dashboard
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "admin-login.html";
}

(function () {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token
  };

  async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
  }

  async function loadDashboard() {
    try {
      // 1) USERS COUNT
      const usersRes = await fetch("/api/users", { headers });
      const usersData = await safeJson(usersRes);
      const usersCount = Array.isArray(usersData) ? usersData.length : (usersData?.count || 0);
      document.getElementById("usersCount").innerText = usersCount;

      // 2) TRANSACTIONS (we count deposits & withdraws from transaction list)
      const txRes = await fetch("/api/transactions", { headers });
      const txData = await safeJson(txRes);
      const txList = Array.isArray(txData) ? txData : (txData?.data || []);

      const deposits = txList.filter(t => t.type === "deposit");
      const withdraws = txList.filter(t => t.type === "withdraw");

      document.getElementById("investmentsCount").innerText = deposits.length;
      document.getElementById("withdrawalsCount").innerText = withdraws.length;

    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard data");
    }
  }

  window.logout = function () {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  };

  loadDashboard();
})();

