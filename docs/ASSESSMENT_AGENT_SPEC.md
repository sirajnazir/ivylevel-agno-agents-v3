# Assessment Agent Specification v4.0

**Module:** `backend/agents/orchestrators/assessment.py`
**Role:** First-Tier Orchestrator (DIAGNOSIS)
**Last Updated:** January 31, 2026
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Data Flow](#3-data-flow)
4. [API Endpoints](#4-api-endpoints)
5. [Request/Response Schemas](#5-requestresponse-schemas)
6. [Scoring Primitives](#6-scoring-primitives)
7. [Archetype System (V2)](#7-archetype-system-v2)
8. [Database Schema](#8-database-schema)
9. [Frontend Integration](#9-frontend-integration)
10. [Multi-Agent Collaboration](#10-multi-agent-collaboration)
11. [Error Handling](#11-error-handling)
12. [File Locations](#12-file-locations)
13. [Formula Reference](#13-formula-reference)

---

## 1. Overview

### Purpose

The Assessment Agent is the **entry point** to the IvyLevel coaching pipeline. It performs comprehensive **diagnostic scoring** on student profiles, producing intelligence that all downstream agents (GamePlan, EC, Awards, Programs) depend on.

### Core Philosophy

```
Assessment Agent = DIAGNOSIS
- Gather comprehensive information
- Score across multiple dimensions
- Identify gaps and strengths
- Provide foundation for strategic planning
```

### Key Outputs

| Output | Description | Used By |
|--------|-------------|---------|
| `ivy_plus_score` | 0-100 competitive readiness score | All agents, UI hero display |
| `rubric_5d` | Jenny's 5-dimension rubric (/50) | GamePlan for priority sequencing |
| `gap_analysis` | P0-P3 prioritized gaps | GamePlan for quarterly planning |
| `potential_indicators` | Hidden strengths & opportunities | Narrative for essay hooks |
| `archetype` | V2 multi-dimensional profile | EC/Awards for targeting |

---

## 2. Architecture

### System Position

```
┌─────────────────────────────────────────────────────────────────┐
│                    IVYLEVEL AGENT ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ ASSESSMENT AGENT │ ◄─── TIER 1: First-to-Run                 │
│  │   (Diagnosis)    │                                           │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │ assessment output (persisted to DB)                  │
│           ▼                                                      │
│  ┌─────────────────┐      ┌─────────────────┐                   │
│  │  GAMEPLAN AGENT │◄────►│  NARRATIVE AGENT │                  │
│  │   (Medicine)    │      │   (Synthesis)    │                  │
│  └────────┬────────┘      └─────────────────┘                   │
│           │                                                      │
│           │ game plan (synthesized strategy)                     │
│           ▼                                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │           SPECIALIST AGENTS              │                    │
│  │  EC Agent │ Awards Agent │ Programs Agent │                   │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│                          ▼                                       │
│  ┌─────────────────┐                                            │
│  │ EXECUTION AGENT │ ◄─── TIER 3: Weekly Sessions               │
│  │   (Treatment)   │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Dependencies

```
AssessmentAgent
├── IvyScoreEngine              # Core probability scoring
├── ConcreteArchetypeSynthesizer # V2 multi-dimensional archetype
├── FactorAnalyzer              # Helping/Holding factors
├── calculate_5d_rubric()       # TYPE-085: Jenny's rubric
├── analyze_gaps()              # TYPE-086: Gap prioritization
├── detect_potential()          # TYPE-083: Hidden potential
└── NarrativeAgent              # LLM-based identity synthesis
```

---

## 3. Data Flow

### Request Path (Frontend → Backend → Database)

```
┌─────────────────┐
│    Frontend     │
│   (Next.js)     │
└────────┬────────┘
         │
         │ useFullAssessment(profileId)
         │
         ▼
┌─────────────────┐
│   agnoApi.ts    │
│ getFullAssessment()
└────────┬────────┘
         │
         │ POST /agents/assessment/score
         │ { student_id: "..." }
         │
         ▼
┌─────────────────┐
│  agents_bridge  │
│    .py          │
└────────┬────────┘
         │
         │ load_ivy_agent("orch_assessment", profile)
         │
         ▼
┌─────────────────┐
│ AssessmentAgent │
│    .assess()    │
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌─────────────────┐
│  DETERMINISTIC  │                  │  LLM SYNTHESIS  │
│    SCORING      │                  │   (Narrative)   │
├─────────────────┤                  └────────┬────────┘
│ IvyScoreEngine  │                           │
│ rubric_5d       │                           │
│ gap_analyzer    │                           │
│ potential_det   │                           │
│ archetype_v2    │                           │
│ factors         │                           │
└────────┬────────┘                           │
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        │ AssessmentOutput
                        ▼
              ┌─────────────────┐
              │    Supabase     │
              │ profiles.agent_ │
              │ outputs.assessment
              └─────────────────┘
```

### Backend Processing Steps

```python
# Step 1: Load profile if not provided
if not profile:
    profile = get_profile_context(student_id)

# Step 2: DETERMINISTIC SCORING (No LLM for math)
ivy_score = IvyScoreEngine.calculate(profile)
archetype = detect_archetype(profile, category_dict)
factors = get_complete_analysis(profile, category_dict)
rubric_5d = calculate_5d_rubric(profile)
gap_analysis = analyze_gaps(profile, grade_level)
potential = detect_potential_indicators(profile)

# Step 3: LLM SYNTHESIS (Narrative only)
narrative_identity = NarrativeAgent.generate_identity(profile, archetype)

# Step 4: COMPLETENESS CHECK
completeness = calculate_completeness(profile)

# Step 5: PERSIST TO DATABASE
save_agent_output(student_id, "assessment", output_dict)
```

---

## 4. API Endpoints

### POST `/agents/assessment/score`

**Purpose:** Run full assessment and persist results

**Authentication:** Required (Supabase auth)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "student_id": "profile-uuid-123",
    "profile": null,
    "context": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | string | Yes | Profile UUID from Supabase |
| `profile` | object | No | Profile data (auto-fetched if null) |
| `context` | object | No | Additional context (reserved) |

**Response (Success):**
```json
{
    "success": true,
    "data": {
        "ivy_plus_score": 72.3,
        "percentile_rank": 45,
        "category_scores": {
            "aptitude": 78,
            "passion": 65,
            "community": 72,
            "narrative": 68
        },
        "archetype": { ... },
        "rubric_5d": { ... },
        "gap_analysis": { ... },
        "potential_indicators": { ... },
        "completeness_score": 0.85,
        "analysis_notes": []
    }
}
```

**Response (Error):**
```json
{
    "success": false,
    "error": "Profile not found",
    "code": "NOT_FOUND"
}
```

**Side Effects:**
- Persists output to `profiles.agent_outputs['assessment']`
- Updates `profiles.updated_at` timestamp

---

## 5. Request/Response Schemas

### AssessmentRequest

```python
class AssessmentRequest(BaseModel):
    student_id: str                          # Required: profile UUID
    profile: Optional[Dict[str, Any]] = None # Auto-fetched if not provided
    context: Dict[str, Any] = {}             # Reserved for future use
```

### AssessmentOutput (Complete Schema)

```python
class AssessmentOutput(BaseModel):
    # ═══════════════════════════════════════════════════════════════
    # CORE PROBABILITY SCORES
    # ═══════════════════════════════════════════════════════════════
    ivy_plus_score: float           # 0-100 competitive readiness
    percentile_rank: float          # 0-100 rank in Ivy applicant pool

    # ═══════════════════════════════════════════════════════════════
    # CATEGORY BREAKDOWN
    # ═══════════════════════════════════════════════════════════════
    category_scores: Dict[str, float]
    # {
    #   "aptitude": 78,      # Academics, test scores, rigor
    #   "passion": 65,       # Leadership, projects, commitment
    #   "community": 72,     # Service, impact, hours
    #   "narrative": 68      # Story coherence, uniqueness
    # }

    # ═══════════════════════════════════════════════════════════════
    # SFFA RUBRIC (Harvard-Style 1-6 Scale)
    # ═══════════════════════════════════════════════════════════════
    sffa_rubric: Dict[str, int]
    # {
    #   "academic": 2,        # 1=outstanding, 6=below average
    #   "extracurricular": 3,
    #   "athletic": 4,
    #   "personal": 2,
    #   "overall": 2
    # }

    # ═══════════════════════════════════════════════════════════════
    # ARCHETYPE (V2 Multi-Dimensional)
    # ═══════════════════════════════════════════════════════════════
    archetype: ArchetypeOutput      # See Section 7 for details

    # ═══════════════════════════════════════════════════════════════
    # HELPING/HOLDING FACTORS
    # ═══════════════════════════════════════════════════════════════
    helping_factors: List[FactorOutput]
    holding_back_factors: List[FactorOutput]
    net_position: str               # "STRONG" | "BALANCED" | "NEEDS_WORK"

    # ═══════════════════════════════════════════════════════════════
    # NARRATIVE SYNTHESIS
    # ═══════════════════════════════════════════════════════════════
    narrative_guidance: Optional[Dict]        # Formula-based fallback
    narrative_identity: Optional[NarrativeIdentity]  # LLM synthesis

    # ═══════════════════════════════════════════════════════════════
    # TYPE-085: JENNY'S 5-DIMENSION RUBRIC (/50)
    # ═══════════════════════════════════════════════════════════════
    rubric_5d: Optional[Rubric5DOutput]
    # {
    #   "academics": {"score": 7, "gap": 3, "signals": [...]},
    #   "leadership": {"score": 4, "gap": 6, "signals": [...]},
    #   "service": {"score": 5, "gap": 5, "signals": [...]},
    #   "artifacts": {"score": 6, "gap": 4, "signals": [...]},
    #   "recognition": {"score": 2, "gap": 8, "signals": [...]},
    #   "total_score": 24,
    #   "percentage": 48.0,
    #   "p0_dimensions": ["recognition", "leadership"],
    #   "p1_dimensions": ["service"],
    #   "strongest_dimension": "academics",
    #   "weakest_dimension": "recognition",
    #   "coaching_priority": "recognition"
    # }

    # ═══════════════════════════════════════════════════════════════
    # TYPE-086: GAP PRIORITY ANALYSIS
    # ═══════════════════════════════════════════════════════════════
    gap_analysis: Optional[GapAnalysisOutput]
    # {
    #   "grade_level": 11,
    #   "urgency_multiplier": 1.3,
    #   "gaps": [
    #     {
    #       "dimension": "recognition",
    #       "raw_gap": 8,
    #       "dimension_weight": 1.4,
    #       "urgency_multiplier": 1.3,
    #       "priority_score": 14.56,
    #       "priority_level": "P0",
    #       "current_score": 2,
    #       "target_score": 8,
    #       "timeline_recommendation": "2 weeks",
    #       "closing_actions": [...]
    #     }
    #   ],
    #   "p0_gaps": ["recognition", "leadership"],
    #   "p1_gaps": ["service"],
    #   "p2_gaps": ["artifacts"],
    #   "p3_gaps": [],
    #   "top_3_actions": [...],
    #   "primary_focus": "recognition",
    #   "coaching_message": "..."
    # }

    # ═══════════════════════════════════════════════════════════════
    # TYPE-083: POTENTIAL INDICATORS
    # ═══════════════════════════════════════════════════════════════
    potential_indicators: Optional[PotentialIndicatorOutput]
    # {
    #   "hidden_strengths": [
    #     {
    #       "skill_category": "coding",
    #       "mentioned_keywords": ["python", "machine learning"],
    #       "missing_demonstrations": ["No deployed project", "No competition"],
    #       "recommendation": "Build tangible project on GitHub",
    #       "essay_angle": "Self-taught journey in AI"
    #     }
    #   ],
    #   "untapped_opportunities": [...],
    #   "latent_potential": [...],
    #   "total_indicators": 5,
    #   "high_priority_count": 2,
    #   "primary_unlock": "Ship a deployed CS project",
    #   "coaching_summary": "..."
    # }

    # ═══════════════════════════════════════════════════════════════
    # QUALITY METRICS
    # ═══════════════════════════════════════════════════════════════
    completeness_score: float       # 0.0-1.0 profile data completeness
    analysis_notes: List[str]       # Data quality warnings
```

### FactorOutput

```python
class FactorOutput(BaseModel):
    name: str                       # "Strong GPA Trend"
    description: str                # "GPA improved from 3.5 to 3.9"
    category: str                   # "aptitude" | "passion" | "community"
    impact: str                     # "high" | "medium" | "low"
    evidence: List[str]             # Supporting data points
```

### NarrativeIdentity

```python
class NarrativeIdentity(BaseModel):
    brand_statement: str            # 1-2 sentence positioning
    narrative_dna: str              # Core identity narrative
    themes: List[str]               # Key themes (3-5)
    spike: str                      # Primary differentiator
    pillars: List[str]              # Identity pillars (4)
    identity_synthesis: Dict        # Full synthesis data
```

---

## 6. Scoring Primitives

### TYPE-085: Jenny's 5-Dimension Rubric

**File:** `backend/tools/scoring/rubric_5d.py`

**Purpose:** Calculate baseline rubric score across 5 dimensions (0-10 each = /50 total)

#### Dimension Scoring Formulas

| Dimension | Weight | Formula |
|-----------|--------|---------|
| **Academics** | 1.5x | Base 3 + GPA 3.9+ (+2) + AP 8+ (+2) + SAT 1500+ (+2) + AP Score 4.5+ (+1) |
| **Leadership** | 1.3x | Base 1 + Founder (+3) + President (+2) + Multi-year (+2) + National scope (+3) |
| **Service** | 0.9x | Base 1 + 100+ hrs (+3) + Consistent 2yr (+2) + Impact evidence (+2) + Leadership role (+1) |
| **Artifacts** | 1.2x | Base 1 + Published (+3) + Complex (+2) + Multiple (+1 each) + External validation (+2) |
| **Recognition** | 1.4x | Base 0 + National (+4) + Regional (+2) + Finalist (+2) + Multiple (+1 each) |

#### Output Schema

```python
class Rubric5DOutput(BaseModel):
    academics: DimensionScore
    leadership: DimensionScore
    service: DimensionScore
    artifacts: DimensionScore
    recognition: DimensionScore

    total_score: int                # 0-50
    percentage: float               # 0-100

    p0_dimensions: List[str]        # Gap >= 5 (Critical)
    p1_dimensions: List[str]        # Gap >= 3 (High)

    strongest_dimension: str
    weakest_dimension: str
    coaching_priority: str          # Focus area for next session

class DimensionScore(BaseModel):
    score: int                      # 0-10
    gap: int                        # 10 - score
    signals: List[str]              # Evidence found
    raw_data: Dict                  # Source values
```

#### Example Output (Huda W001 Baseline)

```json
{
    "academics": {"score": 5, "gap": 5, "signals": ["GPA 3.7", "SAT not provided"]},
    "leadership": {"score": 2, "gap": 8, "signals": ["No founder role", "Member only"]},
    "service": {"score": 2, "gap": 8, "signals": ["<50 hours", "No leadership"]},
    "artifacts": {"score": 4, "gap": 6, "signals": ["Blog mentioned", "No deployment"]},
    "recognition": {"score": 1, "gap": 9, "signals": ["No competitions", "No awards"]},
    "total_score": 14,
    "percentage": 28.0,
    "p0_dimensions": ["leadership", "recognition"],
    "p1_dimensions": ["service", "artifacts"],
    "coaching_priority": "recognition"
}
```

---

### TYPE-086: Gap Priority Analyzer

**File:** `backend/tools/scoring/gap_analyzer.py`

**Purpose:** Categorize gaps by priority using weighted urgency formula

#### Priority Score Formula

```
Priority Score = Gap Size × Dimension Weight × Urgency Multiplier

Where:
- Gap Size = Target Score (8) - Current Score
- Dimension Weight = 0.9 to 1.5 (based on AO importance)
- Urgency Multiplier = Grade-based multiplier
```

#### Urgency Multipliers

| Grade | Multiplier | Rationale |
|-------|------------|-----------|
| Senior (12) | 1.5x | Application imminent, must address now |
| Junior (11) | 1.3x | Critical year, build momentum |
| Sophomore (10) | 1.1x | Time to build, start early |
| Freshman (9) | 1.0x | Foundation year, explore widely |

#### Priority Thresholds

| Priority | Score Threshold | Timeline | Action |
|----------|-----------------|----------|--------|
| **P0** | >= 8.0 | 2 weeks | Critical - drop everything |
| **P1** | >= 5.0 | 8 weeks | High - next coaching focus |
| **P2** | >= 2.0 | This semester | Medium - ongoing work |
| **P3** | < 2.0 | Nice to have | Low - if time permits |

#### Closing Actions by Dimension

```python
CLOSING_ACTIONS = {
    "academics": [
        {"action": "Intensive SAT/ACT prep", "timeline": "8 weeks", "expected_boost": "+2-3 points"},
        {"action": "GPA tutoring for key classes", "timeline": "semester", "expected_boost": "+0.2 GPA"},
        {"action": "Enroll in 2 more APs", "timeline": "next year", "expected_boost": "+1-2 points"}
    ],
    "leadership": [
        {"action": "Found a club/initiative", "timeline": "4 weeks", "expected_boost": "+3 points"},
        {"action": "Run for officer position", "timeline": "next election", "expected_boost": "+2 points"},
        {"action": "Multi-year commitment evidence", "timeline": "ongoing", "expected_boost": "+2 points"}
    ],
    "service": [
        {"action": "Weekly volunteering (5+ hrs)", "timeline": "ongoing", "expected_boost": "+2-3 points"},
        {"action": "Service coordinator role", "timeline": "8 weeks", "expected_boost": "+2 points"},
        {"action": "Document impact metrics", "timeline": "2 weeks", "expected_boost": "+1 point"}
    ],
    "artifacts": [
        {"action": "Ship deployed project", "timeline": "8 weeks", "expected_boost": "+3 points"},
        {"action": "Publish work (blog, paper)", "timeline": "4 weeks", "expected_boost": "+2 points"},
        {"action": "Get external validation", "timeline": "12 weeks", "expected_boost": "+2 points"}
    ],
    "recognition": [
        {"action": "Apply to NCWIT/Scholastic", "timeline": "deadline", "expected_boost": "+3-4 points"},
        {"action": "Enter regional competitions", "timeline": "8 weeks", "expected_boost": "+2 points"},
        {"action": "Submit to Regeneron/ISEF", "timeline": "deadline", "expected_boost": "+4 points"}
    ]
}
```

---

### TYPE-083: Potential Indicator Detection

**File:** `backend/tools/scoring/potential_detector.py`

**Purpose:** Detect hidden strengths and untapped opportunities

#### Three Detection Categories

**1. Hidden Strengths**
Skills mentioned in profile but not demonstrated with tangible outcomes.

```python
# Detection logic
if "coding" in profile_text and not has_cs_project:
    hidden_strengths.append({
        "skill_category": "coding",
        "mentioned_keywords": ["python", "ML"],
        "missing_demonstrations": ["No deployed project", "No GitHub"],
        "recommendation": "Build tangible project on GitHub",
        "essay_angle": "Self-taught journey in AI"
    })
```

**2. Untapped Opportunities**
Natural extensions of current activities that could boost profile.

```python
# Detection logic
if has_research and not submitted_to_competitions:
    untapped_opportunities.append({
        "current_activity": "Research project on X",
        "opportunity": "Submit to Regeneron STS",
        "why_natural_fit": "Research already meets criteria",
        "action_steps": ["Format abstract", "Get teacher rec"],
        "expected_boost": "+3-4 points on Recognition"
    })
```

**3. Latent Potential**
Growth mindset signals that indicate high ceiling.

```python
# Signal types
LATENT_SIGNALS = [
    "self_taught",      # "Learned X on my own"
    "founded",          # "Started a..."
    "initiative",       # "Independently decided to..."
    "overcame",         # Adversity signals
    "scaled",           # "Grew from X to Y"
    "innovative"        # Novel approaches mentioned
]
```

---

## 7. Archetype System (V2)

**Files:**
- `backend/agents/schemas/archetype_v2.py`
- `backend/agents/schemas/archetype_engine.py`

### 6-Dimension Framework

The V2 archetype system uses **intersections** of 6 dimensions rather than single-category labels.

```
┌─────────────────────────────────────────────────────────────────┐
│                    V2 ARCHETYPE DIMENSIONS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DOMAIN (WHAT)                                               │
│     └─ 18+ focus areas: STEM Researcher, Tech Builder,         │
│        Humanities Scholar, Social Entrepreneur, etc.            │
│                                                                  │
│  2. CONTEXT (WHERE/WHO)                                         │
│     └─ Gender, Ethnicity, URM/ORM, First-gen, International,   │
│        School type, Socioeconomic, Geographic                   │
│                                                                  │
│  3. EXECUTION STYLE (HOW)                                       │
│     └─ Type A Achiever, Perfectionist, ADHD Hyperfocus,        │
│        Creative Chaotic, Anxiety-Driven, Balanced Executor      │
│                                                                  │
│  4. CHALLENGES (OBSTACLES)                                      │
│     └─ GPA recovery, Late bloomer, Breadth vs depth,           │
│        Senior crunch, Privilege perception                      │
│                                                                  │
│  5. TIMELINE (WHEN)                                             │
│     └─ Early HS (9-10), Mid HS (11), Late HS (12),             │
│        Months to application, Strategic windows                 │
│                                                                  │
│  6. STRENGTHS/WEAKNESSES                                        │
│     └─ Top 5 strengths, Primary 3 weaknesses,                  │
│        Self-awareness level, MBTI (if provided)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### ArchetypeOutput Schema

```python
class ArchetypeOutput(BaseModel):
    # === LEGACY FIELDS (Backward Compatible) ===
    id: str                         # "SCHOLAR", "RESEARCHER", etc.
    code: str                       # "ARCH-001" to "ARCH-011"
    label: str                      # "The Scholar"
    tagline: str                    # One-line description
    confidence: int                 # 0-100
    alternates: List[Dict]          # Secondary archetypes

    # === V2 COMPOSITE CODE ===
    composite_code: str             # "STEM-RESEARCHER.TYPE-A.SENIOR.HIGH-RESOURCE"

    # === DIMENSION 1: DOMAIN ===
    domain: DomainProfile = {
        "primary": "stem_researcher",
        "secondary": ["tech_builder"],
        "has_spike": True,
        "spike_description": "ML research with published paper"
    }

    # === DIMENSION 2: CONTEXT ===
    context: ContextProfile = {
        "gender": "female",
        "ethnicity": "asian_south",
        "is_urm": False,
        "is_orm": True,              # Overrepresented in STEM
        "is_first_gen": True,
        "is_international": False,
        "is_gender_minority_in_field": True,  # Woman in CS
        "gender_field_advantage": "Woman in STEM - actively recruited",
        "has_diversity_story": True,
        "school_type": "competitive_public",
        "socioeconomic": "medium_resource"
    }

    # === DIMENSION 3: EXECUTION STYLE ===
    execution_style: ExecutionProfile = {
        "primary_style": "type_a_achiever",
        "stress_response": "rises_up",
        "burnout_risk": "medium",
        "deadline_behavior": "early"
    }

    # === DIMENSION 4: CHALLENGES ===
    challenges: ChallengeProfile = {
        "primary": ["gpa_recovery"],
        "gpa_needs_explanation": True,
        "activity_gaps": ["no_summer_program"]
    }

    # === DIMENSION 5: TIMELINE ===
    timeline: TimelineProfile = {
        "position": "late_hs",
        "grade": 12,
        "months_to_application": 8,
        "is_urgent": True,
        "can_add_major_activity": False
    }

    # === DIMENSION 6: STRENGTHS/WEAKNESSES ===
    strengths_weaknesses: StrengthsWeaknessesProfile = {
        "top_strengths": ["analytical", "leadership", "resilience"],
        "primary_weaknesses": ["test_anxiety", "procrastination"],
        "self_awareness_level": "high"
    }

    # === SYNTHESIS ===
    diversity_angles: List[str]     # ["First-gen achiever", "Woman in STEM"]
    strategy_family: str            # Maps to coaching strategy
```

### Diversity Angle Detection

The archetype engine automatically generates strategic diversity angles:

```python
# Auto-generated diversity angles
if context.is_first_gen:
    diversity_angles.append("First-generation college student")

if context.is_gender_minority_in_field:
    diversity_angles.append(f"{context.gender.title()} in {domain.primary}")

if context.is_urm:
    diversity_angles.append("Underrepresented minority perspective")

if context.ethnicity in ["african_american", "hispanic_latino", "native_american"]:
    diversity_angles.append(f"{context.ethnicity} background and experience")
```

### Confidence Calculation

```python
confidence = (
    domain_confidence * 0.40 +      # How clear is their domain?
    execution_confidence * 0.30 +    # How consistent is their style?
    timeline_confidence * 0.30       # How well-mapped is their timeline?
)
```

---

## 8. Database Schema

### Supabase `profiles` Table

```sql
CREATE TABLE profiles (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Core profile sections (JSONB)
    aptitude JSONB DEFAULT '{}',
    passion JSONB DEFAULT '{}',
    community JSONB DEFAULT '{}',
    operating JSONB DEFAULT '{}',
    demographics JSONB DEFAULT '{}',

    -- Agent outputs (JSONB namespace per agent)
    agent_outputs JSONB DEFAULT '{}',

    -- Status tracking
    profile_status TEXT DEFAULT 'none',
    assessment_progress JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ
);
```

### `agent_outputs` JSONB Structure

```json
{
    "assessment": {
        "ivy_plus_score": 72.3,
        "percentile_rank": 45,
        "category_scores": {
            "aptitude": 78,
            "passion": 65,
            "community": 72,
            "narrative": 68
        },
        "sffa_rubric": {...},
        "archetype": {...},
        "helping_factors": [...],
        "holding_back_factors": [...],
        "rubric_5d": {...},
        "gap_analysis": {...},
        "potential_indicators": {...},
        "completeness_score": 0.85,
        "analysis_notes": [],
        "_timestamp": "2026-01-31T12:00:00Z"
    },
    "gameplan": {...},
    "awards": {...},
    "programs": {...}
}
```

### Profile Section Schemas

#### `aptitude` JSONB

```json
{
    "gpa": 3.85,
    "gpa_scale": 4.0,
    "sat_total": 1480,
    "sat_math": 750,
    "sat_verbal": 730,
    "act_composite": null,
    "ap_count": 8,
    "ap_avg_score": 4.5,
    "academic_awards": ["National Merit Semifinalist", "AP Scholar"],
    "class_rank": 15,
    "class_size": 450
}
```

#### `passion` JSONB

```json
{
    "leadership_level": "founder",
    "project_impact": "high",
    "research": true,
    "research_description": "ML paper on healthcare",
    "commitment_years": 3,
    "ec_awards": ["State Science Fair Winner"],
    "spike_category": "stem_research",
    "brag_text": "Published first-author paper at age 16",
    "project_description": "Built ML model to predict patient outcomes"
}
```

#### `community` JSONB

```json
{
    "service_hours": 150,
    "service_leadership": true,
    "service_organizations": ["Red Cross", "Local Food Bank"],
    "impact_description": "Led volunteer team of 20 students",
    "consistent_service": true,
    "service_years": 3
}
```

#### `demographics` JSONB

```json
{
    "gender": "female",
    "ethnicity": "asian_south",
    "first_gen": true,
    "international": false,
    "grade_level": 11,
    "school_type": "competitive_public",
    "intended_major": "Computer Science"
}
```

---

## 9. Frontend Integration

### React Query Hooks

**File:** `frontend/src/hooks/useAgentData.ts`

#### `useFullAssessment(profileId)`

```typescript
export function useFullAssessment(profileId: string | null) {
    return useQuery({
        queryKey: ['full-assessment', profileId],
        queryFn: () => agnoApi.getFullAssessment(profileId!),
        enabled: !!profileId,
        staleTime: 5 * 60 * 1000,  // 5 minutes
        retry: 2
    });
}

// Return type
interface AssessmentData {
    ivy_plus_score: number;
    percentile_rank: number;
    category_scores: Record<string, number>;
    sffa_rubric: Record<string, number>;
    archetype: ArchetypeOutput;
    rubric_5d: Rubric5DOutput | null;
    gap_analysis: GapAnalysisOutput | null;
    potential_indicators: PotentialIndicatorOutput | null;
    completeness_score: number;
    analysis_notes: string[];
}
```

#### `useAssessmentEnhancement(profileId)`

```typescript
// Lighter hook for basic assessment data
export function useAssessmentEnhancement(profileId: string | null) {
    return useQuery({
        queryKey: ['assessment-enhancement', profileId],
        queryFn: () => agnoApi.getAssessmentEnhancement(profileId!),
        enabled: !!profileId
    });
}
```

### UI Component Usage

**File:** `frontend/src/components/dashboard/MultiAgentTab.tsx`

```tsx
function AssessmentSection({ profileId, onViewDetails }) {
    const { data: fullAssessment, isLoading } = useFullAssessment(profileId);

    // Extract scoring primitives
    const ivyPlusScore = fullAssessment?.ivy_plus_score || 0;
    const rubric5d = fullAssessment?.rubric_5d || null;
    const gapAnalysis = fullAssessment?.gap_analysis || null;
    const potentialIndicators = fullAssessment?.potential_indicators || null;

    // Display logic
    return (
        <AgentCard name="Assessment Agent" ...>
            {/* Ivy+ Score Hero */}
            {ivyPlusScore > 0 && (
                <div className="text-4xl font-bold">{ivyPlusScore.toFixed(0)}</div>
            )}

            {/* 5D Rubric */}
            {rubric5d && (
                <div>
                    <span>{rubric5d.total_score}/50</span>
                    {rubric5d.p0_dimensions.map(dim => (
                        <Badge key={dim} variant="error">{dim} P0</Badge>
                    ))}
                </div>
            )}

            {/* Gap Analysis */}
            {gapAnalysis?.p0_gaps?.length > 0 && (
                <div>Priority Focus: {gapAnalysis.primary_focus}</div>
            )}

            {/* Hidden Potential */}
            {potentialIndicators?.hidden_strengths?.length > 0 && (
                <div>
                    {potentialIndicators.hidden_strengths.length} hidden strengths detected
                </div>
            )}
        </AgentCard>
    );
}
```

---

## 10. Multi-Agent Collaboration

### Assessment Output Consumers

```
AssessmentOutput
    │
    ├─────► GamePlan Agent
    │       ├─ rubric_5d.p0_dimensions → Q1 priority actions
    │       ├─ gap_analysis.gaps → Quarterly planning
    │       └─ archetype.timeline → Urgency calibration
    │
    ├─────► EC Agent
    │       ├─ archetype.domain → Activity recommendations
    │       ├─ rubric_5d.artifacts → Project strategy
    │       └─ potential_indicators → Opportunity matching
    │
    ├─────► Awards Agent
    │       ├─ rubric_5d.recognition → Award targeting
    │       ├─ gap_analysis → Competition prioritization
    │       └─ archetype.context → Diversity awards
    │
    ├─────► Programs Agent
    │       ├─ archetype → Program alignment scoring
    │       ├─ rubric_5d → Selectivity matching
    │       └─ category_scores → Fit calculation
    │
    └─────► Narrative Agent (LLM)
            ├─ potential_indicators → Essay hooks
            ├─ archetype.diversity_angles → Positioning
            └─ helping_factors → Strength narratives
```

### Cross-Agent Data Access

All agents can access assessment output via:

```python
# In any agent
assessment_data = profile.get("agent_outputs", {}).get("assessment", {})
rubric_5d = assessment_data.get("rubric_5d", {})
gap_analysis = assessment_data.get("gap_analysis", {})
```

This enables:
- **Consistency:** All agents use same baseline scores
- **Efficiency:** No redundant computation
- **Coherence:** Strategies align with assessment findings

---

## 11. Error Handling

### Graceful Degradation

All scoring functions handle missing data gracefully:

```python
# rubric_5d.py
def calculate_5d_rubric(profile: Dict) -> Rubric5DOutput:
    """Never fails - returns best-effort scores with gaps noted."""
    academics = score_academics(profile)  # Returns 0 if no data
    # ...continues with available data

    return Rubric5DOutput(
        academics=academics,
        # ...
        analysis_notes=["SAT not provided - using GPA only"]
    )
```

### Completeness Scoring

```python
def calculate_completeness(profile: Dict) -> float:
    """Returns 0.0-1.0 based on key field presence."""
    required_fields = [
        ("aptitude", "gpa"),
        ("aptitude", "test_scores"),
        ("passion", "leadership_level"),
        ("community", "service_hours"),
        # ... 13 total fields
    ]

    found = sum(1 for section, field in required_fields
                if profile.get(section, {}).get(field))

    return found / len(required_fields)
```

### Analysis Notes

Assessment adds warnings for sparse data:

```python
analysis_notes = []

if completeness_score < 0.4:
    analysis_notes.append("Profile data limited - scores are estimates")

if not profile.get("aptitude", {}).get("sat_total"):
    analysis_notes.append("No test scores - consider test-optional strategy")

if not profile.get("passion", {}).get("commitment_years"):
    analysis_notes.append("EC commitment history unclear - detail involvement")
```

---

## 12. File Locations

### Backend Files

```
backend/
├── agents/
│   ├── orchestrators/
│   │   └── assessment.py           # Main orchestrator (601 lines)
│   └── schemas/
│       ├── archetype_v2.py         # 6D dimension schemas (711 lines)
│       └── archetype_engine.py     # Synthesis engine (976 lines)
├── tools/
│   └── scoring/
│       ├── __init__.py             # Exports all scoring functions
│       ├── engine.py               # IvyScoreEngine (312 lines)
│       ├── rubric_5d.py            # TYPE-085 implementation (933 lines)
│       ├── gap_analyzer.py         # TYPE-086 implementation (628 lines)
│       ├── potential_detector.py   # TYPE-083 implementation (742 lines)
│       ├── factors.py              # Helping/Holding factors
│       ├── archetypes.py           # Legacy archetype detection
│       └── constants.py            # Weights, thresholds
├── api/
│   └── routers/
│       └── agents_bridge.py        # /agents/assessment/score (596 lines)
└── main.py                         # FastAPI app
```

### Frontend Files

```
frontend/
└── src/
    ├── hooks/
    │   └── useAgentData.ts         # useFullAssessment hook (612 lines)
    ├── lib/
    │   └── services/
    │       └── agnoApi.ts          # API client
    └── components/
        ├── dashboard/
        │   └── MultiAgentTab.tsx   # Assessment card display
        └── agents/
            └── AgentDetailModal.tsx # Detailed assessment view
```

---

## 13. Formula Reference

### Ivy+ Ready Score (0-100)

```
Ivy+ Score = (Aptitude × 0.35) + (Passion × 0.30) + (Community × 0.20) + (Narrative × 0.15)

Where each category is 0-100:
- Aptitude = GPA×0.35 + SAT×0.25 + Rigor×0.25 + Awards×0.15
- Passion = Leadership×0.40 + Project×0.30 + Research×0.20 + Commitment×0.10
- Community = Service Hours×0.50 + Service Leadership×0.50
- Narrative = LLM scoring (0-100)
```

### 5D Rubric Total (/50)

```
Total = Academics(0-10) + Leadership(0-10) + Service(0-10) + Artifacts(0-10) + Recognition(0-10)

Dimension Weights (for gap prioritization):
- Academics: 1.5x
- Leadership: 1.3x
- Service: 0.9x
- Artifacts: 1.2x
- Recognition: 1.4x
```

### Priority Score (Gap Analysis)

```
Priority Score = Gap Size × Dimension Weight × Urgency Multiplier

Gap Size = Target Score (8) - Current Score (0-10)

Urgency Multiplier:
- Grade 12: 1.5x
- Grade 11: 1.3x
- Grade 10: 1.1x
- Grade 9: 1.0x

Priority Thresholds:
- P0: score >= 8.0 (Critical)
- P1: score >= 5.0 (High)
- P2: score >= 2.0 (Medium)
- P3: score < 2.0 (Low)
```

### Archetype Confidence

```
Confidence = (Domain × 0.40) + (Execution × 0.30) + (Timeline × 0.30)

Where each factor is 0.0-1.0:
- Domain: How clearly defined is their focus area?
- Execution: How consistent is their operating style?
- Timeline: How well-mapped is their strategic timeline?
```

---

## Appendix: Quick Testing

### Test Assessment Endpoint

```bash
curl -X POST http://localhost:8000/agents/assessment/score \
  -H "Content-Type: application/json" \
  -d '{"student_id": "test-profile-123"}'
```

### Expected Response Shape

```json
{
    "success": true,
    "data": {
        "ivy_plus_score": 72.3,
        "percentile_rank": 45,
        "category_scores": {...},
        "archetype": {"composite_code": "STEM-RESEARCHER.TYPE-A.JUNIOR..."},
        "rubric_5d": {"total_score": 24, "p0_dimensions": ["recognition"]},
        "gap_analysis": {"primary_focus": "recognition", "p0_gaps": [...]},
        "potential_indicators": {"hidden_strengths": [...], "total_indicators": 5}
    }
}
```

---

*Document Version: 4.0*
*Last Updated: January 31, 2026*
*Maintainer: IvyLevel Engineering Team*
