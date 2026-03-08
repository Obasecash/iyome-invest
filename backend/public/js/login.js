// ===============================
// IYOME INVEST - LOGIN SCRIPT
// ===============================

// Wait for page to fully load
const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ SAVE TOKEN
    localStorage.setItem("iyomeToken", data.token);
    localStorage.setItem("iyomeUser", JSON.stringify(data.user));

    // ✅ REDIRECT
    window.location.href = "dashboard.html";

  } catch (err) {
    alert("Server error");
    console.error(err);
  }
});
