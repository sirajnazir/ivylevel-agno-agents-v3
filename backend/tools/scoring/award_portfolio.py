# IvyLevel Award Portfolio Rule v1.0
# LAYER: Scoring Primitives (TYPE-026)
"""
70/20/10 Portfolio Rule - Risk-Balanced Award Strategy.

Implements TYPE-026: Risk-balanced award portfolio prevents demoralization
while building legitimate credentials.

Framework: Risk-Balanced Portfolio
- 70% HIGH-PROBABILITY (40-70% win rate): Confidence builders, early momentum
- 20% MEDIUM-REACH (10-30% win rate): Legitimate T1/T2 credentials
- 10% LONG-SHOT (0-5% win rate): Transformative upside plays

Expected Outcome: 10 applications → 4-5 wins across T1-T3 tiers
(7×0.55) + (2×0.20) + (1×0.025) = 3.85 + 0.40 + 0.025 = 4.3 wins

Critical Rule: Students with <3 high-probability wins by month 3 enter crisis mode.
Long-shot applications only appropriate if student has ≥2 wins already.

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - deterministic calculations
- Composable with award_tiers primitives
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum

from backend.tools.scoring.award_tiers import AwardTier, classify_award_tier


# =============================================================================
# ENUMS
# =============================================================================

class RiskBucket(str, Enum):
    """Risk classification for award applications."""
    HIGH_PROBABILITY = "high_probability"  # 70%, 40-70% win rate
    MEDIUM_REACH = "medium_reach"          # 20%, 10-30% win rate
    LONG_SHOT = "long_shot"                # 10%, 0-5% win rate


class MotivationState(str, Enum):
    """Student motivation state affecting portfolio strategy."""
    NORMAL = "normal"              # Standard 70/20/10
    CRISIS = "crisis"              # <2 wins by month 3, need confidence
    HIGH_ACHIEVER = "high_achiever"  # 5+ wins, can take more risk
    BUILDING = "building"          # Early stage, building foundation


class ComplianceStatus(str, Enum):
    """Portfolio compliance with 70/20/10 rule."""
    COMPLIANT = "compliant"
    NEEDS_ADJUSTMENT = "needs_adjustment"
    CRISIS_MODE = "crisis_mode"
    OVER_AGGRESSIVE = "over_aggressive"


# =============================================================================
# CONSTANTS
# =============================================================================

# Standard portfolio allocation
STANDARD_ALLOCATION = {
    RiskBucket.HIGH_PROBABILITY: 70,
    RiskBucket.MEDIUM_REACH: 20,
    RiskBucket.LONG_SHOT: 10,
}

# Win rate ranges by bucket
WIN_RATE_RANGES = {
    RiskBucket.HIGH_PROBABILITY: (0.40, 0.70),
    RiskBucket.MEDIUM_REACH: (0.10, 0.30),
    RiskBucket.LONG_SHOT: (0.00, 0.05),
}

# Expected win rates (midpoint for calculations)
EXPECTED_WIN_RATES = {
    RiskBucket.HIGH_PROBABILITY: 0.55,
    RiskBucket.MEDIUM_REACH: 0.20,
    RiskBucket.LONG_SHOT: 0.025,
}

# Award tier to typical risk bucket mapping
TIER_RISK_MAPPING = {
    AwardTier.T1_NATIONAL: RiskBucket.LONG_SHOT,      # T1 are usually long shots
    AwardTier.T2_REGIONAL: RiskBucket.MEDIUM_REACH,   # T2 are medium reach
    AwardTier.T3_LOCAL: RiskBucket.HIGH_PROBABILITY,  # T3 are high probability
    AwardTier.T4_PARTICIPATION: RiskBucket.HIGH_PROBABILITY,  # T4 are guaranteed
}

# Motivation state thresholds
CRISIS_THRESHOLD_WINS = 2      # <2 wins = crisis
CRISIS_THRESHOLD_MONTHS = 3   # By month 3
HIGH_ACHIEVER_THRESHOLD = 5   # 5+ wins = high achiever


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class RiskClassifiedAward(BaseModel):
    """Award with risk classification."""
    award_name: str
    award_id: str = ""
    risk_bucket: RiskBucket
    estimated_win_rate: float = Field(ge=0.0, le=1.0)
    award_tier: AwardTier
    estimated_hours: int = 0
    deadline: Optional[str] = None
    classification_rationale: str = ""


class PortfolioAllocation(BaseModel):
    """Allocation for a risk bucket."""
    bucket: RiskBucket
    target_percentage: int
    target_applications: int
    target_hours: int
    win_rate_range: str
    typical_tiers: List[str] = Field(default_factory=list)
    purpose: str = ""


class ExpectedWins(BaseModel):
    """Expected wins by bucket."""
    high_probability_wins: float
    medium_reach_wins: float
    long_shot_wins: float
    total_expected_wins: float
    confidence_interval: str = ""  # e.g., "3.5 - 5.2"


class CurrentDistribution(BaseModel):
    """Current portfolio distribution."""
    high_probability_count: int = 0
    medium_reach_count: int = 0
    long_shot_count: int = 0
    high_probability_pct: float = 0.0
    medium_reach_pct: float = 0.0
    long_shot_pct: float = 0.0


class PortfolioCompliance(BaseModel):
    """Portfolio compliance assessment."""
    status: ComplianceStatus
    is_compliant: bool
    deviations: List[str] = Field(default_factory=list)
    adjustments_needed: List[str] = Field(default_factory=list)


class AwardPortfolioRuleOutput(BaseModel):
    """
    Complete 70/20/10 portfolio rule output.
    Consumed by AwardsAgent for risk-balanced recommendations.
    """
    # Motivation assessment
    motivation_state: MotivationState
    wins_to_date: int
    months_elapsed: int

    # Allocations
    allocations: List[PortfolioAllocation] = Field(default_factory=list)
    allocation_rationale: str = ""

    # Classified awards
    classified_awards: List[RiskClassifiedAward] = Field(default_factory=list)

    # Current distribution
    current_distribution: CurrentDistribution = Field(default_factory=CurrentDistribution)

    # Compliance
    compliance: PortfolioCompliance

    # Expected wins
    expected_wins: ExpectedWins

    # Recommendations
    recommended_actions: List[str] = Field(default_factory=list)
    crisis_protocol: Optional[str] = None


# =============================================================================
# RISK CLASSIFICATION FUNCTIONS
# =============================================================================

def classify_award_risk(award: Dict[str, Any],
                        profile: Optional[Dict[str, Any]] = None) -> RiskClassifiedAward:
    """
    Classify an award into risk buckets based on win probability.

    Uses multiple factors:
    - Historical win rate
    - Award tier (T1 usually long-shot, T3 usually high-probability)
    - Student fit score
    - Competition level

    Args:
        award: Award dict with win_rate, tier, fit_score, etc.
        profile: Optional student profile for fit calculation

    Returns:
        RiskClassifiedAward with risk bucket and rationale
    """
    name = award.get("name", "Unknown Award")
    award_id = award.get("id", "")

    # Get win probability (prefer explicit, fall back to historical)
    win_prob = award.get("win_probability",
                        award.get("historical_win_rate", 0.3))

    # Adjust by fit score if available
    fit_score = award.get("fit_score", 0.5)
    adjusted_prob = _adjust_win_probability(win_prob, fit_score)

    # Classify tier
    tier_result = classify_award_tier(award)
    award_tier = tier_result.tier

    # Determine risk bucket
    bucket, rationale = _determine_risk_bucket(adjusted_prob, award_tier)

    return RiskClassifiedAward(
        award_name=name,
        award_id=award_id,
        risk_bucket=bucket,
        estimated_win_rate=adjusted_prob,
        award_tier=award_tier,
        estimated_hours=award.get("effort_hours", 10),
        deadline=award.get("deadline"),
        classification_rationale=rationale
    )


def _adjust_win_probability(base_prob: float, fit_score: float) -> float:
    """Adjust win probability based on student fit."""
    # Fit score 0.5 = no adjustment
    # Fit score 1.0 = +30% boost (capped)
    # Fit score 0.0 = -30% penalty
    adjustment = (fit_score - 0.5) * 0.6
    adjusted = base_prob + adjustment
    return max(0.01, min(0.95, adjusted))


def _determine_risk_bucket(win_prob: float, tier: AwardTier) -> Tuple[RiskBucket, str]:
    """Determine risk bucket from win probability."""
    rationale_parts = []

    # Primary: win probability ranges
    if win_prob >= WIN_RATE_RANGES[RiskBucket.HIGH_PROBABILITY][0]:
        bucket = RiskBucket.HIGH_PROBABILITY
        rationale_parts.append(f"Win rate {win_prob:.0%} in high-probability range (40-70%)")
    elif win_prob >= WIN_RATE_RANGES[RiskBucket.MEDIUM_REACH][0]:
        bucket = RiskBucket.MEDIUM_REACH
        rationale_parts.append(f"Win rate {win_prob:.0%} in medium-reach range (10-30%)")
    else:
        bucket = RiskBucket.LONG_SHOT
        rationale_parts.append(f"Win rate {win_prob:.0%} in long-shot range (0-5%)")

    # Secondary: tier correlation
    typical_bucket = TIER_RISK_MAPPING.get(tier)
    if typical_bucket and typical_bucket != bucket:
        rationale_parts.append(f"Note: {tier.value} awards typically {typical_bucket.value}")

    return bucket, "; ".join(rationale_parts)


# =============================================================================
# MOTIVATION STATE ASSESSMENT
# =============================================================================

def assess_motivation_state(wins_to_date: int,
                             months_elapsed: int = 0,
                             total_applications: int = 0) -> MotivationState:
    """
    Assess student motivation state to adjust portfolio strategy.

    Crisis mode: <2 wins by month 3 → Focus 100% on confidence builders
    High achiever: 5+ wins → Can take more calculated risks
    Building: Early stage, <3 months → Standard allocation

    Args:
        wins_to_date: Number of awards won so far
        months_elapsed: Months since starting award pursuit
        total_applications: Total applications submitted

    Returns:
        MotivationState
    """
    # Crisis: Not enough wins after significant time
    if months_elapsed >= CRISIS_THRESHOLD_MONTHS and wins_to_date < CRISIS_THRESHOLD_WINS:
        return MotivationState.CRISIS

    # High achiever: Strong track record
    if wins_to_date >= HIGH_ACHIEVER_THRESHOLD:
        return MotivationState.HIGH_ACHIEVER

    # Building: Early stage
    if months_elapsed < CRISIS_THRESHOLD_MONTHS:
        return MotivationState.BUILDING

    # Normal: Standard operation
    return MotivationState.NORMAL


# =============================================================================
# ALLOCATION CALCULATION
# =============================================================================

def calculate_portfolio_allocation(motivation_state: MotivationState,
                                    available_hours: int = 30) -> List[PortfolioAllocation]:
    """
    Calculate portfolio allocation based on motivation state.

    Adjustments:
    - Crisis: 100/0/0 (confidence only)
    - High achiever: 60/25/15 (more risk tolerance)
    - Limited time (<15h): 85/15/0 (skip long shots)
    - Normal: 70/20/10

    Args:
        motivation_state: Current motivation state
        available_hours: Hours available for award applications

    Returns:
        List of PortfolioAllocation for each bucket
    """
    # Determine allocation percentages
    if motivation_state == MotivationState.CRISIS:
        alloc = {RiskBucket.HIGH_PROBABILITY: 100, RiskBucket.MEDIUM_REACH: 0, RiskBucket.LONG_SHOT: 0}
    elif motivation_state == MotivationState.HIGH_ACHIEVER and available_hours > 40:
        alloc = {RiskBucket.HIGH_PROBABILITY: 60, RiskBucket.MEDIUM_REACH: 25, RiskBucket.LONG_SHOT: 15}
    elif available_hours < 15:
        alloc = {RiskBucket.HIGH_PROBABILITY: 85, RiskBucket.MEDIUM_REACH: 15, RiskBucket.LONG_SHOT: 0}
    else:
        alloc = STANDARD_ALLOCATION.copy()

    # Calculate applications per bucket
    # Assume ~6 hours per application average
    total_apps = max(1, available_hours // 6)

    allocations = []

    for bucket, pct in alloc.items():
        apps = round(total_apps * pct / 100)
        hours = round(available_hours * pct / 100)

        rate_range = WIN_RATE_RANGES[bucket]
        rate_str = f"{rate_range[0]*100:.0f}-{rate_range[1]*100:.0f}%"

        # Purpose description
        purposes = {
            RiskBucket.HIGH_PROBABILITY: "Build early momentum, sustain confidence",
            RiskBucket.MEDIUM_REACH: "Acquire legitimate T1/T2 credentials",
            RiskBucket.LONG_SHOT: "Pursue transformative outcomes (if you win, game changes)",
        }

        allocations.append(PortfolioAllocation(
            bucket=bucket,
            target_percentage=pct,
            target_applications=apps,
            target_hours=hours,
            win_rate_range=rate_str,
            typical_tiers=["T3", "T4"] if bucket == RiskBucket.HIGH_PROBABILITY else
                         ["T1", "T2"] if bucket == RiskBucket.MEDIUM_REACH else
                         ["T1"],
            purpose=purposes.get(bucket, "")
        ))

    return allocations


def get_allocation_rationale(state: MotivationState, hours: int) -> str:
    """Get explanation for allocation strategy."""
    if state == MotivationState.CRISIS:
        return "CRISIS MODE: 100% focus on confidence-building wins. Skip medium/long-shot until 2+ wins achieved."
    elif state == MotivationState.HIGH_ACHIEVER:
        return "HIGH ACHIEVER: Strong foundation allows more calculated risk-taking. Pursuing transformative T1 awards."
    elif hours < 15:
        return "LIMITED TIME: Prioritizing high-probability wins, skipping long-shots to maximize return on limited hours."
    else:
        return "STANDARD 70/20/10: Balanced approach with confidence builders, credential builders, and upside plays."


# =============================================================================
# EXPECTED WINS CALCULATION
# =============================================================================

def calculate_expected_wins(classified_awards: List[RiskClassifiedAward]) -> ExpectedWins:
    """
    Calculate expected wins from portfolio.

    Formula:
    - High-probability: N × 0.55
    - Medium-reach: N × 0.20
    - Long-shot: N × 0.025

    Args:
        classified_awards: List of risk-classified awards

    Returns:
        ExpectedWins with projections by bucket
    """
    # Count by bucket
    high_prob = [a for a in classified_awards if a.risk_bucket == RiskBucket.HIGH_PROBABILITY]
    medium = [a for a in classified_awards if a.risk_bucket == RiskBucket.MEDIUM_REACH]
    long_shot = [a for a in classified_awards if a.risk_bucket == RiskBucket.LONG_SHOT]

    # Calculate expected wins using actual probabilities
    hp_wins = sum(a.estimated_win_rate for a in high_prob)
    mr_wins = sum(a.estimated_win_rate for a in medium)
    ls_wins = sum(a.estimated_win_rate for a in long_shot)

    total = hp_wins + mr_wins + ls_wins

    # Calculate confidence interval (simplified: ±30%)
    low = max(0, total * 0.7)
    high = total * 1.3
    interval = f"{low:.1f} - {high:.1f}"

    return ExpectedWins(
        high_probability_wins=round(hp_wins, 2),
        medium_reach_wins=round(mr_wins, 2),
        long_shot_wins=round(ls_wins, 2),
        total_expected_wins=round(total, 2),
        confidence_interval=interval
    )


# =============================================================================
# COMPLIANCE CHECKING
# =============================================================================

def check_portfolio_compliance(classified_awards: List[RiskClassifiedAward],
                                allocations: List[PortfolioAllocation],
                                motivation_state: MotivationState) -> PortfolioCompliance:
    """
    Check if portfolio complies with allocation targets.

    Args:
        classified_awards: Current awards in portfolio
        allocations: Target allocations
        motivation_state: Current motivation state

    Returns:
        PortfolioCompliance with status and adjustments
    """
    total = len(classified_awards)
    if total == 0:
        return PortfolioCompliance(
            status=ComplianceStatus.NEEDS_ADJUSTMENT,
            is_compliant=False,
            deviations=["No awards in portfolio"],
            adjustments_needed=["Add awards following allocation targets"]
        )

    # Count by bucket
    counts = {
        RiskBucket.HIGH_PROBABILITY: sum(1 for a in classified_awards if a.risk_bucket == RiskBucket.HIGH_PROBABILITY),
        RiskBucket.MEDIUM_REACH: sum(1 for a in classified_awards if a.risk_bucket == RiskBucket.MEDIUM_REACH),
        RiskBucket.LONG_SHOT: sum(1 for a in classified_awards if a.risk_bucket == RiskBucket.LONG_SHOT),
    }

    # Calculate percentages
    pcts = {bucket: (count / total * 100) for bucket, count in counts.items()}

    # Compare to targets
    deviations = []
    adjustments = []
    tolerance = 15  # ±15% tolerance

    for alloc in allocations:
        actual = pcts.get(alloc.bucket, 0)
        target = alloc.target_percentage

        if abs(actual - target) > tolerance:
            deviations.append(
                f"{alloc.bucket.value}: {actual:.0f}% actual vs {target}% target"
            )

            if actual < target - tolerance:
                needed = round((target - actual) / 100 * total)
                adjustments.append(f"Add {needed} more {alloc.bucket.value} awards")
            elif actual > target + tolerance:
                excess = round((actual - target) / 100 * total)
                adjustments.append(f"Reduce {alloc.bucket.value} by {excess} or add to other buckets")

    # Determine status
    if motivation_state == MotivationState.CRISIS:
        # In crisis, only check high-probability
        if pcts.get(RiskBucket.HIGH_PROBABILITY, 0) < 80:
            status = ComplianceStatus.CRISIS_MODE
            adjustments.append("CRISIS: Focus 100% on high-probability wins")
        else:
            status = ComplianceStatus.COMPLIANT
    elif len(deviations) == 0:
        status = ComplianceStatus.COMPLIANT
    elif pcts.get(RiskBucket.LONG_SHOT, 0) > 30:
        status = ComplianceStatus.OVER_AGGRESSIVE
        adjustments.append("Too many long-shots - risk of demoralization")
    else:
        status = ComplianceStatus.NEEDS_ADJUSTMENT

    return PortfolioCompliance(
        status=status,
        is_compliant=(status == ComplianceStatus.COMPLIANT),
        deviations=deviations,
        adjustments_needed=adjustments
    )


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_award_portfolio_rule(awards: List[Dict[str, Any]],
                                  wins_to_date: int = 0,
                                  months_elapsed: int = 0,
                                  available_hours: int = 30,
                                  profile: Optional[Dict[str, Any]] = None) -> AwardPortfolioRuleOutput:
    """
    Complete 70/20/10 portfolio rule analysis.

    This is the main entry point that:
    1. Assesses motivation state
    2. Calculates appropriate allocation
    3. Classifies awards by risk
    4. Checks compliance
    5. Calculates expected wins
    6. Generates recommendations

    Args:
        awards: List of award dicts (current + planned)
        wins_to_date: Awards already won
        months_elapsed: Months since starting
        available_hours: Hours available per quarter
        profile: Optional student profile

    Returns:
        AwardPortfolioRuleOutput with complete analysis
    """
    # 1. Assess motivation state
    motivation = assess_motivation_state(wins_to_date, months_elapsed, len(awards))

    # 2. Calculate allocations
    allocations = calculate_portfolio_allocation(motivation, available_hours)
    allocation_rationale = get_allocation_rationale(motivation, available_hours)

    # 3. Classify awards
    classified = [classify_award_risk(award, profile) for award in awards]

    # 4. Calculate current distribution
    total = len(classified) if classified else 1
    hp_count = sum(1 for a in classified if a.risk_bucket == RiskBucket.HIGH_PROBABILITY)
    mr_count = sum(1 for a in classified if a.risk_bucket == RiskBucket.MEDIUM_REACH)
    ls_count = sum(1 for a in classified if a.risk_bucket == RiskBucket.LONG_SHOT)

    current_dist = CurrentDistribution(
        high_probability_count=hp_count,
        medium_reach_count=mr_count,
        long_shot_count=ls_count,
        high_probability_pct=hp_count / total * 100 if total else 0,
        medium_reach_pct=mr_count / total * 100 if total else 0,
        long_shot_pct=ls_count / total * 100 if total else 0
    )

    # 5. Check compliance
    compliance = check_portfolio_compliance(classified, allocations, motivation)

    # 6. Calculate expected wins
    expected = calculate_expected_wins(classified)

    # 7. Generate recommendations
    actions = _generate_portfolio_recommendations(
        motivation, allocations, current_dist, compliance, expected, wins_to_date
    )

    # Crisis protocol if applicable
    crisis_protocol = None
    if motivation == MotivationState.CRISIS:
        crisis_protocol = (
            "CRISIS PROTOCOL ACTIVE:\n"
            "1. Stop all medium-reach and long-shot applications\n"
            "2. Focus 100% on high-probability wins (T3, local awards)\n"
            "3. Target: 2-3 wins in next 4-8 weeks\n"
            "4. Resume 70/20/10 after confidence restored\n"
            "Rationale: Demoralization from losses is more damaging than missed T1 opportunities"
        )

    return AwardPortfolioRuleOutput(
        motivation_state=motivation,
        wins_to_date=wins_to_date,
        months_elapsed=months_elapsed,
        allocations=allocations,
        allocation_rationale=allocation_rationale,
        classified_awards=classified,
        current_distribution=current_dist,
        compliance=compliance,
        expected_wins=expected,
        recommended_actions=actions,
        crisis_protocol=crisis_protocol
    )


def _generate_portfolio_recommendations(motivation: MotivationState,
                                          allocations: List[PortfolioAllocation],
                                          current: CurrentDistribution,
                                          compliance: PortfolioCompliance,
                                          expected: ExpectedWins,
                                          wins: int) -> List[str]:
    """Generate actionable recommendations."""
    actions = []

    # Strategy summary
    alloc_summary = "/".join(str(a.target_percentage) for a in allocations)
    actions.append(f"📊 Strategy: {alloc_summary} (High-Prob/Medium/Long-Shot)")

    # Expected wins
    actions.append(
        f"🎯 Expected Wins: {expected.total_expected_wins:.1f} "
        f"({expected.high_probability_wins:.1f} HP + {expected.medium_reach_wins:.1f} MR + {expected.long_shot_wins:.1f} LS)"
    )

    # Compliance adjustments
    if not compliance.is_compliant:
        for adj in compliance.adjustments_needed[:3]:
            actions.append(f"⚠️ {adj}")

    # Motivation-specific
    if motivation == MotivationState.CRISIS:
        actions.append("🚨 CRISIS: Confidence-building mode - only high-probability awards")
        actions.append("   → Target 2-3 quick wins before resuming 70/20/10")
    elif motivation == MotivationState.HIGH_ACHIEVER:
        actions.append("✨ Strong foundation - can pursue more T1 long-shots")
    elif wins == 0:
        actions.append("💡 No wins yet - prioritize 2-3 high-probability wins first")

    # Balance reminder
    actions.append(
        "\n📋 70/20/10 Principle: Early wins (HP) sustain motivation, "
        "credentials (MR) transform Ivy odds, upside plays (LS) provide breakthrough potential"
    )

    return actions


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_portfolio_rule_analysis(output: AwardPortfolioRuleOutput) -> str:
    """Format portfolio rule analysis as readable summary."""
    lines = [
        "=" * 60,
        "70/20/10 PORTFOLIO RULE ANALYSIS",
        "=" * 60,
        "",
        f"Motivation State: {output.motivation_state.value.upper()}",
        f"Wins to Date: {output.wins_to_date}",
        f"Months Elapsed: {output.months_elapsed}",
        "",
        f"Allocation: {output.allocation_rationale}",
        "",
        "--- TARGET ALLOCATIONS ---",
    ]

    for alloc in output.allocations:
        lines.append(
            f"  {alloc.bucket.value}: {alloc.target_percentage}% "
            f"({alloc.target_applications} apps, {alloc.target_hours}h)"
        )

    lines.extend([
        "",
        "--- CURRENT DISTRIBUTION ---",
        f"  High-Probability: {output.current_distribution.high_probability_count} "
        f"({output.current_distribution.high_probability_pct:.0f}%)",
        f"  Medium-Reach: {output.current_distribution.medium_reach_count} "
        f"({output.current_distribution.medium_reach_pct:.0f}%)",
        f"  Long-Shot: {output.current_distribution.long_shot_count} "
        f"({output.current_distribution.long_shot_pct:.0f}%)",
        "",
        f"--- COMPLIANCE: {output.compliance.status.value.upper()} ---",
    ])

    if output.compliance.deviations:
        for dev in output.compliance.deviations:
            lines.append(f"  ⚠️ {dev}")

    lines.extend([
        "",
        "--- EXPECTED WINS ---",
        f"  Total: {output.expected_wins.total_expected_wins:.1f} "
        f"(range: {output.expected_wins.confidence_interval})",
        "",
        "--- RECOMMENDED ACTIONS ---",
    ])

    for action in output.recommended_actions:
        lines.append(f"  {action}")

    if output.crisis_protocol:
        lines.extend(["", "🚨 " + output.crisis_protocol])

    lines.append("=" * 60)
    return "\n".join(lines)


def get_risk_bucket_summary(award: RiskClassifiedAward) -> str:
    """Get concise summary for single award risk classification."""
    return (
        f"{award.award_name}: "
        f"Bucket={award.risk_bucket.value}, "
        f"WinRate={award.estimated_win_rate:.0%}, "
        f"Tier={award.award_tier.value}"
    )
