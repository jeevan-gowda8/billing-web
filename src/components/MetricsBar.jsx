import React from "react";
import { evaluateClaimPolicy } from "../data/policyMatrix";

export default function MetricsBar({ claims = [], isTeam = false }) {
  const totalCount = claims.length;

  // Total claimed amount
  const totalAmount = claims.reduce((sum, c) => {
    const val = isTeam ? Number(c.totalBillAmount) : Number(c.claimAmount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Policy compliant calculation
  let compliantCount = 0;
  let exceedsCount = 0;

  if (isTeam) {
    // For team claims, evaluate bill against any limit
    compliantCount = totalCount;
  } else {
    claims.forEach((c) => {
      const audit = evaluateClaimPolicy(c.designation, c.cityTier, c.category, c.duration, c.claimAmount);
      if (audit.status === "exceeds") {
        exceedsCount++;
      } else {
        compliantCount++;
      }
    });
  }

  const compliancePercentage = totalCount === 0 ? "100%" : `${Math.round((compliantCount / totalCount) * 100)}%`;

  return (
    <div className="metrics-grid">
      {/* 1. Total Claims */}
      <div className="metric-card">
        <div>
          <div className="metric-label">
            {isTeam ? "Total Tour Claims" : "Total Claims"}
          </div>
          <div className="metric-value">{totalCount}</div>
        </div>
        <div className="metric-icon-box metric-icon-blue">
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            receipt_long
          </span>
        </div>
      </div>

      {/* 2. Total Claimed */}
      <div className="metric-card">
        <div>
          <div className="metric-label">Total Claimed</div>
          <div className="metric-value" style={{ color: "var(--primary)" }}>
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="metric-icon-box metric-icon-cyan">
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            payments
          </span>
        </div>
      </div>

      {/* 3. Policy Compliant */}
      <div className="metric-card">
        <div>
          <div className="metric-label">Policy Compliant</div>
          <div className="metric-value" style={{ color: "var(--tertiary-container)" }}>
            {compliancePercentage}
          </div>
        </div>
        <div className="metric-icon-box metric-icon-green">
          <span className="material-symbols-outlined" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
        </div>
      </div>

      {/* 4. Pending Audit */}
      <div className="metric-card">
        <div>
          <div className="metric-label">Pending Audit</div>
          <div className="metric-value" style={{ color: "var(--on-surface)" }}>
            {exceedsCount}
          </div>
        </div>
        <div className="metric-icon-box metric-icon-grey">
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            pending_actions
          </span>
        </div>
      </div>
    </div>
  );
}
