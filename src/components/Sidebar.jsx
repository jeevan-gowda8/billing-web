import React from "react";

export default function Sidebar({ activeTab, setActiveTab, memberCount }) {
  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-badge">ATS</div>
        <div>
          <div className="sidebar-brand-title">Abhyudaya</div>
          <div className="sidebar-brand-sub">Techno Solutions</div>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="sidebar-status-box">
        <div className="status-pill">
          <span className="status-dot"></span>
          <span className="text-label-md" style={{ color: "var(--on-surface)" }}>
            Portal Active · Secure
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === "single" ? "active" : ""}`}
          onClick={() => setActiveTab("single")}
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span>Single Employee Claims</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === "team" ? "active" : ""}`}
          onClick={() => setActiveTab("team")}
        >
          <span className="material-symbols-outlined">groups</span>
          <span>Team / Group Tour Claims</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <span className="material-symbols-outlined">badge</span>
          <span>Team Members Directory</span>
          {memberCount !== undefined && memberCount > 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                fontWeight: 600,
                padding: "1px 7px",
                borderRadius: "10px",
                backgroundColor: activeTab === "members" ? "rgba(255, 255, 255, 0.25)" : "var(--surface-container-high)",
                color: activeTab === "members" ? "#ffffff" : "var(--on-surface-variant)"
              }}
            >
              {memberCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === "policy" ? "active" : ""}`}
          onClick={() => setActiveTab("policy")}
        >
          <span className="material-symbols-outlined">calculate</span>
          <span>Policy Rate Matrix & Calc</span>
        </button>
      </nav>

      {/* Footer Version */}
      <div className="sidebar-footer">
        <div>v4.8.2-enterprise</div>
      </div>
    </aside>
  );
}
