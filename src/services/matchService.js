// services/matchService.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = options.headers || {};

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`API error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }

  return res.json().catch(() => null);
}

/* GET /match/ */
export function getMatches(usernameOrRoom) {
  const query = usernameOrRoom
    ? `?username_or_room_name=${encodeURIComponent(usernameOrRoom)}`
    : "";

  return apiFetch(`/match/${query}`, { method: "GET" });
}

/* POST /match/ */
export function createMatch({ room_name, password, is_private }) {
  return apiFetch("/match/", {
    method: "POST",
    body: JSON.stringify({
      room_name,
      password,
      is_private,
    }),
  });
}

/* GET /match/{id}/ */
export function getMatchById(id) {
  return apiFetch(`/match/${id}/`, { method: "GET" });
}

/* GET /match/definitions/ships/ */
export function getShipDefinitions() {
  return apiFetch("/match/definitions/ships/", { method: "GET" });
}

/* POST /match/{id}/place_fleet/ */
export async function placeFleet(matchId, fleet) {
  if (!matchId) throw new Error("placeFleet: matchId required");
  return apiFetch(`/match/${encodeURIComponent(matchId)}/place_fleet/`, {
    method: "POST",
    body: JSON.stringify({ fleet }),
  });
}

/* PUT /match/join/ */
export function joinMatch(matchId) {
  return apiFetch("/match/join/", {
    method: "PUT",
    body: JSON.stringify({ match_id: matchId })
  });
}

/* PATCH /match/{id}/start/ */
export function startMatch(matchId) {
  return apiFetch(`/match/${encodeURIComponent(matchId)}/start/`, {
    method: "PATCH"
  });
}

/* POST /match/{matchId}/shoot/ */
export function shoot(matchId, x, y) {
  return apiFetch(`/match/${encodeURIComponent(matchId)}/shoot/`, {
    method: "POST",
    body: JSON.stringify({
      coord_x: x,
      coord_y: y
    })
  });
}

/* NEW: GET /match/list/all/ */
export function getAllMatches(filters = {}) {
  const params = new URLSearchParams();

  if (filters.match_state) {
    params.append("match_state", filters.match_state);
  }

  if (filters.user_id) {
    params.append("user_id", filters.user_id);
  }

  const queryString = params.toString();
  const url = `/match/list/all/${queryString ? `?${queryString}` : ""}`;

  return apiFetch(url, { method: "GET" });
}

/* PATCH /match/{match_id}/skip_turn/ */
export function skipTurn(matchId) {
  if (!matchId) throw new Error("skipTurn: matchId required");
  return apiFetch(`/match/${encodeURIComponent(matchId)}/skip_turn/`, {
    method: "PATCH"
  });
}


export default {
  getMatches,
  createMatch,
  getMatchById,
  getShipDefinitions,
  placeFleet,
  joinMatch,
  startMatch,
  shoot,
  getAllMatches,
  skipTurn,
};
