document.addEventListener("DOMContentLoaded", loadLogs);

async function loadLogs() {
  const logsList = document.getElementById("logsList");
  if (!logsList) return;

  logsList.innerHTML = "Loading logs...";

  try {
    const logs = await adminAuthFetch("/api/admin/logs");

    if (!logs.length) {
      logsList.innerHTML = "<p>No logs found.</p>";
      return;
    }

    logsList.innerHTML = ""; // clear existing text

    logs.forEach(log => {
      const item = document.createElement("div");
      item.style.padding = "10px";
      item.style.marginBottom = "8px";
      item.style.borderBottom = "1px solid #444";

      item.innerHTML = `
        <strong>Action:</strong> ${log.action}<br>
        <strong>Admin:</strong> ${log.adminEmail || "Unknown"}<br>
        <strong>Details:</strong> ${log.details || "-"}<br>
        <strong>Date:</strong> ${new Date(log.createdAt).toLocaleString()}
      `;

      logsList.appendChild(item);
    });

  } catch (err) {
    logsList.innerHTML = `<p style="color:red;">Failed to load logs: ${err.message}</p>`;
  }
}
