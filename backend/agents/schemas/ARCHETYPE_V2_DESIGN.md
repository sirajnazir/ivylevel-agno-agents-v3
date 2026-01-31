# Multi-Dimensional Archetype System V2

## Overview

The V1 archetype system was **one-dimensional**, categorizing students purely by domain interest:
- SCHOLAR, RESEARCHER, LEADER, etc.

This V2 system is **multi-dimensional**, capturing the full complexity of a student:

```
ARCHETYPE = f(
    Domain Focus,          # WHAT they do
    Context,              # WHERE/WHO they are
    Execution Style,      # HOW they operate
    Challenge Profile,    # WHAT obstacles they face
    Timeline Position,    # WHEN in their journey
    Strengths/Weaknesses  # Internal resources
)
```

## The Six Dimensions

### Dimension 1: Domain Focus (The "What")

What intellectual/activity domain defines this student?

| Category | Domains |
|----------|---------|
| STEM | `stem_researcher`, `tech_builder`, `scientific_mind`, `engineering_maker` |
| Humanities | `humanities_scholar`, `social_scientist`, `policy_wonk` |
| Arts | `creative_artist`, `performing_artist`, `digital_creator` |
| Impact | `social_entrepreneur`, `community_builder`, `advocate_activist` |
| Athletics | `recruited_athlete`, `athletic_scholar` |
| Business | `business_founder`, `business_leader` |
| Emerging | `explorer`, `multi_hyphenate` |

### Dimension 2: Context (The "Where/Who")

What personal, school, and socioeconomic context shapes opportunities?

**Gender:**
- `male`, `female`, `non_binary`, `prefer_not_to_say`
- Used for gender-in-field advantage detection (e.g., women in STEM)

**Ethnicity (aligned with Common App):**
- URM (Underrepresented): `african_american`, `hispanic_latino`, `native_american`, `pacific_islander`
- Non-URM: `asian_east`, `asian_south`, `asian_southeast`, `white`, `middle_eastern`
- Other: `multiracial`, `other`, `prefer_not_to_say`

**School Types:**
- `elite_private`: Prep schools with extensive resources
- `competitive_public`: Magnet/specialized public schools
- `suburban_public`, `urban_public`, `rural_public`
- `international`, `homeschool`, `charter`

**Socioeconomic:**
- `high_resource`: Full access to tutors, programs, counselors
- `medium_resource`: Some limitations
- `low_resource`: Significant constraints
- `under_resourced`: Major barriers

**Family Context:**
- `legacy_elite`: Parents attended elite schools
- `college_educated`: Standard college family
- `first_generation`: First in family to attend college
- `immigrant_family`: Recent immigration background

**Diversity Hooks (Auto-Detected):**
- `is_urm`: Underrepresented minority status
- `is_orm`: Overrepresented minority (Asian in STEM contexts)
- `is_gender_minority_in_field`: Woman in STEM, man in nursing, etc.
- `diversity_angles`: List of narrative angles (e.g., "woman in tech/STEM", "first-gen")

### Dimension 3: Execution Style (The "How")

How does this student operate and execute tasks?

| Style | Description |
|-------|-------------|
| `type_a_achiever` | Highly organized, competitive, metrics-driven |
| `perfectionist` | High standards, quality-obsessed, may freeze |
| `adhd_hyperfocus` | Bursts of intense focus, needs variety |
| `creative_chaotic` | Non-linear process, unconventional approach |
| `anxiety_driven` | Stress-motivated, needs reassurance |
| `balanced_executor` | Flexible, pragmatic |
| `lone_wolf` / `team_dependent` | Work style preference |
| `sprinter` / `marathoner` | Energy pattern |

### Dimension 4: Challenge Profile (The "Obstacles")

What challenges does this student face?

**Academic:**
- `gpa_recovery`: Needs to explain/recover GPA
- `test_score_gap`: Scores don't match performance
- `rigor_gap`: Limited AP/honors access

**Activity:**
- `late_bloomer`: Started activities late
- `depth_not_breadth`: Few activities but deep
- `breadth_not_depth`: Spread thin

**Personal:**
- `health_interruption`, `family_circumstances`
- `financial_constraints`, `school_change`

**Timeline:**
- `senior_crunch`: Little time left
- `junior_catchup`: Behind peers

### Dimension 5: Timeline Position (The "When")

Where is this student in their journey?

| Position | Description |
|----------|-------------|
| `early_hs` | Freshman/Sophomore - exploration phase |
| `mid_hs` | Junior - building phase |
| `late_hs` | Senior - execution phase |

**Application Phase:**
- `planning`: 1+ years out
- `building`: Actively building profile
- `polishing`: Finalizing before apps
- `applying`: In application season

### Dimension 6: Strengths & Weaknesses

Internal resource map for coaching.

**Strengths:** `analytical`, `creative`, `leadership`, `resilience`, `curiosity`
**Weaknesses:** `procrastination`, `perfectionism_paralysis`, `test_anxiety`, `impostor_syndrome`

## Composite Code

Every student gets a composite code:

```
STEM-RESEARCHER.TYPE-A-ACHIEVER.MID-HS.HIGH-RESOURCE
```

This code uniquely identifies their multi-dimensional archetype and maps to:
1. Specific coaching frameworks
2. Execution systems (Type A vs ADHD-friendly)
3. Timeline-appropriate strategies
4. Context-sensitive recommendations

## Strategy Matching

Each archetype maps to strategy families:

| Execution Style | Strategy Family |
|-----------------|-----------------|
| `type_a_achiever` | `TYPE_A_EXECUTION` |
| `adhd_hyperfocus` | `ADHD_FRIENDLY` |
| `perfectionist` | `PERFECTIONIST_GUARDRAILS` |
| `anxiety_driven` | `ANXIETY_CALMING` |

| Timeline | Strategy Family |
|----------|-----------------|
| `late_hs` | `SENIOR_SPRINT` |
| `mid_hs` | `JUNIOR_FOUNDATION` |
| `early_hs` | `SOPHOMORE_EXPLORATION` |

| Context | Strategy Family |
|---------|-----------------|
| `first_generation` | `FIRST_GEN_NAVIGATION` |
| `low_resource` | `UNDER_RESOURCED_SCRAPPY` |

## Usage

### Basic Usage

```python
from backend.agents.schemas import synthesize_archetype, get_strategies_for_profile

# Get multi-dimensional archetype
archetype = synthesize_archetype(db_profile)
print(archetype.composite_code)  # "STEM-RESEARCHER.TYPE-A.MID-HS.HIGH-RESOURCE"
print(archetype.domain.primary_domain)  # DomainFocus.STEM_RESEARCHER
print(archetype.execution.primary_style)  # ExecutionArchetype.TYPE_A_ACHIEVER

# Get matched strategies
strategies = get_strategies_for_profile(db_profile)
for s in strategies:
    print(f"{s.strategy_family}: {s.priority}")
    print(f"  EC: {s.ec_strategy}")
    print(f"  Essay: {s.essay_strategy}")
```

### Demographic-Aware Detection

```python
from backend.agents.schemas import synthesize_archetype

profile = {
    'grade': 11,
    'intended_major': 'Computer Science',
    'demographics': {
        'gender': 'female',
        'ethnicity': 'hispanic',
        'first_gen': True,
    },
    'activities': [
        {'name': 'Women in STEM Club', 'role': 'President', 'years': 2},
    ]
}

archetype = synthesize_archetype(profile)

# Demographic context extracted
print(archetype.context.gender)           # Gender.FEMALE
print(archetype.context.ethnicity)        # Ethnicity.HISPANIC_LATINO
print(archetype.context.is_urm)           # True
print(archetype.context.is_first_gen)     # True

# Gender-in-field advantage detected
print(archetype.context.is_gender_minority_in_field)  # True
print(archetype.context.gender_field_advantage)       # "Woman in STEM - actively recruited"

# Diversity narrative angles
print(archetype.context.diversity_angles)
# ['woman in tech/STEM', 'Latino/Hispanic heritage', 'first-generation college student']
```

### Framework Matching

```python
from backend.agents.schemas import FrameworkRegistry, synthesize_archetype

archetype = synthesize_archetype(profile)
frameworks = FrameworkRegistry.match(archetype)

for f in frameworks:
    print(f"{f['name']}: {f['description']}")
    for tactic in f['tactics']:
        print(f"  - {tactic}")
```

### Legacy Compatibility

```python
from backend.agents.schemas import upgrade_legacy_archetype

# Convert old "SCHOLAR" to new multi-dimensional
multi_arch = upgrade_legacy_archetype("SCHOLAR", profile)
print(multi_arch.composite_code)
```

## Adding New Frameworks

Register frameworks in `archetype_engine.py`:

```python
FrameworkRegistry.register("my_framework", {
    "id": "my_framework",
    "name": "My Custom Framework",
    "category": "execution",
    "description": "Description here",
    "applicable_to": {
        "execution_styles": ["type_a_achiever", "perfectionist"],
        "timelines": ["mid_hs", "late_hs"],
    },
    "tactics": [
        "Step 1",
        "Step 2",
    ],
})
```

## Benefits Over V1

1. **Personalized Execution Systems**: ADHD student gets different coaching than Type A
2. **Context-Aware**: First-gen student gets navigation help; low-resource gets free alternatives
3. **Timeline-Specific**: Senior gets sprint protocol; Sophomore gets exploration strategy
4. **Challenge-Specific**: GPA recovery narrative; late-bloomer acceleration
5. **Framework Matching**: Proven frameworks matched to archetype dimensions
6. **Extensible**: Add new dimensions or frameworks without breaking existing code

## File Structure

```
backend/agents/schemas/
├── archetype_v2.py          # Type definitions and abstract base
├── archetype_engine.py      # Implementation and framework registry
├── ARCHETYPE_V2_DESIGN.md   # This documentation
└── __init__.py              # Exports
```

## Future Extensions

1. **More Frameworks**: Populate from coaching intelligence (80 frameworks)
2. **ML-Enhanced Detection**: Use embeddings for better pattern matching
3. **Outcome Tracking**: Connect archetypes to admission outcomes
4. **Dynamic Adaptation**: Adjust archetype as student progresses
