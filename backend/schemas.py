from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

# --- Single Employee Claim Schemas ---
class SingleClaimBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    sl_no: Optional[int] = Field(default=None, alias="slNo")
    employee_name: str = Field(..., alias="employeeName")
    employee_email: str = Field(..., alias="employeeEmail")
    designation: str
    department: str
    expense_date: str = Field(..., alias="expenseDate")
    category: str
    city_tier: str = Field(..., alias="cityTier")
    duration: float = 1.0
    vendor_name: str = Field(..., alias="vendorName")
    bill_number: Optional[str] = Field(default="", alias="billNumber")
    claim_amount: float = Field(..., alias="claimAmount")
    who_paid: str = Field(..., alias="whoPaid")
    upi_id: Optional[str] = Field(default="", alias="upiId")
    project_name: Optional[str] = Field(default="", alias="projectName")
    remarks: Optional[str] = Field(default="", alias="remarks")

class SingleClaimCreate(SingleClaimBase):
    pass

class SingleClaimResponse(SingleClaimBase):
    id: int

# --- Team Tour Claim Schemas ---
class TeamClaimBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    tour_claim_ref: str = Field(..., alias="tourClaimRef")
    advance_holder_name: str = Field(..., alias="advanceHolderName")
    advance_holder_email: str = Field(..., alias="advanceHolderEmail")
    advance_holder_title: str = Field(..., alias="advanceHolderTitle")
    who_paid: str = Field(..., alias="whoPaid")
    advance_holder_upi: Optional[str] = Field(default="", alias="advanceHolderUpi")
    tour_title: str = Field(..., alias="tourTitle")
    expense_date: str = Field(..., alias="expenseDate")
    category: str
    city_tier: str = Field(..., alias="cityTier")
    duration: float = 1.0
    vendor_name: str = Field(..., alias="vendorName")
    bill_number: Optional[str] = Field(default="", alias="billNumber")
    total_bill_amount: float = Field(..., alias="totalBillAmount")
    remarks: Optional[str] = Field(default="", alias="remarks")

class TeamClaimCreate(TeamClaimBase):
    selected_members: Optional[List[dict]] = Field(default=[], alias="selectedMembers")

class TeamClaimResponse(TeamClaimBase):
    id: int
    team_size: Optional[int] = Field(default=1, alias="teamSize")
    covered_members: Optional[str] = Field(default="", alias="coveredMembers")

# --- Team Roster Member Schemas ---
class RosterMemberBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    tour_claim_ref: str = Field(..., alias="tourClaimRef")
    member_name: str = Field(..., alias="memberName")
    member_email: str = Field(..., alias="memberEmail")
    designation: str
    department: Optional[str] = ""
    is_advance_holder: Optional[str] = Field(default="No", alias="isAdvanceHolder")
    daily_rate: float = Field(default=0.0, alias="dailyRate")
    member_notes: Optional[str] = Field(default="", alias="memberNotes")

class RosterMemberCreate(RosterMemberBase):
    pass

class RosterMemberResponse(RosterMemberBase):
    id: int

# --- Company Member Directory Schemas ---
class CompanyMemberBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    member_name: str = Field(..., alias="memberName")
    member_email: str = Field(..., alias="memberEmail")
    designation: str
    department: Optional[str] = "Operations"
    is_advance_holder: Optional[str] = Field(default="No", alias="isAdvanceHolder")
    default_notes: Optional[str] = Field(default="", alias="defaultNotes")

class CompanyMemberCreate(CompanyMemberBase):
    pass

class CompanyMemberResponse(CompanyMemberBase):
    id: int

