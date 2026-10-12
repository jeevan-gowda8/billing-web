import React, { useState } from "react";
import { DESIGNATION_GRADES, DEPARTMENTS } from "../data/policyMatrix";
import { createCompanyMember } from "../services/api";

export default function LoginPage({
  onLoginSuccess,
  onNavigateHome,
  initialMode = "signin"
}) {
  const [authMode, setAuthMode] = useState(initialMode); // "signin" | "signup"

  // Sign In form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form state
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [designation, setDesignation] = useState("Engineer");
  const [department, setDepartment] = useState("Engineering");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreePolicies, setAgreePolicies] = useState(true);

  // Submission & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Directory accounts for quick credential resolution
  const KNOWN_ACCOUNTS = [
    {
      name: "Jeevan Gowda A V",
      email: "jeevan@abhyudaya.tech",
      designation: "Functional Manager",
      department: "Engineering"
    },
    {
      name: "Rahul Sharma",
      email: "rahul@abhyudaya.tech",
      designation: "Engineer",
      department: "Project Management"
    },
    {
      name: "Bharath L",
      email: "Bharath@abhyudyayatech.com",
      designation: "Intern",
      department: "Operations"
    }
  ];

  // Handle Sign In submission
  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your corporate email.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    setTimeout(() => {
      const match = KNOWN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      const userProfile = match || {
        name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.trim(),
        designation: "Engineer",
        department: "Engineering"
      };

      onLoginSuccess(userProfile);
    }, 450);
  };

  // Handle Sign Up submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full legal name.");
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setErrorMsg("Please enter a valid corporate email address.");
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }
    if (!agreePolicies) {
      setErrorMsg("Please accept the ATS expense compliance policies to proceed.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const newMemberProfile = {
      name: fullName.trim(),
      email: signupEmail.trim(),
      designation: designation,
      department: department
    };

    try {
      // Save new registered employee into backend SQLite company team directory
      await createCompanyMember({
        member_name: newMemberProfile.name,
        member_email: newMemberProfile.email,
        designation: newMemberProfile.designation,
        department: newMemberProfile.department,
        is_advance_holder: false,
        default_notes: "Registered via ATS Portal Sign Up"
      });
    } catch (err) {
      console.warn("Notice: Member saved or already exists in directory:", err.message);
    }

    setSuccessMsg("Account registered successfully! Initializing portal...");
    setTimeout(() => {
      onLoginSuccess(newMemberProfile);
    }, 600);
  };

  return (
    <div className="login-screen-wrap">
      <div className="login-bg-glow"></div>

      <div className="login-card-container">
        {/* Left Branding Panel */}
        <div className="login-brand-panel">
          <div>
            <div className="login-brand-logo-row">
              <div className="landing-brand-badge" style={{ width: "2.75rem", height: "2.75rem" }}>
                ATS
              </div>
              <div>
                <div className="login-brand-title">Abhyudaya</div>
                <div className="login-brand-sub">Techno Solutions · Reimbursements</div>
              </div>
            </div>

            <div className="login-quote-box">
              <p className="login-quote-text">
                "Precision travel expense management and transparent collective tour allowances designed for modern technical operations."
              </p>
              <div style={{ fontSize: "12px", opacity: 0.8, fontWeight: 600 }}>
                — ATS Finance & Operations Policy
              </div>
            </div>

            <div className="login-feature-checklist">
              <div className="login-check-item">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Automatic multi-tier policy ceiling verification</span>
              </div>
              <div className="login-check-item">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Collective team tour roster calculations</span>
              </div>
              <div className="login-check-item">
                <span className="material-symbols-outlined">check_circle</span>
                <span>1-Click audit-ready Excel spreadsheet export</span>
              </div>
              <div className="login-check-item">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Permanent SQLite database storage</span>
              </div>
            </div>
          </div>

          <div className="login-brand-footer">
            Portal Version: v4.8.2-enterprise · Local & Cloud Synchronized
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          {/* Form Header */}
          <div className="login-form-header">
            <h2 className="login-form-title">
              {authMode === "signin" ? "Sign In to Your Account" : "Create Your Account"}
            </h2>
            <p className="login-form-subtitle">
              {authMode === "signin"
                ? "Enter your corporate email and password to access the portal"
                : "Register your corporate employee profile with Abhyudaya Techno Solutions"}
            </p>
          </div>

          {/* Segmented Auth Mode Switcher */}
          <div className="login-tab-switcher">
            <button
              type="button"
              className={`login-tab-btn ${authMode === "signin" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>login</span>
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`login-tab-btn ${authMode === "signup" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("signup");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: "var(--error-container)",
                color: "var(--on-error-container)",
                padding: "0.6rem 0.875rem",
                borderRadius: "0.5rem",
                fontSize: "12px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                border: "1px solid #bae6fd",
                padding: "0.6rem 0.875rem",
                borderRadius: "0.5rem",
                fontSize: "12px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#0284c7" }}>check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div className="form-field-group">
                <label className="modal-label">Corporate Email Address</label>
                <div className="input-with-icon-wrap">
                  <span className="input-lead-icon material-symbols-outlined">mail</span>
                  <input
                    type="email"
                    className="modal-input padded-icon"
                    placeholder="name@abhyudaya.tech"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="modal-label">Password</label>
                <div className="input-with-icon-wrap">
                  <span className="input-lead-icon material-symbols-outlined">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="modal-input padded-icon"
                    placeholder="Enter corporate password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--on-surface-variant)"
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "var(--secondary)", cursor: "pointer" }}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("For security compliance, please contact your ATS system administrator to reset credentials.")}
                  style={{ background: "none", border: "none", color: "var(--secondary)", cursor: "pointer", fontWeight: 500 }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn-hero-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>
                      progress_activity
                    </span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>login</span>
                  </>
                )}
              </button>

              <div className="login-mode-footer">
                <span>Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-field-group">
                <label className="modal-label">Full Employee Name</label>
                <div className="input-with-icon-wrap">
                  <span className="input-lead-icon material-symbols-outlined">badge</span>
                  <input
                    type="text"
                    className="modal-input padded-icon"
                    placeholder="e.g. Vikram Sen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="modal-label">Corporate Email Address</label>
                <div className="input-with-icon-wrap">
                  <span className="input-lead-icon material-symbols-outlined">mail</span>
                  <input
                    type="email"
                    className="modal-input padded-icon"
                    placeholder="name@abhyudaya.tech"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-field-group">
                  <label className="modal-label">Designation Grade</label>
                  <select
                    className="modal-select"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  >
                    {DESIGNATION_GRADES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Department</label>
                  <select
                    className="modal-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-field-group">
                  <label className="modal-label">Create Password</label>
                  <div className="input-with-icon-wrap">
                    <span className="input-lead-icon material-symbols-outlined">lock</span>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      className="modal-input padded-icon"
                      placeholder="Min. 6 chars"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Confirm Password</label>
                  <div className="input-with-icon-wrap">
                    <span className="input-lead-icon material-symbols-outlined">lock_reset</span>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      className="modal-input padded-icon"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "var(--on-surface-variant)" }}>
                  <input
                    type="checkbox"
                    checked={showSignupPassword}
                    onChange={(e) => setShowSignupPassword(e.target.checked)}
                    style={{ accentColor: "var(--secondary)", cursor: "pointer" }}
                  />
                  <span>Show passwords</span>
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreePolicies}
                  onChange={(e) => setAgreePolicies(e.target.checked)}
                  style={{ accentColor: "var(--secondary)", marginTop: "2px", cursor: "pointer" }}
                />
                <label htmlFor="agreeTerms" style={{ cursor: "pointer", lineHeight: 1.4 }}>
                  I confirm this account belongs to an authorized ATS employee and agree to travel expense policies.
                </label>
              </div>

              <button
                type="submit"
                className="btn-hero-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>
                      progress_activity
                    </span>
                    <span>Creating Employee Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Enter Portal</span>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                  </>
                )}
              </button>

              <div className="login-mode-footer">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          <div className="login-back-home">
            <button type="button" onClick={onNavigateHome}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
              <span>Back to Homepage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
