const BASE_URL = "https://mjengoos.onrender.com/";

function getToken() {
  return localStorage.getItem("token");
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
    localStorage.clear();
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