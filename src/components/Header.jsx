import React from "react";

export default function Header({
  activeTab,
  onAddNew,
  currentUser,
  onNavigateHome,
  onLogout
}) {
  const getButtonText = () => {
    if (activeTab === "team") return "New Tour Claim";
    if (activeTab === "single") return "New Claim";
    if (activeTab === "members") return "Add Member";
    return null;
  };

  const buttonText = getButtonText();

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ATS";

  return (
    <header className="app-header">
      <div className="flex items-center gap-4">
        <h1 className="header-title">Corporate Reimbursement Portal</h1>
      </div>

      <div className="header-actions">
        {/* Home / Landing Navigation Button */}
        <button
          type="button"
          className="btn-stitch-secondary"
          style={{ padding: "0.4rem 0.75rem", fontSize: "12px", display: "flex", alignItems: "center", gap: "0.35rem" }}
          onClick={onNavigateHome}
          title="Return to Public Landing Page"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>home</span>
          <span>Home</span>
        </button>

        {buttonText && (
          <button
            type="button"
            className="btn-stitch-primary"
            onClick={onAddNew}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            <span>{buttonText}</span>
          </button>
        )}

        {/* User Profile Pill */}
        {currentUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              background: "var(--surface-container)",
              padding: "0.3rem 0.75rem 0.3rem 0.35rem",
              borderRadius: "9999px",
              border: "1px solid rgba(197, 197, 211, 0.4)"
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700
              }}
            >
              {userInitials}
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.1 }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface)" }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: "10px", color: "var(--on-surface-variant)" }}>
                {currentUser.designation || "Staff"}
              </span>
            </div>
          </div>
        )}

        {/* Log Out Button */}
        <button
          type="button"
          className="action-icon-btn"
          style={{ width: "2rem", height: "2rem" }}
          onClick={onLogout}
          title="Sign out of portal"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--on-surface-variant)" }}>
            logout
          </span>
        </button>
      </div>
    </header>
  );
}
