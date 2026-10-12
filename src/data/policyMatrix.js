// ATS Policy Rate Matrix definition and lookup helpers

export const DESIGNATION_GRADES = [
  "Functional Manager",
  "Engineer",
  "Technician",
  "Intern / Technician",
  "Intern"
];

export const CITY_TIERS = [
  "Metro (5 Cities)",
  "Tier-2 Cities",
  "Rest of Locations"
];

export const EXPENSE_CATEGORIES = [
  "Hotel / Staying",
  "Food & Daily Allowance",
  "Monthly Deputation",
  "Travel / Conveyance",
  "Fuel / Vehicle Running",
  "Client Entertainment",
  "Other Miscellaneous"
];

export const DEPARTMENTS = [
  "Engineering",
  "Operations",
  "Project Management",
  "Sales",
  "Service",
  "IT & Systems",
  "Administration & HR",
  "Accounts & Finance"
];

export const WHO_PAID_OPTIONS = [
  "Paid by Employee",
  "Paid by Company Advance"
];

// Matrix Rates (in INR ₹)
export const POLICY_MATRIX = [
  { grade: "Functional Manager", tier: "Metro (5 Cities)", hotel: 3000, food: 800, deputation: 40000 },
  { grade: "Functional Manager", tier: "Tier-2 Cities", hotel: 2500, food: 650, deputation: 30000 },
  { grade: "Functional Manager", tier: "Rest of Locations", hotel: 2000, food: 450, deputation: 25000 },
  { grade: "Engineer", tier: "Metro (5 Cities)", hotel: 1500, food: 550, deputation: 25000 },
  { grade: "Engineer", tier: "Tier-2 Cities", hotel: 1200, food: 450, deputation: 15000 },
  { grade: "Engineer", tier: "Rest of Locations", hotel: 1000, food: 350, deputation: 12000 },
  { grade: "Technician", tier: "Metro (5 Cities)", hotel: 1500, food: 500, deputation: 17000 },
  { grade: "Technician", tier: "Tier-2 Cities", hotel: 1200, food: 400, deputation: 16000 },
  { grade: "Technician", tier: "Rest of Locations", hotel: 1000, food: 350, deputation: 12000 },
  { grade: "Intern / Technician", tier: "Metro (5 Cities)", hotel: 1500, food: 350, deputation: 15000 },
  { grade: "Intern / Technician", tier: "Tier-2 Cities", hotel: 1200, food: 300, deputation: 12000 },
  { grade: "Intern / Technician", tier: "Rest of Locations", hotel: 1000, food: 300, deputation: 9000 },
  { grade: "Intern", tier: "Metro (5 Cities)", hotel: 1200, food: 300, deputation: 12000 },
  { grade: "Intern", tier: "Tier-2 Cities", hotel: 1000, food: 250, deputation: 10000 },
  { grade: "Intern", tier: "Rest of Locations", hotel: 800, food: 250, deputation: 8000 }
];

export const METRO_CITIES_NOTE = "5 Metro Cities: Mumbai, Delhi NCR, Bangalore, Chennai, Kolkata. Travel / Conveyance is paid at actuals with valid receipts.";

/**
 * Returns the daily/monthly limit for a given grade, city tier, and expense category.
 * Returns null if not capped by matrix (e.g. Travel / Conveyance which is at actuals).
 */
export function getPolicyLimit(grade, cityTier, category) {
  if (!grade || !cityTier || !category) return null;
  const entry = POLICY_MATRIX.find(
    (item) => item.grade.toLowerCase() === grade.toLowerCase() && item.tier.toLowerCase() === cityTier.toLowerCase()
  );
  if (!entry) return null;

  if (category.toLowerCase().includes("hotel") || category.toLowerCase().includes("staying")) {
    return { limit: entry.hotel, unit: "per day", isDaily: true };
  }
  if (category.toLowerCase().includes("food") || category.toLowerCase().includes("daily allowance")) {
    return { limit: entry.food, unit: "per day", isDaily: true };
  }
  if (category.toLowerCase().includes("deputation")) {
    return { limit: entry.deputation, unit: "per month", isMonthly: true };
  }
  return null;
}

/**
 * Checks whether a claim amount complies with the policy ceiling.
 */
export function evaluateClaimPolicy(grade, cityTier, category, duration, amount) {
  const parsedAmount = parseFloat(amount) || 0;
  const parsedDuration = parseFloat(duration) || 1;

  if (!grade || !cityTier || !category) {
    return { status: "unknown", message: "Incomplete details" };
  }

  if (category.toLowerCase().includes("travel") || category.toLowerCase().includes("conveyance")) {
    return { status: "actuals", message: "Paid at actuals (GST receipt required)" };
  }

  const policy = getPolicyLimit(grade, cityTier, category);
  if (!policy) {
    return { status: "actuals", message: "No fixed cap (Requires manager approval)" };
  }

  const allowableCeiling = policy.limit * parsedDuration;
  if (parsedAmount <= allowableCeiling) {
    return {
      status: "compliant",
      allowableCeiling,
      message: `Within limit (₹${parsedAmount.toLocaleString('en-IN')} ≤ Max ₹${allowableCeiling.toLocaleString('en-IN')})`
    };
  } else {
    const excess = parsedAmount - allowableCeiling;
    return {
      status: "exceeds",
      allowableCeiling,
      excess,
      message: `Exceeds ceiling by ₹${excess.toLocaleString('en-IN')} (Max ₹${allowableCeiling.toLocaleString('en-IN')}) - Requires special approval`
    };
  }
}
