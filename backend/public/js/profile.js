document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("Login again");

  try {
    const res = await authFetch(`http://localhost:10800/api/users/${userId}`);

    document.getElementById("profileName").value = res.user.name;
    document.getElementById("profileEmail").value = res.user.email;

  } catch (err) {
    alert("Failed to load profile");
  }
});
