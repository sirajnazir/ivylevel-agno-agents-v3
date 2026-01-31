# IvyLevel Agno Agents v4.0 - Claude Code Context

**Project:** IvyLevel Multi-Agent College Admissions Platform
**Version:** v4.0 - Fixed Assessment + Narrative
**Last Updated:** January 31, 2026
**Git Repo:** https://github.com/sirajnazir/ivylevel-agno-agents-v3

---

## Quick Start

```bash
# Backend
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

---

## Project Overview

IvyLevel is a multi-agent AI platform for college admissions coaching. The system uses:
- **Agno Framework** for agent orchestration
- **FastAPI** backend with Python agents
- **Next.js** frontend with React
- **Supabase** for database

### Core Philosophy
- **Assessment Agent** = DIAGNOSIS (gather info, score, identify gaps/strengths)
- **GamePlan Agent** = MEDICINE (synthesize strategy, plan activities, sequence timeline)

---

## Current Implementation Status (v4.0)

### COMPLETED

| Component | Status | Key Files |
|-----------|--------|-----------|
| Multi-Dimensional Archetype V2 | ✅ Done | `backend/agents/schemas/archetype_v2.py`, `archetype_engine.py` |
| Gender/Ethnicity/URM Detection | ✅ Done | In archetype_engine.py |
| Diversity Angle Auto-Generation | ✅ Done | In archetype_engine.py |
| Assessment Agent (Base) | ✅ Done | `backend/agents/orchestrators/assessment.py` |
| Ivy+ Score (0-100) | ✅ Done | `backend/tools/scoring/engine.py` |
| 4-Category Scores | ✅ Done | Aptitude, Passion, Community, Narrative |
| SFFA Rubric (1-6) | ✅ Done | Academic, EC, Athletic, Personal, Overall |
| Helping/Holding Factors | ✅ Done | `backend/tools/scoring/factors.py` |
| API Bridge | ✅ Done | `backend/api/routers/agents_bridge.py` |
| Frontend Hooks | ✅ Done | `frontend/src/hooks/useAgentData.ts` |

### NEXT TO IMPLEMENT (Phase 1 - Assessment Enhancements)

| Component | Priority | Spec Reference |
|-----------|----------|----------------|
| Jenny's 5-Dimension Rubric (/50) | P0 | TYPE-085 |
| Gap Priority Analyzer (P0/P1/P2/P3) | P0 | TYPE-086 |
| Hidden Strengths Detection | P1 | TYPE-083 |
| Untapped Opportunities | P1 | TYPE-083 |

### NEXT TO IMPLEMENT (Phase 2 - GamePlan Enhancements)

| Component | Priority | Spec Reference |
|-----------|----------|----------------|
| Target Profile Synthesis | P0 | TYPE-001 |
| Rubric Priority Sequencing | P1 | TYPE-001 |
| Convergence Paths (undecided students) | P2 | TYPE-001 |
| Narrative Coherence Score | P2 | TYPE-001 |

---

## Key Architecture Documents

| Document | Purpose | Location |
|----------|---------|----------|
| Architecture Analysis | Assessment vs GamePlan responsibilities | `docs/ASSESSMENT_GAMEPLAN_ARCHITECTURE.md` |
| Changelog | v4.0 release notes | `docs/CHANGELOG.md` |
| Intelligence Specs | Coaching intelligence types | See section below |

---

## Intelligence Types Specifications

These are the core intelligence algorithms extracted from real coaching sessions (Jenny's W001-W093).

### TYPE-085: Jenny's 5-Dimension Rubric Scoring

**Purpose:** Calculate baseline rubric score across 5 dimensions (0-10 each = /50 total)

**Dimensions:**
| Dimension | Weight | Scoring Formula |
|-----------|--------|-----------------|
| Academics | 1.5 | Base 3 + GPA 3.9+ (+2) + AP 8+ (+2) + SAT 1500+ (+2) |
| Leadership | 1.3 | Base 1 + Founder (+3) + President (+2) + Multi-year (+2) + National (+3) |
| Service | 0.9 | Base 1 + 100+ hours (+3) + Consistent 2yr (+2) + Impact (+2) + Leadership (+1) |
| Artifacts | 1.2 | Base 1 + Published (+3) + Complex (+2) + Multiple (+1/each) + Validation (+2) |
| Recognition | 1.4 | Base 0 + National (+4) + Regional (+2) + Finalist (+2) + Multiple (+1/each) |

**Baseline Example (Huda W001):** 14/50
- Academics: 5/10, Leadership: 2/10 (P0), Service: 2/10, Artifacts: 4/10, Recognition: 1/10 (P0)

### TYPE-086: Gap Priority Analyzer

**Purpose:** Categorize gaps by priority using weighted formula

**Formula:**
```
Priority Score = Gap Size × Dimension Weight × Urgency Multiplier

Urgency Multipliers:
  Senior (12): 1.5
  Junior (11): 1.3
  Sophomore (10): 1.1
  Freshman (9): 1.0

Priority Thresholds:
  P0: score ≥ 8 (Critical - address immediately)
  P1: score ≥ 5 (High - address in 8 weeks)
  P2: score ≥ 2 (Medium - address this semester)
  P3: score < 2 (Low - nice to have)
```

**Gap Closing Actions (per dimension):**
- Academics: GPA tutoring, AP enrollment, test prep
- Leadership: Run for officer, found club, multi-year commitment
- Service: 100+ hours, consistent organization, document impact
- Artifacts: Build project, publish/deploy, get external validation
- Recognition: Apply to NCWIT/Scholastic/ISEF, enter competitions

### TYPE-083: Potential Indicator Extraction

**Purpose:** Detect hidden strengths and untapped opportunities

**Categories:**
1. **Hidden Strengths:** Skills mentioned but not showcased in activities
2. **Untapped Opportunities:** Natural extensions of current work
3. **Latent Potential:** Growth mindset signals (self-taught, founded, initiative)

### TYPE-001: Game Plan Synthesis

**Purpose:** Synthesize target positioning and strategic roadmap

**Identity Fusion Formula:**
```
IDENTITY + APTITUDE + PASSION + SERVICE = NARRATIVE

Identity: "Who you are" (cultural background, lived experience)
Aptitude: "What you're good at" (academic strengths, skills)
Passion: "What energizes you" (deep interests, projects)
Service: "How you help others" (teaching, mentoring, impact)

Example: "Film × CS → Digital Storyteller"
```

**Outputs:**
- Target Profile (identity fusion, unique positioning, strategic target)
- Rubric Priority Sequencing (quarter-mapped gaps)
- Convergence Paths (for undecided students)
- Narrative Coherence Score (activity-identity alignment)

---

## Key Data Models

### Assessment Agent Output (Current + Proposed)

```python
class AssessmentOutput(BaseModel):
    # === EXISTING ===
    ivy_plus_score: float  # 0-100
    category_scores: Dict[str, float]  # Aptitude, Passion, Community, Narrative
    sffa_rubric: Dict[str, int]  # 1-6 scale
    archetype: ArchetypeOutput  # V2 Multi-Dimensional
    helping_factors: List[FactorOutput]
    holding_back_factors: List[FactorOutput]
    narrative_identity: NarrativeIdentity
    completeness_score: float

    # === TO ADD (Phase 1) ===
    rubric_5d: Rubric5DimensionOutput  # Jenny's /50 scoring
    gap_analysis: GapAnalysisOutput  # P0/P1/P2/P3 gaps
    potential_indicators: PotentialIndicatorOutput  # Hidden strengths
```

### V2 Archetype (Implemented)

```python
class MultiDimensionalArchetype(BaseModel):
    # 6 Dimensions
    domain: DomainProfile  # WHAT they do (18 types)
    context: ContextProfile  # WHERE/WHO (gender, ethnicity, URM, first-gen)
    execution: ExecutionProfile  # HOW they operate (Type A, ADHD, etc.)
    challenges: ChallengeProfile  # OBSTACLES
    timeline: TimelineProfile  # WHEN (early/mid/late HS)
    strengths_weaknesses: StrengthsWeaknessesProfile

    # Synthesis
    composite_code: str  # e.g., "STEM-RESEARCHER.TYPE-A.MID-HS.HIGH-RESOURCE"
    primary_strategy_family: str  # Maps to coaching strategy
```

---

## File Structure (Key Files)

```
backend/
├── agents/
│   ├── orchestrators/
│   │   ├── assessment.py       # Assessment Agent (Tier 1)
│   │   ├── gameplan.py         # GamePlan Agent (Tier 1)
│   │   └── execution.py        # Execution Agent
│   ├── specialists/
│   │   ├── narrative.py        # Narrative synthesis
│   │   ├── awards.py           # Awards matching
│   │   ├── programs.py         # Programs matching
│   │   ├── ec.py               # EC recommendations
│   │   └── opportunity.py      # Opportunity scouting
│   └── schemas/
│       ├── archetype_v2.py     # V2 archetype types (711 lines)
│       ├── archetype_engine.py # Archetype synthesis (976 lines)
│       └── __init__.py         # Schema exports
├── tools/
│   └── scoring/
│       ├── engine.py           # Ivy+ score calculation
│       ├── archetypes.py       # Archetype detection wrapper
│       ├── factors.py          # Helping/Holding factors
│       └── constants.py        # Weights and thresholds
├── api/
│   └── routers/
│       └── agents_bridge.py    # API endpoints (596 lines)
└── main.py                     # FastAPI app

frontend/
├── src/
│   ├── hooks/
│   │   └── useAgentData.ts     # React Query hooks
│   └── components/
│       └── dashboard/
│           └── MultiAgentTab.tsx  # Multi-agent UI
└── package.json

docs/
├── CHANGELOG.md                # v4.0 release notes
└── ASSESSMENT_GAMEPLAN_ARCHITECTURE.md  # Architecture analysis
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/agents/assessment/score` | POST | Full assessment with V2 archetype |
| `/agents/narrative/synthesize` | POST | Narrative synthesis with V2 data |
| `/agents/gameplan/generate` | POST | Master game plan generation |
| `/agents/awards/match` | POST | Award matching |
| `/agents/programs/match` | POST | Program matching |
| `/agents/execution/debt-score` | POST | Execution Debt Score |

---

## Implementation Roadmap

### Phase 1: Assessment Enhancements (Priority)

1. **Add Jenny's 5-Dimension Rubric (TYPE-085)**
   - Create `backend/tools/scoring/rubric_5d.py`
   - Implement scoring for: Academics, Leadership, Service, Artifacts, Recognition
   - Add `/50` baseline tracking
   - Test with Huda profile (should be ~14/50)

2. **Add Gap Priority Analyzer (TYPE-086)**
   - Create `backend/tools/scoring/gap_analyzer.py`
   - Implement priority calculation: `Gap × Weight × Urgency`
   - Categorize into P0/P1/P2/P3
   - Generate closing actions per gap

3. **Add Potential Indicator Extraction (TYPE-083)**
   - Create `backend/tools/scoring/potential_detector.py`
   - Detect hidden strengths (skills mentioned, not applied)
   - Identify untapped opportunities
   - Surface latent potential signals

### Phase 2: GamePlan Enhancements

1. **Add Target Profile Synthesis (TYPE-001)**
   - Identity fusion formula
   - Strategic target (hidden dream school)
   - Unique positioning

2. **Add Rubric Priority Sequencing**
   - Map P0 gaps → Q1-Q2
   - Map P1 gaps → Q2-Q3
   - Map P2 gaps → Q3-Q4

3. **Add Convergence Paths**
   - For undecided students
   - Parallel paths + ratios

---

## Testing

```bash
# Run backend tests
cd backend
pytest evals/

# Specific test files
pytest evals/test_huda.py      # Huda profile tests
pytest evals/test_jenny.py     # Jenny coaching tests
```

---

## Previous Project Reference

If you need to reference the old project structure:
- **Old Project:** `~/ivyquest-claude-v2.2/`
- **Old CLAUDE.md:** Contains branding guidelines, coding standards

Key things to bring from old project:
- Brand constants (`BRAND_COLORS` - orange/maroon theme)
- Coding standards (no band-aid fixes, universal solutions)
- Documentation management (update in place, don't duplicate)

---

## Current Session Summary (January 31, 2026)

### What Was Done This Session

1. **Analyzed Intelligence Types** from coaching database
   - TYPE-001: Game Plan Synthesis
   - TYPE-081: IvyScore Calculation
   - TYPE-082: Gap Analysis Engine
   - TYPE-083: Strength Recognition
   - TYPE-085: Rubric Scoring Engine (Jenny's 5-dim)
   - TYPE-086: Gap Priority Analyzer

2. **Compared with Current Implementation**
   - Found Assessment is missing: 5-dim rubric, gap priority, hidden strengths
   - Found GamePlan is missing: target profile, convergence paths, narrative coherence

3. **Created Architecture Document**
   - `docs/ASSESSMENT_GAMEPLAN_ARCHITECTURE.md`
   - Details what belongs in Assessment vs GamePlan
   - Proposes enhanced output schemas
   - Provides implementation roadmap

4. **Committed v4.0**
   - 357 files, 104,577 insertions
   - Multi-dimensional archetype V2
   - Gender/ethnicity/URM detection
   - Full-stack integration

### Next Steps

1. **Implement TYPE-085** (5-dimension rubric) - highest priority
2. **Implement TYPE-086** (gap priority analyzer)
3. **Test with Huda profile** - baseline should be ~14/50
4. **Proceed to GamePlan enhancements**

---

## Important Notes

- Always use `source .venv/bin/activate` before running Python
- Frontend is in `frontend/` subdirectory
- Supabase migrations are in `supabase/migrations/`
- Don't commit `.env` files

## Git Commands

```bash
git status
git add <files>
git commit -m "message"
git push origin main
```
