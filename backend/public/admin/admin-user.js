const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const minBalanceInput = document.getElementById("minBalance");
const usersTableBody = document.getElementById("usersTableBody");

let allUsers = [];

async function loadUsers() {
  try {
    const list = await adminAuthFetch("/api/admin/users");
    allUsers = list || [];
    renderUsers();
  } catch (err) {
    alert("Failed to load users: " + err.message);
  }
}

function renderUsers() {
  if (!usersTableBody) return;

  const search = (searchInput?.value || "").toLowerCase();
  const status = statusFilter?.value || "all";
  const minBalance = Number(minBalanceInput?.value || 0);

  usersTableBody.innerHTML = "";

  allUsers
    .filter((u) => {
      if (search && !(`${u.name}`.toLowerCase().includes(search) || `${u.email}`.toLowerCase().includes(search))) {
        return false;
      }
      if (status !== "all") {
        const active = u.isActive !== false;
        if (status === "active" && !active) return false;
        if (status === "suspended" && active) return false;
      }
      if (minBalance > 0 && (u.walletBalance || 0) < minBalance) return false;
      return true;
    })
    .forEach((u) => {
      const activeLabel = u.isActive === false ? "Suspended" : "Active";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.name || "-"}</td>
        <td>${u.email || "-"}</td>
        <td>${u.walletBalance || 0} XAF</td>
        <td>${activeLabel}</td>
        <td>
          <a href="/admin-user-detail.html?id=${u._id}">Open</a>
        </td>
      `;
      usersTableBody.appendChild(row);
    });
}

if (searchInput) searchInput.addEventListener("input", renderUsers);
if (statusFilter) statusFilter.addEventListener("change", renderUsers);
if (minBalanceInput) minBalanceInput.addEventListener("input", renderUsers);

document.addEventListener("DOMContentLoaded", loadUsers);
