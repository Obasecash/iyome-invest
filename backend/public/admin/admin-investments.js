const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "admin-login.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token
};

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin-login.html";
}

async function loadInvestments() {
  try {
    const res = await fetch("/api/investments", { headers });
    const data = await res.json();

    const table = document.getElementById("investmentsTable");
    table.innerHTML = "";

    if (!data || data.length === 0) {
      table.innerHTML = `<tr><td colspan="7">No investments found</td></tr>`;
      return;
    }

    data.forEach(inv => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${inv.userEmail || "-"}</td>
        <td>${inv.plan || "-"}</td>
        <td>$${inv.amount}</td>
        <td>${inv.status}</td>
        <td>$${inv.expectedReturn || 0}</td>
        <td>${new Date(inv.createdAt).toLocaleDateString()}</td>
        <td>
          ${
            inv.status === "active"
              ? `<button onclick="completeInvestment('${inv._id}')">Complete</button>`
              : "Done"
          }
        </td>
      `;

      table.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load investments");
  }
}

async function completeInvestment(id) {
  if (!confirm("Mark this investment as completed?")) return;

  try {
    const res = await fetch(`/api/investments/${id}/complete`, {
      method: "PUT",
      headers
    });

    const data = await res.json();
    alert(data.message || "Investment completed");

    loadInvestments();
  } catch (err) {
    console.error(err);
    alert("Error completing investment");
  }
}

loadInvestments();
