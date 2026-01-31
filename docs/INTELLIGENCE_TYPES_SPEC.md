# Intelligence Types Specification

**Version:** v1.0
**Date:** January 31, 2026
**Source:** Extracted from Jenny's W001-W093 coaching sessions

---

## Overview

These intelligence types define the algorithms and formulas used by the IvyLevel agents. They are based on real coaching patterns from 93 coaching sessions with 11 students.

---

## TYPE-085: Rubric Scoring Engine

### Purpose
Calculate Jenny's 5-dimension rubric scores from student profile data.

### Dimensions (0-10 each, total /50)

#### 1. ACADEMICS (Weight: 1.5)

```python
def score_academics(profile):
    score = 3  # Base score

    # GPA
    gpa = profile.get('gpa', 0)
    if gpa >= 3.9:
        score += 2
    elif gpa >= 3.7:
        score += 1

    # AP/IB Courses
    ap_count = profile.get('ap_count', 0)
    if ap_count >= 8:
        score += 2
    elif ap_count >= 5:
        score += 1

    # Test Scores
    sat = profile.get('sat_total', 0)
    act = profile.get('act_total', 0)
    if sat >= 1500 or act >= 34:
        score += 2
    elif sat >= 1400 or act >= 32:
        score += 1

    return min(10, score)
```

#### 2. LEADERSHIP (Weight: 1.3)

```python
def score_leadership(profile):
    score = 1  # Base score

    # Check for founder status
    if has_founder_role(profile):
        score += 3

    # Check for president/captain
    elif has_president_captain(profile):
        score += 2

    # Check for VP/officer
    elif has_officer_role(profile):
        score += 1

    # Multi-year commitment (2+ years)
    if has_multiyear_leadership(profile):
        score += 2

    # Scope: national > regional > school
    if has_national_scope(profile):
        score += 3
    elif has_regional_scope(profile):
        score += 2
    else:
        score += 1  # School level

    return min(10, score)
```

#### 3. SERVICE (Weight: 0.9)

```python
def score_service(profile):
    score = 1  # Base score

    # Hours
    hours = profile.get('service_hours', 0)
    if hours >= 100:
        score += 3
    elif hours >= 50:
        score += 2

    # Consistency (2+ years)
    if has_consistent_service(profile):
        score += 2

    # Documented impact
    if has_documented_impact(profile):
        score += 2

    # Leadership in service
    if has_service_leadership(profile):
        score += 1

    return min(10, score)
```

#### 4. ARTIFACTS (Weight: 1.2)

```python
def score_artifacts(profile):
    score = 1  # Base score

    # Published/deployed project
    if has_published_project(profile):
        score += 3

    # Complex project (app, research, film)
    if has_complex_project(profile):
        score += 2

    # Multiple artifacts
    artifact_count = count_artifacts(profile)
    score += min(2, artifact_count - 1)

    # External validation (users, citations)
    if has_external_validation(profile):
        score += 2

    return min(10, score)
```

#### 5. RECOGNITION (Weight: 1.4)

```python
def score_recognition(profile):
    score = 0  # Base 0 - awards must be earned

    # National/international award
    if has_national_award(profile):
        score += 4

    # Regional award
    elif has_regional_award(profile):
        score += 2

    # School award only
    elif has_school_award(profile):
        score += 1

    # Competition finalist
    if is_competition_finalist(profile):
        score += 2

    # Multiple awards
    award_count = count_awards(profile)
    score += min(3, award_count - 1)

    return min(10, score)
```

### Output Schema

```python
class Rubric5DimensionOutput(BaseModel):
    total_score: int  # 0-50
    academics: DimensionScore
    leadership: DimensionScore
    service: DimensionScore
    artifacts: DimensionScore
    recognition: DimensionScore
    data_completeness: float  # 0-1.0
    scoring_confidence: float  # 0-1.0

class DimensionScore(BaseModel):
    dimension: str
    raw_score: int  # 0-10
    evidence: List[str]  # What contributed
    gaps: List[str]  # What's missing
    confidence: float  # 0-1.0
```

### Baseline Example (Huda W001)

```
Total: 14/50
- Academics: 5/10 (GPA 4.3 weighted, 11/18 APs)
- Leadership: 2/10 (P0 gap - largest upside)
- Service: 2/10
- Artifacts: 4/10
- Recognition: 1/10 (P0 gap - largest upside)
```

---

## TYPE-086: Gap Priority Analyzer

### Purpose
Categorize gaps by priority using weighted formula for actionable planning.

### Formula

```python
priority_score = gap_size * dimension_weight * urgency_multiplier

# Dimension Weights
DIMENSION_WEIGHTS = {
    'academics': 1.5,
    'recognition': 1.4,
    'leadership': 1.3,
    'artifacts': 1.2,
    'service': 0.9,
}

# Urgency Multipliers (by grade)
URGENCY_MULTIPLIERS = {
    12: 1.5,  # Senior - very urgent
    11: 1.3,  # Junior - urgent
    10: 1.1,  # Sophomore - moderate
    9: 1.0,   # Freshman - normal
}

# Priority Thresholds
def categorize_priority(score):
    if score >= 8:
        return 'P0'  # Critical - address immediately
    elif score >= 5:
        return 'P1'  # High - address in 8 weeks
    elif score >= 2:
        return 'P2'  # Medium - address this semester
    else:
        return 'P3'  # Low - nice to have
```

### Gap Closing Actions

```python
GAP_CLOSING_ACTIONS = {
    'academics': {
        'low': [  # score < 5
            'Raise GPA to 3.7+ through focused study',
            'Enroll in 2-3 AP/IB courses next year',
            'Take SAT/ACT prep, target 1450+',
        ],
        'medium': [  # score 5-7
            'Push GPA to 3.9+',
            'Add 2-3 more AP/IB courses to reach 8+',
            'Retake SAT/ACT if below 1500',
        ],
    },
    'leadership': {
        'low': [  # score < 3
            'Join 2-3 clubs aligned with interests',
            'Run for officer position (VP/Secretary)',
            'Found new club if existing options don\'t fit',
        ],
        'medium': [  # score 3-5
            'Run for President/Captain role',
            'Expand to regional/state-level leadership',
            'Commit to multi-year leadership (2+ years)',
        ],
    },
    'service': {
        'low': [  # score < 3
            'Start consistent volunteer work (4-6 hrs/month)',
            'Commit to 2+ year service plan',
            'Track hours and impact metrics',
        ],
        'medium': [  # score 3-5
            'Increase to 100+ total hours',
            'Take leadership role in service org',
            'Document impact with case studies',
        ],
    },
    'artifacts': {
        'low': [  # score < 3
            'Start building 1-2 tangible projects',
            'STEM: build app/website, conduct research',
            'Humanities: publish articles, create media',
        ],
        'medium': [  # score 3-5
            'Publish/deploy your project',
            'Add complexity: advanced features',
            'Get external validation: users, citations',
        ],
    },
    'recognition': {
        'low': [  # score < 2
            'Identify 3-5 relevant competitions',
            'Apply: NCWIT, Scholastic, Congressional App',
            'Enter subject-specific competitions',
        ],
        'medium': [  # score 2-4
            'Target regional and national competitions',
            'Submit to prestigious awards (ISEF, National Merit)',
            'Aim for finalist/semi-finalist placements',
        ],
    },
}
```

### Time Estimates

```python
TIME_TO_CLOSE_GAP = {
    'academics': 52,    # Full academic year for GPA improvement
    'leadership': 16,   # 1 semester for leadership role
    'service': 24,      # 6 months for consistent record
    'artifacts': 12,    # 3 months to build and deploy
    'recognition': 8,   # 2 months to apply (results take longer)
}

def estimate_weeks(dimension, gap_size):
    base_weeks = TIME_TO_CLOSE_GAP[dimension]
    return ceil(base_weeks * (gap_size / 5))
```

### Output Schema

```python
class GapAnalysisOutput(BaseModel):
    total_gaps: int
    p0_gaps: List[Gap]
    p1_gaps: List[Gap]
    p2_gaps: List[Gap]
    p3_gaps: List[Gap]
    overall_gap_score: float  # 0-100 (100 = no gaps)
    quick_wins: List[Gap]  # High impact, <8 weeks
    rubric_baseline: str  # e.g., "14/50"
    rubric_potential: str  # e.g., "35/50 with focused gap closing"

class Gap(BaseModel):
    dimension: str
    gap_title: str
    current_state: str
    target_state: str
    gap_size: int  # 0-10
    priority: Literal['P0', 'P1', 'P2', 'P3']
    priority_score: float
    closing_actions: List[str]
    estimated_weeks: int
    impact_on_score: int
```

---

## TYPE-083: Potential Indicator Extraction

### Purpose
Detect hidden strengths and untapped opportunities that aren't immediately obvious.

### Categories

#### 1. Hidden Strengths
Skills mentioned in passing but not showcased in activities.

```python
STRENGTH_KEYWORDS = [
    'coding', 'programming', 'research', 'writing', 'design',
    'leadership', 'public speaking', 'teaching', 'organizing',
    'creative', 'analytical', 'data', 'art', 'music',
]

def detect_hidden_strengths(profile):
    strengths = []
    for keyword in STRENGTH_KEYWORDS:
        if keyword_in_profile(profile, keyword):
            if not keyword_in_activities(profile, keyword):
                strengths.append({
                    'indicator_type': 'hidden_strength',
                    'title': f'{keyword} skill mentioned but not showcased',
                    'activation_potential': 7,
                    'activation_actions': [
                        f'Create project showcasing {keyword}',
                        f'Join activity using {keyword}',
                        f'Enter competition in {keyword}',
                    ],
                    'estimated_weeks': 8,
                })
    return strengths
```

#### 2. Untapped Opportunities
Natural extensions of current activities.

```python
OPPORTUNITY_PATTERNS = {
    'research': [
        'Submit research to journal',
        'Present at science fair',
        'Apply to research competitions',
    ],
    'service': [
        'Register as 501(c)(3) nonprofit',
        'Scale program to other schools',
        'Document impact metrics',
    ],
    'coding': [
        'Publish app to App Store/Play Store',
        'Open source on GitHub',
        'Enter hackathon with project',
    ],
}
```

#### 3. Latent Potential Signals
Growth mindset and initiative markers.

```python
GROWTH_SIGNALS = [
    'curious', 'self-taught', 'independent', 'initiative',
    'proactive', 'founded', 'created', 'built', 'taught myself',
    'explored', 'discovered', 'passionate',
]
```

### Output Schema

```python
class PotentialIndicatorOutput(BaseModel):
    total_indicators: int
    hidden_strengths: List[PotentialIndicator]
    untapped_opportunities: List[PotentialIndicator]
    latent_potential_signals: List[PotentialIndicator]
    highest_potential_activations: List[PotentialIndicator]  # Top 5
    potential_ivyscore_boost: int

class PotentialIndicator(BaseModel):
    indicator_type: Literal['hidden_strength', 'untapped_opportunity', 'latent_potential']
    title: str
    evidence: List[str]
    activation_potential: int  # 0-10
    activation_actions: List[str]
    estimated_weeks_to_activate: int
```

---

## TYPE-001: Game Plan Synthesis

### Purpose
Synthesize assessment data into personalized strategic roadmap.

### Identity Fusion Formula

```
IDENTITY + APTITUDE + PASSION + SERVICE = NARRATIVE

Identity: "Who you are" (cultural background, lived experience, unique perspective)
Aptitude: "What you're good at" (academic strengths, skill sets)
Passion: "What energizes you" (deep interests, projects you lose track of time on)
Service: "How you help others" (teaching, mentoring, community impact)

Narrative = Fusion of all 4 → Unique positioning
```

**Examples:**
- "Film × CS → Digital Storyteller"
- "AI × Ethics → Responsible Tech Builder"
- "Business × Social Impact → Social Entrepreneur"

### Strategic Target Detection

Hidden dream schools with higher acceptance rates than obvious choices.

```python
STRATEGIC_TARGET_PATTERNS = {
    'Film × CS': 'USC School of Cinematic Arts (Games) - 15% acceptance',
    'AI × Ethics': 'Stanford HAI (Human-Centered AI) - 12% acceptance',
    'Business × Tech': 'MIT Sloan (Management + Technology) - 18% acceptance',
    'Music × Tech': 'Berklee + MIT dual degree - 20% acceptance',
}
```

### Rubric Priority Sequencing

Map gaps to quarters based on priority.

```python
def sequence_gaps_to_quarters(gaps):
    """
    P0 gaps → Q1-Q2 (address immediately)
    P1 gaps → Q2-Q3 (building phase)
    P2 gaps → Q3-Q4 (polish phase)
    """
    sequenced = []
    for gap in gaps:
        if gap.priority == 'P0':
            quarter = 'Q1' if gap.current_score < 3 else 'Q2'
        elif gap.priority == 'P1':
            quarter = 'Q2-Q3'
        else:
            quarter = 'Q3-Q4'

        sequenced.append({
            **gap,
            'quarter_assignment': quarter,
        })
    return sequenced
```

### Convergence Paths (Undecided Students)

For students with multiple interests that could be separate paths.

```python
def detect_convergence_needs(profile):
    """
    Check if student has multiple interests that could be separate paths.
    """
    interests = profile.get('passion_areas', '')
    has_multiple = '×' in interests or ' and ' in interests or ',' in interests
    return has_multiple

def generate_convergence_paths(interests):
    """
    Generate parallel paths that can converge over time.
    """
    paths = interests.split('×') if '×' in interests else interests.split(' and ')

    return [
        {
            'path_name': f'{path.strip()} Path',
            'feasibility_score': 7.5,
            'rubric_alignment': 8.0,
            'convergence_opportunities': find_convergence_activities(paths),
            'unique_activities': find_path_specific_activities(path),
            'recommended_ratio': '60% / 40%' if i == 0 else '40% / 60%',
        }
        for i, path in enumerate(paths[:2])
    ]
```

### Narrative Coherence Score

Measure how well activities align with identity.

```python
def calculate_narrative_coherence(target_profile, activities):
    """
    Calculate 0-100 score of activity-identity alignment.
    """
    identity_keywords = extract_keywords(target_profile.identity_fusion)

    aligned_count = 0
    for activity in activities:
        activity_text = f"{activity.name} {activity.description}".lower()
        if any(kw in activity_text for kw in identity_keywords):
            aligned_count += 1

    coherence = (aligned_count / len(activities)) * 100 if activities else 0
    return min(100, coherence)
```

### Output Schema

```python
class TargetProfile(BaseModel):
    identity_fusion: str
    narrative_thread: str
    unique_positioning: List[str]  # 3-5 differentiators
    strategic_target: str
    strategic_rationale: str

class RubricPriority(BaseModel):
    dimension: str
    current_score: int
    target_score: int
    gap: int
    priority: Literal['P0', 'P1', 'P2']
    quarter_assignment: str
    recommended_actions: List[str]

class ConvergencePath(BaseModel):
    path_name: str
    feasibility_score: float
    rubric_alignment: float
    convergence_opportunities: List[str]
    unique_activities: List[str]
    recommended_ratio: str

class NarrativeCoherence(BaseModel):
    score: int  # 0-100
    aligned_activities: int
    total_activities: int
    identity_keywords: List[str]
    misaligned_activities: List[str]
```

---

## TYPE-081: IvyScore Calculation (Already Implemented)

### Current Implementation

Located in `backend/tools/scoring/engine.py`

Uses 4-category system:
- Aptitude (30%)
- Passion (35%)
- Community (25%)
- Narrative (10%)

With 7-layer calculation:
1. Attribute Normalization (0.0-1.0)
2. Category Scores (0-100%)
3. Ivy+ Ready Score (0-100)
4. SFFA Rubric (1-6 scale)
5. Base Probability (Sigmoid)
6. Context Multipliers (Chetty 2023)
7. Final Probability (Capped 95%)

---

## Implementation Priority

### Phase 1 (Week 1-2): Assessment Enhancements

1. **TYPE-085** - Create `backend/tools/scoring/rubric_5d.py`
2. **TYPE-086** - Create `backend/tools/scoring/gap_analyzer.py`
3. **TYPE-083** - Create `backend/tools/scoring/potential_detector.py`
4. Update `AssessmentOutput` schema
5. Test with Huda profile (baseline ~14/50)

### Phase 2 (Week 2-3): GamePlan Enhancements

1. **TYPE-001** - Target Profile synthesis
2. Rubric Priority Sequencing
3. Convergence Paths
4. Narrative Coherence

### Phase 3 (Week 3-4): Integration

1. Connect Assessment → GamePlan data flow
2. Update API responses
3. Update frontend displays
