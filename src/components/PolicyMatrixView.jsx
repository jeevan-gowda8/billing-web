import React, { useState } from "react";
import {
  POLICY_MATRIX,
  DESIGNATION_GRADES,
  CITY_TIERS,
  EXPENSE_CATEGORIES,
  METRO_CITIES_NOTE,
  getPolicyLimit
} from "../data/policyMatrix";

export default function PolicyMatrixView() {
  const [calcGrade, setCalcGrade] = useState("Engineer");
  const [calcTier, setCalcTier] = useState("Metro (5 Cities)");
  const [calcCategory, setCalcCategory] = useState("Hotel / Staying");
  const [calcDuration, setCalcDuration] = useState(2);

  const policy = getPolicyLimit(calcGrade, calcTier, calcCategory);
  const calculatedMax = policy ? policy.limit * calcDuration : 0;

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Policy Calculator Card */}
      <div className="table-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div className="metric-icon-box metric-icon-blue" style={{ width: "2.5rem", height: "2.5rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>calculate</span>
          </div>
          <div>
            <h2 className="text-headline-sm" style={{ color: "var(--on-surface)", margin: 0 }}>
              ATS Policy Rate Matrix & Calculator
            </h2>
            <p className="text-body-sm" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
              Audit reference caps and instant reimbursement calculator according to official handbook limits.
            </p>
          </div>
        </div>

        <div className="modal-form-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "1.25rem" }}>
          <div className="form-field-group">
            <label className="modal-label">Designation Grade</label>
            <select
              className="modal-select"
              value={calcGrade}
              onChange={(e) => setCalcGrade(e.target.value)}
            >
              {DESIGNATION_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label className="modal-label">City / Location Tier</label>
            <select
              className="modal-select"
              value={calcTier}
              onChange={(e) => setCalcTier(e.target.value)}
            >
              {CITY_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label className="modal-label">Expense Category</label>
            <select
              className="modal-select"
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label className="modal-label">Duration (Days / Months)</label>
            <input
              type="number"
              min="1"
              className="modal-input"
              value={calcDuration}
              onChange={(e) => setCalcDuration(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        {/* Calculation Result Banner */}
        <div style={{ background: "var(--surface-container-low)", border: "1px solid rgba(197, 197, 211, 0.3)", borderRadius: "0.75rem", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="text-label-md" style={{ color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Allowable Handbook Policy Cap
            </div>
            <div className="text-headline-xl" style={{ color: "var(--primary)", marginTop: "0.25rem" }}>
              {policy ? `₹${calculatedMax.toLocaleString("en-IN")}` : "Paid at Actuals (With GST Invoices)"}
            </div>
            <div className="text-body-sm" style={{ color: "var(--on-surface-variant)", marginTop: "0.25rem" }}>
              {policy
                ? `Base handbook rate: ₹${policy.limit.toLocaleString("en-IN")} ${policy.unit} × ${calcDuration} days/months`
                : "Travel & Conveyance expenses are paid at actuals upon submission of valid GST invoices"}
            </div>
          </div>

          <div className="status-badge-approved" style={{ padding: "0.5rem 1rem", fontSize: "12px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified</span>
            <span>Official ATS 2026 Handbook Rate</span>
          </div>
        </div>
      </div>

      {/* Policy Matrix Reference Table */}
      <div className="table-card">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(197, 197, 211, 0.2)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>table_chart</span>
          <h3 className="text-headline-sm" style={{ margin: 0 }}>ATS Employee Handbook — Travel & Reimbursement Matrix</h3>
        </div>

        <div className="table-scroll-wrapper">
          <table className="stitch-table">
            <thead>
              <tr>
                <th>Designation Grade</th>
                <th>City / Location Tier</th>
                <th style={{ textAlign: "right" }}>Hotel / Staying Limit (₹/Day)</th>
                <th style={{ textAlign: "right" }}>Food & Daily Allowance (₹/Day)</th>
                <th style={{ textAlign: "right" }}>Monthly Deputation Limit (₹/Month)</th>
              </tr>
            </thead>
            <tbody>
              {POLICY_MATRIX.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.grade}</td>
                  <td>
                    {row.tier === "Metro (5 Cities)" && "🏙️ 5 Metro Cities"}
                    {row.tier === "Tier-2 Cities" && "🏢 Tier-2 Cities"}
                    {row.tier === "Rest of Locations" && "📍 Rest of Locations"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>₹{row.hotel.toLocaleString("en-IN")}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>₹{row.food.toLocaleString("en-IN")}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>₹{row.deputation.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "1rem 1.25rem", background: "var(--surface-container-low)", borderTop: "1px solid rgba(197, 197, 211, 0.2)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "12px", color: "var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary)" }}>info</span>
          <span>{METRO_CITIES_NOTE}</span>
        </div>
      </div>
    </div>
  );
}
