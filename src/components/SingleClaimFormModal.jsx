import React, { useState, useEffect } from "react";
import {
  DESIGNATION_GRADES,
  CITY_TIERS,
  EXPENSE_CATEGORIES,
  DEPARTMENTS,
  WHO_PAID_OPTIONS,
  evaluateClaimPolicy
} from "../data/policyMatrix";

export default function SingleClaimFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextSlNo = 1
}) {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeEmail: "",
    designation: "Engineer",
    department: "Engineering",
    expenseDate: new Date().toISOString().slice(0, 10),
    category: "Hotel / Staying",
    cityTier: "Metro (5 Cities)",
    duration: 1,
    vendorName: "",
    billNumber: "",
    claimAmount: "",
    whoPaid: "Paid by Employee",
    upiId: "",
    projectName: "",
    remarks: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        claimAmount: initialData.claimAmount || "",
        duration: initialData.duration || 1
      });
    } else {
      setFormData({
        employeeName: "",
        employeeEmail: "",
        designation: "Engineer",
        department: "Engineering",
        expenseDate: new Date().toISOString().slice(0, 10),
        category: "Hotel / Staying",
        cityTier: "Metro (5 Cities)",
        duration: 1,
        vendorName: "",
        billNumber: "",
        claimAmount: "",
        whoPaid: "Paid by Employee",
        upiId: "",
        projectName: "",
        remarks: ""
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time policy evaluation
  const policyAudit = evaluateClaimPolicy(
    formData.designation,
    formData.cityTier,
    formData.category,
    formData.duration,
    formData.claimAmount
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "whoPaid") {
      if (value === "Paid by Company Advance") {
        updated.upiId = "N/A — Company Advance";
      } else if (formData.upiId === "N/A — Company Advance") {
        updated.upiId = "";
      }
    }

    setFormData(updated);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.employeeName.trim()) newErrors.employeeName = "Employee Name is required";
    if (!formData.employeeEmail.trim()) newErrors.employeeEmail = "Email is required";
    if (!formData.expenseDate) newErrors.expenseDate = "Date is required";
    if (!formData.vendorName.trim()) newErrors.vendorName = "Vendor Name is required";
    if (!formData.claimAmount || Number(formData.claimAmount) <= 0) {
      newErrors.claimAmount = "Enter a valid claim amount (> 0)";
    }
    if (formData.whoPaid === "Paid by Employee" && !formData.upiId.trim()) {
      newErrors.upiId = "UPI ID required for reimbursement";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      claimAmount: Number(formData.claimAmount),
      duration: Number(formData.duration) || 1
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="modal-header-bar">
          <h3 className="modal-header-title">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              receipt_long
            </span>
            <span>{initialData ? "Edit Single Employee Claim" : "New Single Employee Claim"}</span>
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* Form Body */}
          <div className="modal-form-body">
            <div className="modal-form-grid">
              {/* Sl No */}
              <div className="form-field-group">
                <label className="modal-label">Sl No</label>
                <input
                  type="text"
                  className="modal-input"
                  readOnly
                  value={String(initialData?.slNo || nextSlNo).padStart(2, "0")}
                  style={{ backgroundColor: "var(--surface-container)" }}
                />
              </div>

              {/* Employee Full Name */}
              <div className="form-field-group">
                <label className="modal-label">
                  Employee Full Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="employeeName"
                  className="modal-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.employeeName}
                  onChange={handleChange}
                />
                {errors.employeeName && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.employeeName}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-field-group">
                <label className="modal-label">
                  Email <span className="req-star">*</span>
                </label>
                <input
                  type="email"
                  name="employeeEmail"
                  className="modal-input"
                  placeholder="name@abhyudyayatech.com"
                  value={formData.employeeEmail}
                  onChange={handleChange}
                />
                {errors.employeeEmail && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.employeeEmail}</span>
                )}
              </div>

              {/* Designation Grade */}
              <div className="form-field-group">
                <label className="modal-label">
                  Designation Grade <span className="req-star">*</span>
                </label>
                <select
                  name="designation"
                  className="modal-select"
                  value={formData.designation}
                  onChange={handleChange}
                >
                  {DESIGNATION_GRADES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="form-field-group">
                <label className="modal-label">
                  Department <span className="req-star">*</span>
                </label>
                <select
                  name="department"
                  className="modal-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
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

              {/* Expense Category */}
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

              {/* Location Tier */}
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
                  Duration (Days / Months) <span className="req-star">*</span>
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

              {/* Vendor Name */}
              <div className="form-field-group">
                <label className="modal-label">
                  Vendor Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="vendorName"
                  className="modal-input"
                  placeholder="e.g. Lemon Tree Premier"
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
                  placeholder="e.g. LT-INV-9902 (optional)"
                  value={formData.billNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Claim Amount */}
              <div className="form-field-group">
                <label className="modal-label">
                  Claim Amount (₹) <span className="req-star">*</span>
                </label>
                <input
                  type="number"
                  name="claimAmount"
                  min="0"
                  step="any"
                  className="modal-input"
                  placeholder="e.g. 3000"
                  value={formData.claimAmount}
                  onChange={handleChange}
                  style={{ fontWeight: 600, color: "var(--primary)" }}
                />
                {errors.claimAmount && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.claimAmount}</span>
                )}
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

              {/* UPI ID */}
              <div className="form-field-group">
                <label className="modal-label">UPI ID / Bank Ref</label>
                <input
                  type="text"
                  name="upiId"
                  className="modal-input"
                  placeholder="e.g. name@okhdfcbank"
                  value={formData.upiId}
                  onChange={handleChange}
                  disabled={formData.whoPaid === "Paid by Company Advance"}
                />
                {errors.upiId && (
                  <span style={{ color: "var(--error)", fontSize: "11px" }}>{errors.upiId}</span>
                )}
              </div>

              {/* Project / Client Name */}
              <div className="form-field-group">
                <label className="modal-label">Project / Client Name</label>
                <input
                  type="text"
                  name="projectName"
                  className="modal-input"
                  placeholder="e.g. Pune Automation Phase 1"
                  value={formData.projectName}
                  onChange={handleChange}
                />
              </div>

              {/* Business Purpose */}
              <div className="form-field-group col-span-3">
                <label className="modal-label">Business Purpose & Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  className="modal-textarea"
                  placeholder="Detailed justification for audit compliance..."
                  value={formData.remarks}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Live Policy Limit Validation Box matching Stitch UI */}
            {policyAudit.status === "exceeds" && (
              <div className="modal-policy-warning">
                <span className="material-symbols-outlined text-error" style={{ fontSize: "22px", color: "var(--error)" }}>
                  warning
                </span>
                <div>
                  <div className="warning-title">Policy Limit Warning Detected</div>
                  <div className="warning-desc">{policyAudit.message}</div>
                </div>
              </div>
            )}
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
              <span>{initialData ? "Update Claim" : "Submit Claim"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
