// Shared helper functions for authenticated API calls

// Investor token
function getToken() {
  return localStorage.getItem("iyomeToken");
}

// Admin token
function getAdminToken() {
  return localStorage.getItem("adminToken");
}

// Investor fetch
async function authFetch(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(path, { ...options, headers });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("Invalid JSON from", path, text);
    throw new Error("Server returned invalid response");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Admin fetch
async function adminFetch(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  const token = getAdminToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(path, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("Invalid JSON from", path, text);
    throw new Error("Server returned invalid response");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Investor logout
function logout() {
    localStorage.removeItem("iyomeToken");
    localStorage.removeItem("iyomeUser");
    window.location.href = "index.html";
}

// Admin logout
function adminLogout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin-login.html";
}



