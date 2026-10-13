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

/**
 * Sample Demo Data from the analyzed SITE EXPENSE.xlsx
 */
export const DEFAULT_SITE_EXPENSE_SAMPLE = {
  companyName: "INTELITEK EDU SOLUTIONS",
  companyAddressLine1: "# 14/2 And 14/5, Off Magadi Main Road,",
  companyAddressLine2: "Chennanalli Village,Yerappa Industrial Area, Bangalore (South) - 562130.",
  employeeName: "GURUNATH BAGADE",
  placeVisited: "ODISA",
  purposeOfVisit: "INSTALLATION AND TRAINING",
  advanceTaken: 10000,
  rows: [
    { date: "2026-09-07", stationFrom: "Chennanalli", stationTo: "BLR Airport", modeOfTravel: "Cab", fare: 1250, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-07", stationFrom: "BBI Airport", stationTo: "Hello Stay Hotel", modeOfTravel: "Cab", fare: 650, modeOfFare: "Online", lodgingAllows: 2800, boardingAllows: null, foodExpenses: 650, miscExpenses: 150 },
    { date: "2026-09-07", stationFrom: "Hello Stay Hotel", stationTo: "KIIT Collage", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-07", stationFrom: "KIIT Collage", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-08", stationFrom: "Hello Stay Hotel", stationTo: "KIIT Collage", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: 2800, boardingAllows: null, foodExpenses: 650, miscExpenses: null },
    { date: "2026-09-08", stationFrom: "KIIT Collage", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-08", stationFrom: "Hello Stay Hotel", stationTo: "Bapuji Nagar Market", modeOfTravel: "Auto", fare: 200, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: 250 },
    { date: "2026-09-08", stationFrom: "Bapuji Nagar Market", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 200, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-09", stationFrom: "Hello Stay Hotel", stationTo: "KIIT Collage", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: 2800, boardingAllows: null, foodExpenses: 650, miscExpenses: null },
    { date: "2026-09-09", stationFrom: "KIIT Collage", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-10", stationFrom: "Hello Stay Hotel", stationTo: "KIIT Collage", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: 2800, boardingAllows: null, foodExpenses: 650, miscExpenses: null },
    { date: "2026-09-10", stationFrom: "KIIT Collage", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-11", stationFrom: "Hello Stay Hotel", stationTo: "KIIT Collage", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: 2800, boardingAllows: null, foodExpenses: 650, miscExpenses: null },
    { date: "2026-09-11", stationFrom: "KIIT Collage", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-12", stationFrom: "Hello Stay Hotel", stationTo: "KIIT Collage", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: 2800, boardingAllows: null, foodExpenses: 650, miscExpenses: null },
    { date: "2026-09-12", stationFrom: "KIIT Collage", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 150, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-12", stationFrom: "Hello Stay Hotel", stationTo: "Hello Stay Hotel", modeOfTravel: "Auto", fare: 100, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-13", stationFrom: "Babughat Bus Stand", stationTo: "Hotel", modeOfTravel: "CAB", fare: 450, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: 450, miscExpenses: null },
    { date: "2026-09-13", stationFrom: "Hotel", stationTo: "CCU Airport", modeOfTravel: "CAB", fare: 800, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null },
    { date: "2026-09-13", stationFrom: "PNQ Airport", stationTo: "Swargate Bus Stand", modeOfTravel: "CAB", fare: 650, modeOfFare: "Online", lodgingAllows: null, boardingAllows: null, foodExpenses: null, miscExpenses: null }
  ]
};

/**
 * Maps standard claims from database to Site Expense row format
 */
export function mapClaimsToSiteExpenseRows(claims) {
  if (!claims || claims.length === 0) return [];
  return claims.map((c) => {
    const cat = (c.category || "").toLowerCase();
    const amount = Number(c.claimAmount || c.totalBillAmount) || 0;

    let fare = null;
    let lodging = null;
    let boarding = null;
    let food = null;
    let misc = null;
    let modeOfTravel = "";

    if (
      cat.includes("travel") ||
      cat.includes("cab") ||
      cat.includes("flight") ||
      cat.includes("train") ||
      cat.includes("auto") ||
      cat.includes("bus") ||
      cat.includes("fuel")
    ) {
      fare = amount;
      modeOfTravel =
        c.vendorName ||
        (cat.includes("flight")
          ? "Flight"
          : cat.includes("train")
          ? "Train"
          : cat.includes("cab")
          ? "Cab"
          : cat.includes("auto")
          ? "Auto"
          : cat.includes("bus")
          ? "Bus"
          : "Cab");
    } else if (cat.includes("hotel") || cat.includes("stay") || cat.includes("lodg")) {
      lodging = amount;
    } else if (cat.includes("board")) {
      boarding = amount;
    } else if (cat.includes("food") || cat.includes("meal") || cat.includes("daily")) {
      food = amount;
    } else {
      misc = amount;
    }

    // Attempt to extract station from/to from remarks
    let stationFrom = "";
    let stationTo = "";
    const remarks = c.remarks || "";
    if (remarks.toLowerCase().includes(" to ")) {
      const parts = remarks.split(/\s+to\s+/i);
      stationFrom = parts[0]?.replace(/from/i, "").trim() || "";
      stationTo = parts[1]?.trim() || "";
    } else {
      stationFrom = c.vendorName || "Departure Station";
      stationTo = c.projectName || c.cityTier || "Destination Site";
    }

    return {
      date: c.expenseDate || new Date().toISOString().slice(0, 10),
      stationFrom: stationFrom,
      stationTo: stationTo,
      modeOfTravel: modeOfTravel || (fare ? "Cab" : "-"),
      fare: fare,
      modeOfFare: c.whoPaid?.includes("Company") ? "Company Paid" : (c.whoPaid || "Online"),
      lodgingAllows: lodging,
      boardingAllows: boarding,
      foodExpenses: food,
      miscExpenses: misc
    };
  });
}

/**
 * Generates and downloads the Site Expense / Tour Bill Excel matching SITE EXPENSE.xlsx
 */
export async function generateSiteExpenseExcel({
  companyName = "INTELITEK EDU SOLUTIONS",
  companyAddressLine1 = "# 14/2 And 14/5, Off Magadi Main Road,",
  companyAddressLine2 = "Chennanalli Village,Yerappa Industrial Area, Bangalore (South) - 562130.",
  employeeName = "",
  placeVisited = "",
  purposeOfVisit = "",
  advanceTaken = 0,
  rows = []
} = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = companyName || "Intelitek Edu Solutions";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Sheet1", {
    views: [
      {
        workbookViewId: 0,
        showGridLines: true,
        showRowColHeaders: true,
        zoomScale: 85
      }
    ],
    pageSetup: {
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      orientation: "landscape",
      horizontalCentered: true,
      verticalCentered: true,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    }
  });

  // Set column widths matching the original SITE EXPENSE.xlsx
  ws.getColumn(1).width = 4;
  ws.getColumn(2).width = 4;
  ws.getColumn(3).width = 4;
  ws.getColumn(4).width = 4;
  ws.getColumn(5).width = 16.5; // E: DATE
  ws.getColumn(6).width = 24.0; // F: STATION From
  ws.getColumn(7).width = 21.0; // G: TO
  ws.getColumn(8).width = 24.0; // H: MODE OF TRAVEL
  ws.getColumn(9).width = 14.0; // I: FARE
  ws.getColumn(10).width = 14.0; // J: MODE OF FARE
  ws.getColumn(11).width = 16.0; // K: LODGING ALLOWS
  ws.getColumn(12).width = 16.0; // L: BOARDING ALLOWS
  ws.getColumn(13).width = 16.0; // M: Food Expenses
  ws.getColumn(14).width = 16.0; // N: MISC. EXPENSES

  // Title rows (4-7)
  const titleData = [
    { row: 4, text: companyName || "INTELITEK EDU SOLUTIONS", height: 18.75 },
    { row: 5, text: companyAddressLine1 || "# 14/2 And 14/5, Off Magadi Main Road,", height: 18.75 },
    { row: 6, text: companyAddressLine2 || "Chennanalli Village,Yerappa Industrial Area, Bangalore (South) - 562130.", height: 18.75 },
    { row: 7, text: "  Tour Bill", height: 19.5 }
  ];

  titleData.forEach(({ row, text, height }) => {
    ws.mergeCells(`E${row}:N${row}`);
    const cell = ws.getCell(`E${row}`);
    cell.value = text;
    cell.font = { name: "Calibri", size: 14, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(row).height = height;
  });

  // Calculate totals from provided rows for metadata values
  const totalFare = rows.reduce((s, r) => s + (Number(r.fare) || 0), 0);
  const totalLodging = rows.reduce((s, r) => s + (Number(r.lodgingAllows) || 0), 0);
  const totalBoarding = rows.reduce((s, r) => s + (Number(r.boardingAllows) || 0), 0);
  const totalFood = rows.reduce((s, r) => s + (Number(r.foodExpenses) || 0), 0);
  const totalMisc = rows.reduce((s, r) => s + (Number(r.miscExpenses) || 0), 0);
  const totalAmount = totalFare + totalLodging + totalBoarding + totalFood + totalMisc;
  const advanceNum = Number(advanceTaken) || 0;
  const balanceDeposited = advanceNum - totalAmount;

  // Metadata Rows (8-10)
  ws.getRow(8).height = 18;
  ws.getCell("E8").value = "Name  : ";
  ws.getCell("E8").font = { name: "Calibri", size: 12, bold: true };
  ws.getCell("F8").value = employeeName || "";
  ws.getCell("F8").font = { name: "Calibri", size: 11, bold: true };
  ws.mergeCells("K8:N8");
  ws.getCell("K8").value = `  Advance Taken : ${advanceNum.toLocaleString("en-IN")}`;
  ws.getCell("K8").font = { name: "Calibri", size: 12, bold: true };

  ws.getRow(9).height = 18;
  ws.getCell("E9").value = "Place Visited : ";
  ws.getCell("E9").font = { name: "Calibri", size: 12, bold: true };
  ws.mergeCells("F9:H9");
  ws.getCell("F9").value = placeVisited || "";
  ws.getCell("F9").font = { name: "Calibri", size: 11, bold: true };
  ws.getCell("F9").alignment = { horizontal: "left", vertical: "middle" };
  ws.mergeCells("K9:N9");
  ws.getCell("K9").value = totalAmount > 0 
    ? `  Less A/c Rendered: ₹${totalAmount.toLocaleString("en-IN")}` 
    : "  Less A/c Rendered: ";
  ws.getCell("K9").font = { name: "Calibri", size: 12, bold: true };
  ws.getCell("K9").alignment = { horizontal: "left", vertical: "middle" };

  ws.getRow(10).height = 18;
  ws.getCell("E10").value = "Purpose of Visit  : ";
  ws.getCell("E10").font = { name: "Calibri", size: 12, bold: true };
  ws.getCell("F10").value = purposeOfVisit || "";
  ws.getCell("F10").font = { name: "Calibri", size: 12, bold: true };
  ws.mergeCells("K10:N10");
  ws.getCell("K10").value = advanceNum > 0 || totalAmount > 0
    ? `  Bal. Cash Deposited: ₹${balanceDeposited.toLocaleString("en-IN")}` 
    : "  Bal. Cash Deposited: ";
  ws.getCell("K10").font = { name: "Calibri", size: 12, bold: true };
  ws.getCell("K10").alignment = { horizontal: "left", vertical: "middle" };

  // Table Headers (Row 11)
  const headers = [
    "DATE",
    "  STATION From ",
    "TO",
    "MODE OF TRAVEL",
    "FARE",
    "MODE OF FARE",
    "LODGING ALLOWS",
    "BOARDING ALLOWS",
    "Food Expenses",
    "MISC. EXPENSES"
  ];
  const r11 = ws.getRow(11);
  r11.height = 26;
  headers.forEach((h, i) => {
    const colIdx = 5 + i;
    const cell = r11.getCell(colIdx);
    cell.value = h;
    cell.font = { name: "Calibri", size: 9, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "medium" },
      bottom: { style: "thin" },
      left: { style: colIdx === 5 ? "medium" : "thin" },
      right: { style: colIdx === 14 ? "medium" : "thin" }
    };
  });

  const totalRowsCount = Math.max(rows.length, 20);
  const startRow = 12;
  const endRow = startRow + totalRowsCount - 1;

  for (let idx = 0; idx < totalRowsCount; idx++) {
    const curRow = startRow + idx;
    const row = ws.getRow(curRow);
    const item = rows[idx];
    const isLast = idx === totalRowsCount - 1;

    if (item) {
      row.getCell(5).value = formatDateDMY(item.date) || "";
      row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };

      row.getCell(6).value = item.stationFrom || "";
      row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };

      row.getCell(7).value = item.stationTo || "";
      row.getCell(7).alignment = { horizontal: "center", vertical: "middle" };

      row.getCell(8).value = item.modeOfTravel || "";
      row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };

      if (item.fare !== null && item.fare !== undefined && item.fare !== "") {
        row.getCell(9).value = Number(item.fare);
        row.getCell(9).numFmt = "#,##0";
      }
      row.getCell(9).alignment = { horizontal: "right", vertical: "middle" };

      row.getCell(10).value = item.modeOfFare || "Online";
      row.getCell(10).alignment = { horizontal: "center", vertical: "middle" };

      if (item.lodgingAllows !== null && item.lodgingAllows !== undefined && item.lodgingAllows !== "") {
        row.getCell(11).value = Number(item.lodgingAllows);
        row.getCell(11).numFmt = "#,##0";
      }
      row.getCell(11).alignment = { horizontal: "right", vertical: "middle" };

      if (item.boardingAllows !== null && item.boardingAllows !== undefined && item.boardingAllows !== "") {
        row.getCell(12).value = Number(item.boardingAllows);
        row.getCell(12).numFmt = "#,##0";
      }
      row.getCell(12).alignment = { horizontal: "right", vertical: "middle" };

      if (item.foodExpenses !== null && item.foodExpenses !== undefined && item.foodExpenses !== "") {
        row.getCell(13).value = Number(item.foodExpenses);
        row.getCell(13).numFmt = "#,##0";
      }
      row.getCell(13).alignment = { horizontal: "right", vertical: "middle" };

      if (item.miscExpenses !== null && item.miscExpenses !== undefined && item.miscExpenses !== "") {
        row.getCell(14).value = Number(item.miscExpenses);
        row.getCell(14).numFmt = "#,##0";
      }
      row.getCell(14).alignment = { horizontal: "right", vertical: "middle" };
    }

    // Apply borders & font to all columns in this row
    for (let c = 5; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.font = { name: "Calibri", size: 11 };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: isLast ? "medium" : "thin" },
        left: { style: c === 5 ? "medium" : "thin" },
        right: { style: c === 14 ? "medium" : "thin" }
      };
    }
  }

  // Row (TOTAL)
  const totalRowNum = endRow + 1;
  const totalRow = ws.getRow(totalRowNum);
  totalRow.height = 20;

  totalRow.getCell(8).value = "TOTAL";
  totalRow.getCell(8).font = { name: "Calibri", size: 11, bold: true };
  totalRow.getCell(8).alignment = { horizontal: "center", vertical: "middle" };

  // SUM formulas for numeric columns
  totalRow.getCell(9).value = { formula: `SUM(I${startRow}:I${endRow})` };
  totalRow.getCell(9).font = { name: "Calibri", size: 11, bold: true };
  totalRow.getCell(9).numFmt = "#,##0";
  totalRow.getCell(9).alignment = { horizontal: "right", vertical: "middle" };

  totalRow.getCell(11).value = { formula: `SUM(K${startRow}:K${endRow})` };
  totalRow.getCell(11).font = { name: "Calibri", size: 11, bold: true };
  totalRow.getCell(11).numFmt = "#,##0";
  totalRow.getCell(11).alignment = { horizontal: "right", vertical: "middle" };

  totalRow.getCell(12).value = { formula: `SUM(L${startRow}:L${endRow})` };
  totalRow.getCell(12).font = { name: "Calibri", size: 11, bold: true };
  totalRow.getCell(12).numFmt = "#,##0";
  totalRow.getCell(12).alignment = { horizontal: "right", vertical: "middle" };

  totalRow.getCell(13).value = { formula: `SUM(M${startRow}:M${endRow})` };
  totalRow.getCell(13).font = { name: "Calibri", size: 11, bold: true };
  totalRow.getCell(13).numFmt = "#,##0";
  totalRow.getCell(13).alignment = { horizontal: "right", vertical: "middle" };

  totalRow.getCell(14).value = { formula: `SUM(N${startRow}:N${endRow})` };
  totalRow.getCell(14).font = { name: "Calibri", size: 11, bold: true };
  totalRow.getCell(14).numFmt = "#,##0";
  totalRow.getCell(14).alignment = { horizontal: "right", vertical: "middle" };

  for (let c = 5; c <= 14; c++) {
    const cell = totalRow.getCell(c);
    cell.border = {
      top: { style: "medium" },
      bottom: { style: "medium" },
      left: { style: c === 5 ? "medium" : "thin" },
      right: { style: c === 14 ? "medium" : "thin" }
    };
  }

  // Row (TOTAL AMMOUNT)
  const grandRowNum = totalRowNum + 1;
  const grandRow = ws.getRow(grandRowNum);
  grandRow.height = 22;

  // Merge E:G
  ws.mergeCells(`E${grandRowNum}:G${grandRowNum}`);
  grandRow.getCell(8).value = "TOTAL AMMOUNT";
  grandRow.getCell(8).font = { name: "Calibri", size: 11, bold: true };
  grandRow.getCell(8).alignment = { horizontal: "center", vertical: "middle" };

  // Merge I:N for grand total formula
  ws.mergeCells(`I${grandRowNum}:N${grandRowNum}`);
  const grandCell = grandRow.getCell(9);
  grandCell.value = {
    formula: `I${totalRowNum}+K${totalRowNum}+L${totalRowNum}+M${totalRowNum}+N${totalRowNum}`
  };
  grandCell.font = { name: "Calibri", size: 11, bold: true };
  grandCell.numFmt = "#,##0";
  grandCell.alignment = { horizontal: "center", vertical: "middle" };

  for (let c = 5; c <= 14; c++) {
    const cell = grandRow.getCell(c);
    cell.border = {
      top: { style: "medium" },
      bottom: { style: "medium" },
      left: { style: c === 5 ? "medium" : "thin" },
      right: { style: c === 14 ? "medium" : "thin" }
    };
  }

  // Trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const dateTag = new Date().toISOString().slice(0, 10);
  const sanitizedName = (employeeName || "Tour_Bill").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(blob, `Site_Expense_Bill_${sanitizedName}_${dateTag}.xlsx`);
}

