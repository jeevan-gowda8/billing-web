import React from "react";
import heroBanner from "../assets/hero-banner.jpg";

export default function LandingPage({ onNavigateLogin, onNavigateDashboard, currentUser }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-shell">
      {/* Top Navbar */}
      <nav className="landing-navbar">
        <div className="landing-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="landing-brand-badge">ATS</div>
          <div>
            <div className="landing-brand-title">Abhyudaya</div>
            <div className="landing-brand-sub">Techno Solutions · Reimbursements</div>
          </div>
        </div>

        <div className="landing-nav-links">
          <button type="button" className="landing-nav-link" onClick={() => scrollToSection("features")}>
            Features
          </button>
          <button type="button" className="landing-nav-link" onClick={() => scrollToSection("workflow")}>
            How It Works
          </button>
          <button type="button" className="landing-nav-link" onClick={() => scrollToSection("security")}>
            Security
          </button>
        </div>

        <div className="landing-nav-actions">
          {currentUser ? (
            <button
              type="button"
              className="btn-hero-primary"
              style={{ padding: "0.6rem 1.25rem", fontSize: "13.5px" }}
              onClick={onNavigateDashboard}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>dashboard</span>
              <span>Open Portal ({currentUser.name?.split(" ")[0]})</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-hero-secondary"
                style={{ padding: "0.55rem 1.15rem", fontSize: "13.5px" }}
                onClick={() => onNavigateLogin("signin")}
              >
                Log In
              </button>
              <button
                type="button"
                className="btn-hero-primary"
                style={{ padding: "0.55rem 1.25rem", fontSize: "13.5px" }}
                onClick={() => onNavigateLogin("signup")}
              >
                <span>Sign Up</span>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-badge-pill">
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--secondary)" }}>
            verified_user
          </span>
          <span>Official Corporate Reimbursement & Team Tour Platform</span>
        </div>

        <h1 className="landing-hero-title">
          Next-Gen Reimbursements & <br />
          <span className="gradient-text">Team Tour Expense Governance</span>
        </h1>

        <p className="landing-hero-desc">
          Engineered for Abhyudaya Techno Solutions field teams and executives. Manage individual claims, multi-member project tour rosters, automated handbook policy calculations, and export finance-ready Excel workbooks with a single click.
        </p>

        <div className="landing-hero-ctas">
          <button
            type="button"
            className="btn-hero-primary"
            onClick={currentUser ? onNavigateDashboard : () => onNavigateLogin("signin")}
          >
            <span className="material-symbols-outlined">rocket_launch</span>
            <span>{currentUser ? "Continue to Dashboard" : "Launch ATS Portal"}</span>
          </button>

          {!currentUser && (
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => onNavigateLogin("signup")}
            >
              <span className="material-symbols-outlined">person_add</span>
              <span>Create Account (Sign Up)</span>
            </button>
          )}

          <button
            type="button"
            className="btn-stitch-secondary"
            style={{ padding: "0.875rem 1.25rem", borderRadius: "0.75rem", fontSize: "14px" }}
            onClick={() => scrollToSection("features")}
          >
            <span className="material-symbols-outlined">visibility</span>
            <span>Explore Platform Features</span>
          </button>
        </div>

        {/* 3D Glassmorphic Hero Showcase */}
        <div className="landing-showcase-wrap">
          <div className="landing-showcase-glow"></div>
          <div className="landing-showcase-frame">
            <img
              src={heroBanner}
              alt="Abhyudaya Techno Solutions Reimbursement Portal Analytics"
              className="landing-showcase-img"
            />
            {/* Overlay Floating Stats Bar */}
            <div className="landing-floating-stats">
              <div className="floating-stat-item">
                <div className="floating-stat-icon">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div>
                  <div className="floating-stat-val">Multi-Staff</div>
                  <div className="floating-stat-lbl">Collective Tour Rostering</div>
                </div>
              </div>

              <div className="floating-stat-item">
                <div className="floating-stat-icon">
                  <span className="material-symbols-outlined">rule</span>
                </div>
                <div>
                  <div className="floating-stat-val">100% Policy Cap</div>
                  <div className="floating-stat-lbl">Tier 1-3 Rate Matrix</div>
                </div>
              </div>

              <div className="floating-stat-item">
                <div className="floating-stat-icon">
                  <span className="material-symbols-outlined">table_view</span>
                </div>
                <div>
                  <div className="floating-stat-val">1-Click .XLSX</div>
                  <div className="floating-stat-lbl">Corporate Template Export</div>
                </div>
              </div>

              <div className="floating-stat-item">
                <div className="floating-stat-icon">
                  <span className="material-symbols-outlined">database</span>
                </div>
                <div>
                  <div className="floating-stat-val">SQLite Engine</div>
                  <div className="floating-stat-lbl">Zero-Data-Loss Storage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Feature Grid Section */}
      <section id="features" className="landing-section">
        <div className="section-header-center">
          <div className="section-eyebrow">Enterprise Features</div>
          <h2 className="section-title">Built Specially for ATS Corporate Operations</h2>
          <p className="section-subtitle">
            From single-day client visits to multi-week engineering plant commissioning tours, ATS Reimbursement Portal automates the entire expense lifecycle.
          </p>
        </div>

        <div className="features-grid-landing">
          {/* Card 1 */}
          <div className="feature-card-landing">
            <div className="feature-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>receipt_long</span>
            </div>
            <h3 className="feature-card-title">Single Employee Reimbursements</h3>
            <p className="feature-card-desc">
              Submit individual claims with auto-sequenced serial numbers, receipt attachments, vendor details, and UPI payment tagging for direct disbursement.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card-landing">
            <div className="feature-icon-circle" style={{ background: "#dbeafe", color: "#1e40af" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>groups</span>
            </div>
            <h3 className="feature-card-title">Team / Group Tour Management</h3>
            <p className="feature-card-desc">
              Manage multi-colleague tours under an Advance Holder. Select engineers, technicians, and interns with automatic individual rate limit aggregation.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card-landing">
            <div className="feature-icon-circle" style={{ background: "#d1e7dd", color: "#0f5132" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>table_view</span>
            </div>
            <h3 className="feature-card-title">One-Click Excel (.xlsx) Export</h3>
            <p className="feature-card-desc">
              Export pixel-perfect Excel spreadsheets matching official corporate templates, complete with dynamic formulas and multi-sheet roster breakdowns.
            </p>
          </div>

          {/* Card 4 */}
          <div className="feature-card-landing">
            <div className="feature-icon-circle" style={{ background: "#fef3c7", color: "#92400e" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>document_scanner</span>
            </div>
            <h3 className="feature-card-title">AI Receipt OCR Scanner</h3>
            <p className="feature-card-desc">
              Upload invoices and bills to extract dates, hotel names, tax amounts, and bill numbers automatically, eliminating manual entry mistakes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="feature-card-landing">
            <div className="feature-icon-circle" style={{ background: "#ede9fe", color: "#5b21b6" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>badge</span>
            </div>
            <h3 className="feature-card-title">Centralized Team Directory</h3>
            <p className="feature-card-desc">
              Maintain an active staff directory of engineers, technicians, and managers. Add, edit, or remove colleagues with instant sync across tour claims.
            </p>
          </div>

          {/* Card 6 */}
          <div className="feature-card-landing">
            <div className="feature-icon-circle" style={{ background: "#fee2e2", color: "#991b1b" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>shield</span>
            </div>
            <h3 className="feature-card-title">SQLite Audit-Proof Persistence</h3>
            <p className="feature-card-desc">
              Backed by high-speed SQLite database with foreign-key cascade deletes, ACID compliance, and instant local zero-latency queries.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section id="workflow" className="landing-section" style={{ background: "var(--surface-container-low)" }}>
        <div className="section-header-center">
          <div className="section-eyebrow">Frictionless Workflow</div>
          <h2 className="section-title">From Expense to Disbursement in 3 Steps</h2>
          <p className="section-subtitle">
            Engineered to minimize administrative overhead for site engineers while providing total financial visibility for accounts.
          </p>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <div className="step-number-badge">STEP 1</div>
            <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>post_add</span>
            </div>
            <h4 className="step-card-title">Create Single or Group Claim</h4>
            <p className="step-card-desc">
              Enter expense details or use the AI Scanner to read physical bills. Select location tier and designation for instant policy lookup.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="step-number-badge">STEP 2</div>
            <div style={{ color: "var(--secondary)", marginBottom: "0.75rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>group_add</span>
            </div>
            <h4 className="step-card-title">Add Colleagues & Verify Caps</h4>
            <p className="step-card-desc">
              For group tours, pick staff from the directory. The portal calculates collective allowable limits and flags over-budget bills in real time.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="step-number-badge">STEP 3</div>
            <div style={{ color: "#004a32", marginBottom: "0.75rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>download_for_offline</span>
            </div>
            <h4 className="step-card-title">Instant Excel (.xlsx) Download</h4>
            <p className="step-card-desc">
              Click Export to generate corporate workbooks with formulas and roster sheets ready for finance signoff and bank disbursement.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Governance Section */}
      <section id="security" className="landing-section">
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--outline-variant)",
            borderRadius: "1.25rem",
            padding: "3rem",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "2.5rem",
            alignItems: "center"
          }}
        >
          <div>
            <div className="section-eyebrow">Enterprise Governance</div>
            <h2 className="section-title" style={{ fontSize: "30px", marginBottom: "1rem" }}>
              Compliant, Secure, & Built for High Precision
            </h2>
            <p style={{ color: "var(--on-surface-variant)", lineHeight: "1.6", marginBottom: "1.5rem" }}>
              ATS Reimbursement Portal guarantees that every rupee filed conforms strictly to official company travel handbooks. Foreign keys prevent orphan records, and local persistence ensures records never vanish.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px" }}>
                <span className="material-symbols-outlined" style={{ color: "#0f5132" }}>check_circle</span>
                <span>Automatic multi-tier hotel and food per-diem validation</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px" }}>
                <span className="material-symbols-outlined" style={{ color: "#0f5132" }}>check_circle</span>
                <span>Cascade deletion safeguards between tour claims and roster members</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px" }}>
                <span className="material-symbols-outlined" style={{ color: "#0f5132" }}>check_circle</span>
                <span>Instant Excel generation matching accounts audit requirements</span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "var(--surface-container)",
              borderRadius: "1rem",
              padding: "2rem",
              border: "1px solid rgba(197, 197, 211, 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="sidebar-brand-badge" style={{ width: "2rem", height: "2rem", fontSize: "12px" }}>ATS</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>Abhyudaya Techno Solutions</div>
                <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>Internal Enterprise System</div>
              </div>
            </div>

            <div style={{ height: "1px", background: "rgba(0,0,0,0.08)", margin: "0.25rem 0" }}></div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>System Version</span>
              <span style={{ fontWeight: 600, fontFamily: "monospace" }}>v4.8.2-enterprise</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Database Engine</span>
              <span style={{ fontWeight: 600 }}>SQLite 3.x (ACID Compliant)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>API Framework</span>
              <span style={{ fontWeight: 600 }}>FastAPI + Uvicorn ASGI</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Excel Engine</span>
              <span style={{ fontWeight: 600 }}>ExcelJS Standardized Styler</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="landing-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="landing-cta-banner">
          <h2 className="cta-banner-title">Ready to Streamline Your Project Expenses?</h2>
          <p className="cta-banner-desc">
            Sign in to access your claims history, submit new travel reimbursements, or download approved audit workbooks.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-hero-secondary"
              style={{ background: "#ffffff", color: "var(--primary)", borderColor: "#ffffff" }}
              onClick={currentUser ? onNavigateDashboard : () => onNavigateLogin("signin")}
            >
              <span className="material-symbols-outlined">login</span>
              <span>{currentUser ? "Open Portal Dashboard" : "Sign In to Portal"}</span>
            </button>
            {!currentUser && (
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => onNavigateLogin("signup")}
              >
                <span className="material-symbols-outlined">person_add</span>
                <span>Sign Up Free</span>
              </button>
            )}
            <button
              type="button"
              className="btn-stitch-secondary"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                padding: "0.875rem 1.5rem",
                borderRadius: "0.75rem",
                fontSize: "14px"
              }}
              onClick={() => scrollToSection("features")}
            >
              <span>Explore Platform Features</span>
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="landing-brand-badge" style={{ width: "2rem", height: "2rem", fontSize: "13px" }}>ATS</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--primary)" }}>
                Abhyudaya Techno Solutions Private Limited
              </div>
              <div className="landing-footer-sub">
                Corporate Engineering Services & Field Travel Reimbursement System
              </div>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
            © {new Date().getFullYear()} Abhyudaya Techno Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
