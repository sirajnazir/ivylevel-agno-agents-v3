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
- **Execution Agent** = TREATMENT (weekly sessions, campaign management, content development)

### Tools Architecture (Three Layers)

| Layer | Purpose | When Used | Key Modules |
|-------|---------|-----------|-------------|
| **Scoring** | Deterministic calculations, pattern matching | Assessment & GamePlan phases | `rubric_5d`, `gap_analyzer`, `ec_portfolio`, `award_tiers` |
| **Synthesis** | Strategic analysis, positioning | GamePlan phase | `target_profile` |
| **Execution** | Campaign tracking, content management | Weekly sessions | `award_campaigns`, `content_matrix` |

**Key Insight:** Scoring primitives are used ONCE during initial assessment. Execution tools are used WEEKLY throughout the student journey.

### CRITICAL: Non-Rigid Intelligence Architecture

**Core Principle:** Intelligence types (TYPE-085, TYPE-086, etc.) are REFERENCE LAYERS for LLM reasoning, NOT rigid requirements.

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYERS                          │
│  (Reference Points for LLM - NOT Rigid Requirements)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Scoring Primitives ──┐                                        │
│   (5D Rubric, Gaps,   ├──► LLM Reflects & Applies Contextually │
│    Potential, etc.)  ──┘                                        │
│                                                                 │
│   Design Rules:                                                 │
│   ✅ Calculate what's possible with available data              │
│   ✅ Return partial results (never fail on missing data)        │
│   ✅ Include confidence/completeness indicators                 │
│   ✅ LLM decides when/how to apply each intelligence            │
│   ❌ NEVER fail due to missing data requirements                │
│   ❌ NEVER enforce rigid rules regardless of context            │
│                                                                 │
│                          ▼                                      │
│   ┌───────────────────────────────────────────────────────┐    │
│   │  Persist to agent_outputs JSONB (cross-agent access)  │    │
│   │  Available across all agents for student journey      │    │
│   └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Data Persistence:**
- Assessment outputs saved to `profiles.agent_outputs.assessment`
- Enables cross-agent intelligence sharing
- Schema is additive (JSONB namespaces per agent)

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
| Jenny's 5D Rubric (TYPE-085) | ✅ Done | `backend/tools/scoring/rubric_5d.py` |
| Gap Priority Analyzer (TYPE-086) | ✅ Done | `backend/tools/scoring/gap_analyzer.py` |
| Potential Detector (TYPE-083) | ✅ Done | `backend/tools/scoring/potential_detector.py` |
| Target Profile Synthesis (TYPE-001) | ✅ Done | `backend/tools/synthesis/target_profile.py` |

### NEXT TO IMPLEMENT (Phase 1 - Assessment Enhancements)

| Component | Priority | Spec Reference | Status |
|-----------|----------|----------------|--------|
| Jenny's 5-Dimension Rubric (/50) | P0 | TYPE-085 | ✅ Done |
| Gap Priority Analyzer (P0/P1/P2/P3) | P0 | TYPE-086 | ✅ Done |
| Hidden Strengths Detection | P1 | TYPE-083 | ✅ Done |
| Untapped Opportunities | P1 | TYPE-083 | ✅ Done |

### NEXT TO IMPLEMENT (Phase 2 - GamePlan Enhancements)

| Component | Priority | Spec Reference | Status |
|-----------|----------|----------------|--------|
| Target Profile Synthesis | P0 | TYPE-001 | ✅ Done |
| Rubric Priority Sequencing | P1 | TYPE-001 | ✅ Done |
| Convergence Paths (undecided students) | P2 | TYPE-001 | ✅ Done |
| Narrative Coherence Score | P2 | TYPE-001 | ✅ Done |

### COMPLETED (Phase 3 - EC Agent Enhancements)

| Component | Priority | Spec Reference | Status |
|-----------|----------|----------------|--------|
| EC Portfolio Scoring (Tier/Role/Evidence) | P0 | TYPE-013, TYPE-015, TYPE-019 | ✅ Done |
| Cookie-Cutter Detection | P0 | TYPE-014 | ✅ Done |
| Authenticity Testing | P1 | TYPE-014 | ✅ Done |
| Grade-Aware Strategy | P0 | New | ✅ Done |
| Timeline & Urgency | P1 | New | ✅ Done |

### COMPLETED (Phase 4 - Awards Agent Enhancements)

| Component | Priority | Spec Reference | Status |
|-----------|----------|----------------|--------|
| Award Tier Classification (T1-T4) | P0 | TYPE-024 | ✅ Done |
| 70/20/10 Portfolio Rule | P0 | TYPE-026 | ✅ Done |
| Award Campaign Orchestration | P1 | TYPE-022 | ✅ Done (execution layer) |
| Content Recycling Matrix | P2 | TYPE-025 | ✅ Done (execution layer) |

### COMPLETED (Phase 5 - Programs Agent Enhancements)

| Component | Priority | Spec Reference | Status |
|-----------|----------|----------------|--------|
| Program Selection Matrix (4D Scoring) | P0 | TYPE-028 | ✅ Done |
| Program Application Strategy | P0 | TYPE-029 | ✅ Done |
| Cost-Benefit Intelligence (ROI) | P0 | TYPE-030 | ✅ Done |
| Program-Competition Cascade | P1 | TYPE-031 | ✅ Done (execution layer) |

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

### TYPE-013: EC Portfolio Optimization

**Purpose:** Strategic 10-slot portfolio analysis with tier classification

**Tier Classification (AO Mental Model):**
| Tier | Description | Examples |
|------|-------------|----------|
| T1 | National/International | USAMO, Intel ISEF, Published Research |
| T2 | Regional/State | State champion, Regional finalist |
| T3 | School-level Leadership | President, Founder (school scope) |
| T4 | Participation | Member, volunteer |

**Portfolio Role Strategy:**
```
10 Common App Slots:
├── Flagship (2-3): T1/T2 activities anchoring narrative
├── Supporting (3-4): T2/T3 reinforcing theme
├── Validation (2-3): Awards, publications proving depth
└── Service (2): Community commitment
```

### TYPE-014: Narrative Synthesis & Cookie-Cutter Detection

**Purpose:** Detect generic profiles and test authenticity

**Cookie-Cutter Patterns:**
- Resume Padder: 5+ activities at member level, no leadership
- NHS + Key Club + Sports: Default high-achiever starter pack
- Model UN + Debate Only: Speech activities without real-world application
- All Participation, No Leadership: Member of everything, leader of nothing

**Authenticity Tests:**
1. **Passion Test:** Would you do this without college app benefit?
2. **Why You Test:** Why are YOU specifically doing this?
3. **Sacrifice Test:** What have you given up to pursue this?

### TYPE-015: Impact Engineering (Evidence Ladder)

**Purpose:** Track and upgrade evidence levels for impact claims

| Level | Evidence Type | Example |
|-------|--------------|---------|
| M0 | Built | "I created a website" |
| M1 | Used | "50 people use my app" |
| M2 | Measured | "Users report 30% time savings" |
| M3 | Dollars | "Generated $5K in revenue" |
| M4 | Media | "Featured in local news" |

### TYPE-019: Formalization Ladder

**Purpose:** 7-step legitimacy stack for initiatives

| Step | Name | Examples |
|------|------|----------|
| 1 | Idea | Concept only |
| 2 | Structure | Curriculum, schedule, plan |
| 3 | Legitimacy | Registered org, official status |
| 4 | Team | Recruited team members |
| 5 | Scale | Expanded beyond original scope |
| 6 | External Validation | Grant, award, media coverage |
| 7 | Succession | Trained replacement, sustainable |

### Grade-Aware EC Strategy

**Purpose:** Different strategies based on grade level

| Grade | Phase | Focus |
|-------|-------|-------|
| 9th | EXPLORATION | Try activities, discover interests |
| 10th | COMMITMENT | Double down on 2-3, seek leadership |
| 11th | IMPACT | Maximize evidence, formalize, awards |
| 12th | POLISH | Document, refine descriptions, apply |

### TYPE-024: Award Tier Classification

**Purpose:** Ivy AO-calibrated award classification system

| Tier | Selectivity | Ivy Impact | Examples |
|------|-------------|------------|----------|
| T1 | <500 winners nationally | +15-40% boost | NCWIT Winner, Regeneron STS, Presidential Scholar |
| T2 | 500-2K winners | +5-15% boost | State Science Fair, AIME Qualifier, Congressional App |
| T3 | 2K-10K winners | Expected baseline | School Honor Society, Local Awards |
| T4 | >50% recipients | No impact | AP Scholar, Honor Roll, NHS Member |

**Critical Insight:** 10 T3/T4 awards < 1 T1 award in AO perception

**Portfolio Strength Assessment:**
- `ivy_competitive`: 1+ T1 OR 3+ T2
- `ivy_possible`: 0 T1, 4+ T2
- `ivy_unlikely`: 0 T1, 2-3 T2
- `weak`: 0 T1, 0-1 T2

### TYPE-026: 70/20/10 Portfolio Rule

**Purpose:** Risk-balanced award portfolio for sustained motivation

| Bucket | Allocation | Win Rate | Purpose |
|--------|-----------|----------|---------|
| High-Probability | 70% | 40-70% | Confidence builders, early momentum |
| Medium-Reach | 20% | 10-30% | Legitimate T1/T2 credentials |
| Long-Shot | 10% | 0-5% | Transformative upside plays |

**Expected Outcome:** 10 applications → 4-5 wins
```
(7 × 0.55) + (2 × 0.20) + (1 × 0.025) = 4.3 wins
```

**Motivation State Adjustments:**
- **Crisis** (<2 wins by month 3): 100/0/0 (confidence only)
- **High Achiever** (5+ wins): 60/25/15 (more risk tolerance)
- **Limited Time** (<15h): 85/15/0 (skip long-shots)

### TYPE-022: Award Campaign Orchestration ✅

**Purpose:** Multi-month campaign planning for T1/T2 awards

**File:** `backend/tools/execution/award_campaigns.py`

**Campaign Lifecycle:**
| Phase | Duration | Activities |
|-------|----------|------------|
| Discovery | 5% | Research requirements, verify eligibility |
| Preparation | 50% | Build underlying work, create artifacts |
| Drafting | 20% | Write application essays |
| Refinement | 15% | Get feedback, polish |
| Submission | 5% | Final review, submit |

**Campaign Duration by Tier:**
- T1 National: 36 weeks (9 months)
- T2 Regional: 20 weeks (5 months)
- T3 Local: 8 weeks (2 months)
- T4 Participation: 2 weeks

**Key Functions:**
- `create_campaign_plan()`: Generate full multi-month plan
- `create_campaign_dashboard()`: Dashboard view of all campaigns
- `get_weekly_focus()`: This week's prioritized actions
- `update_campaign_progress()`: Track milestone completion

### TYPE-025: Content Recycling Matrix ✅

**Purpose:** Maximize essay ROI by recycling core narratives

**File:** `backend/tools/execution/content_matrix.py`

**Core Content Types:**
| Type | Reusability | Adaptation Effort |
|------|-------------|-------------------|
| Personal Narrative | High | Direct reuse |
| Activity Description | High | Direct reuse |
| Impact Story | High | Moderate adaptation |
| Why Interest | Medium | Moderate adaptation |
| Challenge Overcome | High | Direct reuse |
| Unique Perspective | High | Direct reuse |

**Adaptation Levels:**
- `direct_reuse`: Copy-paste with minor edits
- `moderate_adaptation`: 30-50% rewrite
- `significant_adaptation`: 50-70% rewrite
- `custom_write`: 90%+ new content needed

**Key Functions:**
- `generate_content_matrix()`: Create full content plan
- `recommend_core_contents()`: Suggest 4-6 core narratives
- `map_content_to_touchpoint()`: Link content to applications
- `get_content_priorities()`: This week's content tasks

### TYPE-028: Program Selection Matrix (4D Scoring) ✅

**Purpose:** Multi-dimensional program scoring with tier classification and scam detection

**File:** `backend/tools/scoring/program_selection.py`

**4-Dimension Scoring Formula:**
```
Total Score = Alignment(×4) + Selectivity_Fit(×3) + Impact(×3) + Feasibility(×2)
Max Score: 120 points

Dimensions:
├── Alignment (0-10, weight 4): How well program matches student's focus
│   - Domain match + Archetype fit + Interest alignment
├── Selectivity Fit (0-10, weight 3): Is student competitive?
│   - Student competitiveness vs program selectivity
├── Impact (0-10, weight 3): Value for college apps
│   - Tier impact + Duration bonus + Deliverable value
└── Feasibility (0-10, weight 2): Can student actually do this?
    - Location, cost, schedule compatibility
```

**Program Tiers:**
| Tier | Selectivity | Ivy Impact | Examples |
|------|-------------|------------|----------|
| T1 Elite | <5% admit | +15-25% | RSI, TASP, MOSTEC, SSP |
| T2 Selective | 5-20% admit | +8-15% | YYGS, Garcia, Governor's Schools |
| T3 Competitive | 20-50% admit | +3-8% | Pre-college programs |
| T4 Pay-to-Play | >50% or $$$ | 0-3% | Commercial summer camps |

**Scam Detection Patterns:**
- `HIGH`: High cost (>$5K) + Low selectivity (>50%) + No tangible outcomes
- `MEDIUM`: Moderate cost + No clear college impact
- `LOW`: Established institution or selective
- `NONE`: Free or highly selective

**Key Functions:**
- `analyze_program_selection()`: Full 4D scoring for program list
- `score_program()`: Individual program scoring
- `classify_program_tier()`: Determine T1-T4 tier
- `calculate_student_competitiveness()`: Match student to program selectivity

### TYPE-029: Program Application Strategy ✅

**Purpose:** Timeline optimization with portfolio balancing and deadline clustering

**File:** `backend/tools/scoring/program_strategy.py`

**Portfolio Balance (Reach/Match/Safety):**
```
Optimal Allocation:
├── Reach (30%): 2-3 programs, score 80+ required
├── Match (45%): 3-4 programs, score 60-80
└── Safety (25%): 1-2 programs, score <60

Total: 6-9 programs (avoid over-application burnout)
```

**Deadline Batching Strategy:**
```
Batch 1 (Priority): Deadlines within 4 weeks → 12+ hrs/week
Batch 2 (Standard): Deadlines in 4-8 weeks → 8-10 hrs/week
Batch 3 (Future): Deadlines in 8-12 weeks → 4-6 hrs/week
Batch 4 (Upcoming): Deadlines 12+ weeks → 2-4 hrs/week (research only)
```

**Essay Reuse Matrix:**
| Source Program | Target Programs | Adaptation Level |
|----------------|-----------------|------------------|
| RSI | MIT PRIMES, MOSTEC | Direct (80%+) |
| SSP | Garcia, HCSSiM | Moderate (50-80%) |
| Pre-college | Similar pre-college | Direct (80%+) |

**Key Functions:**
- `generate_application_strategy()`: Full strategy with batching
- `create_deadline_batches()`: Cluster by deadline urgency
- `analyze_portfolio_balance()`: Check reach/match/safety ratio
- `identify_essay_reuse()`: Find essay recycling opportunities

### TYPE-030: Cost-Benefit Intelligence (ROI) ✅

**Purpose:** ROI-driven program evaluation with alternative suggestions

**File:** `backend/tools/scoring/program_roi.py`

**ROI Calculation Formula:**
```
ROI Score = (College_Impact × 5) - (Financial_Cost × 2) - (Time_Cost × 1) + (Learning_Value × 3)

Where:
├── College_Impact (0-10): Tier impact + Deliverable value
├── Financial_Cost (0-10): Normalized cost (0=free, 10=$10K+)
├── Time_Cost (0-10): Weeks of commitment
└── Learning_Value (0-10): Skills, network, experience
```

**ROI Categories:**
| Category | ROI Score | Recommendation |
|----------|-----------|----------------|
| Excellent | >50 | Strongly apply |
| Good | 20-50 | Apply if fits |
| Neutral | 0-20 | Consider alternatives |
| Poor | -20-0 | Skip unless specific reason |
| Avoid | <-20 | Do not apply |

**Value Proposition Types:**
- `FREE_ELITE`: RSI, MOSTEC (best ROI possible)
- `PAID_ELITE`: SSP ($8K but T1 impact)
- `FREE_NONSELECTIVE`: Local programs (low cost, low impact)
- `EXPENSIVE_NONSELECTIVE`: Commercial camps (avoid)
- `EXPENSIVE_SELECTIVE`: YYGS (high cost, but validated impact)

**Cost Breakdown Components:**
- Tuition/fees
- Travel (flight + ground)
- Housing (if not included)
- Materials/equipment
- Opportunity cost (what else could be done)

**Key Functions:**
- `analyze_programs_roi()`: Comparative ROI for multiple programs
- `calculate_cost_breakdown()`: Detailed cost analysis
- `calculate_benefit_breakdown()`: Value components
- `get_roi_summary()`: Quick decision support

### TYPE-031: Program-Competition Cascade ✅

**Purpose:** Maximize artifact ROI by mapping one project to multiple opportunities

**File:** `backend/tools/execution/program_cascade.py`

**Core Concept:** One research project or CS artifact → 5-10 submissions

**Artifact Types & Cascade Patterns:**
| Artifact Type | Cascade Opportunities |
|---------------|----------------------|
| Research Project | RSI, Regeneron STS, ISEF, State Fairs, Siemens, Davidson |
| CS Project | Congressional App, Technovation, NCWIT, HackMIT, NASA App |
| Written Work | Scholastic, Concord Review, YoungArts, Atlantic Writing |
| Math Achievement | MATHCOUNTS, AMC/AIME, USAMTS, State Math League |
| Science Olympiad | Regional → State → Nationals pathway |

**Cascade Multiplier Effect:**
```
1 Research Project (200 hours) → 8 competitions = 25 hours/submission
1 CS App (100 hours) → 5 competitions = 20 hours/submission

Without cascade: 200 hours = 1 submission
With cascade: 200 hours = 8 submissions (8X multiplier)
```

**Adaptation Effort Levels:**
| Adaptation | Effort | Examples |
|------------|--------|----------|
| Minimal | 2-4 hrs | Regeneron → ISEF (same project) |
| Moderate | 8-16 hrs | Research → Poster → Paper adaptation |
| Significant | 20-40 hrs | App → Pitch deck for Technovation |

**Quick Win Identification:**
```
Quick Win = High ROI + Near Deadline + Minimal Adaptation

Example: Research paper done in October
├── State Science Fair (Nov deadline) → Minimal adaptation
├── Regional Competition (Dec deadline) → Minimal adaptation
└── Regeneron STS (Nov deadline) → Moderate adaptation (narrative)
```

**Key Functions:**
- `analyze_cascade_opportunities()`: Full cascade analysis
- `detect_anchor_artifacts()`: Find high-value base artifacts
- `map_artifact_to_opportunities()`: Generate cascade map
- `generate_cascade_strategy()`: Prioritized submission plan

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
│   ├── scoring/
│   │   ├── engine.py           # Ivy+ score calculation
│   │   ├── archetypes.py       # Archetype detection wrapper
│   │   ├── factors.py          # Helping/Holding factors
│   │   ├── constants.py        # Weights and thresholds
│   │   ├── rubric_5d.py        # Jenny's 5D Rubric (TYPE-085)
│   │   ├── gap_analyzer.py     # Gap Priority Analyzer (TYPE-086)
│   │   ├── potential_detector.py # Potential Indicator Extraction (TYPE-083)
│   │   ├── ec_portfolio.py     # EC Portfolio Scoring (TYPE-013, TYPE-015, TYPE-019)
│   │   ├── differentiation.py  # Cookie-Cutter & Authenticity (TYPE-014)
│   │   ├── ec_timeline.py      # Grade-Aware Strategy & Timeline
│   │   ├── award_tiers.py      # Award Tier Classification (TYPE-024)
│   │   ├── award_portfolio.py  # 70/20/10 Portfolio Rule (TYPE-026)
│   │   ├── program_selection.py # Program Selection Matrix (TYPE-028)
│   │   ├── program_strategy.py  # Program Application Strategy (TYPE-029)
│   │   └── program_roi.py       # Cost-Benefit Intelligence (TYPE-030)
│   ├── synthesis/
│   │   └── target_profile.py   # Target Profile Synthesis (TYPE-001)
│   └── execution/
│       ├── award_campaigns.py  # Campaign Orchestration (TYPE-022)
│       ├── content_matrix.py   # Content Recycling (TYPE-025)
│       └── program_cascade.py  # Program-Competition Cascade (TYPE-031)
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

1. **Implemented Assessment Scoring Primitives**
   - TYPE-085: Jenny's 5D Rubric (`rubric_5d.py`)
   - TYPE-086: Gap Priority Analyzer (`gap_analyzer.py`)
   - TYPE-083: Potential Indicator Detection (`potential_detector.py`)

2. **Implemented Synthesis Layer**
   - TYPE-001: Target Profile Synthesis (`target_profile.py`)
   - Identity Fusion, Unique Positioning, Strategic Targets
   - Convergence Paths for undecided students
   - Narrative Coherence scoring

3. **Implemented EC Agent Scoring Primitives**
   - TYPE-013: EC Portfolio Optimization (`ec_portfolio.py`)
     - Tier classification (T1-T4)
     - Portfolio role assignment (Flagship, Supporting, Validation, Service)
   - TYPE-014: Differentiation Analysis (`differentiation.py`)
     - Cookie-cutter pattern detection
     - Authenticity testing (Passion, Why You, Sacrifice)
     - Web coherence scoring
   - TYPE-015: Evidence Ladder (M0-M4) in `ec_portfolio.py`
   - TYPE-019: Formalization Ladder (7-step) in `ec_portfolio.py`
   - Grade-Aware Strategy (`ec_timeline.py`)
     - Phase-based strategies (Exploration → Commitment → Impact → Polish)
     - Time budget analysis
     - Urgency calculation
     - Quarterly planning

4. **Implemented Awards Agent Scoring Primitives**
   - TYPE-024: Award Tier Classification (`award_tiers.py`)
     - T1/T2/T3/T4 tier system with Ivy impact percentages
     - Portfolio strength assessment (ivy_competitive, ivy_possible, etc.)
   - TYPE-026: 70/20/10 Portfolio Rule (`award_portfolio.py`)
     - Risk bucket classification (high-probability, medium-reach, long-shot)
     - Motivation state tracking (normal, crisis, high-achiever)
     - Expected wins calculation
     - Compliance checking

5. **Implemented Execution Layer** (Weekly Campaign Management)
   - TYPE-022: Award Campaign Orchestration (`award_campaigns.py`)
     - Multi-month campaign lifecycle (Discovery → Preparation → Drafting → Refinement → Submission)
     - Campaign dashboard for tracking all active campaigns
     - Weekly focus actions with priority
     - Milestone and progress tracking
   - TYPE-025: Content Recycling Matrix (`content_matrix.py`)
     - Core content identification (4-6 narratives per student)
     - Touchpoint mapping (awards, programs, colleges)
     - Adaptation level analysis (direct reuse vs custom write)
     - Time savings calculation through content reuse

6. **Archived Old Files**
   - Moved `ec_v71.py` to `archive/` (ec.py is the latest)

7. **Implemented Programs Agent Scoring Primitives**
   - TYPE-028: Program Selection Matrix (`program_selection.py`)
     - 4-dimension scoring: Alignment(×4) + Selectivity_Fit(×3) + Impact(×3) + Feasibility(×2)
     - Program tier classification (T1 Elite → T4 Pay-to-Play)
     - Scam detection patterns (high cost + low selectivity = red flag)
   - TYPE-029: Program Application Strategy (`program_strategy.py`)
     - Reach/Match/Safety portfolio balancing (30/45/25 ratio)
     - Deadline batching for workload management
     - Essay reuse opportunity identification
   - TYPE-030: Cost-Benefit Intelligence (`program_roi.py`)
     - ROI formula: (College_Impact × 5) - (Financial_Cost × 2) - (Time_Cost × 1) + (Learning_Value × 3)
     - Value proposition classification (FREE_ELITE, EXPENSIVE_NONSELECTIVE, etc.)
     - Alternative program suggestions
   - TYPE-031: Program-Competition Cascade (`program_cascade.py`)
     - Artifact detection from activities/projects
     - Cascade mapping (1 project → 5-10 submissions)
     - Quick win identification (high ROI + near deadline)

### All Scoring/Execution Primitives Implemented

| Layer | Module | Types | Purpose |
|-------|--------|-------|---------|
| Scoring | `rubric_5d.py` | TYPE-085 | 5-dimension rubric scoring (/50) |
| Scoring | `gap_analyzer.py` | TYPE-086 | Gap priority analysis (P0-P3) |
| Scoring | `potential_detector.py` | TYPE-083 | Hidden strengths & opportunities |
| Scoring | `ec_portfolio.py` | TYPE-013, 015, 019 | Tier, evidence, formalization |
| Scoring | `differentiation.py` | TYPE-014 | Cookie-cutter & authenticity |
| Scoring | `ec_timeline.py` | Grade-aware | Timeline & urgency planning |
| Scoring | `award_tiers.py` | TYPE-024 | Award tier classification (T1-T4) |
| Scoring | `award_portfolio.py` | TYPE-026 | 70/20/10 risk-balanced portfolio |
| Scoring | `program_selection.py` | TYPE-028 | 4D program scoring & scam detection |
| Scoring | `program_strategy.py` | TYPE-029 | Application timeline & portfolio balance |
| Scoring | `program_roi.py` | TYPE-030 | Cost-benefit & ROI analysis |
| Synthesis | `target_profile.py` | TYPE-001 | Identity fusion & positioning |
| Execution | `award_campaigns.py` | TYPE-022 | Multi-month campaign orchestration |
| Execution | `content_matrix.py` | TYPE-025 | Content recycling & reuse |
| Execution | `program_cascade.py` | TYPE-031 | Artifact cascade to multiple programs |

### Next Steps

1. **Integrate scoring primitives into specialist agents** (ECAgent, AwardsAgent, ProgramsAgent)
2. **Integrate execution primitives into ExecutionAgent** for weekly sessions
3. **Add API endpoints for new scoring/execution outputs**
4. **Test full pipeline with sample profiles**
5. **Consider renaming OpportunityAgent** to "Scouting Agent" for clarity (it builds databases, not recommendations)

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
