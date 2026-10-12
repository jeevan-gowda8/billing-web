import React, { useState, useEffect } from "react";
import {
  DESIGNATION_GRADES,
  DEPARTMENTS,
  getPolicyLimit
} from "../data/policyMatrix";

export default function TeamRosterModal({
  isOpen,
  onClose,
  tourClaims,
  selectedTourRef,
  rosterRows,
  onAddRosterMember,
  onDeleteRosterMember
}) {
  const [currentTourRef, setCurrentTourRef] = useState(selectedTourRef || (tourClaims[0]?.tourClaimRef || ""));
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [designation, setDesignation] = useState("Engineer");
  const [department, setDepartment] = useState("Operations");
  const [isAdvanceHolder, setIsAdvanceHolder] = useState("No");
  const [memberNotes, setMemberNotes] = useState("");

  useEffect(() => {
    if (selectedTourRef) {
      setCurrentTourRef(selectedTourRef);
    } else if (tourClaims.length > 0 && (!currentTourRef || !tourClaims.some(c => c.tourClaimRef === currentTourRef))) {
      setCurrentTourRef(tourClaims[0].tourClaimRef);
    }
  }, [selectedTourRef, tourClaims, isOpen]);

  if (!isOpen) return null;

  // Find corresponding tour claim
  const currentClaim = tourClaims.find(c => c.tourClaimRef === currentTourRef);
  const currentMembers = rosterRows.filter(r => r.tourClaimRef === currentTourRef);

  // Calculate daily rate
  const suggestedPolicy = currentClaim
    ? getPolicyLimit(designation, currentClaim.cityTier, currentClaim.category)
    : null;
  const suggestedRate = suggestedPolicy ? suggestedPolicy.limit : 1200;

  // Aggregate limits
  const totalDailyCeiling = currentMembers.reduce((sum, m) => sum + (Number(m.dailyRate) || 0), 0);
  const duration = currentClaim ? Number(currentClaim.duration) || 1 : 1;
  const totalTourCeiling = totalDailyCeiling * duration;
  const totalTourBill = currentClaim ? Number(currentClaim.totalBillAmount) || 0 : 0;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) {
      alert("Please enter colleague full name and email");
      return;
    }

    const newMember = {
      id: `TR-${Date.now()}`,
      tourClaimRef: currentTourRef,
      memberName: memberName.trim(),
      memberEmail: memberEmail.trim(),
      designation,
      department,
      isAdvanceHolder,
      dailyRate: suggestedRate,
      memberNotes: memberNotes.trim()
    };

    onAddRosterMember(newMember);

    setMemberName("");
    setMemberEmail("");
    setMemberNotes("");
    setIsAdvanceHolder("No");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: "60rem" }} onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="modal-header-bar">
          <h3 className="modal-header-title">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              groups
            </span>
            <span>Team Roster Breakdown Manager (Sheet 2)</span>
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <div className="modal-form-body">
          {tourClaims.length === 0 ? (
            <div className="stitch-empty-state" style={{ padding: "3rem 1rem" }}>
              <div className="empty-icon-circle">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                  group_off
                </span>
              </div>
              <h3 className="empty-title">No Tour Claims Available</h3>
              <p className="empty-description">
                Please create at least one Tour Claim first before assigning team colleagues.
              </p>
              <button type="button" className="btn-stitch-primary" onClick={onClose}>
                Return to Tour Claims
              </button>
            </div>
          ) : (
            <>
              {/* Tour Ref Selector Banner */}
              <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--surface-container)", padding: "0.75rem 1rem", borderRadius: "0.75rem", flexWrap: "wrap" }}>
                <label className="text-label-md" style={{ fontWeight: 600, color: "var(--on-surface)" }}>
                  Active Tour Claim Ref:
                </label>
                <select
                  className="modal-select"
                  style={{ maxWidth: "18rem", backgroundColor: "#ffffff" }}
                  value={currentTourRef}
                  onChange={(e) => setCurrentTourRef(e.target.value)}
                >
                  {tourClaims.map(c => (
                    <option key={c.tourClaimRef} value={c.tourClaimRef}>
                      {c.tourClaimRef} — {c.tourTitle} ({c.cityTier})
                    </option>
                  ))}
                </select>

                {currentClaim && (
                  <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginLeft: "auto" }}>
                    Duration: <strong>{currentClaim.duration} d/m</strong> | Bill: <strong>₹{(Number(currentClaim.totalBillAmount) || 0).toLocaleString("en-IN")}</strong>
                  </span>
                )}
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} style={{ background: "#ffffff", border: "1px solid rgba(197, 197, 211, 0.25)", padding: "1.25rem", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--primary)", marginBottom: "0.75rem" }}>
                  + Add Colleague to {currentTourRef}
                </div>

                <div className="modal-form-grid">
                  <div className="form-field-group">
                    <label className="modal-label">Colleague Full Name *</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Priya Verma"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="modal-label">Email ID *</label>
                    <input
                      type="email"
                      className="modal-input"
                      placeholder="priya.verma@abhyudyayatech.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="modal-label">Designation Grade</label>
                    <select
                      className="modal-select"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    >
                      {DESIGNATION_GRADES.map(d => (
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
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="modal-label">Advance Holder?</label>
                    <select
                      className="modal-select"
                      value={isAdvanceHolder}
                      onChange={(e) => setIsAdvanceHolder(e.target.value)}
                    >
                      <option value="No">No</option>
                      <option value="Yes (Advance Holder)">Yes (Advance Holder)</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="modal-label">Handbook Daily Rate</label>
                    <input
                      type="text"
                      className="modal-input"
                      readOnly
                      value={`₹${suggestedRate.toLocaleString("en-IN")}`}
                      style={{ backgroundColor: "var(--surface-container)", fontWeight: 600 }}
                    />
                  </div>

                  <div className="form-field-group col-span-2">
                    <label className="modal-label">Member Role / Notes</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Commissioning engineer"
                      value={memberNotes}
                      onChange={(e) => setMemberNotes(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group" style={{ justifyContent: "flex-end" }}>
                    <button type="submit" className="btn-stitch-primary" style={{ height: "38px", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
                      <span>Add Member</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Mapped Members Table */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--on-surface)", marginBottom: "0.5rem" }}>
                  Colleagues Covered under {currentTourRef} ({currentMembers.length} mapped)
                </div>

                {currentMembers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", background: "var(--surface-container-low)", borderRadius: "0.5rem", color: "var(--on-surface-variant)", fontSize: "13px" }}>
                    No colleagues mapped to this tour yet. Use the form above to add members.
                  </div>
                ) : (
                  <div className="table-scroll-wrapper" style={{ border: "1px solid rgba(197, 197, 211, 0.2)", borderRadius: "0.5rem" }}>
                    <table className="stitch-table">
                      <thead>
                        <tr>
                          <th>Colleague Name</th>
                          <th>Email</th>
                          <th>Designation</th>
                          <th>Department</th>
                          <th style={{ textAlign: "center" }}>Advance Holder?</th>
                          <th style={{ textAlign: "right" }}>Daily Rate</th>
                          <th>Notes</th>
                          <th style={{ textAlign: "center", width: "60px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMembers.map((m) => (
                          <tr key={m.id}>
                            <td style={{ fontWeight: 600 }}>{m.memberName}</td>
                            <td style={{ color: "var(--on-surface-variant)" }}>{m.memberEmail}</td>
                            <td>{m.designation}</td>
                            <td>{m.department}</td>
                            <td style={{ textAlign: "center" }}>
                              {m.isAdvanceHolder === "Yes (Advance Holder)" ? (
                                <span className="status-badge-approved">Advance Holder</span>
                              ) : (
                                <span style={{ color: "var(--outline)", fontSize: "12px" }}>Member</span>
                              )}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 600 }}>
                              ₹{Number(m.dailyRate).toLocaleString("en-IN")}
                            </td>
                            <td style={{ color: "var(--on-surface-variant)", fontSize: "12px" }}>{m.memberNotes || "—"}</td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="action-icon-btn btn-delete"
                                onClick={() => onDeleteRosterMember(m.id)}
                                title="Remove member"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Group Aggregate Calculation Banner */}
              {currentMembers.length > 0 && (
                <div style={{ background: "var(--surface-container-low)", border: "1px solid rgba(197, 197, 211, 0.3)", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--primary)" }}>
                      Aggregated Group Ceiling: ₹{totalTourCeiling.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                      Formula: (Sum of {currentMembers.length} member rates: ₹{totalDailyCeiling.toLocaleString("en-IN")}) × {duration} days
                    </div>
                  </div>

                  <div>
                    {totalTourBill <= totalTourCeiling ? (
                      <span className="status-badge-approved">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>verified</span>
                        <span>Within Team Limit</span>
                      </span>
                    ) : (
                      <span className="status-badge-exceeds">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>warning</span>
                        <span>Bill exceeds by ₹{(totalTourBill - totalTourCeiling).toLocaleString("en-IN")}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Bar */}
        <div className="modal-footer-bar">
          <button type="button" className="btn-stitch-primary" onClick={onClose}>
            Done Managing Roster
          </button>
        </div>
      </div>
    </div>
  );
}
