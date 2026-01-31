# Gap Closing Implementation Plan: Multi-Agent Backend

## Goal
Implement the 6 missing backend API endpoints required to power the Multi-Agent Dashboard (`MultiAgentTab.tsx`). This plan focuses on creating an **Adapter Layer** in the API to bridge the gap between existing Backend Agent outputs and Frontend component expectations.

## Current State Analysis
- **Frontend**: Fully functional "Antigravity" UI that gracefully falls back to placeholders. deeply coupled to specific JSON structures (e.g., `awards.portfolio.reach`, `game_plan.identity_synthesis`).
- **Backend Agents**: Fully implemented logic (`Assessment`, `GamePlan`, `EC`, `Awards`, `Execution`, `Opportunity`) but they output standard Pydantic models (`PortfolioWithDelta`, `MasterGamePlan`) that do NOT strictly match the Frontend JSON expectations.
- **The Gap**:
    1.  **Missing Endpoints**: The actual HTTP routes do not exist.
    2.  **Data Structure Mismatch**:
        - **Awards**: Frontend expects `reach/target/safety` buckets; Backend returns a flat list + swap.
        - **Game Plan**: Frontend expects `identity_synthesis` nested in the response; Backend `MasterGamePlan` schema lacks this.
        - **Execution**: Frontend needs specific `execution_debt_score` format; Backend calculates it but wraps it in generic status messages.

## Proposed Architecture: The Bridge Pattern
We will not rewrite the Agents (Tier 1/2 logic is sound). Instead, we will implement the **API Routers** as a **Bridge/Adapter Layer**.

**Responsibility of this Layer:**
1.  **Invoke Agent**: Call `agent.run()` or specific methods.
2.  **Transform Data**: Reshape the Pydantic output into the exact JSON shape the Frontend `useAgentData` hooks expect.
3.  **Handle Errors**: Return standard error codes to trigger Frontend fallbacks if needed.

---

## Implementation Details

### Component 1: API Router Setup
**File**: `backend/api/routers/agents_bridge.py`
**Actions**:
- Create a new router `agents_router`.
- Register it in `backend/main.py` with prefix `/agents`.

### Component 2: Endpoint Logic & Data Transforms

#### 1. Assessment Synthesis
- **Endpoint**: `POST /assessment/synthesize`
- **Agent**: `AssessmentAgent`
- **Gap**: Frontend needs `narrative_dna`, `archetype` (obj), `cri`. Agent returns `AssessmentOutput`.
- **Transformation**:
    ```python
    return {
        "narrative_dna": agent_output.narrative_dna,
        "themes": agent_output.themes,
        "confidence_score": agent_output.confidence,
        "archetype": {
            "name": agent_output.archetype.name,
            "confidence": agent_output.archetype.confidence
        },
        "cri": agent_output.context_relativity_index
    }
    ```

#### 2. Game Plan Generation (The Aggregator)
- **Endpoint**: `POST /gameplan/generate`
- **Agent**: `GamePlanAgent`
- **Gap**: Frontend `useGamePlan` expects `identity_synthesis` and `portfolio_analysis` INSIDE the response, alongside `game_plan`.
- **Strategy**: This endpoint must be an **orchestrator of orchestrators**.
    - Run `GamePlanAgent` -> Get `MasterGamePlan`.
    - Run `NarrativeAgent` (or extract from memory) -> Get Identity info.
    - Run `ECAgent` (planning mode) -> Get Portfolio Analytics.
- **Transformation**:
    ```python
    return {
        "game_plan": {
            **master_game_plan.dict(),
            "identity_synthesis": {
                "archetype": narrative.archetype_alignment,
                "spike": narrative.brand_statement,
                "pillars": narrative.themes
            },
            "portfolio_analysis": {
                "strengths": ["Leadership", "Impact"], # Derived from EC output
                "gaps": ec_output.validation_notes
            }
        }
    }
    ```

#### 3. Execution Debt Score
- **Endpoint**: `POST /execution/debt-score`
- **Agent**: `ExecutionAgent`
- **Gap**: Needs pure score data.
- **Transformation**:
    - Instantiate `ExecutionAgent`.
    - Call `eds_calculator.calculate_distress(tasks)`.
    - Return:
    ```python
    {
        "execution_debt_score": score,
        "status": "healthy" if score < 30 else "at_risk",
        "factors": ["Task Velocity", "Deadline Proximity"],
        "trend": "stable"
    }
    ```

#### 4. Awards Matching
- **Endpoint**: `POST /awards/match`
- **Agent**: `AwardsAgent`
- **Gap**: Frontend expects buckets (`reach`, `target`, `safety`). Backend gives 5 core items.
- **Transformation**:
    - Get `PortfolioWithDelta`.
    - Iterate `core_recommendations`.
    - Logic:
        - `difficulty="AMBITIOUS"` -> `reach`
        - `difficulty="MODERATE"` -> `target`
        - `difficulty="EASY"` -> `safety`
    - Add `stem_heavy_swap` into `reach` if present.
    - Return `{ portfolio: { reach: [...], target: [...], safety: [...] } }`.

#### 5. Programs Agent
- **Endpoint**: `POST /opportunity/programs` (Note check frontend path, likely `/agents/programs/match` or handled by opportunity?) -> *Correction: Frontend `OpportunitiesSection` calls `useOpportunityMatches` AND `useGamePlan`. There isn't a dedicated Programs endpoint visible in the hook snippet `useAgentData` I remember, but `MultiAgentTab` has `OpportunitiesSection`. I will check strict endpoint path.*
- **Action**: Verify path. If dedicated, transform similarly to Awards.

#### 6. Opportunity Scouting
- **Endpoint**: `POST /opportunity/find` & `/opportunity/alerts`
- **Agent**: `OpportunityAgent`
- **Transformation**:
    - `batch = agent.run(mode="planning")`
    - Flatten `batch.tier_1_matches` and `tier_2_matches` into `matches` list for frontend.
    - Return `{ matches: [...] }`.

## Verification Plan
1.  **Mock Test**: Create the router and initially return static JSON matching the target structure to verify Frontend "Success" state immediately.
2.  **Integration**: Wire up the actual Agents one by one.
3.  **UI Check**: Verify `MultiAgentTab` shows "Ready" (Green Check) for all agents.

## New Dependencies
- None. Uses existing `agno` and `fastapi`.

## Documentation
- Update `AGNO_MULTIAGENT_TECH_SPEC.md` to document this Adapter Layer.
