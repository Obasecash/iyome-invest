// =====================================
// IYOME INVEST - DASHBOARD.JS
// =====================================

// ✅ Always use ONE token key everywhere
const TOKEN_KEY = "iyomeToken";
const USER_KEY = "iyomeUser";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function requireLogin() {
  alert("Please login first");
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "login.html";
}

// ✅ Helper fetch with token
async function authFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    requireLogin();
    return null;
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: "Bearer " + token,
  };

  const res = await fetch(url, { ...options, headers });

  // if token invalid/expired
  if (res.status === 401) {
    alert("Session expired. Please login again.");
    logout();
    return null;
  }

  return res;
}

// =====================================
// LOAD PROFILE (wallet + user info)
// =====================================
async function loadProfile() {
  const res = await authFetch("/api/investor/me");
  if (!res) return;

  const data = await res.json();

  // ✅ Wallet balance
  const balanceEl = document.getElementById("balance");
  if (balanceEl) balanceEl.innerText = (data.balance ?? data.walletBalance ?? 0);

  // Optional fields (only update if they exist in HTML)
  const userName = document.getElementById("userName");
  if (userName) userName.innerText = data.name || "";

  const userEmail = document.getElementById("userEmail");
  if (userEmail) userEmail.innerText = data.email || "";

  const userPhone = document.getElementById("userPhone");
  if (userPhone) userPhone.innerText = data.mobile || data.phone || "";

  const totalInvested = document.getElementById("totalInvested");
  if (totalInvested) totalInvested.innerText = data.totalInvested || 0;

  const totalWithdrawn = document.getElementById("totalWithdrawn");
  if (totalWithdrawn) totalWithdrawn.innerText = data.totalWithdrawn || 0;
}

// =====================================
// LOAD INVESTMENTS (if table exists)
// =====================================
async function loadInvestments() {
  const res = await authFetch("/api/investor/investments");
  if (!res) return;

  const list = await res.json();

  const tbody = document.getElementById("invTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  (list || []).forEach((inv) => {
    tbody.innerHTML += `
      <tr>
        <td>${inv.amount ?? 0} XAF</td>
        <td>${inv.plan ?? ""}</td>
        <td>${inv.status ?? ""}</td>
        <td>${inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ""}</td>
      </tr>
    `;
  });
}

// =====================================
// MAKE NEW INVESTMENT (if button exists)
// =====================================
const investBtn = document.getElementById("investBtn");
if (investBtn) {
  investBtn.onclick = async () => {
    const amount = Number(document.getElementById("amount")?.value || 0);
    const plan = document.getElementById("plan")?.value || "";
    const msg = document.getElementById("investMessage");

    if (!amount || amount < 1000) {
      if (msg) {
        msg.textContent = "❌ Minimum amount is 1000 XAF";
        msg.style.color = "#f43f5e";
      } else {
        alert("Minimum amount is 1000 XAF");
      }
      return;
    }

    try {
      const res = await authFetch("/api/investor/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, plan }),
      });
      if (!res) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Investment failed");

      if (msg) {
        msg.style.color = "#22c55e";
        msg.textContent = "✅ Investment successful!";
      } else {
        alert("Investment successful!");
      }

      loadProfile();
      loadInvestments();
    } catch (err) {
      if (msg) {
        msg.style.color = "#f43f5e";
        msg.textContent = err.message;
      } else {
        alert(err.message);
      }
    }
  };
}

// =====================================
// CREATE DEPOSIT (your dashboard.html uses createDeposit())
// =====================================
async function createDeposit() {
  const amount = Number(document.getElementById("depositAmount")?.value || 0);

  if (!amount || amount <= 0) {
    alert("Enter amount");
    return;
  }

  try {
    const res = await authFetch("/api/deposit/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Deposit failed");

    alert("✅ Deposit request submitted");
    loadProfile();
  } catch (err) {
    alert(err.message || "Error creating deposit");
  }
}

// =====================================
// OPTIONAL: LOAD WALLET (if you have walletBalance element)
// =====================================
async function loadWallet() {
  const res = await authFetch("/api/wallet");
  if (!res) return;

  const data = await res.json();
  const el = document.getElementById("walletBalance");
  if (el) el.innerText = `${data.balance ?? 0}`;
}

// =====================================
// START
// =====================================
(function start() {
  // if no token -> force login
  if (!getToken()) {
    requireLogin();
    return;
  }

  loadProfile();
  loadInvestments();
  loadWallet();

  // if logout button exists
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.onclick = logout;
})();

