document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await adminAuthFetch("/api/admin/plans");
    const list = document.getElementById("plansList");
    list.innerHTML = "";

    res.plans.forEach(p => {
      const div = document.createElement("div");
      div.className = "plan-item";
      div.innerHTML = `
        <p><strong>${p.name}</strong> (${p.code})</p>
        <p>Rate: ${(p.rate * 100).toFixed(2)}%</p>
        <p>Duration: ${p.durationDays} days</p>
        <p>ROI: ${p.roiType} – ${p.compoundingFrequency}</p>
        <p>Status: ${p.isActive ? "Active" : "Inactive"}</p>
        <hr>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    alert("Failed to load plans: " + err.message);
  }
});
