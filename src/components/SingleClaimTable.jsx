import React, { useState } from "react";
import { evaluateClaimPolicy } from "../data/policyMatrix";
import { formatDateDMY } from "../utils/excelGenerator";

export default function SingleClaimTable({
  claims,
  onAddNew,
  onAiScan,
  onEdit,
  onDelete,
  onExportExcel,
  isExporting
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClaims = claims.filter((c) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      (c.employeeName && c.employeeName.toLowerCase().includes(query)) ||
      (c.employeeEmail && c.employeeEmail.toLowerCase().includes(query)) ||
      (c.category && c.category.toLowerCase().includes(query)) ||
      (c.vendorName && c.vendorName.toLowerCase().includes(query)) ||
      (c.billNumber && c.billNumber.toLowerCase().includes(query)) ||
      (c.department && c.department.toLowerCase().includes(query)) ||
      (c.projectName && c.projectName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col w-full">
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar-left">
          <button
            type="button"
            className="btn-stitch-ai"
            onClick={onAiScan}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>document_scanner</span>
            <span>AI Scan Receipt</span>
          </button>

          <button
            type="button"
            className="btn-stitch-primary"
            onClick={onAddNew}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            <span>New Claim</span>
          </button>

          <button
            type="button"
            className="btn-stitch-secondary"
            onClick={onExportExcel}
            disabled={isExporting}
            title="Download Excel spreadsheet matching Single_Employee_Reimbursement_Template.xlsx"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: "var(--tertiary-container)" }}
            >
              table_view
            </span>
            <span>{isExporting ? "Exporting..." : "Export .xlsx"}</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="search-container">
          <span className="material-symbols-outlined search-icon" style={{ fontSize: "20px" }}>
            search
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search employee, category, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Interactive Data Table Container */}
      <div className="table-card">
        {filteredClaims.length === 0 ? (
          <div className="stitch-empty-state">
            <div className="empty-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                receipt_long
              </span>
            </div>
            <h3 className="empty-title">
              {searchTerm ? "No Matching Claims Found" : "No Claims Recorded Yet"}
            </h3>
            <p className="empty-description">
              {searchTerm
                ? `No reimbursement records matched your search "${searchTerm}".`
                : "Your reimbursement sheet is currently empty. Click 'New Claim' to enter your expenses."}
            </p>
            {!searchTerm && (
              <button
                type="button"
                className="btn-stitch-primary"
                onClick={onAddNew}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                <span>New Claim</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-scroll-wrapper">
            <table className="stitch-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Sl No</th>
                  <th>Employee Full Name</th>
                  <th>Email</th>
                  <th>Designation Grade</th>
                  <th>Department</th>
                  <th>Expense Date</th>
                  <th>Expense Category</th>
                  <th>Location Tier</th>
                  <th>Duration</th>
                  <th>Vendor Name</th>
                  <th>Bill / Invoice No</th>
                  <th style={{ textAlign: "right" }}>Claim Amount</th>
                  <th>Who Paid?</th>
                  <th>UPI ID</th>
                  <th>Project / Client</th>
                  <th>Business Purpose</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center", width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim, idx) => {
                  const audit = evaluateClaimPolicy(
                    claim.designation,
                    claim.cityTier,
                    claim.category,
                    claim.duration,
                    claim.claimAmount
                  );

                  return (
                    <tr key={claim.id || idx}>
                      <td style={{ fontWeight: 600 }}>
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                        {claim.employeeName}
                      </td>
                      <td style={{ color: "var(--on-surface-variant)" }}>
                        {claim.employeeEmail}
                      </td>
                      <td>{claim.designation}</td>
                      <td>{claim.department}</td>
                      <td>{formatDateDMY(claim.expenseDate)}</td>
                      <td>
                        <span className="category-pill">{claim.category}</span>
                      </td>
                      <td>{claim.cityTier}</td>
                      <td>{claim.duration} Days</td>
                      <td style={{ fontWeight: 500 }}>{claim.vendorName}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                        {claim.billNumber}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        ₹{(Number(claim.claimAmount) || 0).toLocaleString("en-IN")}
                      </td>
                      <td>{claim.whoPaid}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--on-surface-variant)" }}>
                        {claim.upiId || "—"}
                      </td>
                      <td>{claim.projectName || "—"}</td>
                      <td style={{ color: "var(--on-surface-variant)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {claim.remarks || "—"}
                      </td>
                      <td>
                        {audit.status === "exceeds" ? (
                          <span className="status-badge-exceeds" title={audit.message}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>warning</span>
                            <span>Exceeds Limit</span>
                          </span>
                        ) : (
                          <span className="status-badge-approved" title={audit.message}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check_circle</span>
                            <span>Policy Checked</span>
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => onEdit(claim)}
                            title="Edit Claim"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn btn-delete"
                            onClick={() => onDelete(claim.id)}
                            title="Delete Claim"
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
        )}

        {/* Table Footer with Pagination matching Stitch UI */}
        <div className="table-footer">
          <div>
            Showing <span style={{ fontWeight: 600, color: "var(--on-surface)" }}>{filteredClaims.length}</span> of{" "}
            <span style={{ fontWeight: 600, color: "var(--on-surface)" }}>{claims.length}</span> entries (Single Employee Matrix)
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
