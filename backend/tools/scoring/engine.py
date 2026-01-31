# MIRRORS: lib/scoring/engine.ts (939 lines)
# THE MIRROR LAW: This is a line-by-line port. DO NOT MODIFY THE MATH.
"""
IvyLevel Scoring Engine v6.0 - Python Port

Key Formulas (Spec Page 8-9):
- P_base = 1 / (1 + exp(-(0.05 * S - C_j)))  [Sigmoid for rubric score]
- P_final = min(0.95, P_base × ΠMultipliers)  [Capped at 95%]
- Ivy+ Ready Score = Weighted sum of Layer 1 categories (0-100)

Data Sources:
- Chetty (2023): Legacy ROI (5x Harvard), first-gen (1.15x), income top 1% (1.20x)
- CDS 2025: Base acceptance rates (Harvard 4.2%, Stanford 3.9%, MIT 5.7%, etc.)
- SFFA v. Harvard: 1-6 rubric scale for ratings
- NSC: High school saturation data (-0.08 to +0.05 adjustments)
"""

import math
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from pydantic import BaseModel

from backend.tools.scoring.constants import (
    CATEGORY_WEIGHTS,
    NORMALIZED_DEFAULTS,
    SCHOOL_THRESHOLDS,
    VALIDATION_BOUNDS,
)


# =============================================================================
# PYDANTIC MODELS (Type Safety)
# =============================================================================

class CategoryScores(BaseModel):
    """Category scores (0-100 scale)"""
    aptitude: float
    passion: float
    community: float
    narrative: float


class IvyReadyScore(BaseModel):
    """Ivy+ Ready Score result"""
    total_score: float
    category_scores: CategoryScores
    percentile_rank: float


class SFFARubric(BaseModel):
    """SFFA-style rubric ratings (1-6 scale)"""
    academic_rating: int
    extracurricular_rating: int
    athletic_rating: int
    personal_rating: int
    overall_rating: int


class SchoolProbability(BaseModel):
    """Probability result for a single school"""
    school_id: str
    school_name: str
    p_base: float
    p_context: float
    p_final: float
    fit_level: str  # BEST_FIT, STRONG_FIT, TOUGH, WORST_FIT
    fit_reasons: List[str]
    warnings: List[str]
    rubric_score: int
    above_base_rate: float


class ScoreBreakdown(BaseModel):
    """Complete score breakdown for agent use"""
    ivy_plus_score: float  # 0-100
    base_probability: float  # 0.0-1.0
    final_probability: float  # Capped at 0.95
    category_scores: CategoryScores
    percentile_rank: float
    sffa_rubric: Optional[SFFARubric] = None


# =============================================================================
# LAYER 1: ATTRIBUTE NORMALIZATION (0.0-1.0 Rubric Scores)
# MIRRORS: engine.ts lines 39-313
# =============================================================================

def normalize_gpa(gpa_weighted: Optional[float]) -> float:
    """
    Normalize GPA to 0.0-1.0 rubric score
    
    SFFA Rubric Mapping:
    6 (Summa): 4.0+ weighted (top 1%)
    5 (Magna): 3.85-3.99 (top 5%)
    4 (Cum Laude): 3.7-3.84 (top 10%)
    3 (Good): 3.5-3.69 (top 25%)
    2 (Average): 3.0-3.49 (top 50%)
    1 (Below): <3.0
    """
    if gpa_weighted is None:
        return 0.0
    
    # Piecewise linear mapping to match distribution
    if gpa_weighted >= 4.0:
        return 1.0  # Perfect = 1.0
    if gpa_weighted >= 3.85:
        return 0.80 + (gpa_weighted - 3.85) / (4.0 - 3.85) * 0.20  # 0.80-1.0
    if gpa_weighted >= 3.7:
        return 0.60 + (gpa_weighted - 3.7) / (3.85 - 3.7) * 0.20  # 0.60-0.80
    if gpa_weighted >= 3.5:
        return 0.40 + (gpa_weighted - 3.5) / (3.7 - 3.5) * 0.20  # 0.40-0.60
    if gpa_weighted >= 3.0:
        return 0.20 + (gpa_weighted - 3.0) / (3.5 - 3.0) * 0.20  # 0.20-0.40
    return max(0.0, (gpa_weighted - 2.0) / (3.0 - 2.0) * 0.20)  # 0.0-0.20


def normalize_sat(sat_total: Optional[int]) -> float:
    """
    Normalize SAT to 0.0-1.0 rubric score
    
    Percentile Mapping (CollegeBoard 2025):
    1600: 99.9th percentile = 1.0
    1500-1590: 99th percentile = 0.85-0.95
    1400-1490: 95th percentile = 0.70-0.85
    1300-1390: 87th percentile = 0.55-0.70
    1200-1290: 76th percentile = 0.40-0.55
    <1200: <0.40
    """
    if sat_total is None:
        return 0.0
    
    if sat_total >= 1600:
        return 1.0
    if sat_total >= 1500:
        return 0.85 + (sat_total - 1500) / (1600 - 1500) * 0.15
    if sat_total >= 1400:
        return 0.70 + (sat_total - 1400) / (1500 - 1400) * 0.15
    if sat_total >= 1300:
        return 0.55 + (sat_total - 1300) / (1400 - 1300) * 0.15
    if sat_total >= 1200:
        return 0.40 + (sat_total - 1200) / (1300 - 1200) * 0.15
    return max(0.0, (sat_total - 800) / (1200 - 800) * 0.40)


def normalize_rigor(ap_count: Optional[int], ap_avg_score: Optional[float] = None) -> float:
    """
    Normalize AP Rigor to 0.0-1.0
    
    Spec Page 4:
    - AP count weighted 60%, avg score 40%
    - Count: 11+ = 1.0, 8-10 = 0.80, 4-7 = 0.60, 0-3 = 0.20
    - Avg: 5.0 = 1.0, 4.5-4.9 = 0.85, 4.0-4.4 = 0.70, <4.0 = 0.40
    """
    if ap_count is None:
        return 0.0
    
    # Count component (0.60 weight)
    if ap_count >= 11:
        count_score = 1.0
    elif ap_count >= 8:
        count_score = 0.80
    elif ap_count >= 4:
        count_score = 0.60
    else:
        count_score = 0.20
    
    # Avg score component (0.40 weight)
    if ap_avg_score is not None:
        if ap_avg_score >= 5.0:
            avg_score_norm = 1.0
        elif ap_avg_score >= 4.5:
            avg_score_norm = 0.85
        elif ap_avg_score >= 4.0:
            avg_score_norm = 0.70
        else:
            avg_score_norm = 0.40
    else:
        avg_score_norm = 0.70  # Default if unknown
    
    return count_score * 0.60 + avg_score_norm * 0.40


def normalize_academic_awards(awards: List[str]) -> float:
    """
    Normalize Academic Awards to 0.0-1.0
    
    Hierarchy (Spec Page 4 ENUM_LIST):
    - INTERNATIONAL (ISEF, IPhO, IMO): 1.0
    - NATIONAL (USAMO, Regeneron, Intel): 0.85
    - STATE (Science Olympiad State, etc.): 0.60
    - SCHOOL (AP Scholar, Honor Roll): 0.30
    - NONE: 0.0
    """
    if not awards:
        return 0.0
    
    scores = []
    for award in awards:
        upper = award.upper()
        if any(x in upper for x in ['ISEF', 'IPHO', 'IMO', 'IOI', 'INTERNATIONAL']):
            scores.append(1.0)
        elif any(x in upper for x in ['USAMO', 'REGENERON', 'INTEL', 'NATIONAL']):
            scores.append(0.85)
        elif 'STATE' in upper:
            scores.append(0.60)
        elif any(x in upper for x in ['AP SCHOLAR', 'HONOR']):
            scores.append(0.30)
        else:
            scores.append(0.20)  # Generic award
    
    return max(scores)  # Take highest award


def normalize_leadership(level: Optional[str]) -> float:
    """
    Normalize Leadership to 0.0-1.0
    
    Spec Page 5 Hierarchy:
    - FOUNDER_NATIONAL: Founded org with national reach = 1.0
    - FOUNDER_STATE: Founded state-level org = 0.85
    - STATE_PRES: State-level elected position = 0.75
    - SCHOOL_PRES: School president/founder = 0.70
    - OFFICER: Club officer, team captain = 0.50
    - PARTICIPANT: Active member = 0.25
    """
    if not level:
        return 0.0
    
    mapping = {
        'FOUNDER_NATIONAL': 1.0,
        'FOUNDER_STATE': 0.85,
        'STATE_PRES': 0.75,
        'SCHOOL_PRES': 0.70,
        'OFFICER': 0.50,
        'PARTICIPANT': 0.25,
    }
    
    return mapping.get(level, 0.0)


def normalize_project_impact(impact: Optional[int]) -> float:
    """
    Normalize Project Impact to 0.0-1.0
    
    Spec Page 5: People affected scale
    - 10000+: 1.0 (viral impact)
    - 1000-9999: 0.85 (significant reach)
    - 200-999: 0.60 (school-wide)
    - 50-199: 0.40 (class-level)
    - 10-49: 0.20 (small group)
    - <10: 0.10 (minimal)
    """
    if impact is None or impact == 0:
        return 0.0
    
    if impact >= 10000:
        return 1.0
    if impact >= 1000:
        return 0.85 + (math.log10(impact) - 3) / (4 - 3) * 0.15  # Log scale
    if impact >= 200:
        return 0.60 + (impact - 200) / (1000 - 200) * 0.25
    if impact >= 50:
        return 0.40 + (impact - 50) / (200 - 50) * 0.20
    if impact >= 10:
        return 0.20 + (impact - 10) / (50 - 10) * 0.20
    return 0.10 * impact / 10


def normalize_research(level: Optional[str]) -> float:
    """
    Normalize Research Level to 0.0-1.0
    
    Spec Page 5:
    - NATIONAL: Published/Intel/Regeneron = 1.0
    - STATE: State science fair recognition = 0.75
    - SCHOOL: School research program (e.g., COSMOS) = 0.50
    - INDEPENDENT: Self-directed without recognition = 0.30
    - NONE: 0.0
    """
    if not level:
        return 0.0
    
    mapping = {
        'NATIONAL': 1.0,
        'STATE': 0.75,
        'SCHOOL': 0.50,
        'INDEPENDENT': 0.30,
        'NONE': 0.0,
    }
    
    return mapping.get(level, 0.0)


def normalize_ec_commitment(years: Optional[int], hours_weekly: Optional[int] = None) -> float:
    """
    Normalize EC Commitment to 0.0-1.0
    
    Spec Page 5:
    - Years: 4+ = 1.0, 3 = 0.75, 2 = 0.50, 1 = 0.25
    - Hours/week: 15+ = 1.0, 10-14 = 0.80, 5-9 = 0.60, 1-4 = 0.30
    - Combined: 60% years + 40% hours
    """
    if years is None:
        return 0.0
    
    # Years component (0.60 weight)
    if years >= 4:
        years_score = 1.0
    elif years >= 3:
        years_score = 0.75
    elif years >= 2:
        years_score = 0.50
    else:
        years_score = 0.25
    
    # Hours component (0.40 weight)
    hours_score = 0.70  # Default if unknown
    if hours_weekly is not None:
        if hours_weekly >= 15:
            hours_score = 1.0
        elif hours_weekly >= 10:
            hours_score = 0.80
        elif hours_weekly >= 5:
            hours_score = 0.60
        else:
            hours_score = 0.30
    
    return years_score * 0.60 + hours_score * 0.40


def normalize_ec_awards(awards: List[str]) -> float:
    """
    Normalize EC Awards to 0.0-1.0
    Similar to academic awards but for extracurriculars
    """
    if not awards:
        return 0.0
    
    scores = []
    for award in awards:
        upper = award.upper()
        if 'INTERNATIONAL' in upper:
            scores.append(1.0)
        elif 'NATIONAL' in upper:
            scores.append(0.85)
        elif 'STATE' in upper:
            scores.append(0.60)
        elif any(x in upper for x in ['REGIONAL', 'SCHOOL']):
            scores.append(0.30)
        else:
            scores.append(0.20)
    
    return max(scores)


def normalize_service_leadership(level: Optional[str]) -> float:
    """
    Normalize Service Leadership to 0.0-1.0
    
    Spec Page 5:
    - NATIONAL: Founded national service org = 1.0
    - REGIONAL: Regional coordinator = 0.75
    - LOCAL: Local chapter lead = 0.60
    - PARTICIPANT: Volunteer = 0.30
    """
    if not level:
        return 0.0
    
    mapping = {
        'NATIONAL': 1.0,
        'REGIONAL': 0.75,
        'LOCAL': 0.60,
        'PARTICIPANT': 0.30,
    }
    
    return mapping.get(level, 0.0)


def normalize_service_hours(hours: Optional[int]) -> float:
    """
    Normalize Service Hours to 0.0-1.0
    
    Total by graduation:
    - 500+: 1.0
    - 250-499: 0.80
    - 100-249: 0.60
    - 50-99: 0.40
    - <50: 0.20
    """
    if hours is None or hours == 0:
        return 0.0
    
    if hours >= 500:
        return 1.0
    if hours >= 250:
        return 0.80 + (hours - 250) / (500 - 250) * 0.20
    if hours >= 100:
        return 0.60 + (hours - 100) / (250 - 100) * 0.20
    if hours >= 50:
        return 0.40 + (hours - 50) / (100 - 50) * 0.20
    return 0.20 * hours / 50


# Alias
normalize_community_impact = normalize_project_impact


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def safe_percentage(value: float, fallback: float = 0.0) -> float:
    """Clamp value to 0-100 range"""
    if value is None or math.isnan(value):
        return fallback
    return max(0.0, min(100.0, value))


def safe_probability(value: float, fallback: float = 0.0) -> float:
    """Clamp probability to 0-0.95 range (never 100%)"""
    if value is None or math.isnan(value):
        return fallback
    return max(0.0, min(0.95, value))


def weighted_sum(items: List[Dict[str, Any]]) -> float:
    """
    Calculate weighted sum with fallbacks.
    Each item: {value, weight, fallback}
    """
    total = 0.0
    for item in items:
        value = item.get('value')
        weight = item.get('weight', 1.0)
        fallback = item.get('fallback', 0.0)
        
        if value is None:
            value = fallback
        
        total += value * weight
    
    return total


# =============================================================================
# LAYER 2: CATEGORY SCORES (0-100)
# =============================================================================

def calculate_aptitude_score(aptitude: Dict[str, Any]) -> float:
    """
    Calculate Aptitude Category Score (0-100)
    
    Spec Page 4 Weights:
    - GPA: 35%
    - SAT: 30%
    - Rigor: 20%
    - Awards: 15%
    """
    defaults = NORMALIZED_DEFAULTS["aptitude"]
    weights = CATEGORY_WEIGHTS["aptitude"]
    
    score = weighted_sum([
        {"value": aptitude.get("gpa_normalized"), "weight": weights["gpa"], "fallback": defaults["gpa"]},
        {"value": aptitude.get("sat_normalized"), "weight": weights["sat"], "fallback": defaults["sat"]},
        {"value": aptitude.get("rigor_normalized"), "weight": weights["rigor"], "fallback": defaults["rigor"]},
        {"value": aptitude.get("awards_normalized"), "weight": weights["awards"], "fallback": defaults["awards"]},
    ])
    
    return safe_percentage(score * 100, 0)


def calculate_passion_score(passion: Dict[str, Any]) -> float:
    """
    Calculate Passion Category Score (0-100)
    
    Spec Page 5 Weights:
    - Leadership: 35%
    - Projects: 20%
    - Research: 20%
    - EC Commitment: 15%
    - Awards: 10%
    """
    defaults = NORMALIZED_DEFAULTS["passion"]
    weights = CATEGORY_WEIGHTS["passion"]
    
    score = weighted_sum([
        {"value": passion.get("leadership_normalized"), "weight": weights["leadership"], "fallback": defaults["leadership"]},
        {"value": passion.get("project_normalized"), "weight": weights["project"], "fallback": defaults["project"]},
        {"value": passion.get("research_normalized"), "weight": weights["research"], "fallback": defaults["research"]},
        {"value": passion.get("commitment_normalized"), "weight": weights["commitment"], "fallback": defaults["commitment"]},
        {"value": passion.get("ec_awards_normalized"), "weight": weights["awards"], "fallback": defaults["awards"]},
    ])
    
    return safe_percentage(score * 100, 0)


def calculate_community_score(community: Dict[str, Any]) -> float:
    """
    Calculate Community Category Score (0-100)
    
    Spec Page 5 Weights:
    - Service Leadership: 35%
    - Community Impact: 35%
    - Hours: 20%
    - Description Quality: 10% (NLP-derived if available)
    """
    defaults = NORMALIZED_DEFAULTS["community"]
    weights = CATEGORY_WEIGHTS["community"]
    
    score = weighted_sum([
        {"value": community.get("service_normalized"), "weight": weights["service"], "fallback": defaults["service"]},
        {"value": community.get("impact_normalized"), "weight": weights["impact"], "fallback": defaults["impact"]},
        {"value": community.get("hours_normalized"), "weight": weights["hours"], "fallback": defaults["hours"]},
        {"value": None, "weight": weights["description"], "fallback": NORMALIZED_DEFAULTS["narrative"]["description_quality"]},
    ])
    
    return safe_percentage(score * 100, 0)


def predict_narrative_score(psychometrics: Optional[Dict[str, Any]]) -> float:
    """
    Predict Narrative Score (0-100) from Layer 4
    
    Uses psychometric markers:
    - Vision Clarity: 30%
    - Identity Comfort: 25%
    - Articulation Ability: 25%
    - Maturity Level: 20%
    
    Note: This is a prediction; actual essays assessed later in Phase 2
    """
    if psychometrics is None:
        psychometrics = {}
    
    defaults = NORMALIZED_DEFAULTS["narrative"]
    weights = CATEGORY_WEIGHTS["narrative"]
    
    score = weighted_sum([
        {"value": psychometrics.get("vision_clarity"), "weight": weights["vision"], "fallback": defaults["vision_clarity"]},
        {"value": psychometrics.get("identity_comfort"), "weight": weights["identity"], "fallback": defaults["identity_comfort"]},
        {"value": psychometrics.get("articulation_ability"), "weight": weights["articulation"], "fallback": defaults["articulation"]},
        {"value": psychometrics.get("maturity_level"), "weight": weights["maturity"], "fallback": defaults["maturity"]},
    ])
    
    return safe_percentage(score * 100, 50)  # Default to 50 if all fallbacks used


# =============================================================================
# LAYER 3: IVY+ READY SCORE
# =============================================================================

def calculate_ivy_ready_score(profile: Dict[str, Any]) -> IvyReadyScore:
    """
    Calculate Ivy+ Ready Score (Spec Page 8)
    
    School-Agnostic Strength Metric (Dual-Model Controllables)
    Weights average across top schools:
    - Aptitude: ~30%
    - Passion: ~35%
    - Community: ~25%
    - Narrative: ~10%
    """
    weights = CATEGORY_WEIGHTS["overall"]
    
    aptitude_score = calculate_aptitude_score(profile.get("aptitude", {}))
    passion_score = calculate_passion_score(profile.get("passion", {}))
    community_score = calculate_community_score(profile.get("community", {}))
    
    # Get psychometrics from assessment_intelligence if available
    assessment_intel = profile.get("assessment_intelligence", {})
    psychometrics = assessment_intel.get("psychometrics", {})
    narrative_score = predict_narrative_score(psychometrics)
    
    # Weighted sum
    total_score = safe_percentage(
        aptitude_score * weights["aptitude"] +
        passion_score * weights["passion"] +
        community_score * weights["community"] +
        narrative_score * weights["narrative"],
        50
    )
    
    # Percentile estimation (relative to Ivy applicant pool)
    # Based on Chetty data: median Ivy applicant ~55, admit ~75
    percentile_rank = min(99, max(1, (total_score - 40) / (90 - 40) * 90 + 5))
    
    return IvyReadyScore(
        total_score=total_score,
        category_scores=CategoryScores(
            aptitude=aptitude_score,
            passion=passion_score,
            community=community_score,
            narrative=narrative_score,
        ),
        percentile_rank=percentile_rank,
    )


# =============================================================================
# LAYER 4: SFFA RUBRIC (1-6 Scale)
# =============================================================================

def calculate_sffa_rubric(profile: Dict[str, Any]) -> SFFARubric:
    """
    Calculate SFFA-Style Rubric Ratings (1-6 scale)
    
    Used by Harvard and similar schools in holistic review
    Spec Page 8: Academic, EC, Athletic, Personal, Overall
    """
    # Academic Rating (1-6)
    aptitude_score = calculate_aptitude_score(profile.get("aptitude", {}))
    academic_rating = min(6, max(1, math.ceil(aptitude_score / 100 * 6)))
    
    # Extracurricular Rating (1-6)
    passion_score = calculate_passion_score(profile.get("passion", {}))
    extracurricular_rating = min(6, max(1, math.ceil(passion_score / 100 * 6)))
    
    # Athletic Rating (1-6) - Default 3 unless recruited athlete
    demographics = profile.get("demographics", {})
    is_athlete = demographics.get("recruited_athlete", False)
    athletic_rating = 5 if is_athlete else 3
    
    # Personal Rating (1-6)
    community_score = calculate_community_score(profile.get("community", {}))
    assessment_intel = profile.get("assessment_intelligence", {})
    psychometrics = assessment_intel.get("psychometrics", {})
    coachability = psychometrics.get("coachability_score", 0.70)
    personal_composite = community_score * 0.60 + coachability * 100 * 0.40
    personal_rating = min(6, max(1, math.ceil(personal_composite / 100 * 6)))
    
    # Overall Rating (1-6) - weighted average
    overall_composite = (
        academic_rating * 0.30 +
        extracurricular_rating * 0.35 +
        athletic_rating * 0.10 +
        personal_rating * 0.25
    )
    overall_rating = min(6, max(1, round(overall_composite)))
    
    return SFFARubric(
        academic_rating=academic_rating,
        extracurricular_rating=extracurricular_rating,
        athletic_rating=athletic_rating,
        personal_rating=personal_rating,
        overall_rating=overall_rating,
    )


def rubric_to_composite(rubric: SFFARubric) -> float:
    """
    Convert SFFA Rubric to Composite Score (0-100)
    For sigmoid probability calculation
    """
    composite_rating = (
        rubric.academic_rating * 0.30 +
        rubric.extracurricular_rating * 0.35 +
        rubric.athletic_rating * 0.10 +
        rubric.personal_rating * 0.25
    )
    
    # Map 1-6 to 0-100: (rating - 1) / 5 * 100
    return ((composite_rating - 1) / 5) * 100


# =============================================================================
# LAYER 5 & 6: PROBABILITY CALCULATION
# =============================================================================

def calculate_base_probability(rubric_composite: float, school_id: str) -> float:
    """
    Calculate base probability from rubric score using sigmoid
    
    Formula: P_base = 1 / (1 + exp(-(0.05 * S - C_j)))
    
    Where:
    - S: Student rubric composite (0-100)
    - C_j: School acceptance threshold constant
    """
    c_j = SCHOOL_THRESHOLDS.get(school_id, 3.0)  # Default conservative
    s = rubric_composite
    
    # Sigmoid: P = 1 / (1 + exp(-(0.05 * S - C_j)))
    exponent = -(0.05 * s - c_j)
    p_base = 1 / (1 + math.exp(exponent))
    
    return p_base


def calculate_context_multipliers(profile: Dict[str, Any], school_config: Dict[str, Any]) -> float:
    """
    Calculate all context multipliers for a given student
    
    Chetty 2023 Data (Spec Page 6):
    - Legacy: 5.0x at Harvard/Yale/Princeton, 0x at MIT/Caltech
    - First-Gen: 1.15x universal
    - Athlete: 2.5x recruited
    - Ethnicity: Asian 0.85x in STEM-saturated, URM 1.15x
    - Income Top 1%: 1.20x (network effect)
    - Saturation: -0.08 to +0.05 (NSC data)
    - Major: CS 0.55x Stanford, 0.70x MIT, etc.
    """
    multiplier = 1.0
    demographics = profile.get("demographics", {})
    
    # Legacy (school-specific, Chetty 2023)
    if demographics.get("legacy", False):
        legacy_schools = demographics.get("legacy_schools", [])
        if school_config.get("school_id") in legacy_schools:
            multiplier *= school_config.get("legacy_roi", 1.0)
    
    # First-Gen (universal 1.15x)
    if demographics.get("first_gen", False):
        multiplier *= demographics.get("first_gen_multiplier", 1.15)
    
    # Recruited Athlete (2.5x)
    if demographics.get("recruited_athlete", False):
        multiplier *= school_config.get("athlete_roi", 2.5)
    
    # Ethnicity
    multiplier *= demographics.get("ethnicity_multiplier", 1.0)
    
    # Income Top 1% (network ROI, Chetty)
    if demographics.get("income_top_1_percent", False):
        multiplier *= demographics.get("income_multiplier", 1.20)
    
    # High School Saturation (NSC data)
    high_school = profile.get("high_school", {})
    saturation_adjustment = high_school.get("saturation_adjustment", 0.0)
    multiplier *= (1 + saturation_adjustment)
    
    # Major Multiplier (school-specific)
    intended_major = profile.get("intended_major", "")
    major_multipliers = school_config.get("major_multipliers", {})
    major_mult = major_multipliers.get(intended_major, 1.0)
    multiplier *= major_mult
    
    return multiplier


def calculate_final_probability(p_base: float, multiplier: float) -> float:
    """
    Calculate final probability with context multipliers
    
    Formula: P_final = min(0.95, P_base × Π Multipliers)
    
    Capped at 95% (no certainty in admissions per spec)
    """
    p_final = min(0.95, p_base * multiplier)
    return p_final


def determine_fit_level(p_final: float, base_rate: float) -> str:
    """
    Determine school fit level based on probability
    
    Spec Page 9:
    - BEST_FIT: ≥15% (3.5x+ base rate)
    - STRONG_FIT: 10-14.9% (2.5-3.5x base)
    - TOUGH: 5-9.9% (1.2-2.5x base)
    - WORST_FIT: <5% (<1.2x base or below base)
    """
    if p_final >= 0.15:
        return "BEST_FIT"
    if p_final >= 0.10:
        return "STRONG_FIT"
    if p_final >= 0.05:
        return "TOUGH"
    return "WORST_FIT"


# =============================================================================
# MAIN ENGINE CLASS
# =============================================================================

class IvyScoreEngine:
    """
    The Scoring Engine used by Agents.
    
    Implements the 7-layer architecture:
    1. Attribute Normalization (0.0-1.0)
    2. Category Scores (0-100%)
    3. Ivy+ Ready Score (0-100)
    4. SFFA Rubric (1-6 scale)
    5. Base Probability (Sigmoid)
    6. Context Multipliers (Chetty 2023)
    7. Final Probability (Capped 95%)
    """
    
    def __init__(self):
        """Initialize the engine with category weights."""
        self.weights = CATEGORY_WEIGHTS["overall"]
    
    def normalize_profile(self, raw_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize a raw profile dictionary.
        Converts raw values to 0.0-1.0 normalized scores.
        """
        profile = raw_profile.copy()
        
        # Normalize aptitude
        aptitude = profile.get("aptitude", {})
        aptitude["gpa_normalized"] = normalize_gpa(aptitude.get("gpa_weighted"))
        aptitude["sat_normalized"] = normalize_sat(aptitude.get("sat_total"))
        aptitude["rigor_normalized"] = normalize_rigor(
            aptitude.get("ap_count"),
            aptitude.get("ap_avg_score")
        )
        aptitude["awards_normalized"] = normalize_academic_awards(
            aptitude.get("academic_awards", [])
        )
        profile["aptitude"] = aptitude
        
        # Normalize passion
        passion = profile.get("passion", {})
        passion["leadership_normalized"] = normalize_leadership(passion.get("leadership_level"))
        passion["project_normalized"] = normalize_project_impact(passion.get("project_impact"))
        passion["research_normalized"] = normalize_research(passion.get("research_level"))
        passion["commitment_normalized"] = normalize_ec_commitment(
            passion.get("ec_commitment_years"),
            passion.get("ec_hours_weekly")
        )
        passion["ec_awards_normalized"] = normalize_ec_awards(passion.get("ec_awards", []))
        profile["passion"] = passion
        
        # Normalize community
        community = profile.get("community", {})
        community["service_normalized"] = normalize_service_leadership(community.get("service_leadership"))
        community["hours_normalized"] = normalize_service_hours(community.get("service_hours"))
        community["impact_normalized"] = normalize_community_impact(community.get("community_impact"))
        profile["community"] = community
        
        return profile
    
    def calculate(self, profile_data: Dict[str, Any]) -> ScoreBreakdown:
        """
        Calculate complete score breakdown for a profile.
        
        Args:
            profile_data: Raw or normalized student profile
            
        Returns:
            ScoreBreakdown with all scoring information
        """
        # Normalize if needed
        profile = self.normalize_profile(profile_data)
        
        # Layer 3: Ivy+ Ready Score
        ivy_ready = calculate_ivy_ready_score(profile)
        
        # Layer 4: SFFA Rubric
        sffa_rubric = calculate_sffa_rubric(profile)
        rubric_composite = rubric_to_composite(sffa_rubric)
        
        # Layer 5: Base Probability (using Harvard as default)
        base_prob = calculate_base_probability(rubric_composite, "HARVARD")
        
        # Layer 6: Context Multipliers
        multiplier = 1.0
        demographics = profile.get("demographics", {})
        if demographics.get("first_gen", False):
            multiplier *= 1.15
        if demographics.get("recruited_athlete", False):
            multiplier *= 2.5
        
        # Layer 7: Final Probability
        final_prob = calculate_final_probability(base_prob, multiplier)
        
        return ScoreBreakdown(
            ivy_plus_score=round(ivy_ready.total_score, 1),
            base_probability=round(base_prob, 4),
            final_probability=round(final_prob, 4),
            category_scores=ivy_ready.category_scores,
            percentile_rank=round(ivy_ready.percentile_rank, 1),
            sffa_rubric=sffa_rubric,
        )
    
    def forecast_boost(self, current_profile: Dict[str, Any], new_project: Dict[str, Any]) -> int:
        """
        Used by ECAgent to simulate "What if I do this project?"
        Returns the Delta (Score After - Score Before).
        
        Args:
            current_profile: The student's current profile
            new_project: The hypothetical project to add
            
        Returns:
            Integer delta (new_score - old_score)
        """
        # 1. Calculate Baseline
        base_result = self.calculate(current_profile)
        
        # 2. Create Hypothetical Profile
        simulated_profile = current_profile.copy()
        
        # Merge new project into profile
        passion = simulated_profile.get("passion", {}).copy()
        
        # Update project impact if new project has higher impact
        current_impact = passion.get("project_impact", 0) or 0
        new_impact = new_project.get("project_impact", 0) or 0
        if new_impact > current_impact:
            passion["project_impact"] = new_impact
        
        # Update leadership if new project elevates level
        leadership_levels = {
            None: 0, "PARTICIPANT": 1, "OFFICER": 2, 
            "SCHOOL_PRES": 3, "STATE_PRES": 4, 
            "FOUNDER_STATE": 5, "FOUNDER_NATIONAL": 6
        }
        current_level = passion.get("leadership_level")
        new_level = new_project.get("leadership_level")
        if leadership_levels.get(new_level, 0) > leadership_levels.get(current_level, 0):
            passion["leadership_level"] = new_level
        
        # Update research if applicable
        research_levels = {
            None: 0, "NONE": 0, "INDEPENDENT": 1, 
            "SCHOOL": 2, "STATE": 3, "NATIONAL": 4
        }
        current_research = passion.get("research_level")
        new_research = new_project.get("research_level")
        if research_levels.get(new_research, 0) > research_levels.get(current_research, 0):
            passion["research_level"] = new_research
        
        simulated_profile["passion"] = passion
        
        # Also update community if applicable
        if new_project.get("service_hours"):
            community = simulated_profile.get("community", {}).copy()
            current_hours = community.get("service_hours", 0) or 0
            community["service_hours"] = current_hours + new_project["service_hours"]
            simulated_profile["community"] = community
        
        # 3. Calculate New Score
        new_result = self.calculate(simulated_profile)
        
        return int(new_result.ivy_plus_score - base_result.ivy_plus_score)
    
    def get_category_gaps(self, profile: Dict[str, Any]) -> Dict[str, float]:
        """
        Identify which categories have the biggest gaps from 100.
        Used to prioritize EC recommendations.
        """
        result = self.calculate(profile)
        scores = result.category_scores
        
        return {
            "aptitude": 100 - scores.aptitude,
            "passion": 100 - scores.passion,
            "community": 100 - scores.community,
            "narrative": 100 - scores.narrative,
        }
