import React from "react";
import { FileSpreadsheet, Users, User, BookOpen, Download, RotateCcw, Sparkles } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  singleClaimsCount,
  teamClaimsCount,
  onDownload,
  onLoadSample,
  onClear,
  isDownloading
}) {
  return (
    <header className="top-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo-badge">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 className="brand-title">ABHYUDAYA TECHNO SOLUTIONS</h1>
            <p className="brand-subtitle">Reimbursement Claims & Excel Generator Portal</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="nav-tabs" aria-label="Portal Navigation">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "single" ? "active" : ""}`}
            onClick={() => setActiveTab("single")}
          >
            <User size={16} />
            <span>Single Employee</span>
            {singleClaimsCount > 0 && (
              <span className="nav-tab-badge">{singleClaimsCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            <Users size={16} />
            <span>Team / Group Tour</span>
            {teamClaimsCount > 0 && (
              <span className="nav-tab-badge">{teamClaimsCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "policy" ? "active" : ""}`}
            onClick={() => setActiveTab("policy")}
          >
            <BookOpen size={16} />
            <span>ATS Policy Matrix</span>
          </button>
        </nav>

        {/* Global Actions */}
        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onLoadSample}
            title="Pre-fill form with authentic sample data"
          >
            <Sparkles size={15} />
            <span>Load Sample Data</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClear}
            title="Clear all claims"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onDownload}
            disabled={isDownloading}
          >
            <Download size={16} />
            <span>{isDownloading ? "Generating Excel..." : "Download Excel (.xlsx)"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
