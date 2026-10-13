import React, { useState, useEffect, useRef } from "react";
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
    remarks: "",
    receiptImage: ""
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [previewImageModal, setPreviewImageModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        claimAmount: initialData.claimAmount || "",
        duration: initialData.duration || 1,
        receiptImage: initialData.receiptImage || ""
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
        remarks: "",
        receiptImage: ""
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress/resize if larger than 1200px
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);

        setFormData((prev) => ({ ...prev, receiptImage: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setFormData((prev) => ({ ...prev, receiptImage: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

              {/* Optional Bill Receipt / Invoice Image Upload */}
              <div className="form-field-group col-span-3" style={{ marginTop: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label className="modal-label" style={{ fontWeight: 600, color: "var(--on-surface)", display: "flex", alignItems: "center", gap: "0.35rem", margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "17px", color: "var(--primary)" }}>
                      receipt_long
                    </span>
                    <span>Bill Receipt / Invoice Image</span>
                    <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: 400 }}>
                      (Optional · Embedded into Excel)
                    </span>
                  </label>
                  {formData.receiptImage && (
                    <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "2px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check_circle</span>
                      Receipt Attached
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ display: "none" }}
                />

                {!formData.receiptImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed var(--outline-variant)",
                      borderRadius: "0.5rem",
                      padding: "1rem",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "var(--surface-container-low)",
                      transition: "var(--transition)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.35rem"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--outline-variant)")}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--surface-container)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        add_photo_alternate
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface)" }}>
                      Click to upload bill photo or tax invoice
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                      PNG, JPG, or WEBP. Automatically optimized and embedded into Excel export.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--outline-variant)",
                      backgroundColor: "var(--surface-container-low)",
                      flexWrap: "wrap",
                      gap: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <img
                        src={formData.receiptImage}
                        alt="Receipt preview"
                        onClick={() => setPreviewImageModal(true)}
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "0.375rem",
                          border: "1px solid var(--outline-variant)",
                          cursor: "pointer",
                          boxShadow: "var(--shadow-sm)"
                        }}
                        title="Click to view full image"
                      />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <span>Bill Receipt Photo</span>
                          <span style={{ fontSize: "10px", backgroundColor: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
                            ATTACHED
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                          Attached for {formData.vendorName || "this claim"} · Embedded in Excel
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="btn-stitch-secondary"
                        onClick={() => setPreviewImageModal(true)}
                        style={{ padding: "0.35rem 0.65rem", fontSize: "11px" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>visibility</span>
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        className="btn-stitch-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: "0.35rem 0.65rem", fontSize: "11px" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>swap_horiz</span>
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        className="btn-stitch-secondary"
                        onClick={handleRemoveReceipt}
                        style={{ padding: "0.35rem 0.65rem", fontSize: "11px", color: "var(--error)" }}
                        title="Remove attached receipt"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}
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

        {/* Lightbox Modal for Receipt Full Preview */}
        {previewImageModal && formData.receiptImage && (
          <div
            className="modal-overlay"
            style={{ zIndex: 100, backgroundColor: "rgba(0, 0, 0, 0.85)" }}
            onClick={() => setPreviewImageModal(false)}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#ffffff", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                  Bill Receipt Preview — {formData.vendorName || formData.billNumber || "Attached Receipt"}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(false)}
                  style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>close</span>
                </button>
              </div>
              <img
                src={formData.receiptImage}
                alt="Full receipt"
                style={{
                  maxWidth: "85vw",
                  maxHeight: "80vh",
                  borderRadius: "0.5rem",
                  objectFit: "contain",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
