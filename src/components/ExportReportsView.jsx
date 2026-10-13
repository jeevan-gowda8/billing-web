import React, { useState } from "react";
import {
  generateSiteExpenseExcel,
  generateSingleEmployeeExcel,
  generateTeamTourExcel,
  mapClaimsToSiteExpenseRows,
  DEFAULT_SITE_EXPENSE_SAMPLE
} from "../utils/excelGenerator";

export default function ExportReportsView({
  singleClaims = [],
  teamClaims = [],
  rosterRows = [],
  companyMembers = [],
  onNavigateTab
}) {
  const [selectedFormat, setSelectedFormat] = useState("site_expense"); // "site_expense" | "single" | "team"
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  // --- Site Expense State ---
  const [siteConfig, setSiteConfig] = useState({
    companyName: "INTELITEK EDU SOLUTIONS",
    companyAddressLine1: "# 14/2 And 14/5, Off Magadi Main Road,",
    companyAddressLine2: "Chennanalli Village,Yerappa Industrial Area, Bangalore (South) - 562130.",
    employeeName: companyMembers[0]?.memberName || singleClaims[0]?.employeeName || "GURUNATH BAGADE",
    placeVisited: singleClaims[0]?.projectName || "ODISA",
    purposeOfVisit: "INSTALLATION AND TRAINING",
    advanceTaken: 10000
  });

  const [siteRows, setSiteRows] = useState(() => {
    if (singleClaims.length > 0) {
      return mapClaimsToSiteExpenseRows(singleClaims);
    }
    return DEFAULT_SITE_EXPENSE_SAMPLE.rows;
  });

  const showNotification = (msg) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Calculations for Site Expense
  const totalFare = siteRows.reduce((sum, r) => sum + (Number(r.fare) || 0), 0);
  const totalLodging = siteRows.reduce((sum, r) => sum + (Number(r.lodgingAllows) || 0), 0);
  const totalBoarding = siteRows.reduce((sum, r) => sum + (Number(r.boardingAllows) || 0), 0);
  const totalFood = siteRows.reduce((sum, r) => sum + (Number(r.foodExpenses) || 0), 0);
  const totalMisc = siteRows.reduce((sum, r) => sum + (Number(r.miscExpenses) || 0), 0);
  const grandTotalAmount = totalFare + totalLodging + totalBoarding + totalFood + totalMisc;
  const advanceTakenNum = Number(siteConfig.advanceTaken) || 0;
  const balanceCash = advanceTakenNum - grandTotalAmount;

  // Handlers for Site Expense
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setSiteConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadDemoSample = () => {
    setSiteConfig({
      companyName: DEFAULT_SITE_EXPENSE_SAMPLE.companyName,
      companyAddressLine1: DEFAULT_SITE_EXPENSE_SAMPLE.companyAddressLine1,
      companyAddressLine2: DEFAULT_SITE_EXPENSE_SAMPLE.companyAddressLine2,
      employeeName: DEFAULT_SITE_EXPENSE_SAMPLE.employeeName,
      placeVisited: DEFAULT_SITE_EXPENSE_SAMPLE.placeVisited,
      purposeOfVisit: DEFAULT_SITE_EXPENSE_SAMPLE.purposeOfVisit,
      advanceTaken: DEFAULT_SITE_EXPENSE_SAMPLE.advanceTaken
    });
    setSiteRows(DEFAULT_SITE_EXPENSE_SAMPLE.rows);
    showNotification("Loaded Intelitek Tour Bill reference sample!");
  };

  const handleLoadFromSingleClaims = () => {
    if (singleClaims.length === 0) {
      alert("No single claims found in database to load.");
      return;
    }
    const mapped = mapClaimsToSiteExpenseRows(singleClaims);
    setSiteRows(mapped);
    setSiteConfig((prev) => ({
      ...prev,
      employeeName: singleClaims[0]?.employeeName || prev.employeeName,
      placeVisited: singleClaims[0]?.cityTier || singleClaims[0]?.projectName || prev.placeVisited,
      purposeOfVisit: singleClaims[0]?.projectName || "Official Tour"
    }));
    showNotification(`Pre-filled ${mapped.length} row(s) from recorded single claims!`);
  };

  const handleClearRows = () => {
    setSiteRows([
      {
        date: new Date().toISOString().slice(0, 10),
        stationFrom: "",
        stationTo: "",
        modeOfTravel: "Cab",
        fare: null,
        modeOfFare: "Online",
        lodgingAllows: null,
        boardingAllows: null,
        foodExpenses: null,
        miscExpenses: null
      }
    ]);
    showNotification("Reset to empty template.");
  };

  // Export Trigger Handlers
  const handleDownloadSiteExpense = async () => {
    try {
      setIsExporting(true);
      await generateSiteExpenseExcel({
        companyName: siteConfig.companyName,
        companyAddressLine1: siteConfig.companyAddressLine1,
        companyAddressLine2: siteConfig.companyAddressLine2,
        employeeName: siteConfig.employeeName,
        placeVisited: siteConfig.placeVisited,
        purposeOfVisit: siteConfig.purposeOfVisit,
        advanceTaken: siteConfig.advanceTaken,
        rows: siteRows
      });
      showNotification("Site Expense / Tour Bill Excel downloaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to export Site Expense Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSingleEmployee = async () => {
    if (singleClaims.length === 0) {
      alert("Please add at least one single claim before exporting.");
      return;
    }
    try {
      setIsExporting(true);
      await generateSingleEmployeeExcel(singleClaims);
      showNotification("Single Employee Reimbursement Excel exported successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to export Single Employee Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTeamTour = async () => {
    if (teamClaims.length === 0) {
      alert("Please add at least one team tour claim before exporting.");
      return;
    }
    try {
      setIsExporting(true);
      await generateTeamTourExcel(teamClaims, rosterRows);
      showNotification("Team Tour Reimbursement Excel exported successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to export Team Tour Excel: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* 1. Modern Sapphire Executive Hero Header */}
      <div className="export-hero-banner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#93c5fd"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                table_chart_view
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              Export & Reports Center
            </h2>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "#e2e8f0",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: "12px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              Excel .XLSX
            </span>
          </div>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "13.5px", maxWidth: "720px", margin: 0, lineHeight: 1.5 }}>
            Export professionally structured Microsoft Excel workbooks for on-site travel tour bills, individual employee claims, and group deputation expenses with embedded audit receipts and handbook policy limits.
          </p>
        </div>

        {exportNotice && (
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              padding: "0.6rem 1.15rem",
              borderRadius: "0.625rem",
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
              animation: "fadeIn 0.2s ease"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#16a34a" }}>
              check_circle
            </span>
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Sleek Template Switcher Cards */}
      <div className="template-cards-grid">
        {/* Card 1: Site Expense Tour Bill */}
        <div
          onClick={() => setSelectedFormat("site_expense")}
          className={`template-card ${selectedFormat === "site_expense" ? "active" : ""}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="template-icon-wrapper">
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  directions_car
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Site Expense / Tour Bill
                </h3>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                  Intelitek Edu Solutions Format
                </span>
              </div>
            </div>
            <span
              style={{
                backgroundColor: selectedFormat === "site_expense" ? "#dbeafe" : "#f1f5f9",
                color: selectedFormat === "site_expense" ? "#1e40af" : "#64748b",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px"
              }}
            >
              SITE EXPENSE.xlsx
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
            Official tour bill with travel legs, station from/to, mode fares, lodging, boarding, food & misc allowances, advance taken, and balance cash to deposit.
          </p>
        </div>

        {/* Card 2: Single Employee Claims */}
        <div
          onClick={() => setSelectedFormat("single")}
          className={`template-card ${selectedFormat === "single" ? "active" : ""}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="template-icon-wrapper">
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  receipt_long
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Single Employee Claims
                </h3>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                  16-Column Corporate Template
                </span>
              </div>
            </div>
            <span
              style={{
                backgroundColor: selectedFormat === "single" ? "#dbeafe" : "#f1f5f9",
                color: selectedFormat === "single" ? "#1e40af" : "#64748b",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px"
              }}
            >
              {singleClaims.length} Claims
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
            Individual employee claim spreadsheet with attached receipt sheet and integrated ATS Policy Rate Matrix verification limits.
          </p>
        </div>

        {/* Card 3: Team / Group Tour Claims */}
        <div
          onClick={() => setSelectedFormat("team")}
          className={`template-card ${selectedFormat === "team" ? "active" : ""}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="template-icon-wrapper">
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  groups
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Team / Group Tour Claims
                </h3>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                  Multi-Member Deputation Roster
                </span>
              </div>
            </div>
            <span
              style={{
                backgroundColor: selectedFormat === "team" ? "#dbeafe" : "#f1f5f9",
                color: selectedFormat === "team" ? "#1e40af" : "#64748b",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px"
              }}
            >
              {teamClaims.length} Tours
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
            Multi-sheet workbook containing Group Tour Claims, Team Roster Breakdown, attached tour bills, and handbook aggregate ceiling rates.
          </p>
        </div>
      </div>

      {/* VIEW 1: SITE EXPENSE / TOUR BILL FORMAT */}
      {selectedFormat === "site_expense" && (
        <div className="flex flex-col gap-5">
          {/* Action Toolbar */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "0.85rem 1.25rem",
              borderRadius: "0.875rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.85rem"
            }}
          >
            {/* Quick Data Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.25rem" }}>
                Pre-Fill:
              </span>
              <button
                type="button"
                className="btn-stitch-secondary"
                style={{ padding: "0.45rem 0.85rem", fontSize: "12px", borderRadius: "0.5rem" }}
                onClick={handleLoadFromSingleClaims}
                title="Populate from single claims saved in database"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#2563eb" }}>sync</span>
                <span>From Saved Claims ({singleClaims.length})</span>
              </button>

              <button
                type="button"
                className="btn-stitch-secondary"
                style={{ padding: "0.45rem 0.85rem", fontSize: "12px", borderRadius: "0.5rem" }}
                onClick={handleLoadDemoSample}
                title="Load the reference sample analyzed from SITE EXPENSE.xlsx"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#0891b2" }}>auto_awesome</span>
                <span>Reference Sample (ODISA Tour)</span>
              </button>

              <button
                type="button"
                className="btn-stitch-secondary"
                style={{ padding: "0.45rem 0.85rem", fontSize: "12px", color: "#dc2626", borderRadius: "0.5rem" }}
                onClick={handleClearRows}
                title="Reset table to clean blank template"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>restart_alt</span>
                <span>Blank Template</span>
              </button>
            </div>

            {/* Main Export CTA Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn-stitch-primary"
                style={{
                  padding: "0.6rem 1.5rem",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "linear-gradient(135deg, #00236f 0%, #1e40af 100%)",
                  boxShadow: "0 4px 12px rgba(0, 35, 111, 0.25)"
                }}
                onClick={handleDownloadSiteExpense}
                disabled={isExporting}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  download
                </span>
                <span>{isExporting ? "Generating Excel..." : "Download Site Expense (.xlsx)"}</span>
              </button>
            </div>
          </div>

          {/* 3. Tour Bill Parameters Form (Clean 2-Row Layout with Ample Room) */}
          <div className="export-params-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#2563eb" }}>
                badge
              </span>
              <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Tour Bill Header & Financial Parameters
              </h4>
              <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "auto" }}>
                Metadata printed at the top of the exported Excel worksheet
              </span>
            </div>

            {/* Row 1: Company, Employee, Destination */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Company Name
                </label>
                <div className="export-input-wrapper">
                  <span className="material-symbols-outlined export-input-icon">business</span>
                  <select
                    name="companyName"
                    className="export-modern-select"
                    value={siteConfig.companyName}
                    onChange={handleConfigChange}
                  >
                    <option value="INTELITEK EDU SOLUTIONS">INTELITEK EDU SOLUTIONS</option>
                    <option value="ABHYUDAYA TECHNO SOLUTIONS">ABHYUDAYA TECHNO SOLUTIONS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Employee Name *
                </label>
                <div className="export-input-wrapper">
                  <span className="material-symbols-outlined export-input-icon">person</span>
                  <input
                    type="text"
                    name="employeeName"
                    className="export-modern-input"
                    value={siteConfig.employeeName}
                    onChange={handleConfigChange}
                    placeholder="e.g. Gurunath Bagade"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Place Visited *
                </label>
                <div className="export-input-wrapper">
                  <span className="material-symbols-outlined export-input-icon">location_on</span>
                  <input
                    type="text"
                    name="placeVisited"
                    className="export-modern-input"
                    value={siteConfig.placeVisited}
                    onChange={handleConfigChange}
                    placeholder="e.g. ODISA, Bhubaneswar"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Purpose of Visit (Wide) & Advance Taken */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Purpose of Visit
                </label>
                <div className="export-input-wrapper">
                  <span className="material-symbols-outlined export-input-icon">description</span>
                  <input
                    type="text"
                    name="purposeOfVisit"
                    className="export-modern-input"
                    value={siteConfig.purposeOfVisit}
                    onChange={handleConfigChange}
                    placeholder="e.g. INSTALLATION AND TRAINING"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Advance Taken (₹)
                </label>
                <div className="export-input-wrapper">
                  <span className="material-symbols-outlined export-input-icon">payments</span>
                  <input
                    type="number"
                    name="advanceTaken"
                    className="export-modern-input"
                    value={siteConfig.advanceTaken}
                    onChange={handleConfigChange}
                    placeholder="10000"
                    style={{ fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Financial Health & KPI Metrics Cards */}
          <div className="export-metrics-grid">
            {/* Travel Fare */}
            <div className="export-kpi-card">
              <div className="export-kpi-header">
                <span className="export-kpi-title">Total Travel Fare</span>
                <div className="export-kpi-icon-pill" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>directions_car</span>
                </div>
              </div>
              <div className="export-kpi-amount" style={{ color: "#1e40af" }}>
                ₹{totalFare.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Lodging & Stay */}
            <div className="export-kpi-card">
              <div className="export-kpi-header">
                <span className="export-kpi-title">Lodging & Stay</span>
                <div className="export-kpi-icon-pill" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>hotel</span>
                </div>
              </div>
              <div className="export-kpi-amount" style={{ color: "#4338ca" }}>
                ₹{totalLodging.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Food & Allowance */}
            <div className="export-kpi-card">
              <div className="export-kpi-header">
                <span className="export-kpi-title">Food & Allowance</span>
                <div className="export-kpi-icon-pill" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>restaurant</span>
                </div>
              </div>
              <div className="export-kpi-amount" style={{ color: "#b45309" }}>
                ₹{totalFood.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Boarding & Misc */}
            <div className="export-kpi-card">
              <div className="export-kpi-header">
                <span className="export-kpi-title">Boarding & Misc</span>
                <div className="export-kpi-icon-pill" style={{ backgroundColor: "#faf5ff", color: "#7e22ce" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>local_activity</span>
                </div>
              </div>
              <div className="export-kpi-amount" style={{ color: "#6b21a8" }}>
                ₹{(totalBoarding + totalMisc).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Total Tour Bill Claimed */}
            <div
              className="export-kpi-card"
              style={{
                backgroundColor: "#f8fafc",
                borderColor: "#cbd5e1"
              }}
            >
              <div className="export-kpi-header">
                <span className="export-kpi-title" style={{ color: "#00236f", fontWeight: 700 }}>
                  Total Bill Claimed
                </span>
                <div className="export-kpi-icon-pill" style={{ backgroundColor: "#00236f", color: "#ffffff" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>account_balance_wallet</span>
                </div>
              </div>
              <div className="export-kpi-amount" style={{ color: "#00236f", fontSize: "22px" }}>
                ₹{grandTotalAmount.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Settlement Status (Balance / Due) */}
            <div
              className="export-kpi-card"
              style={{
                backgroundColor: balanceCash >= 0 ? "#f0fdf4" : "#fff7ed",
                borderColor: balanceCash >= 0 ? "#86efac" : "#fdba74"
              }}
            >
              <div className="export-kpi-header">
                <span className="export-kpi-title" style={{ color: balanceCash >= 0 ? "#166534" : "#9a3412" }}>
                  {balanceCash >= 0 ? "Refund To Company" : "Due To Employee"}
                </span>
                <div
                  className="export-kpi-icon-pill"
                  style={{
                    backgroundColor: balanceCash >= 0 ? "#16a34a" : "#ea580c",
                    color: "#ffffff"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    {balanceCash >= 0 ? "savings" : "currency_exchange"}
                  </span>
                </div>
              </div>
              <div
                className="export-kpi-amount"
                style={{ color: balanceCash >= 0 ? "#15803d" : "#c2410c", fontSize: "22px" }}
              >
                ₹{Math.abs(balanceCash).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SINGLE EMPLOYEE FORMAT */}
      {selectedFormat === "single" && (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "0.875rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 0.25rem 0", color: "#0f172a" }}>
                Single Employee Reimbursement Export
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Exports all currently recorded individual reimbursement claims into the 16-column ATS Corporate template with high-resolution audit receipts and ATS Policy Rate Matrix sheet included.
              </p>
            </div>

            <button
              type="button"
              className="btn-stitch-primary"
              onClick={handleDownloadSingleEmployee}
              disabled={isExporting || singleClaims.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.5rem",
                background: "linear-gradient(135deg, #00236f 0%, #1e40af 100%)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                download
              </span>
              <span>{isExporting ? "Exporting..." : "Download Single Employee (.xlsx)"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="metric-card">
              <div className="metric-label">Claims to Export</div>
              <div className="metric-value">{singleClaims.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Claim Amount</div>
              <div className="metric-value">
                ₹{singleClaims.reduce((s, c) => s + (Number(c.claimAmount) || 0), 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Unique Employees</div>
              <div className="metric-value">
                {new Set(singleClaims.map((c) => c.employeeEmail || c.employeeName)).size}
              </div>
            </div>
          </div>

          {singleClaims.length === 0 ? (
            <div className="stitch-empty-state">
              <div className="empty-icon-circle">
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>receipt_long</span>
              </div>
              <h4 className="empty-title">No Claims Recorded</h4>
              <p className="empty-description">
                You haven't added any claims yet. Go to Single Employee Claims tab to enter your claims first.
              </p>
              {onNavigateTab && (
                <button
                  type="button"
                  className="btn-stitch-primary"
                  onClick={() => onNavigateTab("single")}
                  style={{ marginTop: "0.5rem" }}
                >
                  Go to Single Claims
                </button>
              )}
            </div>
          ) : (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden" }}>
              <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", fontWeight: 700, fontSize: "12px", color: "#334155" }}>
                Preview of Claims Ready for Export ({singleClaims.length} records)
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="spreadsheet-table" style={{ fontSize: "12px", width: "100%", minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Vendor</th>
                      <th>Receipt</th>
                      <th style={{ textAlign: "right" }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleClaims.slice(0, 15).map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{c.employeeName}</td>
                        <td>{c.expenseDate}</td>
                        <td>{c.category}</td>
                        <td>{c.vendorName || "-"}</td>
                        <td>{c.receiptImage || c.receipt_image ? "📎 Attached" : "—"}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          ₹{Number(c.claimAmount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TEAM / GROUP TOUR FORMAT */}
      {selectedFormat === "team" && (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "0.875rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 0.25rem 0", color: "#0f172a" }}>
                Team / Group Tour Reimbursement Export
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Exports all group tour claims, team member rosters, attached receipts, and multi-member aggregate rate calculations matching Team_Group_Reimbursement_Template.xlsx.
              </p>
            </div>

            <button
              type="button"
              className="btn-stitch-primary"
              onClick={handleDownloadTeamTour}
              disabled={isExporting || teamClaims.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.5rem",
                background: "linear-gradient(135deg, #00236f 0%, #1e40af 100%)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                download
              </span>
              <span>{isExporting ? "Exporting..." : "Download Team Tour (.xlsx)"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="metric-card">
              <div className="metric-label">Tour Claims</div>
              <div className="metric-value">{teamClaims.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Tour Bill</div>
              <div className="metric-value">
                ₹{teamClaims.reduce((s, tc) => s + (Number(tc.totalBillAmount) || 0), 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Roster Members</div>
              <div className="metric-value">{rosterRows.length}</div>
            </div>
          </div>

          {teamClaims.length === 0 ? (
            <div className="stitch-empty-state">
              <div className="empty-icon-circle">
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>groups</span>
              </div>
              <h4 className="empty-title">No Team Tour Claims</h4>
              <p className="empty-description">
                You haven't recorded any group tour claims yet. Go to Team Claims to create a tour claim.
              </p>
              {onNavigateTab && (
                <button
                  type="button"
                  className="btn-stitch-primary"
                  onClick={() => onNavigateTab("team")}
                  style={{ marginTop: "0.5rem" }}
                >
                  Go to Team Claims
                </button>
              )}
            </div>
          ) : (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden" }}>
              <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", fontWeight: 700, fontSize: "12px", color: "#334155" }}>
                Preview of Tour Claims ({teamClaims.length} records)
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="spreadsheet-table" style={{ fontSize: "12px", width: "100%", minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th>Tour Ref</th>
                      <th>Advance Holder</th>
                      <th>Tour Title</th>
                      <th>Expense Date</th>
                      <th>Team Size</th>
                      <th>Receipt</th>
                      <th style={{ textAlign: "right" }}>Bill Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamClaims.map((tc, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: "#2563eb" }}>{tc.tourClaimRef}</td>
                        <td style={{ fontWeight: 600 }}>{tc.advanceHolderName}</td>
                        <td>{tc.tourTitle}</td>
                        <td>{tc.expenseDate}</td>
                        <td>{tc.teamSize || 1} Member(s)</td>
                        <td>{tc.receiptImage || tc.receipt_image ? "📎 Attached" : "—"}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          ₹{Number(tc.totalBillAmount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
