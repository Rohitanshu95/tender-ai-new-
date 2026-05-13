from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm
from app.services.models import TenderData, Requirement
from src.utils.parser import get_document_text

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

    system_message = (
        "You are a Senior Procurement Analyst. You are provided with a Main RFP and a SEQUENCE of Corrigenda (updates). "
        "Your goal is to extract the ABSOLUTE LATEST tender details. "
        "IMPORTANT: There may be multiple corrigenda provided in the 'CORRIGENDUM UPDATES' section. "
        "Corrigendum 2 might update a date already changed by Corrigendum 1. "
        "You must track the timeline of these updates and ensure the final values reflect the most recent information provided across ALL documents. "
        "Always favor information in 'CORRIGENDUM UPDATES' sections over the 'MAIN RFP' section."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("human", (
            "--- MAIN RFP TEXT ---\n{rfp_part}\n\n"
            "--- CORRIGENDUM UPDATES ---\n{corr_part}\n\n"
            "Identify all updates and provide the final extracted tender details."
        ))
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

    prompts = {
        "pq": "You are a Pre-Qualification (PQ) Agent. Extract all eligibility criteria like financial turnover, project experience, certifications, and legal compliance.",
        "tq": "You are a Technical Qualification (TQ) Agent. Extract all technical specs, scope of work, methodology, and technical team requirements.",
        "other": "You are a Documentation Agent. Extract all required attachments, annexures, bid security (EMD), and specific forms mentioned."
    }

    system_message = (
        f"{prompts.get(template_type, '')} "
        "Provide a clean list of specific requirements. Be concise but thorough."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("human", "Extract requirements from the following RFP text:\n\n{text}")
    ])

    max_chars = 80000
    truncated_text = combined_text[:max_chars]

    chain = prompt | structured_llm
    result = chain.invoke({"text": truncated_text})
    return result.requirements
