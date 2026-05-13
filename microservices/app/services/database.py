import sqlite3
import json
from typing import List, Optional
from app.services.models import TenderData, CorrigendumEntry

DB_PATH = "tenders.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tenders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_id TEXT,
            tender_type TEXT,
            evaluation_type TEXT,
            title TEXT,
            organization TEXT,
            date_of_publish TEXT,
            date_of_closing TEXT,
            date_of_bid_opening TEXT,
            tender_document_ref TEXT,
            boq_ref TEXT,
            corrigenda TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_tender(data: TenderData) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    corrigenda_json = json.dumps([c.dict() for c in data.corrigenda])
    
    cursor.execute('''
        INSERT INTO tenders (
            tender_id, tender_type, evaluation_type, title, organization,
            date_of_publish, date_of_closing, date_of_bid_opening,
            tender_document_ref, boq_ref, corrigenda
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.tender_id, data.tender_type, data.evaluation_type, data.title,
        data.organization, data.date_of_publish, data.date_of_closing,
        data.date_of_bid_opening, data.tender_document_ref, data.boq_ref,
        corrigenda_json
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def get_all_tenders() -> List[TenderData]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tenders ORDER BY id DESC')
    rows = cursor.fetchall()
    
    tenders = []
    for row in rows:
        data = dict(row)
        data['corrigenda'] = json.loads(data['corrigenda'])
        tenders.append(TenderData(**data))
    
    conn.close()
    return tenders

def get_tender(id: int) -> Optional[TenderData]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tenders WHERE id = ?', (id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        data = dict(row)
        data['corrigenda'] = json.loads(data['corrigenda'])
        return TenderData(**data)
    return None

def add_corrigendum(tender_id: int, corrigendum: CorrigendumEntry):
    tender = get_tender(tender_id)
    if not tender:
        return
    
    tender.corrigenda.append(corrigendum)
    corrigenda_json = json.dumps([c.dict() for c in tender.corrigenda])
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE tenders SET corrigenda = ? WHERE id = ?', (corrigenda_json, tender_id))
    conn.commit()
    conn.close()

# Initialize on import
init_db()
