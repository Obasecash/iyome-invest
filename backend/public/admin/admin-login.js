document.getElementById("loginBtn").addEventListener("click", loginAdmin);

function loginAdmin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value; // ✅ plain text only

  fetch("http://localhost:10000/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);

    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      window.location.href = "admin-dashboard.html";
    } else {
      alert(data.message);
    }
  });
}

