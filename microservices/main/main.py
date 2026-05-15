import uvicorn
from fastapi import FastAPI
from app.api.v1.api import api_router

from fastapi.responses import FileResponse
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Procurement Extraction AI System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

from app.utils.pq_verifier import verify_bidder_pq

@app.get("/")
async def root():
    return FileResponse(os.path.join("main", "index.html"))

@app.post("/verify-pq")
async def verify_pq(data: dict):
    tender_id = data.get("tenderId")
    
    # In a real app, we'd fetch bidders from the DB or Node.js API
    # For now, we simulate with two bidders
    requirements = ["Company Registration", "Financial Turnover", "Similar Experience", "Legal Compliance"]
    
    b1 = verify_bidder_pq("Global Tech Solutions", "uploads/p1.pdf", requirements)
    b2 = verify_bidder_pq("Nexus Infrastructure", "uploads/p2.pdf", requirements)
    
    # Map mock IDs for the frontend
    b1["bidderId"] = "b1"
    b2["bidderId"] = "b2"
    
    return {
        "status": "success",
        "tenderId": tender_id,
        "bidders": [b1, b2]
    }

from app.utils.financial_analyzer import detect_financial_anomalies

@app.post("/analyze-financials")
async def analyze_financials(data: dict):
    tender_id = data.get("tenderId")
    bidders = data.get("bidders", [])
    estimated_value = data.get("estimatedValue", 0)
    
    analyzed_bidders = detect_financial_anomalies(bidders, estimated_value)
    
    return {
        "status": "success",
        "tenderId": tender_id,
        "bidders": analyzed_bidders
    }


if __name__ == "__main__":
    uvicorn.run(
        "main.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        reload_excludes=[".venv/*", "uploads/*", "db/*"]
    )
