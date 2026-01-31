# MIRRORS: lib/scoring/archetypeDetector.ts (634 lines)
# THE MIRROR LAW: This is a line-by-line port. DO NOT modify the logic.
"""
Archetype Detection System - Python Port

PRINCIPLE: Every student has a unique profile that maps to an archetype.
Archetypes are determined by the DOMINANT characteristics of the profile.
No student should get "Generic" - there's always a pattern to detect.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum


# =============================================================================
# ARCHETYPE DEFINITIONS
# =============================================================================

class ArchetypeID(str, Enum):
    """All available archetypes"""
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
    """Result of archetype detection"""
    id: str
    label: str
    tagline: str
    confidence: int  # 0-100
    alternates: List[Dict[str, Any]]


@dataclass
class NarrativeFormula:
    """Essay structure for an archetype"""
    archetype: str
    essay_structure: Dict[str, str]
    key_themes: List[str]
    avoid_themes: List[str]
    exemplar_openers: List[str]
    power_words: List[str]
    narrative_arc: str  # hero_journey, transformation, discovery, impact, connection


# =============================================================================
# ARCHETYPE SCORING FUNCTIONS
# =============================================================================

def score_scholar(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for SCHOLAR archetype"""
    score = 0
    aptitude = profile.get("aptitude", {})
    passion = profile.get("passion", {})
    
    # High aptitude is primary
    if scores.get("aptitude", 0) >= 70:
        score += 40
    elif scores.get("aptitude", 0) >= 50:
        score += 20
    
    # GPA and rigor
    if (aptitude.get("gpa_normalized") or 0) >= 0.80:
        score += 20
    if (aptitude.get("rigor_normalized") or 0) >= 0.70:
        score += 20
    
    # Research bonus
    if passion.get("research_level") and passion.get("research_level") != "NONE":
        score += 15
    
    # Aptitude must be dominant category
    if scores.get("aptitude", 0) > scores.get("passion", 0) and \
       scores.get("aptitude", 0) > scores.get("community", 0):
        score += 10
    
    return score


def score_researcher(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for RESEARCHER archetype"""
    score = 0
    passion = profile.get("passion", {})
    
    # Research is key
    research_level = passion.get("research_level", "")
    if research_level == "NATIONAL":
        score += 50
    elif research_level == "STATE":
        score += 35
    elif research_level == "SCHOOL":
        score += 20
    elif research_level == "INDEPENDENT":
        score += 10
    
    # STEM major bonus
    stem_majors = ["Computer Science", "Biology", "Chemistry", "Physics", "Mathematics", "Engineering"]
    if profile.get("intended_major", "") in stem_majors:
        score += 15
    
    # Academic foundation
    if scores.get("aptitude", 0) >= 60:
        score += 15
    
    return score


def score_leader(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for LEADER archetype"""
    score = 0
    passion = profile.get("passion", {})
    
    # Leadership level
    leadership = passion.get("leadership_level") or ""
    if leadership and "FOUNDER" in leadership:
        score += 40
    elif leadership and "PRES" in leadership:
        score += 35
    elif leadership == "OFFICER":
        score += 20
    
    # High passion score
    if scores.get("passion", 0) >= 60:
        score += 20
    
    # Long commitment
    if (passion.get("ec_commitment_years") or 0) >= 3:
        score += 15
    
    # Community involvement
    if scores.get("community", 0) >= 50:
        score += 10
    
    return score


def score_entrepreneur(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for ENTREPRENEUR archetype"""
    score = 0
    passion = profile.get("passion", {})
    
    # Founder is key
    leadership = passion.get("leadership_level") or ""
    if leadership and "FOUNDER" in leadership:
        score += 45
    
    # Project impact
    impact = passion.get("project_impact", 0) or 0
    if impact >= 500:
        score += 25
    elif impact >= 100:
        score += 15
    
    # Business/CS/Econ interest
    biz_majors = ["Business", "Economics", "Computer Science", "Engineering"]
    if profile.get("intended_major", "") in biz_majors:
        score += 15
    
    # Passion dominant
    if scores.get("passion", 0) > scores.get("aptitude", 0):
        score += 10
    
    return score


def score_changemaker(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for CHANGEMAKER archetype"""
    score = 0
    community = profile.get("community", {})
    
    # Community is primary
    if scores.get("community", 0) >= 60:
        score += 35
    elif scores.get("community", 0) >= 45:
        score += 20
    
    # Service leadership
    service_level = community.get("service_leadership", "")
    if service_level == "NATIONAL":
        score += 25
    elif service_level == "REGIONAL":
        score += 20
    elif service_level == "LOCAL":
        score += 15
    
    # High hours
    if (community.get("service_hours") or 0) >= 200:
        score += 15
    
    # Impact
    if (community.get("community_impact") or 0) >= 100:
        score += 10
    
    # Community is dominant
    if scores.get("community", 0) > scores.get("aptitude", 0) and \
       scores.get("community", 0) > scores.get("passion", 0):
        score += 10
    
    return score


def score_advocate(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for ADVOCATE archetype"""
    score = 0
    community = profile.get("community", {})
    demographics = profile.get("demographics", {})
    
    # Service involvement
    if (community.get("service_hours") or 0) >= 150:
        score += 25
    
    # Community score
    if scores.get("community", 0) >= 50:
        score += 20
    
    # Social science majors
    social_majors = ["Political Science", "Sociology", "Psychology", "Government", "Public Policy"]
    if profile.get("intended_major", "") in social_majors:
        score += 20
    
    # First-gen or underrepresented
    if demographics.get("first_gen", False):
        score += 15
    
    return score


def score_creator(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for CREATOR archetype"""
    score = 0
    passion = profile.get("passion", {})
    
    # Project impact is key
    impact = passion.get("project_impact", 0) or 0
    if impact >= 200:
        score += 35
    elif impact >= 50:
        score += 20
    
    # Long commitment to craft
    years = passion.get("ec_commitment_years", 0) or 0
    if years >= 4:
        score += 20
    elif years >= 3:
        score += 10
    
    # Creative/technical majors
    creator_majors = ["Computer Science", "Engineering", "Design", "Architecture", "Art"]
    if profile.get("intended_major", "") in creator_majors:
        score += 15
    
    # Passion score
    if scores.get("passion", 0) >= 50:
        score += 15
    
    return score


def score_performer(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for PERFORMER archetype"""
    score = 0
    passion = profile.get("passion", {})
    demographics = profile.get("demographics", {})
    
    # Recruited athlete
    if demographics.get("recruited_athlete", False):
        score += 50
    
    # Performance majors
    perf_majors = ["Music", "Theater", "Dance", "Film", "Drama"]
    if profile.get("intended_major", "") in perf_majors:
        score += 30
    
    # EC awards (competition success)
    if (passion.get("ec_awards_normalized") or 0) >= 0.5:
        score += 20
    
    # High passion
    if scores.get("passion", 0) >= 55:
        score += 15
    
    return score


def score_polymath(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for POLYMATH archetype"""
    score = 0
    
    # All scores above 50
    aptitude = scores.get("aptitude", 0)
    passion = scores.get("passion", 0)
    community = scores.get("community", 0)
    
    if aptitude >= 50 and passion >= 50 and community >= 50:
        score += 40
    
    # Balanced (no dimension more than 20 points higher than another)
    max_score = max(aptitude, passion, community)
    min_score = min(aptitude, passion, community)
    if max_score - min_score <= 20:
        score += 25
    
    # High overall
    avg = (aptitude + passion + community) / 3
    if avg >= 55:
        score += 20
    
    return score


def score_emerging(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for EMERGING archetype"""
    score = 0
    passion = profile.get("passion", {})
    identity = profile.get("identity", {})
    assessment_intel = profile.get("assessment_intelligence", {})
    psychometrics = assessment_intel.get("psychometrics", {})
    
    # Younger grade (more time to grow)
    grade_str = identity.get("grade", "12")
    try:
        grade = int(grade_str)
    except (ValueError, TypeError):
        grade = 12
    
    if grade <= 10:
        score += 25
    elif grade == 11:
        score += 15
    
    # Some activity but room to grow
    if (passion.get("ec_commitment_years") or 0) >= 1:
        score += 15
    
    # Moderate scores (not yet peaked)
    aptitude = scores.get("aptitude", 0)
    passion_score = scores.get("passion", 0)
    community = scores.get("community", 0)
    avg = (aptitude + passion_score + community) / 3
    if 30 <= avg < 55:
        score += 20
    
    # High grit (will improve)
    if (psychometrics.get("grit_resilience") or 0) >= 0.6:
        score += 15
    
    return score


def score_explorer(profile: Dict[str, Any], scores: Dict[str, float]) -> int:
    """Score for EXPLORER archetype"""
    score = 20  # Base score so it's always an option
    
    # Major undeclared
    major = profile.get("intended_major", "")
    if not major or major == "Undeclared":
        score += 15
    
    # Major certainty exploring
    if profile.get("major_certainty") == "EXPLORING":
        score += 15
    
    return score


# =============================================================================
# ARCHETYPE DEFINITIONS LIST
# =============================================================================

ARCHETYPES = [
    {
        "id": "SCHOLAR",
        "label": "The Scholar",
        "tagline": "Excellence through intellectual mastery",
        "description": "Strong academics with rigorous course load",
        "score_func": score_scholar,
    },
    {
        "id": "RESEARCHER",
        "label": "The Researcher",
        "tagline": "Driven by curiosity and discovery",
        "description": "Research-focused with scientific interests",
        "score_func": score_researcher,
    },
    {
        "id": "LEADER",
        "label": "The Leader",
        "tagline": "Inspiring others to achieve together",
        "description": "Strong leadership with team impact",
        "score_func": score_leader,
    },
    {
        "id": "ENTREPRENEUR",
        "label": "The Entrepreneur",
        "tagline": "Creating solutions that matter",
        "description": "Founder mentality with startup energy",
        "score_func": score_entrepreneur,
    },
    {
        "id": "CHANGEMAKER",
        "label": "The Changemaker",
        "tagline": "Transforming communities through action",
        "description": "Service-oriented with measurable impact",
        "score_func": score_changemaker,
    },
    {
        "id": "ADVOCATE",
        "label": "The Advocate",
        "tagline": "Voice for those who need one",
        "description": "Social justice focus with community engagement",
        "score_func": score_advocate,
    },
    {
        "id": "CREATOR",
        "label": "The Creator",
        "tagline": "Building what others only imagine",
        "description": "Project-focused with tangible outputs",
        "score_func": score_creator,
    },
    {
        "id": "PERFORMER",
        "label": "The Performer",
        "tagline": "Excellence on every stage",
        "description": "Arts/athletics focus with competitive achievement",
        "score_func": score_performer,
    },
    {
        "id": "POLYMATH",
        "label": "The Polymath",
        "tagline": "Excellence without boundaries",
        "description": "Strong across multiple dimensions",
        "score_func": score_polymath,
    },
    {
        "id": "EMERGING",
        "label": "The Emerging Talent",
        "tagline": "Potential waiting to be unlocked",
        "description": "Growing profile with clear trajectory",
        "score_func": score_emerging,
    },
    {
        "id": "EXPLORER",
        "label": "The Explorer",
        "tagline": "Mapping Strategic Growth",
        "description": "Identifying unique strengths and future spikes",
        "score_func": score_explorer,
    },
]


# =============================================================================
# NARRATIVE FORMULAS
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
}


# =============================================================================
# ARCHETYPE DETECTION
# =============================================================================

def detect_archetype(
    profile: Dict[str, Any],
    category_scores: Dict[str, float]
) -> ArchetypeResult:
    """
    Detect the best-matching archetype for a profile.
    UNIVERSAL: Always returns a valid archetype, never null or "GENERIC"
    
    Args:
        profile: Student profile dictionary
        category_scores: Dict with aptitude, passion, community, narrative scores
        
    Returns:
        ArchetypeResult with primary archetype and alternates
    """
    # Score all archetypes
    scored = []
    for arch in ARCHETYPES:
        archetype_score = arch["score_func"](profile, category_scores)
        scored.append({
            **arch,
            "score": archetype_score,
        })
    
    # Sort by score descending
    scored.sort(key=lambda x: x["score"], reverse=True)
    
    # Get top archetype
    primary = scored[0]
    max_score = max(s["score"] for s in scored)
    
    # Calculate confidence (primary score as percentage of max possible)
    confidence = min(100, round((primary["score"] / max(max_score, 1)) * 100))
    
    # Get alternates (next 2 with reasonable scores)
    alternates = []
    for s in scored[1:3]:
        if s["score"] >= primary["score"] * 0.5:
            alternates.append({
                "id": s["id"],
                "label": s["label"],
                "confidence": round((s["score"] / max(primary["score"], 1)) * 100),
            })
    
    return ArchetypeResult(
        id=primary["id"],
        label=primary["label"],
        tagline=primary["tagline"],
        confidence=confidence,
        alternates=alternates,
    )


def get_archetype_by_id(archetype_id: str) -> Optional[Dict[str, Any]]:
    """Get archetype definition by ID"""
    for arch in ARCHETYPES:
        if arch["id"] == archetype_id:
            return arch
    return None


def get_narrative_formula(archetype_id: str) -> Optional[NarrativeFormula]:
    """Get narrative formula for an archetype"""
    return NARRATIVE_FORMULAS.get(archetype_id)


def generate_narrative_guidance(
    profile: Dict[str, Any],
    category_scores: Dict[str, float]
) -> Dict[str, Any]:
    """
    Generate narrative guidance based on detected archetype.
    
    Returns:
        Dict with archetype, primaryFormula, alternateFormulas, personalizedTips
    """
    archetype = detect_archetype(profile, category_scores)
    primary_formula = NARRATIVE_FORMULAS.get(archetype.id)
    
    # Get alternate formulas from alternate archetypes
    alternate_formulas = []
    for alt in archetype.alternates:
        formula = NARRATIVE_FORMULAS.get(alt["id"])
        if formula:
            alternate_formulas.append(formula)
    
    # Generate personalized tips
    tips = []
    if primary_formula:
        # Tip based on archetype confidence
        if archetype.confidence >= 80:
            tips.append(f"Your {archetype.label} identity is clear. Lean into this narrative confidently.")
        elif archetype.confidence >= 60:
            alt_labels = ", ".join(a["label"] for a in archetype.alternates)
            tips.append(f"You show strong {archetype.label} tendencies. Consider how your alternate archetypes ({alt_labels}) might add depth.")
        else:
            tips.append("You're a blend of archetypes. This is a strength—use it to show complexity.")
        
        # Tip based on narrative arc
        arc_tips = {
            "hero_journey": "Your essay should follow a challenge → struggle → triumph → wisdom arc.",
            "transformation": "Focus on showing clear before/after change. Make the transformation visible.",
            "discovery": "Center your essay on moments of realization. The \"aha\" moments are your gold.",
            "impact": "Show the ripple effects of your work. Use specific numbers and stories.",
            "connection": "Emphasize relationships and how others have shaped (and been shaped by) you.",
        }
        if primary_formula.narrative_arc in arc_tips:
            tips.append(arc_tips[primary_formula.narrative_arc])
        
        # Theme tip
        if primary_formula.key_themes:
            import random
            theme = random.choice(primary_formula.key_themes)
            tips.append(f'Key theme to weave throughout: "{theme}"')
        
        # Power words tip
        if primary_formula.power_words:
            words = ", ".join(primary_formula.power_words[:3])
            tips.append(f"Power words for your archetype: {words}")
    
    return {
        "archetype": archetype,
        "primary_formula": primary_formula,
        "alternate_formulas": alternate_formulas,
        "personalized_tips": tips,
    }
