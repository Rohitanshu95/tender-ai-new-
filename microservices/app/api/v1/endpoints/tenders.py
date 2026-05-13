from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import shutil
from datetime import datetime

from app.core.config import settings
from app.services.models import TenderData, CorrigendumEntry
from app.services.database import save_tender, get_all_tenders, get_tender, add_corrigendum
from app.services.vector_db import vector_db
from src.utils.parser import get_document_text

router = APIRouter()

@router.get("/", response_model=List[TenderData])
async def list_tenders():
    return get_all_tenders()

@router.get("/{id}", response_model=TenderData)
async def get_tender_detail(id: int):
    tender = get_tender(id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@router.post("/", response_model=TenderData)
async def create_tender(data: TenderData):
    new_id = save_tender(data)
    return get_tender(new_id)

@router.post("/{id}/corrigendum")
async def upload_tender_corrigendum(
    id: int,
    files: List[UploadFile] = File(...)
):
    """
    Uploads corrigendum documents for an existing tender.
    """
    try:
        filenames = []
        for file in files:
            path = os.path.join(settings.CORRIGENDUM_DIR, file.filename)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            filenames.append(file.filename)
            
            # Index
            text = get_document_text(path)
            vector_db.add_document(text, {"type": "corrigendum", "tender_id": id, "filename": file.filename})

        # Record in DB
        entry = CorrigendumEntry(
            date=datetime.now().strftime("%Y-%m-%d"),
            documents=filenames,
            details="Manually added corrigendum"
        )
        add_corrigendum(id, entry)
        
        return {"message": "Corrigendum uploaded successfully", "files": filenames}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
