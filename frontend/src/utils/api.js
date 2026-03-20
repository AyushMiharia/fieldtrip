const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export function getSession() {
  return request("/auth/session");
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(userData) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function updateProfile(data) {
  return request("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getMyStats() {
  return request("/auth/my-stats");
}

// Activities
export function getActivities(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/activities?${query}`);
}

export function getActivity(id) {
  return request(`/activities/${id}`);
}

export function getActivityStats() {
  return request("/activities/stats");
}

export function createActivity(data) {
  return request("/activities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateActivity(id, data) {
  return request(`/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteActivity(id) {
  return request(`/activities/${id}`, { method: "DELETE" });
}

// Trips
export function getTrips(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/trips?${query}`);
}

export function getTrip(id) {
  return request(`/trips/${id}`);
}

export function getTripStats() {
  return request("/trips/stats");
}

export function createTrip(data) {
  return request("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTrip(id, data) {
  return request(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function joinTrip(id) {
  return request(`/trips/${id}/join`, { method: "POST" });
}

export function leaveTrip(id) {
  return request(`/trips/${id}/leave`, { method: "POST" });
}

export function completeTrip(id) {
  return request(`/trips/${id}/complete`, { method: "POST" });
}

export function cancelTrip(id) {
  return request(`/trips/${id}/cancel`, { method: "POST" });
}

export function reviewTrip(id, data) {
  return request(`/trips/${id}/review`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteTrip(id) {
  return request(`/trips/${id}`, { method: "DELETE" });
}

// Admin
export function checkAdmin() {
  return request("/admin/check");
}

export function getAdminActivities(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/activities?${query}`);
}

export function getAdminUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/users?${query}`);
}

export function adminDeleteActivity(id) {
  return request(`/admin/activities/${id}`, { method: "DELETE" });
}

export function adminDeleteUser(id) {
  return request(`/admin/users/${id}`, { method: "DELETE" });
}
