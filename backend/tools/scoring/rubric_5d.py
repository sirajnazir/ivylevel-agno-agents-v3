# IMPLEMENTS: TYPE-085 (Jenny's 5-Dimension Rubric Scoring)
# LAYER: Scoring Tools (Primitive-based)
"""
Jenny's 5-Dimension Rubric Scoring Engine

This module implements the strategic 5D rubric derived from Jenny's coaching
sessions (W001-W093). It provides a coaching-oriented scoring system that
complements the Ivy+ probability scoring.

ARCHITECTURE PRINCIPLE:
- Uses existing normalizers from engine.py as PRIMITIVES
- Does NOT duplicate normalization logic
- Adds strategic INTERPRETATION layer on top of primitives

PURPOSE:
- Quick baseline assessment (/50 total)
- Identify P0 gaps (dimensions with low scores + high weights)
- Guide strategic coaching interventions

DIMENSIONS (0-10 each, total /50):
| Dimension   | Weight | Focus                                    |
|-------------|--------|------------------------------------------|
| Academics   | 1.5    | GPA, Rigor, Test Scores                  |
| Leadership  | 1.3    | Positions, Founder status, Tenure        |
| Service     | 0.9    | Hours, Consistency, Impact, Leadership   |
| Artifacts   | 1.2    | Projects, Publications, Tangible outputs |
| Recognition | 1.4    | Awards, Competitions, External validation|

BASELINE EXAMPLE (Huda W001): 14/50
- Academics: 5/10, Leadership: 2/10 (P0), Service: 2/10,
- Artifacts: 4/10, Recognition: 1/10 (P0)
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum

# Import PRIMITIVES from engine (DO NOT DUPLICATE)
from backend.tools.scoring.engine import (
    normalize_gpa,
    normalize_sat,
    normalize_rigor,
    normalize_academic_awards,
    normalize_leadership,
    normalize_project_impact,
    normalize_research,
    normalize_ec_commitment,
    normalize_ec_awards,
    normalize_service_leadership,
    normalize_service_hours,
)


# =============================================================================
# CONSTANTS (Jenny's Formulas - TYPE-085)
# =============================================================================

# Dimension weights for gap priority calculation
DIMENSION_WEIGHTS: Dict[str, float] = {
    "academics": 1.5,
    "leadership": 1.3,
    "service": 0.9,
    "artifacts": 1.2,
    "recognition": 1.4,
}

# Target score for Ivy-competitive (used for gap calculation)
IVY_TARGET_SCORE: int = 8  # Out of 10 per dimension

# Maximum score per dimension
MAX_DIMENSION_SCORE: int = 10

# Total maximum score
MAX_TOTAL_SCORE: int = 50


# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class DimensionScore(BaseModel):
    """Score for a single dimension"""
    dimension: str
    score: int = Field(ge=0, le=10, description="Score 0-10")
    max_score: int = Field(default=10)
    weight: float = Field(description="Dimension weight for priority calc")
    gap: int = Field(ge=0, le=10, description="Gap from target (8)")
    weighted_gap: float = Field(description="Gap × Weight for priority")

    # Breakdown of how score was calculated
    breakdown: Dict[str, Any] = Field(default_factory=dict)

    # Coaching notes
    strengths: List[str] = Field(default_factory=list)
    gaps_identified: List[str] = Field(default_factory=list)


class Rubric5DOutput(BaseModel):
    """Complete 5D Rubric output"""
    # Individual dimension scores
    academics: DimensionScore
    leadership: DimensionScore
    service: DimensionScore
    artifacts: DimensionScore
    recognition: DimensionScore

    # Aggregates
    total_score: int = Field(ge=0, le=50, description="Total /50")
    percentage: float = Field(ge=0, le=100, description="Percentage score")

    # Gap analysis summary
    p0_dimensions: List[str] = Field(
        default_factory=list,
        description="Dimensions with weighted_gap >= 8 (Critical)"
    )
    p1_dimensions: List[str] = Field(
        default_factory=list,
        description="Dimensions with weighted_gap >= 5 (High)"
    )

    # Quick reference
    strongest_dimension: str
    weakest_dimension: str

    # Coaching summary
    coaching_priority: str = Field(
        description="Primary focus area based on weighted gaps"
    )


# =============================================================================
# HELPER FUNCTIONS (Data Extraction)
# =============================================================================

def _get_aptitude_value(profile: Dict[str, Any], nested_key: str, flat_keys: List[str]) -> Any:
    """
    Extract a value from profile, checking multiple possible locations.

    DB Schema Reality (Priority Order):
    1. profile["aptitude"][key] - if aptitude is JSONB column
    2. profile["four_pillars"]["aptitude"][key] - nested in four_pillars
    3. profile[flat_key] - flat DB columns (gpa, sat_score, etc.)

    Args:
        profile: The profile dict (could be flat DB row or nested structure)
        nested_key: Key to look for in nested structures (e.g., "gpa_weighted")
        flat_keys: List of flat column names to check (e.g., ["gpa_weighted", "gpa"])

    Returns:
        The value if found, None otherwise
    """
    # 1. Try direct nested structure (profile["aptitude"]["key"])
    aptitude = profile.get("aptitude")
    if isinstance(aptitude, dict) and nested_key in aptitude:
        val = aptitude.get(nested_key)
        if val is not None:
            return val

    # 2. Try four_pillars.aptitude (profile["four_pillars"]["aptitude"]["key"])
    four_pillars = profile.get("four_pillars")
    if isinstance(four_pillars, dict):
        fp_aptitude = four_pillars.get("aptitude")
        if isinstance(fp_aptitude, dict) and nested_key in fp_aptitude:
            val = fp_aptitude.get(nested_key)
            if val is not None:
                return val

    # 3. Try flat columns (profile["gpa"], profile["sat_score"], etc.)
    for flat_key in flat_keys:
        val = profile.get(flat_key)
        if val is not None:
            return val

    return None


def _get_passion_value(profile: Dict[str, Any], nested_key: str, flat_keys: List[str]) -> Any:
    """
    Extract value from passion section, checking multiple locations.

    Priority Order:
    1. profile["passion"][key]
    2. profile["four_pillars"]["passion"][key]
    3. profile[flat_key]
    """
    # 1. Try direct nested structure
    passion = profile.get("passion")
    if isinstance(passion, dict) and nested_key in passion:
        val = passion.get(nested_key)
        if val is not None:
            return val

    # 2. Try four_pillars.passion
    four_pillars = profile.get("four_pillars")
    if isinstance(four_pillars, dict):
        fp_passion = four_pillars.get("passion")
        if isinstance(fp_passion, dict) and nested_key in fp_passion:
            val = fp_passion.get(nested_key)
            if val is not None:
                return val

    # 3. Try flat columns
    for flat_key in flat_keys:
        val = profile.get(flat_key)
        if val is not None:
            return val

    return None


def _get_community_value(profile: Dict[str, Any], nested_key: str, flat_keys: List[str]) -> Any:
    """
    Extract value from community/service section, checking multiple locations.

    Priority Order:
    1. profile["community"][key]
    2. profile["four_pillars"]["service"][key] (note: DB uses "service" not "community")
    3. profile[flat_key]
    """
    # 1. Try direct nested structure (community)
    community = profile.get("community")
    if isinstance(community, dict) and nested_key in community:
        val = community.get(nested_key)
        if val is not None:
            return val

    # 2. Try four_pillars.service (DB schema uses "service" key)
    four_pillars = profile.get("four_pillars")
    if isinstance(four_pillars, dict):
        fp_service = four_pillars.get("service")
        if isinstance(fp_service, dict) and nested_key in fp_service:
            val = fp_service.get(nested_key)
            if val is not None:
                return val

    # 3. Try flat columns
    for flat_key in flat_keys:
        val = profile.get(flat_key)
        if val is not None:
            return val

    return None


# =============================================================================
# DIMENSION SCORING FUNCTIONS
# =============================================================================

def score_academics(profile: Dict[str, Any]) -> DimensionScore:
    """
    Score Academics dimension (0-10)

    Jenny's Formula (TYPE-085):
    - Base: 3 points
    - GPA 3.9+: +2 points
    - AP 8+: +2 points
    - SAT 1500+: +2 points
    - Perfect (4.0 GPA, 10+ AP, 1550+ SAT): +1 bonus

    Uses existing normalizers as truth source, then maps to Jenny's scale.

    DATA SOURCES (checks both nested and flat):
    - GPA: profile["aptitude"]["gpa_weighted"] OR profile["gpa_weighted"] OR profile["gpa"]
    - SAT: profile["aptitude"]["sat_total"] OR profile["sat_score"]
    - AP:  profile["aptitude"]["ap_count"] OR profile["ap_count"]
    """
    # Get raw values (handles both nested and flat DB structures)
    gpa = _get_aptitude_value(profile, "gpa_weighted", ["gpa_weighted", "gpa"])
    sat = _get_aptitude_value(profile, "sat_total", ["sat_score", "sat_total"])
    ap_count = _get_aptitude_value(profile, "ap_count", ["ap_count"]) or 0

    # Also get AP average score if available
    ap_avg_score = _get_aptitude_value(profile, "ap_avg_score", ["ap_avg_score"])

    # Use normalizers to get standardized scores (0-1)
    gpa_norm = normalize_gpa(gpa)
    sat_norm = normalize_sat(sat)
    rigor_norm = normalize_rigor(ap_count, ap_avg_score)

    # Apply Jenny's formula
    score = 3  # Base
    breakdown = {"base": 3}
    strengths = []
    gaps = []

    # GPA component (+2 if 3.9+, which is ~0.80 normalized)
    if gpa_norm >= 0.80:
        score += 2
        breakdown["gpa_bonus"] = 2
        strengths.append(f"Strong GPA ({gpa})")
    elif gpa_norm >= 0.60:
        score += 1
        breakdown["gpa_bonus"] = 1
    else:
        breakdown["gpa_bonus"] = 0
        if gpa:
            gaps.append(f"GPA ({gpa}) below 3.9 target")

    # Rigor component (+2 if 8+ APs)
    if ap_count and ap_count >= 8:
        score += 2
        breakdown["rigor_bonus"] = 2
        strengths.append(f"Strong rigor ({ap_count} APs)")
    elif ap_count and ap_count >= 4:
        score += 1
        breakdown["rigor_bonus"] = 1
    else:
        breakdown["rigor_bonus"] = 0
        gaps.append(f"AP count ({ap_count or 0}) below 8 target")

    # SAT component (+2 if 1500+, which is ~0.85 normalized)
    if sat_norm >= 0.85:
        score += 2
        breakdown["sat_bonus"] = 2
        strengths.append(f"Strong SAT ({sat})")
    elif sat_norm >= 0.70:
        score += 1
        breakdown["sat_bonus"] = 1
    else:
        breakdown["sat_bonus"] = 0
        if sat:
            gaps.append(f"SAT ({sat}) below 1500 target")

    # Perfect bonus (+1 if all maxed)
    if gpa_norm >= 0.95 and rigor_norm >= 0.90 and sat_norm >= 0.95:
        score += 1
        breakdown["perfect_bonus"] = 1
        strengths.append("Near-perfect academics")
    else:
        breakdown["perfect_bonus"] = 0

    # Cap at 10
    score = min(10, score)

    # Calculate gap
    gap = max(0, IVY_TARGET_SCORE - score)
    weighted_gap = gap * DIMENSION_WEIGHTS["academics"]

    return DimensionScore(
        dimension="academics",
        score=score,
        weight=DIMENSION_WEIGHTS["academics"],
        gap=gap,
        weighted_gap=weighted_gap,
        breakdown=breakdown,
        strengths=strengths,
        gaps_identified=gaps,
    )


def score_leadership(profile: Dict[str, Any]) -> DimensionScore:
    """
    Score Leadership dimension (0-10)

    Jenny's Formula (TYPE-085):
    - Base: 1 point
    - Founder: +3 points
    - President/Officer: +2 points
    - Multi-year commitment (2+ years): +2 points
    - National scope: +3 points

    This is often a P0 gap for students.

    DATA SOURCES (checks both nested and flat):
    - Leadership: profile["passion"]["leadership_level"] OR profile["leadership_level"]
    - Commitment: profile["passion"]["ec_commitment_years"] OR profile["ec_commitment_years"]
    """
    # Get values (handles both nested and flat DB structures)
    leadership_level = _get_passion_value(profile, "leadership_level", ["leadership_level"])
    commitment_years = _get_passion_value(profile, "ec_commitment_years", ["ec_commitment_years"]) or 0

    # Use normalizer
    leadership_norm = normalize_leadership(leadership_level)

    # Apply Jenny's formula
    score = 1  # Base
    breakdown = {"base": 1}
    strengths = []
    gaps = []

    # Founder bonus (+3)
    if leadership_level and "FOUNDER" in leadership_level:
        score += 3
        breakdown["founder_bonus"] = 3
        strengths.append("Founder status - entrepreneurial signal")

        # National scope bonus (+3 additional)
        if "NATIONAL" in leadership_level:
            score += 3
            breakdown["national_bonus"] = 3
            strengths.append("National-level organization")
        elif "STATE" in leadership_level:
            score += 1
            breakdown["national_bonus"] = 1
            strengths.append("State-level organization")
        else:
            breakdown["national_bonus"] = 0

    # President/Officer bonus (+2)
    elif leadership_level in ["SCHOOL_PRES", "STATE_PRES"]:
        score += 2
        breakdown["president_bonus"] = 2
        strengths.append(f"President position ({leadership_level})")
        breakdown["founder_bonus"] = 0

        if leadership_level == "STATE_PRES":
            score += 2
            breakdown["national_bonus"] = 2
        else:
            breakdown["national_bonus"] = 0

    elif leadership_level == "OFFICER":
        score += 1
        breakdown["officer_bonus"] = 1
        breakdown["founder_bonus"] = 0
        breakdown["national_bonus"] = 0

    else:
        breakdown["founder_bonus"] = 0
        breakdown["president_bonus"] = 0
        breakdown["national_bonus"] = 0
        gaps.append("No leadership position - consider founding or running for officer")

    # Multi-year commitment (+2 if 2+ years)
    if commitment_years and commitment_years >= 2:
        score += 2
        breakdown["tenure_bonus"] = 2
        strengths.append(f"Multi-year commitment ({commitment_years} years)")
    elif commitment_years and commitment_years >= 1:
        score += 1
        breakdown["tenure_bonus"] = 1
    else:
        breakdown["tenure_bonus"] = 0
        gaps.append("Short tenure - deepen existing commitments")

    # Cap at 10
    score = min(10, score)

    # Calculate gap
    gap = max(0, IVY_TARGET_SCORE - score)
    weighted_gap = gap * DIMENSION_WEIGHTS["leadership"]

    return DimensionScore(
        dimension="leadership",
        score=score,
        weight=DIMENSION_WEIGHTS["leadership"],
        gap=gap,
        weighted_gap=weighted_gap,
        breakdown=breakdown,
        strengths=strengths,
        gaps_identified=gaps,
    )


def score_service(profile: Dict[str, Any]) -> DimensionScore:
    """
    Score Service dimension (0-10)

    Jenny's Formula (TYPE-085):
    - Base: 1 point
    - 100+ hours: +3 points
    - Consistent 2+ years: +2 points
    - Measurable impact: +2 points
    - Service leadership role: +1 point

    DATA SOURCES (checks both nested and flat):
    - Hours: profile["community"]["service_hours"] OR profile["four_pillars"]["service"]["hours"]
    - Leadership: profile["community"]["service_leadership"]
    - Impact: profile["community"]["community_impact"]
    """
    # Get values (handles both nested and flat DB structures)
    service_hours = _get_community_value(profile, "service_hours", ["service_hours", "hours"]) or 0
    service_leadership = _get_community_value(profile, "service_leadership", ["service_leadership"])
    community_impact = _get_community_value(profile, "community_impact", ["community_impact", "impact"]) or 0

    # Use normalizers
    hours_norm = normalize_service_hours(service_hours)
    service_norm = normalize_service_leadership(service_leadership)

    # Check for consistency (using passion commitment as proxy)
    commitment_years = _get_passion_value(profile, "ec_commitment_years", ["ec_commitment_years"]) or 0

    # Apply Jenny's formula
    score = 1  # Base
    breakdown = {"base": 1}
    strengths = []
    gaps = []

    # Hours bonus (+3 if 100+)
    if service_hours and service_hours >= 100:
        score += 3
        breakdown["hours_bonus"] = 3
        strengths.append(f"Substantial hours ({service_hours}+)")
    elif service_hours and service_hours >= 50:
        score += 1
        breakdown["hours_bonus"] = 1
    else:
        breakdown["hours_bonus"] = 0
        gaps.append(f"Low service hours ({service_hours or 0}) - target 100+")

    # Consistency bonus (+2 if 2+ years)
    if commitment_years and commitment_years >= 2:
        score += 2
        breakdown["consistency_bonus"] = 2
        strengths.append("Consistent multi-year service")
    elif commitment_years and commitment_years >= 1:
        score += 1
        breakdown["consistency_bonus"] = 1
    else:
        breakdown["consistency_bonus"] = 0
        gaps.append("Service lacks consistency - commit to regular volunteering")

    # Impact bonus (+2 if measurable)
    if community_impact and community_impact >= 50:
        score += 2
        breakdown["impact_bonus"] = 2
        strengths.append(f"Measurable impact ({community_impact} people)")
    elif community_impact and community_impact >= 20:
        score += 1
        breakdown["impact_bonus"] = 1
    else:
        breakdown["impact_bonus"] = 0
        gaps.append("No documented impact - quantify your contributions")

    # Leadership bonus (+1 if service leader)
    if service_leadership in ["NATIONAL", "REGIONAL", "LOCAL"]:
        score += 1
        breakdown["leadership_bonus"] = 1
        strengths.append(f"Service leadership ({service_leadership})")
    else:
        breakdown["leadership_bonus"] = 0

    # Cap at 10
    score = min(10, score)

    # Calculate gap
    gap = max(0, IVY_TARGET_SCORE - score)
    weighted_gap = gap * DIMENSION_WEIGHTS["service"]

    return DimensionScore(
        dimension="service",
        score=score,
        weight=DIMENSION_WEIGHTS["service"],
        gap=gap,
        weighted_gap=weighted_gap,
        breakdown=breakdown,
        strengths=strengths,
        gaps_identified=gaps,
    )


def score_artifacts(profile: Dict[str, Any]) -> DimensionScore:
    """
    Score Artifacts dimension (0-10)

    Jenny's Formula (TYPE-085):
    - Base: 1 point
    - Published work: +3 points
    - Complex project: +2 points
    - Multiple artifacts: +1 per additional (max +2)
    - External validation (deployed, used, cited): +2 points

    Artifacts = tangible outputs that demonstrate capability.

    DATA SOURCES (checks both nested and flat):
    - project_impact: profile["passion"]["project_impact"]
    - research_level: profile["passion"]["research_level"]
    """
    # Get values (handles both nested and flat DB structures)
    project_impact = _get_passion_value(profile, "project_impact", ["project_impact"]) or 0
    research_level = _get_passion_value(profile, "research_level", ["research_level"])

    # Also check for artifacts in profile
    artifacts = profile.get("artifacts", [])
    projects = profile.get("projects", [])

    # Use normalizers
    project_norm = normalize_project_impact(project_impact)
    research_norm = normalize_research(research_level)

    # Apply Jenny's formula
    score = 1  # Base
    breakdown = {"base": 1}
    strengths = []
    gaps = []

    # Published work bonus (+3 if NATIONAL research or published)
    if research_level == "NATIONAL":
        score += 3
        breakdown["published_bonus"] = 3
        strengths.append("Published/nationally recognized research")
    elif research_level in ["STATE", "SCHOOL"]:
        score += 1
        breakdown["published_bonus"] = 1
        strengths.append(f"Research experience ({research_level})")
    else:
        breakdown["published_bonus"] = 0
        gaps.append("No research/publication - consider independent project")

    # Complex project bonus (+2 if significant impact)
    if project_impact and project_impact >= 200:
        score += 2
        breakdown["complex_bonus"] = 2
        strengths.append(f"High-impact project ({project_impact} people)")
    elif project_impact and project_impact >= 50:
        score += 1
        breakdown["complex_bonus"] = 1
    else:
        breakdown["complex_bonus"] = 0
        gaps.append("No significant project - build something tangible")

    # Multiple artifacts bonus (+1 per additional, max +2)
    artifact_count = len(artifacts) + len(projects)
    if artifact_count >= 3:
        score += 2
        breakdown["multiple_bonus"] = 2
        strengths.append(f"Multiple artifacts ({artifact_count})")
    elif artifact_count >= 2:
        score += 1
        breakdown["multiple_bonus"] = 1
    else:
        breakdown["multiple_bonus"] = 0

    # External validation bonus (+2 if deployed/used/cited)
    # Check for signals of external validation
    has_validation = (
        project_norm >= 0.60 or  # Significant reach suggests validation
        research_level == "NATIONAL" or
        any(p.get("deployed") or p.get("users") for p in projects if isinstance(p, dict))
    )

    if has_validation:
        score += 2
        breakdown["validation_bonus"] = 2
        strengths.append("Externally validated work")
    else:
        breakdown["validation_bonus"] = 0
        gaps.append("Artifacts lack external validation - deploy or get feedback")

    # Cap at 10
    score = min(10, score)

    # Calculate gap
    gap = max(0, IVY_TARGET_SCORE - score)
    weighted_gap = gap * DIMENSION_WEIGHTS["artifacts"]

    return DimensionScore(
        dimension="artifacts",
        score=score,
        weight=DIMENSION_WEIGHTS["artifacts"],
        gap=gap,
        weighted_gap=weighted_gap,
        breakdown=breakdown,
        strengths=strengths,
        gaps_identified=gaps,
    )


def score_recognition(profile: Dict[str, Any]) -> DimensionScore:
    """
    Score Recognition dimension (0-10)

    Jenny's Formula (TYPE-085):
    - Base: 0 points (no gimmes here)
    - National award: +4 points
    - Regional/State award: +2 points
    - Finalist status: +2 points
    - Multiple awards: +1 per additional (max +2)

    This is often a P0 gap - many students have NO recognition.

    DATA SOURCES (checks both nested and flat):
    - academic_awards: profile["aptitude"]["academic_awards"] OR profile["awards"]
    - ec_awards: profile["passion"]["ec_awards"]
    """
    # Get awards from both academic and EC
    # First check nested structures, then flat columns, then profile.awards list
    academic_awards = _get_aptitude_value(profile, "academic_awards", ["academic_awards"]) or []
    ec_awards = _get_passion_value(profile, "ec_awards", ["ec_awards"]) or []

    # Also check the flat "awards" column which is a list of award objects
    profile_awards = profile.get("awards") or []
    if profile_awards and not academic_awards and not ec_awards:
        # Convert awards list to strings for processing
        academic_awards = [a.get("name") or a.get("title") or str(a) for a in profile_awards if isinstance(a, dict)]
    all_awards = academic_awards + ec_awards

    # Use normalizers
    academic_awards_norm = normalize_academic_awards(academic_awards)
    ec_awards_norm = normalize_ec_awards(ec_awards)

    # Apply Jenny's formula
    score = 0  # Base is 0 for recognition
    breakdown = {"base": 0}
    strengths = []
    gaps = []

    # Track award levels
    has_national = False
    has_regional = False
    has_finalist = False
    award_count = 0

    for award in all_awards:
        if not award:
            continue
        upper = award.upper()
        award_count += 1

        if any(x in upper for x in ['ISEF', 'USAMO', 'REGENERON', 'INTEL', 'NATIONAL', 'IMO', 'IPHO', 'IOI']):
            has_national = True
        elif any(x in upper for x in ['STATE', 'REGIONAL']):
            has_regional = True
        if 'FINALIST' in upper or 'SEMIFINALIST' in upper:
            has_finalist = True

    # National award bonus (+4)
    if has_national or academic_awards_norm >= 0.85:
        score += 4
        breakdown["national_bonus"] = 4
        strengths.append("National-level recognition")
    else:
        breakdown["national_bonus"] = 0
        gaps.append("No national awards - enter USAMO/Regeneron/ISEF competitions")

    # Regional/State bonus (+2)
    if has_regional or (academic_awards_norm >= 0.60 and academic_awards_norm < 0.85):
        score += 2
        breakdown["regional_bonus"] = 2
        strengths.append("Regional/state recognition")
    else:
        breakdown["regional_bonus"] = 0

    # Finalist bonus (+2)
    if has_finalist:
        score += 2
        breakdown["finalist_bonus"] = 2
        strengths.append("Finalist status in competition")
    else:
        breakdown["finalist_bonus"] = 0

    # Multiple awards bonus (+1 per, max +2)
    if award_count >= 3:
        score += 2
        breakdown["multiple_bonus"] = 2
        strengths.append(f"Multiple recognitions ({award_count})")
    elif award_count >= 2:
        score += 1
        breakdown["multiple_bonus"] = 1
    else:
        breakdown["multiple_bonus"] = 0
        if award_count == 0:
            gaps.append("No awards - this is a critical gap")

    # Cap at 10
    score = min(10, score)

    # Calculate gap
    gap = max(0, IVY_TARGET_SCORE - score)
    weighted_gap = gap * DIMENSION_WEIGHTS["recognition"]

    return DimensionScore(
        dimension="recognition",
        score=score,
        weight=DIMENSION_WEIGHTS["recognition"],
        gap=gap,
        weighted_gap=weighted_gap,
        breakdown=breakdown,
        strengths=strengths,
        gaps_identified=gaps,
    )


# =============================================================================
# MAIN SCORING FUNCTION
# =============================================================================

def calculate_5d_rubric(profile: Dict[str, Any]) -> Rubric5DOutput:
    """
    Calculate complete 5D Rubric score for a profile.

    This is the main entry point for TYPE-085 scoring.

    Args:
        profile: Student profile dictionary (same format as IvyScoreEngine)

    Returns:
        Rubric5DOutput with all dimension scores and gap analysis
    """
    # Score each dimension
    academics = score_academics(profile)
    leadership = score_leadership(profile)
    service = score_service(profile)
    artifacts = score_artifacts(profile)
    recognition = score_recognition(profile)

    # Calculate total
    total_score = (
        academics.score +
        leadership.score +
        service.score +
        artifacts.score +
        recognition.score
    )

    percentage = (total_score / MAX_TOTAL_SCORE) * 100

    # Identify P0 and P1 gaps based on weighted gap
    dimensions = [academics, leadership, service, artifacts, recognition]

    p0_dimensions = [d.dimension for d in dimensions if d.weighted_gap >= 8]
    p1_dimensions = [d.dimension for d in dimensions if 5 <= d.weighted_gap < 8]

    # Find strongest and weakest
    sorted_by_score = sorted(dimensions, key=lambda d: d.score, reverse=True)
    strongest = sorted_by_score[0].dimension
    weakest = sorted_by_score[-1].dimension

    # Determine coaching priority (highest weighted gap)
    sorted_by_gap = sorted(dimensions, key=lambda d: d.weighted_gap, reverse=True)
    coaching_priority = sorted_by_gap[0].dimension

    return Rubric5DOutput(
        academics=academics,
        leadership=leadership,
        service=service,
        artifacts=artifacts,
        recognition=recognition,
        total_score=total_score,
        percentage=round(percentage, 1),
        p0_dimensions=p0_dimensions,
        p1_dimensions=p1_dimensions,
        strongest_dimension=strongest,
        weakest_dimension=weakest,
        coaching_priority=coaching_priority,
    )


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_dimension_closing_actions(dimension: str) -> List[str]:
    """
    Get recommended actions to close gaps for a dimension.

    From TYPE-085 spec.
    """
    actions = {
        "academics": [
            "GPA tutoring for remaining semesters",
            "Enroll in additional AP courses",
            "Intensive SAT/ACT prep for 100+ point improvement",
            "Show upward grade trend",
        ],
        "leadership": [
            "Run for officer position in existing club",
            "Found a new club or initiative",
            "Take on project leadership (even informal)",
            "Commit to multi-year involvement",
        ],
        "service": [
            "Commit to 100+ hours with one organization",
            "Maintain consistent weekly volunteering (5+ hrs)",
            "Document and quantify your impact",
            "Take on volunteer leadership role",
        ],
        "artifacts": [
            "Build and deploy a tangible project",
            "Publish work (blog, research, app)",
            "Get external validation (users, citations)",
            "Start independent research project",
        ],
        "recognition": [
            "Apply to NCWIT/Scholastic/ISEF competitions",
            "Enter AMC/AIME for math recognition",
            "Submit to Regeneron STS",
            "Apply for regional/national awards in your field",
        ],
    }

    return actions.get(dimension, [])


def format_5d_summary(rubric: Rubric5DOutput) -> str:
    """
    Format 5D rubric as human-readable summary for coaching.
    """
    lines = [
        f"5D RUBRIC ASSESSMENT: {rubric.total_score}/50 ({rubric.percentage}%)",
        "",
        "DIMENSION SCORES:",
        f"  Academics:   {rubric.academics.score}/10 (weight {rubric.academics.weight}x)",
        f"  Leadership:  {rubric.leadership.score}/10 (weight {rubric.leadership.weight}x)",
        f"  Service:     {rubric.service.score}/10 (weight {rubric.service.weight}x)",
        f"  Artifacts:   {rubric.artifacts.score}/10 (weight {rubric.artifacts.weight}x)",
        f"  Recognition: {rubric.recognition.score}/10 (weight {rubric.recognition.weight}x)",
        "",
        f"STRONGEST: {rubric.strongest_dimension.title()}",
        f"WEAKEST: {rubric.weakest_dimension.title()}",
        "",
    ]

    if rubric.p0_dimensions:
        lines.append(f"P0 CRITICAL GAPS: {', '.join(d.title() for d in rubric.p0_dimensions)}")
    if rubric.p1_dimensions:
        lines.append(f"P1 HIGH GAPS: {', '.join(d.title() for d in rubric.p1_dimensions)}")

    lines.append(f"\nCOACHING PRIORITY: {rubric.coaching_priority.title()}")

    return "\n".join(lines)


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Models
    "DimensionScore",
    "Rubric5DOutput",
    # Main function
    "calculate_5d_rubric",
    # Utilities
    "get_dimension_closing_actions",
    "format_5d_summary",
    # Constants
    "DIMENSION_WEIGHTS",
    "IVY_TARGET_SCORE",
    "MAX_DIMENSION_SCORE",
    "MAX_TOTAL_SCORE",
]
