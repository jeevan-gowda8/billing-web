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

  const handleRowChange = (index, field, value) => {
    setSiteRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddRow = () => {
    const lastRow = siteRows[siteRows.length - 1];
    const newRow = {
      date: lastRow?.date || new Date().toISOString().slice(0, 10),
      stationFrom: "",
      stationTo: "",
      modeOfTravel: "Cab",
      fare: null,
      modeOfFare: "Online",
      lodgingAllows: null,
      boardingAllows: null,
      foodExpenses: null,
      miscExpenses: null
    };
    setSiteRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (index) => {
    if (siteRows.length <= 1) {
      alert("At least one row is required.");
      return;
    }
    setSiteRows((prev) => prev.filter((_, i) => i !== index));
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
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
          borderRadius: "1rem",
          padding: "1.75rem 2rem",
          color: "#ffffff",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--primary-fixed)" }}>
              ios_share
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
              Export & Reports Center
            </h2>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              Excel .xlsx
            </span>
          </div>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "13px", maxWidth: "680px", margin: 0 }}>
            Generate officially styled Microsoft Excel workbooks for site expenses, individual claims, and group tour reimbursements.
            All formats include calculated totals, border styling, and ATS handbook rate matrix integration.
          </p>
        </div>

        {exportNotice && (
          <div
            style={{
              background: "#ffffff",
              color: "var(--primary)",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#16a34a" }}>
              check_circle
            </span>
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* Format Selector Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        {/* Card 1: Site Expense Tour Bill */}
        <div
          onClick={() => setSelectedFormat("site_expense")}
          style={{
            cursor: "pointer",
            padding: "1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: selectedFormat === "site_expense" ? "var(--surface-container-lowest)" : "var(--surface-container-low)",
            border: selectedFormat === "site_expense" ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
            boxShadow: selectedFormat === "site_expense" ? "var(--shadow-md)" : "none",
            transition: "var(--transition)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: selectedFormat === "site_expense" ? "var(--primary)" : "var(--surface-container)",
                  color: selectedFormat === "site_expense" ? "#ffffff" : "var(--on-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  directions_car
                </span>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--on-surface)" }}>
                Site Expense / Tour Bill
              </h3>
            </div>
            <span
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px"
              }}
            >
              SITE EXPENSE.xlsx
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: 0 }}>
            Official tour bill with travel legs (Station From/To), travel mode fares, lodging, boarding, food & misc allowances, advance taken, and balance cash.
          </p>
        </div>

        {/* Card 2: Single Employee Claims */}
        <div
          onClick={() => setSelectedFormat("single")}
          style={{
            cursor: "pointer",
            padding: "1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: selectedFormat === "single" ? "var(--surface-container-lowest)" : "var(--surface-container-low)",
            border: selectedFormat === "single" ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
            boxShadow: selectedFormat === "single" ? "var(--shadow-md)" : "none",
            transition: "var(--transition)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: selectedFormat === "single" ? "var(--primary)" : "var(--surface-container)",
                  color: selectedFormat === "single" ? "#ffffff" : "var(--on-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  receipt_long
                </span>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--on-surface)" }}>
                Single Employee Claims
              </h3>
            </div>
            <span
              style={{
                backgroundColor: "var(--surface-container)",
                color: "var(--on-surface-variant)",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px"
              }}
            >
              {singleClaims.length} Claim{singleClaims.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: 0 }}>
            Standard 16-column individual claim reimbursement spreadsheet with integrated ATS Policy Rate Matrix sheet.
          </p>
        </div>

        {/* Card 3: Team / Group Tour Claims */}
        <div
          onClick={() => setSelectedFormat("team")}
          style={{
            cursor: "pointer",
            padding: "1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: selectedFormat === "team" ? "var(--surface-container-lowest)" : "var(--surface-container-low)",
            border: selectedFormat === "team" ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
            boxShadow: selectedFormat === "team" ? "var(--shadow-md)" : "none",
            transition: "var(--transition)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: selectedFormat === "team" ? "var(--primary)" : "var(--surface-container)",
                  color: selectedFormat === "team" ? "#ffffff" : "var(--on-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  groups
                </span>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--on-surface)" }}>
                Team / Group Tour Claims
              </h3>
            </div>
            <span
              style={{
                backgroundColor: "var(--surface-container)",
                color: "var(--on-surface-variant)",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px"
              }}
            >
              {teamClaims.length} Tour{teamClaims.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: 0 }}>
            Multi-sheet workbook containing Group Tour Claims, Team Roster Breakdown, and Aggregate Rate limits.
          </p>
        </div>
      </div>

      {/* VIEW 1: SITE EXPENSE / TOUR BILL FORMAT */}
      {selectedFormat === "site_expense" && (
        <div className="flex flex-col gap-5">
          {/* Action Toolbar for Site Expense */}
          <div
            style={{
              backgroundColor: "var(--surface-container-lowest)",
              padding: "1rem 1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--outline-variant)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface)" }}>
                Pre-fill Data:
              </span>
              <button
                type="button"
                className="btn-stitch-secondary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "12px" }}
                onClick={handleLoadFromSingleClaims}
                title="Populate from single claims saved in database"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>sync</span>
                <span>From Saved Claims ({singleClaims.length})</span>
              </button>

              <button
                type="button"
                className="btn-stitch-secondary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "12px" }}
                onClick={handleLoadDemoSample}
                title="Load the exact demo dataset analyzed from SITE EXPENSE.xlsx"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>data_object</span>
                <span>Load Reference Sample (ODISA Tour)</span>
              </button>

              <button
                type="button"
                className="btn-stitch-secondary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "12px", color: "var(--error)" }}
                onClick={handleClearRows}
                title="Reset table to clean blank template"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>restart_alt</span>
                <span>Blank Template</span>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn-stitch-primary"
                style={{ padding: "0.6rem 1.5rem", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}
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

          {/* Configuration Meta Form */}
          <div
            style={{
              backgroundColor: "var(--surface-container-lowest)",
              padding: "1.25rem 1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--outline-variant)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "1rem", color: "var(--on-surface)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--primary)" }}>
                corporate_fare
              </span>
              <span>Tour Bill Header & Financial Parameters</span>
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {/* Company Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Company Name
                </label>
                <select
                  name="companyName"
                  className="form-input"
                  value={siteConfig.companyName}
                  onChange={handleConfigChange}
                  style={{ fontSize: "13px" }}
                >
                  <option value="INTELITEK EDU SOLUTIONS">INTELITEK EDU SOLUTIONS</option>
                  <option value="ABHYUDAYA TECHNO SOLUTIONS">ABHYUDAYA TECHNO SOLUTIONS</option>
                </select>
              </div>

              {/* Employee Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Employee Name *
                </label>
                <input
                  type="text"
                  name="employeeName"
                  className="form-input"
                  value={siteConfig.employeeName}
                  onChange={handleConfigChange}
                  placeholder="e.g. Gurunath Bagade"
                  style={{ fontSize: "13px" }}
                />
              </div>

              {/* Place Visited */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Place Visited *
                </label>
                <input
                  type="text"
                  name="placeVisited"
                  className="form-input"
                  value={siteConfig.placeVisited}
                  onChange={handleConfigChange}
                  placeholder="e.g. ODISA, Bhubaneswar"
                  style={{ fontSize: "13px" }}
                />
              </div>

              {/* Purpose of Visit */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  name="purposeOfVisit"
                  className="form-input"
                  value={siteConfig.purposeOfVisit}
                  onChange={handleConfigChange}
                  placeholder="e.g. Installation and Training"
                  style={{ fontSize: "13px" }}
                />
              </div>

              {/* Advance Taken */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Advance Taken (₹)
                </label>
                <input
                  type="number"
                  name="advanceTaken"
                  className="form-input"
                  value={siteConfig.advanceTaken}
                  onChange={handleConfigChange}
                  placeholder="10000"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>
          </div>

          {/* Real-time Financial Metrics Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
            <div className="metric-card" style={{ padding: "0.85rem 1rem" }}>
              <div className="metric-label" style={{ fontSize: "11px" }}>Total Travel Fare</div>
              <div className="metric-value" style={{ fontSize: "18px", color: "var(--primary)" }}>
                ₹{totalFare.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="metric-card" style={{ padding: "0.85rem 1rem" }}>
              <div className="metric-label" style={{ fontSize: "11px" }}>Lodging & Stay</div>
              <div className="metric-value" style={{ fontSize: "18px", color: "var(--primary)" }}>
                ₹{totalLodging.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="metric-card" style={{ padding: "0.85rem 1rem" }}>
              <div className="metric-label" style={{ fontSize: "11px" }}>Food & Daily Allowance</div>
              <div className="metric-value" style={{ fontSize: "18px", color: "var(--primary)" }}>
                ₹{totalFood.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="metric-card" style={{ padding: "0.85rem 1rem" }}>
              <div className="metric-label" style={{ fontSize: "11px" }}>Boarding & Misc</div>
              <div className="metric-value" style={{ fontSize: "18px", color: "var(--primary)" }}>
                ₹{(totalBoarding + totalMisc).toLocaleString("en-IN")}
              </div>
            </div>

            <div
              className="metric-card"
              style={{
                padding: "0.85rem 1rem",
                backgroundColor: "var(--surface-container)",
                borderLeft: "4px solid var(--primary)"
              }}
            >
              <div className="metric-label" style={{ fontSize: "11px", fontWeight: 700 }}>Total Tour Bill Claimed</div>
              <div className="metric-value" style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>
                ₹{grandTotalAmount.toLocaleString("en-IN")}
              </div>
            </div>

            <div
              className="metric-card"
              style={{
                padding: "0.85rem 1rem",
                backgroundColor: balanceCash >= 0 ? "#f0fdf4" : "#fffbeb",
                borderLeft: `4px solid ${balanceCash >= 0 ? "#16a34a" : "#d97706"}`
              }}
            >
              <div className="metric-label" style={{ fontSize: "11px", fontWeight: 700 }}>
                {balanceCash >= 0 ? "Bal. Cash To Deposit" : "Due To Employee"}
              </div>
              <div
                className="metric-value"
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  color: balanceCash >= 0 ? "#16a34a" : "#d97706"
                }}
              >
                ₹{Math.abs(balanceCash).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Editable Live Table Preview */}
          <div className="table-card">
            <div
              style={{
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--outline-variant)",
                backgroundColor: "var(--surface-container-low)"
              }}
            >
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                  Tour Bill Data Table ({siteRows.length} Line Items)
                </h4>
                <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                  Each line item represents a journey leg or daily allowance entry.
                </span>
              </div>

              <button
                type="button"
                className="btn-stitch-primary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "12px" }}
                onClick={handleAddRow}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                <span>Add Travel / Expense Leg</span>
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="stitch-table" style={{ fontSize: "12px", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>#</th>
                    <th style={{ minWidth: "125px" }}>Date</th>
                    <th style={{ minWidth: "140px" }}>Station From</th>
                    <th style={{ minWidth: "140px" }}>Station To</th>
                    <th style={{ minWidth: "110px" }}>Mode of Travel</th>
                    <th style={{ minWidth: "95px", textAlign: "right" }}>Fare (₹)</th>
                    <th style={{ minWidth: "90px" }}>Mode of Fare</th>
                    <th style={{ minWidth: "95px", textAlign: "right" }}>Lodging (₹)</th>
                    <th style={{ minWidth: "95px", textAlign: "right" }}>Boarding (₹)</th>
                    <th style={{ minWidth: "95px", textAlign: "right" }}>Food (₹)</th>
                    <th style={{ minWidth: "95px", textAlign: "right" }}>Misc (₹)</th>
                    <th style={{ width: "45px", textAlign: "center" }}>Act</th>
                  </tr>
                </thead>
                <tbody>
                  {siteRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: "center", color: "var(--on-surface-variant)", fontWeight: 600 }}>
                        {idx + 1}
                      </td>

                      {/* Date */}
                      <td>
                        <input
                          type="date"
                          value={row.date || ""}
                          onChange={(e) => handleRowChange(idx, "date", e.target.value)}
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "11px" }}
                        />
                      </td>

                      {/* Station From */}
                      <td>
                        <input
                          type="text"
                          value={row.stationFrom || ""}
                          onChange={(e) => handleRowChange(idx, "stationFrom", e.target.value)}
                          placeholder="e.g. BLR Airport"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px" }}
                        />
                      </td>

                      {/* Station To */}
                      <td>
                        <input
                          type="text"
                          value={row.stationTo || ""}
                          onChange={(e) => handleRowChange(idx, "stationTo", e.target.value)}
                          placeholder="e.g. Hotel / Site"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px" }}
                        />
                      </td>

                      {/* Mode of Travel */}
                      <td>
                        <input
                          type="text"
                          value={row.modeOfTravel || ""}
                          onChange={(e) => handleRowChange(idx, "modeOfTravel", e.target.value)}
                          placeholder="Cab / Auto"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px" }}
                        />
                      </td>

                      {/* Fare */}
                      <td>
                        <input
                          type="number"
                          value={row.fare !== null && row.fare !== undefined ? row.fare : ""}
                          onChange={(e) => handleRowChange(idx, "fare", e.target.value ? Number(e.target.value) : null)}
                          placeholder="0"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px", textAlign: "right" }}
                        />
                      </td>

                      {/* Mode of Fare */}
                      <td>
                        <select
                          value={row.modeOfFare || "Online"}
                          onChange={(e) => handleRowChange(idx, "modeOfFare", e.target.value)}
                          className="form-input"
                          style={{ padding: "0.25rem 0.3rem", fontSize: "11px" }}
                        >
                          <option value="Online">Online</option>
                          <option value="Cash">Cash</option>
                          <option value="Company Paid">Company</option>
                        </select>
                      </td>

                      {/* Lodging */}
                      <td>
                        <input
                          type="number"
                          value={row.lodgingAllows !== null && row.lodgingAllows !== undefined ? row.lodgingAllows : ""}
                          onChange={(e) => handleRowChange(idx, "lodgingAllows", e.target.value ? Number(e.target.value) : null)}
                          placeholder="0"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px", textAlign: "right" }}
                        />
                      </td>

                      {/* Boarding */}
                      <td>
                        <input
                          type="number"
                          value={row.boardingAllows !== null && row.boardingAllows !== undefined ? row.boardingAllows : ""}
                          onChange={(e) => handleRowChange(idx, "boardingAllows", e.target.value ? Number(e.target.value) : null)}
                          placeholder="0"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px", textAlign: "right" }}
                        />
                      </td>

                      {/* Food */}
                      <td>
                        <input
                          type="number"
                          value={row.foodExpenses !== null && row.foodExpenses !== undefined ? row.foodExpenses : ""}
                          onChange={(e) => handleRowChange(idx, "foodExpenses", e.target.value ? Number(e.target.value) : null)}
                          placeholder="0"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px", textAlign: "right" }}
                        />
                      </td>

                      {/* Misc */}
                      <td>
                        <input
                          type="number"
                          value={row.miscExpenses !== null && row.miscExpenses !== undefined ? row.miscExpenses : ""}
                          onChange={(e) => handleRowChange(idx, "miscExpenses", e.target.value ? Number(e.target.value) : null)}
                          placeholder="0"
                          className="form-input"
                          style={{ padding: "0.25rem 0.4rem", fontSize: "12px", textAlign: "right" }}
                        />
                      </td>

                      {/* Delete */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          className="action-icon-btn"
                          title="Remove Row"
                          style={{ width: "24px", height: "24px" }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--error)" }}>
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "var(--surface-container-high)", fontWeight: 700 }}>
                    <td colSpan={5} style={{ textAlign: "right", paddingRight: "1rem" }}>
                      SUBTOTALS:
                    </td>
                    <td style={{ textAlign: "right" }}>₹{totalFare.toLocaleString("en-IN")}</td>
                    <td></td>
                    <td style={{ textAlign: "right" }}>₹{totalLodging.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{totalBoarding.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{totalFood.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{totalMisc.toLocaleString("en-IN")}</td>
                    <td></td>
                  </tr>
                  <tr style={{ backgroundColor: "var(--primary-container)", color: "#ffffff", fontWeight: 800 }}>
                    <td colSpan={5} style={{ textAlign: "right", paddingRight: "1rem" }}>
                      GRAND TOTAL AMOUNT:
                    </td>
                    <td colSpan={6} style={{ textAlign: "center", fontSize: "14px" }}>
                      ₹{grandTotalAmount.toLocaleString("en-IN")}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SINGLE EMPLOYEE FORMAT */}
      {selectedFormat === "single" && (
        <div
          style={{
            backgroundColor: "var(--surface-container-lowest)",
            padding: "2rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--outline-variant)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 0.25rem 0" }}>
                Single Employee Reimbursement Export
              </h3>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
                Exports all currently recorded individual reimbursement claims into the 16-column ATS Corporate template with the ATS Policy Rate Matrix sheet included.
              </p>
            </div>

            <button
              type="button"
              className="btn-stitch-primary"
              onClick={handleDownloadSingleEmployee}
              disabled={isExporting || singleClaims.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem" }}
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
            <div style={{ border: "1px solid var(--outline-variant)", borderRadius: "0.5rem", overflow: "hidden" }}>
              <div style={{ padding: "0.75rem 1rem", backgroundColor: "var(--surface-container)", fontWeight: 600, fontSize: "12px" }}>
                Preview of Claims Ready for Export ({singleClaims.length} records)
              </div>
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                <table className="stitch-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Vendor</th>
                      <th style={{ textAlign: "right" }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleClaims.slice(0, 10).map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{c.employeeName}</td>
                        <td>{c.expenseDate}</td>
                        <td>{c.category}</td>
                        <td>{c.vendorName || "-"}</td>
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
            backgroundColor: "var(--surface-container-lowest)",
            padding: "2rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--outline-variant)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 0.25rem 0" }}>
                Team / Group Tour Reimbursement Export
              </h3>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
                Exports all group tour claims, team member rosters, and multi-member aggregate rate calculations matching Team_Group_Reimbursement_Template.xlsx.
              </p>
            </div>

            <button
              type="button"
              className="btn-stitch-primary"
              onClick={handleDownloadTeamTour}
              disabled={isExporting || teamClaims.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem" }}
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
            <div style={{ border: "1px solid var(--outline-variant)", borderRadius: "0.5rem", overflow: "hidden" }}>
              <div style={{ padding: "0.75rem 1rem", backgroundColor: "var(--surface-container)", fontWeight: 600, fontSize: "12px" }}>
                Preview of Tour Claims ({teamClaims.length} records)
              </div>
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                <table className="stitch-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th>Tour Ref</th>
                      <th>Advance Holder</th>
                      <th>Tour Title</th>
                      <th>Expense Date</th>
                      <th>Team Size</th>
                      <th style={{ textAlign: "right" }}>Bill Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamClaims.map((tc, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>{tc.tourClaimRef}</td>
                        <td style={{ fontWeight: 600 }}>{tc.advanceHolderName}</td>
                        <td>{tc.tourTitle}</td>
                        <td>{tc.expenseDate}</td>
                        <td>{tc.teamSize || 1} Member(s)</td>
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
