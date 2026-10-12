import React, { useState, useEffect } from "react";
import {
  DESIGNATION_GRADES,
  CITY_TIERS,
  EXPENSE_CATEGORIES,
  WHO_PAID_OPTIONS,
  DEPARTMENTS,
  getPolicyLimit
} from "../data/policyMatrix";
import { getCompanyMembers, createCompanyMember } from "../services/api";

const DEFAULT_MEMBERS = [
  { id: 1, memberName: "Jeevan Gowda A V", memberEmail: "jeevan@abhyudaya.tech", designation: "Functional Manager", department: "Engineering", isAdvanceHolder: "Yes", defaultNotes: "Project Lead" },
  { id: 2, memberName: "Bharath L", memberEmail: "Bharath@abhyudyayatech.com", designation: "Intern", department: "Operations", isAdvanceHolder: "No", defaultNotes: "Field Operations" },
  { id: 3, memberName: "Rahul Sharma", memberEmail: "rahul@abhyudaya.tech", designation: "Engineer", department: "Project Management", isAdvanceHolder: "No", defaultNotes: "On-site Engineer" },
  { id: 4, memberName: "Priya Patel", memberEmail: "priya@abhyudaya.tech", designation: "Technician", department: "Service", isAdvanceHolder: "No", defaultNotes: "Hardware Testing" }
];

export default function TeamClaimFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextTourRef,
  existingRosterRows = [],
  companyMembers = []
}) {
  const [formData, setFormData] = useState({
    tourClaimRef: "",
    advanceHolderName: "",
    advanceHolderEmail: "",
    advanceHolderTitle: "Functional Manager",
    whoPaid: "Paid by Company Advance",
    advanceHolderUpi: "N/A — Company Advance",
    tourTitle: "",
    expenseDate: new Date().toISOString().slice(0, 10),
    category: "Hotel / Staying",
    cityTier: "Tier-2 Cities",
    duration: 1,
    vendorName: "",
    billNumber: "",
    totalBillAmount: "",
    remarks: ""
  });

  const [availableMembers, setAvailableMembers] = useState(
    companyMembers && companyMembers.length > 0 ? companyMembers : DEFAULT_MEMBERS
  );
  const [selectedMemberEmails, setSelectedMemberEmails] = useState([]);
  const [selectedAdvanceHolderEmail, setSelectedAdvanceHolderEmail] = useState("");
  
  // Add Colleague Sub-modal State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    memberName: "",
    memberEmail: "",
    designation: "Engineer",
    department: "Operations",
    isAdvanceHolder: "No",
    defaultNotes: ""
  });
  const [newMemberErrors, setNewMemberErrors] = useState({});
  const [isSavingMember, setIsSavingMember] = useState(false);

  const [errors, setErrors] = useState({});

  // Sync with companyMembers prop or fetch if empty
  useEffect(() => {
    if (companyMembers && companyMembers.length > 0) {
      setAvailableMembers(companyMembers);
    } else if (isOpen) {
      loadMembers();
    }
  }, [companyMembers, isOpen]);

  const loadMembers = async () => {
    try {
      const data = await getCompanyMembers();
      if (Array.isArray(data) && data.length > 0) {
        setAvailableMembers(data);
      }
    } catch (err) {
      console.warn("Could not fetch company members from server; using defaults", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        ...initialData,
        totalBillAmount: initialData.totalBillAmount || "",
        duration: initialData.duration || 1
      });

      // Match advance holder email
      if (initialData.advanceHolderEmail) {
        setSelectedAdvanceHolderEmail(initialData.advanceHolderEmail);
      }

      // If existing roster rows for this tour ref exist, select them
      const relatedRoster = existingRosterRows.filter(
        (r) => r.tourClaimRef === initialData.tourClaimRef
      );
      if (relatedRoster.length > 0) {
        setSelectedMemberEmails(relatedRoster.map((r) => r.memberEmail));
      } else {
        setSelectedMemberEmails(initialData.advanceHolderEmail ? [initialData.advanceHolderEmail] : []);
      }
    } else {
      const defaultRef = nextTourRef || "TOUR-001";
      setFormData({
        tourClaimRef: defaultRef,
        advanceHolderName: "",
        advanceHolderEmail: "",
        advanceHolderTitle: "Functional Manager",
        whoPaid: "Paid by Company Advance",
        advanceHolderUpi: "N/A — Company Advance",
        tourTitle: "",
        expenseDate: new Date().toISOString().slice(0, 10),
        category: "Hotel / Staying",
        cityTier: "Tier-2 Cities",
        duration: 1,
        vendorName: "",
        billNumber: "",
        totalBillAmount: "",
        remarks: ""
      });

      // Default select all available members for convenience in new team claims
      if (availableMembers.length > 0) {
        setSelectedMemberEmails(availableMembers.map((m) => m.memberEmail));
        const lead = availableMembers.find((m) => m.isAdvanceHolder === "Yes") || availableMembers[0];
        if (lead) {
          setSelectedAdvanceHolderEmail(lead.memberEmail);
          setFormData((prev) => ({
            ...prev,
            advanceHolderName: lead.memberName,
            advanceHolderEmail: lead.memberEmail,
            advanceHolderTitle: lead.designation
          }));
        }
      }
    }
    setErrors({});
  }, [initialData, isOpen, nextTourRef, availableMembers.length]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "whoPaid") {
      if (value === "Paid by Company Advance") {
        updated.advanceHolderUpi = "N/A — Company Advance";
      } else if (formData.advanceHolderUpi === "N/A — Company Advance") {
        updated.advanceHolderUpi = "";
      }
    }

    setFormData(updated);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Quick select an Advance Holder from available members
  const handleSelectAdvanceHolder = (e) => {
    const email = e.target.value;
    setSelectedAdvanceHolderEmail(email);

    if (!email) return;

    const member = availableMembers.find((m) => m.memberEmail === email);
    if (member) {
      setFormData((prev) => ({
        ...prev,
        advanceHolderName: member.memberName,
        advanceHolderEmail: member.memberEmail,
        advanceHolderTitle: member.designation
      }));

      // Ensure advance holder is included in selected tour members
      if (!selectedMemberEmails.includes(member.memberEmail)) {
        setSelectedMemberEmails((prev) => [...prev, member.memberEmail]);
      }

      setErrors((prev) => ({
        ...prev,
        advanceHolderName: null,
        advanceHolderEmail: null
      }));
    }
  };

  // Toggle member inclusion for this tour
  const handleToggleMember = (email) => {
    setSelectedMemberEmails((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSelectAllMembers = () => {
    setSelectedMemberEmails(availableMembers.map((m) => m.memberEmail));
  };

  const handleClearAllMembers = () => {
    setSelectedMemberEmails([]);
  };

  // Add a new member to the directory
  const handleSaveNewMember = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newMemberData.memberName.trim()) errs.memberName = "Colleague name is required";
    if (!newMemberData.memberEmail.trim()) errs.memberEmail = "Email is required";

    if (Object.keys(errs).length > 0) {
      setNewMemberErrors(errs);
      return;
    }

    setIsSavingMember(true);
    try {
      let createdMember = null;
      try {
        createdMember = await createCompanyMember(newMemberData);
      } catch (apiErr) {
        // Fallback local member creation
        createdMember = {
          ...newMemberData,
          id: `CM-${Date.now()}`
        };
      }

      const updatedList = [...availableMembers, createdMember];
      setAvailableMembers(updatedList);

      // Automatically select the new member for this tour
      setSelectedMemberEmails((prev) => [...prev, createdMember.memberEmail]);

      // If user marked them as advance holder, automatically set them in form
      if (newMemberData.isAdvanceHolder === "Yes") {
        setSelectedAdvanceHolderEmail(createdMember.memberEmail);
        setFormData((prev) => ({
          ...prev,
          advanceHolderName: createdMember.memberName,
          advanceHolderEmail: createdMember.memberEmail,
          advanceHolderTitle: createdMember.designation
        }));
      }

      // Reset and close
      setNewMemberData({
        memberName: "",
        memberEmail: "",
        designation: "Engineer",
        department: "Operations",
        isAdvanceHolder: "No",
        defaultNotes: ""
      });
      setNewMemberErrors({});
      setIsAddMemberOpen(false);
    } catch (err) {
      alert("Failed to add colleague: " + err.message);
    } finally {
      setIsSavingMember(false);
    }
  };

  // Calculate live dynamic policy limits for selected members
  const selectedMembers = availableMembers.filter((m) =>
    selectedMemberEmails.includes(m.memberEmail)
  );

  const durationDays = Number(formData.duration) || 1;
  const totalDailyPolicyLimit = selectedMembers.reduce((sum, m) => {
    const policy = getPolicyLimit(m.designation, formData.cityTier, formData.category);
    return sum + (policy ? policy.limit : 1200);
  }, 0);
  const totalTourPolicyLimit = totalDailyPolicyLimit * durationDays;
  const billAmount = Number(formData.totalBillAmount) || 0;
  const isOverBudget = billAmount > 0 && billAmount > totalTourPolicyLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.tourClaimRef.trim()) newErrors.tourClaimRef = "Tour Claim Ref is required";
    if (!formData.advanceHolderName.trim()) newErrors.advanceHolderName = "Advance Holder Name is required";
    if (!formData.advanceHolderEmail.trim()) newErrors.advanceHolderEmail = "Email is required";
    if (!formData.tourTitle.trim()) newErrors.tourTitle = "Tour Title is required";
    if (!formData.expenseDate) newErrors.expenseDate = "Date is required";
    if (!formData.vendorName.trim()) newErrors.vendorName = "Vendor Name is required";
    if (!formData.totalBillAmount || Number(formData.totalBillAmount) <= 0) {
      newErrors.totalBillAmount = "Enter a valid bill amount (> 0)";
    }
    if (selectedMembers.length === 0) {
      newErrors.selectedMembers = "Please select at least 1 team member for this tour.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Package selected members with their calculated daily rate
    const payloadMembers = selectedMembers.map((m) => {
      const policy = getPolicyLimit(m.designation, formData.cityTier, formData.category);
      return {
        tourClaimRef: formData.tourClaimRef,
        memberName: m.memberName,
        memberEmail: m.memberEmail,
        designation: m.designation,
        department: m.department || "Operations",
        isAdvanceHolder: m.memberEmail === formData.advanceHolderEmail ? "Yes" : (m.isAdvanceHolder || "No"),
        dailyRate: policy ? policy.limit : 1200,
        memberNotes: m.defaultNotes || ""
      };
    });

    onSave({
      ...formData,
      totalBillAmount: Number(formData.totalBillAmount),
      duration: durationDays,
      selectedMembers: payloadMembers
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: "62rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="modal-header-bar">
          <h3 className="modal-header-title">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              groups
            </span>
            <span>{initialData ? "Edit Team Tour Claim" : "New Team / Group Tour Claim"}</span>
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn-stitch-secondary"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "0.35rem 0.75rem",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
              onClick={() => setIsAddMemberOpen(true)}
              title="Add a new member to the team directory"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
              <span>+ Add Member</span>
            </button>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* Body */}
          <div className="modal-form-body">
            {/* SECTION 1: TEAM MEMBERS SELECTION & ADD MEMBER */}
            <div className="member-selection-container" style={{ marginBottom: "1.25rem" }}>
              <div className="member-selection-header">
                <div className="member-selection-title">
                  <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontSize: "18px" }}>
                    group_add
                  </span>
                  <span>Team Members on this Tour</span>
                  <span
                    style={{
                      background: "var(--secondary)",
                      color: "#ffffff",
                      fontSize: "11px",
                      padding: "1px 8px",
                      borderRadius: "10px",
                      fontWeight: 600
                    }}
                  >
                    {selectedMembers.length} Selected
                  </span>
                </div>
                <div className="member-selection-actions">
                  <button
                    type="button"
                    className="btn-stitch-secondary"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "11px" }}
                    onClick={handleSelectAllMembers}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn-stitch-secondary"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "11px" }}
                    onClick={handleClearAllMembers}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    className="btn-stitch-primary"
                    style={{ padding: "0.25rem 0.75rem", fontSize: "11px", display: "flex", alignItems: "center", gap: "0.25rem" }}
                    onClick={() => setIsAddMemberOpen(true)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>add</span>
                    <span>Add Member</span>
                  </button>
                </div>
              </div>

              {errors.selectedMembers && (
                <div style={{ color: "var(--error)", fontSize: "12px", fontWeight: 500 }}>
                  {errors.selectedMembers}
                </div>
              )}

              {/* Grid of Selectable Members */}
              <div className="member-grid-selector">
                {availableMembers.map((member) => {
                  const isChecked = selectedMemberEmails.includes(member.memberEmail);
                  const policy = getPolicyLimit(member.designation, formData.cityTier, formData.category);
                  const rate = policy ? policy.limit : 1200;
                  const initials = member.memberName
                    ? member.memberName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "TM";

                  return (
                    <div
                      key={member.memberEmail}
                      className={`member-card-selectable ${isChecked ? "selected" : ""}`}
                      onClick={() => handleToggleMember(member.memberEmail)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--secondary)" }}
                      />
                      <div className="member-avatar-pill">{initials}</div>
                      <div className="member-info-col">
                        <div className="member-card-name" title={member.memberName}>
                          {member.memberName}
                        </div>
                        <div className="member-card-meta">
                          <span>{member.designation}</span>
                          <span>•</span>
                          <span className="member-rate-badge">₹{rate.toLocaleString("en-IN")}/day</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Policy Allowance Live Calculator Bar */}
              <div className="member-summary-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <span>
                    <strong>Selected Staff:</strong> {selectedMembers.length}
                  </span>
                  <span>
                    <strong>Combined Daily Rate:</strong> ₹{totalDailyPolicyLimit.toLocaleString("en-IN")}/day
                  </span>
                  <span>
                    <strong>Policy Ceiling ({durationDays} days):</strong>{" "}
                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                      ₹{totalTourPolicyLimit.toLocaleString("en-IN")}
                    </span>
                  </span>
                </div>
                {billAmount > 0 && (
                  <div>
                    {isOverBudget ? (
                      <span
                        style={{
                          color: "var(--error)",
                          background: "var(--error-container)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "11px"
                        }}
                      >
                        ⚠️ Exceeds policy ceiling by ₹{(billAmount - totalTourPolicyLimit).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#004a32",
                          background: "#d1e7dd",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "11px"
                        }}
                      >
                        ✓ Within policy limit
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: FORM DETAILS */}
            <div className="modal-form-grid">
              {/* Tour Ref */}
              <div className="form-field-group">
                <label className="modal-label">
                  Tour Claim Ref <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="tourClaimRef"
                  className="modal-input"
                  placeholder="e.g. TOUR-001"
                  value={formData.tourClaimRef}
                  onChange={handleChange}
                />
                {errors.tourClaimRef && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.tourClaimRef}</span>
                )}
              </div>

              {/* Tour Project Title */}
              <div className="form-field-group col-span-2">
                <label className="modal-label">
                  Tour / Project Title <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="tourTitle"
                  className="modal-input"
                  placeholder="e.g. Pune Plant Commissioning"
                  value={formData.tourTitle}
                  onChange={handleChange}
                />
                {errors.tourTitle && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.tourTitle}</span>
                )}
              </div>

              {/* QUICK SELECT ADVANCE HOLDER FROM MEMBERS */}
              <div className="form-field-group col-span-3 quick-advance-selector-bar">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label className="modal-label" style={{ fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.35rem", margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--secondary)" }}>
                      badge
                    </span>
                    <span>Quick-Select Advance Holder from Added Members:</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                    Auto-fills Name, Email & Designation
                  </span>
                </div>
                <select
                  className="modal-select"
                  value={selectedAdvanceHolderEmail}
                  onChange={handleSelectAdvanceHolder}
                  style={{ background: "#ffffff" }}
                >
                  <option value="">-- Choose from Team Members (or fill fields manually below) --</option>
                  {availableMembers.map((m) => (
                    <option key={m.memberEmail} value={m.memberEmail}>
                      {m.memberName} — {m.designation} ({m.department || "Operations"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Advance Holder Name */}
              <div className="form-field-group">
                <label className="modal-label">
                  Advance Holder Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="advanceHolderName"
                  className="modal-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.advanceHolderName}
                  onChange={handleChange}
                />
                {errors.advanceHolderName && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.advanceHolderName}</span>
                )}
              </div>

              {/* Advance Holder Email */}
              <div className="form-field-group">
                <label className="modal-label">
                  Advance Holder Email <span className="req-star">*</span>
                </label>
                <input
                  type="email"
                  name="advanceHolderEmail"
                  className="modal-input"
                  placeholder="name@abhyudyayatech.com"
                  value={formData.advanceHolderEmail}
                  onChange={handleChange}
                />
                {errors.advanceHolderEmail && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.advanceHolderEmail}</span>
                )}
              </div>

              {/* Advance Holder Title */}
              <div className="form-field-group">
                <label className="modal-label">
                  Advance Holder Title <span className="req-star">*</span>
                </label>
                <select
                  name="advanceHolderTitle"
                  className="modal-select"
                  value={formData.advanceHolderTitle}
                  onChange={handleChange}
                >
                  {DESIGNATION_GRADES.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Who Paid */}
              <div className="form-field-group">
                <label className="modal-label">
                  Who Paid? <span className="req-star">*</span>
                </label>
                <select
                  name="whoPaid"
                  className="modal-select"
                  value={formData.whoPaid}
                  onChange={handleChange}
                >
                  {WHO_PAID_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Advance Holder UPI */}
              <div className="form-field-group">
                <label className="modal-label">Advance Holder UPI ID</label>
                <input
                  type="text"
                  name="advanceHolderUpi"
                  className="modal-input"
                  placeholder="e.g. rahul@upi"
                  value={formData.advanceHolderUpi}
                  onChange={handleChange}
                  disabled={formData.whoPaid === "Paid by Company Advance"}
                />
              </div>

              {/* Expense Date */}
              <div className="form-field-group">
                <label className="modal-label">
                  Expense Date <span className="req-star">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  className="modal-input"
                  value={formData.expenseDate}
                  onChange={handleChange}
                />
                {errors.expenseDate && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.expenseDate}</span>
                )}
              </div>

              {/* Category */}
              <div className="form-field-group">
                <label className="modal-label">
                  Expense Category <span className="req-star">*</span>
                </label>
                <select
                  name="category"
                  className="modal-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* City Tier */}
              <div className="form-field-group">
                <label className="modal-label">
                  Location / City Tier <span className="req-star">*</span>
                </label>
                <select
                  name="cityTier"
                  className="modal-select"
                  value={formData.cityTier}
                  onChange={handleChange}
                >
                  {CITY_TIERS.map((tier) => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="form-field-group">
                <label className="modal-label">
                  Duration (Days/Months) <span className="req-star">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  min="1"
                  className="modal-input"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>

              {/* Vendor */}
              <div className="form-field-group">
                <label className="modal-label">
                  Vendor / Hotel Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="vendorName"
                  className="modal-input"
                  placeholder="e.g. Sayaji Hotel Pune"
                  value={formData.vendorName}
                  onChange={handleChange}
                />
                {errors.vendorName && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.vendorName}</span>
                )}
              </div>

              {/* Bill / Invoice No */}
              <div className="form-field-group">
                <label className="modal-label">
                  Bill / Invoice No <span style={{ color: "var(--on-surface-variant)", fontSize: "11px", fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="billNumber"
                  className="modal-input"
                  placeholder="e.g. SAYAJI-8812 (optional)"
                  value={formData.billNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Total Bill Amount */}
              <div className="form-field-group">
                <label className="modal-label">
                  Total Bill Amount (₹) <span className="req-star">*</span>
                </label>
                <input
                  type="number"
                  name="totalBillAmount"
                  min="0"
                  className="modal-input"
                  placeholder="e.g. 12000"
                  value={formData.totalBillAmount}
                  onChange={handleChange}
                  style={{ fontWeight: 600, color: "var(--primary)" }}
                />
                {errors.totalBillAmount && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.totalBillAmount}</span>
                )}
              </div>

              {/* Remarks */}
              <div className="form-field-group col-span-3">
                <label className="modal-label">Business Purpose & Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  className="modal-textarea"
                  placeholder="e.g. 3 team members accommodated for 2 nights for plant installation"
                  value={formData.remarks}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="modal-footer-bar">
            <button
              type="button"
              className="btn-stitch-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-stitch-primary"
            >
              <span>{initialData ? "Update Tour Claim" : "Save Tour Claim"}</span>
            </button>
          </div>
        </form>

        {/* SUB-MODAL: ADD NEW MEMBER */}
        {isAddMemberOpen && (
          <div
            className="modal-overlay"
            style={{ zIndex: 60, backgroundColor: "rgba(0, 0, 0, 0.55)" }}
            onClick={() => setIsAddMemberOpen(false)}
          >
            <div
              className="modal-content-card"
              style={{ maxWidth: "34rem", borderRadius: "0.75rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-bar" style={{ padding: "0.875rem 1.25rem" }}>
                <h4 className="modal-header-title" style={{ fontSize: "16px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>person_add</span>
                  <span>Add Colleague to Team Directory</span>
                </h4>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                </button>
              </div>

              <form onSubmit={handleSaveNewMember} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div className="form-field-group">
                  <label className="modal-label">Colleague Full Name <span className="req-star">*</span></label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Vikram Rao"
                    value={newMemberData.memberName}
                    onChange={(e) => {
                      setNewMemberData({ ...newMemberData, memberName: e.target.value });
                      if (newMemberErrors.memberName) setNewMemberErrors({ ...newMemberErrors, memberName: null });
                    }}
                    autoFocus
                  />
                  {newMemberErrors.memberName && (
                    <span style={{ color: "var(--error)", fontSize: "11px" }}>{newMemberErrors.memberName}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Company Email Address <span className="req-star">*</span></label>
                  <input
                    type="email"
                    className="modal-input"
                    placeholder="e.g. vikram@abhyudaya.tech"
                    value={newMemberData.memberEmail}
                    onChange={(e) => {
                      setNewMemberData({ ...newMemberData, memberEmail: e.target.value });
                      if (newMemberErrors.memberEmail) setNewMemberErrors({ ...newMemberErrors, memberEmail: null });
                    }}
                  />
                  {newMemberErrors.memberEmail && (
                    <span style={{ color: "var(--error)", fontSize: "11px" }}>{newMemberErrors.memberEmail}</span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-field-group">
                    <label className="modal-label">Designation / Grade <span className="req-star">*</span></label>
                    <select
                      className="modal-select"
                      value={newMemberData.designation}
                      onChange={(e) => setNewMemberData({ ...newMemberData, designation: e.target.value })}
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
                      value={newMemberData.department}
                      onChange={(e) => setNewMemberData({ ...newMemberData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Set as Advance Holder for this tour?</label>
                  <select
                    className="modal-select"
                    value={newMemberData.isAdvanceHolder}
                    onChange={(e) => setNewMemberData({ ...newMemberData, isAdvanceHolder: e.target.value })}
                  >
                    <option value="No">No — Covered Team Member</option>
                    <option value="Yes">Yes — Lead Advance Holder</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="modal-label">Notes (Optional)</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Site Engineer"
                    value={newMemberData.defaultNotes}
                    onChange={(e) => setNewMemberData({ ...newMemberData, defaultNotes: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-stitch-secondary"
                    onClick={() => setIsAddMemberOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-stitch-primary"
                    disabled={isSavingMember}
                  >
                    <span>{isSavingMember ? "Adding..." : "Save & Select Member"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
