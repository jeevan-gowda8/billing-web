import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is in path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from fastapi.testclient import TestClient
try:
    from backend.main import app
except ModuleNotFoundError:
    from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    print("✓ Health check passed")

def test_single_claims():
    # 1. Initially empty
    res = client.get("/api/single-claims")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    print("✓ Single claims GET passed (count:", len(res.json()), ")")

    # 2. Create claim
    payload = {
        "employeeName": "Test Employee",
        "employeeEmail": "test@abhyudaya.tech",
        "designation": "Engineer",
        "department": "Engineering",
        "expenseDate": "2026-09-21",
        "category": "Hotel / Staying",
        "cityTier": "Metro (5 Cities)",
        "duration": 2,
        "vendorName": "Test Hotel",
        "billNumber": "TEST-01",
        "claimAmount": 3000,
        "whoPaid": "Paid by Employee",
        "upiId": "test@upi",
        "projectName": "Test Project",
        "remarks": "Testing API"
    }
    create_res = client.post("/api/single-claims", json=payload)
    assert create_res.status_code == 201
    claim = create_res.json()
    assert claim["employeeName"] == "Test Employee"
    assert claim["id"] > 0
    print("✓ Single claim POST passed (id:", claim["id"], ")")

    # 3. Update claim
    payload["employeeName"] = "Updated Employee"
    update_res = client.put(f"/api/single-claims/{claim['id']}", json=payload)
    assert update_res.status_code == 200
    assert update_res.json()["employeeName"] == "Updated Employee"
    print("✓ Single claim PUT passed")

    # 4. Delete claim
    del_res = client.delete(f"/api/single-claims/{claim['id']}")
    assert del_res.status_code == 200
    print("✓ Single claim DELETE passed")

def test_team_claims_and_roster():
    # 1. Create team claim
    team_payload = {
        "tourClaimRef": "TOUR-TEST",
        "advanceHolderName": "Lead Member",
        "advanceHolderEmail": "lead@abhyudaya.tech",
        "advanceHolderTitle": "Functional Manager",
        "whoPaid": "Paid by Company Advance",
        "advanceHolderUpi": "N/A — Company Advance",
        "tourTitle": "Test Tour",
        "expenseDate": "2026-09-21",
        "category": "Hotel / Staying",
        "cityTier": "Tier-2 Cities",
        "duration": 2,
        "vendorName": "Sayaji Pune",
        "billNumber": "SAYAJI-TEST",
        "totalBillAmount": 8000,
        "remarks": "Team tour test"
    }
    res = client.post("/api/team-claims", json=team_payload)
    assert res.status_code == 201
    tc = res.json()
    assert tc["tourClaimRef"] == "TOUR-TEST"
    print("✓ Team claim POST passed (id:", tc["id"], ")")

    # 2. Add roster member
    roster_payload = {
        "tourClaimRef": "TOUR-TEST",
        "memberName": "Colleague A",
        "memberEmail": "colleague@abhyudaya.tech",
        "designation": "Technician",
        "department": "Operations",
        "isAdvanceHolder": "No",
        "dailyRate": 1200,
        "memberNotes": "Technician note"
    }
    r_res = client.post("/api/team-roster", json=roster_payload)
    assert r_res.status_code == 201
    r_item = r_res.json()
    print("✓ Team roster POST passed (id:", r_item["id"], ")")

    # 3. Check team claim calculates roster
    check_res = client.get("/api/team-claims")
    all_tc = check_res.json()
    target = next((x for x in all_tc if x["tourClaimRef"] == "TOUR-TEST"), None)
    assert target is not None
    assert target["teamSize"] == 1
    assert "Colleague A" in target["coveredMembers"]
    print("✓ Team claim dynamic roster calculation verified!")

    # 4. Clean up
    del_tc = client.delete(f"/api/team-claims/{tc['id']}")
    assert del_tc.status_code == 200
    print("✓ Cascade delete of team claim and roster passed")

def test_company_members():
    res = client.get("/api/company-members")
    assert res.status_code == 200
    members = res.json()
    assert isinstance(members, list)
    print("✓ Company members GET passed (count:", len(members), ")")

    # Add a new company member
    new_m = {
        "memberName": "Test Directory Member",
        "memberEmail": "directory@abhyudaya.tech",
        "designation": "Engineer",
        "department": "Engineering",
        "isAdvanceHolder": "Yes",
        "defaultNotes": "Testing directory"
    }
    create_res = client.post("/api/company-members", json=new_m)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["memberName"] == "Test Directory Member"
    print("✓ Company member POST passed (id:", created["id"], ")")

    # Update the company member
    update_data = {
        "memberName": "Test Directory Member Updated",
        "memberEmail": "directory_updated@abhyudaya.tech",
        "designation": "Functional Manager",
        "department": "Engineering",
        "isAdvanceHolder": "Yes",
        "defaultNotes": "Updated directory note"
    }
    update_res = client.put(f"/api/company-members/{created['id']}", json=update_data)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["memberName"] == "Test Directory Member Updated"
    assert updated["designation"] == "Functional Manager"
    print("✓ Company member PUT passed")

    # Clean up
    del_res = client.delete(f"/api/company-members/{created['id']}")
    assert del_res.status_code == 200
    print("✓ Company member DELETE passed")

def test_team_claim_with_selected_members():
    payload = {
        "tourClaimRef": "TOUR-BATCH-TEST",
        "advanceHolderName": "Jeevan Gowda A V",
        "advanceHolderEmail": "jeevan@abhyudaya.tech",
        "advanceHolderTitle": "Functional Manager",
        "whoPaid": "Paid by Company Advance",
        "advanceHolderUpi": "N/A — Company Advance",
        "tourTitle": "Batch Roster Test",
        "expenseDate": "2026-09-25",
        "category": "Hotel / Staying",
        "cityTier": "Tier-2 Cities",
        "duration": 2,
        "vendorName": "Sayaji Hotel",
        "billNumber": "BATCH-01",
        "totalBillAmount": 5000,
        "remarks": "Testing batch selected members",
        "selectedMembers": [
            {
                "memberName": "Jeevan Gowda A V",
                "memberEmail": "jeevan@abhyudaya.tech",
                "designation": "Functional Manager",
                "department": "Engineering",
                "isAdvanceHolder": "Yes",
                "dailyRate": 2500,
                "memberNotes": "Advance Holder"
            },
            {
                "memberName": "Bharath L",
                "memberEmail": "Bharath@abhyudyayatech.com",
                "designation": "Intern",
                "department": "Operations",
                "isAdvanceHolder": "No",
                "dailyRate": 1000,
                "memberNotes": "Intern"
            }
        ]
    }
    res = client.post("/api/team-claims", json=payload)
    assert res.status_code == 201
    tc = res.json()
    assert tc["teamSize"] == 2
    assert "Jeevan Gowda" in tc["coveredMembers"]
    assert "Bharath L" in tc["coveredMembers"]
    print("✓ Team claim created with atomic selected members! Team size:", tc["teamSize"])

    # Clean up
    client.delete(f"/api/team-claims/{tc['id']}")
    print("✓ Cleaned up batch test claim")

if __name__ == "__main__":
    test_health()
    test_single_claims()
    test_team_claims_and_roster()
    test_company_members()
    test_team_claim_with_selected_members()
    print("\n🎉 ALL FASTAPI + SQLITE BACKEND TESTS PASSED SUCCESSFULLY!")

