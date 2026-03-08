async function loadWithdrawals() {
  const res = await fetch("/api/admin/withdrawals/pending");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = "<tr><td colspan='5'>No pending withdrawals</td></tr>";
    return;
  }

  data.forEach(w => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${w.userRef}</td>
      <td>${w.amount}</td>
      <td>${w.phone}</td>
      <td>${w.status}</td>
      <td>
        <button class="approve" onclick="approve('${w._id}')">Approve</button>
        <button class="reject" onclick="reject('${w._id}')">Reject</button>
      </td>
    `;
    list.appendChild(tr);
  });
}

async function approve(id) {
  if (!confirm("Confirm payout completed?")) return;
  await fetch(`/api/admin/withdrawals/approve/${id}`, { method: "POST" });
  loadWithdrawals();
}

async function reject(id) {
  if (!confirm("Reject and refund wallet?")) return;
  await fetch(`/api/admin/withdrawals/reject/${id}`, { method: "POST" });
  loadWithdrawals();
}

loadWithdrawals();
