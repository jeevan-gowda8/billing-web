// Centralized API Service communicating with the FastAPI + SQLite backend

const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errMsg = errJson.detail || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${options.method || "GET"} ${url}]:`, error);
    throw error;
  }
}

// Single Employee Claims
export const getSingleClaims = () => request("/single-claims");
export const createSingleClaim = (claim) =>
  request("/single-claims", {
    method: "POST",
    body: JSON.stringify(claim)
  });
export const updateSingleClaim = (id, claim) =>
  request(`/single-claims/${id}`, {
    method: "PUT",
    body: JSON.stringify(claim)
  });
export const deleteSingleClaim = (id) =>
  request(`/single-claims/${id}`, {
    method: "DELETE"
  });

// Team Tour Claims
export const getTeamClaims = () => request("/team-claims");
export const createTeamClaim = (tour) =>
  request("/team-claims", {
    method: "POST",
    body: JSON.stringify(tour)
  });
export const updateTeamClaim = (id, tour) =>
  request(`/team-claims/${id}`, {
    method: "PUT",
    body: JSON.stringify(tour)
  });
export const deleteTeamClaim = (id) =>
  request(`/team-claims/${id}`, {
    method: "DELETE"
  });

// Team Roster Breakdown
export const getTeamRoster = (tourClaimRef) => {
  const query = tourClaimRef ? `?tour_claim_ref=${encodeURIComponent(tourClaimRef)}` : "";
  return request(`/team-roster${query}`);
};
export const createRosterMember = (member) =>
  request("/team-roster", {
    method: "POST",
    body: JSON.stringify(member)
  });
export const deleteRosterMember = (id) =>
  request(`/team-roster/${id}`, {
    method: "DELETE"
  });

// Company Team Member Directory
export const getCompanyMembers = () => request("/company-members");
export const createCompanyMember = (member) =>
  request("/company-members", {
    method: "POST",
    body: JSON.stringify(member)
  });
export const updateCompanyMember = (id, member) =>
  request(`/company-members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member)
  });
export const deleteCompanyMember = (id) =>
  request(`/company-members/${id}`, {
    method: "DELETE"
  });

