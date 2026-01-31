# IMPLEMENTS: TYPE-083 (Potential Indicator Extraction)
# LAYER: Scoring Tools (Primitive-based)
"""
Potential Indicator Extraction Engine

This module implements the potential indicator detection system derived from
Jenny's coaching sessions (W001-W093). It identifies hidden strengths,
untapped opportunities, and latent potential signals in student profiles.

ARCHITECTURE PRINCIPLE:
- Uses profile data as PRIMITIVE (same format as other scoring tools)
- Does NOT duplicate scoring logic
- Adds DETECTION layer for coaching insights

PURPOSE:
- Identify hidden strengths (skills mentioned but not demonstrated)
- Surface untapped opportunities (natural extensions of current work)
- Detect latent potential signals (growth mindset indicators)
- Provide coaching recommendations to unlock potential

CATEGORIES (TYPE-083 Spec):
1. Hidden Strengths: Skills/abilities mentioned but not showcased in activities
2. Untapped Opportunities: Natural extensions of current work not yet pursued
3. Latent Potential: Growth mindset signals (self-taught, founded, initiative)

DETECTION PATTERNS:
- Skill-Activity Mismatch: Has coding skills but no CS projects
- Domain Adjacency: Research in biology → hasn't applied to science fairs
- Initiative Signals: Self-taught, founded, started → entrepreneurial potential
- Depth Signals: 4+ years commitment → hasn't leveraged for leadership
"""

from typing import Dict, List, Any, Optional, Set, Tuple
from pydantic import BaseModel, Field
from enum import Enum


# =============================================================================
# CONSTANTS (TYPE-083 Patterns)
# =============================================================================

# Skill categories and their activity indicators
SKILL_ACTIVITY_MAP: Dict[str, Dict[str, Any]] = {
    "coding": {
        "keywords": ["code", "coding", "programming", "python", "java", "javascript", "software", "developer", "app", "website"],
        "expected_activities": ["hackathon", "app", "website", "software project", "coding competition", "tech startup"],
        "expected_awards": ["USACO", "CodeForces", "HackerRank", "hackathon"],
        "opportunity_if_missing": "Build and deploy a technical project",
    },
    "writing": {
        "keywords": ["writing", "writer", "author", "journalism", "blog", "essay", "poetry", "creative writing"],
        "expected_activities": ["newspaper", "literary magazine", "blog", "published", "writing competition"],
        "expected_awards": ["Scholastic", "writing contest", "journalism award"],
        "opportunity_if_missing": "Publish written work or enter Scholastic Awards",
    },
    "research": {
        "keywords": ["research", "lab", "experiment", "hypothesis", "data", "analysis", "scientific"],
        "expected_activities": ["research project", "science fair", "lab work", "publication"],
        "expected_awards": ["ISEF", "Regeneron", "science fair", "research symposium"],
        "opportunity_if_missing": "Submit to Regeneron STS or regional science fair",
    },
    "leadership": {
        "keywords": ["lead", "leader", "captain", "president", "founded", "started", "organized"],
        "expected_activities": ["club president", "team captain", "founder", "organizer"],
        "expected_awards": ["leadership award", "community service award"],
        "opportunity_if_missing": "Run for officer position or found an initiative",
    },
    "music": {
        "keywords": ["music", "instrument", "piano", "violin", "guitar", "band", "orchestra", "choir", "singing"],
        "expected_activities": ["orchestra", "band", "choir", "recital", "music competition"],
        "expected_awards": ["All-State", "music competition", "recital"],
        "opportunity_if_missing": "Audition for All-State or enter music competitions",
    },
    "art": {
        "keywords": ["art", "drawing", "painting", "design", "visual", "creative", "sculpture", "photography"],
        "expected_activities": ["art show", "portfolio", "design project", "exhibition"],
        "expected_awards": ["Scholastic Art", "art competition", "gallery showing"],
        "opportunity_if_missing": "Submit to Scholastic Art Awards or build portfolio",
    },
    "debate": {
        "keywords": ["debate", "speech", "public speaking", "model un", "mun", "argumentation"],
        "expected_activities": ["debate team", "Model UN", "speech competition", "forensics"],
        "expected_awards": ["debate tournament", "MUN award", "speech award"],
        "opportunity_if_missing": "Join debate team or compete in tournaments",
    },
    "athletics": {
        "keywords": ["sports", "athlete", "team", "varsity", "competition", "training"],
        "expected_activities": ["varsity team", "club sport", "competition", "tournament"],
        "expected_awards": ["MVP", "All-Conference", "state championship"],
        "opportunity_if_missing": "Pursue varsity or competitive athletics",
    },
    "entrepreneurship": {
        "keywords": ["business", "startup", "entrepreneur", "founded", "sell", "revenue", "customers"],
        "expected_activities": ["startup", "business", "venture", "company"],
        "expected_awards": ["pitch competition", "business plan award", "DECA"],
        "opportunity_if_missing": "Launch a venture or enter DECA/FBLA competitions",
    },
    "teaching": {
        "keywords": ["tutor", "teach", "mentor", "explain", "help others learn"],
        "expected_activities": ["tutoring", "teaching assistant", "mentorship program"],
        "expected_awards": ["tutoring certification", "mentorship award"],
        "opportunity_if_missing": "Formalize tutoring into structured program",
    },
}

# Growth mindset / initiative indicators
INITIATIVE_SIGNALS: Dict[str, Dict[str, Any]] = {
    "self_taught": {
        "keywords": ["self-taught", "taught myself", "learned on my own", "autodidact", "online courses"],
        "strength": "Self-directed learner - rare intellectual independence",
        "opportunity": "Document self-learning journey for essays; shows initiative without resources",
    },
    "founded": {
        "keywords": ["founded", "started", "created", "launched", "built from scratch", "co-founded"],
        "strength": "Entrepreneurial mindset - creates rather than joins",
        "opportunity": "Scale existing initiative or document founding story",
    },
    "first_in_family": {
        "keywords": ["first", "only one", "no one else in family", "first-gen"],
        "strength": "Trailblazer mentality - navigating without roadmap",
        "opportunity": "Highlight unique perspective in essays; first-gen hooks",
    },
    "overcame_obstacle": {
        "keywords": ["despite", "overcame", "struggled", "challenge", "difficult circumstances", "adversity"],
        "strength": "Resilience and grit - demonstrated perseverance",
        "opportunity": "Frame challenges as growth narrative in essays",
    },
    "passion_project": {
        "keywords": ["passion", "love", "obsessed", "can't stop", "dream", "always wanted"],
        "strength": "Genuine intrinsic motivation - not resume padding",
        "opportunity": "Deepen passion project for spike development",
    },
    "impact_driven": {
        "keywords": ["help", "impact", "change", "community", "make a difference", "solve"],
        "strength": "Service orientation - valued by admissions",
        "opportunity": "Quantify and scale community impact",
    },
}

# Domain adjacency patterns (if you have X, you should consider Y)
DOMAIN_ADJACENCY: Dict[str, List[Dict[str, str]]] = {
    "STEM_RESEARCHER": [
        {"opportunity": "Regeneron STS / ISEF submission", "if_missing": "science fair"},
        {"opportunity": "Publish in undergraduate journal", "if_missing": "publication"},
        {"opportunity": "Patent application for invention", "if_missing": "patent"},
    ],
    "TECH_BUILDER": [
        {"opportunity": "Open source contribution", "if_missing": "github"},
        {"opportunity": "Tech startup / venture", "if_missing": "startup"},
        {"opportunity": "Hackathon participation", "if_missing": "hackathon"},
    ],
    "HUMANITIES_SCHOLAR": [
        {"opportunity": "Scholastic Writing Awards", "if_missing": "writing award"},
        {"opportunity": "Local/school publication", "if_missing": "published"},
        {"opportunity": "Essay competition entry", "if_missing": "essay contest"},
    ],
    "SOCIAL_ENTREPRENEUR": [
        {"opportunity": "501(c)(3) nonprofit formation", "if_missing": "nonprofit"},
        {"opportunity": "Grant application for funding", "if_missing": "grant"},
        {"opportunity": "Partnership with established org", "if_missing": "partnership"},
    ],
    "PERFORMING_ARTIST": [
        {"opportunity": "All-State / regional audition", "if_missing": "all-state"},
        {"opportunity": "Community performance series", "if_missing": "performance"},
        {"opportunity": "Teaching / mentoring younger students", "if_missing": "teaching"},
    ],
    "RECRUITED_ATHLETE": [
        {"opportunity": "Coach outreach / recruiting video", "if_missing": "recruiting"},
        {"opportunity": "Athletic leadership / captain role", "if_missing": "captain"},
        {"opportunity": "Sports journalism / commentary", "if_missing": "sports writing"},
    ],
}


# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class IndicatorType(str, Enum):
    """Types of potential indicators"""
    HIDDEN_STRENGTH = "hidden_strength"
    UNTAPPED_OPPORTUNITY = "untapped_opportunity"
    LATENT_POTENTIAL = "latent_potential"


class PotentialIndicator(BaseModel):
    """A single potential indicator"""
    indicator_type: IndicatorType
    category: str = Field(description="Skill/domain category")
    signal: str = Field(description="What was detected in profile")
    insight: str = Field(description="Why this matters")
    action: str = Field(description="Recommended action to unlock")
    priority: int = Field(ge=1, le=3, description="1=High, 2=Medium, 3=Low")
    evidence: List[str] = Field(default_factory=list, description="Profile data supporting this")


class HiddenStrength(BaseModel):
    """A skill/ability mentioned but not demonstrated"""
    skill_category: str
    mentioned_keywords: List[str]
    missing_demonstrations: List[str]
    recommendation: str
    essay_angle: Optional[str] = None


class UntappedOpportunity(BaseModel):
    """A natural extension of current work not yet pursued"""
    current_activity: str
    opportunity: str
    why_natural_fit: str
    action_steps: List[str]
    expected_boost: str = Field(description="Expected score/profile boost")


class LatentPotential(BaseModel):
    """A growth mindset signal detected in profile"""
    signal_type: str
    evidence: str
    strength_description: str
    unlock_strategy: str


class PotentialIndicatorOutput(BaseModel):
    """Complete potential indicator analysis"""
    # Individual indicators
    hidden_strengths: List[HiddenStrength]
    untapped_opportunities: List[UntappedOpportunity]
    latent_potential: List[LatentPotential]

    # Aggregated indicators (prioritized)
    all_indicators: List[PotentialIndicator]

    # Summary
    total_indicators: int
    high_priority_count: int
    primary_unlock: Optional[str] = Field(description="Single most impactful unlock")

    # Coaching
    coaching_summary: str


# =============================================================================
# DETECTION FUNCTIONS
# =============================================================================

def extract_profile_text(profile: Dict[str, Any]) -> str:
    """
    Extract all text content from profile for keyword analysis.
    """
    text_parts = []

    # Extract from various profile sections
    def extract_recursive(obj: Any, prefix: str = "") -> None:
        if isinstance(obj, str):
            text_parts.append(obj.lower())
        elif isinstance(obj, list):
            for item in obj:
                extract_recursive(item, prefix)
        elif isinstance(obj, dict):
            for key, value in obj.items():
                extract_recursive(value, f"{prefix}.{key}")

    extract_recursive(profile)

    # Also check specific fields that often contain descriptions
    for field in ["bio", "description", "about", "interests", "skills", "notes"]:
        if field in profile and isinstance(profile[field], str):
            text_parts.append(profile[field].lower())

    return " ".join(text_parts)


def detect_skills_mentioned(profile_text: str) -> Dict[str, List[str]]:
    """
    Detect which skill categories are mentioned in profile text.
    Returns dict of skill_category -> list of matching keywords.
    """
    detected = {}

    for skill_cat, config in SKILL_ACTIVITY_MAP.items():
        keywords = config["keywords"]
        matches = [kw for kw in keywords if kw in profile_text]
        if matches:
            detected[skill_cat] = matches

    return detected


def detect_activities_present(profile: Dict[str, Any]) -> Set[str]:
    """
    Detect what activities/achievements are present in profile.
    Returns set of activity keywords found.
    """
    activities = set()

    # Check passion section
    passion = profile.get("passion", {})
    if passion.get("leadership_level"):
        activities.add(passion["leadership_level"].lower())
    if passion.get("research_level"):
        activities.add(passion["research_level"].lower())
        activities.add("research")
    if passion.get("project_impact") and passion["project_impact"] > 0:
        activities.add("project")

    # Check for EC awards
    ec_awards = passion.get("ec_awards", [])
    for award in ec_awards:
        if award:
            activities.add(award.lower())

    # Check aptitude awards
    aptitude = profile.get("aptitude", {})
    academic_awards = aptitude.get("academic_awards", [])
    for award in academic_awards:
        if award:
            activities.add(award.lower())

    # Check activities list if present
    for activity in profile.get("activities", []):
        if isinstance(activity, str):
            activities.add(activity.lower())
        elif isinstance(activity, dict):
            name = activity.get("name", "") or activity.get("title", "")
            if name:
                activities.add(name.lower())

    # Check projects list
    for project in profile.get("projects", []):
        if isinstance(project, str):
            activities.add(project.lower())
        elif isinstance(project, dict):
            name = project.get("name", "") or project.get("title", "")
            if name:
                activities.add(name.lower())
            if project.get("deployed"):
                activities.add("deployed")
            if project.get("users"):
                activities.add("users")

    return activities


def find_hidden_strengths(
    skills_mentioned: Dict[str, List[str]],
    activities_present: Set[str],
    profile_text: str
) -> List[HiddenStrength]:
    """
    Find skills mentioned but not demonstrated in activities.
    """
    hidden = []

    for skill_cat, keywords_found in skills_mentioned.items():
        config = SKILL_ACTIVITY_MAP[skill_cat]
        expected = config["expected_activities"]
        expected_awards = config.get("expected_awards", [])

        # Check if any expected activities are present
        has_demonstration = False
        for exp in expected + expected_awards:
            # Check if any activity contains this expected item
            for activity in activities_present:
                if exp.lower() in activity or activity in exp.lower():
                    has_demonstration = True
                    break
            if has_demonstration:
                break

        if not has_demonstration:
            # This is a hidden strength - skill mentioned but not demonstrated
            hidden.append(HiddenStrength(
                skill_category=skill_cat,
                mentioned_keywords=keywords_found,
                missing_demonstrations=expected[:3],  # Top 3 expected
                recommendation=config["opportunity_if_missing"],
                essay_angle=f"Your {skill_cat} skills are mentioned but not showcased - either build demonstration or craft narrative around informal application",
            ))

    return hidden


def find_untapped_opportunities(
    profile: Dict[str, Any],
    activities_present: Set[str]
) -> List[UntappedOpportunity]:
    """
    Find natural extensions of current work not yet pursued.
    """
    opportunities = []

    # Check passion signals for domain
    passion = profile.get("passion", {})
    research_level = passion.get("research_level")
    leadership_level = passion.get("leadership_level")
    project_impact = passion.get("project_impact", 0)

    # Research-based opportunities
    if research_level in ["INDEPENDENT", "SCHOOL", "STATE"]:
        if "isef" not in str(activities_present) and "regeneron" not in str(activities_present):
            opportunities.append(UntappedOpportunity(
                current_activity=f"Research ({research_level})",
                opportunity="Submit to Regeneron STS or ISEF pipeline",
                why_natural_fit="You already have research - formalize it for national recognition",
                action_steps=[
                    "Identify submission deadline (typically September for STS)",
                    "Format research into required submission format",
                    "Get mentor letter of recommendation",
                    "Submit to regional science fair first if needed",
                ],
                expected_boost="+4 points on Recognition if semifinalist",
            ))

    # Leadership-based opportunities
    if leadership_level in ["OFFICER", "SCHOOL_PRES"] and "founder" not in str(activities_present):
        opportunities.append(UntappedOpportunity(
            current_activity=f"Leadership ({leadership_level})",
            opportunity="Found your own initiative",
            why_natural_fit="You've proven leadership ability - founding shows entrepreneurial mindset",
            action_steps=[
                "Identify gap or need in your community",
                "Design initiative to address it",
                "Recruit founding team",
                "Launch within 4 weeks",
            ],
            expected_boost="+3 points on Leadership",
        ))

    # Project-based opportunities
    if project_impact and project_impact >= 50:
        if "deployed" not in activities_present and "users" not in activities_present:
            opportunities.append(UntappedOpportunity(
                current_activity=f"Project (impact: {project_impact})",
                opportunity="Deploy project publicly for external validation",
                why_natural_fit="You have working project - external users provide validation",
                action_steps=[
                    "Set up public deployment (website, app store, etc.)",
                    "Create landing page with clear value prop",
                    "Share with target audience",
                    "Collect testimonials and usage metrics",
                ],
                expected_boost="+2 points on Artifacts",
            ))

    # Service hours opportunities
    community = profile.get("community", {})
    service_hours = community.get("service_hours", 0)
    service_leadership = community.get("service_leadership")

    if service_hours >= 50 and service_leadership not in ["LOCAL", "REGIONAL", "NATIONAL"]:
        opportunities.append(UntappedOpportunity(
            current_activity=f"Service ({service_hours} hours)",
            opportunity="Take on volunteer coordinator/leadership role",
            why_natural_fit="You have consistent service - formalize into leadership",
            action_steps=[
                "Propose coordinator role to organization",
                "Recruit and train new volunteers",
                "Document impact metrics",
            ],
            expected_boost="+1 point on Service, Leadership signal",
        ))

    # Academic opportunity
    aptitude = profile.get("aptitude", {})
    gpa = aptitude.get("gpa_weighted") or aptitude.get("gpa_unweighted")
    if gpa and gpa >= 3.8:
        academic_awards = aptitude.get("academic_awards", [])
        has_national = any("national" in str(a).lower() for a in academic_awards)
        if not has_national:
            opportunities.append(UntappedOpportunity(
                current_activity=f"Strong academics (GPA: {gpa})",
                opportunity="Enter academic competitions (AMC/AIME, Science Olympiad, etc.)",
                why_natural_fit="Strong GPA suggests academic ability - competitions provide validation",
                action_steps=[
                    "Identify competitions in your strongest subjects",
                    "Register before deadlines",
                    "Practice with past competition problems",
                ],
                expected_boost="+2-4 points on Recognition if placed",
            ))

    return opportunities


def find_latent_potential(profile_text: str) -> List[LatentPotential]:
    """
    Detect growth mindset signals in profile text.
    """
    potential = []

    for signal_type, config in INITIATIVE_SIGNALS.items():
        keywords = config["keywords"]
        matches = [kw for kw in keywords if kw in profile_text]

        if matches:
            potential.append(LatentPotential(
                signal_type=signal_type,
                evidence=f"Keywords found: {', '.join(matches[:3])}",
                strength_description=config["strength"],
                unlock_strategy=config["opportunity"],
            ))

    return potential


def prioritize_indicator(indicator: PotentialIndicator, profile: Dict[str, Any]) -> int:
    """
    Calculate priority (1=High, 2=Medium, 3=Low) for an indicator.
    """
    # Hidden strengths with strong skill signals = high priority
    if indicator.indicator_type == IndicatorType.HIDDEN_STRENGTH:
        if indicator.category in ["coding", "research", "leadership"]:
            return 1
        return 2

    # Untapped opportunities that directly boost weak areas = high priority
    if indicator.indicator_type == IndicatorType.UNTAPPED_OPPORTUNITY:
        if "Recognition" in indicator.action or "Leadership" in indicator.action:
            return 1
        return 2

    # Latent potential (narrative value)
    if indicator.indicator_type == IndicatorType.LATENT_POTENTIAL:
        if indicator.category in ["founded", "overcame_obstacle", "self_taught"]:
            return 1
        return 2

    return 3


# =============================================================================
# MAIN DETECTION FUNCTION
# =============================================================================

def detect_potential_indicators(profile: Dict[str, Any]) -> PotentialIndicatorOutput:
    """
    Detect all potential indicators in a profile.

    This is the main entry point for TYPE-083 potential indicator extraction.

    Args:
        profile: Student profile dictionary (same format as other scoring tools)

    Returns:
        PotentialIndicatorOutput with hidden strengths, opportunities, and latent potential
    """
    # Extract text for analysis
    profile_text = extract_profile_text(profile)

    # Detect skills mentioned
    skills_mentioned = detect_skills_mentioned(profile_text)

    # Detect activities present
    activities_present = detect_activities_present(profile)

    # Find hidden strengths
    hidden_strengths = find_hidden_strengths(skills_mentioned, activities_present, profile_text)

    # Find untapped opportunities
    untapped_opportunities = find_untapped_opportunities(profile, activities_present)

    # Find latent potential
    latent_potential = find_latent_potential(profile_text)

    # Convert to unified indicators
    all_indicators = []

    for hs in hidden_strengths:
        indicator = PotentialIndicator(
            indicator_type=IndicatorType.HIDDEN_STRENGTH,
            category=hs.skill_category,
            signal=f"Mentions {', '.join(hs.mentioned_keywords[:2])} but no demonstration",
            insight=f"Skill-activity mismatch: {hs.skill_category} skills not showcased",
            action=hs.recommendation,
            priority=1 if hs.skill_category in ["coding", "research", "leadership"] else 2,
            evidence=hs.mentioned_keywords,
        )
        all_indicators.append(indicator)

    for uo in untapped_opportunities:
        indicator = PotentialIndicator(
            indicator_type=IndicatorType.UNTAPPED_OPPORTUNITY,
            category=uo.current_activity.split("(")[0].strip().lower(),
            signal=uo.current_activity,
            insight=uo.why_natural_fit,
            action=uo.opportunity,
            priority=1 if "Recognition" in uo.expected_boost else 2,
            evidence=[uo.current_activity],
        )
        all_indicators.append(indicator)

    for lp in latent_potential:
        indicator = PotentialIndicator(
            indicator_type=IndicatorType.LATENT_POTENTIAL,
            category=lp.signal_type,
            signal=lp.evidence,
            insight=lp.strength_description,
            action=lp.unlock_strategy,
            priority=1 if lp.signal_type in ["founded", "overcame_obstacle", "self_taught"] else 2,
            evidence=[lp.evidence],
        )
        all_indicators.append(indicator)

    # Sort by priority
    all_indicators.sort(key=lambda x: x.priority)

    # Calculate summary stats
    total = len(all_indicators)
    high_priority = len([i for i in all_indicators if i.priority == 1])

    # Determine primary unlock
    primary_unlock = None
    if all_indicators:
        top = all_indicators[0]
        primary_unlock = f"{top.indicator_type.value}: {top.action}"

    # Generate coaching summary
    coaching_summary = generate_coaching_summary(
        hidden_strengths, untapped_opportunities, latent_potential
    )

    return PotentialIndicatorOutput(
        hidden_strengths=hidden_strengths,
        untapped_opportunities=untapped_opportunities,
        latent_potential=latent_potential,
        all_indicators=all_indicators,
        total_indicators=total,
        high_priority_count=high_priority,
        primary_unlock=primary_unlock,
        coaching_summary=coaching_summary,
    )


def generate_coaching_summary(
    hidden: List[HiddenStrength],
    opportunities: List[UntappedOpportunity],
    potential: List[LatentPotential]
) -> str:
    """
    Generate coaching summary from detected indicators.
    """
    parts = []

    if hidden:
        skills = [h.skill_category for h in hidden]
        parts.append(f"Hidden strengths in {', '.join(skills[:2])} need demonstration.")

    if opportunities:
        opps = [o.opportunity for o in opportunities[:2]]
        parts.append(f"Quick wins available: {'; '.join(opps)}.")

    if potential:
        signals = [p.signal_type.replace("_", " ") for p in potential[:2]]
        parts.append(f"Narrative strengths: {', '.join(signals)}.")

    if not parts:
        return "Profile analysis complete. No major hidden potential detected - focus on execution."

    return " ".join(parts)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_potential_analysis(output: PotentialIndicatorOutput) -> str:
    """
    Format potential indicator analysis as human-readable summary.
    """
    lines = [
        "POTENTIAL INDICATOR ANALYSIS",
        f"Total indicators: {output.total_indicators} ({output.high_priority_count} high priority)",
        "",
    ]

    if output.hidden_strengths:
        lines.append("HIDDEN STRENGTHS:")
        for hs in output.hidden_strengths:
            lines.append(f"  • {hs.skill_category.title()}: {hs.recommendation}")
        lines.append("")

    if output.untapped_opportunities:
        lines.append("UNTAPPED OPPORTUNITIES:")
        for uo in output.untapped_opportunities:
            lines.append(f"  • {uo.opportunity} ({uo.expected_boost})")
        lines.append("")

    if output.latent_potential:
        lines.append("LATENT POTENTIAL:")
        for lp in output.latent_potential:
            lines.append(f"  • {lp.signal_type.replace('_', ' ').title()}: {lp.strength_description}")
        lines.append("")

    if output.primary_unlock:
        lines.append(f"PRIMARY UNLOCK: {output.primary_unlock}")

    lines.append("")
    lines.append(f"COACHING: {output.coaching_summary}")

    return "\n".join(lines)


def get_indicators_by_type(
    output: PotentialIndicatorOutput,
    indicator_type: IndicatorType
) -> List[PotentialIndicator]:
    """
    Get all indicators of a specific type.
    """
    return [i for i in output.all_indicators if i.indicator_type == indicator_type]


def get_high_priority_indicators(
    output: PotentialIndicatorOutput
) -> List[PotentialIndicator]:
    """
    Get all high priority (priority=1) indicators.
    """
    return [i for i in output.all_indicators if i.priority == 1]


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Enums
    "IndicatorType",
    # Models
    "PotentialIndicator",
    "HiddenStrength",
    "UntappedOpportunity",
    "LatentPotential",
    "PotentialIndicatorOutput",
    # Main function
    "detect_potential_indicators",
    # Utilities
    "format_potential_analysis",
    "get_indicators_by_type",
    "get_high_priority_indicators",
]
