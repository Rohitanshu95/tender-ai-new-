# PLAN: Sequential Generation & Navigation

Implement a high-precision, multi-agent generation flow for Pre-Qualification (PQ), Technical Qualification (TQ), and other tender documents. The solution focuses on browser-side persistence to minimize token usage and a premium "one-by-one" navigated UI.

## User Review Required

> [!IMPORTANT]
> The generation state will be stored in the browser's local state. This means if the user refreshes the page, the generated data will be lost unless we implement `localStorage` persistence. I will stick to local state as requested ("locally stay in browser"), but can add `localStorage` if needed.

## Proposed Changes

### [Frontend] Client UI Refactor

Refactor the main dashboard to support a tabbed/wizard view for different extraction types.

#### [MODIFY] [App.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/App.jsx)
- Update state management to include `activeTab` and specific data objects for PQ, TQ, and Others.
- Implement logic to check if a section is already generated before allowing a new generation.

#### [NEW] [ExtractionTabs.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/components/ExtractionTabs.jsx)
- Create a premium tab component with smooth transitions.
- Add "Locked" or "Pending" states for sections not yet generated.

#### [MODIFY] [ExtractionView.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/components/ExtractionView.jsx) (Hypothetical name, will confirm)
- Implement the "Generating State" with a premium progress indicator and status messages.

---

### [Backend] Multi-Agent Logic

Enhance the extraction agents to have distinct personas and logic for different document types.

#### [MODIFY] [tender_prompts.py](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/microservices/src/prompts/tender_prompts.py)
- Refine 3 unique system messages for:
    - **PQ Agent**: Focuses on eligibility, financial criteria, and legal standing.
    - **TQ Agent**: Focuses on technical specs, project experience, and methodology.
    - **Others Agent**: Focuses on generic clauses, timelines, and contact info.

#### [MODIFY] [extraction_agent.py](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/microservices/src/agents/extraction_agent.py)
- Optimize the `generate_template` function to leverage the refined unique agents.

## Verification Plan

### Automated Tests
- `pytest` for the `generate-template` endpoint to ensure it returns correct structures for all 3 types.

### Manual Verification
1. Open the UI.
2. Upload a document.
3. Click "Generate PQ". Verify the loading state and that data is displayed.
4. Navigate to "Technical Qualification". Click "Generate TQ".
5. Navigate back to "PQ" and verify the data is still there and NO network request is triggered.
