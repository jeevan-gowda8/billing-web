// Centralized API Service communicating with the FastAPI + SQLite backend,
// with resilient LocalStorage fallback for static hosting (e.g. GitHub Pages).

import {
  SAMPLE_SINGLE_CLAIMS,
  SAMPLE_TEAM_CLAIMS,
  SAMPLE_TEAM_ROSTER,
  SAMPLE_COMPANY_MEMBERS
} from "../data/sampleData";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// --- LocalStorage Fallback Layer for Static Hosting (GitHub Pages) ---
const STORAGE_KEYS = {
  SINGLE_CLAIMS: "ats_db_single_claims",
  TEAM_CLAIMS: "ats_db_team_claims",
  TEAM_ROSTER: "ats_db_team_roster",
  COMPANY_MEMBERS: "ats_db_company_members"
};

function getLocalStore(key, initialData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
}

function setLocalStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("LocalStorage quota or access error:", e);
  }
}

let isBackendOffline = false;

async function request(endpoint, options = {}) {
  // If we already detected the backend is offline on static hosting, fail fast
  if (isBackendOffline && !import.meta.env.VITE_API_BASE) {
    throw new Error("Backend offline - using local storage");
  }

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
    // Flag offline if 404 / connection failure
    if (!import.meta.env.VITE_API_BASE) {
      isBackendOffline = true;
    }
    console.info(`API request [${options.method || "GET"} ${url}] unreachable. Falling back to local store.`);
    throw error;
  }
}

// ==========================================
// Single Employee Claims
// ==========================================
export const getSingleClaims = async () => {
  try {
    return await request("/single-claims");
  } catch (_) {
    return getLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, SAMPLE_SINGLE_CLAIMS);
  }
};

export const createSingleClaim = async (claim) => {
  try {
    return await request("/single-claims", {
      method: "POST",
      body: JSON.stringify(claim)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, SAMPLE_SINGLE_CLAIMS);
    const newClaim = {
      ...claim,
      id: claim.id || Date.now(),
      slNo: list.length + 1
    };
    const updated = [...list, newClaim];
    setLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, updated);
    return newClaim;
  }
};

export const updateSingleClaim = async (id, claim) => {
  try {
    return await request(`/single-claims/${id}`, {
      method: "PUT",
      body: JSON.stringify(claim)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, SAMPLE_SINGLE_CLAIMS);
    const updated = list.map((c) => (String(c.id) === String(id) ? { ...c, ...claim, id } : c));
    setLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, updated);
    return { ...claim, id };
  }
};

export const deleteSingleClaim = async (id) => {
  try {
    return await request(`/single-claims/${id}`, {
      method: "DELETE"
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, SAMPLE_SINGLE_CLAIMS);
    const filtered = list.filter((c) => String(c.id) !== String(id));
    setLocalStore(STORAGE_KEYS.SINGLE_CLAIMS, filtered);
    return { status: "deleted" };
  }
};

// ==========================================
// Team Tour Claims
// ==========================================
export const getTeamClaims = async () => {
  try {
    return await request("/team-claims");
  } catch (_) {
    return getLocalStore(STORAGE_KEYS.TEAM_CLAIMS, SAMPLE_TEAM_CLAIMS);
  }
};

export const createTeamClaim = async (tour) => {
  try {
    return await request("/team-claims", {
      method: "POST",
      body: JSON.stringify(tour)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.TEAM_CLAIMS, SAMPLE_TEAM_CLAIMS);
    const teamSize = tour.selectedMembers ? tour.selectedMembers.length : 1;
    const coveredMembers = tour.selectedMembers
      ? tour.selectedMembers.map((m) => m.memberName || m.member_name).join(", ")
      : tour.advanceHolderName;
    const newTour = {
      ...tour,
      id: tour.id || Date.now(),
      teamSize,
      coveredMembers
    };
    const updated = [...list, newTour];
    setLocalStore(STORAGE_KEYS.TEAM_CLAIMS, updated);

    // Also auto-add members to team roster if present
    if (tour.selectedMembers && tour.selectedMembers.length > 0) {
      const roster = getLocalStore(STORAGE_KEYS.TEAM_ROSTER, SAMPLE_TEAM_ROSTER);
      const newRosterItems = tour.selectedMembers.map((m, idx) => ({
        id: Date.now() + idx,
        tourClaimRef: tour.tourClaimRef,
        memberName: m.memberName || m.member_name,
        memberEmail: m.memberEmail || m.member_email,
        designation: m.designation,
        department: m.department || "Operations",
        isAdvanceHolder: m.isAdvanceHolder ? "Yes" : "No",
        dailyRate: Number(m.dailyRate) || 0,
        memberNotes: m.defaultNotes || ""
      }));
      setLocalStore(STORAGE_KEYS.TEAM_ROSTER, [...roster, ...newRosterItems]);
    }

    return newTour;
  }
};

export const updateTeamClaim = async (id, tour) => {
  try {
    return await request(`/team-claims/${id}`, {
      method: "PUT",
      body: JSON.stringify(tour)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.TEAM_CLAIMS, SAMPLE_TEAM_CLAIMS);
    const updated = list.map((t) => (String(t.id) === String(id) ? { ...t, ...tour, id } : t));
    setLocalStore(STORAGE_KEYS.TEAM_CLAIMS, updated);
    return { ...tour, id };
  }
};

export const deleteTeamClaim = async (id) => {
  try {
    return await request(`/team-claims/${id}`, {
      method: "DELETE"
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.TEAM_CLAIMS, SAMPLE_TEAM_CLAIMS);
    const target = list.find((t) => String(t.id) === String(id));
    const filtered = list.filter((t) => String(t.id) !== String(id));
    setLocalStore(STORAGE_KEYS.TEAM_CLAIMS, filtered);

    // Delete associated roster members
    if (target && target.tourClaimRef) {
      const roster = getLocalStore(STORAGE_KEYS.TEAM_ROSTER, SAMPLE_TEAM_ROSTER);
      setLocalStore(
        STORAGE_KEYS.TEAM_ROSTER,
        roster.filter((r) => r.tourClaimRef !== target.tourClaimRef)
      );
    }
    return { status: "deleted" };
  }
};

// ==========================================
// Team Roster Breakdown
// ==========================================
export const getTeamRoster = async (tourClaimRef) => {
  try {
    const query = tourClaimRef ? `?tour_claim_ref=${encodeURIComponent(tourClaimRef)}` : "";
    return await request(`/team-roster${query}`);
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.TEAM_ROSTER, SAMPLE_TEAM_ROSTER);
    if (tourClaimRef) {
      return list.filter((r) => r.tourClaimRef === tourClaimRef);
    }
    return list;
  }
};

export const createRosterMember = async (member) => {
  try {
    return await request("/team-roster", {
      method: "POST",
      body: JSON.stringify(member)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.TEAM_ROSTER, SAMPLE_TEAM_ROSTER);
    const newMember = {
      ...member,
      id: member.id || Date.now()
    };
    setLocalStore(STORAGE_KEYS.TEAM_ROSTER, [...list, newMember]);
    return newMember;
  }
};

export const deleteRosterMember = async (id) => {
  try {
    return await request(`/team-roster/${id}`, {
      method: "DELETE"
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.TEAM_ROSTER, SAMPLE_TEAM_ROSTER);
    const filtered = list.filter((r) => String(r.id) !== String(id));
    setLocalStore(STORAGE_KEYS.TEAM_ROSTER, filtered);
    return { status: "deleted" };
  }
};

// ==========================================
// Company Team Member Directory
// ==========================================
export const getCompanyMembers = async () => {
  try {
    return await request("/company-members");
  } catch (_) {
    return getLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, SAMPLE_COMPANY_MEMBERS);
  }
};

export const createCompanyMember = async (member) => {
  try {
    return await request("/company-members", {
      method: "POST",
      body: JSON.stringify(member)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, SAMPLE_COMPANY_MEMBERS);
    const memberName = member.memberName || member.member_name || "";
    const memberEmail = member.memberEmail || member.member_email || "";
    const defaultNotes = member.defaultNotes || member.default_notes || "";
    const isAdvanceHolder = member.isAdvanceHolder || member.is_advance_holder ? "Yes" : "No";

    const newMember = {
      id: member.id || Date.now(),
      memberName,
      memberEmail,
      designation: member.designation,
      department: member.department || "Operations",
      isAdvanceHolder,
      defaultNotes
    };
    setLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, [...list, newMember]);
    return newMember;
  }
};

export const updateCompanyMember = async (id, member) => {
  try {
    return await request(`/company-members/${id}`, {
      method: "PUT",
      body: JSON.stringify(member)
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, SAMPLE_COMPANY_MEMBERS);
    const updated = list.map((m) => (String(m.id) === String(id) ? { ...m, ...member, id } : m));
    setLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, updated);
    return { ...member, id };
  }
};

export const deleteCompanyMember = async (id) => {
  try {
    return await request(`/company-members/${id}`, {
      method: "DELETE"
    });
  } catch (_) {
    const list = getLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, SAMPLE_COMPANY_MEMBERS);
    const filtered = list.filter((m) => String(m.id) !== String(id));
    setLocalStore(STORAGE_KEYS.COMPANY_MEMBERS, filtered);
    return { status: "deleted" };
  }
};
