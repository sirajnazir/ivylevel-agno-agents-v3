# IvyLevel Program Cost-Benefit Intelligence v1.0
# LAYER: Scoring Primitives (TYPE-030)
"""
Program Cost-Benefit Intelligence - ROI-Driven Evaluation.

Implements TYPE-030: Multi-factor ROI calculation balancing cost, time, and impact
for summer program decisions.

Framework: ROI-Driven Program Evaluation
- Financial cost analysis (tuition, travel, opportunity cost)
- Time investment assessment (hours required vs. available)
- College admissions impact quantification (Ivy score boost)
- Alternative opportunity comparison (what else could student do?)

Core Algorithm:
ROI Score = (College_Impact × 5) - (Financial_Cost × 2) - (Time_Cost × 1) + (Learning_Value × 3)
Range: -100 to +100 (higher = better ROI)

Decision Matrix:
- ROI > 50: Strongly recommend (high value, low cost)
- ROI 20-50: Recommend (good balance)
- ROI 0-20: Consider (neutral, depends on family priorities)
- ROI < 0: Not recommended (low value or prohibitive cost)

Key Insight: Free T1/T2 programs >>> Paid programs without clear ROI
RSI (free, T1) >>> $10K commercial camp (T4)

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - deterministic calculations
- Integrates with program_selection.py outputs
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum

from backend.tools.scoring.program_selection import (
    ProgramTier,
    ProgramScoringResult,
)


# =============================================================================
# ENUMS
# =============================================================================

class ROICategory(str, Enum):
    """ROI classification for programs."""
    EXCELLENT = "excellent"      # ROI > 50: Strongly recommend
    GOOD = "good"                # ROI 20-50: Recommend
    NEUTRAL = "neutral"          # ROI 0-20: Consider
    POOR = "poor"                # ROI -20-0: Low value
    AVOID = "avoid"              # ROI < -20: Not recommended


class ValueProposition(str, Enum):
    """Value proposition type."""
    FREE_ELITE = "free_elite"                    # Free T1/T2 - best ROI
    FREE_STANDARD = "free_standard"              # Free T3/T4
    AFFORDABLE_SELECTIVE = "affordable_selective" # <$2K, selective
    EXPENSIVE_SELECTIVE = "expensive_selective"   # >$5K, selective
    EXPENSIVE_NONSELECTIVE = "expensive_nonselective"  # >$5K, not selective (red flag)
    SCAM_LIKELY = "scam_likely"                  # Very expensive, not selective


class OpportunityCost(str, Enum):
    """What student could do instead."""
    INDEPENDENT_RESEARCH = "independent_research"  # Self-directed research
    LOCAL_INTERNSHIP = "local_internship"          # Local work experience
    SELF_STUDY = "self_study"                      # Online courses, books
    FAMILY_TIME = "family_time"                    # Important for some students
    WORK_INCOME = "work_income"                    # Part-time job


# =============================================================================
# CONSTANTS
# =============================================================================

# ROI calculation weights
ROI_WEIGHTS = {
    "college_impact": 5,
    "financial_cost": 2,
    "time_cost": 1,
    "learning_value": 3,
}

# Impact scores by tier (0-10)
TIER_IMPACT_SCORES = {
    ProgramTier.T1_ELITE: 10,      # RSI, TASP = maximum boost
    ProgramTier.T2_SELECTIVE: 7,   # YYGS, SSP = strong boost
    ProgramTier.T3_COMPETITIVE: 5, # Governor's schools = moderate
    ProgramTier.T4_PAYTOP_LAY: 2,  # Commercial camps = minimal
}

# Estimated Ivy score boost by tier
IVY_SCORE_BOOST = {
    ProgramTier.T1_ELITE: 35,      # +35 points
    ProgramTier.T2_SELECTIVE: 20,  # +20 points
    ProgramTier.T3_COMPETITIVE: 10, # +10 points
    ProgramTier.T4_PAYTOP_LAY: 2,  # +2 points (minimal)
}

# Learning value by program type (0-10)
LEARNING_VALUE_DEFAULTS = {
    "research": 9,        # Research skills are highly transferable
    "academic": 8,        # Deep academic exposure
    "stem": 8,            # Technical skills
    "leadership": 6,      # Soft skills
    "entrepreneurship": 7, # Business + technical
    "arts": 7,            # Portfolio development
    "hybrid": 6,          # General enrichment
}

# Financial cost tiers (normalized to 0-10 penalty)
COST_PENALTY = {
    # Cost range: penalty score
    (0, 0): 0,           # Free = no penalty
    (1, 500): 1,         # Minimal cost
    (501, 1500): 2,      # Low cost
    (1501, 3000): 4,     # Moderate cost
    (3001, 5000): 6,     # High cost
    (5001, 8000): 8,     # Very high cost
    (8001, 15000): 10,   # Extreme cost
}

# Time cost normalization (hours → 0-10 penalty)
TIME_PENALTY_THRESHOLDS = {
    (0, 80): 2,          # <2 weeks = minimal
    (81, 160): 4,        # 2-4 weeks = moderate
    (161, 240): 6,       # 4-6 weeks = significant
    (241, 320): 8,       # 6-8 weeks = major
    (321, 999): 10,      # >8 weeks = substantial
}

# Alternative ROI estimates (for comparison)
ALTERNATIVE_ROI = {
    OpportunityCost.INDEPENDENT_RESEARCH: {
        "cost": 100,           # Minimal costs
        "impact": 20,          # Can be significant if published
        "learning_value": 8,   # Self-directed learning
    },
    OpportunityCost.LOCAL_INTERNSHIP: {
        "cost": 0,             # Often paid
        "impact": 10,          # Real-world experience
        "learning_value": 7,   # Practical skills
    },
    OpportunityCost.SELF_STUDY: {
        "cost": 200,           # Books, courses
        "impact": 5,           # Less impressive on apps
        "learning_value": 6,   # Depends on discipline
    },
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class CostBreakdown(BaseModel):
    """Detailed cost breakdown for a program."""
    tuition: float = 0.0
    travel_estimate: float = 0.0
    materials: float = 0.0
    opportunity_cost: float = 0.0  # Foregone income/other activities
    total_cost: float = 0.0
    financial_aid_available: bool = False
    aid_adjusted_cost: Optional[float] = None


class BenefitBreakdown(BaseModel):
    """Detailed benefit breakdown for a program."""
    ivy_score_boost: float = 0.0
    learning_value_score: float = 0.0  # 0-10
    networking_value: float = 0.0  # 0-10
    credential_value: float = 0.0  # 0-10 (how it looks on apps)
    experience_value: float = 0.0  # 0-10 (personal growth)


class ProgramROIAnalysis(BaseModel):
    """Complete ROI analysis for a single program."""
    program_name: str
    program_id: str = ""
    tier: ProgramTier

    # ROI calculation
    roi_score: float = Field(description="Range: -100 to +100")
    roi_category: ROICategory
    value_proposition: ValueProposition

    # Cost breakdown
    costs: CostBreakdown = Field(default_factory=CostBreakdown)

    # Benefit breakdown
    benefits: BenefitBreakdown = Field(default_factory=BenefitBreakdown)

    # Time investment
    duration_weeks: float = 0.0
    total_hours: float = 0.0
    time_cost_score: float = 0.0  # 0-10 penalty

    # Decision support
    bottom_line: str = ""
    alternatives: List[str] = Field(default_factory=list)
    red_flags: List[str] = Field(default_factory=list)


class AlternativeOption(BaseModel):
    """Alternative use of time/money."""
    name: str
    cost: float
    impact_score: float
    roi_estimate: float
    rationale: str


class ROIComparisonOutput(BaseModel):
    """
    Complete cost-benefit analysis output.
    Consumed by ProgramsAgent for ROI-driven recommendations.
    """
    # Analyzed programs by ROI category
    excellent_roi: List[ProgramROIAnalysis] = Field(default_factory=list)
    good_roi: List[ProgramROIAnalysis] = Field(default_factory=list)
    neutral_roi: List[ProgramROIAnalysis] = Field(default_factory=list)
    poor_roi: List[ProgramROIAnalysis] = Field(default_factory=list)
    avoid: List[ProgramROIAnalysis] = Field(default_factory=list)

    # Alternatives
    alternatives_considered: List[AlternativeOption] = Field(default_factory=list)

    # Summary
    total_analyzed: int = 0
    recommended_count: int = 0
    flagged_count: int = 0

    # Budget analysis
    total_budget_if_all: float = 0.0
    budget_if_recommended: float = 0.0

    # Recommendations
    summary: str = ""
    recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# ROI CALCULATION FUNCTIONS
# =============================================================================

def analyze_program_roi(program: Dict[str, Any],
                         tier: ProgramTier = None,
                         travel_distance: str = "local") -> ProgramROIAnalysis:
    """
    Calculate ROI for a single program.

    Formula: ROI = (Impact × 5) - (Cost × 2) - (Time × 1) + (Learning × 3)

    Args:
        program: Program dict from database
        tier: Program tier (if already classified)
        travel_distance: "local", "regional", or "national" for travel cost estimation

    Returns:
        ProgramROIAnalysis with complete breakdown
    """
    name = program.get("name", "Unknown Program")

    # Determine tier if not provided
    if tier is None:
        tier = _infer_tier(program)

    # 1. Calculate costs
    costs = calculate_cost_breakdown(program, travel_distance)

    # 2. Calculate benefits
    benefits = calculate_benefit_breakdown(program, tier)

    # 3. Calculate time cost
    duration_weeks, total_hours, time_score = calculate_time_cost(program)

    # 4. Calculate ROI score
    # Normalize costs to 0-10 scale for calculation
    cost_score = _normalize_cost(costs.total_cost)

    roi_score = (
        benefits.credential_value * ROI_WEIGHTS["college_impact"] -
        cost_score * ROI_WEIGHTS["financial_cost"] -
        time_score * ROI_WEIGHTS["time_cost"] +
        benefits.learning_value_score * ROI_WEIGHTS["learning_value"]
    )

    # 5. Determine ROI category
    roi_category = _categorize_roi(roi_score)

    # 6. Determine value proposition
    value_prop = _determine_value_proposition(costs.total_cost, tier)

    # 7. Generate bottom line
    bottom_line = _generate_bottom_line(name, roi_category, tier, costs.total_cost)

    # 8. Generate alternatives
    alternatives = _suggest_alternatives(roi_category, tier, costs.total_cost)

    # 9. Check for red flags
    red_flags = _check_roi_red_flags(costs.total_cost, tier, benefits.credential_value)

    return ProgramROIAnalysis(
        program_name=name,
        program_id=program.get("id", ""),
        tier=tier,
        roi_score=round(roi_score, 1),
        roi_category=roi_category,
        value_proposition=value_prop,
        costs=costs,
        benefits=benefits,
        duration_weeks=duration_weeks,
        total_hours=total_hours,
        time_cost_score=time_score,
        bottom_line=bottom_line,
        alternatives=alternatives,
        red_flags=red_flags
    )


def calculate_cost_breakdown(program: Dict[str, Any],
                              travel_distance: str = "local") -> CostBreakdown:
    """
    Calculate detailed cost breakdown.

    Includes:
    - Tuition/program fee
    - Travel (estimated by distance)
    - Materials
    - Opportunity cost (foregone summer income)
    """
    # Parse program cost
    cost = program.get("cost", program.get("fee", 0))

    if isinstance(cost, str):
        cost_lower = cost.lower()
        if "free" in cost_lower or "funded" in cost_lower:
            tuition = 0
        else:
            import re
            numbers = re.findall(r'[\d,]+', cost)
            tuition = int(numbers[0].replace(",", "")) if numbers else 0
    else:
        tuition = int(cost) if cost else 0

    # Estimate travel costs
    travel_costs = {
        "local": 0,
        "regional": 500,      # Driving distance
        "national": 1200,     # Flight + local transport
        "international": 2500,
    }
    travel = travel_costs.get(travel_distance, 500)

    # Materials estimate (books, supplies)
    materials = 100 if tuition > 0 else 50

    # Opportunity cost (foregone summer income)
    # Assume ~10 weeks at $15/hour for 20 hours/week = $3000
    duration = program.get("duration", 6)
    if isinstance(duration, str):
        import re
        nums = re.findall(r'\d+', duration)
        duration = int(nums[0]) if nums else 6
    opp_cost = duration * 20 * 15  # weeks × hours × wage

    total = tuition + travel + materials

    # Check for financial aid
    description = program.get("description", "").lower()
    aid_available = any(kw in description for kw in ["financial aid", "need-based", "scholarship", "need blind"])

    # Estimate aid-adjusted cost (assume 50% aid if available and cost > $3000)
    aid_adjusted = tuition * 0.5 + travel + materials if aid_available and tuition > 3000 else None

    return CostBreakdown(
        tuition=tuition,
        travel_estimate=travel,
        materials=materials,
        opportunity_cost=opp_cost,
        total_cost=total,
        financial_aid_available=aid_available,
        aid_adjusted_cost=aid_adjusted
    )


def calculate_benefit_breakdown(program: Dict[str, Any],
                                  tier: ProgramTier) -> BenefitBreakdown:
    """
    Calculate detailed benefit breakdown.

    Includes:
    - Ivy score boost (from tier)
    - Learning value (by program type)
    - Networking value
    - Credential value
    - Experience value
    """
    # Ivy score boost by tier
    ivy_boost = IVY_SCORE_BOOST.get(tier, 5)

    # Learning value by program type
    program_type = program.get("type", "hybrid").lower()
    learning_value = LEARNING_VALUE_DEFAULTS.get(program_type, 6)

    # Networking value (higher for prestigious programs)
    networking_map = {
        ProgramTier.T1_ELITE: 10,      # Meet future leaders
        ProgramTier.T2_SELECTIVE: 8,   # Strong peer group
        ProgramTier.T3_COMPETITIVE: 6, # Good connections
        ProgramTier.T4_PAYTOP_LAY: 3,  # Limited networking value
    }
    networking = networking_map.get(tier, 5)

    # Credential value (how it looks on applications)
    credential_map = {
        ProgramTier.T1_ELITE: 10,
        ProgramTier.T2_SELECTIVE: 7,
        ProgramTier.T3_COMPETITIVE: 5,
        ProgramTier.T4_PAYTOP_LAY: 2,
    }
    credential = credential_map.get(tier, 5)

    # Experience value (personal growth)
    # Residential programs score higher
    is_residential = "residential" in program.get("description", "").lower()
    experience = 8 if is_residential else 6

    return BenefitBreakdown(
        ivy_score_boost=ivy_boost,
        learning_value_score=learning_value,
        networking_value=networking,
        credential_value=credential,
        experience_value=experience
    )


def calculate_time_cost(program: Dict[str, Any]) -> Tuple[float, float, float]:
    """
    Calculate time investment and time cost score.

    Returns:
        (duration_weeks, total_hours, time_cost_score)
    """
    duration = program.get("duration", 6)

    # Parse duration string
    if isinstance(duration, str):
        import re
        nums = re.findall(r'\d+', duration)
        duration = int(nums[0]) if nums else 6

    # Estimate total hours (assume 40 hours/week for residential)
    is_residential = "residential" in program.get("description", "").lower()
    hours_per_week = 40 if is_residential else 20
    total_hours = duration * hours_per_week

    # Calculate time penalty
    time_score = 5  # Default
    for (low, high), score in TIME_PENALTY_THRESHOLDS.items():
        if low <= total_hours <= high:
            time_score = score
            break

    return float(duration), float(total_hours), float(time_score)


def _normalize_cost(cost: float) -> float:
    """Normalize cost to 0-10 scale for ROI calculation."""
    for (low, high), score in COST_PENALTY.items():
        if low <= cost <= high:
            return score
    return 10  # Very expensive


def _infer_tier(program: Dict[str, Any]) -> ProgramTier:
    """Infer program tier from data."""
    accept_rate = program.get("acceptance_rate", 0.5)
    prestige = program.get("prestige_score", 5)

    if accept_rate <= 0.05 or prestige >= 9:
        return ProgramTier.T1_ELITE
    elif accept_rate <= 0.20 or prestige >= 7:
        return ProgramTier.T2_SELECTIVE
    elif accept_rate <= 0.50:
        return ProgramTier.T3_COMPETITIVE
    else:
        return ProgramTier.T4_PAYTOP_LAY


def _categorize_roi(score: float) -> ROICategory:
    """Categorize ROI score."""
    if score > 50:
        return ROICategory.EXCELLENT
    elif score > 20:
        return ROICategory.GOOD
    elif score > 0:
        return ROICategory.NEUTRAL
    elif score > -20:
        return ROICategory.POOR
    else:
        return ROICategory.AVOID


def _determine_value_proposition(cost: float, tier: ProgramTier) -> ValueProposition:
    """Determine value proposition type."""
    is_free = cost == 0
    is_affordable = cost < 2000
    is_expensive = cost > 5000
    is_selective = tier in [ProgramTier.T1_ELITE, ProgramTier.T2_SELECTIVE]

    if is_free and is_selective:
        return ValueProposition.FREE_ELITE
    elif is_free:
        return ValueProposition.FREE_STANDARD
    elif is_affordable and is_selective:
        return ValueProposition.AFFORDABLE_SELECTIVE
    elif is_expensive and is_selective:
        return ValueProposition.EXPENSIVE_SELECTIVE
    elif is_expensive and not is_selective:
        return ValueProposition.EXPENSIVE_NONSELECTIVE
    else:
        return ValueProposition.AFFORDABLE_SELECTIVE


def _generate_bottom_line(name: str, roi_cat: ROICategory, tier: ProgramTier, cost: float) -> str:
    """Generate bottom line recommendation."""
    if roi_cat == ROICategory.EXCELLENT:
        return f"Exceptional value - {name} offers maximum impact at minimal cost"
    elif roi_cat == ROICategory.GOOD:
        return f"Strong value - {name} provides good balance of benefits vs. investment"
    elif roi_cat == ROICategory.NEUTRAL:
        if cost > 5000:
            return f"Consider with caution - ${cost:,.0f} is significant; verify unique value"
        return f"Reasonable option - {name} meets basic criteria but not exceptional"
    elif roi_cat == ROICategory.POOR:
        return f"Low value - Consider alternatives with better ROI"
    else:
        return f"Not recommended - {name} has poor ROI; pursue higher-impact options"


def _suggest_alternatives(roi_cat: ROICategory, tier: ProgramTier, cost: float) -> List[str]:
    """Suggest alternatives for programs with poor ROI."""
    alternatives = []

    if roi_cat in [ROICategory.POOR, ROICategory.AVOID]:
        alternatives.append("Independent research project (free, potentially high impact if published)")
        alternatives.append("Local university lab position (free, real research experience)")

    if cost > 5000 and tier not in [ProgramTier.T1_ELITE, ProgramTier.T2_SELECTIVE]:
        alternatives.append(f"Apply to free T1/T2 programs instead (RSI, Garcia, MOSTEC)")
        alternatives.append(f"Invest ${cost:,.0f} in SAT prep + college visits for better ROI")

    if roi_cat == ROICategory.NEUTRAL:
        alternatives.append("Consider if unique networking opportunities justify cost")

    return alternatives


def _check_roi_red_flags(cost: float, tier: ProgramTier, impact: float) -> List[str]:
    """Check for ROI red flags."""
    flags = []

    # High cost + low impact
    if cost > 5000 and impact < 5:
        flags.append(f"High cost (${cost:,.0f}) with minimal admissions impact")

    # Very expensive without selectivity
    if cost > 8000 and tier == ProgramTier.T4_PAYTOP_LAY:
        flags.append("Very expensive program with minimal selectivity - potential pay-to-play")

    # Expensive T3
    if cost > 3000 and tier == ProgramTier.T3_COMPETITIVE:
        flags.append(f"Moderately expensive for T3 program - verify unique value")

    return flags


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_programs_roi(programs: List[Dict[str, Any]],
                          budget_limit: float = None,
                          travel_distance: str = "local") -> ROIComparisonOutput:
    """
    Analyze ROI for multiple programs.

    Args:
        programs: List of program dicts
        budget_limit: Maximum budget (if any)
        travel_distance: Default travel distance for cost estimation

    Returns:
        ROIComparisonOutput with categorized programs
    """
    if not programs:
        return ROIComparisonOutput(
            recommendations=["No programs to analyze"]
        )

    # Analyze each program
    analyses = []
    for p in programs:
        analysis = analyze_program_roi(p, travel_distance=travel_distance)
        analyses.append(analysis)

    # Sort by ROI score
    analyses.sort(key=lambda x: x.roi_score, reverse=True)

    # Categorize
    excellent = [a for a in analyses if a.roi_category == ROICategory.EXCELLENT]
    good = [a for a in analyses if a.roi_category == ROICategory.GOOD]
    neutral = [a for a in analyses if a.roi_category == ROICategory.NEUTRAL]
    poor = [a for a in analyses if a.roi_category == ROICategory.POOR]
    avoid = [a for a in analyses if a.roi_category == ROICategory.AVOID]

    # Count recommended (excellent + good)
    recommended = len(excellent) + len(good)
    flagged = len(poor) + len(avoid)

    # Budget calculations
    total_budget = sum(a.costs.total_cost for a in analyses)
    rec_budget = sum(a.costs.total_cost for a in excellent + good)

    # Generate alternatives
    alternatives = _generate_alternatives()

    # Generate recommendations
    recommendations = _generate_roi_recommendations(
        excellent, good, neutral, poor, avoid, budget_limit
    )

    # Summary
    summary = _generate_roi_summary(len(analyses), recommended, flagged, rec_budget)

    return ROIComparisonOutput(
        excellent_roi=excellent,
        good_roi=good,
        neutral_roi=neutral,
        poor_roi=poor,
        avoid=avoid,
        alternatives_considered=alternatives,
        total_analyzed=len(analyses),
        recommended_count=recommended,
        flagged_count=flagged,
        total_budget_if_all=total_budget,
        budget_if_recommended=rec_budget,
        summary=summary,
        recommendations=recommendations
    )


def _generate_alternatives() -> List[AlternativeOption]:
    """Generate alternative options for comparison."""
    return [
        AlternativeOption(
            name="Independent Research Project",
            cost=100,
            impact_score=20,
            roi_estimate=75,
            rationale="Free, can publish, shows initiative - high ROI if executed well"
        ),
        AlternativeOption(
            name="Local University Lab Position",
            cost=0,
            impact_score=15,
            roi_estimate=60,
            rationale="Real research experience, potential mentorship, free"
        ),
        AlternativeOption(
            name="Online Courses + Self-Project",
            cost=200,
            impact_score=8,
            roi_estimate=35,
            rationale="Flexible, affordable, but less impressive without external validation"
        ),
    ]


def _generate_roi_recommendations(excellent, good, neutral, poor, avoid, budget):
    """Generate ROI-based recommendations."""
    recs = []

    # Highlight excellent ROI
    if excellent:
        recs.append(f"🌟 {len(excellent)} EXCELLENT ROI program(s) - prioritize these:")
        for e in excellent[:2]:
            recs.append(f"   → {e.program_name}: ROI={e.roi_score:.0f}, Cost=${e.costs.total_cost:,.0f}")

    # Good ROI
    if good:
        recs.append(f"✅ {len(good)} GOOD ROI program(s) - strong second choices")

    # Neutral - context dependent
    if neutral:
        recs.append(f"⚖️ {len(neutral)} NEUTRAL ROI - consider only if budget allows")

    # Poor/Avoid
    if poor or avoid:
        total_bad = len(poor) + len(avoid)
        recs.append(f"🚨 {total_bad} program(s) NOT RECOMMENDED - better alternatives exist")
        for a in avoid[:2]:
            recs.append(f"   → Avoid: {a.program_name} (ROI={a.roi_score:.0f})")

    # Budget-aware advice
    if budget:
        recs.append(f"\n💰 Budget constraint: ${budget:,.0f}")
        if excellent + good:
            rec_cost = sum(p.costs.total_cost for p in excellent + good)
            if rec_cost <= budget:
                recs.append(f"   → Recommended programs fit within budget (${rec_cost:,.0f})")
            else:
                recs.append(f"   → Prioritize free T1/T2 programs to maximize ROI within budget")

    # Key insight
    recs.append("\n💡 Key Insight: Free T1/T2 programs (RSI, Garcia, MOSTEC) >> Expensive commercial camps")

    return recs


def _generate_roi_summary(total, recommended, flagged, rec_budget):
    """Generate ROI analysis summary."""
    return (
        f"ROI analysis of {total} programs: "
        f"{recommended} recommended (excellent/good ROI), "
        f"{flagged} not recommended. "
        f"Total budget for recommended: ${rec_budget:,.0f}"
    )


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_roi_output(output: ROIComparisonOutput) -> str:
    """Format ROI output as readable summary."""
    lines = [
        "=" * 60,
        "PROGRAM COST-BENEFIT ANALYSIS (ROI)",
        "=" * 60,
        "",
        f"Total Analyzed: {output.total_analyzed}",
        f"Recommended: {output.recommended_count}",
        f"Flagged (Avoid): {output.flagged_count}",
        f"Budget for Recommended: ${output.budget_if_recommended:,.0f}",
        "",
    ]

    if output.excellent_roi:
        lines.append("--- 🌟 EXCELLENT ROI ---")
        for p in output.excellent_roi[:3]:
            lines.append(f"  ★ {p.program_name}")
            lines.append(f"    ROI: {p.roi_score:.0f} | Cost: ${p.costs.total_cost:,.0f}")
            lines.append(f"    {p.bottom_line}")
        lines.append("")

    if output.good_roi:
        lines.append("--- ✅ GOOD ROI ---")
        for p in output.good_roi[:3]:
            lines.append(f"  ● {p.program_name}: ROI={p.roi_score:.0f}, ${p.costs.total_cost:,.0f}")
        lines.append("")

    if output.avoid:
        lines.append("--- 🚨 AVOID ---")
        for p in output.avoid[:3]:
            lines.append(f"  ✗ {p.program_name}: ROI={p.roi_score:.0f}")
            for flag in p.red_flags[:2]:
                lines.append(f"    ⚠️ {flag}")
        lines.append("")

    lines.append("--- RECOMMENDATIONS ---")
    for rec in output.recommendations[:6]:
        lines.append(f"  {rec}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_roi_summary(analysis: ProgramROIAnalysis) -> str:
    """Get concise summary for single program ROI."""
    return (
        f"{analysis.program_name}: "
        f"ROI={analysis.roi_score:.0f}, "
        f"Category={analysis.roi_category.value}, "
        f"Cost=${analysis.costs.total_cost:,.0f}"
    )
