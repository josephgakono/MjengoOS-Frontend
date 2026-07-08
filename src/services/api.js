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

  // Success path
  if (res.ok) {
    // Some endpoints might return empty responses.
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  // Error path
  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  const err = new Error(
    data?.message || data?.error || `Request failed with status ${res.status}`
  );
  err.status = res.status;
  err.endpoint = endpoint;
  err.data = data;
  throw err;
}

export const api = {
  get: (url) => request(url),

  post: (url, data) => request(url, "POST", data),

  patch: (url, data) => request(url, "PATCH", data),

  delete: (url) => request(url, "DELETE"),

  upload: async (url, formData, method = "PATCH") => {
    const res = await fetch(BASE_URL + url, {
      method,
      headers: {
        Authorization: getToken()
          ? `Bearer ${getToken()}`
          : "",
      },
      body: formData,
    });

    if (res.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    if (res.ok) {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }

    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    const err = new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`
    );

    err.status = res.status;
    err.endpoint = url;
    err.data = data;

    throw err;
  },
};