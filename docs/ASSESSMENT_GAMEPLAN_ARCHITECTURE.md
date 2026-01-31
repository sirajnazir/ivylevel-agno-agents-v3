# Assessment vs GamePlan Agent Architecture Analysis

**Version:** v1.0
**Date:** January 31, 2026
**Purpose:** Comprehensive analysis of intelligence types, current implementation, and proposed architecture

---

## 1. Core Philosophy

### Assessment Agent = DIAGNOSIS
- **Gather** all student information
- **Score** across multiple dimensions
- **Identify** weak spots (gaps) and strengths
- **Classify** by priority (P0/P1/P2)
- **Output**: Complete picture of "Where the student IS"

### GamePlan Agent = MEDICINE (Strategy)
- **Synthesize** target positioning
- **Plan** activities, awards, programs
- **Sequence** by timeline phases
- **Optimize** for school-specific strategies
- **Output**: Complete roadmap of "Where the student SHOULD GO"

---

## 2. Intelligence Types Mapping

### Intelligence Types → Agent Assignment

| Type ID | Name | Current Agent | Should Be In | Status |
|---------|------|---------------|--------------|--------|
| TYPE-081 | IvyScore Calculation | Assessment | Assessment | ✅ Implemented (as 4-category + SFFA) |
| TYPE-082 | Gap Analysis Engine | None | **Assessment** | ❌ NOT IMPLEMENTED |
| TYPE-083 | Strength Recognition | None | **Assessment** | ❌ NOT IMPLEMENTED |
| TYPE-085 | Rubric Scoring Engine | Assessment | Assessment | ⚠️ Partial (SFFA only, not Jenny's 5-dim) |
| TYPE-086 | Gap Priority Analyzer | None | **Assessment** | ❌ NOT IMPLEMENTED |
| TYPE-001 | Game Plan Synthesis | GamePlan | GamePlan | ⚠️ Partial |

---

## 3. Detailed Gap Analysis: Assessment Agent

### 3.1 What Assessment Currently Does

| Component | Status | Details |
|-----------|--------|---------|
| Ivy+ Ready Score (0-100) | ✅ Done | 7-layer calculation pipeline |
| Category Scores (4 pillars) | ✅ Done | Aptitude, Passion, Community, Narrative |
| SFFA Rubric (1-6) | ✅ Done | Academic, EC, Athletic, Personal, Overall |
| Archetype Detection V2 | ✅ Done | 6 dimensions with diversity angles |
| Helping Factors | ✅ Done | 18 factors identified |
| Holding Back Factors | ✅ Done | 12 factors identified |
| Completeness Score | ✅ Done | 0-1.0 based on data coverage |
| Narrative Identity | ✅ Done | LLM-synthesized from NarrativeAgent |

### 3.2 What Assessment is MISSING (from Intelligence Types)

#### Missing: TYPE-085 - Jenny's 5-Dimension Rubric Scoring

**Current**: SFFA rubric is output-focused (Academic, EC, Athletic, Personal, Overall)

**Jenny's Real Model** (from W001-W093 coaching):
| Dimension | Weight | Purpose | Current Implementation |
|-----------|--------|---------|----------------------|
| Academics | 1.5 | GPA, AP/IB rigor, test scores | ✅ In APTITUDE category |
| Leadership | 1.3 | Formal titles, scope, depth | ⚠️ In PASSION (partial) |
| Service | 0.9 | Hours, impact, consistency | ✅ In COMMUNITY category |
| Artifacts | 1.2 | Tangible outputs, validation | ❌ NOT SCORED SEPARATELY |
| Recognition | 1.4 | Awards, competitions, prestige | ⚠️ In APTITUDE (academic awards only) |

**Baseline Example** (Huda W001): 14/50
- Academics: 5/10 (GPA 4.3, 11/18 APs)
- Leadership: 2/10 (**P0 gap** - largest upside)
- Service: 2/10
- Artifacts: 4/10
- Recognition: 1/10 (**P0 gap** - largest upside)

**Required Changes**:
1. Add explicit `artifacts_score` (0-10) tracking tangible outputs
2. Add explicit `recognition_score` (0-10) separating awards from academics
3. Add explicit `leadership_score` (0-10) separating from passion
4. Calculate `/50` total alongside current `/100` Ivy+ score

---

#### Missing: TYPE-082 + TYPE-086 - Gap Analysis with P0/P1/P2 Priority

**Current**: `holding_back_factors` list with basic priority (1-3)

**Intelligence Types Require**:
```typescript
interface Gap {
  category: 'academic' | 'ec' | 'awards' | 'narrative';
  gap_title: string;
  current_state: string;
  target_state: string;
  gap_size: number; // 0-10
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  closing_actions: string[]; // Specific actions to close gap
  estimated_weeks: number; // Time to close gap
  impact_on_ivyscore: number; // Points boost if closed
}
```

**Priority Calculation Formula**:
```
Gap Priority Score = Gap Size × Dimension Weight × Urgency Multiplier

P0 (Critical): priority_score ≥ 8 (must address immediately)
P1 (High): priority_score ≥ 5 (address within 8 weeks)
P2 (Medium): priority_score ≥ 2 (address within semester)
P3 (Low): priority_score < 2 (nice to have)
```

**Urgency Multipliers**:
| Grade | Multiplier | Reason |
|-------|------------|--------|
| 12 (Senior) | 1.5 | Very urgent - application season |
| 11 (Junior) | 1.3 | Urgent - building phase |
| 10 (Sophomore) | 1.1 | Moderately urgent |
| 9 (Freshman) | 1.0 | Normal timeline |

---

#### Missing: TYPE-083 - Hidden Strengths & Untapped Opportunities

**Current**: Only explicit factors analyzed (what student HAS done)

**Intelligence Types Require**:
```typescript
interface PotentialIndicator {
  indicator_type: 'hidden_strength' | 'untapped_opportunity' | 'latent_potential';
  title: string;
  evidence: string[];
  activation_potential: number; // 0-10
  activation_actions: string[];
  estimated_weeks_to_activate: number;
}
```

**Hidden Strengths**: Skills mentioned but not showcased
- Student mentions "coding" but no CS activities
- Student has "design skills" but no portfolio

**Untapped Opportunities**: Natural extensions of current work
- Research student with no publications → "submit to journal"
- Service leader with no nonprofit → "register 501c3"

**Latent Potential**: Growth mindset signals
- "Self-taught" mentions
- "Founded" or "created" language
- Initiative markers

---

### 3.3 Proposed Assessment Agent Output Schema

```python
class AssessmentOutput(BaseModel):
    # === EXISTING (Keep) ===
    ivy_plus_score: float  # 0-100
    percentile_rank: float
    category_scores: Dict[str, float]  # Aptitude, Passion, Community, Narrative
    sffa_rubric: Dict[str, int]  # 1-6 scale
    archetype: ArchetypeOutput  # V2 Multi-Dimensional
    helping_factors: List[FactorOutput]
    holding_back_factors: List[FactorOutput]
    net_position: str
    narrative_guidance: Dict[str, Any]
    narrative_identity: NarrativeIdentity
    completeness_score: float
    analysis_notes: List[str]

    # === NEW: Jenny's 5-Dimension Rubric (TYPE-085) ===
    rubric_5d: Rubric5DimensionOutput  # NEW

    # === NEW: Gap Analysis with Priority (TYPE-082 + TYPE-086) ===
    gap_analysis: GapAnalysisOutput  # NEW

    # === NEW: Hidden Strengths & Opportunities (TYPE-083) ===
    potential_indicators: PotentialIndicatorOutput  # NEW


class Rubric5DimensionOutput(BaseModel):
    """Jenny's 5-dimension rubric from coaching intelligence"""
    total_score: int  # 0-50
    academics: DimensionScore  # 0-10 with evidence/gaps
    leadership: DimensionScore  # 0-10 with evidence/gaps
    service: DimensionScore  # 0-10 with evidence/gaps
    artifacts: DimensionScore  # 0-10 with evidence/gaps
    recognition: DimensionScore  # 0-10 with evidence/gaps
    data_completeness: float  # 0-1.0
    scoring_confidence: float  # 0-1.0


class DimensionScore(BaseModel):
    dimension: str
    raw_score: int  # 0-10
    evidence: List[str]  # What contributed
    gaps: List[str]  # What's missing
    confidence: float  # 0-1.0


class GapAnalysisOutput(BaseModel):
    """P0/P1/P2/P3 prioritized gap analysis"""
    total_gaps: int
    p0_gaps: List[Gap]  # Critical - address immediately
    p1_gaps: List[Gap]  # High - address in 8 weeks
    p2_gaps: List[Gap]  # Medium - address this semester
    p3_gaps: List[Gap]  # Low - nice to have
    overall_gap_score: float  # 0-100 (100 = no gaps)
    quick_wins: List[Gap]  # High impact, low time
    rubric_baseline: str  # e.g., "14/50"
    rubric_potential: str  # e.g., "35/50 with focused gap closing"


class Gap(BaseModel):
    dimension: str
    gap_title: str
    current_state: str
    target_state: str
    gap_size: int  # 0-10
    priority: Literal['P0', 'P1', 'P2', 'P3']
    closing_actions: List[str]  # Top 3 actions
    estimated_weeks: int
    impact_on_score: int


class PotentialIndicatorOutput(BaseModel):
    """Hidden strengths and untapped opportunities"""
    total_indicators: int
    hidden_strengths: List[PotentialIndicator]
    untapped_opportunities: List[PotentialIndicator]
    latent_potential_signals: List[PotentialIndicator]
    highest_potential_activations: List[PotentialIndicator]  # Top 5
    potential_ivyscore_boost: int  # If all activated


class PotentialIndicator(BaseModel):
    indicator_type: Literal['hidden_strength', 'untapped_opportunity', 'latent_potential']
    title: str
    evidence: List[str]
    activation_potential: int  # 0-10
    activation_actions: List[str]
    estimated_weeks_to_activate: int
```

---

## 4. Detailed Gap Analysis: GamePlan Agent

### 4.1 What GamePlan Currently Does

| Component | Status | Details |
|-----------|--------|---------|
| Identity Synthesis | ✅ Done | archetype, spike, pillars, brand_statement |
| Target Activity List | ✅ Done | 10 Common App activities |
| Identity Seeds | ✅ Done | ACP-006: 8-month pre-seeding |
| Phase Planning | ✅ Done | Foundation → Specialization → Acceleration → Polish |
| School Strategies | ✅ Done | 1-Swap Rule for STEM schools |
| EC Generation | ✅ Done | Via ECAgent specialist |
| Awards Portfolio | ✅ Done | Via AwardsAgent specialist |
| Programs Matching | ✅ Done | Via ProgramsAgent specialist |
| Opportunity Scouting | ✅ Done | Via OpportunityAgent specialist |
| Portfolio Analysis | ⚠️ Basic | Only has_research, has_leadership checks |

### 4.2 What GamePlan is MISSING (from TYPE-001)

#### Missing: Target Profile Synthesis

**Intelligence Types Require**:
```typescript
interface TargetProfile {
  identity_fusion: string;      // e.g., "Film × CS → Digital Storyteller"
  narrative_thread: string;     // Core story connecting activities
  unique_positioning: string[]; // 3-5 differentiators
  strategic_target: string;     // Hidden dream school
  strategic_rationale: string;  // Why this positioning works
}
```

**Current**: GamePlan has `identity_synthesis` with archetype/spike but NOT:
- `identity_fusion` formula (IDENTITY + APTITUDE + PASSION + SERVICE)
- `strategic_target` (hidden dream school like "USC Games 15%")
- `unique_positioning` (3-5 differentiators)

---

#### Missing: Rubric Priority Sequencing

**Intelligence Types Require**:
```typescript
interface RubricPriority {
  dimension: string;
  current_score: number;
  target_score: number;
  gap: number;
  priority: 'P0' | 'P1' | 'P2';
  quarter_assignment: string;  // Which quarter to address
  recommended_actions: string[];
}
```

**Current**: GamePlan has no quarter-by-quarter gap sequencing

**Required**:
- Map P0 gaps to Q1-Q2 (address immediately)
- Map P1 gaps to Q2-Q3 (address in building phase)
- Map P2 gaps to Q3-Q4 (polish phase)

---

#### Missing: Convergence Paths (for Undecided Students)

**Intelligence Types Require**:
```typescript
interface ConvergencePath {
  path_name: string;           // e.g., "Computer Science Path"
  feasibility_score: number;   // 0-10
  rubric_alignment: number;    // 0-10
  convergence_opportunities: string[];  // Activities serving both paths
  unique_activities: string[];          // Path-specific activities
  recommended_ratio: string;   // e.g., "60% CS / 40% Film"
}
```

**Current**: GamePlan assumes student is decided on major/path

**Required**:
- Detect undecided students (multiple interests)
- Generate parallel paths that can converge
- Recommend ratio for time allocation

---

#### Missing: Narrative Coherence Score

**Intelligence Types Require**:
```typescript
interface NarrativeCoherence {
  score: number;  // 0-100
  aligned_activities: number;
  total_activities: number;
  identity_keywords: string[];
  misaligned_activities: string[];  // Activities that don't fit narrative
}
```

**Current**: No coherence scoring between activities and identity

---

### 4.3 Proposed GamePlan Agent Output Schema

```python
class MasterGamePlan(BaseModel):
    # === EXISTING (Keep) ===
    target_activity_list: List[ActivitySlot]
    identity_synthesis: IdentitySynthesis
    identity_seeds: List[IdentitySeed]
    phases: List[Phase]
    school_strategies: List[SchoolStrategy]
    portfolio_analysis: PortfolioAnalysis
    narrative: NarrativeIdentity
    ec_generation: ECGeneration
    awards: AwardsOutput
    programs: ProgramsOutput
    summary: GamePlanSummary
    react_metadata: Optional[ReActMetadata]

    # === NEW: Target Profile (TYPE-001) ===
    target_profile: TargetProfile  # NEW

    # === NEW: Rubric Priority Sequencing ===
    rubric_priorities: List[RubricPriority]  # NEW (from Assessment gaps)

    # === NEW: Convergence Paths (for undecided) ===
    convergence_paths: List[ConvergencePath]  # NEW

    # === NEW: Narrative Coherence ===
    narrative_coherence: NarrativeCoherence  # NEW

    # === NEW: High-ROI Opportunities ===
    high_roi_opportunities: List[str]  # Top 5 for this quarter


class TargetProfile(BaseModel):
    """Strategic positioning from TYPE-001"""
    identity_fusion: str  # "Film × CS → Digital Storyteller"
    narrative_thread: str  # Core story
    unique_positioning: List[str]  # 3-5 differentiators
    strategic_target: str  # Hidden dream school
    strategic_rationale: str  # Why this works


class RubricPriority(BaseModel):
    """Quarter-sequenced gap closing"""
    dimension: str
    current_score: int
    target_score: int
    gap: int
    priority: Literal['P0', 'P1', 'P2']
    quarter_assignment: str
    recommended_actions: List[str]


class ConvergencePath(BaseModel):
    """For undecided students"""
    path_name: str
    feasibility_score: float
    rubric_alignment: float
    convergence_opportunities: List[str]
    unique_activities: List[str]
    recommended_ratio: str


class NarrativeCoherence(BaseModel):
    """Activity-narrative alignment"""
    score: int  # 0-100
    aligned_activities: int
    total_activities: int
    identity_keywords: List[str]
    misaligned_activities: List[str]
```

---

## 5. Data Flow: Assessment → GamePlan

### 5.1 Current Flow (Problematic)

```
Assessment Agent
  ├─ Calculates: ivy_plus_score, category_scores, archetype, factors
  └─ Returns: AssessmentOutput
           ↓
GamePlan Agent (receives AssessmentOutput as dict)
  ├─ ONLY EXTRACTS: archetype (string), spike (string)
  ├─ IGNORES: category_scores, sffa_rubric, factors, completeness
  └─ IGNORES: V2 multi-dimensional data, diversity_angles
```

**Problems**:
1. GamePlan ignores most of Assessment's work
2. V2 archetype data (gender, ethnicity, URM, execution style) is lost
3. Gap analysis not passed to GamePlan for sequencing
4. Diversity angles not used in strategy

### 5.2 Proposed Flow (Fixed)

```
Assessment Agent (ENHANCED)
  ├─ Calculates: ivy_plus_score, category_scores, archetype V2
  ├─ NEW: rubric_5d (Jenny's 5-dimension: /50)
  ├─ NEW: gap_analysis (P0/P1/P2/P3 with actions)
  ├─ NEW: potential_indicators (hidden strengths, opportunities)
  └─ Returns: AssessmentOutput (enriched)
           ↓
GamePlan Agent (ENHANCED)
  ├─ CONSUMES: All Assessment data
  │   ├─ rubric_5d → Maps to rubric_priorities with quarter_assignment
  │   ├─ gap_analysis.p0_gaps → Immediate action items
  │   ├─ gap_analysis.quick_wins → High-ROI opportunities
  │   ├─ potential_indicators → Informs activity recommendations
  │   ├─ archetype.diversity_angles → Shapes narrative strategy
  │   └─ archetype.execution_style → Customizes pacing (Type A vs ADHD)
  │
  ├─ SYNTHESIZES:
  │   ├─ target_profile (identity fusion, strategic target)
  │   ├─ convergence_paths (if undecided)
  │   ├─ rubric_priorities (quarter-sequenced from gaps)
  │   └─ narrative_coherence (activity-identity alignment)
  │
  └─ ORCHESTRATES specialists with enriched context:
      ├─ ECAgent: Gets gap_analysis, potential_indicators
      ├─ AwardsAgent: Gets recognition gap priority
      ├─ ProgramsAgent: Gets archetype, timeline urgency
      └─ OpportunityAgent: Gets quick_wins list
```

---

## 6. Implementation Roadmap

### Phase 1: Enhance Assessment Agent (Week 1-2)

#### 1.1 Add Jenny's 5-Dimension Rubric Scoring
- [ ] Create `Rubric5DimensionOutput` model
- [ ] Implement `score_academics()` (GPA, AP, test scores)
- [ ] Implement `score_leadership()` (roles, scope, depth)
- [ ] Implement `score_service()` (hours, impact, consistency)
- [ ] Implement `score_artifacts()` (projects, publications, validation)
- [ ] Implement `score_recognition()` (awards, competitions, prestige)
- [ ] Add `/50` baseline tracking

#### 1.2 Add Gap Analysis with Priority
- [ ] Create `GapAnalysisOutput` and `Gap` models
- [ ] Implement `calculate_gap_sizes()` for each dimension
- [ ] Implement `calculate_priority_score()` with weights × urgency
- [ ] Implement `categorize_gaps()` into P0/P1/P2/P3
- [ ] Generate `closing_actions` per gap (dimension-specific)
- [ ] Calculate `estimated_weeks` per gap
- [ ] Identify `quick_wins` (high impact, <8 weeks)

#### 1.3 Add Potential Indicator Extraction
- [ ] Create `PotentialIndicatorOutput` and `PotentialIndicator` models
- [ ] Implement `detect_hidden_strengths()` (skills mentioned, not applied)
- [ ] Implement `identify_untapped_opportunities()` (natural extensions)
- [ ] Implement `surface_latent_potential()` (growth signals)
- [ ] Calculate `potential_ivyscore_boost`

### Phase 2: Enhance GamePlan Agent (Week 2-3)

#### 2.1 Add Target Profile Synthesis
- [ ] Create `TargetProfile` model
- [ ] Implement identity fusion formula (IDENTITY × APTITUDE × PASSION × SERVICE)
- [ ] Implement strategic target detection (hidden dream schools)
- [ ] Generate unique positioning (3-5 differentiators)

#### 2.2 Add Rubric Priority Sequencing
- [ ] Create `RubricPriority` model
- [ ] Map P0 gaps to Q1-Q2
- [ ] Map P1 gaps to Q2-Q3
- [ ] Map P2 gaps to Q3-Q4
- [ ] Generate quarter_assignment for each gap

#### 2.3 Add Convergence Paths
- [ ] Create `ConvergencePath` model
- [ ] Detect undecided students (multiple interests)
- [ ] Generate parallel paths
- [ ] Identify convergence opportunities
- [ ] Calculate recommended ratios

#### 2.4 Add Narrative Coherence Scoring
- [ ] Create `NarrativeCoherence` model
- [ ] Extract identity keywords from target_profile
- [ ] Score activity alignment
- [ ] Identify misaligned activities

### Phase 3: Integration (Week 3-4)

#### 3.1 Connect Assessment → GamePlan
- [ ] Pass full AssessmentOutput to GamePlan
- [ ] Map rubric_5d → rubric_priorities
- [ ] Map gap_analysis.p0_gaps → immediate actions
- [ ] Map potential_indicators → activity recommendations

#### 3.2 Enhance Specialist Agents
- [ ] ECAgent: Use gap_analysis for activity selection
- [ ] AwardsAgent: Prioritize by recognition gap
- [ ] ProgramsAgent: Use archetype.execution_style for pacing
- [ ] OpportunityAgent: Use quick_wins list

#### 3.3 Frontend Integration
- [ ] Update API endpoint responses
- [ ] Update MultiAgentTab to display new data
- [ ] Add gap priority visualization
- [ ] Add 5-dimension rubric display

---

## 7. Summary: What Moves Where

### From GamePlan → Assessment

| Component | Current Location | Move To | Reason |
|-----------|------------------|---------|--------|
| Basic gap detection | GamePlan (portfolio_analysis) | Assessment | Gaps = diagnosis, not strategy |
| Strength identification | None | Assessment | Strengths = diagnosis |

### From Assessment → GamePlan (Data Flow)

| Component | Generated By | Consumed By | Purpose |
|-----------|--------------|-------------|---------|
| rubric_5d | Assessment | GamePlan | Baseline for priority sequencing |
| gap_analysis | Assessment | GamePlan | Input for quarter planning |
| potential_indicators | Assessment | GamePlan | Input for activity recommendations |
| diversity_angles | Assessment | GamePlan | Input for narrative strategy |
| execution_style | Assessment | GamePlan | Customization for pacing |

### NEW in Assessment

| Component | Status | Implementation |
|-----------|--------|----------------|
| Rubric 5-Dimension | NEW | Jenny's model: /50 total |
| Gap Priority (P0/P1/P2/P3) | NEW | TYPE-086 formula |
| Hidden Strengths | NEW | TYPE-083 pattern detection |
| Untapped Opportunities | NEW | TYPE-083 pattern detection |
| Latent Potential | NEW | TYPE-083 growth signals |

### NEW in GamePlan

| Component | Status | Implementation |
|-----------|--------|----------------|
| Target Profile | NEW | TYPE-001 identity fusion |
| Strategic Target | NEW | Hidden dream school |
| Rubric Priority Sequencing | NEW | Quarter-mapped gaps |
| Convergence Paths | NEW | For undecided students |
| Narrative Coherence | NEW | Activity alignment score |

---

## 8. Key Formulas Reference

### From TYPE-001: Identity Synthesis
```
IDENTITY + APTITUDE + PASSION + SERVICE = NARRATIVE

Identity: "Who you are" (cultural background, lived experience)
Aptitude: "What you're good at" (academic strengths, skills)
Passion: "What energizes you" (deep interests, projects)
Service: "How you help others" (teaching, mentoring, impact)
```

### From TYPE-085: Dimension Scoring
```
Academics (0-10):
  Base: 3 points
  + GPA 3.9+: +2 points
  + AP/IB 8+: +2 points
  + SAT 1500+/ACT 34+: +2 points

Leadership (0-10):
  Base: 1 point
  + Founder: +3 points
  + President/Captain: +2 points
  + Multi-year (2+): +2 points
  + National scope: +3 points

Recognition (0-10):
  Base: 0 points (must be earned)
  + National award: +4 points
  + Regional award: +2 points
  + Competition finalist: +2 points
```

### From TYPE-086: Gap Priority
```
Priority Score = Gap Size × Dimension Weight × Urgency Multiplier

Dimension Weights:
  Academics: 1.5
  Recognition: 1.4
  Leadership: 1.3
  Artifacts: 1.2
  Service: 0.9

Urgency Multipliers:
  Senior: 1.5
  Junior: 1.3
  Sophomore: 1.1
  Freshman: 1.0

Priority Thresholds:
  P0: score ≥ 8
  P1: score ≥ 5
  P2: score ≥ 2
  P3: score < 2
```

---

## 9. Files to Modify

### Assessment Agent
- `backend/agents/orchestrators/assessment.py` - Add new scoring methods
- `backend/agents/schemas/assessment.py` - Add new output models
- `backend/tools/scoring/rubric_5d.py` - NEW: Jenny's 5-dimension scoring
- `backend/tools/scoring/gap_analyzer.py` - NEW: P0/P1/P2/P3 analysis
- `backend/tools/scoring/potential_detector.py` - NEW: Hidden strengths

### GamePlan Agent
- `backend/agents/orchestrators/gameplan.py` - Consume new Assessment data
- `backend/agents/schemas/gameplan.py` - Add new output models
- `backend/agents/logic/target_profile.py` - NEW: Identity fusion synthesis
- `backend/agents/logic/convergence_paths.py` - NEW: Undecided student handling

### API & Frontend
- `backend/api/routers/agents_bridge.py` - Update response schemas
- `frontend/src/hooks/useAgentData.ts` - Extract new fields
- `frontend/src/components/dashboard/MultiAgentTab.tsx` - Display new data

---

## 10. Next Steps

1. **Review this document** with stakeholders
2. **Prioritize Phase 1** (Assessment enhancements) - highest impact
3. **Implement TYPE-085** (5-dimension rubric) first as foundation
4. **Implement TYPE-086** (gap priority) second for actionability
5. **Test with Huda profile** - baseline should be ~14/50
6. **Proceed to Phase 2** (GamePlan enhancements)
