import React, { useState } from "react";
import { formatDateDMY } from "../utils/excelGenerator";

export default function TeamClaimTable({
  tourClaims,
  rosterRows,
  onAddNewTour,
  onEditTour,
  onDeleteTour,
  onOpenRosterManager,
  onExportExcel,
  isExporting
}) {
  const [activeSubView, setActiveSubView] = useState("claims"); // "claims" | "roster"
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTourClaims = tourClaims.filter((tc) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      (tc.tourClaimRef && tc.tourClaimRef.toLowerCase().includes(query)) ||
      (tc.advanceHolderName && tc.advanceHolderName.toLowerCase().includes(query)) ||
      (tc.tourTitle && tc.tourTitle.toLowerCase().includes(query)) ||
      (tc.category && tc.category.toLowerCase().includes(query)) ||
      (tc.vendorName && tc.vendorName.toLowerCase().includes(query))
    );
  });

  const filteredRoster = rosterRows.filter((r) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      (r.tourClaimRef && r.tourClaimRef.toLowerCase().includes(query)) ||
      (r.memberName && r.memberName.toLowerCase().includes(query)) ||
      (r.memberEmail && r.memberEmail.toLowerCase().includes(query)) ||
      (r.designation && r.designation.toLowerCase().includes(query)) ||
      (r.department && r.department.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col w-full">
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar-left">
          <button
            type="button"
            className="btn-stitch-primary"
            onClick={onAddNewTour}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            <span>New Tour Claim</span>
          </button>

          <button
            type="button"
            className="btn-stitch-secondary"
            onClick={() => onOpenRosterManager()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>groups</span>
            <span>Manage Roster ({rosterRows.length})</span>
          </button>

          <button
            type="button"
            className="btn-stitch-secondary"
            onClick={onExportExcel}
            disabled={isExporting}
            title="Download Excel spreadsheet matching Team_Group_Reimbursement_Template.xlsx"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: "var(--tertiary-container)" }}
            >
              table_view
            </span>
            <span>{isExporting ? "Exporting..." : "Export .xlsx"}</span>
          </button>

          {/* Sub-view switcher */}
          <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface-container)", padding: "3px", borderRadius: "0.5rem", marginLeft: "0.5rem" }}>
            <button
              type="button"
              className={`sidebar-nav-item ${activeSubView === "claims" ? "active" : ""}`}
              style={{ padding: "0.35rem 0.75rem", fontSize: "12px", borderRadius: "0.375rem" }}
              onClick={() => setActiveSubView("claims")}
            >
              Tour Claims ({tourClaims.length})
            </button>
            <button
              type="button"
              className={`sidebar-nav-item ${activeSubView === "roster" ? "active" : ""}`}
              style={{ padding: "0.35rem 0.75rem", fontSize: "12px", borderRadius: "0.375rem" }}
              onClick={() => setActiveSubView("roster")}
            >
              Roster Breakdown ({rosterRows.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <span className="material-symbols-outlined search-icon" style={{ fontSize: "20px" }}>
            search
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search tour ref, holder, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {activeSubView === "claims" ? (
          filteredTourClaims.length === 0 ? (
            <div className="stitch-empty-state">
              <div className="empty-icon-circle">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                  groups
                </span>
              </div>
              <h3 className="empty-title">
                {searchTerm ? "No Matching Tour Claims Found" : "No Team Tour Claims Recorded"}
              </h3>
              <p className="empty-description">
                {searchTerm
                  ? `No tour claims matched your search "${searchTerm}".`
                  : "Your team tour claims sheet is currently empty. Click 'New Tour Claim' to add an expense."}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  className="btn-stitch-primary"
                  onClick={onAddNewTour}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                  <span>New Tour Claim</span>
                </button>
              )}
            </div>
          ) : (
            <div className="table-scroll-wrapper">
              <table className="stitch-table">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>Ref #</th>
                    <th>Advance Holder Name</th>
                    <th>Email</th>
                    <th>Holder Title</th>
                    <th>Who Paid?</th>
                    <th>UPI ID</th>
                    <th>Tour / Project Title</th>
                    <th>Expense Date</th>
                    <th>Category</th>
                    <th>Location Tier</th>
                    <th>Duration</th>
                    <th>Vendor / Hotel Name</th>
                    <th>Bill / Invoice No</th>
                    <th style={{ textAlign: "right" }}>Total Bill</th>
                    <th style={{ textAlign: "center" }}>Team Size</th>
                    <th>Covered Team Members</th>
                    <th>Business Purpose</th>
                    <th style={{ textAlign: "center", width: "100px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTourClaims.map((tc) => {
                    const members = rosterRows.filter(r => r.tourClaimRef === tc.tourClaimRef);
                    const teamSize = members.length > 0 ? members.length : (tc.teamSize || 1);
                    const coveredText = members.length > 0
                      ? members.map(m => `${m.memberName} (${m.designation})`).join(", ")
                      : (tc.coveredMembers || "No colleagues mapped");

                    return (
                      <tr key={tc.id || tc.tourClaimRef}>
                        <td style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--primary)" }}>
                          {tc.tourClaimRef}
                        </td>
                        <td style={{ fontWeight: 600 }}>{tc.advanceHolderName}</td>
                        <td style={{ color: "var(--on-surface-variant)" }}>{tc.advanceHolderEmail}</td>
                        <td>{tc.advanceHolderTitle}</td>
                        <td>{tc.whoPaid}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--on-surface-variant)" }}>
                          {tc.advanceHolderUpi || "—"}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--primary)" }}>{tc.tourTitle}</td>
                        <td>{formatDateDMY(tc.expenseDate)}</td>
                        <td>
                          <span className="category-pill">{tc.category}</span>
                        </td>
                        <td>{tc.cityTier}</td>
                        <td>{tc.duration} Days</td>
                        <td style={{ fontWeight: 500 }}>{tc.vendorName}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{tc.billNumber}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          ₹{(Number(tc.totalBillAmount) || 0).toLocaleString("en-IN")}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="btn-stitch-secondary"
                            style={{ padding: "0.2rem 0.5rem", fontSize: "11px" }}
                            onClick={() => onOpenRosterManager(tc.tourClaimRef)}
                            title="Manage roster for this tour claim"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>groups</span>
                            <span>{teamSize} staff</span>
                          </button>
                        </td>
                        <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {coveredText}
                        </td>
                        <td style={{ color: "var(--on-surface-variant)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tc.remarks || "—"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <button
                              type="button"
                              className="action-icon-btn"
                              onClick={() => onEditTour(tc)}
                              title="Edit Tour Claim"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn btn-delete"
                              onClick={() => onDeleteTour(tc.id)}
                              title="Delete Tour Claim"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Roster Breakdown Table (Sheet 2) */
          filteredRoster.length === 0 ? (
            <div className="stitch-empty-state">
              <div className="empty-icon-circle">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                  group_add
                </span>
              </div>
              <h3 className="empty-title">No Roster Colleagues Mapped</h3>
              <p className="empty-description">
                Map individual staff to tour claim refs to track member breakdown and handbook rates.
              </p>
              <button
                type="button"
                className="btn-stitch-primary"
                onClick={() => onOpenRosterManager()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>groups</span>
                <span>Open Roster Manager</span>
              </button>
            </div>
          ) : (
            <div className="table-scroll-wrapper">
              <table className="stitch-table">
                <thead>
                  <tr>
                    <th style={{ width: "120px" }}>Tour Claim Ref</th>
                    <th>Member Full Name</th>
                    <th>Member Email ID</th>
                    <th>Designation Grade</th>
                    <th>Department</th>
                    <th style={{ textAlign: "center" }}>Is Advance Holder?</th>
                    <th style={{ textAlign: "right" }}>Handbook Rate</th>
                    <th>Member Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((r, idx) => (
                    <tr key={r.id || idx}>
                      <td style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--primary)" }}>
                        {r.tourClaimRef}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.memberName}</td>
                      <td style={{ color: "var(--on-surface-variant)" }}>{r.memberEmail}</td>
                      <td>{r.designation}</td>
                      <td>{r.department}</td>
                      <td style={{ textAlign: "center" }}>
                        {r.isAdvanceHolder === "Yes (Advance Holder)" ? (
                          <span className="status-badge-approved">Advance Holder</span>
                        ) : (
                          <span style={{ color: "var(--outline)", fontSize: "12px" }}>Member</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        ₹{(Number(r.dailyRate) || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={{ color: "var(--on-surface-variant)" }}>{r.memberNotes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Footer */}
        <div className="table-footer">
          <div>
            Showing{" "}
            <span style={{ fontWeight: 600, color: "var(--on-surface)" }}>
              {activeSubView === "claims" ? filteredTourClaims.length : filteredRoster.length}
            </span>{" "}
            entries ({activeSubView === "claims" ? "Team Tour Claims" : "Team Roster Breakdown"})
          </div>

          <div className="pagination-controls">
            <button type="button" className="pagination-btn" disabled>
              Previous
            </button>
            <button type="button" className="pagination-btn active">
              1
            </button>
            <button type="button" className="pagination-btn" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
