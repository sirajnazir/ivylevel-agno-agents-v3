"""
Archetype Detection System - V2 Multi-Dimensional
==================================================

This module provides the public API for archetype detection.
It wraps the V2 multi-dimensional archetype system while maintaining
backward compatibility with the V1 API.

V1 (Legacy) returned: SCHOLAR, RESEARCHER, LEADER, etc.
V2 (New) returns: Multi-dimensional archetype with 6 dimensions:
    - Domain Focus (WHAT)
    - Context (WHERE/WHO) - including gender, ethnicity
    - Execution Style (HOW)
    - Challenges (OBSTACLES)
    - Timeline (WHEN)
    - Strengths/Weaknesses (RESOURCES)

USAGE:
    # Legacy API (backward compatible)
    from backend.tools.scoring.archetypes import detect_archetype, ArchetypeResult
    result = detect_archetype(profile, scores)
    print(result.id)  # "SCHOLAR"

    # New V2 API
    from backend.tools.scoring.archetypes import detect_archetype_v2, MultiDimensionalArchetype
    archetype = detect_archetype_v2(profile)
    print(archetype.composite_code)  # "STEM-RESEARCHER.TYPE-A.MID-HS.HIGH-RESOURCE"
    print(archetype.context.gender)  # Gender.FEMALE
    print(archetype.context.is_urm)  # True
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

# Import V2 system
from backend.agents.schemas.archetype_v2 import (
    # Dimensions
    DomainFocus, DomainProfile,
    SchoolType, SocioeconomicBackground, FamilyContext, GeographicContext,
    Gender, Ethnicity, ContextProfile,
    ExecutionArchetype, ExecutionProfile,
    ChallengeType, ChallengeProfile,
    TimelinePosition, ApplicationPhase, TimelineProfile,
    StrengthType, WeaknessType, StrengthsWeaknessesProfile,
    # Composite
    MultiDimensionalArchetype,
    # Strategy
    StrategyFamily, StrategyRecommendation,
)

from backend.agents.schemas.archetype_engine import (
    ConcreteArchetypeSynthesizer,
    FrameworkRegistry,
    synthesize_archetype,
    get_strategies_for_profile,
)


# =============================================================================
# LEGACY API (Backward Compatible)
# =============================================================================

class ArchetypeID(str, Enum):
    """All available archetypes (legacy)"""
    SCHOLAR = "SCHOLAR"
    RESEARCHER = "RESEARCHER"
    LEADER = "LEADER"
    ENTREPRENEUR = "ENTREPRENEUR"
    CHANGEMAKER = "CHANGEMAKER"
    ADVOCATE = "ADVOCATE"
    CREATOR = "CREATOR"
    PERFORMER = "PERFORMER"
    POLYMATH = "POLYMATH"
    EMERGING = "EMERGING"
    EXPLORER = "EXPLORER"


@dataclass
class ArchetypeResult:
    """Result of archetype detection (legacy format)"""
    id: str
    label: str
    tagline: str
    confidence: int  # 0-100
    alternates: List[Dict[str, Any]]

    # V2 extension - the full multi-dimensional archetype
    multi_dimensional: Optional[MultiDimensionalArchetype] = None


@dataclass
class NarrativeFormula:
    """Essay structure for an archetype"""
    archetype: str
    essay_structure: Dict[str, str]
    key_themes: List[str]
    avoid_themes: List[str]
    exemplar_openers: List[str]
    power_words: List[str]
    narrative_arc: str


# =============================================================================
# V2 DOMAIN TO LEGACY ARCHETYPE MAPPING
# =============================================================================

DOMAIN_TO_LEGACY_MAP = {
    DomainFocus.STEM_RESEARCHER: ("RESEARCHER", "The Researcher", "Driven by curiosity and discovery"),
    DomainFocus.TECH_BUILDER: ("CREATOR", "The Creator", "Building what others only imagine"),
    DomainFocus.SCIENTIFIC_MIND: ("SCHOLAR", "The Scholar", "Excellence through intellectual mastery"),
    DomainFocus.ENGINEERING_MAKER: ("CREATOR", "The Creator", "Building what others only imagine"),
    DomainFocus.HUMANITIES_SCHOLAR: ("SCHOLAR", "The Scholar", "Excellence through intellectual mastery"),
    DomainFocus.SOCIAL_SCIENTIST: ("RESEARCHER", "The Researcher", "Driven by curiosity and discovery"),
    DomainFocus.POLICY_WONK: ("ADVOCATE", "The Advocate", "Voice for those who need one"),
    DomainFocus.CREATIVE_ARTIST: ("CREATOR", "The Creator", "Building what others only imagine"),
    DomainFocus.PERFORMING_ARTIST: ("PERFORMER", "The Performer", "Excellence on every stage"),
    DomainFocus.DIGITAL_CREATOR: ("CREATOR", "The Creator", "Building what others only imagine"),
    DomainFocus.SOCIAL_ENTREPRENEUR: ("ENTREPRENEUR", "The Entrepreneur", "Creating solutions that matter"),
    DomainFocus.COMMUNITY_BUILDER: ("CHANGEMAKER", "The Changemaker", "Transforming communities through action"),
    DomainFocus.ADVOCATE_ACTIVIST: ("ADVOCATE", "The Advocate", "Voice for those who need one"),
    DomainFocus.RECRUITED_ATHLETE: ("PERFORMER", "The Performer", "Excellence on every stage"),
    DomainFocus.ATHLETIC_SCHOLAR: ("POLYMATH", "The Polymath", "Excellence without boundaries"),
    DomainFocus.BUSINESS_FOUNDER: ("ENTREPRENEUR", "The Entrepreneur", "Creating solutions that matter"),
    DomainFocus.BUSINESS_LEADER: ("LEADER", "The Leader", "Inspiring others to achieve together"),
    DomainFocus.EXPLORER: ("EXPLORER", "The Explorer", "Mapping Strategic Growth"),
    DomainFocus.MULTI_HYPHENATE: ("POLYMATH", "The Polymath", "Excellence without boundaries"),
}


# =============================================================================
# NARRATIVE FORMULAS (Enhanced with V2 context)
# =============================================================================

NARRATIVE_FORMULAS: Dict[str, NarrativeFormula] = {
    "SCHOLAR": NarrativeFormula(
        archetype="SCHOLAR",
        essay_structure={
            "hook": "Start with a moment of intellectual fascination—when you first fell down the rabbit hole",
            "development": "Show the progression of your curiosity: from question to investigation to deeper questions",
            "turn": "Reveal the limitation you discovered, or the unexpected connection you made",
            "resolution": "Connect your intellectual journey to who you want to become at [university]",
        },
        key_themes=["intellectual curiosity", "depth over breadth", "questions over answers", "knowledge as joy"],
        avoid_themes=["listing achievements", "genius narrative", "proving intelligence"],
        exemplar_openers=[
            "The footnote changed everything.",
            "I've read the same paper 47 times, and I still find something new.",
            "The question kept me up at night for three weeks.",
        ],
        power_words=["discovered", "questioned", "uncovered", "fascinated", "puzzled"],
        narrative_arc="evolution",
    ),
    "RESEARCHER": NarrativeFormula(
        archetype="RESEARCHER",
        essay_structure={
            "hook": "Begin with the problem that hooked you—make the reader feel its urgency",
            "development": "Walk through your methodology: the failures, the pivots, the breakthroughs",
            "turn": "Show what you learned beyond the data—about yourself, about science, about persistence",
            "resolution": "Connect to the bigger questions you want to pursue",
        },
        key_themes=["methodical curiosity", "failure as data", "persistence", "contribution to field"],
        avoid_themes=["just describing research", "technical jargon", "name-dropping mentors"],
        exemplar_openers=[
            "The experiment failed. Again. But this time, I noticed something different.",
            "347 hours in the lab, and the answer was in the 348th.",
            "My hypothesis was wrong. That's when the real research began.",
        ],
        power_words=["hypothesized", "tested", "discovered", "persisted", "contributed"],
        narrative_arc="hero_journey",
    ),
    "LEADER": NarrativeFormula(
        archetype="LEADER",
        essay_structure={
            "hook": "Start with a moment of difficult leadership—when you had to make a hard choice",
            "development": "Show how you navigated the challenge while bringing others along",
            "turn": "Reveal what you learned about leadership that you didn't expect",
            "resolution": "Connect to the kind of leader you're becoming",
        },
        key_themes=["servant leadership", "building others up", "difficult decisions", "growth through responsibility"],
        avoid_themes=["listing positions held", "being the hero", "others as backdrop"],
        exemplar_openers=[
            "I didn't want to fire my friend. But I had to.",
            "The team was falling apart, and everyone was looking at me.",
            "Leading isn't about the title. I learned that the hard way.",
        ],
        power_words=["unified", "empowered", "navigated", "transformed", "built"],
        narrative_arc="transformation",
    ),
    "ENTREPRENEUR": NarrativeFormula(
        archetype="ENTREPRENEUR",
        essay_structure={
            "hook": "Start with the problem you couldn't ignore—the gap you saw that others missed",
            "development": "Show the journey from idea to reality: the risks, the pivots, the growth",
            "turn": "Reveal what you learned about creating value and yourself",
            "resolution": "Connect to the problems you want to solve next",
        },
        key_themes=["problem-solving", "creating value", "learning from failure", "bias toward action"],
        avoid_themes=["startup jargon", "revenue bragging", "disruption rhetoric"],
        exemplar_openers=[
            "I saw the problem every day. One day, I stopped complaining and started building.",
            "My first customer was my mom. My second customer changed everything.",
            "The startup failed. The lesson didn't.",
        ],
        power_words=["built", "launched", "solved", "created", "scaled"],
        narrative_arc="hero_journey",
    ),
    "CHANGEMAKER": NarrativeFormula(
        archetype="CHANGEMAKER",
        essay_structure={
            "hook": "Start with the moment you couldn't look away—when someone's story became your cause",
            "development": "Show how you moved from awareness to action to impact",
            "turn": "Reveal how the work changed you as much as you changed the situation",
            "resolution": "Connect to the systemic change you want to drive",
        },
        key_themes=["empathy to action", "sustainable impact", "learning from communities", "systemic thinking"],
        avoid_themes=["savior complex", "tragedy porn", "counting hours"],
        exemplar_openers=[
            "She asked me why I was really there. I didn't have a good answer.",
            "The community taught me more than I ever gave them.",
            "I went to help. I left transformed.",
        ],
        power_words=["served", "learned", "partnered", "sustained", "amplified"],
        narrative_arc="transformation",
    ),
    "ADVOCATE": NarrativeFormula(
        archetype="ADVOCATE",
        essay_structure={
            "hook": "Start with the injustice that made you speak up",
            "development": "Show how you moved from witness to advocate",
            "turn": "Reveal the resistance you faced and how it strengthened your resolve",
            "resolution": "Connect to the change you will continue to champion",
        },
        key_themes=["voice for the voiceless", "systemic change", "courage to speak", "justice"],
        avoid_themes=["self-righteousness", "attacking others", "virtue signaling"],
        exemplar_openers=[
            "They told me to stay quiet. I couldn't.",
            "The policy affected everyone. But only a few of us showed up.",
            "My voice shook the first time. It doesn't anymore.",
        ],
        power_words=["advocated", "challenged", "amplified", "mobilized", "transformed"],
        narrative_arc="hero_journey",
    ),
    "CREATOR": NarrativeFormula(
        archetype="CREATOR",
        essay_structure={
            "hook": "Start with something you made—the artifact that reveals who you are",
            "development": "Show the creative process: the iterations, the dead ends, the breakthroughs",
            "turn": "Reveal what creating taught you about yourself",
            "resolution": "Connect to what you want to create next and why it matters",
        },
        key_themes=["making things", "iteration and craft", "process over product", "creative problem-solving"],
        avoid_themes=["describing the thing", "technical how-to", "awards won"],
        exemplar_openers=[
            "Version 23 was terrible. Version 24 changed everything.",
            "I didn't know what I was making until it was finished.",
            "The code didn't work. So I stayed up all night until it did.",
        ],
        power_words=["created", "iterated", "designed", "crafted", "built"],
        narrative_arc="hero_journey",
    ),
    "PERFORMER": NarrativeFormula(
        archetype="PERFORMER",
        essay_structure={
            "hook": "Start with a moment of performance—success or failure, but transformative",
            "development": "Show the dedication behind the performance others see",
            "turn": "Reveal what performance has taught you beyond the stage/field",
            "resolution": "Connect performance to who you are becoming",
        },
        key_themes=["dedication", "performance under pressure", "growth through practice", "team and individual"],
        avoid_themes=["just listing achievements", "only about winning", "physical stats"],
        exemplar_openers=[
            "The lights went down. My hands were shaking.",
            "10,000 hours. That's what it took to make it look easy.",
            "I didn't make the team. So I trained harder.",
        ],
        power_words=["performed", "trained", "competed", "achieved", "dedicated"],
        narrative_arc="hero_journey",
    ),
    "POLYMATH": NarrativeFormula(
        archetype="POLYMATH",
        essay_structure={
            "hook": "Start with an unexpected connection between your different interests",
            "development": "Show how your diverse pursuits inform each other",
            "turn": "Reveal the unified thread that connects everything",
            "resolution": "Connect to how you'll continue bridging disciplines",
        },
        key_themes=["cross-pollination", "Renaissance thinking", "unexpected connections", "breadth with depth"],
        avoid_themes=["listing all interests", "jack of all trades", "scattered focus"],
        exemplar_openers=[
            "My cello teacher didn't expect me to quote Einstein. Neither did I.",
            "The math problem looked like a poem. So I solved it like one.",
            "They asked me to choose. I chose both.",
        ],
        power_words=["connected", "bridged", "synthesized", "integrated", "discovered"],
        narrative_arc="discovery",
    ),
    "EMERGING": NarrativeFormula(
        archetype="EMERGING",
        essay_structure={
            "hook": "Start with a recent awakening or discovery about yourself",
            "development": "Show your trajectory—where you're headed and why",
            "turn": "Reveal the potential you're beginning to unlock",
            "resolution": "Connect to what you will become with the right environment",
        },
        key_themes=["growth mindset", "trajectory over position", "potential", "hunger to learn"],
        avoid_themes=["making excuses", "blaming circumstances", "waiting for opportunity"],
        exemplar_openers=[
            "Six months ago, I didn't know this world existed.",
            "They saw potential I hadn't discovered yet.",
            "I'm just getting started.",
        ],
        power_words=["growing", "discovering", "building", "becoming", "pursuing"],
        narrative_arc="transformation",
    ),
    "EXPLORER": NarrativeFormula(
        archetype="EXPLORER",
        essay_structure={
            "hook": "Start with a moment of genuine curiosity or exploration",
            "development": "Show how you're actively searching for your path",
            "turn": "Reveal what you've learned about yourself through exploration",
            "resolution": "Connect to how college will help you continue exploring",
        },
        key_themes=["intellectual curiosity", "openness", "active exploration", "growth"],
        avoid_themes=["being lost", "indecisive", "lacking direction"],
        exemplar_openers=[
            "I tried everything. That's how I'll find my thing.",
            "The map isn't drawn yet. I'm drawing it.",
            "I don't know what I'll major in. I know I'll find out.",
        ],
        power_words=["exploring", "discovering", "pursuing", "questioning", "seeking"],
        narrative_arc="discovery",
    ),
}


# =============================================================================
# V2 DETECTION FUNCTION (Primary)
# =============================================================================

def detect_archetype_v2(profile: Dict[str, Any]) -> MultiDimensionalArchetype:
    """
    Detect multi-dimensional archetype from profile.

    This is the NEW primary detection function that returns
    the full V2 archetype with all 6 dimensions.

    Args:
        profile: Student profile dictionary

    Returns:
        MultiDimensionalArchetype with all dimensions populated
    """
    return synthesize_archetype(profile)


# =============================================================================
# LEGACY DETECTION FUNCTION (Backward Compatible)
# =============================================================================

def detect_archetype(
    profile: Dict[str, Any],
    category_scores: Optional[Dict[str, float]] = None
) -> ArchetypeResult:
    """
    Detect archetype from profile (legacy API, backward compatible).

    This wraps the V2 system and returns the legacy format.
    The V2 multi-dimensional archetype is attached for access to new features.

    Args:
        profile: Student profile dictionary
        category_scores: Optional category scores (not used in V2, kept for compatibility)

    Returns:
        ArchetypeResult with legacy format + attached V2 archetype
    """
    # Run V2 detection
    multi_dim = synthesize_archetype(profile)

    # Map V2 domain to legacy archetype
    domain = multi_dim.domain.primary_domain
    legacy_info = DOMAIN_TO_LEGACY_MAP.get(
        domain,
        ("EXPLORER", "The Explorer", "Mapping Strategic Growth")
    )

    archetype_id, label, tagline = legacy_info

    # Calculate confidence from V2
    confidence = int(multi_dim.confidence_score * 100)

    # Build alternates from secondary domains
    alternates = []
    for sec_domain in multi_dim.domain.secondary_domains[:2]:
        sec_info = DOMAIN_TO_LEGACY_MAP.get(sec_domain)
        if sec_info and sec_info[0] != archetype_id:
            alternates.append({
                "id": sec_info[0],
                "label": sec_info[1],
                "confidence": int(confidence * 0.7),
            })

    return ArchetypeResult(
        id=archetype_id,
        label=label,
        tagline=tagline,
        confidence=confidence,
        alternates=alternates,
        multi_dimensional=multi_dim,  # V2 attached for full access
    )


def get_archetype_by_id(archetype_id: str) -> Optional[Dict[str, Any]]:
    """Get archetype definition by ID (legacy)"""
    if archetype_id in NARRATIVE_FORMULAS:
        formula = NARRATIVE_FORMULAS[archetype_id]
        return {
            "id": archetype_id,
            "label": f"The {archetype_id.title()}",
            "tagline": formula.key_themes[0] if formula.key_themes else "",
        }
    return None


def get_narrative_formula(archetype_id: str) -> Optional[NarrativeFormula]:
    """Get narrative formula for an archetype (legacy)"""
    return NARRATIVE_FORMULAS.get(archetype_id)


def generate_narrative_guidance(
    profile: Dict[str, Any],
    category_scores: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Generate narrative guidance based on detected archetype (legacy + V2).

    Returns enhanced guidance including V2 diversity angles.
    """
    archetype = detect_archetype(profile, category_scores)
    primary_formula = NARRATIVE_FORMULAS.get(archetype.id)

    # Get alternate formulas
    alternate_formulas = []
    for alt in archetype.alternates:
        formula = NARRATIVE_FORMULAS.get(alt["id"])
        if formula:
            alternate_formulas.append(formula)

    # Generate personalized tips
    tips = []
    if primary_formula:
        if archetype.confidence >= 80:
            tips.append(f"Your {archetype.label} identity is clear. Lean into this narrative confidently.")
        elif archetype.confidence >= 60:
            alt_labels = ", ".join(a["label"] for a in archetype.alternates)
            tips.append(f"You show strong {archetype.label} tendencies. Consider how your alternate archetypes ({alt_labels}) might add depth.")
        else:
            tips.append("You're a blend of archetypes. This is a strength—use it to show complexity.")

        # Add arc tips
        arc_tips = {
            "hero_journey": "Your essay should follow a challenge → struggle → triumph → wisdom arc.",
            "transformation": "Focus on showing clear before/after change. Make the transformation visible.",
            "discovery": "Center your essay on moments of realization. The 'aha' moments are your gold.",
            "evolution": "Show gradual growth and deepening understanding over time.",
        }
        if primary_formula.narrative_arc in arc_tips:
            tips.append(arc_tips[primary_formula.narrative_arc])

    # V2 Enhancement: Add diversity-based tips
    multi_dim = archetype.multi_dimensional
    if multi_dim and multi_dim.context.has_diversity_story:
        diversity_tips = []
        if multi_dim.context.is_urm:
            diversity_tips.append("Your background is an asset. Consider how your cultural perspective adds unique value.")
        if multi_dim.context.is_gender_minority_in_field:
            diversity_tips.append(f"{multi_dim.context.gender_field_advantage} - lean into this in your narrative.")
        if multi_dim.context.is_first_gen:
            diversity_tips.append("First-gen status is compelling. Show the unique perspective it gives you.")
        if diversity_tips:
            tips.extend(diversity_tips)

    return {
        "archetype": archetype,
        "primary_formula": primary_formula,
        "alternate_formulas": alternate_formulas,
        "personalized_tips": tips,
        # V2 additions
        "diversity_angles": multi_dim.context.diversity_angles if multi_dim else [],
        "composite_code": multi_dim.composite_code if multi_dim else "",
    }


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Legacy API
    "ArchetypeID",
    "ArchetypeResult",
    "NarrativeFormula",
    "detect_archetype",
    "get_archetype_by_id",
    "get_narrative_formula",
    "generate_narrative_guidance",

    # V2 API
    "detect_archetype_v2",
    "MultiDimensionalArchetype",
    "DomainFocus",
    "Gender",
    "Ethnicity",
    "ExecutionArchetype",
    "StrategyFamily",
    "synthesize_archetype",
    "get_strategies_for_profile",
]
