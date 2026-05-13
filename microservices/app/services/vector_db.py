import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings
import uuid

class VectorDB:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="tender_documents")

    def add_document(self, text: str, metadata: dict):
        """
        Adds document text to ChromaDB. 
        In a real RAG setup, we would split the text into chunks first.
        """
        # Simple chunking for demonstration
        chunk_size = 1000
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [metadata for _ in chunks]
        
        self.collection.add(
            documents=chunks,
            ids=ids,
            metadatas=metadatas
        )

    def query(self, query_text: str, n_results: int = 5):
        return self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )

vector_db = VectorDB()
