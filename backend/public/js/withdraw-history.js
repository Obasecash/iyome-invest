async function loadWithdrawals() {
  const token = localStorage.getItem("token");
  const userRef = localStorage.getItem("userRef");

  const tbody = document.getElementById("history");
  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  try {
    const res = await fetch("/api/withdraw/mine", {
      headers: {
        "Authorization": "Bearer " + token,
        "x-user-ref": userRef
      }
    });

    const data = await res.json();
    tbody.innerHTML = "";

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty">No withdrawals yet</td>
        </tr>`;
      return;
    }

    data.forEach(w => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${w.amount}</td>
        <td>${w.phone}</td>
        <td class="${w.status}">${w.status}</td>
        <td>${new Date(w.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">Failed to load data</td>
      </tr>`;
  }
}

loadWithdrawals();
