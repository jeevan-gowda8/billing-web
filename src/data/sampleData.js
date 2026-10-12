// Sample default data loaded from the templates

export const SAMPLE_SINGLE_CLAIMS = [
  {
    id: "SC-1",
    slNo: 1,
    employeeName: "Rahul Sharma",
    employeeEmail: "rahul.sharma@abhyudyayatech.com",
    designation: "Engineer",
    department: "Engineering",
    expenseDate: "2026-09-12", // 12/09/2026
    category: "Hotel / Staying",
    cityTier: "Metro (5 Cities)",
    duration: 2,
    vendorName: "Lemon Tree Premier",
    billNumber: "LT-INV-9902",
    claimAmount: 3000,
    whoPaid: "Paid by Employee",
    upiId: "rahul@okhdfcbank",
    projectName: "Pune Automation Phase 1",
    remarks: "2-night stay for client machinery commissioning"
  },
  {
    id: "SC-2",
    slNo: 2,
    employeeName: "Priya Verma",
    employeeEmail: "priya.verma@abhyudyayatech.com",
    designation: "Technician",
    department: "Operations",
    expenseDate: "2026-09-13", // 13/09/2026
    category: "Food & Daily Allowance",
    cityTier: "Tier-2 Cities",
    duration: 3,
    vendorName: "Sagar Ratna Restaurant",
    billNumber: "SR-4091",
    claimAmount: 1200,
    whoPaid: "Paid by Employee",
    upiId: "priya@upi",
    projectName: "Nashik Site Audit",
    remarks: "Daily food expenses during site installation"
  },
  {
    id: "SC-3",
    slNo: 3,
    employeeName: "Vikram Mehta",
    employeeEmail: "vikram.m@abhyudyayatech.com",
    designation: "Functional Manager",
    department: "Project Management",
    expenseDate: "2026-09-01", // 01/09/2026
    category: "Monthly Deputation",
    cityTier: "Metro (5 Cities)",
    duration: 1,
    vendorName: "Corporate Guest House",
    billNumber: "GH-MONTH-01",
    claimAmount: 40000,
    whoPaid: "Paid by Company Advance",
    upiId: "N/A — Company Advance",
    projectName: "Bangalore Tech Hub",
    remarks: "1-month on-site deputation lead"
  }
];

export const SAMPLE_TEAM_CLAIMS = [
  {
    id: "TC-1",
    tourClaimRef: "TOUR-001",
    advanceHolderName: "Rahul Sharma",
    advanceHolderEmail: "rahul.sharma@abhyudyayatech.com",
    advanceHolderTitle: "Functional Manager",
    whoPaid: "Paid by Company Advance",
    advanceHolderUpi: "N/A — Company Advance",
    tourTitle: "Pune Plant Commissioning",
    expenseDate: "2026-09-15",
    category: "Hotel / Staying",
    cityTier: "Tier-2 Cities",
    duration: 2,
    vendorName: "Sayaji Hotel Pune",
    billNumber: "SAYAJI-8812",
    totalBillAmount: 12000,
    remarks: "3 team members accommodated for 2 nights for plant installation"
  },
  {
    id: "TC-2",
    tourClaimRef: "TOUR-002",
    advanceHolderName: "Deepak Rao",
    advanceHolderEmail: "deepak.rao@abhyudyayatech.com",
    advanceHolderTitle: "Engineer",
    whoPaid: "Paid by Employee",
    advanceHolderUpi: "deepak@okaxis",
    tourTitle: "Hyderabad Client Demo",
    expenseDate: "2026-09-18",
    category: "Food & Daily Allowance",
    cityTier: "Metro (5 Cities)",
    duration: 2,
    vendorName: "Paradise Food Court",
    billNumber: "PFC-4091",
    totalBillAmount: 2900,
    remarks: "Team daily food allowance for 2 days client visit"
  }
];

export const SAMPLE_TEAM_ROSTER = [
  {
    id: "TR-1",
    tourClaimRef: "TOUR-001",
    memberName: "Rahul Sharma",
    memberEmail: "rahul.sharma@abhyudyayatech.com",
    designation: "Functional Manager",
    department: "Engineering",
    isAdvanceHolder: "Yes (Advance Holder)",
    dailyRate: 2500,
    memberNotes: "Team lead & advance recipient"
  },
  {
    id: "TR-2",
    tourClaimRef: "TOUR-001",
    memberName: "Priya Verma",
    memberEmail: "priya.verma@abhyudyayatech.com",
    designation: "Engineer",
    department: "Operations",
    isAdvanceHolder: "No",
    dailyRate: 1200,
    memberNotes: "Commissioning engineer"
  },
  {
    id: "TR-3",
    tourClaimRef: "TOUR-001",
    memberName: "Amit Patel",
    memberEmail: "amit.patel@abhyudyayatech.com",
    designation: "Technician",
    department: "Operations",
    isAdvanceHolder: "No",
    dailyRate: 1200,
    memberNotes: "Electrical technician"
  },
  {
    id: "TR-4",
    tourClaimRef: "TOUR-002",
    memberName: "Deepak Rao",
    memberEmail: "deepak.rao@abhyudyayatech.com",
    designation: "Engineer",
    department: "Sales",
    isAdvanceHolder: "Yes (Advance Holder)",
    dailyRate: 550,
    memberNotes: "Lead engineer"
  },
  {
    id: "TR-5",
    tourClaimRef: "TOUR-002",
    memberName: "Sandeep Kumar",
    memberEmail: "sandeep.k@abhyudyayatech.com",
    designation: "Technician",
    department: "Service",
    isAdvanceHolder: "No",
    dailyRate: 500,
    memberNotes: "Field technician"
  }
];

export const SAMPLE_COMPANY_MEMBERS = [
  {
    id: 1,
    memberName: "Jeevan Gowda A V",
    memberEmail: "jeevan@abhyudaya.tech",
    designation: "Functional Manager",
    department: "Engineering",
    isAdvanceHolder: "Yes",
    defaultNotes: "Project Lead"
  },
  {
    id: 2,
    memberName: "Bharath L",
    memberEmail: "Bharath@abhyudyayatech.com",
    designation: "Intern",
    department: "Operations",
    isAdvanceHolder: "No",
    defaultNotes: "Field Operations"
  },
  {
    id: 3,
    memberName: "Rahul Sharma",
    memberEmail: "rahul@abhyudaya.tech",
    designation: "Engineer",
    department: "Project Management",
    isAdvanceHolder: "No",
    defaultNotes: "On-site Engineer"
  },
  {
    id: 4,
    memberName: "Priya Patel",
    memberEmail: "priya@abhyudaya.tech",
    designation: "Technician",
    department: "Service",
    isAdvanceHolder: "No",
    defaultNotes: "Hardware Testing"
  }
];
