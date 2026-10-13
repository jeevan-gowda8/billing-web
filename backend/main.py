from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import sqlite3

import os
import sys
from pathlib import Path

# Ensure the backend directory is in sys.path so direct and package imports both succeed
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from .database import get_db, init_db
    from .schemas import (
        SingleClaimCreate,
        SingleClaimResponse,
        TeamClaimCreate,
        TeamClaimResponse,
        RosterMemberCreate,
        RosterMemberResponse,
        CompanyMemberCreate,
        CompanyMemberResponse
    )
except (ImportError, ValueError):
    from database import get_db, init_db
    from schemas import (
        SingleClaimCreate,
        SingleClaimResponse,
        TeamClaimCreate,
        TeamClaimResponse,
        RosterMemberCreate,
        RosterMemberResponse,
        CompanyMemberCreate,
        CompanyMemberResponse
    )

app = FastAPI(
    title="Abhyudaya Techno Solutions - Reimbursement API",
    description="Backend REST API for ATS Individual and Team Reimbursements with SQLite persistence.",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "ATS Reimbursement Portal Backend"}

# ==============================================================================
# SINGLE EMPLOYEE REIMBURSEMENT CLAIMS ENDPOINTS
# ==============================================================================

@app.get("/api/single-claims", response_model=List[SingleClaimResponse])
def get_single_claims(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT id, sl_no, employee_name, employee_email, designation, department,
               expense_date, category, city_tier, duration, vendor_name, bill_number,
               claim_amount, who_paid, upi_id, project_name, remarks, receipt_image
        FROM reimbursement_claims
        ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    return [dict(r) for r in rows]

@app.post("/api/single-claims", response_model=SingleClaimResponse, status_code=201)
def create_single_claim(claim: SingleClaimCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Calculate next sl_no if not provided
    if claim.sl_no is None:
        cursor.execute("SELECT COALESCE(MAX(sl_no), 0) + 1 FROM reimbursement_claims")
        sl_no = cursor.fetchone()[0]
    else:
        sl_no = claim.sl_no

    cursor.execute("""
        INSERT INTO reimbursement_claims (
            sl_no, employee_name, employee_email, designation, department,
            expense_date, category, city_tier, duration, vendor_name,
            bill_number, claim_amount, who_paid, upi_id, project_name, remarks,
            receipt_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sl_no, claim.employee_name, claim.employee_email, claim.designation,
        claim.department, claim.expense_date, claim.category, claim.city_tier,
        claim.duration, claim.vendor_name, claim.bill_number, claim.claim_amount,
        claim.who_paid, claim.upi_id, claim.project_name, claim.remarks,
        claim.receipt_image
    ))
    db.commit()
    new_id = cursor.lastrowid
    
    cursor.execute("SELECT * FROM reimbursement_claims WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    return dict(row)

@app.put("/api/single-claims/{claim_id}", response_model=SingleClaimResponse)
def update_single_claim(claim_id: int, claim: SingleClaimCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM reimbursement_claims WHERE id = ?", (claim_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Claim not found")

    cursor.execute("""
        UPDATE reimbursement_claims SET
            employee_name = ?,
            employee_email = ?,
            designation = ?,
            department = ?,
            expense_date = ?,
            category = ?,
            city_tier = ?,
            duration = ?,
            vendor_name = ?,
            bill_number = ?,
            claim_amount = ?,
            who_paid = ?,
            upi_id = ?,
            project_name = ?,
            remarks = ?,
            receipt_image = ?
        WHERE id = ?
    """, (
        claim.employee_name, claim.employee_email, claim.designation,
        claim.department, claim.expense_date, claim.category, claim.city_tier,
        claim.duration, claim.vendor_name, claim.bill_number, claim.claim_amount,
        claim.who_paid, claim.upi_id, claim.project_name, claim.remarks,
        claim.receipt_image,
        claim_id
    ))
    db.commit()

    cursor.execute("SELECT * FROM reimbursement_claims WHERE id = ?", (claim_id,))
    row = cursor.fetchone()
    return dict(row)

@app.delete("/api/single-claims/{claim_id}")
def delete_single_claim(claim_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM reimbursement_claims WHERE id = ?", (claim_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"message": "Claim deleted successfully", "id": claim_id}

# ==============================================================================
# TEAM / GROUP TOUR CLAIMS ENDPOINTS
# ==============================================================================

@app.get("/api/team-claims", response_model=List[TeamClaimResponse])
def get_team_claims(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT tc.*,
               COUNT(rm.id) as roster_count,
               GROUP_CONCAT(rm.member_name || ' (' || rm.designation || ')', ', ') as roster_summary
        FROM team_tour_claims tc
        LEFT JOIN team_roster_members rm ON tc.tour_claim_ref = rm.tour_claim_ref
        GROUP BY tc.id
        ORDER BY tc.id ASC
    """)
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["team_size"] = d["roster_count"] if d["roster_count"] > 0 else 1
        d["covered_members"] = d["roster_summary"] or ""
        result.append(d)
    return result

@app.post("/api/team-claims", response_model=TeamClaimResponse, status_code=201)
def create_team_claim(claim: TeamClaimCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("""
            INSERT INTO team_tour_claims (
                tour_claim_ref, advance_holder_name, advance_holder_email,
                advance_holder_title, who_paid, advance_holder_upi, tour_title,
                expense_date, category, city_tier, duration, vendor_name,
                bill_number, total_bill_amount, remarks, receipt_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            claim.tour_claim_ref, claim.advance_holder_name, claim.advance_holder_email,
            claim.advance_holder_title, claim.who_paid, claim.advance_holder_upi,
            claim.tour_title, claim.expense_date, claim.category, claim.city_tier,
            claim.duration, claim.vendor_name, claim.bill_number, claim.total_bill_amount,
            claim.remarks, claim.receipt_image
        ))
        db.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail=f"Tour Claim Ref '{claim.tour_claim_ref}' already exists.")

    new_id = cursor.lastrowid

    # If selected_members are provided, insert them into team_roster_members
    if claim.selected_members:
        for m in claim.selected_members:
            m_name = m.get("memberName") or m.get("member_name") or ""
            m_email = m.get("memberEmail") or m.get("member_email") or ""
            m_desig = m.get("designation") or "Engineer"
            m_dept = m.get("department") or "Operations"
            m_adv = m.get("isAdvanceHolder") or m.get("is_advance_holder") or "No"
            m_rate = float(m.get("dailyRate") or m.get("daily_rate") or 0.0)
            m_notes = m.get("memberNotes") or m.get("member_notes") or ""

            cursor.execute("""
                INSERT INTO team_roster_members (
                    tour_claim_ref, member_name, member_email, designation,
                    department, is_advance_holder, daily_rate, member_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                claim.tour_claim_ref, m_name, m_email, m_desig,
                m_dept, m_adv, m_rate, m_notes
            ))

            # Auto-save to company_team_members directory if not existing
            cursor.execute("SELECT id FROM company_team_members WHERE member_email = ?", (m_email,))
            if not cursor.fetchone() and m_name:
                cursor.execute("""
                    INSERT INTO company_team_members (member_name, member_email, designation, department, is_advance_holder)
                    VALUES (?, ?, ?, ?, ?)
                """, (m_name, m_email, m_desig, m_dept, m_adv))

        db.commit()

    cursor.execute("""
        SELECT tc.*,
               COUNT(rm.id) as roster_count,
               GROUP_CONCAT(rm.member_name || ' (' || rm.designation || ')', ', ') as roster_summary
        FROM team_tour_claims tc
        LEFT JOIN team_roster_members rm ON tc.tour_claim_ref = rm.tour_claim_ref
        WHERE tc.id = ?
        GROUP BY tc.id
    """, (new_id,))
    row = cursor.fetchone()
    d = dict(row)
    d["team_size"] = d["roster_count"] if d["roster_count"] > 0 else 1
    d["covered_members"] = d["roster_summary"] or ""
    return d

@app.put("/api/team-claims/{claim_id}", response_model=TeamClaimResponse)
def update_team_claim(claim_id: int, claim: TeamClaimCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT tour_claim_ref FROM team_tour_claims WHERE id = ?", (claim_id,))
    old_row = cursor.fetchone()
    if not old_row:
        raise HTTPException(status_code=404, detail="Tour claim not found")

    old_ref = old_row["tour_claim_ref"]

    cursor.execute("""
        UPDATE team_tour_claims SET
            tour_claim_ref = ?,
            advance_holder_name = ?,
            advance_holder_email = ?,
            advance_holder_title = ?,
            who_paid = ?,
            advance_holder_upi = ?,
            tour_title = ?,
            expense_date = ?,
            category = ?,
            city_tier = ?,
            duration = ?,
            vendor_name = ?,
            bill_number = ?,
            total_bill_amount = ?,
            remarks = ?,
            receipt_image = ?
        WHERE id = ?
    """, (
        claim.tour_claim_ref, claim.advance_holder_name, claim.advance_holder_email,
        claim.advance_holder_title, claim.who_paid, claim.advance_holder_upi,
        claim.tour_title, claim.expense_date, claim.category, claim.city_tier,
        claim.duration, claim.vendor_name, claim.bill_number, claim.total_bill_amount,
        claim.remarks, claim.receipt_image, claim_id
    ))

    # Cascade ref change to roster
    if old_ref != claim.tour_claim_ref:
        cursor.execute("UPDATE team_roster_members SET tour_claim_ref = ? WHERE tour_claim_ref = ?", (claim.tour_claim_ref, old_ref))

    # If selected_members are provided, update roster rows
    if claim.selected_members is not None and len(claim.selected_members) > 0:
        cursor.execute("DELETE FROM team_roster_members WHERE tour_claim_ref = ?", (claim.tour_claim_ref,))
        for m in claim.selected_members:
            m_name = m.get("memberName") or m.get("member_name") or ""
            m_email = m.get("memberEmail") or m.get("member_email") or ""
            m_desig = m.get("designation") or "Engineer"
            m_dept = m.get("department") or "Operations"
            m_adv = m.get("isAdvanceHolder") or m.get("is_advance_holder") or "No"
            m_rate = float(m.get("dailyRate") or m.get("daily_rate") or 0.0)
            m_notes = m.get("memberNotes") or m.get("member_notes") or ""

            cursor.execute("""
                INSERT INTO team_roster_members (
                    tour_claim_ref, member_name, member_email, designation,
                    department, is_advance_holder, daily_rate, member_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                claim.tour_claim_ref, m_name, m_email, m_desig,
                m_dept, m_adv, m_rate, m_notes
            ))

    db.commit()

    cursor.execute("""
        SELECT tc.*,
               COUNT(rm.id) as roster_count,
               GROUP_CONCAT(rm.member_name || ' (' || rm.designation || ')', ', ') as roster_summary
        FROM team_tour_claims tc
        LEFT JOIN team_roster_members rm ON tc.tour_claim_ref = rm.tour_claim_ref
        WHERE tc.id = ?
        GROUP BY tc.id
    """, (claim_id,))
    row = cursor.fetchone()
    d = dict(row)
    d["team_size"] = d["roster_count"] if d["roster_count"] > 0 else 1
    d["covered_members"] = d["roster_summary"] or ""
    return d

@app.delete("/api/team-claims/{claim_id}")
def delete_team_claim(claim_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT tour_claim_ref FROM team_tour_claims WHERE id = ?", (claim_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Tour claim not found")

    ref = row["tour_claim_ref"]
    cursor.execute("DELETE FROM team_roster_members WHERE tour_claim_ref = ?", (ref,))
    cursor.execute("DELETE FROM team_tour_claims WHERE id = ?", (claim_id,))
    db.commit()
    return {"message": "Tour claim and associated roster members deleted", "id": claim_id}

# ==============================================================================
# TEAM ROSTER BREAKDOWN ENDPOINTS
# ==============================================================================

@app.get("/api/team-roster", response_model=List[RosterMemberResponse])
def get_team_roster(tour_claim_ref: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if tour_claim_ref:
        cursor.execute("""
            SELECT * FROM team_roster_members
            WHERE tour_claim_ref = ?
            ORDER BY id ASC
        """, (tour_claim_ref,))
    else:
        cursor.execute("SELECT * FROM team_roster_members ORDER BY id ASC")
    rows = cursor.fetchall()
    return [dict(r) for r in rows]

@app.post("/api/team-roster", response_model=RosterMemberResponse, status_code=201)
def create_roster_member(member: RosterMemberCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO team_roster_members (
            tour_claim_ref, member_name, member_email, designation,
            department, is_advance_holder, daily_rate, member_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        member.tour_claim_ref, member.member_name, member.member_email,
        member.designation, member.department, member.is_advance_holder,
        member.daily_rate, member.member_notes
    ))
    db.commit()
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM team_roster_members WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    return dict(row)

@app.delete("/api/team-roster/{member_id}")
def delete_roster_member(member_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM team_roster_members WHERE id = ?", (member_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Roster member not found")
    return {"message": "Roster member deleted", "id": member_id}

# ==============================================================================
# COMPANY TEAM MEMBERS DIRECTORY ENDPOINTS
# ==============================================================================

@app.get("/api/company-members", response_model=List[CompanyMemberResponse])
def get_company_members(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM company_team_members ORDER BY id ASC")
    rows = cursor.fetchall()
    return [dict(r) for r in rows]

@app.post("/api/company-members", response_model=CompanyMemberResponse, status_code=201)
def create_company_member(member: CompanyMemberCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO company_team_members (
            member_name, member_email, designation, department,
            is_advance_holder, default_notes
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        member.member_name, member.member_email, member.designation,
        member.department, member.is_advance_holder, member.default_notes
    ))
    db.commit()
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM company_team_members WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    return dict(row)

@app.put("/api/company-members/{member_id}", response_model=CompanyMemberResponse)
def update_company_member(member_id: int, member: CompanyMemberCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM company_team_members WHERE id = ?", (member_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Company member not found")

    cursor.execute("""
        UPDATE company_team_members SET
            member_name = ?,
            member_email = ?,
            designation = ?,
            department = ?,
            is_advance_holder = ?,
            default_notes = ?
        WHERE id = ?
    """, (
        member.member_name, member.member_email, member.designation,
        member.department, member.is_advance_holder, member.default_notes,
        member_id
    ))
    db.commit()
    cursor.execute("SELECT * FROM company_team_members WHERE id = ?", (member_id,))
    row = cursor.fetchone()
    return dict(row)

@app.delete("/api/company-members/{member_id}")
def delete_company_member(member_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM company_team_members WHERE id = ?", (member_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Company member not found")
    return {"message": "Company member deleted", "id": member_id}


if __name__ == "__main__":
    import uvicorn
    # Choose import string based on current working directory
    target = "main:app" if Path.cwd() == CURRENT_DIR else "backend.main:app"
    print(f"Starting ATS Reimbursement API server on http://127.0.0.1:8000 ...")
    uvicorn.run(target, host="127.0.0.1", port=8000, reload=True)

