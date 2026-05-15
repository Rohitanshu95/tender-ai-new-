# PLAN-evaluation-system

This plan covers the end-to-end implementation of the Procurement Evaluation System, featuring AI-assisted Pre-Qualification (PQ), dynamic Technical Qualification (TQ) scoring, and selection-based Financial Evaluation (L1/QCBS).

## User Review Required

> [!IMPORTANT]
> The AI PQ verification relies on the presence of a "Content Page" or "Index" in bidder documents to cross-reference with requirements. If this is missing, the AI will fall back to a full-document scan, which may be slower.

> [!WARNING]
> TQ scoring is entirely manual as requested. Ensure that criteria are correctly added before completing the stage, as "Reevaluate" will be the only way to modify them afterward.

## Proposed Changes

---

### Phase 1: Evaluation Hub & Status Logic

**Goal:** Centralize evaluation management and track progress per tender.

#### [NEW] [Evaluations.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/pages/Evaluations.jsx)
- Dashboard listing all tenders.
- Status column: `Yet to Complete`, `In Progress`, `Completed`.
- Actions: `Evaluate` (Starts process) or `Reevaluate` (Edits previous data).

#### [MODIFY] [App.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/App.jsx)
- Register the new `Evaluations` hub.

---

### Phase 2: Pre-Qualification (PQ) Module

**Goal:** AI-assisted verification of bidder eligibility.

#### [MODIFY] [PQEvaluation.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/pages/PQEvaluation.jsx)
- Implement Image 1 design.
- AI Verification button that triggers a backend scan.
- Accept/Reject toggle with "Decision" override.
- "Complete PQ" logic to move qualified bidders to TQ.

#### [NEW] [PQReport.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/pages/PQReport.jsx)
- Implement Image 2 design.
- Summary of qualified vs. disqualified bidders.
- "Download PDF" functionality.

#### [MODIFY] [microservices/main/main.py]
- New endpoint `/verify-pq` to scan bidder proposals.
- Logic: Match extracted PQ requirements from Tender against Bidder Proposal "Content Page".

---

### Phase 3: Technical Qualification (TQ) Module

**Goal:** Manual weighted scoring with dynamic criteria.

#### [MODIFY] [TQEvaluation.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/pages/TQEvaluation.jsx)
- Implement Image 3 design.
- Add/Remove Column functionality for dynamic criteria (Description + Score).
- Real-time weighted average calculation.

#### [NEW] [TQReport.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/pages/TQReport.jsx)
- Implement Image 4 design.
- Ranking list based on technical scores.

---

### Phase 4: Financial Evaluation Module

**Goal:** Selection-based financial analysis (L1/QCBS).

#### [NEW] [FinancialEvaluation.jsx](file:///c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/pages/FinancialEvaluation.jsx)
- Implement Image 5 design.
- Configuration for L1 (Lowest Bid) or QCBS (Weighted Technical + Cost).
- AI Anomaly detection (price too high/low compared to budget).
- Winner recommendation.

---

### Phase 5: Database & Integration

#### [MODIFY] [Evaluation.js (Server Model)]
- Store `pqResults`, `tqResults`, `financialResults`.
- Store `status` and `currentStage`.

## Verification Plan

### Automated Tests
- Test L1 vs QCBS math logic.
- Test PDF report generation triggers.

### Manual Verification
- Upload a bidder doc with a specific missing PQ item and verify AI detects it.
- Add 3 custom TQ columns and verify scores calculate correctly.
- Toggle "Accept" on a disqualified bidder and check report update.
