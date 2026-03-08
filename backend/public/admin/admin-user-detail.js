const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

const detailName = document.getElementById("detailName");
const detailEmail = document.getElementById("detailEmail");
const detailWallet = document.getElementById("detailWallet");
const detailStatus = document.getElementById("detailStatus");
const toggleStatusBtn = document.getElementById("toggleStatusBtn");
const creditBtn = document.getElementById("creditBtn");
const debitBtn = document.getElementById("debitBtn");

async function loadUserDetail() {
  if (!userId) return alert("No user id provided in URL");

  try {
    const user = await adminAuthFetch(`/api/admin/users/${userId}`);

    if (detailName) detailName.textContent = user.name || "-";
    if (detailEmail) detailEmail.textContent = user.email || "-";
    if (detailWallet) detailWallet.textContent = (user.walletBalance || 0) + " XAF";
    if (detailStatus) detailStatus.textContent = user.isActive === false ? "Suspended" : "Active";
  } catch (err) {
    alert("Failed to load user: " + err.message);
  }
}

if (toggleStatusBtn) {
  toggleStatusBtn.addEventListener("click", async () => {
    try {
      const res = await adminAuthFetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
      });
      alert(res.message || "Status updated");
      await loadUserDetail();
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  });
}

function getWalletPayload() {
  const amount = Number(document.getElementById("walletAmount").value);
  const note = document.getElementById("walletNote").value.trim();
  if (!amount || amount <= 0) {
    alert("Enter a valid amount");
    return null;
  }
  return { amount, note };
}

if (creditBtn) {
  creditBtn.addEventListener("click", async () => {
    const payload = getWalletPayload();
    if (!payload) return;

    try {
      const res = await adminAuthFetch("/api/admin/wallet/credit", {
        method: "POST",
        body: JSON.stringify({ userId, ...payload }),
      });
      alert(res.message || "Wallet credited");
      await loadUserDetail();
    } catch (err) {
      alert("Failed to credit wallet: " + err.message);
    }
  });
}

if (debitBtn) {
  debitBtn.addEventListener("click", async () => {
    const payload = getWalletPayload();
    if (!payload) return;

    try {
      const res = await adminAuthFetch("/api/admin/wallet/debit", {
        method: "POST",
        body: JSON.stringify({ userId, ...payload }),
      });
      alert(res.message || "Wallet debited");
      await loadUserDetail();
    } catch (err) {
      alert("Failed to debit wallet: " + err.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", loadUserDetail);
