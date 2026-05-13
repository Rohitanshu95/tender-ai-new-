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

@app.get("/")
async def root():
    return FileResponse(os.path.join("main", "index.html"))

if __name__ == "__main__":
    uvicorn.run(
        "main.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        reload_excludes=[".venv/*", "uploads/*", "db/*"]
    )
