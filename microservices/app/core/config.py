import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    CHROMA_DB_PATH: str = "./db/chroma_db"
    UPLOAD_DIR: str = "./uploads"
    
    # Subdirectories
    RFP_DIR: str = os.path.join(UPLOAD_DIR, "rfp")
    RFQ_DIR: str = os.path.join(UPLOAD_DIR, "rfq")
    EOI_DIR: str = os.path.join(UPLOAD_DIR, "eoi")
    CORRIGENDUM_DIR: str = os.path.join(UPLOAD_DIR, "corrigendum")

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RFP_DIR, exist_ok=True)
os.makedirs(settings.RFQ_DIR, exist_ok=True)
os.makedirs(settings.EOI_DIR, exist_ok=True)
os.makedirs(settings.CORRIGENDUM_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
