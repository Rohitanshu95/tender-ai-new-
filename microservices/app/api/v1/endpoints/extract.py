from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List
import os
import shutil

from app.core.config import settings
from app.services.models import ExtractionResponse, SyncRequest, SyncResponse
from app.services.vector_db import vector_db
from src.utils.parser import get_document_text

# Imports from src.agents replacing app.services.extraction
from src.agents.extraction_agent import extract_tender_info, generate_template, sync_requirements

router = APIRouter()

@router.post("/", response_model=ExtractionResponse)
async def upload_and_extract(
    doc_type: str = Form(...),
    rfp_files: List[UploadFile] = File(...),
    corrigendum_files: List[UploadFile] = File([])
):
    """
    Receives RFP/RFQ/EOI and Corrigendum files separately and routes them to subdirectories.
    """
    rfp_paths = []
    corr_paths = []
    
    try:
        # Determine target directory for main files
        if doc_type == "rfq":
            target_dir = settings.RFQ_DIR
        elif doc_type == "eoi":
            target_dir = settings.EOI_DIR
        else:
            target_dir = settings.RFP_DIR

        # Process Main Files (RFP/RFQ/EOI)
        for file in rfp_files:
            path = os.path.join(target_dir, file.filename)
            if not os.path.exists(path):
                with open(path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
            rfp_paths.append(path)
            
            # Index
            text = get_document_text(path)
            vector_db.add_document(text, {"type": doc_type, "filename": file.filename})

        # Process Corrigendum Files
        for file in corrigendum_files:
            path = os.path.join(settings.CORRIGENDUM_DIR, file.filename)
            if not os.path.exists(path):
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
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-template")
async def generate_tender_template(
    template_type: str = Form(...), # pq, tq, other
    doc_type: str = Form("rfp"),
    rfp_files: List[UploadFile] = File(...),
    corrigendum_files: List[UploadFile] = File([])
):
    rfp_paths = []
    corr_paths = []
    try:
        # Determine target directory for main files
        if doc_type == "rfq":
            target_dir = settings.RFQ_DIR
        elif doc_type == "eoi":
            target_dir = settings.EOI_DIR
        else:
            target_dir = settings.RFP_DIR

        # Save Main files to target_dir
        for file in rfp_files:
            path = os.path.join(target_dir, file.filename)
            if not os.path.exists(path):
                with open(path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
            rfp_paths.append(path)
        
        # Save Corrigendum files to CORRIGENDUM_DIR
        for file in corrigendum_files:
            path = os.path.join(settings.CORRIGENDUM_DIR, file.filename)
            if not os.path.exists(path):
                with open(path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
            corr_paths.append(path)
        
        all_paths = rfp_paths + corr_paths
        requirements = generate_template(all_paths, template_type)
        return {"requirements": requirements}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync", response_model=SyncResponse)
async def sync_tender_requirements(request: SyncRequest):
    try:
        requirements = sync_requirements(request.documents, request.tenderId)
        return SyncResponse(requirements=requirements)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
