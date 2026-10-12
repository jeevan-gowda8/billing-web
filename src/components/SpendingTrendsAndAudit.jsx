import React from "react";
import { evaluateClaimPolicy } from "../data/policyMatrix";

export default function SpendingTrendsAndAudit({ claims = [], isTeam = false }) {
  // Current Quarter label, e.g. Q3 2023 or dynamic
  const currentYear = new Date().getFullYear();
  const currentQuarter = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${currentYear}`;

  let hotelSum = 0;
  let travelSum = 0;
  let foodSum = 0;
  let flagsCount = 0;

  claims.forEach((c) => {
    const amt = isTeam ? Number(c.totalBillAmount || 0) : Number(c.claimAmount || 0);
    const cat = (c.category || "").toLowerCase();

    if (cat.includes("hotel") || cat.includes("stay") || cat.includes("room") || cat.includes("accommodation")) {
      hotelSum += amt;
    } else if (cat.includes("travel") || cat.includes("transit") || cat.includes("flight") || cat.includes("cab") || cat.includes("conveyance")) {
      travelSum += amt;
    } else if (cat.includes("food") || cat.includes("dining") || cat.includes("meal")) {
      foodSum += amt;
    } else {
      travelSum += amt;
    }

    if (!isTeam) {
      const audit = evaluateClaimPolicy(c.designation, c.cityTier, c.category, c.duration, c.claimAmount);
      if (audit.status === "exceeds") {
        flagsCount++;
      }
    }
  });

  const total = hotelSum + travelSum + foodSum;
  const hotelPct = total > 0 ? Math.round((hotelSum / total) * 100) : 0;
  const travelPct = total > 0 ? Math.round((travelSum / total) * 100) : 0;
  const foodPct = total > 0 ? Math.round((foodSum / total) * 100) : 0;

  return (
    <div className="trends-audit-grid">
      {/* 1. Left Card: Spending Trends & Category Breakdown */}
      <div className="trends-card">
        <div>
          <div className="trends-header">
            <div className="trends-title">Spending Trends &amp; Category Breakdown</div>
            <span className="trends-subtitle">{currentQuarter}</span>
          </div>

          <div className="trends-bars-list">
            {/* Hotel & Accommodation */}
            <div className="trend-bar-item">
              <div className="trend-bar-header">
                <span className="trend-bar-label">
                  Hotel &amp; Accommodation (₹{hotelSum.toLocaleString("en-IN")})
                </span>
                <span className="trend-bar-percent">{hotelPct}%</span>
              </div>
              <div className="trend-progress-track">
                <div
                  className="trend-progress-fill"
                  style={{ width: `${hotelPct}%`, backgroundColor: "var(--primary)" }}
                ></div>
              </div>
            </div>

            {/* Travel & Transit */}
            <div className="trend-bar-item">
              <div className="trend-bar-header">
                <span className="trend-bar-label">
                  Travel &amp; Transit (₹{travelSum.toLocaleString("en-IN")})
                </span>
                <span className="trend-bar-percent">{travelPct}%</span>
              </div>
              <div className="trend-progress-track">
                <div
                  className="trend-progress-fill"
                  style={{ width: `${travelPct}%`, backgroundColor: "var(--secondary)" }}
                ></div>
              </div>
            </div>

            {/* Food & Dining */}
            <div className="trend-bar-item">
              <div className="trend-bar-header">
                <span className="trend-bar-label">
                  Food &amp; Dining (₹{foodSum.toLocaleString("en-IN")})
                </span>
                <span className="trend-bar-percent">{foodPct}%</span>
              </div>
              <div className="trend-progress-track">
                <div
                  className="trend-progress-fill"
                  style={{ width: `${foodPct}%`, backgroundColor: "var(--tertiary-container)" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Card: Policy Audit Center */}
      <div className="audit-card">
        <div>
          <div className="audit-header">
            <div className="audit-title-wrap">
              <span
                className="material-symbols-outlined"
                style={{ color: "#ba1a1a", fontSize: "22px" }}
              >
                gpp_maybe
              </span>
              <span>Policy Audit Center</span>
            </div>
            <span
              className={flagsCount > 0 ? "audit-badge-flags" : "audit-badge-ok"}
              style={flagsCount === 0 ? { backgroundColor: "rgba(255, 218, 214, 0.4)", color: "#ba1a1a" } : undefined}
            >
              {flagsCount} {flagsCount === 1 ? "Flag" : "Flags"}
            </span>
          </div>

          <p className="audit-desc">
            {flagsCount === 0
              ? "All current single employee claims comply with standard per-diem and location rate matrices."
              : `${flagsCount} claim${flagsCount > 1 ? "s exceed" : " exceeds"} standard per-diem ceiling and requires secondary manager approval.`}
          </p>
        </div>

        <div className="audit-cycle-box">
          <div className="audit-cycle-label">Next automated audit cycle</div>
          <span className="audit-cycle-time">00:00 Hrs</span>
        </div>
      </div>
    </div>
  );
}
