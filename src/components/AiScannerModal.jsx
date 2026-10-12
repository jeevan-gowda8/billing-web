import React, { useState, useRef } from "react";

export default function AiScannerModal({ isOpen, onClose, onExtracted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExtract = () => {
    setIsProcessing(true);

    // Realistic OCR parsing simulation
    setTimeout(() => {
      setIsProcessing(false);

      // Extract details tailored or smart default
      const mockExtracted = {
        vendorName: selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Taj Business Suites",
        category: "Hotel",
        claimAmount: 12000,
        expenseDate: new Date().toISOString().split("T")[0],
        duration: 2,
        billNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        whoPaid: "Paid by Employee",
        cityTier: "Metro",
        remarks: "AI OCR Extracted: Client onboarding and regional review lodging.",
        projectName: "Project Titan"
      };

      onExtracted(mockExtracted);
      onClose();
    }, 650);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: "580px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with vibrant blue background matching UI 2 */}
        <div
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--on-secondary)",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "18px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              document_scanner
            </span>
            <span>AI Receipt OCR Smart Scanner</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "transparent",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "var(--transition)"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              close
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Dashed Dropzone */}
          <div
            className={`scanner-dropzone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px", color: "var(--secondary)", marginBottom: "0.5rem", display: "block" }}
            >
              cloud_upload
            </span>
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--on-surface)",
                marginBottom: "0.25rem"
              }}
            >
              {selectedFile ? selectedFile.name : "Drop receipt image or PDF here"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB · Click to choose different file`
                : "Supports PNG, JPG, PDF up to 25MB. Auto-extracts vendor, GSTIN, and amount."}
            </div>
          </div>

          {/* AI Banner */}
          <div className="scanner-highlight-box">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "24px", color: "var(--tertiary-container)" }}
            >
              auto_awesome
            </span>
            <div style={{ fontSize: "13px", color: "var(--on-surface)", fontWeight: 500 }}>
              OCR Simulation Ready: Drop or select receipt to test instant field extraction.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "var(--surface-container-low)",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem",
            borderTop: "1px solid rgba(197, 197, 211, 0.25)"
          }}
        >
          <button
            type="button"
            className="btn-stitch-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-stitch-ai"
            onClick={handleExtract}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing OCR..." : "Extract & Populate"}
          </button>
        </div>
      </div>
    </div>
  );
}
