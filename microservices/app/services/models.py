from pydantic import BaseModel, Field
from typing import Optional, List

class CorrigendumEntry(BaseModel):
    id: Optional[str] = None
    date: Optional[str] = Field(None, description="Corrigendum Date (DD-MM-YYYY)")
    documents: List[str] = []
    details: Optional[str] = None

class Requirement(BaseModel):
    category: str = Field(..., description="Category (PQ or TQ)")
    key: str = Field(..., description="The specific requirement name/short title")
    value: str = Field(..., description="Detailed explanation or limit")
    mandatory: bool = True

class TenderTemplates(BaseModel):
    pq_requirements: List[Requirement] = []
    tq_requirements: List[Requirement] = []
    other_documents: List[Requirement] = []

class TenderData(BaseModel):
    id: Optional[int] = None
    tender_id: Optional[str] = Field(None, description="Tender ID / Reference No")
    tender_type: Optional[str] = Field(None, description="Tender Type (RFP, RFQ, or EoI)")
    estimated_value: Optional[str] = Field(None, description="Estimated Value of the Project / Tender Value")
    evaluation_type: Optional[str] = Field(None, description="Evaluation Type (L1, QCBS, etc.)")
    title: Optional[str] = Field(None, description="Title of the tender")
    organization: Optional[str] = Field(None, description="Organization name")
    department: Optional[str] = Field(None, description="Department (Public Works, IT & Electronics, or Education)")
    date_of_publish: Optional[str] = Field(None, description="Date of Publish")
    date_of_closing: Optional[str] = Field(None, description="Date of Closing")
    date_of_bid_opening: Optional[str] = Field(None, description="Date of Bid Opening")
    tender_document_ref: Optional[str] = Field(None, description="Reference or name of the main Tender Document")
    boq_ref: Optional[str] = Field(None, description="Reference or name of the Bill of Quantity (BOQ)")
    corrigenda: List[CorrigendumEntry] = []
    templates: Optional[TenderTemplates] = None

class ExtractionResponse(BaseModel):
    data: TenderData
    source_files: List[str]
    message: str = "Extraction completed successfully"

class SyncDocument(BaseModel):
    id: str
    path: str
    type: str
    version: int

class SyncRequest(BaseModel):
    tenderId: str
    documents: List[SyncDocument]

class SyncRequirement(BaseModel):
    category: str
    key: str
    value: str
    sourceDocId: str

class SyncResponse(BaseModel):
    requirements: List[SyncRequirement]
    message: str = "Sync successful"
