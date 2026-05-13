from fastapi import APIRouter
from app.api.v1.endpoints import tenders, extract

api_router = APIRouter()

api_router.include_router(tenders.router, prefix="/tenders", tags=["tenders"])
api_router.include_router(extract.router, prefix="/extract", tags=["extract"])
