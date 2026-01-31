# Revised Agno Implementation Plan: Native Logic Integration

> **Strategy Change**: Instead of creating an API "Adapter Layer" to reshape inconsistent data, we will **upgrade the Agno Backend Agents and Schemas** to natively produce the exact data structures expected by the Frontend/Antigravity hooks. This ensures a single source of truth and avoids bespoke "view-only" endpoints.

## 1. Schema Upgrades (The Contracts)

We will modify `backend/agents/schemas.py` to match the "Data Contracts" identified in the Gap Analysis.

### 1.1 Narrative Identity (AssessmentAgent)
**Current**: `NarrativeIdentity` (brand_statement, themes, seeds, alignment)
**Target**: Align with `NarrativeDNA` interface.
**Changes**:
```python
class NarrativeIdentity(BaseModel):
    narrative_dna: str = Field(..., description="The core narrative DNA string")  # New
    brand_statement: str
    themes: List[str]
    confidence_score: float = Field(..., description="0-1.0 confidence")         # New
    archetype_alignment: str
    identity_markers: List[str] = Field(default_factory=list)                    # New
    # Keep existing if needed, or map
```

### 1.2 Award Portfolio (AwardsAgent)
**Current**: `PortfolioWithDelta` (core_recommendations: List, stem_swap)
**Target**: Bucket-based structure.
**Changes**:
```python
class AwardPortfolio(BaseModel):
    reach: List[AwardMatch] = Field(..., description="Ambitious/High difficulty")
    target: List[AwardMatch] = Field(..., description="Moderate difficulty")
    safety: List[AwardMatch] = Field(..., description="Low difficulty")
    stem_heavy_swap: Optional[AwardMatch] = None
    strategic_insights: List[str] = Field(default_factory=list)

class AwardMatch(BaseModel):
    # Consolidate RecommendationItem into this richer shape if needed
    name: str
    organization: str
    impact_level: str
    win_probability: float  # New
    fit_score: float        # New
    deadline: Optional[str]
    description: str
```

### 1.3 Master Game Plan (GamePlanAgent)
**Current**: `MasterGamePlan` (activities, phases, seeds, etc.)
**Target**: Include nested synthesis objects.
**Changes**:
```python
class IdentitySynthesis(BaseModel):
    archetype: str
    spike: str
    pillars: List[str]
    brand_statement: str

class MasterGamePlan(BaseModel):
    # ... existing fields ...
    
    # New Nested Objects for Dashboard Rendering
    identity_synthesis: IdentitySynthesis
    
    # Ensure programs and awards are embedded if the Game Plan requires them
    # OR provide separate clean endpoints. User prompt implies aggregation might be expected.
    # We will stick to the Orchestrator providing the overview.
    ec_generation: Optional[Dict] # If needed for EC card
```

### 1.4 Execution Debt (ExecutionAgent)
**Current**: Wrapped in generic strings/status.
**Target**: Explicit Score object.
**Changes**:
- Ensure `ExecutionAgent` returns a dedicated `ExecutionStatus` model with `score`, `status` enum, and `factors` list.

---

## 2. Agent Logic Upgrades

We must update the `run()` methods or internal logic of the agents to populate these new schema fields.

### 2.1 AwardsAgent (`backend/agents/specialists/awards.py`)
- **Logic Change**: Instead of determining "Top 5", explicitly bucket found awards into Reach/Target/Safety based on `difficulty` and `fit_score`.
- **Math**: Implement `calculate_win_probability()` logic (or port from scout_math) to populate the new field.

### 2.2 GamePlanAgent (`backend/agents/orchestrators/gameplan.py`)
- **Logic Change**:
    - When `run()` is called, it MUST explicitly fetch or derive the `IdentitySynthesis` data (likely from `Assessment` output or Memory).
    - Populate `identity_synthesis` in `MasterGamePlan`.

### 2.3 AssessmentAgent (`backend/agents/orchestrators/assessment.py`)
- **Logic Change**: Ensure `confidence` is calculated and `narrative_dna` is generated (distinct from brand statement).

---

## 3. API Endpoint Implementation

Since the Agents now return the *correct* data, the API endpoints become simple interactions.

**File**: `backend/api/routers/agents.py` (New standard router)

| Endpoint | Method | Agent | Implementation |
| :--- | :--- | :--- | :--- |
| `/api/narrative/synthesize` | `POST` | `AssessmentAgent` | `return agent.run(mode="narrative_synthesis")` |
| `/api/gameplan/generate` | `POST` | `GamePlanAgent` | `return agent.run(mode="full_generation")` |
| `/api/awards/match/{id}` | `GET` | `AwardsAgent` | `return agent.run(mode="planning")` |
| `/api/execution/debt/{id}` | `GET` | `ExecutionAgent` | `return agent.run(mode="status_check")` |
| `/api/opportunities/alerts/{id}` | `GET` | `OpportunityAgent` | `return agent.run(mode="discovery")` |
| `/health` | `GET` | System | Return generic health JSON |

*Note: The Frontend uses specific paths (e.g. `/api/narrative/synthesize`). We will match these paths exactly.*

## 4. Execution Steps

1.  **Modify Schemas**: Update `backend/agents/schemas.py`.
2.  **Update Awards Logic**: Edit `backend/agents/specialists/awards.py`.
3.  **Update Assessment Logic**: Edit `backend/agents/orchestrators/assessment.py` (verify/add fields).
4.  **Update GamePlan Logic**: Edit `backend/agents/orchestrators/gameplan.py` to aggregate identity.
5.  **Create API Router**: Create `backend/api/routers/agents.py` and register in `main.py`.
6.  **Verify**: Start server, hit endpoints, check JSON output.

## 5. Timeline & Dependencies

- **Blocking**: Requires `backend/agents/schemas.py` changes which ripple to all Agents.
- **Risk**: Changing `MasterGamePlan` might break other tests if they rely on the old fields. Will default new fields or update tests.
