// Reusable helper for calling admin APIs with the admin token
async function adminAuthFetch(url, options = {}) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("You must login as admin again");
  }

  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    ...options,
  };

  // If body is an object, stringify it
  if (opts.body && typeof opts.body !== "string") {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // ignore parse error for empty body
  }

  if (!res.ok) {
    const msg = data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
