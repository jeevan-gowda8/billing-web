import React from "react";
import { Receipt, IndianRupee, ShieldCheck, Wallet } from "lucide-react";

export default function StatsBar({ claims = [], isTeam = false, rosterCount = 0 }) {
  const totalClaims = claims.length;

  // Calculate total amount
  const totalAmount = claims.reduce((sum, c) => {
    const val = isTeam ? Number(c.totalBillAmount) : Number(c.claimAmount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Paid by employee vs advance
  const paidByEmployee = claims.filter(c => c.whoPaid === "Paid by Employee").length;
  const paidByAdvance = claims.filter(c => c.whoPaid === "Paid by Company Advance").length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-blue">
          <Receipt size={22} />
        </div>
        <div className="stat-meta">
          <div className="stat-label">{isTeam ? "Total Tour Claims" : "Total Claims"}</div>
          <div className="stat-value">{totalClaims}</div>
          <div className="stat-subtext">
            {isTeam ? `${rosterCount} team members mapped` : "Individual employee records"}
          </div>
        </div>
      </div>

      <div className="stat-card accent-emerald">
        <div className="stat-icon-wrapper stat-icon-green">
          <IndianRupee size={22} />
        </div>
        <div className="stat-meta">
          <div className="stat-label">Total Claim Amount</div>
          <div className="stat-value">₹{totalAmount.toLocaleString("en-IN")}</div>
          <div className="stat-subtext">Gross reimbursement total</div>
        </div>
      </div>

      <div className="stat-card accent-amber">
        <div className="stat-icon-wrapper stat-icon-amber">
          <Wallet size={22} />
        </div>
        <div className="stat-meta">
          <div className="stat-label">Payment Breakdown</div>
          <div className="stat-value">
            {paidByEmployee} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-subtle)" }}>Emp</span> / {paidByAdvance} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-subtle)" }}>Adv</span>
          </div>
          <div className="stat-subtext">Employee Payout vs Co. Advance</div>
        </div>
      </div>

      <div className="stat-card accent-forest">
        <div className="stat-icon-wrapper stat-icon-green">
          <ShieldCheck size={22} />
        </div>
        <div className="stat-meta">
          <div className="stat-label">ATS Handbook Audit</div>
          <div className="stat-value" style={{ color: "var(--emerald)" }}>Verified</div>
          <div className="stat-subtext">Evaluated against rate matrix</div>
        </div>
      </div>
    </div>
  );
}
