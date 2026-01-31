# Narrative Synthesis Framework - Human Coaching → Digital Experience

**Date**: January 31, 2026
**Source**: Real coaching methodology from IvyLevel coaches
**Purpose**: Standardize the narrative synthesis algorithm for digital self-serve experience

---

## Executive Summary

The human coaching formula for narrative synthesis is:

```
IDENTITY + APTITUDE + PASSION + SERVICE = NARRATIVE
```

This creates **unique positioning** through pillar fusion (e.g., "Film × CS → Digital Storyteller").

**Key Enhancements for Digital Experience**:
1. **Multi-path output**: Generate 2-3 narrative alternatives (not just one)
2. **Undecided student handling**: Convergence paths for exploring students
3. **Data collection**: Ensure passion/community data even for students without activities

---

## 1. THE CORE FORMULA

### Four Pillars → Narrative Fusion

| Pillar | Definition | Question to Answer |
|--------|------------|-------------------|
| **IDENTITY** | "Who you are" | Cultural background, lived experience, unique perspective |
| **APTITUDE** | "What you're good at" | Academic strengths, skill sets, demonstrated abilities |
| **PASSION** | "What energizes you" | Deep interests, projects you lose track of time on |
| **SERVICE** | "How you help others" | Teaching, mentoring, community impact, causes |

### Fusion Formula

```
Narrative = Fusion(Identity, Aptitude, Passion, Service)

Examples:
- "Film × CS → Digital Storyteller"
- "Medicine × AI × Ethics → Healthcare AI Ethicist"
- "Music × Math → Computational Musicologist"
- "Immigration Story × Law × Community → Immigration Rights Advocate"
```

### The "×" Operator

The fusion uses multiplication (×) not addition (+) because:
- It creates **intersection**, not accumulation
- The unique value is WHERE the pillars overlap
- A student strong in 2-3 pillars with clear intersection > 4 weak pillars

---

## 2. STUDENT CATEGORIZATION

### Dimension 1: By Grade

| Category | Grade | Data Availability | Strategy |
|----------|-------|-------------------|----------|
| **Underclassmen** | 9-10 | Sparse activities, high potential | Focus on PASSION discovery, not ACTIVITY validation |
| **Upperclassmen** | 11-12 | Rich activity data | Validate NARRATIVE from existing activities |

### Dimension 2: By Major Decision Status

| Status | Description | Output Strategy |
|--------|-------------|-----------------|
| **Decided** | Clear on intended major | Generate 1-2 narratives aligned to major |
| **Exploring** | Undecided, multi-interest | Generate 2-3 **convergence paths** that can merge |
| **Pivoting** | Changed mind, needs reframe | Generate narrative that bridges old → new direction |

### Decision Matrix

```
                    DECIDED              EXPLORING           PIVOTING
UNDERCLASSMEN    1-2 narratives       2-3 convergence     1 bridge narrative
                 (exploratory)        paths (wide)        + 1-2 new directions

UPPERCLASSMEN    1 narrative          2 convergence       1 bridge narrative
                 (validated)          paths (narrow)      (urgent reframe)
```

---

## 3. MULTI-PATH CONVERGENCE (Undecided Students)

### The Problem
Students who are undecided shouldn't be forced into one narrative too early.

### The Solution: Convergence Paths

Generate 2-3 parallel narrative paths that:
1. Each path is **independently coherent**
2. Paths share **convergence opportunities** (activities that serve both)
3. Over time, paths **naturally converge** as student gains clarity

### Example: CS + Film Student

```yaml
Path A: Computer Science Focus
  pillars_fusion: "CS × Film → Technical Artist"
  activities:
    - Game development projects
    - Graphics programming
    - VR/AR research
  recommended_ratio: "70% CS / 30% Film in Q1-Q2"

Path B: Film Focus
  pillars_fusion: "Film × CS → Digital Storyteller"
  activities:
    - Documentary filmmaking
    - Animation projects
    - Film studies
  recommended_ratio: "30% CS / 70% Film in Q1-Q2"

Convergence Opportunities (serve BOTH paths):
  - Interactive media projects
  - Game narrative design
  - VFX/CGI work
  - USC Games application
```

### Ratio Allocation

```
Q1-Q2: 60/40 split (explore both)
Q3-Q4: 70/30 split (lean toward emerging preference)
Q5+:   85/15 split (commit with hedge)
```

---

## 4. OUTPUT STRUCTURE

### NarrativeSynthesisResult

```typescript
interface NarrativeSynthesisResult {
  // Primary narrative (always generated)
  primary_narrative: {
    pillars_fusion: string;       // "Film × CS → Digital Storyteller"
    narrative_thread: string;     // Core story connecting all activities
    unique_positioning: string[]; // 3-5 differentiators
    strategic_target: string;     // Hidden dream school (e.g., "USC Games 15%")
    strategic_rationale: string;  // Why this positioning works
  };

  // Alternative narratives (2-3 total including primary)
  alternative_narratives: {
    pillars_fusion: string;
    narrative_thread: string;
    fit_score: number;            // 0-100 how well this fits student
    trade_offs: string[];         // What's sacrificed vs primary
  }[];

  // Convergence paths (for undecided students only)
  convergence_paths: {
    path_name: string;            // "Computer Science Path"
    feasibility_score: number;    // 0-10
    rubric_alignment: number;     // 0-10
    convergence_opportunities: string[];
    unique_activities: string[];
    recommended_ratio: string;    // "60% / 40%"
  }[];

  // Quality metrics
  narrative_coherence_score: number;  // 0-100
  pillar_strength_scores: {
    identity: number;    // 0-10
    aptitude: number;    // 0-10
    passion: number;     // 0-10
    service: number;     // 0-10
  };

  // Metadata
  decision_status: 'decided' | 'exploring' | 'pivoting';
  grade_category: 'underclassmen' | 'upperclassmen';
  confidence: number;             // 0-1
}
```

---

## 5. DATA REQUIREMENTS

### Critical Gap Identified

**Problem**: 9th grader with no activities shows:
- Passion Score: 0 ❌
- Community Score: 0 ❌

**Reality**: They still HAVE passions and community interests - we just haven't asked!

### Required Input Data

| Data Point | Source | Required | Notes |
|------------|--------|----------|-------|
| **IDENTITY** | | | |
| Cultural background | Assessment Frame | ✅ | First-gen, immigrant, etc. |
| Lived experiences | Assessment Frame | ✅ | Unique circumstances |
| Family context | Assessment Frame | ✅ | Constraints, resources |
| **APTITUDE** | | | |
| GPA / Test scores | Assessment Frame | ✅ | Academic baseline |
| Strong subjects | Assessment Frame | ✅ | "What classes energize you?" |
| Skills demonstrated | Assessment Frame | ⚠️ | May be sparse for underclassmen |
| **PASSION** | | | |
| Interests stated | Assessment Frame | ✅ | **CRITICAL: Ask directly!** |
| Time spent on (outside school) | Assessment Frame | ✅ | What they do for fun |
| "What could you talk about for hours?" | Assessment Frame | ✅ | Deep passion indicator |
| **SERVICE** | | | |
| Causes cared about | Assessment Frame | ✅ | **CRITICAL: Ask directly!** |
| Who they want to help | Assessment Frame | ✅ | Target population |
| Community involvement | Assessment Frame | ⚠️ | May not have formal service yet |

### Questions to Add (if not present)

```
PASSION (even without activities):
- "What topics could you talk about for hours?"
- "What do you spend time on outside of school?"
- "What YouTube channels / podcasts / content do you consume?"
- "If you had unlimited time and resources, what would you build/create?"

SERVICE (even without formal volunteering):
- "What problems in the world frustrate you?"
- "Who would you want to help if you could?"
- "What causes do you care about?"
- "Have you ever taught or helped someone learn something?"
```

---

## 6. MAPPING TO DATABASE

### profiles Table Columns

| Column | Type | Maps To | Status |
|--------|------|---------|--------|
| `identity_synthesis` | JSONB | Full synthesis output | ✅ Exists |
| `four_pillars` | JSONB | Pillar data | ✅ Exists |
| `narrative_dna` | TEXT | Primary narrative thread | ✅ Exists |
| `brand_statement` | TEXT | Public-facing summary | ✅ Exists |
| `spike` | TEXT | Core strength | ✅ Exists |
| `alternative_narratives` | JSONB | 2-3 alternatives | ❌ **NEEDS ADD** |
| `convergence_paths` | JSONB | Multi-path strategy | ❌ **NEEDS ADD** |
| `decision_status` | ENUM | decided/exploring/pivoting | ❌ **NEEDS ADD** |
| `pillar_strength_scores` | JSONB | Individual pillar scores | ⚠️ Partial |

### Proposed Schema Additions

```sql
-- Add new columns for multi-narrative support
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  alternative_narratives JSONB DEFAULT '[]'::jsonb;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  convergence_paths JSONB DEFAULT '[]'::jsonb;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  decision_status TEXT DEFAULT 'exploring'
  CHECK (decision_status IN ('decided', 'exploring', 'pivoting'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  pillar_strength_scores JSONB DEFAULT '{
    "identity": 0,
    "aptitude": 0,
    "passion": 0,
    "service": 0
  }'::jsonb;
```

---

## 7. ASSESSMENT FRAME DATA MAPPING

### Frame → Pillar Mapping

| Assessment Frame | Data Collected | Maps to Pillar |
|-----------------|----------------|----------------|
| **Frame 1: Basics** | Name, grade, school | IDENTITY (context) |
| **Frame 2: Academics** | GPA, SAT, courses | APTITUDE |
| **Frame 3: Activities** | ECs, leadership | APTITUDE + PASSION |
| **Frame 4: Awards** | Honors, recognition | APTITUDE (validation) |
| **Frame 5: Interests** | Stated interests | PASSION |
| **Frame 6: Goals** | Intended major, colleges | PASSION + IDENTITY |
| **Frame 7: Service** | Community work | SERVICE |
| **Frame 8: Identity** | Background, story | IDENTITY |

### Data Gaps to Fill

For underclassmen without activities/awards, ensure we capture:

```typescript
// Questions that should be in assessment frames
const passionQuestions = [
  "What subjects/topics genuinely excite you?",
  "What do you do in your free time?",
  "What could you spend hours learning about?",
  "What problems interest you?",
];

const serviceQuestions = [
  "What causes matter to you?",
  "Who would you want to help?",
  "Have you ever tutored or taught someone?",
  "What change would you want to see in the world?",
];
```

---

## 8. SCORING ADJUSTMENTS

### Current Problem

```
9th grader with no activities:
- Aptitude: 75 (has GPA/tests)
- Passion: 0 ← WRONG!
- Community: 0 ← WRONG!
- Identity: 25
```

### Corrected Approach

**Passion Score** should consider:
1. Stated interests (from questions) → 40% weight
2. Demonstrated activities → 30% weight
3. Depth indicators (specificity, knowledge) → 30% weight

**Community Score** should consider:
1. Stated causes/values (from questions) → 40% weight
2. Formal service hours → 30% weight
3. Informal helping (tutoring, mentoring) → 30% weight

### Adjusted Formula

```typescript
function calculatePassionScore(profile: StudentProfile): number {
  const statedInterestScore = scoreStatedInterests(profile.interests) * 0.4;
  const activityScore = scorePassionActivities(profile.activities) * 0.3;
  const depthScore = scorePassionDepth(profile) * 0.3;

  // Minimum floor for students who've answered interest questions
  const hasStatedInterests = profile.interests && profile.interests.length > 0;
  const floor = hasStatedInterests ? 20 : 0;

  return Math.max(floor, statedInterestScore + activityScore + depthScore);
}

function calculateCommunityScore(profile: StudentProfile): number {
  const statedCausesScore = scoreStatedCauses(profile.causes) * 0.4;
  const formalServiceScore = scoreServiceHours(profile.service_hours) * 0.3;
  const informalHelpingScore = scoreInformalHelping(profile) * 0.3;

  // Minimum floor for students who've answered cause questions
  const hasStatedCauses = profile.causes && profile.causes.length > 0;
  const floor = hasStatedCauses ? 20 : 0;

  return Math.max(floor, statedCausesScore + formalServiceScore + informalHelpingScore);
}
```

---

## 9. NARRATIVE AGENT OUTPUT CHANGES

### Current Output (Single Narrative)

```typescript
{
  brand_statement: "...",
  narrative_dna: "...",
  spike: "...",
  pillars: [...]
}
```

### Enhanced Output (Multi-Narrative)

```typescript
{
  // Primary narrative
  primary: {
    brand_statement: "I'm a digital storyteller combining CS and Film...",
    narrative_dna: "Film × CS → Digital Storyteller",
    pillars_fusion: "Film × CS → Digital Storyteller",
    strategic_target: "USC School of Cinematic Arts (Games)",
    unique_positioning: [
      "Combines technical CS skills with visual storytelling",
      "Focus on interactive media and game narratives",
      "Bilingual perspective brings cultural depth"
    ],
    confidence: 0.85
  },

  // Alternative narratives (for exploration)
  alternatives: [
    {
      brand_statement: "I'm a technical artist pushing the boundaries of VFX...",
      narrative_dna: "CS × Art → Technical Artist",
      fit_score: 0.72,
      trade_offs: ["Less storytelling focus", "More technical emphasis"]
    },
    {
      brand_statement: "I'm a game developer creating meaningful experiences...",
      narrative_dna: "Games × Social Impact → Serious Games Developer",
      fit_score: 0.68,
      trade_offs: ["Narrower field", "Less traditional path"]
    }
  ],

  // For undecided students
  convergence_paths: [
    {
      path_name: "Computer Science Focus",
      recommended_ratio: "70% CS / 30% Film",
      convergence_opportunities: ["Game dev", "VR/AR", "Interactive media"]
    },
    {
      path_name: "Film Focus",
      recommended_ratio: "30% CS / 70% Film",
      convergence_opportunities: ["Documentary", "Animation", "VFX"]
    }
  ],

  // Metadata
  decision_status: "exploring",
  narrative_coherence_score: 78,
  pillar_strength_scores: {
    identity: 7,
    aptitude: 8,
    passion: 9,
    service: 5
  }
}
```

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Data Collection (Assessment Frames)

- [ ] Add passion questions to assessment frames
- [ ] Add service/cause questions to assessment frames
- [ ] Add decision_status question ("How decided are you on your major?")
- [ ] Ensure questions work for underclassmen without activities

### Phase 2: Scoring Adjustments

- [ ] Update passion scoring to include stated interests (not just activities)
- [ ] Update community scoring to include stated causes (not just service hours)
- [ ] Add minimum floor scores for students who've answered questions
- [ ] Test with 9th grader profile to ensure non-zero scores

### Phase 3: Schema Updates

- [ ] Add `alternative_narratives` JSONB column
- [ ] Add `convergence_paths` JSONB column
- [ ] Add `decision_status` column
- [ ] Add `pillar_strength_scores` JSONB column

### Phase 4: Narrative Agent Enhancement

- [ ] Update NarrativeAgent to generate 2-3 narratives
- [ ] Implement convergence path logic for undecided students
- [ ] Add pillar fusion algorithm
- [ ] Calculate narrative coherence score

### Phase 5: Frontend Display

- [ ] Update Assessment card to show primary + alternatives
- [ ] Add "Explore Other Narratives" UI
- [ ] Show convergence paths for undecided students
- [ ] Display pillar strength radar chart

---

## 11. EXAMPLE: Complete Synthesis

### Input Profile

```yaml
name: "Huda"
grade: 11
intended_major: "exploring" # undecided between CS and Design

identity:
  first_gen: true
  background: "South Asian, immigrant family"
  lived_experience: "Navigated two cultures"

aptitude:
  gpa: 3.9
  strong_subjects: ["Math", "Art", "Computer Science"]

passion:
  stated_interests: ["UI/UX Design", "Making technology accessible"]
  activities: ["Coding club", "Art portfolio"]
  "what energizes you": "Creating beautiful, functional interfaces"

service:
  causes: ["Digital accessibility", "Education equity"]
  informal_helping: "Teaches younger siblings tech skills"
```

### Output Narratives

```yaml
primary:
  pillars_fusion: "Design × CS × Accessibility → Inclusive Tech Designer"
  brand_statement: "I'm an inclusive tech designer combining my CS skills with design thinking to make technology accessible to everyone, especially underserved communities like my own."
  strategic_target: "CMU Human-Computer Interaction"
  unique_positioning:
    - "Combines technical CS with visual design"
    - "Lived experience as immigrant brings empathy for accessibility"
    - "Focus on underserved communities"
  confidence: 0.88

alternatives:
  - pillars_fusion: "CS × Social Impact → Tech for Good Developer"
    fit_score: 0.75
    trade_offs: ["Less design focus", "More pure engineering"]

  - pillars_fusion: "Design × Psychology → UX Researcher"
    fit_score: 0.70
    trade_offs: ["Less coding", "More research oriented"]

convergence_paths:
  - path_name: "CS-Heavy Path"
    recommended_ratio: "70% CS / 30% Design"
    opportunities: ["HCI research", "Accessibility APIs", "Design systems"]

  - path_name: "Design-Heavy Path"
    recommended_ratio: "30% CS / 70% Design"
    opportunities: ["UX portfolio", "Design thinking", "User research"]

pillar_strength_scores:
  identity: 8   # Strong immigrant/first-gen story
  aptitude: 8   # Good academics, dual CS+Art
  passion: 9    # Clear passion for accessibility + design
  service: 6    # Informal helping, needs formal service
```

---

## Summary

The key insight from human coaching is that narrative synthesis is not a single output but a **multi-path exploration** that:

1. **Fuses all four pillars** into unique positioning
2. **Generates alternatives** for student/coach to evaluate
3. **Handles undecided students** with convergence paths
4. **Works for underclassmen** by asking about interests, not just activities
5. **Refines over time** through execution agent progress

This framework should be implemented in the NarrativeAgent (`spec_narrative`) while respecting the Agno architecture (constant base class, variable instructions/tools).
