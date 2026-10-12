import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import SpendingTrendsAndAudit from "./components/SpendingTrendsAndAudit";
import MetricsBar from "./components/MetricsBar";
import SingleClaimTable from "./components/SingleClaimTable";
import SingleClaimFormModal from "./components/SingleClaimFormModal";
import TeamClaimTable from "./components/TeamClaimTable";
import TeamClaimFormModal from "./components/TeamClaimFormModal";
import TeamRosterModal from "./components/TeamRosterModal";
import AiScannerModal from "./components/AiScannerModal";
import PolicyMatrixView from "./components/PolicyMatrixView";
import MembersDirectoryView from "./components/MembersDirectoryView";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Footer from "./components/Footer";

import {
  getSingleClaims,
  createSingleClaim,
  updateSingleClaim,
  deleteSingleClaim,
  getTeamClaims,
  createTeamClaim,
  updateTeamClaim,
  deleteTeamClaim,
  getTeamRoster,
  createRosterMember,
  deleteRosterMember,
  getCompanyMembers,
  createCompanyMember,
  updateCompanyMember,
  deleteCompanyMember
} from "./services/api";

import {
  generateSingleEmployeeExcel,
  generateTeamTourExcel
} from "./utils/excelGenerator";

export default function App() {
  // Screen navigation: "landing" | "login" | "dashboard"
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem("ats_screen") || "landing";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("ats_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("single"); // "single" | "team" | "members" | "policy"

  // Empty initial state - loaded from SQLite backend
  const [singleClaims, setSingleClaims] = useState([]);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [editingSingleClaim, setEditingSingleClaim] = useState(null);
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);

  const [teamClaims, setTeamClaims] = useState([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamClaim, setEditingTeamClaim] = useState(null);

  const [rosterRows, setRosterRows] = useState([]);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedTourRefForRoster, setSelectedTourRefForRoster] = useState(null);

  // Company Team Members Directory
  const [companyMembers, setCompanyMembers] = useState([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all data from SQLite backend on mount
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [sc, tc, rm, cm] = await Promise.all([
        getSingleClaims(),
        getTeamClaims(),
        getTeamRoster(),
        getCompanyMembers()
      ]);
      setSingleClaims(sc || []);
      setTeamClaims(tc || []);
      setRosterRows(rm || []);
      setCompanyMembers(cm || []);
    } catch (err) {
      console.warn("Backend connection issue:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Single Employee Handlers ---
  const handleSaveSingleClaim = async (claimData) => {
    try {
      if (editingSingleClaim) {
        const updated = await updateSingleClaim(editingSingleClaim.id, claimData);
        setSingleClaims((prev) =>
          prev.map((c) => (c.id === editingSingleClaim.id ? updated : c))
        );
        showToast("Claim updated and saved to SQLite database!");
      } else {
        const created = await createSingleClaim(claimData);
        setSingleClaims((prev) => [...prev, created]);
        showToast("New claim saved to SQLite database!");
      }
    } catch (err) {
      alert("Failed to save claim to database: " + err.message);
    }
    setEditingSingleClaim(null);
  };

  const handleDeleteSingleClaim = async (id) => {
    if (window.confirm("Are you sure you want to delete this claim?")) {
      try {
        await deleteSingleClaim(id);
        setSingleClaims((prev) => prev.filter((c) => c.id !== id));
        showToast("Claim deleted from SQLite database.");
      } catch (err) {
        alert("Failed to delete claim: " + err.message);
      }
    }
  };

  const handleAiExtracted = (extractedData) => {
    setEditingSingleClaim({
      employeeName: "",
      employeeEmail: "",
      designation: "Engineer",
      department: "Core R&D",
      expenseDate: extractedData.expenseDate || new Date().toISOString().split("T")[0],
      category: extractedData.category || "Hotel",
      cityTier: extractedData.cityTier || "Metro",
      duration: extractedData.duration || 1,
      vendorName: extractedData.vendorName || "",
      billNumber: extractedData.billNumber || "",
      claimAmount: extractedData.claimAmount || 0,
      whoPaid: extractedData.whoPaid || "Paid by Employee",
      upiId: "",
      projectName: extractedData.projectName || "",
      remarks: extractedData.remarks || ""
    });
    setIsSingleModalOpen(true);
    showToast("Receipt parsed by AI! Review and submit to save.");
  };

  // --- Team Tour Handlers ---
  const handleSaveTeamClaim = async (claimData) => {
    try {
      if (editingTeamClaim) {
        await updateTeamClaim(editingTeamClaim.id, claimData);
        showToast("Tour claim and roster updated in SQLite database!");
      } else {
        await createTeamClaim(claimData);
        showToast("Tour claim and team roster saved to SQLite database!");
      }

      // Re-fetch tour claims, roster, and company members to ensure synchrony
      const [updatedTc, updatedRoster, updatedCm] = await Promise.all([
        getTeamClaims(),
        getTeamRoster(),
        getCompanyMembers()
      ]);
      setTeamClaims(updatedTc);
      setRosterRows(updatedRoster);
      setCompanyMembers(updatedCm);
    } catch (err) {
      alert("Failed to save tour claim: " + err.message);
    }
    setEditingTeamClaim(null);
  };

  const handleDeleteTeamClaim = async (id) => {
    if (window.confirm("Delete this tour claim and all associated roster members?")) {
      try {
        await deleteTeamClaim(id);
        const tour = teamClaims.find((tc) => tc.id === id);
        if (tour) {
          setRosterRows((prev) => prev.filter((r) => r.tourClaimRef !== tour.tourClaimRef));
        }
        setTeamClaims((prev) => prev.filter((tc) => tc.id !== id));
        showToast("Tour claim and roster deleted from SQLite database.");
      } catch (err) {
        alert("Failed to delete tour claim: " + err.message);
      }
    }
  };

  // --- Roster Handlers ---
  const handleAddRosterMember = async (newMember) => {
    try {
      const created = await createRosterMember(newMember);
      setRosterRows((prev) => [...prev, created]);
      // Refresh team claims so teamSize and coveredMembers recalculate dynamically
      const updatedTc = await getTeamClaims();
      setTeamClaims(updatedTc);
      showToast(`Added ${created.memberName} to roster!`);
    } catch (err) {
      alert("Failed to add colleague to roster: " + err.message);
    }
  };

  const handleDeleteRosterMember = async (id) => {
    try {
      await deleteRosterMember(id);
      setRosterRows((prev) => prev.filter((r) => r.id !== id));
      const updatedTc = await getTeamClaims();
      setTeamClaims(updatedTc);
      showToast("Colleague removed from roster.");
    } catch (err) {
      alert("Failed to remove colleague: " + err.message);
    }
  };

  const handleOpenRosterManager = (tourRef = null) => {
    setSelectedTourRefForRoster(tourRef || teamClaims[0]?.tourClaimRef || "");
    setIsRosterModalOpen(true);
  };

  // --- Company Team Members Handlers ---
  const handleAddCompanyMember = async (memberData) => {
    try {
      const created = await createCompanyMember(memberData);
      setCompanyMembers((prev) => [...prev, created]);
      showToast(`Added ${created.memberName} to team directory!`);
      return created;
    } catch (err) {
      alert("Failed to add colleague: " + err.message);
      throw err;
    }
  };

  const handleUpdateCompanyMember = async (id, memberData) => {
    try {
      const updated = await updateCompanyMember(id, memberData);
      setCompanyMembers((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );
      showToast(`Updated details for ${updated.memberName}!`);
      return updated;
    } catch (err) {
      alert("Failed to update colleague: " + err.message);
      throw err;
    }
  };

  const handleDeleteCompanyMember = async (id) => {
    try {
      await deleteCompanyMember(id);
      setCompanyMembers((prev) => prev.filter((m) => m.id !== id));
      showToast("Colleague removed from team directory.");
    } catch (err) {
      alert("Failed to remove colleague: " + err.message);
    }
  };

  // --- Excel Export Handlers ---
  const handleExportSingleExcel = async () => {
    if (singleClaims.length === 0) {
      alert("Please add at least one claim before exporting to Excel.");
      return;
    }
    try {
      setIsExporting(true);
      await generateSingleEmployeeExcel(singleClaims);
      showToast("Single Employee Reimbursement Excel exported successfully!");
    } catch (err) {
      console.error(err);
      alert("Error exporting Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTeamExcel = async () => {
    if (teamClaims.length === 0) {
      alert("Please add at least one team tour claim before exporting to Excel.");
      return;
    }
    try {
      setIsExporting(true);
      await generateTeamTourExcel(teamClaims, rosterRows);
      showToast("Team Tour Reimbursement Excel exported successfully!");
    } catch (err) {
      console.error(err);
      alert("Error exporting Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddNewContextual = () => {
    if (activeTab === "single") {
      setEditingSingleClaim(null);
      setIsSingleModalOpen(true);
    } else if (activeTab === "team") {
      setEditingTeamClaim(null);
      setIsTeamModalOpen(true);
    } else if (activeTab === "members") {
      setIsAddMemberModalOpen(true);
    }
  };

  const [loginInitialMode, setLoginInitialMode] = useState("signin");

  const handleLoginSuccess = (userProfile) => {
    setCurrentUser(userProfile);
    localStorage.setItem("ats_user", JSON.stringify(userProfile));
    setCurrentScreen("dashboard");
    localStorage.setItem("ats_screen", "dashboard");
    refreshData();
    showToast(`Welcome back, ${userProfile.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ats_user");
    setCurrentScreen("landing");
    localStorage.setItem("ats_screen", "landing");
    showToast("Signed out of portal.");
  };

  const handleNavigateHome = () => {
    setCurrentScreen("landing");
    localStorage.setItem("ats_screen", "landing");
  };

  const handleNavigateLogin = (mode = "signin") => {
    setLoginInitialMode(mode);
    setCurrentScreen("login");
    localStorage.setItem("ats_screen", "login");
  };

  const handleNavigateDashboard = () => {
    setCurrentScreen("dashboard");
    localStorage.setItem("ats_screen", "dashboard");
  };

  if (currentScreen === "landing") {
    return (
      <>
        <LandingPage
          onNavigateLogin={handleNavigateLogin}
          onNavigateDashboard={handleNavigateDashboard}
          currentUser={currentUser}
        />
        {toastMessage && (
          <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200 }}>
            <div style={{ background: "#ffffff", borderLeft: "4px solid var(--primary)", boxShadow: "var(--shadow-lg)", padding: "0.75rem 1.25rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", fontWeight: 500 }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "18px" }}>info</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentScreen === "login") {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={handleNavigateHome}
          initialMode={loginInitialMode}
        />
        {toastMessage && (
          <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200 }}>
            <div style={{ background: "#ffffff", borderLeft: "4px solid var(--primary)", boxShadow: "var(--shadow-lg)", padding: "0.75rem 1.25rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", fontWeight: 500 }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "18px" }}>info</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-shell">
      {/* Left Fixed Sidebar matching Stitch UI */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberCount={companyMembers.length}
      />

      {/* Main Content Wrap */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          onAddNew={handleAddNewContextual}
          currentUser={currentUser}
          onNavigateHome={handleNavigateHome}
          onLogout={handleLogout}
        />

        {/* Main Dashboard Area */}
        <main className="app-main">
          {/* Top Spending Trends & Policy Audit Center Cards matching UI 2 */}
          {activeTab === "single" && (
            <SpendingTrendsAndAudit claims={singleClaims} isTeam={false} />
          )}
          {activeTab === "team" && (
            <SpendingTrendsAndAudit claims={teamClaims} isTeam={true} />
          )}

          {/* 4 Top Metric Cards */}
          {activeTab === "single" && (
            <MetricsBar claims={singleClaims} isTeam={false} />
          )}
          {activeTab === "team" && (
            <MetricsBar claims={teamClaims} isTeam={true} />
          )}

          {/* Active View */}
          {activeTab === "single" && (
            <SingleClaimTable
              claims={singleClaims}
              onAddNew={() => {
                setEditingSingleClaim(null);
                setIsSingleModalOpen(true);
              }}
              onAiScan={() => setIsAiScannerOpen(true)}
              onEdit={(claim) => {
                setEditingSingleClaim(claim);
                setIsSingleModalOpen(true);
              }}
              onDelete={handleDeleteSingleClaim}
              onExportExcel={handleExportSingleExcel}
              isExporting={isExporting}
            />
          )}

          {activeTab === "team" && (
            <TeamClaimTable
              tourClaims={teamClaims}
              rosterRows={rosterRows}
              onAddNewTour={() => {
                setEditingTeamClaim(null);
                setIsTeamModalOpen(true);
              }}
              onEditTour={(tour) => {
                setEditingTeamClaim(tour);
                setIsTeamModalOpen(true);
              }}
              onDeleteTour={handleDeleteTeamClaim}
              onOpenRosterManager={handleOpenRosterManager}
              onExportExcel={handleExportTeamExcel}
              isExporting={isExporting}
            />
          )}

          {activeTab === "members" && (
            <MembersDirectoryView
              members={companyMembers}
              onAddMember={handleAddCompanyMember}
              onUpdateMember={handleUpdateCompanyMember}
              onDeleteMember={handleDeleteCompanyMember}
              isAddModalOpen={isAddMemberModalOpen}
              setIsAddModalOpen={setIsAddMemberModalOpen}
            />
          )}

          {activeTab === "policy" && <PolicyMatrixView />}
        </main>

        {/* Bottom Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <SingleClaimFormModal
        isOpen={isSingleModalOpen}
        onClose={() => {
          setIsSingleModalOpen(false);
          setEditingSingleClaim(null);
        }}
        onSave={handleSaveSingleClaim}
        initialData={editingSingleClaim}
        nextSlNo={singleClaims.length + 1}
      />

      <TeamClaimFormModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setEditingTeamClaim(null);
        }}
        onSave={handleSaveTeamClaim}
        initialData={editingTeamClaim}
        nextTourRef={`TOUR-${String(teamClaims.length + 1).padStart(3, "0")}`}
        existingRosterRows={rosterRows}
        companyMembers={companyMembers}
      />

      <TeamRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        tourClaims={teamClaims}
        selectedTourRef={selectedTourRefForRoster}
        rosterRows={rosterRows}
        onAddRosterMember={handleAddRosterMember}
        onDeleteRosterMember={handleDeleteRosterMember}
      />

      {/* AI Receipt OCR Scanner Modal matching UI 2 */}
      <AiScannerModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        onExtracted={handleAiExtracted}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100 }}>
          <div style={{ background: "#ffffff", borderLeft: "4px solid var(--primary)", boxShadow: "var(--shadow-lg)", padding: "0.75rem 1.25rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "18px" }}>info</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
