async function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No token stored");
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
            ...(options.headers || {})
        }
    });

    const data = await res.json().catch(() => {
        throw new Error("Invalid server JSON response");
    });

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

// ⭐ VERY IMPORTANT ⭐
window.authFetch = authFetch;   // <-- FIX HERE
