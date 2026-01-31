# IvyLevel Program Selection Matrix v1.0
# LAYER: Scoring Primitives (TYPE-028)
"""
Program Selection Matrix - Multi-Dimensional Summer Program Scoring.

Implements TYPE-028: Multi-dimensional scoring system for evaluating
summer programs across alignment, selectivity, impact, and feasibility.

Framework: 4-Dimension Scoring System
- Alignment (×4): Profile fit × interest match
- Selectivity_Fit (×3): Admit rate calibrated to student competitiveness
- Impact (×3): College admissions boost estimation (T1=10, T2=7, T3=5, T4=3)
- Feasibility (×2): Cost, time commitment, logistics

Core Algorithm:
Program Score = (Alignment × 4) + (Selectivity_Fit × 3) + (Impact × 3) + (Feasibility × 2)
Max Score: 120 points

Program Tiers (Based on Selectivity + Impact):
- T1 Elite: <5% admit rate, significant Ivy boost (RSI, TASP, MOSTEC)
- T2 Selective: 5-20% admit rate, notable boost (YYGS, SSP, Garcia)
- T3 Competitive: 20-50% admit rate, modest boost (Governor's Schools)
- T4 Pay-to-Play: >50% admit or fee-based with low selectivity

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - deterministic calculations
- Integrates with programs_enriched.json database
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum


# =============================================================================
# ENUMS
# =============================================================================

class ProgramTier(str, Enum):
    """Program tier classification based on selectivity and impact."""
    T1_ELITE = "T1"       # RSI, TASP, MOSTEC - <5% admit, +35-50 impact
    T2_SELECTIVE = "T2"   # YYGS, SSP, Garcia - 5-20% admit, +15-25 impact
    T3_COMPETITIVE = "T3" # Governor's Schools, etc - 20-50% admit, +5-15 impact
    T4_PAYTOP_LAY = "T4"  # Commercial camps - >50% or pay-to-play, minimal impact


class SelectivityCategory(str, Enum):
    """How program selectivity matches student competitiveness."""
    REACH = "reach"       # <50% chance student gets in
    MATCH = "match"       # 50-80% chance
    SAFETY = "safety"     # >80% chance


class ProgramType(str, Enum):
    """Type of summer program."""
    RESEARCH = "research"         # Lab/research programs (RSI, Garcia)
    ACADEMIC = "academic"         # Academic/humanities (TASP, Stanford Humanities)
    LEADERSHIP = "leadership"     # Leadership focused (YYGS, NSLC)
    ENTREPRENEURSHIP = "entrepreneurship"  # Startup/business (LaunchX, Wharton)
    STEM = "stem"                 # General STEM (SSP, COSMOS)
    ARTS = "arts"                 # Arts programs (RISD pre-college)
    HYBRID = "hybrid"             # Mixed focus


class ScamRiskLevel(str, Enum):
    """Risk level for pay-to-play or low-value programs."""
    SAFE = "safe"                 # Free/highly selective
    LOW_RISK = "low_risk"         # Modest fee, good reputation
    MEDIUM_RISK = "medium_risk"   # High fee but some value
    HIGH_RISK = "high_risk"       # Very expensive, minimal selectivity
    SCAM = "scam"                 # Known scam patterns


# =============================================================================
# CONSTANTS
# =============================================================================

# Tier criteria
TIER_CRITERIA = {
    ProgramTier.T1_ELITE: {
        "admit_rate_max": 0.05,
        "impact_score": 10,
        "ivy_boost_points": 35,
        "examples": ["RSI", "TASP", "MOSTEC", "Clark Scholars", "SuMac"],
        "description": "Most prestigious programs - significant Ivy differentiator",
    },
    ProgramTier.T2_SELECTIVE: {
        "admit_rate_max": 0.20,
        "impact_score": 7,
        "ivy_boost_points": 20,
        "examples": ["YYGS", "SSP", "Garcia", "Columbia SHP", "SIMR"],
        "description": "Highly selective - valuable for competitive applications",
    },
    ProgramTier.T3_COMPETITIVE: {
        "admit_rate_max": 0.50,
        "impact_score": 5,
        "ivy_boost_points": 10,
        "examples": ["Governor's Schools", "State programs", "Pre-college courses"],
        "description": "Competitive but accessible - baseline expectation for top applicants",
    },
    ProgramTier.T4_PAYTOP_LAY: {
        "admit_rate_max": 1.0,
        "impact_score": 3,
        "ivy_boost_points": 2,
        "examples": ["Commercial summer camps", "Pay-to-attend programs"],
        "description": "Minimal selectivity - limited college admissions impact",
    },
}

# Selectivity fit thresholds
SELECTIVITY_FIT_THRESHOLDS = {
    # (student_competitiveness - program_min_competitiveness) ranges
    "strong_match": 2,    # Gap >= 2 → strong match
    "match": 0,           # Gap >= 0 → match
    "slight_reach": -2,   # Gap >= -2 → slight reach
    "reach": -4,          # Below this = significant reach
}

# Cost thresholds for feasibility scoring
COST_THRESHOLDS = {
    "free": 0,
    "low": 500,
    "moderate": 2500,
    "high": 5000,
    "very_high": 10000,
}

# Scam detection patterns
SCAM_PATTERNS = {
    "keywords": [
        "pay-to-play", "leadership summit", "global scholar",
        "world leadership", "national leadership", "elite scholars",
    ],
    "price_threshold": 5000,  # >$5000 without selectivity = red flag
    "admit_rate_threshold": 0.80,  # >80% admit = not selective
}

# Program scoring weights
DIMENSION_WEIGHTS = {
    "alignment": 4,
    "selectivity_fit": 3,
    "impact": 3,
    "feasibility": 2,
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class ProgramDimensionScores(BaseModel):
    """Individual dimension scores for a program."""
    alignment: float = Field(ge=0.0, le=10.0, description="Profile fit score")
    selectivity_fit: float = Field(ge=0.0, le=10.0, description="Selectivity calibration")
    impact: float = Field(ge=0.0, le=10.0, description="College admissions impact")
    feasibility: float = Field(ge=0.0, le=10.0, description="Cost/logistics score")


class ProgramScoringResult(BaseModel):
    """Complete scoring result for a single program."""
    program_id: str = ""
    program_name: str
    tier: ProgramTier
    tier_confidence: float = Field(ge=0.0, le=1.0, default=0.8)

    # Scores
    total_score: float = Field(ge=0.0, le=120.0)
    dimension_scores: ProgramDimensionScores

    # Selectivity
    selectivity_category: SelectivityCategory
    admit_rate: Optional[float] = None

    # Details
    program_type: ProgramType
    cost: Optional[str] = None
    deadline: Optional[str] = None
    duration: Optional[str] = None

    # Why recommended
    why_recommended: str
    strategic_positioning: str

    # Warnings
    scam_risk: ScamRiskLevel = ScamRiskLevel.SAFE
    red_flags: List[str] = Field(default_factory=list)


class ProgramSelectionOutput(BaseModel):
    """
    Complete program selection matrix output.
    Consumed by ProgramsAgent for strategic recommendations.
    """
    # Scored programs by tier
    tier_1_programs: List[ProgramScoringResult] = Field(default_factory=list)
    tier_2_programs: List[ProgramScoringResult] = Field(default_factory=list)
    tier_3_programs: List[ProgramScoringResult] = Field(default_factory=list)
    tier_4_programs: List[ProgramScoringResult] = Field(default_factory=list)

    # Summary
    total_evaluated: int = 0
    total_recommended: int = 0

    # Portfolio balance
    reach_count: int = 0
    match_count: int = 0
    safety_count: int = 0

    # Student competitiveness used
    student_competitiveness: float = 5.0

    # Scam warnings
    programs_flagged: List[str] = Field(default_factory=list)

    # Recommendations
    strategic_recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# SCORING FUNCTIONS
# =============================================================================

def score_program(program: Dict[str, Any],
                  profile: Dict[str, Any],
                  student_competitiveness: float = 5.0) -> ProgramScoringResult:
    """
    Score a single program using multi-dimensional algorithm.

    Formula: Total = (Alignment × 4) + (Selectivity_Fit × 3) + (Impact × 3) + (Feasibility × 2)
    Max Score: 120 points

    Args:
        program: Program dict from database
        profile: Student profile with activities, interests, archetype
        student_competitiveness: 0-10 scale (from assessment)

    Returns:
        ProgramScoringResult with complete scoring
    """
    name = program.get("name", "Unknown Program")

    # 1. Classify program tier
    tier, tier_confidence = classify_program_tier(program)

    # 2. Score each dimension
    alignment = score_alignment(program, profile)
    selectivity_fit, selectivity_category = score_selectivity_fit(
        program, student_competitiveness
    )
    impact = score_impact(tier)
    feasibility = score_feasibility(program)

    # 3. Calculate total score
    total = (
        alignment * DIMENSION_WEIGHTS["alignment"] +
        selectivity_fit * DIMENSION_WEIGHTS["selectivity_fit"] +
        impact * DIMENSION_WEIGHTS["impact"] +
        feasibility * DIMENSION_WEIGHTS["feasibility"]
    )

    # 4. Check scam risk
    scam_risk, red_flags = assess_scam_risk(program)

    # 5. Determine program type
    program_type = classify_program_type(program)

    # 6. Generate recommendations
    why_recommended = generate_why_recommended(
        alignment, selectivity_fit, impact, tier, program_type
    )
    strategic_positioning = generate_strategic_positioning(
        tier, selectivity_category, program_type
    )

    return ProgramScoringResult(
        program_id=program.get("id", ""),
        program_name=name,
        tier=tier,
        tier_confidence=tier_confidence,
        total_score=round(total, 1),
        dimension_scores=ProgramDimensionScores(
            alignment=alignment,
            selectivity_fit=selectivity_fit,
            impact=impact,
            feasibility=feasibility
        ),
        selectivity_category=selectivity_category,
        admit_rate=program.get("acceptance_rate"),
        program_type=program_type,
        cost=program.get("cost", program.get("fee")),
        deadline=program.get("deadline", program.get("timeline")),
        duration=program.get("duration"),
        why_recommended=why_recommended,
        strategic_positioning=strategic_positioning,
        scam_risk=scam_risk,
        red_flags=red_flags
    )


def classify_program_tier(program: Dict[str, Any]) -> Tuple[ProgramTier, float]:
    """
    Classify program into T1-T4 tier based on selectivity and prestige.

    Uses:
    - Accept rate / selectivity
    - Prestige score (if available)
    - Known T1/T2 program names

    Returns:
        (ProgramTier, confidence)
    """
    name = program.get("name", "").lower()
    accept_rate = program.get("acceptance_rate", 0.5)
    prestige = program.get("prestige_score", 5)
    strategic_tier = program.get("strategic_tier")  # Database override

    # Check for database tier override
    if strategic_tier:
        tier_map = {1: ProgramTier.T1_ELITE, 2: ProgramTier.T2_SELECTIVE,
                    3: ProgramTier.T3_COMPETITIVE, 4: ProgramTier.T4_PAYTOP_LAY}
        return tier_map.get(strategic_tier, ProgramTier.T3_COMPETITIVE), 0.95

    # Check known T1 programs
    t1_names = ["rsi", "tasp", "mostec", "clark scholars", "sumac", "ross math",
                "canada/usa mathcamp", "hampshire college", "telluride"]
    if any(t1 in name for t1 in t1_names):
        return ProgramTier.T1_ELITE, 0.98

    # Check known T2 programs
    t2_names = ["yygs", "ssp", "garcia", "columbia shp", "simr", "stanford summer",
                "mit launch", "wharton", "governor", "cosmos"]
    if any(t2 in name for t2 in t2_names):
        return ProgramTier.T2_SELECTIVE, 0.90

    # Use accept rate
    if accept_rate <= 0.05:
        return ProgramTier.T1_ELITE, 0.85
    elif accept_rate <= 0.20:
        return ProgramTier.T2_SELECTIVE, 0.80
    elif accept_rate <= 0.50:
        return ProgramTier.T3_COMPETITIVE, 0.75
    else:
        return ProgramTier.T4_PAYTOP_LAY, 0.70


def score_alignment(program: Dict[str, Any], profile: Dict[str, Any]) -> float:
    """
    Score how well program aligns with student profile (0-10).

    Factors:
    - Archetype match
    - Interest/domain match
    - Activity alignment
    """
    score = 5.0  # Baseline

    # Get program attributes
    program_type = program.get("type", "").lower()
    program_category = program.get("category", "").lower()
    program_focus = program.get("focus_areas", [])
    archetype_fit = program.get("archetype_fit", {})

    # Get student attributes
    archetype = profile.get("archetype", {})
    archetype_id = archetype.get("id", "").lower() if isinstance(archetype, dict) else str(archetype).lower()
    interests = profile.get("interests", [])
    activities = profile.get("activities", [])

    # Check archetype fit from database
    if archetype_id and archetype_fit:
        db_fit = archetype_fit.get(archetype_id, 0)
        if db_fit >= 0.8:
            score += 3.0
        elif db_fit >= 0.5:
            score += 1.5

    # Check interest alignment
    student_interests = " ".join([str(i) for i in interests]).lower()
    program_text = f"{program_category} {' '.join(str(f) for f in program_focus)}"

    interest_keywords = {
        "research": ["research", "science", "lab", "experiment"],
        "cs": ["computer", "coding", "programming", "tech", "ai"],
        "business": ["business", "entrepreneur", "startup", "leadership"],
        "humanities": ["writing", "humanities", "philosophy", "history"],
        "arts": ["art", "creative", "design", "film", "music"],
    }

    for category, keywords in interest_keywords.items():
        if any(kw in student_interests for kw in keywords):
            if any(kw in program_text for kw in keywords):
                score += 1.5
                break

    return min(10.0, score)


def score_selectivity_fit(program: Dict[str, Any],
                          student_competitiveness: float) -> Tuple[float, SelectivityCategory]:
    """
    Score how well student competitiveness matches program selectivity (0-10).

    Logic:
    - T1 programs (RSI): Need competitiveness 8+ for "match"
    - T2 programs: Need competitiveness 6+ for "match"
    - Below threshold = "reach", score reduced

    Returns:
        (selectivity_fit_score, selectivity_category)
    """
    accept_rate = program.get("acceptance_rate", 0.5)
    prestige = program.get("prestige_score", 5)

    # Estimate minimum competitiveness needed
    if accept_rate < 0.05:
        min_competitiveness = 8.5
    elif accept_rate < 0.15:
        min_competitiveness = 7.0
    elif accept_rate < 0.30:
        min_competitiveness = 6.0
    elif accept_rate < 0.50:
        min_competitiveness = 5.0
    else:
        min_competitiveness = 3.0

    # Calculate gap
    gap = student_competitiveness - min_competitiveness

    # Determine category
    if gap >= 2:
        category = SelectivityCategory.SAFETY
        score = 10.0
    elif gap >= 0:
        category = SelectivityCategory.MATCH
        score = 8.0
    elif gap >= -2:
        category = SelectivityCategory.REACH
        score = 6.0
    else:
        category = SelectivityCategory.REACH
        score = 4.0

    return score, category


def score_impact(tier: ProgramTier) -> float:
    """
    Score college admissions impact (0-10).

    Based on tier:
    - T1: 10 points
    - T2: 7 points
    - T3: 5 points
    - T4: 3 points
    """
    return TIER_CRITERIA[tier]["impact_score"]


def score_feasibility(program: Dict[str, Any]) -> float:
    """
    Score feasibility based on cost and logistics (0-10).

    Free programs = 10
    <$500 = 9
    <$2500 = 7
    <$5000 = 5
    <$10000 = 3
    >$10000 = 2
    """
    cost = program.get("cost", program.get("fee", 0))

    # Parse cost string if needed
    if isinstance(cost, str):
        cost_lower = cost.lower()
        if "free" in cost_lower or "funded" in cost_lower:
            cost = 0
        else:
            # Extract number from string like "$6,500"
            import re
            numbers = re.findall(r'[\d,]+', cost)
            if numbers:
                cost = int(numbers[0].replace(",", ""))
            else:
                cost = 0

    # Score by cost threshold
    if cost == 0:
        return 10.0
    elif cost < COST_THRESHOLDS["low"]:
        return 9.0
    elif cost < COST_THRESHOLDS["moderate"]:
        return 7.0
    elif cost < COST_THRESHOLDS["high"]:
        return 5.0
    elif cost < COST_THRESHOLDS["very_high"]:
        return 3.0
    else:
        return 2.0


def assess_scam_risk(program: Dict[str, Any]) -> Tuple[ScamRiskLevel, List[str]]:
    """
    Assess scam/pay-to-play risk for a program.

    Red flags:
    - High cost (>$5000) + low selectivity (>80%)
    - Known scam keywords
    - No clear academic rigor

    Returns:
        (ScamRiskLevel, list of red flags)
    """
    name = program.get("name", "").lower()
    description = program.get("description", "").lower()
    combined = f"{name} {description}"

    cost = program.get("cost", program.get("fee", 0))
    accept_rate = program.get("acceptance_rate", 0.5)

    # Parse cost
    if isinstance(cost, str):
        import re
        numbers = re.findall(r'[\d,]+', cost)
        cost = int(numbers[0].replace(",", "")) if numbers else 0

    red_flags = []
    risk_score = 0

    # Check scam keywords
    for keyword in SCAM_PATTERNS["keywords"]:
        if keyword in combined:
            red_flags.append(f"Suspicious keyword: '{keyword}'")
            risk_score += 2

    # High cost + low selectivity
    if cost > SCAM_PATTERNS["price_threshold"] and accept_rate > SCAM_PATTERNS["admit_rate_threshold"]:
        red_flags.append(f"High cost (${cost}) with low selectivity ({accept_rate*100:.0f}%)")
        risk_score += 3

    # Just high cost
    if cost > 8000:
        red_flags.append(f"Very expensive (${cost}) - verify value proposition")
        risk_score += 1

    # Determine risk level
    if risk_score >= 5:
        return ScamRiskLevel.SCAM, red_flags
    elif risk_score >= 3:
        return ScamRiskLevel.HIGH_RISK, red_flags
    elif risk_score >= 2:
        return ScamRiskLevel.MEDIUM_RISK, red_flags
    elif risk_score >= 1:
        return ScamRiskLevel.LOW_RISK, red_flags
    else:
        return ScamRiskLevel.SAFE, []


def classify_program_type(program: Dict[str, Any]) -> ProgramType:
    """Classify program into type category."""
    program_type = program.get("type", "").lower()
    name = program.get("name", "").lower()
    description = program.get("description", "").lower()
    combined = f"{name} {description} {program_type}"

    if "research" in combined or "lab" in combined:
        return ProgramType.RESEARCH
    elif "entrepreneur" in combined or "startup" in combined or "launch" in combined:
        return ProgramType.ENTREPRENEURSHIP
    elif "leadership" in combined:
        return ProgramType.LEADERSHIP
    elif "humanities" in combined or "writing" in combined or "philosophy" in combined:
        return ProgramType.ACADEMIC
    elif "art" in combined or "design" in combined or "creative" in combined:
        return ProgramType.ARTS
    elif "science" in combined or "math" in combined or "stem" in combined:
        return ProgramType.STEM
    else:
        return ProgramType.HYBRID


def generate_why_recommended(alignment: float, selectivity_fit: float,
                               impact: float, tier: ProgramTier,
                               program_type: ProgramType) -> str:
    """Generate recommendation reason."""
    reasons = []

    if alignment >= 8:
        reasons.append("Exceptional profile match")
    elif alignment >= 6:
        reasons.append("Strong profile alignment")

    if selectivity_fit >= 8:
        reasons.append("Good selectivity fit")
    elif selectivity_fit >= 6:
        reasons.append("Reasonable admit probability")

    if impact >= 9:
        reasons.append(f"Maximum admissions impact ({tier.value} tier)")
    elif impact >= 7:
        reasons.append(f"Strong admissions boost ({tier.value} tier)")

    return ", ".join(reasons) if reasons else "Meets basic criteria"


def generate_strategic_positioning(tier: ProgramTier,
                                     selectivity: SelectivityCategory,
                                     program_type: ProgramType) -> str:
    """Generate strategic advice for application."""
    if tier == ProgramTier.T1_ELITE:
        return "T1 program - emphasize research depth and national recognition. Strong LORs critical."
    elif tier == ProgramTier.T2_SELECTIVE:
        return "T2 program - highlight leadership and clear goals. Connect to intended major."
    elif tier == ProgramTier.T3_COMPETITIVE:
        return "T3 program - solid credential but supplement with self-directed projects."
    else:
        return "Consider higher-impact alternatives if budget allows."


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_program_selection(programs: List[Dict[str, Any]],
                               profile: Dict[str, Any],
                               student_competitiveness: float = 5.0) -> ProgramSelectionOutput:
    """
    Analyze multiple programs and generate selection matrix.

    Args:
        programs: List of program dicts from database
        profile: Student profile
        student_competitiveness: 0-10 assessment score

    Returns:
        ProgramSelectionOutput with tiered recommendations
    """
    if not programs:
        return ProgramSelectionOutput(
            strategic_recommendations=["No programs to evaluate - check database connection"]
        )

    # Score all programs
    scored = [score_program(p, profile, student_competitiveness) for p in programs]

    # Sort by total score
    scored.sort(key=lambda x: x.total_score, reverse=True)

    # Bucket by tier
    t1 = [p for p in scored if p.tier == ProgramTier.T1_ELITE]
    t2 = [p for p in scored if p.tier == ProgramTier.T2_SELECTIVE]
    t3 = [p for p in scored if p.tier == ProgramTier.T3_COMPETITIVE]
    t4 = [p for p in scored if p.tier == ProgramTier.T4_PAYTOP_LAY]

    # Count selectivity balance
    reach_count = sum(1 for p in scored if p.selectivity_category == SelectivityCategory.REACH)
    match_count = sum(1 for p in scored if p.selectivity_category == SelectivityCategory.MATCH)
    safety_count = sum(1 for p in scored if p.selectivity_category == SelectivityCategory.SAFETY)

    # Flag scam programs
    flagged = [p.program_name for p in scored if p.scam_risk in [ScamRiskLevel.HIGH_RISK, ScamRiskLevel.SCAM]]

    # Generate recommendations
    recommendations = _generate_selection_recommendations(
        t1, t2, t3, t4, reach_count, match_count, safety_count, flagged
    )

    return ProgramSelectionOutput(
        tier_1_programs=t1,
        tier_2_programs=t2,
        tier_3_programs=t3,
        tier_4_programs=t4,
        total_evaluated=len(scored),
        total_recommended=len(t1) + len(t2) + len(t3),
        reach_count=reach_count,
        match_count=match_count,
        safety_count=safety_count,
        student_competitiveness=student_competitiveness,
        programs_flagged=flagged,
        strategic_recommendations=recommendations
    )


def _generate_selection_recommendations(t1, t2, t3, t4, reach, match, safety, flagged):
    """Generate strategic recommendations."""
    recs = []

    # T1 opportunities
    if t1:
        recs.append(f"🎯 {len(t1)} T1 Elite program(s) available - significant Ivy differentiator if admitted")
        recs.append(f"   Top T1: {t1[0].program_name} (Score: {t1[0].total_score:.0f}/120)")
    else:
        recs.append("📌 No T1 programs matched - consider building profile for future years")

    # T2 opportunities
    if t2:
        recs.append(f"✅ {len(t2)} T2 Selective program(s) - strong credentials for applications")

    # Portfolio balance (ideal: 2 reach : 3 match : 2 safety)
    if reach > match + safety:
        recs.append("⚠️ Portfolio skewed toward reach - add more match/safety programs")
    elif safety > reach + match:
        recs.append("⚠️ Portfolio too conservative - stretch with some reach programs")
    else:
        recs.append(f"✅ Portfolio balance: {reach} reach, {match} match, {safety} safety")

    # Scam warnings
    if flagged:
        recs.append(f"🚨 WARNING: {len(flagged)} program(s) flagged as potential scam/pay-to-play")
        for f in flagged[:2]:
            recs.append(f"   → {f}")

    # Free T1/T2 emphasis
    recs.append("\n💡 Strategy: Free T1/T2 programs (RSI, Garcia, MOSTEC) >> Paid programs")

    return recs


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def calculate_student_competitiveness(profile: Dict[str, Any],
                                        assessment: Dict[str, Any] = None) -> float:
    """
    Calculate student competitiveness score (0-10) for program selection.

    Factors:
    - GPA/test scores
    - Award tier distribution
    - Activity leadership
    - Research/project depth
    """
    score = 5.0  # Baseline

    # Academic strength
    gpa = profile.get("gpa", 0)
    if gpa >= 3.9:
        score += 1.5
    elif gpa >= 3.7:
        score += 1.0

    sat = profile.get("sat_score", profile.get("sat", 0))
    if sat >= 1550:
        score += 1.5
    elif sat >= 1500:
        score += 1.0

    # Awards
    awards = profile.get("awards", [])
    national_awards = sum(1 for a in awards if "national" in str(a).lower())
    if national_awards >= 1:
        score += 1.5

    # Leadership
    activities = profile.get("activities", [])
    leadership = sum(1 for a in activities if any(
        kw in str(a).lower() for kw in ["president", "founder", "captain", "leader"]
    ))
    if leadership >= 2:
        score += 1.0
    elif leadership >= 1:
        score += 0.5

    return min(10.0, score)


def format_selection_output(output: ProgramSelectionOutput) -> str:
    """Format selection output as readable summary."""
    lines = [
        "=" * 60,
        "SUMMER PROGRAM SELECTION MATRIX",
        "=" * 60,
        "",
        f"Programs Evaluated: {output.total_evaluated}",
        f"Recommended: {output.total_recommended}",
        f"Student Competitiveness: {output.student_competitiveness}/10",
        f"Portfolio Balance: {output.reach_count} reach, {output.match_count} match, {output.safety_count} safety",
        "",
    ]

    if output.tier_1_programs:
        lines.append("--- T1 ELITE PROGRAMS ---")
        for p in output.tier_1_programs[:3]:
            lines.append(f"  ★ {p.program_name} ({p.total_score:.0f}/120)")
            lines.append(f"    {p.why_recommended}")
        lines.append("")

    if output.tier_2_programs:
        lines.append("--- T2 SELECTIVE PROGRAMS ---")
        for p in output.tier_2_programs[:3]:
            lines.append(f"  ● {p.program_name} ({p.total_score:.0f}/120)")
        lines.append("")

    if output.programs_flagged:
        lines.append("--- ⚠️ FLAGGED PROGRAMS ---")
        for f in output.programs_flagged:
            lines.append(f"  🚨 {f}")
        lines.append("")

    lines.append("--- RECOMMENDATIONS ---")
    for rec in output.strategic_recommendations:
        lines.append(f"  {rec}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_program_summary(result: ProgramScoringResult) -> str:
    """Get concise summary for single program."""
    return (
        f"{result.program_name}: "
        f"Score={result.total_score:.0f}/120, "
        f"Tier={result.tier.value}, "
        f"Category={result.selectivity_category.value}"
        + (f", ⚠️ {result.scam_risk.value}" if result.scam_risk != ScamRiskLevel.SAFE else "")
    )
