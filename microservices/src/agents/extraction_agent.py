from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm
from app.services.models import TenderData, Requirement
from src.utils.parser import get_document_text
from src.prompts.tender_prompts import (
    EXTRACTION_SYSTEM_MESSAGE,
    EXTRACTION_HUMAN_MESSAGE,
    get_template_system_message,
    TEMPLATE_HUMAN_MESSAGE
)

def extract_tender_info(rfp_paths: list[str], corr_paths: list[str] = []) -> TenderData:
    """
    Combines text from RFP and Corrigendum with smart prioritization.
    Corrigendum text is preserved, while RFP text is truncated if needed to fit context.
    """
    rfp_text = ""
    for path in rfp_paths:
        rfp_text += f"\n[MAIN RFP CONTENT - {path}]\n"
        rfp_text += get_document_text(path)

    corr_text = ""
    for path in corr_paths:
        corr_text += f"\n[CORRIGENDUM UPDATE - {path}]\n"
        corr_text += get_document_text(path)

    llm = get_llm()
    structured_llm = llm.with_structured_output(TenderData)

    prompt = ChatPromptTemplate.from_messages([
        ("system", EXTRACTION_SYSTEM_MESSAGE),
        ("human", EXTRACTION_HUMAN_MESSAGE)
    ])

    max_total_chars = 80000
    corr_part = corr_text[:30000]
    rfp_part = rfp_text[:(max_total_chars - len(corr_part))]

    chain = prompt | structured_llm
    result = chain.invoke({
        "rfp_part": rfp_part,
        "corr_part": corr_part
    })

    return result

def generate_template(rfp_paths: list[str], template_type: str) -> list[Requirement]:
    """
    Agentic template generation for PQ, TQ, or Other Documents.
    """
    combined_text = ""
    for path in rfp_paths:
        combined_text += f"\n--- Document: {path} ---\n"
        combined_text += get_document_text(path)

    llm = get_llm()
    
    # We define a wrapper for list output
    from pydantic import create_model
    RequirementList = create_model("RequirementList", requirements=(list[Requirement], ...))
    structured_llm = llm.with_structured_output(RequirementList)

    prompt = ChatPromptTemplate.from_messages([
        ("system", get_template_system_message(template_type)),
        ("human", TEMPLATE_HUMAN_MESSAGE)
    ])

    max_chars = 80000
    truncated_text = combined_text[:max_chars]

    chain = prompt | structured_llm
    result = chain.invoke({"text": truncated_text})
    return result.requirements
