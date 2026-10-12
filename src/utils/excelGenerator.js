import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { POLICY_MATRIX, METRO_CITIES_NOTE } from "../data/policyMatrix";

// Colors (matching original template)
const COLOR_NAVY = "FF1E3A8A";
const COLOR_FOREST = "FF065F46";
const COLOR_WHITE = "FFFFFFFF";
const COLOR_BORDER = "FFCBD5E1";
const COLOR_TEXT_DARK = "FF0F172A";
const COLOR_SUBTITLE = "FF475569";
const COLOR_ROW_ALT = "FFF8FAFC";

const DEFAULT_BORDER = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "thin", color: { argb: COLOR_BORDER } },
  right: { style: "thin", color: { argb: COLOR_BORDER } }
};

const HEADER_BORDER = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "medium", color: { argb: COLOR_NAVY } },
  right: { style: "thin", color: { argb: COLOR_BORDER } }
};

/**
 * Format date to DD/MM/YYYY
 */
export function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    // YYYY-MM-DD
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Appends the ATS Policy Rate Matrix sheet to any workbook
 */
function appendPolicyRateMatrixSheet(workbook, title, subtitle) {
  const ws = workbook.addWorksheet("ATS Policy Rate Matrix", {
    views: [{ showGridLines: true }]
  });

  ws.columns = [
    { width: 24 }, // Designation Grade
    { width: 24 }, // City / Location Tier
    { width: 26 }, // Hotel / Staying Limit (₹/Day)
    { width: 26 }, // Food & Daily Allowance (₹/Day)
    { width: 30 }  // Monthly Deputation Limit (₹/Month)
  ];

  // Row 1: Title
  ws.mergeCells("A1:E1");
  const r1 = ws.getCell("A1");
  r1.value = title || "ATS EMPLOYEE HANDBOOK — TRAVEL & REIMBURSEMENT ALLOWABLE LIMITS";
  r1.font = { name: "Calibri", size: 14, bold: true, color: { argb: COLOR_NAVY } };
  r1.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 24;

  // Row 2: Subtitle
  ws.mergeCells("A2:E2");
  const r2 = ws.getCell("A2");
  r2.value = subtitle || "Reference limits per designation grade and city classification. Claims exceeding these limits require special management approval.";
  r2.font = { name: "Calibri", size: 9, color: { argb: COLOR_SUBTITLE } };
  r2.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(2).height = 20;

  // Row 3: Blank
  ws.getRow(3).height = 10;

  // Row 4: Header
  const headers = [
    "Designation Grade",
    "City / Location Tier",
    "Hotel / Staying Limit (₹/Day)",
    "Food & Daily Allowance (₹/Day)",
    "Monthly Deputation Limit (₹/Month)"
  ];
  const row4 = ws.getRow(4);
  row4.height = 28;
  headers.forEach((h, idx) => {
    const cell = row4.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_FOREST }
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = DEFAULT_BORDER;
  });

  // Data rows: Rows 5 to 19
  POLICY_MATRIX.forEach((item, i) => {
    const rowNum = 5 + i;
    const row = ws.getRow(rowNum);
    row.height = 22;

    const cellsData = [
      { val: item.grade, align: "left" },
      { val: item.tier === "Metro (5 Cities)" ? "🏙️ 5 Metro Cities" : item.tier === "Tier-2 Cities" ? "🏢 Tier-2 Cities" : "📍 Rest of Locations", align: "center" },
      { val: `₹${item.hotel.toLocaleString("en-IN")}`, align: "center" },
      { val: `₹${item.food.toLocaleString("en-IN")}`, align: "center" },
      { val: `₹${item.deputation.toLocaleString("en-IN")}`, align: "center" }
    ];

    cellsData.forEach((cd, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = cd.val;
      cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
      cell.alignment = { vertical: "middle", horizontal: cd.align };
      cell.border = DEFAULT_BORDER;
      if (i % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_ROW_ALT }
        };
      }
    });
  });

  // Metro Cities Note Row 21
  ws.mergeCells("A21:E21");
  const noteCell = ws.getCell("A21");
  noteCell.value = `📌 ${METRO_CITIES_NOTE}`;
  noteCell.font = { name: "Calibri", size: 9, bold: true, color: { argb: COLOR_NAVY } };
  noteCell.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(21).height = 20;

  return ws;
}

function downloadBlob(blob, filename) {
  try {
    if (typeof saveAs === "function") {
      saveAs(blob, filename);
      return;
    }
  } catch (e) {
    console.warn("saveAs failed, using standard fallback", e);
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/**
 * Generates and downloads the Single Employee Reimbursement Excel
 */
export async function generateSingleEmployeeExcel(claims) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Abhyudaya Techno Solutions";
  workbook.created = new Date();

  // Sheet 1: Reimbursement Claims
  const ws = workbook.addWorksheet("Reimbursement Claims", {
    views: [{ showGridLines: true }]
  });

  ws.columns = [
    { width: 8 },  // Sl No
    { width: 22 }, // Employee Full Name *
    { width: 28 }, // Employee Email ID *
    { width: 20 }, // Designation Grade *
    { width: 18 }, // Department *
    { width: 22 }, // Expense Date (DD/MM/YYYY) *
    { width: 24 }, // Expense Category *
    { width: 22 }, // Location / City Tier *
    { width: 20 }, // Duration (Days/Months) *
    { width: 28 }, // Vendor / Establishment Name *
    { width: 22 }, // Bill / Invoice Number *
    { width: 18 }, // Claim Amount (₹) *
    { width: 22 }, // Who Paid? *
    { width: 25 }, // Employee Payout UPI ID
    { width: 22 }, // Project / Client Name
    { width: 32 }  // Business Purpose & Remarks
  ];

  // Row 1 Title
  ws.mergeCells("A1:P1");
  const r1 = ws.getCell("A1");
  r1.value = "ABHYUDAYA TECHNO SOLUTIONS — INDIVIDUAL REIMBURSEMENT CLAIM FORM";
  r1.font = { name: "Calibri", size: 14, bold: true, color: { argb: COLOR_NAVY } };
  r1.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 26;

  // Row 2 Instructions
  ws.mergeCells("A2:P2");
  const r2 = ws.getCell("A2");
  r2.value = "Instructions: Fill your individual tour expenses below. Attach valid GST tax invoice/bill receipts. Reimbursements will be verified against ATS handbook policy limits.";
  r2.font = { name: "Calibri", size: 9, color: { argb: COLOR_SUBTITLE } };
  r2.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(2).height = 20;

  // Row 3 Blank
  ws.getRow(3).height = 10;

  // Row 4 Headers
  const headers = [
    "Sl No",
    "Employee Full Name *",
    "Employee Email ID *",
    "Designation Grade *",
    "Department *",
    "Expense Date (DD/MM/YYYY) *",
    "Expense Category *",
    "Location / City Tier *",
    "Duration (Days/Months) *",
    "Vendor / Establishment Name *",
    "Bill / Invoice Number *",
    "Claim Amount (₹) *",
    "Who Paid? *",
    "Employee Payout UPI ID",
    "Project / Client Name",
    "Business Purpose & Remarks"
  ];

  const headerRow = ws.getRow(4);
  headerRow.height = 30;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_NAVY }
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = HEADER_BORDER;
  });

  // Populate filled claims
  const totalRows = Math.max(claims.length, 20); // Keep at least 20 rows like template

  for (let idx = 0; idx < totalRows; idx++) {
    const rowNum = 5 + idx;
    const row = ws.getRow(rowNum);
    row.height = 22;

    const claim = claims[idx];
    if (claim) {
      row.getCell(1).value = idx + 1;
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(2).value = claim.employeeName || "";
      row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(3).value = claim.employeeEmail || "";
      row.getCell(3).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(4).value = claim.designation || "";
      row.getCell(4).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(5).value = claim.department || "";
      row.getCell(5).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(6).value = formatDateDMY(claim.expenseDate) || "";
      row.getCell(6).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(7).value = claim.category || "";
      row.getCell(7).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(8).value = claim.cityTier || "";
      row.getCell(8).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(9).value = Number(claim.duration) || 1;
      row.getCell(9).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(10).value = claim.vendorName || "";
      row.getCell(10).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(11).value = claim.billNumber || "";
      row.getCell(11).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(12).value = Number(claim.claimAmount) || 0;
      row.getCell(12).numFmt = "#,##0";
      row.getCell(12).alignment = { vertical: "middle", horizontal: "right" };

      row.getCell(13).value = claim.whoPaid || "";
      row.getCell(13).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(14).value = claim.upiId || "";
      row.getCell(14).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(15).value = claim.projectName || "";
      row.getCell(15).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(16).value = claim.remarks || "";
      row.getCell(16).alignment = { vertical: "middle", horizontal: "left" };

      for (let c = 1; c <= 16; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = DEFAULT_BORDER;
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLOR_ROW_ALT }
          };
        }
      }
    } else {
      // Empty template rows with Sl No
      row.getCell(1).value = idx + 1;
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 16; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = DEFAULT_BORDER;
      }
    }
  }

  // Sheet 2: ATS Policy Rate Matrix
  appendPolicyRateMatrixSheet(workbook);

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `Single_Employee_Reimbursement_${dateTag}.xlsx`);
}

/**
 * Generates and downloads the Team / Group Tour Reimbursement Excel
 */
export async function generateTeamTourExcel(tourClaims, rosterRows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Abhyudaya Techno Solutions";
  workbook.created = new Date();

  // Sheet 1: Team Tour Claims
  const wsClaims = workbook.addWorksheet("Team Tour Claims", {
    views: [{ showGridLines: true }]
  });

  wsClaims.columns = [
    { width: 16 }, // Tour Claim Ref *
    { width: 22 }, // Advance Holder Name *
    { width: 28 }, // Advance Holder Email *
    { width: 20 }, // Advance Holder Title *
    { width: 22 }, // Who Paid? *
    { width: 25 }, // Advance Holder UPI ID
    { width: 24 }, // Tour / Project Title *
    { width: 22 }, // Expense Date (DD/MM/YYYY) *
    { width: 22 }, // Expense Category *
    { width: 20 }, // Location / City Tier *
    { width: 20 }, // Duration (Days/Months) *
    { width: 26 }, // Vendor / Hotel Name *
    { width: 20 }, // Bill / Invoice Number *
    { width: 20 }, // Total Bill Amount (₹) *
    { width: 18 }, // Team Size (Count) *
    { width: 45 }, // Covered Team Members (Names & Designations) *
    { width: 32 }  // Business Purpose & Remarks
  ];

  // Row 1 Title
  wsClaims.mergeCells("A1:Q1");
  const r1 = wsClaims.getCell("A1");
  r1.value = "ABHYUDAYA TECHNO SOLUTIONS — GROUP / TEAM TOUR REIMBURSEMENT FORM";
  r1.font = { name: "Calibri", size: 14, bold: true, color: { argb: COLOR_NAVY } };
  r1.alignment = { vertical: "middle", horizontal: "left" };
  wsClaims.getRow(1).height = 26;

  // Row 2 Subtitle
  wsClaims.mergeCells("A2:Q2");
  const r2 = wsClaims.getCell("A2");
  r2.value = "Instructions: Use this sheet when an advance holder spends on behalf of a traveling team. Ceilings are calculated by summing each member's individual ATS handbook limit.";
  r2.font = { name: "Calibri", size: 9, color: { argb: COLOR_SUBTITLE } };
  r2.alignment = { vertical: "middle", horizontal: "left" };
  wsClaims.getRow(2).height = 20;

  wsClaims.getRow(3).height = 10;

  const teamHeaders = [
    "Tour Claim Ref *",
    "Advance Holder Name *",
    "Advance Holder Email *",
    "Advance Holder Title *",
    "Who Paid? *",
    "Advance Holder UPI ID",
    "Tour / Project Title *",
    "Expense Date (DD/MM/YYYY) *",
    "Expense Category *",
    "Location / City Tier *",
    "Duration (Days/Months) *",
    "Vendor / Hotel Name *",
    "Bill / Invoice Number *",
    "Total Bill Amount (₹) *",
    "Team Size (Count) *",
    "Covered Team Members (Names & Designations) *",
    "Business Purpose & Remarks"
  ];

  const headerRow = wsClaims.getRow(4);
  headerRow.height = 30;
  teamHeaders.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_NAVY }
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = HEADER_BORDER;
  });

  const totalTeamRows = Math.max(tourClaims.length, 15);

  for (let idx = 0; idx < totalTeamRows; idx++) {
    const rowNum = 5 + idx;
    const row = wsClaims.getRow(rowNum);
    row.height = 22;

    const tc = tourClaims[idx];
    if (tc) {
      // Find members in roster for this claim
      const membersForClaim = rosterRows.filter(r => r.tourClaimRef === tc.tourClaimRef);
      const teamSize = membersForClaim.length > 0 ? membersForClaim.length : (tc.teamSize || 1);
      const coveredText = membersForClaim.length > 0
        ? membersForClaim.map(m => `${m.memberName} (${m.designation})`).join(", ")
        : (tc.coveredMembers || "");

      row.getCell(1).value = tc.tourClaimRef || `TOUR-${String(idx + 1).padStart(3, "0")}`;
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(2).value = tc.advanceHolderName || "";
      row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(3).value = tc.advanceHolderEmail || "";
      row.getCell(3).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(4).value = tc.advanceHolderTitle || "";
      row.getCell(4).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(5).value = tc.whoPaid || "";
      row.getCell(5).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(6).value = tc.advanceHolderUpi || "";
      row.getCell(6).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(7).value = tc.tourTitle || "";
      row.getCell(7).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(8).value = formatDateDMY(tc.expenseDate) || "";
      row.getCell(8).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(9).value = tc.category || "";
      row.getCell(9).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(10).value = tc.cityTier || "";
      row.getCell(10).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(11).value = Number(tc.duration) || 1;
      row.getCell(11).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(12).value = tc.vendorName || "";
      row.getCell(12).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(13).value = tc.billNumber || "";
      row.getCell(13).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(14).value = Number(tc.totalBillAmount) || 0;
      row.getCell(14).numFmt = "#,##0";
      row.getCell(14).alignment = { vertical: "middle", horizontal: "right" };

      row.getCell(15).value = teamSize;
      row.getCell(15).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(16).value = coveredText;
      row.getCell(16).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(17).value = tc.remarks || "";
      row.getCell(17).alignment = { vertical: "middle", horizontal: "left" };

      for (let c = 1; c <= 17; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = DEFAULT_BORDER;
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLOR_ROW_ALT }
          };
        }
      }
    } else {
      // Empty template rows
      row.getCell(1).value = `TOUR-${String(idx + 1).padStart(3, "0")}`;
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 17; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = DEFAULT_BORDER;
      }
    }
  }

  // Sheet 2: Team Roster Breakdown
  const wsRoster = workbook.addWorksheet("Team Roster Breakdown", {
    views: [{ showGridLines: true }]
  });

  wsRoster.columns = [
    { width: 18 }, // Tour Claim Ref *
    { width: 24 }, // Member Full Name *
    { width: 28 }, // Member Email ID *
    { width: 22 }, // Designation Grade *
    { width: 18 }, // Department
    { width: 20 }, // Is Advance Holder?
    { width: 22 }, // Daily Handbook Rate (₹)
    { width: 28 }  // Member Notes
  ];

  // Row 1 Title
  wsRoster.mergeCells("A1:H1");
  const rRoster1 = wsRoster.getCell("A1");
  rRoster1.value = "TOUR TEAM MEMBERS ROSTER BREAKDOWN (PER-CLAIM MAPPING)";
  rRoster1.font = { name: "Calibri", size: 14, bold: true, color: { argb: COLOR_NAVY } };
  rRoster1.alignment = { vertical: "middle", horizontal: "left" };
  wsRoster.getRow(1).height = 26;

  // Row 2 Subtitle
  wsRoster.mergeCells("A2:H2");
  const rRoster2 = wsRoster.getCell("A2");
  rRoster2.value = "List each individual colleague covered under each Tour Claim Ref. This ensures the claim reflects on each employee's dashboard.";
  rRoster2.font = { name: "Calibri", size: 9, color: { argb: COLOR_SUBTITLE } };
  rRoster2.alignment = { vertical: "middle", horizontal: "left" };
  wsRoster.getRow(2).height = 20;

  wsRoster.getRow(3).height = 10;

  const rosterHeaders = [
    "Tour Claim Ref *",
    "Member Full Name *",
    "Member Email ID *",
    "Designation Grade *",
    "Department",
    "Is Advance Holder?",
    "Daily Handbook Rate (₹)",
    "Member Notes"
  ];

  const rosterHeaderRow = wsRoster.getRow(4);
  rosterHeaderRow.height = 30;
  rosterHeaders.forEach((h, idx) => {
    const cell = rosterHeaderRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_NAVY }
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = HEADER_BORDER;
  });

  const totalRosterRows = Math.max(rosterRows.length, 20);

  for (let idx = 0; idx < totalRosterRows; idx++) {
    const rowNum = 5 + idx;
    const row = wsRoster.getRow(rowNum);
    row.height = 22;

    const rMember = rosterRows[idx];
    if (rMember) {
      row.getCell(1).value = rMember.tourClaimRef || "";
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(2).value = rMember.memberName || "";
      row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(3).value = rMember.memberEmail || "";
      row.getCell(3).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(4).value = rMember.designation || "";
      row.getCell(4).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(5).value = rMember.department || "";
      row.getCell(5).alignment = { vertical: "middle", horizontal: "left" };

      row.getCell(6).value = rMember.isAdvanceHolder || "No";
      row.getCell(6).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(7).value = Number(rMember.dailyRate) || 0;
      row.getCell(7).numFmt = "#,##0";
      row.getCell(7).alignment = { vertical: "middle", horizontal: "right" };

      row.getCell(8).value = rMember.memberNotes || "";
      row.getCell(8).alignment = { vertical: "middle", horizontal: "left" };

      for (let c = 1; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = DEFAULT_BORDER;
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLOR_ROW_ALT }
          };
        }
      }
    } else {
      for (let c = 1; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = DEFAULT_BORDER;
      }
    }
  }

  // Sheet 3: Multi-Member Aggregate Rate Matrix
  appendPolicyRateMatrixSheet(
    workbook,
    "ATS EMPLOYEE HANDBOOK — MULTI-MEMBER AGGREGATE RATE MATRIX",
    "For team claims, each member's designation rate is added together. Example: Manager (₹2,500) + Engineer (₹1,200) + Technician (₹1,200) = ₹4,900/day hotel limit."
  );

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `Team_Group_Reimbursement_${dateTag}.xlsx`);
}
