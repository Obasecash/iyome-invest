
console.log("Signup JS Loaded");


const form = document.getElementById("signupForm");



if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // VERY IMPORTANT 🔥

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      return alert("Fill all fields");
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      alert("Account created successfully. Login now.");
      window.location.href = "/login.html";

    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}
