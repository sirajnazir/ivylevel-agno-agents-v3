# IvyLevel v4.0 Changelog

**Version:** v4.0 - Fixed Assessment + Narrative
**Release Date:** January 31, 2026
**Last Updated:** January 31, 2026

---

## Overview

This release represents a major enhancement to the IvyLevel platform, introducing a multi-dimensional archetype system, complete assessment agent overhaul, and full-stack integration from backend Python agents to frontend React hooks.

---

## v4.0 - Fixed Assessment + Narrative (January 31, 2026)

### Major Features

#### 1. Multi-Dimensional Archetype System V2
**Files:** `backend/agents/schemas/archetype_v2.py`, `backend/agents/schemas/archetype_engine.py`

The one-dimensional archetype system (SCHOLAR, RESEARCHER, etc.) has been replaced with a 6-dimension archetype synthesis:

| Dimension | Purpose | Key Types |
|-----------|---------|-----------|
| **Domain Focus** | WHAT they do | 18 types: STEM_RESEARCHER, TECH_BUILDER, HUMANITIES_SCHOLAR, etc. |
| **Context** | WHERE/WHO they are | Gender, Ethnicity, URM/ORM, First-Gen, School Type, Socioeconomic |
| **Execution Style** | HOW they operate | 12 types: TYPE_A_ACHIEVER, PERFECTIONIST, ADHD_HYPERFOCUS, etc. |
| **Challenges** | OBSTACLES they face | GPA_RECOVERY, LATE_BLOOMER, BREADTH_NOT_DEPTH, etc. |
| **Timeline** | WHEN they are in journey | EARLY_HS, MID_HS, LATE_HS, GAP_YEAR, TRANSFER |
| **Strengths/Weaknesses** | Internal resources | Cognitive, Interpersonal, Execution, Character traits |

**Composite Code Example:** `STEM-RESEARCHER.TYPE-A.MID-HS.HIGH-RESOURCE`

#### 2. Gender & Ethnicity Strategic Detection
**Files:** `backend/agents/schemas/archetype_v2.py` (lines 136-206)

New enums and detection logic for strategic positioning:

```python
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class Ethnicity(str, Enum):
    AFRICAN_AMERICAN = "african_american"
    HISPANIC_LATINO = "hispanic_latino"
    NATIVE_AMERICAN = "native_american"
    ASIAN_EAST = "asian_east"
    ASIAN_SOUTH = "asian_south"
    # ... 11 total categories
```

**Auto-Detection Features:**
- URM (Underrepresented Minority) detection
- ORM (Overrepresented Minority) detection
- Gender-minority-in-field detection (e.g., Woman in STEM)
- Diversity angle generation for essay strategy

#### 3. Assessment Agent Enhancement
**File:** `backend/agents/orchestrators/assessment.py`

- Extended `ArchetypeOutput` model with V2 fields:
  - `composite_code`: Multi-dimensional code string
  - `domain`: Domain dimension data
  - `context`: Context dimension with gender, ethnicity, URM status
  - `execution_style`: Execution pattern data
  - `timeline`: Timeline position data
  - `diversity_angles`: List of narrative hooks
  - `strategy_family`: Primary coaching strategy

- Profile completeness scoring (0.0-1.0)
- Analysis notes for sparse profiles
- NarrativeAgent integration for LLM synthesis

#### 4. API Bridge V2 Integration
**File:** `backend/api/routers/agents_bridge.py`

Updated `/agents/narrative/synthesize` endpoint to return V2 archetype data:

```json
{
  "archetype_v2": {
    "composite_code": "TECH-BUILDER.TYPE-A.MID-HS.MEDIUM-RESOURCE",
    "domain": { "primary": "tech_builder", "has_spike": true },
    "context": {
      "gender": "female",
      "ethnicity": "asian_south",
      "is_urm": false,
      "is_first_gen": true,
      "diversity_angles": ["woman in tech/STEM", "first-generation college student"]
    },
    "execution": { "primary_style": "type_a_achiever" },
    "timeline": { "position": "mid_hs", "grade": 11 },
    "strategy_family": "type_a_execution"
  }
}
```

#### 5. Frontend Hook Enhancement
**File:** `frontend/src/hooks/useAgentData.ts`

`useAssessmentEnhancement` hook now extracts V2 archetype data:
- `archetype_v2.composite_code`
- `archetype_v2.is_urm`, `is_first_gen`
- `archetype_v2.diversity_angles`
- `archetype_v2.execution_style`
- `archetype_v2.gender`, `ethnicity`

#### 6. Scoring Engine Python Port
**Files:** `backend/tools/scoring/engine.py`, `archetypes.py`, `factors.py`, `constants.py`

Complete Python port of the TypeScript scoring engine:
- Layer 1-7 calculation pipeline
- Category score normalization
- SFFA Rubric (1-6 scale)
- Ivy+ Ready Score (0-100)
- Factor analysis (helping/holding back)

#### 7. Strategy Framework Registry
**File:** `backend/agents/schemas/archetype_engine.py` (lines 800-944)

Framework registry for proven coaching strategies:
- ADHD-Friendly Task Chunking
- Anti-Perfectionism MVP Approach
- Type A Sprint Planning
- First-Gen Essay Framework
- Senior Year Sprint Protocol

---

### Technical Changes

#### New Files Created

| Path | Purpose |
|------|---------|
| `backend/agents/schemas/archetype_v2.py` | V2 archetype type definitions (711 lines) |
| `backend/agents/schemas/archetype_engine.py` | Archetype synthesis engine (976 lines) |
| `backend/agents/schemas/__init__.py` | Schema exports |
| `backend/agents/orchestrators/assessment.py` | Assessment agent (525 lines) |
| `backend/agents/orchestrators/gameplan.py` | GamePlan agent |
| `backend/agents/orchestrators/execution.py` | Execution agent |
| `backend/agents/specialists/narrative.py` | Narrative specialist |
| `backend/agents/specialists/academic.py` | Academic specialist |
| `backend/agents/specialists/awards.py` | Awards specialist |
| `backend/agents/specialists/ec.py` | EC specialist |
| `backend/agents/specialists/programs.py` | Programs specialist |
| `backend/agents/specialists/opportunity.py` | Opportunity specialist |
| `backend/tools/scoring/engine.py` | Scoring engine |
| `backend/tools/scoring/archetypes.py` | Archetype wrapper (520 lines) |
| `backend/tools/scoring/factors.py` | Factor analysis |
| `backend/tools/scoring/constants.py` | Scoring constants |
| `backend/api/routers/agents_bridge.py` | API bridge endpoints (596 lines) |

#### Modified Files

| Path | Changes |
|------|---------|
| `backend/agents/base.py` | IvyAgent base class |
| `backend/agents/registry.py` | Agent loading registry |
| `backend/main.py` | FastAPI app with agent routes |
| `backend/requirements.txt` | Added agno dependency |
| `backend/tools/supabase_tools.py` | Enhanced DB operations |

#### Archived Files

| Original Path | Archive Path |
|---------------|--------------|
| Old archetypes.py | `_archive/archetypes_v1.py` |

---

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agents/assessment/score` | POST | Full assessment with V2 archetype |
| `/agents/narrative/synthesize` | POST | Narrative synthesis with V2 data |
| `/agents/gameplan/generate` | POST | Master game plan generation |
| `/agents/awards/match` | POST | Award matching |
| `/agents/programs/match` | POST | Program matching |
| `/agents/opportunity/find` | POST | Opportunity scouting |
| `/agents/opportunity/alerts` | POST | Deadline alerts |
| `/agents/execution/debt-score` | POST | EDS calculation |
| `/agents/profile/sync` | POST | Profile sync to DB |
| `/agents/profile` | DELETE | Delete user data |

---

### Migration Notes

#### Backward Compatibility

The V2 system maintains full backward compatibility:

```python
# Legacy API still works
from backend.tools.scoring.archetypes import detect_archetype
result = detect_archetype(profile, scores)
print(result.id)  # "SCHOLAR" (legacy)
print(result.multi_dimensional.composite_code)  # V2 attached
```

#### Frontend Migration

Frontend components can access V2 data through the enhanced hook:

```typescript
const { data } = useAssessmentEnhancement(profileId);
// Legacy: data?.archetype?.id
// V2: data?.archetype_v2?.composite_code
// V2: data?.archetype_v2?.diversity_angles
```

---

### Known Limitations

1. Strategy Framework Registry has seed data only - full 80 frameworks to be added
2. Gender/Ethnicity detection relies on self-reported data
3. Timeline calculation assumes US academic calendar

---

### Future Iterations

- Populate full 80 coaching frameworks from intelligence document
- ML-enhanced archetype detection based on outcome tracking
- Real-time strategy adjustment based on progress

---

## Previous Versions

### v3.0 - Initial Commit (January 2026)
- Plug-and-play architecture foundation
- Basic Agno agent structure
- Initial API scaffolding
