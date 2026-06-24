const BASE_URL = "https://mjengoos.onrender.com/";

function getToken() {
  // Auth.jsx stores tokens as "access"/"refresh"
  // Keep fallback for any legacy data that might still exist.
  return localStorage.getItem("access") || localStorage.getItem("token");
}

// Generic request handler
async function request(endpoint, method = "GET", body = null) {
  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken() ? `Bearer ${getToken()}` : "",
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (res.status === 401) {
    // Only clear auth-related keys to avoid nuking unrelated app state.
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  return res.json();
}

export const api = {
  get: (url) => request(url),
  post: (url, data) => request(url, "POST", data),
  patch: (url, data) => request(url, "PATCH", data),
  delete: (url) => request(url, "DELETE"),
};