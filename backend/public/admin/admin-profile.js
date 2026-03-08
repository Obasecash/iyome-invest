const updateAdminPasswordBtn = document.getElementById("updateAdminPassword");

if (updateAdminPasswordBtn) {
  updateAdminPasswordBtn.addEventListener("click", async () => {
    const password = document.getElementById("newAdminPassword").value.trim();

    if (!password) return alert("Enter a password");

    const res = await authFetchAdmin("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ password })
    });

    alert(res.message || "Password updated");
  });
}
