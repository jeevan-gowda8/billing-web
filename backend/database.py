import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "reimbursement.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Table 1: Single Employee Reimbursement Claims
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reimbursement_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sl_no INTEGER,
        employee_name TEXT NOT NULL,
        employee_email TEXT NOT NULL,
        designation TEXT NOT NULL,
        department TEXT NOT NULL,
        expense_date TEXT NOT NULL,
        category TEXT NOT NULL,
        city_tier TEXT NOT NULL,
        duration REAL DEFAULT 1,
        vendor_name TEXT NOT NULL,
        bill_number TEXT,
        claim_amount REAL NOT NULL,
        who_paid TEXT NOT NULL,
        upi_id TEXT,
        project_name TEXT,
        remarks TEXT,
        receipt_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 2: Team / Group Tour Claims
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS team_tour_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_claim_ref TEXT UNIQUE NOT NULL,
        advance_holder_name TEXT NOT NULL,
        advance_holder_email TEXT NOT NULL,
        advance_holder_title TEXT NOT NULL,
        who_paid TEXT NOT NULL,
        advance_holder_upi TEXT,
        tour_title TEXT NOT NULL,
        expense_date TEXT NOT NULL,
        category TEXT NOT NULL,
        city_tier TEXT NOT NULL,
        duration REAL DEFAULT 1,
        vendor_name TEXT NOT NULL,
        bill_number TEXT,
        total_bill_amount REAL NOT NULL,
        remarks TEXT,
        receipt_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Safe column migrations for existing databases
    try:
        cursor.execute("ALTER TABLE reimbursement_claims ADD COLUMN receipt_image TEXT;")
    except Exception:
        pass

    try:
        cursor.execute("ALTER TABLE team_tour_claims ADD COLUMN receipt_image TEXT;")
    except Exception:
        pass

    # Table 3: Team Roster Members
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS team_roster_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_claim_ref TEXT NOT NULL,
        member_name TEXT NOT NULL,
        member_email TEXT NOT NULL,
        designation TEXT NOT NULL,
        department TEXT,
        is_advance_holder TEXT DEFAULT 'No',
        daily_rate REAL DEFAULT 0,
        member_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 4: Company Team Member Directory
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS company_team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_name TEXT NOT NULL,
        member_email TEXT NOT NULL,
        designation TEXT NOT NULL,
        department TEXT,
        is_advance_holder TEXT DEFAULT 'No',
        default_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed initial company members if table is empty
    cursor.execute("SELECT COUNT(*) FROM company_team_members")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO company_team_members (member_name, member_email, designation, department, is_advance_holder, default_notes)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [
            ("Jeevan Gowda A V", "jeevan@abhyudaya.tech", "Functional Manager", "Engineering", "Yes", "Project Lead"),
            ("Bharath L", "Bharath@abhyudyayatech.com", "Intern", "Operations", "No", "Field Operations"),
            ("Rahul Sharma", "rahul@abhyudaya.tech", "Engineer", "Project Management", "No", "On-site Engineer"),
            ("Priya Patel", "priya@abhyudaya.tech", "Technician", "Service", "No", "Hardware Testing")
        ])

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized at", DB_PATH)
