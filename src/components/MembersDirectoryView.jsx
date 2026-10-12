import React, { useState } from "react";
import { DESIGNATION_GRADES, DEPARTMENTS, POLICY_MATRIX } from "../data/policyMatrix";

export default function MembersDirectoryView({
  members = [],
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  isAddModalOpen,
  setIsAddModalOpen
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");

  // Edit / Add Form State
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    memberName: "",
    memberEmail: "",
    designation: "Engineer",
    department: "Operations",
    isAdvanceHolder: "No",
    defaultNotes: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      !searchTerm.trim() ||
      m.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.defaultNotes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === "ALL" || m.department === selectedDept;
    const matchesGrade = selectedGrade === "ALL" || m.designation === selectedGrade;

    return matchesSearch && matchesDept && matchesGrade;
  });

  // Calculate statistics
  const totalCount = members.length;
  const advanceHoldersCount = members.filter((m) => m.isAdvanceHolder === "Yes").length;
  const uniqueDepts = new Set(members.map((m) => m.department).filter(Boolean)).size;

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      memberName: "",
      memberEmail: "",
      designation: "Engineer",
      department: "Operations",
      isAdvanceHolder: "No",
      defaultNotes: ""
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      memberName: member.memberName || "",
      memberEmail: member.memberEmail || "",
      designation: member.designation || "Engineer",
      department: member.department || "Operations",
      isAdvanceHolder: member.isAdvanceHolder || "No",
      defaultNotes: member.defaultNotes || ""
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.memberName.trim()) errors.memberName = "Colleague name is required";
    if (!formData.memberEmail.trim()) {
      errors.memberEmail = "Email address is required";
    } else if (!formData.memberEmail.includes("@")) {
      errors.memberEmail = "Enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMember) {
        await onUpdateMember(editingMember.id, formData);
      } else {
        await onAddMember(formData);
      }
      setIsAddModalOpen(false);
      setEditingMember(null);
      setFormData({
        memberName: "",
        memberEmail: "",
        designation: "Engineer",
        department: "Operations",
        isAdvanceHolder: "No",
        defaultNotes: ""
      });
    } catch (err) {
      alert("Failed to save colleague: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (member) => {
    if (window.confirm(`Are you sure you want to remove ${member.memberName} from the team directory?`)) {
      onDeleteMember(member.id);
    }
  };

  const getPolicyRateSummary = (designation) => {
    const rates = POLICY_MATRIX.filter((p) => p.grade === designation);
    if (!rates.length) return "Standard limits apply";
    const hotelMin = Math.min(...rates.map((r) => r.hotel));
    const hotelMax = Math.max(...rates.map((r) => r.hotel));
    return `₹${hotelMin.toLocaleString("en-IN")} - ₹${hotelMax.toLocaleString("en-IN")}/day (Hotel)`;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Banner / Metrics Cards */}
      <div className="metrics-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="metric-card">
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="metric-label">TOTAL DIRECTORY MEMBERS</div>
            <div className="metric-value">{totalCount}</div>
            <div className="metric-sub">Active staff mapped for travel & tours</div>
          </div>
          <div className="metric-icon-box metric-icon-blue">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>groups</span>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="metric-label">LEAD ADVANCE HOLDERS</div>
            <div className="metric-value" style={{ color: "var(--tertiary, #059669)" }}>
              {advanceHoldersCount}
            </div>
            <div className="metric-sub">Authorized to hold company advance funds</div>
          </div>
          <div className="metric-icon-box metric-icon-green">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>verified_user</span>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="metric-label">DEPARTMENTS REPRESENTED</div>
            <div className="metric-value">{uniqueDepts}</div>
            <div className="metric-sub">Engineering, Operations, Service & more</div>
          </div>
          <div className="metric-icon-box metric-icon-cyan">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>business</span>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="metric-label">POLICY MATRIX CAP</div>
            <div className="metric-value" style={{ color: "var(--primary)" }}>100%</div>
            <div className="metric-sub">All grades strictly tied to handbook rates</div>
          </div>
          <div className="metric-icon-box metric-icon-green">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>verified</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {/* Action Header Bar */}
        <div className="action-bar">
          <div className="action-bar-left">
            <button
              type="button"
              className="btn-stitch-primary"
              onClick={handleOpenAddModal}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
              <span>Add New Member</span>
            </button>

            {/* Department Filter */}
            <select
              className="modal-select"
              style={{ width: "auto", minWidth: "150px", height: "36px", padding: "0 0.75rem", fontSize: "12px" }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Designation Grade Filter */}
            <select
              className="modal-select"
              style={{ width: "auto", minWidth: "160px", height: "36px", padding: "0 0.75rem", fontSize: "12px" }}
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="ALL">All Designation Grades</option>
              {DESIGNATION_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="action-bar-right">
            <div className="search-container">
              <span className="search-icon material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search colleagues by name, email, department..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--on-surface-variant)"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Members List Table */}
        {filteredMembers.length === 0 ? (
          <div className="stitch-empty-state">
            <div className="empty-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>person_search</span>
            </div>
            <div className="empty-state-title">No Team Members Found</div>
            <div className="empty-state-sub">
              {searchTerm || selectedDept !== "ALL" || selectedGrade !== "ALL"
                ? "No colleagues match your current search and filter criteria."
                : "Your company team directory is currently empty. Add your first colleague to get started!"}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              {(searchTerm || selectedDept !== "ALL" || selectedGrade !== "ALL") && (
                <button
                  type="button"
                  className="btn-stitch-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDept("ALL");
                    setSelectedGrade("ALL");
                  }}
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                className="btn-stitch-primary"
                onClick={handleOpenAddModal}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
                <span>Add Member</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="table-scroll-wrapper">
            <table className="stitch-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>#</th>
                  <th>Colleague / Member Name</th>
                  <th>Company Email</th>
                  <th>Designation / Grade</th>
                  <th>Department</th>
                  <th style={{ textAlign: "center" }}>Advance Holder</th>
                  <th>Handbook Policy Cap Range</th>
                  <th>Role / Notes</th>
                  <th style={{ textAlign: "center", width: "90px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => {
                  const initials = member.memberName
                    ? member.memberName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "TM";

                  const isLead = member.isAdvanceHolder === "Yes";

                  return (
                    <tr key={member.id || member.memberEmail}>
                      <td style={{ textAlign: "center", color: "var(--on-surface-variant)", fontSize: "12px", fontFamily: "monospace" }}>
                        {index + 1}
                      </td>

                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: isLead
                                ? "linear-gradient(135deg, #00236f 0%, #0051d5 100%)"
                                : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "13px",
                              flexShrink: 0,
                              boxShadow: "var(--shadow-sm)"
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--on-surface)" }}>
                              {member.memberName}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                              ATS Staff ID: #{member.id || index + 1}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--primary)" }}>
                          {member.memberEmail}
                        </span>
                      </td>

                      {/* Designation */}
                      <td>
                        <span
                          className="category-pill"
                          style={{
                            fontWeight: 600,
                            backgroundColor:
                              member.designation === "Functional Manager"
                                ? "#dbeafe"
                                : member.designation === "Engineer"
                                ? "#e0e7ff"
                                : "#f3f4f6",
                            color:
                              member.designation === "Functional Manager"
                                ? "#1e40af"
                                : member.designation === "Engineer"
                                ? "#3730a3"
                                : "#374151"
                          }}
                        >
                          {member.designation}
                        </span>
                      </td>

                      {/* Department */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--on-surface-variant)" }}>
                            folder
                          </span>
                          <span>{member.department || "Operations"}</span>
                        </div>
                      </td>

                      {/* Advance Holder Status */}
                      <td style={{ textAlign: "center" }}>
                        {isLead ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              background: "#d1e7dd",
                              color: "#0f5132",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                              verified
                            </span>
                            <span>Advance Holder</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              background: "var(--surface-container-high)",
                              color: "var(--on-surface-variant)",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "11px"
                            }}
                          >
                            Covered Staff
                          </span>
                        )}
                      </td>

                      {/* Policy Cap Range */}
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                          {getPolicyRateSummary(member.designation)}
                        </span>
                      </td>

                      {/* Role Notes */}
                      <td style={{ color: "var(--on-surface-variant)", fontSize: "12px" }}>
                        {member.defaultNotes || "—"}
                      </td>

                      {/* Actions: Edit & Delete Member */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => handleOpenEditModal(member)}
                            title={`Edit details for ${member.memberName}`}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn btn-delete"
                            onClick={() => handleDelete(member)}
                            title={`Remove ${member.memberName} from directory`}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                              delete
                            </span>
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

        {/* Footer Count Bar */}
        <div className="table-pagination-bar" style={{ padding: "0.875rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
            Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> registered colleagues
          </span>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 500 }}>
            Syncs automatically with Team / Group Tour Claims & Roster
          </span>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content-card"
            style={{ maxWidth: "34rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header-bar">
              <h3 className="modal-header-title">
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  {editingMember ? "edit_note" : "person_add"}
                </span>
                <span>{editingMember ? `Edit ${editingMember.memberName}` : "Add Colleague to Directory"}</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div className="modal-form-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-field-group">
                  <label className="modal-label">
                    Full Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Vikram Rao"
                    value={formData.memberName}
                    onChange={(e) => {
                      setFormData({ ...formData, memberName: e.target.value });
                      if (formErrors.memberName) setFormErrors({ ...formErrors, memberName: null });
                    }}
                    autoFocus
                  />
                  {formErrors.memberName && (
                    <span style={{ color: "var(--error)", fontSize: "11px" }}>{formErrors.memberName}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label className="modal-label">
                    Company Email Address <span className="req-star">*</span>
                  </label>
                  <input
                    type="email"
                    className="modal-input"
                    placeholder="e.g. vikram@abhyudaya.tech"
                    value={formData.memberEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, memberEmail: e.target.value });
                      if (formErrors.memberEmail) setFormErrors({ ...formErrors, memberEmail: null });
                    }}
                  />
                  {formErrors.memberEmail && (
                    <span style={{ color: "var(--error)", fontSize: "11px" }}>{formErrors.memberEmail}</span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-field-group">
                    <label className="modal-label">
                      Designation / Grade <span className="req-star">*</span>
                    </label>
                    <select
                      className="modal-select"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    >
                      {DESIGNATION_GRADES.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="modal-label">Department</label>
                    <select
                      className="modal-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Advance Holder Privilege</label>
                  <select
                    className="modal-select"
                    value={formData.isAdvanceHolder}
                    onChange={(e) => setFormData({ ...formData, isAdvanceHolder: e.target.value })}
                  >
                    <option value="No">No — Covered Team Member</option>
                    <option value="Yes">Yes — Authorized Lead Advance Holder</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Role Notes / Responsibilities (Optional)</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Field Operations Lead, Calibration Specialist"
                    value={formData.defaultNotes}
                    onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer-bar">
                <button
                  type="button"
                  className="btn-stitch-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-stitch-primary"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Saving..." : editingMember ? "Update Colleague" : "Add Colleague to Directory"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
