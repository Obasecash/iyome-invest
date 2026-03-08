const token = localStorage.getItem("adminToken");

function headers() {
  return {
    Authorization: "Bearer " + token
  };
}

function renderTable(cols, rows) {
  thead.innerHTML = `<tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr>`;
  tbody.innerHTML = rows.join("");
}

/* USERS */
function loadUsers() {
  fetch("/api/admin/users", { headers: headers() })
    .then(res => res.json())
    .then(data => {
      renderTable(
        ["Email", "Created"],
        data.map(u =>
          `<tr><td>${u.email}</td><td>${new Date(u.createdAt).toLocaleString()}</td></tr>`
        )
      );
    });
}

/* WALLETS */
function loadWallets() {
  fetch("/api/admin/wallets", { headers: headers() })
    .then(res => res.json())
    .then(data => {
      renderTable(
        ["Email", "Balance"],
        data.map(w =>
          `<tr><td>${w.email}</td><td>${(w.balance/100).toFixed(2)}</td></tr>`
        )
      );
    });
}

/* INVESTMENTS */
function loadInvestments() {
  fetch("/api/admin/investments", { headers: headers() })
    .then(res => res.json())
    .then(data => {
      renderTable(
        ["Email", "Plan", "Amount", "Profit", "Status"],
        data.map(i =>
          `<tr>
            <td>${i.email}</td>
            <td>${i.planName}</td>
            <td>${(i.amount/100).toFixed(2)}</td>
            <td>${(i.totalProfit/100).toFixed(2)}</td>
            <td>${i.status}</td>
          </tr>`
        )
      );
    });
}

/* WITHDRAWALS */
function loadWithdrawals() {
  fetch("/api/admin/withdrawals", { headers: headers() })
    .then(res => res.json())
    .then(data => {
      renderTable(
        ["User", "Phone", "Amount", "Status"],
        data.map(w =>
          `<tr>
            <td>${w.user}</td>
            <td>${w.phone}</td>
            <td>${(w.amount/100).toFixed(2)}</td>
            <td>${w.status}</td>
          </tr>`
        )
      );
    });
}
