// src/services/apiFetch.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

/**
 * Wrapper padrão de requisições autenticadas ao backend.
 * Sempre retorna JSON se possível, mesmo em erros.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = options.headers || {};

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  const text = await res.text().catch(() => "");
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  if (!res.ok) {
    const err = new Error(
      `API error ${res.status}${json ? `: ${JSON.stringify(json)}` : ""}`
    );
    err.status = res.status;
    throw err;
  }

  return json;
}

export default apiFetch;
