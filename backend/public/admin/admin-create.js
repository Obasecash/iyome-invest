function createAdmin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch("http://localhost:10000/api/admin/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    msg.innerText = data.message;
    msg.style.color = data.message.includes("success") ? "green" : "red";
  })
  .catch(() => {
    msg.innerText = "Server error";
    msg.style.color = "red";
  });
}
