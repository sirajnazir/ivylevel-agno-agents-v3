# IMPLEMENTS: TYPE-001 (Target Profile Synthesis)
# LAYER: Synthesis Tools (Builds on Scoring Primitives)
"""
Target Profile Synthesis Engine

This module implements the strategic target profile synthesis derived from
Jenny's coaching sessions. It combines scoring primitives, archetype data,
and profile information to generate a complete strategic positioning.

ARCHITECTURE PRINCIPLE:
- Uses 5D Rubric, Gap Analysis, Potential Indicators as PRIMITIVES
- Integrates V2 Archetype deeply (context, diversity angles)
- Outputs structured TargetProfile consumed by NarrativeAgent & GamePlanAgent
- Provides QUANTITATIVE scores (coherence, alignment) not just LLM text

PURPOSE:
- Generate identity fusion (algorithmic, not just LLM)
- Calculate narrative coherence score
- Create competitive positioning statement
- Generate convergence paths for undecided students
- Map gaps to quarterly timeline (rubric priority sequencing)

IDENTITY FUSION FORMULA:
    IDENTITY × APTITUDE × PASSION × SERVICE = POSITIONING

    Identity: Who you are (cultural background, lived experience)
    Aptitude: What you're good at (academic strengths, skills)
    Passion: What energizes you (deep interests, projects)
    Service: How you help others (teaching, mentoring, impact)

    Example: "Film × CS × First-Gen Latina → Digital Storyteller bridging cultures"
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum

# Import PRIMITIVES
from backend.tools.scoring.rubric_5d import (
    calculate_5d_rubric,
    Rubric5DOutput,
    DimensionScore,
)
from backend.tools.scoring.gap_analyzer import (
    analyze_gaps,
    GapAnalysisOutput,
    GapDetail,
    PriorityLevel,
)
from backend.tools.scoring.potential_detector import (
    detect_potential_indicators,
    PotentialIndicatorOutput,
)


# =============================================================================
# CONSTANTS
# =============================================================================

# Domain keywords for identity fusion
DOMAIN_LABELS: Dict[str, str] = {
    "STEM_RESEARCHER": "STEM Researcher",
    "TECH_BUILDER": "Tech Builder",
    "SCIENTIFIC_MIND": "Scientific Mind",
    "ENGINEERING_MAKER": "Engineering Maker",
    "HUMANITIES_SCHOLAR": "Humanities Scholar",
    "SOCIAL_SCIENTIST": "Social Scientist",
    "POLICY_WONK": "Policy Advocate",
    "CREATIVE_ARTIST": "Creative Artist",
    "PERFORMING_ARTIST": "Performing Artist",
    "DIGITAL_CREATOR": "Digital Creator",
    "SOCIAL_ENTREPRENEUR": "Social Entrepreneur",
    "COMMUNITY_BUILDER": "Community Builder",
    "ADVOCATE_ACTIVIST": "Advocate",
    "RECRUITED_ATHLETE": "Scholar-Athlete",
    "ATHLETIC_SCHOLAR": "Athletic Scholar",
    "BUSINESS_FOUNDER": "Entrepreneur",
    "BUSINESS_LEADER": "Business Leader",
    "EXPLORER": "Explorer",
    "MULTI_HYPHENATE": "Polymath",
}

# School culture profiles for strategic targeting
SCHOOL_CULTURES: Dict[str, Dict[str, Any]] = {
    "STANFORD": {
        "values": ["entrepreneurship", "innovation", "impact", "storytelling"],
        "narrative_style": "maker_storyteller",
        "favors_domains": ["TECH_BUILDER", "SOCIAL_ENTREPRENEUR", "DIGITAL_CREATOR"],
    },
    "MIT": {
        "values": ["technical_depth", "building", "problem_solving", "collaboration"],
        "narrative_style": "builder_researcher",
        "favors_domains": ["TECH_BUILDER", "ENGINEERING_MAKER", "STEM_RESEARCHER"],
    },
    "HARVARD": {
        "values": ["leadership", "service", "intellectual_curiosity", "diversity"],
        "narrative_style": "leader_scholar",
        "favors_domains": ["COMMUNITY_BUILDER", "POLICY_WONK", "HUMANITIES_SCHOLAR"],
    },
    "YALE": {
        "values": ["humanities", "arts", "leadership", "community"],
        "narrative_style": "humanist_leader",
        "favors_domains": ["HUMANITIES_SCHOLAR", "CREATIVE_ARTIST", "ADVOCATE_ACTIVIST"],
    },
    "PRINCETON": {
        "values": ["scholarship", "service", "tradition", "research"],
        "narrative_style": "scholar_servant",
        "favors_domains": ["STEM_RESEARCHER", "HUMANITIES_SCHOLAR", "COMMUNITY_BUILDER"],
    },
    "CALTECH": {
        "values": ["pure_research", "technical_excellence", "collaboration"],
        "narrative_style": "pure_researcher",
        "favors_domains": ["STEM_RESEARCHER", "SCIENTIFIC_MIND", "ENGINEERING_MAKER"],
    },
}

# Convergence path templates
CONVERGENCE_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "STEM_HUMANITIES": {
        "paths": ["STEM-Research", "Humanities-Writing"],
        "convergence_point": "Science Communication / Policy",
        "example": "Research scientist who communicates to public",
    },
    "TECH_ARTS": {
        "paths": ["Tech-Building", "Creative-Arts"],
        "convergence_point": "Digital Media / Creative Tech",
        "example": "Digital artist using code as medium",
    },
    "BUSINESS_SERVICE": {
        "paths": ["Business-Entrepreneurship", "Community-Service"],
        "convergence_point": "Social Enterprise",
        "example": "Founder of impact-driven venture",
    },
    "SCIENCE_POLICY": {
        "paths": ["Research-Science", "Policy-Advocacy"],
        "convergence_point": "Science Policy / Public Health",
        "example": "Researcher influencing policy decisions",
    },
}


# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class IdentityFusion(BaseModel):
    """Algorithmic identity fusion result"""
    # Core components
    identity_component: str = Field(description="Who you are (cultural, background)")
    aptitude_component: str = Field(description="What you're good at")
    passion_component: str = Field(description="What energizes you")
    service_component: str = Field(description="How you help others")

    # Synthesis
    fusion_statement: str = Field(description="Combined identity fusion statement")
    fusion_formula: str = Field(description="e.g., 'Film × CS × First-Gen → Digital Storyteller'")

    # Diversity integration
    diversity_angles: List[str] = Field(default_factory=list)
    demographic_hooks: List[str] = Field(default_factory=list)


class UniquePositioning(BaseModel):
    """Competitive positioning statement"""
    positioning_statement: str = Field(description="What makes you unique vs. applicant pool")
    differentiators: List[str] = Field(description="Key differentiating factors")
    competitive_advantages: List[str] = Field(description="Hooks that set you apart")
    potential_concerns: List[str] = Field(description="Areas where you might seem 'typical'")


class StrategicTarget(BaseModel):
    """Hidden dream school analysis"""
    recommended_schools: List[str] = Field(description="Schools where narrative plays best")
    school_fit_scores: Dict[str, float] = Field(description="Fit score per school (0-1)")
    primary_target: str = Field(description="Single best-fit school")
    target_rationale: str = Field(description="Why this school fits your profile")


class ActivityAlignment(BaseModel):
    """Single activity's alignment with narrative"""
    activity_name: str
    alignment_score: float = Field(ge=0.0, le=1.0)
    supports_pillars: List[str] = Field(default_factory=list)
    recommendation: str = Field(description="Keep, Rebrand, or Drop")


class NarrativeCoherence(BaseModel):
    """Quantitative narrative-activity alignment"""
    coherence_score: float = Field(ge=0.0, le=100.0, description="Overall coherence 0-100")
    aligned_activities: int
    total_activities: int
    activity_alignments: List[ActivityAlignment] = Field(default_factory=list)
    noise_activities: List[str] = Field(description="Activities that don't support narrative")
    missing_elements: List[str] = Field(description="Narrative elements not demonstrated")


class ConvergencePath(BaseModel):
    """Path for undecided students"""
    path_name: str
    path_domain: str
    allocation_ratio: float = Field(ge=0.0, le=1.0, description="Time/effort allocation")
    key_activities: List[str]
    milestone_by_q4: str


class ConvergenceStrategy(BaseModel):
    """Complete convergence strategy for undecided students"""
    is_undecided: bool
    primary_path: ConvergencePath
    secondary_path: Optional[ConvergencePath] = None
    convergence_point: str = Field(description="Where paths merge")
    convergence_timeline: str = Field(description="When to converge")
    example_outcome: str


class QuarterlyMilestone(BaseModel):
    """Gap-mapped quarterly milestone"""
    quarter: str = Field(description="Q1, Q2, Q3, Q4")
    gap_addressed: str = Field(description="Dimension being addressed")
    priority_level: PriorityLevel
    milestone: str
    actions: List[str]
    expected_score_boost: str


class RubricPrioritySequence(BaseModel):
    """Quarter-mapped gap closing timeline"""
    current_baseline: int = Field(description="Current 5D score /50")
    target_baseline: int = Field(description="Target 5D score /50")
    quarterly_milestones: List[QuarterlyMilestone]
    critical_path: List[str] = Field(description="P0 gaps that must be addressed first")


class TargetProfile(BaseModel):
    """Complete target profile synthesis output - TYPE-001"""
    # Identity Fusion
    identity_fusion: IdentityFusion

    # Positioning
    unique_positioning: UniquePositioning

    # Strategic Targeting
    strategic_target: StrategicTarget

    # Narrative Coherence
    narrative_coherence: NarrativeCoherence

    # Convergence (for undecided)
    convergence_strategy: Optional[ConvergenceStrategy] = None

    # Rubric Sequencing
    rubric_sequence: RubricPrioritySequence

    # Source primitives (for reference)
    rubric_5d: Rubric5DOutput
    gap_analysis: GapAnalysisOutput
    potential_indicators: PotentialIndicatorOutput

    # Summary
    coaching_summary: str


# =============================================================================
# SYNTHESIS FUNCTIONS
# =============================================================================

def extract_identity_component(profile: Dict[str, Any], archetype: Optional[Dict[str, Any]] = None) -> str:
    """Extract identity component from profile and archetype context."""
    components = []

    # From V2 archetype context
    if archetype:
        context = archetype.get("context", {})

        # Ethnicity
        ethnicity = context.get("ethnicity", "")
        if ethnicity and ethnicity not in ["PREFER_NOT_TO_SAY", "prefer_not_to_say"]:
            components.append(ethnicity.replace("_", " ").title())

        # First-gen
        if context.get("is_first_gen"):
            components.append("First-Generation")

        # Gender minority
        if context.get("is_gender_minority_in_field"):
            advantage = context.get("gender_field_advantage", "")
            if advantage:
                components.append(advantage.split(" - ")[0] if " - " in advantage else "Gender Pioneer")

        # URM
        if context.get("is_urm"):
            components.append("Underrepresented Background")

        # International
        if context.get("is_international"):
            components.append("International Perspective")

    # From demographics
    demographics = profile.get("demographics", {})
    if not components:
        if demographics.get("first_gen"):
            components.append("First-Generation")
        if demographics.get("ethnicity"):
            components.append(demographics["ethnicity"])

    # Fallback
    if not components:
        components.append("Emerging Scholar")

    return " ".join(components[:2])  # Max 2 identity components


def extract_aptitude_component(profile: Dict[str, Any], rubric: Rubric5DOutput) -> str:
    """Extract aptitude component from academics and skills."""
    components = []

    # From 5D rubric
    if rubric.academics.score >= 8:
        components.append("Academic Excellence")
    elif rubric.academics.score >= 6:
        components.append("Strong Academics")

    # From intended major / interests
    intended_major = profile.get("intended_major", "")
    if intended_major:
        components.append(intended_major)

    # From skills
    skills = profile.get("skills", [])
    if skills:
        components.append(skills[0] if isinstance(skills[0], str) else str(skills[0]))

    # Fallback
    if not components:
        components.append("Intellectual Curiosity")

    return components[0]  # Primary aptitude


def extract_passion_component(profile: Dict[str, Any], archetype: Optional[Dict[str, Any]] = None) -> str:
    """Extract passion component from interests and domain."""
    # From V2 archetype domain
    if archetype:
        domain = archetype.get("domain", {})
        primary = domain.get("primary_domain", "")
        if primary:
            return DOMAIN_LABELS.get(primary, primary.replace("_", " ").title())

    # From interests
    interests = profile.get("interests", []) or profile.get("interest_areas", [])
    if interests:
        return interests[0] if isinstance(interests[0], str) else str(interests[0])

    # From passion section
    passion = profile.get("passion", {})
    if passion.get("research_level") in ["NATIONAL", "STATE"]:
        return "Research"
    if passion.get("leadership_level") and "FOUNDER" in passion.get("leadership_level", ""):
        return "Entrepreneurship"

    return "Exploration"


def extract_service_component(profile: Dict[str, Any], rubric: Rubric5DOutput) -> str:
    """Extract service component from community involvement."""
    # From 5D rubric service
    if rubric.service.score >= 7:
        return "Community Leadership"
    elif rubric.service.score >= 5:
        return "Community Service"

    # From causes
    causes = profile.get("causes", [])
    if causes:
        return f"{causes[0]} Advocate"

    # From community section
    community = profile.get("community", {})
    if community.get("service_leadership") in ["NATIONAL", "REGIONAL"]:
        return "Service Leadership"
    if community.get("service_hours", 0) >= 100:
        return "Dedicated Volunteer"

    return "Emerging Contributor"


def synthesize_identity_fusion(
    profile: Dict[str, Any],
    rubric: Rubric5DOutput,
    archetype: Optional[Dict[str, Any]] = None
) -> IdentityFusion:
    """Synthesize complete identity fusion."""
    identity = extract_identity_component(profile, archetype)
    aptitude = extract_aptitude_component(profile, rubric)
    passion = extract_passion_component(profile, archetype)
    service = extract_service_component(profile, rubric)

    # Build fusion formula
    fusion_formula = f"{passion} × {aptitude}"
    if identity != "Emerging Scholar":
        fusion_formula = f"{identity} + {fusion_formula}"
    fusion_formula += f" → {service}"

    # Build fusion statement
    fusion_statement = f"A {identity.lower()} {passion.lower()} with {aptitude.lower()}, driven to {service.lower()}"

    # Extract diversity angles from archetype
    diversity_angles = []
    demographic_hooks = []
    if archetype:
        context = archetype.get("context", {})
        diversity_angles = context.get("diversity_angles", [])

        if context.get("is_urm"):
            demographic_hooks.append("URM status provides unique perspective")
        if context.get("is_first_gen"):
            demographic_hooks.append("First-gen narrative resonates with admissions")
        if context.get("is_gender_minority_in_field"):
            demographic_hooks.append(context.get("gender_field_advantage", ""))

    return IdentityFusion(
        identity_component=identity,
        aptitude_component=aptitude,
        passion_component=passion,
        service_component=service,
        fusion_statement=fusion_statement,
        fusion_formula=fusion_formula,
        diversity_angles=diversity_angles,
        demographic_hooks=[h for h in demographic_hooks if h],
    )


def calculate_unique_positioning(
    fusion: IdentityFusion,
    profile: Dict[str, Any],
    potential: PotentialIndicatorOutput
) -> UniquePositioning:
    """Calculate competitive positioning."""
    differentiators = []
    advantages = []
    concerns = []

    # Diversity angles are differentiators
    if fusion.diversity_angles:
        differentiators.extend(fusion.diversity_angles[:2])

    # Demographic hooks are advantages
    if fusion.demographic_hooks:
        advantages.extend(fusion.demographic_hooks)

    # Hidden strengths from potential indicators
    for hs in potential.hidden_strengths[:2]:
        differentiators.append(f"Untapped {hs.skill_category} potential")

    # Latent potential signals
    for lp in potential.latent_potential[:2]:
        advantages.append(lp.strength_description)

    # Concerns (typical patterns to avoid)
    demographics = profile.get("demographics", {})
    intended_major = profile.get("intended_major", "")

    if intended_major and "Computer Science" in intended_major:
        if demographics.get("ethnicity") == "Asian":
            concerns.append("CS + Asian demographic is highly competitive")
        concerns.append("Differentiate from typical CS applicant narrative")

    if not differentiators:
        differentiators.append("Unique combination of interests and background")

    # Build positioning statement
    if differentiators:
        positioning = f"Unlike typical applicants, you bring {differentiators[0].lower()}"
        if len(differentiators) > 1:
            positioning += f" combined with {differentiators[1].lower()}"
    else:
        positioning = f"Your unique path as {fusion.fusion_statement}"

    return UniquePositioning(
        positioning_statement=positioning,
        differentiators=differentiators,
        competitive_advantages=advantages,
        potential_concerns=concerns,
    )


def calculate_strategic_target(
    fusion: IdentityFusion,
    archetype: Optional[Dict[str, Any]] = None
) -> StrategicTarget:
    """Calculate strategic school targeting."""
    fit_scores = {}
    passion_domain = fusion.passion_component.upper().replace(" ", "_")

    # Score each school
    for school, culture in SCHOOL_CULTURES.items():
        score = 0.5  # Base

        # Domain match
        favored = culture.get("favors_domains", [])
        if passion_domain in favored:
            score += 0.3
        elif any(d in passion_domain for d in favored):
            score += 0.15

        # Diversity advantage at schools that value it
        if fusion.diversity_angles and school in ["HARVARD", "YALE", "STANFORD"]:
            score += 0.1

        # Service orientation
        if "service" in fusion.service_component.lower() and school in ["HARVARD", "PRINCETON", "YALE"]:
            score += 0.1

        # Cap at 1.0
        fit_scores[school] = min(1.0, score)

    # Find best fit
    sorted_schools = sorted(fit_scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_schools[0][0]
    recommended = [s[0] for s in sorted_schools[:3]]

    # Rationale
    culture = SCHOOL_CULTURES.get(primary, {})
    rationale = f"{primary} values {', '.join(culture.get('values', ['excellence'])[:2])}, which aligns with your {fusion.passion_component.lower()} focus"

    return StrategicTarget(
        recommended_schools=recommended,
        school_fit_scores=fit_scores,
        primary_target=primary,
        target_rationale=rationale,
    )


def calculate_narrative_coherence(
    fusion: IdentityFusion,
    profile: Dict[str, Any]
) -> NarrativeCoherence:
    """Calculate narrative-activity coherence score."""
    activities = profile.get("activities", [])
    alignments = []
    aligned_count = 0
    noise = []
    missing = []

    # Define what supports the narrative
    narrative_keywords = [
        fusion.passion_component.lower(),
        fusion.service_component.lower(),
        fusion.aptitude_component.lower(),
    ]

    for activity in activities:
        if isinstance(activity, dict):
            name = activity.get("name", "") or activity.get("title", "")
            desc = activity.get("description", "")
        else:
            name = str(activity)
            desc = ""

        activity_text = f"{name} {desc}".lower()

        # Calculate alignment
        matches = sum(1 for kw in narrative_keywords if kw in activity_text)
        alignment_score = min(1.0, matches / len(narrative_keywords) + 0.3)  # Base 0.3

        supports = [kw for kw in narrative_keywords if kw in activity_text]

        if alignment_score >= 0.5:
            aligned_count += 1
            recommendation = "Keep"
        elif alignment_score >= 0.3:
            recommendation = "Rebrand"
        else:
            recommendation = "Drop or Rebrand"
            noise.append(name)

        alignments.append(ActivityAlignment(
            activity_name=name,
            alignment_score=round(alignment_score, 2),
            supports_pillars=supports,
            recommendation=recommendation,
        ))

    # Calculate coherence score
    total = len(activities) if activities else 1
    coherence = (aligned_count / total) * 100 if total > 0 else 50.0

    # Identify missing elements
    if fusion.passion_component.lower() not in str(activities).lower():
        missing.append(f"No clear {fusion.passion_component} activity")

    return NarrativeCoherence(
        coherence_score=round(coherence, 1),
        aligned_activities=aligned_count,
        total_activities=total,
        activity_alignments=alignments,
        noise_activities=noise,
        missing_elements=missing,
    )


def calculate_convergence_strategy(
    profile: Dict[str, Any],
    fusion: IdentityFusion,
    archetype: Optional[Dict[str, Any]] = None
) -> Optional[ConvergenceStrategy]:
    """Calculate convergence paths for undecided students."""
    # Check if undecided
    intended_major = profile.get("intended_major", "")
    is_undecided = not intended_major or intended_major.lower() in ["undecided", "undeclared", "exploring", ""]

    if not is_undecided:
        return None

    # Determine paths based on archetype domain
    primary_path = ConvergencePath(
        path_name="Primary Exploration",
        path_domain=fusion.passion_component,
        allocation_ratio=0.6,
        key_activities=[f"Deep dive in {fusion.passion_component}"],
        milestone_by_q4=f"Clear direction in {fusion.passion_component}",
    )

    # Secondary path from secondary domain or service
    secondary_path = ConvergencePath(
        path_name="Secondary Exploration",
        path_domain=fusion.service_component,
        allocation_ratio=0.4,
        key_activities=[f"Explore {fusion.service_component}"],
        milestone_by_q4=f"Determine fit with {fusion.service_component}",
    )

    # Find convergence point
    convergence_point = f"{fusion.passion_component} applied to {fusion.service_component}"

    return ConvergenceStrategy(
        is_undecided=True,
        primary_path=primary_path,
        secondary_path=secondary_path,
        convergence_point=convergence_point,
        convergence_timeline="End of Junior Year",
        example_outcome=f"Student who combines {fusion.passion_component.lower()} with {fusion.service_component.lower()}",
    )


def calculate_rubric_sequence(
    rubric: Rubric5DOutput,
    gap_analysis: GapAnalysisOutput,
    grade_level: int
) -> RubricPrioritySequence:
    """Map gaps to quarterly milestones."""
    milestones = []
    quarters = ["Q1", "Q2", "Q3", "Q4"]
    quarter_idx = 0

    # P0 gaps → Q1-Q2
    for gap in gap_analysis.gaps:
        if gap.priority_level == PriorityLevel.P0 and quarter_idx < 2:
            # Extract action strings from ClosingAction objects
            action_strs = [a.action if hasattr(a, 'action') else str(a) for a in gap.closing_actions[:2]]
            milestones.append(QuarterlyMilestone(
                quarter=quarters[quarter_idx],
                gap_addressed=gap.dimension,
                priority_level=gap.priority_level,
                milestone=f"Address critical {gap.dimension} gap ({gap.current_score}/10 → 6/10)",
                actions=action_strs,
                expected_score_boost=f"+{min(4, gap.raw_gap)} points",
            ))
            quarter_idx += 1

    # P1 gaps → Q2-Q3
    for gap in gap_analysis.gaps:
        if gap.priority_level == PriorityLevel.P1 and quarter_idx < 3:
            action_strs = [a.action if hasattr(a, 'action') else str(a) for a in gap.closing_actions[:2]]
            milestones.append(QuarterlyMilestone(
                quarter=quarters[quarter_idx],
                gap_addressed=gap.dimension,
                priority_level=gap.priority_level,
                milestone=f"Improve {gap.dimension} ({gap.current_score}/10 → 7/10)",
                actions=action_strs,
                expected_score_boost=f"+{min(3, gap.raw_gap)} points",
            ))
            quarter_idx += 1

    # P2 gaps → Q3-Q4
    for gap in gap_analysis.gaps:
        if gap.priority_level == PriorityLevel.P2 and quarter_idx < 4:
            action_strs = [a.action if hasattr(a, 'action') else str(a) for a in gap.closing_actions[:1]]
            milestones.append(QuarterlyMilestone(
                quarter=quarters[quarter_idx],
                gap_addressed=gap.dimension,
                priority_level=gap.priority_level,
                milestone=f"Polish {gap.dimension}",
                actions=action_strs,
                expected_score_boost=f"+{min(2, gap.raw_gap)} points",
            ))
            quarter_idx += 1

    # Critical path
    critical_path = [g.dimension for g in gap_analysis.gaps if g.priority_level == PriorityLevel.P0]

    # Target baseline (optimistic: close half the gap)
    total_gap = 50 - rubric.total_score
    target = rubric.total_score + int(total_gap * 0.6)

    return RubricPrioritySequence(
        current_baseline=rubric.total_score,
        target_baseline=min(45, target),  # Cap at 45/50
        quarterly_milestones=milestones,
        critical_path=critical_path,
    )


# =============================================================================
# MAIN SYNTHESIS FUNCTION
# =============================================================================

def synthesize_target_profile(
    profile: Dict[str, Any],
    archetype: Optional[Dict[str, Any]] = None,
    grade_level: Optional[int] = None,
) -> TargetProfile:
    """
    Synthesize complete target profile.

    This is the main entry point for TYPE-001 Target Profile Synthesis.

    Args:
        profile: Student profile dictionary
        archetype: Optional V2 MultiDimensionalArchetype dict
        grade_level: Optional grade level (extracted from profile if not provided)

    Returns:
        TargetProfile with identity fusion, positioning, coherence, and sequencing
    """
    # Get grade level
    if grade_level is None:
        demographics = profile.get("demographics", {})
        grade_level = demographics.get("grade_level", 11)

    # Calculate primitives
    rubric = calculate_5d_rubric(profile)
    gap_analysis = analyze_gaps(profile, grade_level, rubric)
    potential = detect_potential_indicators(profile)

    # Synthesize identity fusion
    fusion = synthesize_identity_fusion(profile, rubric, archetype)

    # Calculate positioning
    positioning = calculate_unique_positioning(fusion, profile, potential)

    # Calculate strategic target
    strategic = calculate_strategic_target(fusion, archetype)

    # Calculate narrative coherence
    coherence = calculate_narrative_coherence(fusion, profile)

    # Calculate convergence (if undecided)
    convergence = calculate_convergence_strategy(profile, fusion, archetype)

    # Calculate rubric sequence
    sequence = calculate_rubric_sequence(rubric, gap_analysis, grade_level)

    # Generate coaching summary
    coaching_summary = generate_coaching_summary(
        fusion, positioning, coherence, gap_analysis, potential
    )

    return TargetProfile(
        identity_fusion=fusion,
        unique_positioning=positioning,
        strategic_target=strategic,
        narrative_coherence=coherence,
        convergence_strategy=convergence,
        rubric_sequence=sequence,
        rubric_5d=rubric,
        gap_analysis=gap_analysis,
        potential_indicators=potential,
        coaching_summary=coaching_summary,
    )


def generate_coaching_summary(
    fusion: IdentityFusion,
    positioning: UniquePositioning,
    coherence: NarrativeCoherence,
    gaps: GapAnalysisOutput,
    potential: PotentialIndicatorOutput
) -> str:
    """Generate coaching summary from synthesis."""
    parts = []

    # Identity fusion
    parts.append(f"Identity: {fusion.fusion_formula}")

    # Coherence
    if coherence.coherence_score >= 70:
        parts.append(f"Strong narrative coherence ({coherence.coherence_score:.0f}%).")
    else:
        parts.append(f"Narrative coherence needs work ({coherence.coherence_score:.0f}%).")

    # Top gap
    if gaps.p0_gaps:
        parts.append(f"Critical focus: {gaps.p0_gaps[0]}.")

    # Primary unlock
    if potential.primary_unlock:
        parts.append(f"Quick win: {potential.primary_unlock.split(': ')[1] if ': ' in potential.primary_unlock else potential.primary_unlock}.")

    return " ".join(parts)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_target_profile(profile: TargetProfile) -> str:
    """Format target profile as human-readable summary."""
    lines = [
        "TARGET PROFILE SYNTHESIS (TYPE-001)",
        "",
        "IDENTITY FUSION:",
        f"  Formula: {profile.identity_fusion.fusion_formula}",
        f"  Statement: {profile.identity_fusion.fusion_statement}",
        "",
        "POSITIONING:",
        f"  {profile.unique_positioning.positioning_statement}",
        f"  Differentiators: {', '.join(profile.unique_positioning.differentiators[:2])}",
        "",
        "STRATEGIC TARGET:",
        f"  Best Fit: {profile.strategic_target.primary_target}",
        f"  Rationale: {profile.strategic_target.target_rationale}",
        "",
        f"NARRATIVE COHERENCE: {profile.narrative_coherence.coherence_score:.0f}%",
        f"  Aligned: {profile.narrative_coherence.aligned_activities}/{profile.narrative_coherence.total_activities} activities",
    ]

    if profile.narrative_coherence.noise_activities:
        lines.append(f"  Noise: {', '.join(profile.narrative_coherence.noise_activities[:2])}")

    if profile.convergence_strategy:
        lines.extend([
            "",
            "CONVERGENCE (Undecided):",
            f"  Primary: {profile.convergence_strategy.primary_path.path_domain} ({profile.convergence_strategy.primary_path.allocation_ratio:.0%})",
            f"  Secondary: {profile.convergence_strategy.secondary_path.path_domain} ({profile.convergence_strategy.secondary_path.allocation_ratio:.0%})",
        ])

    lines.extend([
        "",
        "RUBRIC SEQUENCE:",
        f"  Baseline: {profile.rubric_sequence.current_baseline}/50 → Target: {profile.rubric_sequence.target_baseline}/50",
    ])

    for m in profile.rubric_sequence.quarterly_milestones[:3]:
        lines.append(f"  {m.quarter}: {m.milestone}")

    lines.extend([
        "",
        f"COACHING: {profile.coaching_summary}",
    ])

    return "\n".join(lines)


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Models
    "IdentityFusion",
    "UniquePositioning",
    "StrategicTarget",
    "ActivityAlignment",
    "NarrativeCoherence",
    "ConvergencePath",
    "ConvergenceStrategy",
    "QuarterlyMilestone",
    "RubricPrioritySequence",
    "TargetProfile",
    # Main function
    "synthesize_target_profile",
    # Utilities
    "format_target_profile",
]
