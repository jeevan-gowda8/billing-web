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
  onExportSiteExpense,
  onOpenExportTab,
  isExporting
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

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

          {/* Export Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="btn-stitch-secondary"
              onClick={() => setShowExportMenu((prev) => !prev)}
              disabled={isExporting}
              title="Export claims to Excel spreadsheet"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", color: "var(--tertiary-container)" }}
              >
                table_view
              </span>
              <span>{isExporting ? "Exporting..." : "Export .xlsx"}</span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", marginLeft: "2px" }}>
                arrow_drop_down
              </span>
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  backgroundColor: "var(--surface-container-lowest)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: "0.5rem",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 50,
                  minWidth: "260px",
                  padding: "0.35rem 0",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ padding: "0.4rem 0.85rem", fontSize: "11px", fontWeight: 700, color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Select Excel Template
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportExcel();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.85rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "var(--on-surface)",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-container)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--primary)" }}>
                    receipt_long
                  </span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Standard Claims Sheet</div>
                    <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>Single Employee Template</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    if (onExportSiteExpense) {
                      onExportSiteExpense();
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.85rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "var(--on-surface)",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-container)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#16a34a" }}>
                    directions_car
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>Site Expense / Tour Bill</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#dcfce7", color: "#15803d", padding: "1px 5px", borderRadius: "8px", fontWeight: 700 }}>NEW</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>Format matched to SITE EXPENSE.xlsx</div>
                  </div>
                </button>

                {onOpenExportTab && (
                  <>
                    <div style={{ height: "1px", backgroundColor: "var(--outline-variant)", margin: "0.25rem 0" }}></div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        onOpenExportTab();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.85rem",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "var(--primary)",
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-container)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        open_in_new
                      </span>
                      <span>Customize in Export Center</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
                  <th style={{ textAlign: "center", width: "95px" }}>Receipt</th>
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
                      <td style={{ textAlign: "center" }}>
                        {claim.receiptImage || claim.receipt_image ? (
                          <button
                            type="button"
                            onClick={() =>
                              setViewingReceipt({
                                title: `${claim.employeeName} — ${claim.vendorName || "Receipt"}`,
                                subtitle: `Claim #${claim.id || idx + 1} | Bill No: ${claim.billNumber || "N/A"} | ₹${(Number(claim.claimAmount) || 0).toLocaleString("en-IN")}`,
                                img: claim.receiptImage || claim.receipt_image
                              })
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              backgroundColor: "rgba(30, 58, 138, 0.08)",
                              color: "var(--primary)",
                              border: "1px solid rgba(30, 58, 138, 0.2)",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                            title="Click to view attached bill receipt"
                          >
                            <img
                              src={claim.receiptImage || claim.receipt_image}
                              alt="Receipt"
                              style={{ width: "16px", height: "16px", objectFit: "cover", borderRadius: "3px" }}
                            />
                            <span>Bill</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", opacity: 0.6 }}>—</span>
                        )}
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

      {/* Lightbox Modal for viewing uploaded receipt */}
      {viewingReceipt && (
        <div
          className="modal-overlay"
          onClick={() => setViewingReceipt(null)}
          style={{ zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            className="modal-card"
            style={{ maxWidth: "680px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: "16px" }}>{viewingReceipt.title}</h3>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: 0 }}>
                  {viewingReceipt.subtitle}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingReceipt(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: "1rem", overflowY: "auto", textAlign: "center", backgroundColor: "var(--surface-container-low)" }}>
              <img
                src={viewingReceipt.img}
                alt="Attached Receipt"
                style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "0.5rem", boxShadow: "var(--shadow-md)" }}
              />
            </div>
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <a
                href={viewingReceipt.img}
                download="bill-receipt.jpg"
                className="btn-stitch-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                <span>Download Bill</span>
              </a>
              <button
                type="button"
                className="btn-stitch-primary"
                onClick={() => setViewingReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
