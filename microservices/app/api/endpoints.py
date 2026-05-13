from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional
import os
import shutil
from app.core.config import settings
from app.services.extraction import extract_tender_info
from app.services.models import ExtractionResponse, TenderData, CorrigendumEntry
from app.services.vector_db import vector_db
from app.services.database import save_tender, get_all_tenders, get_tender, add_corrigendum
from src.utils.parser import get_document_text

router = APIRouter()

@router.get("/tenders", response_model=List[TenderData])
async def list_tenders():
    return get_all_tenders()

@router.get("/tenders/{id}", response_model=TenderData)
async def get_tender_detail(id: int):
    tender = get_tender(id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@router.post("/tenders", response_model=TenderData)
async def create_tender(data: TenderData):
    new_id = save_tender(data)
    return get_tender(new_id)

@router.post("/extract", response_model=ExtractionResponse)
async def upload_and_extract(
    rfp_files: List[UploadFile] = File(...),
    corrigendum_files: List[UploadFile] = File([])
):
    """
    Receives RFP and Corrigendum files separately for better AI analysis.
    """
    rfp_paths = []
    corr_paths = []
    
    try:
        # Process RFP Files
        for file in rfp_files:
            path = os.path.join(settings.UPLOAD_DIR, f"rfp_{file.filename}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            rfp_paths.append(path)
            
            # Index
            text = get_document_text(path)
            vector_db.add_document(text, {"type": "rfp", "filename": file.filename})

        # Process Corrigendum Files
        for file in corrigendum_files:
            path = os.path.join(settings.UPLOAD_DIR, f"corr_{file.filename}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            corr_paths.append(path)
            
            # Index
            text = get_document_text(path)
            vector_db.add_document(text, {"type": "corrigendum", "filename": file.filename})

        # Perform smart extraction
        extraction_result = extract_tender_info(rfp_paths, corr_paths)
        
        return ExtractionResponse(
            data=extraction_result,
            source_files=[f.filename for f in rfp_files + corrigendum_files],
            message="Extraction successful"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-template")
async def generate_tender_template(
    template_type: str, # pq, tq, other
    rfp_files: List[UploadFile] = File(...)
):
    rfp_paths = []
    try:
        for file in rfp_files:
            path = os.path.join(settings.UPLOAD_DIR, f"tmp_{file.filename}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            rfp_paths.append(path)
        
        from app.services.extraction import generate_template
        requirements = generate_template(rfp_paths, template_type)
        return {"requirements": requirements}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
