# IvyLevel Award Tier Classification v1.0
# LAYER: Scoring Primitives (TYPE-024)
"""
Award Tier Classification - Ivy AO-Calibrated System.

Implements TYPE-024: Objective classification system for award quality/prestige.
Transforms subjective perception into Ivy AO-calibrated tier system.

Framework: 4-Tier Hierarchy (T1-T4)
- T1 (National/International): <500 winners nationally, Ivy Impact +15-40%
- T2 (State/Regional): 500-2K winners regionally, Ivy Impact +5-15%
- T3 (Local/School): 2K-10K winners, Expected baseline
- T4 (Participation): No selection or >50% recipients, No impact

Critical Insight: Volume of T3/T4 awards doesn't compensate for lack of T1/T2.
10 school honor rolls < 1 NCWIT national winner in Ivy AO perception.

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - pattern-based classification
- Composable with other scoring primitives
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum


# =============================================================================
# ENUMS
# =============================================================================

class AwardTier(str, Enum):
    """Award tier classification matching Ivy AO mental model."""
    T1_NATIONAL = "T1"      # <500 winners nationally, +15-40% Ivy boost
    T2_REGIONAL = "T2"      # 500-2K winners, +5-15% Ivy boost
    T3_LOCAL = "T3"         # 2K-10K winners, expected baseline
    T4_PARTICIPATION = "T4" # >50% recipients, no Ivy impact


class PortfolioStrength(str, Enum):
    """Portfolio strength assessment for Ivy competitiveness."""
    IVY_COMPETITIVE = "ivy_competitive"  # 1+ T1 OR 3+ T2
    IVY_POSSIBLE = "ivy_possible"        # 0 T1, 4+ T2
    IVY_UNLIKELY = "ivy_unlikely"        # 0 T1, 2-3 T2
    WEAK = "weak"                        # 0 T1, 0-1 T2


# =============================================================================
# CONSTANTS
# =============================================================================

# Tier classification criteria
TIER_CRITERIA = {
    AwardTier.T1_NATIONAL: {
        "selectivity": "<500 winners nationally",
        "acceptance_rate": "<5%",
        "ivy_impact": "+15-40% acceptance boost",
        "time_investment": "20-60 hours application, 6-24 months underlying work",
        "examples": [
            "NCWIT National Winner",
            "Regeneron STS Finalist",
            "YoungArts Winner",
            "Presidential Scholar",
            "Davidson Fellow",
            "Intel ISEF Grand Award",
            "USA Olympiad Winner (USAMO, USABO, USACO Platinum)",
            "National Merit Finalist",
        ],
    },
    AwardTier.T2_REGIONAL: {
        "selectivity": "500-2,000 winners regionally",
        "acceptance_rate": "1-10%",
        "ivy_impact": "+5-15% acceptance boost",
        "time_investment": "10-30 hours per application",
        "examples": [
            "NCWIT State/Regional Winner",
            "Congressional App Challenge Winner",
            "State Science Fair Winner",
            "AIME Qualifier",
            "Scholastic Art & Writing Gold Key",
            "FIRST Robotics Regional Winner",
            "State Debate Champion",
        ],
    },
    AwardTier.T3_LOCAL: {
        "selectivity": "2,000-10,000 winners",
        "acceptance_rate": "10-30%",
        "ivy_impact": "Expected baseline (no boost)",
        "time_investment": "2-10 hours per award",
        "examples": [
            "School Honor Society Officer",
            "Local Essay Contest Winner",
            "Community Service Award",
            "School Departmental Award",
            "Scholastic Honorable Mention",
            "Regional Math Competition Top 10",
        ],
    },
    AwardTier.T4_PARTICIPATION: {
        "selectivity": "No selection or >50% recipients",
        "acceptance_rate": ">50%",
        "ivy_impact": "None (table stakes)",
        "time_investment": "0-2 hours",
        "examples": [
            "AP Scholar",
            "Honor Roll",
            "Perfect Attendance",
            "Club Membership Certificate",
            "Participation Award",
            "NHS Member (not officer)",
        ],
    },
}

# Ivy impact boost by tier (percentage points)
IVY_IMPACT_BOOST = {
    AwardTier.T1_NATIONAL: 25.0,    # +15-40%, use midpoint
    AwardTier.T2_REGIONAL: 10.0,    # +5-15%, use midpoint
    AwardTier.T3_LOCAL: 2.0,        # Minimal boost
    AwardTier.T4_PARTICIPATION: 0.0, # No boost
}

# T1 Award patterns (for classification)
T1_PATTERNS = {
    "keywords": [
        "national winner", "national finalist", "presidential scholar",
        "regeneron", "intel isef", "siemens", "davidson fellow",
        "youngarts", "usamo", "usabo", "usaco platinum", "usapho",
        "imo", "ioi", "ibo", "ipho", "national merit finalist",
        "usa team", "international olympiad",
    ],
    "organizations": [
        "regeneron", "intel", "siemens", "davidson institute",
        "youngarts", "presidential scholars", "national merit",
    ],
    "selectivity_threshold": 500,  # <500 winners
    "acceptance_rate_threshold": 0.05,  # <5%
}

# T2 Award patterns
T2_PATTERNS = {
    "keywords": [
        "state winner", "state finalist", "regional winner",
        "congressional app", "aime qualifier", "gold key",
        "state champion", "regional finalist", "all-state",
        "ncwit aspirations", "scholastic gold",
    ],
    "scope_indicators": ["state", "regional", "district"],
    "selectivity_threshold": 2000,
    "acceptance_rate_threshold": 0.10,
}

# T3 Award patterns
T3_PATTERNS = {
    "keywords": [
        "school award", "local winner", "community award",
        "honorable mention", "departmental award", "honor society",
        "club officer", "school recognition",
    ],
    "scope_indicators": ["school", "local", "community"],
    "selectivity_threshold": 10000,
}

# T4 Award patterns (participation-level)
T4_PATTERNS = {
    "keywords": [
        "ap scholar", "honor roll", "perfect attendance",
        "participation", "certificate", "member", "attendee",
    ],
    "auto_classify": [
        "ap scholar", "honor roll", "perfect attendance",
        "participation award", "membership certificate",
    ],
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class AwardTierClassification(BaseModel):
    """Tier classification result for a single award."""
    award_name: str
    tier: AwardTier
    tier_confidence: float = Field(ge=0.0, le=1.0)
    selectivity_score: float = Field(ge=0.0, le=10.0, description="0=everyone wins, 10=highly selective")
    scope: str  # "national", "state", "regional", "school", "participation"
    estimated_winners: int
    estimated_applicants: int
    ivy_impact_boost: float  # Percentage points
    classification_reasons: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class TierDistribution(BaseModel):
    """Distribution of awards across tiers."""
    T1: int = 0
    T2: int = 0
    T3: int = 0
    T4: int = 0

    def total(self) -> int:
        return self.T1 + self.T2 + self.T3 + self.T4


class TargetState(BaseModel):
    """Target award distribution for Ivy competitiveness."""
    T1_target: int
    T2_target: int
    T3_target: int
    T4_target: int  # Usually 0 - omit from applications
    rationale: str


class AwardPortfolioAnalysis(BaseModel):
    """Complete portfolio tier analysis."""
    # Classified awards
    classified_awards: List[AwardTierClassification] = Field(default_factory=list)

    # Distribution
    tier_distribution: TierDistribution = Field(default_factory=TierDistribution)

    # Portfolio strength
    portfolio_strength: PortfolioStrength
    strength_score: float = Field(ge=0.0, le=100.0)

    # Gap analysis
    gap_analysis: List[str] = Field(default_factory=list)
    critical_gaps: List[str] = Field(default_factory=list)

    # Target state
    target_state: TargetState

    # Ivy impact
    total_ivy_impact: float  # Total estimated boost percentage
    ivy_competitive: bool

    # Strategic recommendations
    strategic_recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# TIER CLASSIFICATION FUNCTIONS
# =============================================================================

def classify_award_tier(award: Dict[str, Any]) -> AwardTierClassification:
    """
    Classify a single award into T1-T4 tier.

    Uses multiple signals:
    - Award name patterns
    - Organization
    - Historical win rate / selectivity
    - Scope (national/state/school)
    - Database strategic_tier if available

    Args:
        award: Dict with name, organization, historical_win_rate, strategic_tier, etc.

    Returns:
        AwardTierClassification with tier and reasoning
    """
    name = award.get("name", "").lower()
    org = award.get("organization", "").lower()
    description = award.get("description", "").lower()
    combined_text = f"{name} {org} {description}"

    # Use database strategic_tier if available (1-4 maps to T1-T4)
    db_tier = award.get("strategic_tier")
    historical_rate = award.get("historical_win_rate", 0.5)
    prestige = award.get("prestige_score", 5)

    reasons = []
    tier = AwardTier.T3_LOCAL  # Default
    confidence = 0.5

    # === Check T1 patterns ===
    t1_matches = _check_tier_patterns(combined_text, T1_PATTERNS)
    if t1_matches or db_tier == 1 or historical_rate < 0.01:
        tier = AwardTier.T1_NATIONAL
        confidence = 0.95 if t1_matches else 0.85
        reasons.append(f"T1 indicators: {', '.join(t1_matches) if t1_matches else 'strategic_tier=1'}")
        if historical_rate < 0.01:
            reasons.append(f"Highly selective ({historical_rate*100:.1f}% win rate)")

    # === Check T2 patterns ===
    elif _check_tier_patterns(combined_text, T2_PATTERNS) or db_tier == 2 or (0.01 <= historical_rate < 0.10):
        t2_matches = _check_tier_patterns(combined_text, T2_PATTERNS)
        tier = AwardTier.T2_REGIONAL
        confidence = 0.85 if t2_matches else 0.75
        reasons.append(f"T2 indicators: {', '.join(t2_matches) if t2_matches else 'strategic_tier=2 or win rate'}")

    # === Check T4 patterns (participation) ===
    elif _check_tier_patterns(combined_text, T4_PATTERNS) or db_tier == 4 or historical_rate > 0.50:
        t4_matches = _check_tier_patterns(combined_text, T4_PATTERNS)
        tier = AwardTier.T4_PARTICIPATION
        confidence = 0.90 if t4_matches else 0.70
        reasons.append(f"T4 indicators: {', '.join(t4_matches) if t4_matches else 'high win rate or strategic_tier=4'}")

    # === Default to T3 ===
    else:
        t3_matches = _check_tier_patterns(combined_text, T3_PATTERNS)
        tier = AwardTier.T3_LOCAL
        confidence = 0.70
        if t3_matches:
            reasons.append(f"T3 indicators: {', '.join(t3_matches)}")
        else:
            reasons.append("Default classification (insufficient T1/T2/T4 signals)")

    # Calculate metrics
    selectivity_score = _calculate_selectivity_score(tier, historical_rate, prestige)
    scope = _determine_scope(tier, combined_text)
    estimated_winners, estimated_applicants = _estimate_competition_size(tier, historical_rate)
    ivy_impact = IVY_IMPACT_BOOST.get(tier, 0.0)

    # Generate recommendations
    recommendations = _generate_tier_recommendations(tier, award)

    return AwardTierClassification(
        award_name=award.get("name", "Unknown Award"),
        tier=tier,
        tier_confidence=confidence,
        selectivity_score=selectivity_score,
        scope=scope,
        estimated_winners=estimated_winners,
        estimated_applicants=estimated_applicants,
        ivy_impact_boost=ivy_impact,
        classification_reasons=reasons,
        recommendations=recommendations
    )


def _check_tier_patterns(text: str, patterns: Dict) -> List[str]:
    """Check text against tier patterns, return matched keywords."""
    matches = []
    for keyword in patterns.get("keywords", []):
        if keyword in text:
            matches.append(keyword)
    return matches


def _calculate_selectivity_score(tier: AwardTier, win_rate: float, prestige: int) -> float:
    """Calculate 0-10 selectivity score."""
    base_scores = {
        AwardTier.T1_NATIONAL: 9.5,
        AwardTier.T2_REGIONAL: 7.0,
        AwardTier.T3_LOCAL: 4.0,
        AwardTier.T4_PARTICIPATION: 1.0,
    }
    base = base_scores.get(tier, 5.0)

    # Adjust by win rate
    if win_rate < 0.01:
        base = min(10.0, base + 1.0)
    elif win_rate > 0.30:
        base = max(1.0, base - 1.0)

    # Adjust by prestige (if available, 1-10 scale)
    if prestige:
        base = (base + prestige) / 2

    return round(base, 1)


def _determine_scope(tier: AwardTier, text: str) -> str:
    """Determine geographic/organizational scope."""
    if tier == AwardTier.T1_NATIONAL:
        return "international" if "international" in text else "national"
    elif tier == AwardTier.T2_REGIONAL:
        if "state" in text:
            return "state"
        return "regional"
    elif tier == AwardTier.T3_LOCAL:
        return "school" if "school" in text else "local"
    else:
        return "participation"


def _estimate_competition_size(tier: AwardTier, win_rate: float) -> Tuple[int, int]:
    """Estimate winners and applicants based on tier."""
    estimates = {
        AwardTier.T1_NATIONAL: (300, 15000),
        AwardTier.T2_REGIONAL: (1500, 10000),
        AwardTier.T3_LOCAL: (5000, 15000),
        AwardTier.T4_PARTICIPATION: (50000, 100000),
    }
    return estimates.get(tier, (3000, 10000))


def _generate_tier_recommendations(tier: AwardTier, award: Dict) -> List[str]:
    """Generate recommendations based on tier classification."""
    recs = []
    name = award.get("name", "this award")

    if tier == AwardTier.T1_NATIONAL:
        recs.append(f"T1 national award - significant Ivy credential")
        recs.append("Feature prominently in college applications")
        recs.append("Start 6-month orchestration campaign if pursuing")

    elif tier == AwardTier.T2_REGIONAL:
        recs.append(f"T2 state/regional award - strong credential")
        recs.append("Build portfolio with 3+ T2 awards for Ivy competitiveness")
        recs.append("Consider upgrading to national level if possible")

    elif tier == AwardTier.T3_LOCAL:
        recs.append(f"T3 local award - expected baseline for competitive applicants")
        recs.append("Supplement with T1/T2 awards for Ivy admissions")
        recs.append("Use strategically to show breadth, not depth")

    else:  # T4
        recs.append(f"T4 participation award - no Ivy impact")
        recs.append("Consider omitting from applications to save space for T1/T2")
        recs.append("Focus time on pursuing higher-tier awards instead")

    return recs


# =============================================================================
# PORTFOLIO ANALYSIS FUNCTIONS
# =============================================================================

def analyze_award_portfolio(awards: List[Dict[str, Any]],
                            grade: int = 11) -> AwardPortfolioAnalysis:
    """
    Analyze complete award portfolio for Ivy competitiveness.

    Args:
        awards: List of award dicts
        grade: Student grade level (affects urgency)

    Returns:
        AwardPortfolioAnalysis with comprehensive assessment
    """
    if not awards:
        return AwardPortfolioAnalysis(
            classified_awards=[],
            tier_distribution=TierDistribution(),
            portfolio_strength=PortfolioStrength.WEAK,
            strength_score=0.0,
            gap_analysis=["No awards to analyze"],
            critical_gaps=["No T1/T2 awards - profile lacks external validation"],
            target_state=TargetState(
                T1_target=1,
                T2_target=3,
                T3_target=5,
                T4_target=0,
                rationale="Standard Ivy-competitive target"
            ),
            total_ivy_impact=0.0,
            ivy_competitive=False,
            strategic_recommendations=["Start award acquisition immediately"]
        )

    # Classify each award
    classified = [classify_award_tier(award) for award in awards]

    # Calculate distribution
    dist = TierDistribution(
        T1=sum(1 for a in classified if a.tier == AwardTier.T1_NATIONAL),
        T2=sum(1 for a in classified if a.tier == AwardTier.T2_REGIONAL),
        T3=sum(1 for a in classified if a.tier == AwardTier.T3_LOCAL),
        T4=sum(1 for a in classified if a.tier == AwardTier.T4_PARTICIPATION),
    )

    # Assess portfolio strength
    strength = _assess_portfolio_strength(dist)
    strength_score = _calculate_strength_score(dist)

    # Gap analysis
    gaps, critical_gaps = _perform_gap_analysis(dist, strength)

    # Define target state
    target = _define_target_state(dist, grade)

    # Calculate total Ivy impact
    total_impact = sum(a.ivy_impact_boost for a in classified)

    # Generate recommendations
    recommendations = _generate_portfolio_recommendations(dist, strength, grade)

    return AwardPortfolioAnalysis(
        classified_awards=classified,
        tier_distribution=dist,
        portfolio_strength=strength,
        strength_score=strength_score,
        gap_analysis=gaps,
        critical_gaps=critical_gaps,
        target_state=target,
        total_ivy_impact=total_impact,
        ivy_competitive=(strength in [PortfolioStrength.IVY_COMPETITIVE, PortfolioStrength.IVY_POSSIBLE]),
        strategic_recommendations=recommendations
    )


def _assess_portfolio_strength(dist: TierDistribution) -> PortfolioStrength:
    """Assess overall portfolio strength."""
    # Ivy Competitive: 1+ T1 OR 3+ T2
    if dist.T1 >= 1 or dist.T2 >= 3:
        return PortfolioStrength.IVY_COMPETITIVE

    # Ivy Possible: 0 T1, 4+ T2 (stretch but possible)
    if dist.T2 >= 4:
        return PortfolioStrength.IVY_POSSIBLE

    # Ivy Unlikely: 0-3 T2
    if dist.T2 >= 2:
        return PortfolioStrength.IVY_UNLIKELY

    # Weak: 0 T1, 0-1 T2
    return PortfolioStrength.WEAK


def _calculate_strength_score(dist: TierDistribution) -> float:
    """Calculate 0-100 strength score."""
    # Weighted scoring
    score = (
        dist.T1 * 30 +  # T1 worth 30 points each
        dist.T2 * 15 +  # T2 worth 15 points each
        dist.T3 * 3 +   # T3 worth 3 points each
        dist.T4 * 0     # T4 worth nothing
    )
    return min(100.0, score)


def _perform_gap_analysis(dist: TierDistribution,
                           strength: PortfolioStrength) -> Tuple[List[str], List[str]]:
    """Perform gap analysis and identify critical gaps."""
    gaps = []
    critical = []

    # T1 gap
    if dist.T1 == 0:
        critical.append("No T1 national awards - major Ivy differentiator missing")
        gaps.append(f"T1 Gap: Need at least 1 national-level award (current: {dist.T1})")

    # T2 gap
    if dist.T2 < 3:
        msg = f"T2 Gap: Only {dist.T2} state/regional awards (target: 3+ for Ivy competitiveness)"
        if dist.T1 == 0:
            critical.append(msg)
        gaps.append(msg)

    # Over-reliance on T4
    if dist.T4 > dist.T1 + dist.T2:
        gaps.append("Over-reliance on T4 participation awards (limited Ivy impact)")

    # Critical: No T1/T2 at all
    if dist.T1 == 0 and dist.T2 == 0:
        critical.append("CRITICAL: Zero T1/T2 awards - profile lacks external validation")

    # Positive notes
    if dist.T1 >= 1:
        gaps.append(f"✓ Strong T1 presence ({dist.T1} national-level awards)")
    if dist.T2 >= 3:
        gaps.append(f"✓ Solid T2 foundation ({dist.T2} regional awards)")

    return gaps, critical


def _define_target_state(dist: TierDistribution, grade: int) -> TargetState:
    """Define target state based on current distribution and grade."""
    # Ideal Ivy-competitive portfolio
    t1_target = max(1, dist.T1)
    t2_target = max(3, dist.T2)
    t3_target = max(5, dist.T3)
    t4_target = 0  # Omit from applications

    # Adjust by grade (more aggressive targets for juniors)
    if grade <= 10:
        rationale = "Early in HS - focus on building toward T1/T2"
    elif grade == 11:
        rationale = "Junior year - critical time for award acquisition"
        t1_target = max(1, t1_target)
        t2_target = max(3, t2_target)
    else:
        rationale = "Senior year - maximize existing portfolio, limited new opportunities"

    return TargetState(
        T1_target=t1_target,
        T2_target=t2_target,
        T3_target=t3_target,
        T4_target=t4_target,
        rationale=rationale
    )


def _generate_portfolio_recommendations(dist: TierDistribution,
                                         strength: PortfolioStrength,
                                         grade: int) -> List[str]:
    """Generate strategic recommendations."""
    recs = []

    # T1 recommendations
    if dist.T1 == 0:
        recs.append(f"🎯 Priority 1: Target T1 national award (NCWIT, Congressional App, Scholastic Gold)")
        recs.append("   → Timeline: Start 6-month orchestration campaign now")
        recs.append("   → ROI: Single T1 worth more than 10 T3 awards")

    # T2 recommendations
    if dist.T2 < 3:
        needed = 3 - dist.T2
        recs.append(f"🎯 Priority 2: Target {needed} additional T2 award(s)")
        recs.append("   → Focus on state/regional competitions aligned with strengths")

    # T4 elimination
    if dist.T4 > 0:
        recs.append(f"💡 Application Strategy: Omit {dist.T4} T4 award(s) to save space")
        recs.append("   → T4 awards (AP Scholar, Honor Roll) don't differentiate at Ivy level")

    # Portfolio status
    if strength == PortfolioStrength.IVY_COMPETITIVE:
        recs.append("✅ Portfolio Strength: Ivy-competitive (1+ T1 or 3+ T2)")
    elif strength == PortfolioStrength.IVY_POSSIBLE:
        recs.append("⚠️ Portfolio Strength: Ivy-possible (need T1 to strengthen)")
    else:
        recs.append(f"❌ Portfolio Strength: {strength.value} - significant gaps remain")

    # Grade-specific
    if grade >= 11 and dist.T1 == 0:
        recs.append("⏰ URGENT: Junior/Senior without T1 - prioritize high-impact awards NOW")

    return recs


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_tier_info(tier: AwardTier) -> Dict[str, Any]:
    """Get detailed info about a tier."""
    return TIER_CRITERIA.get(tier, {})


def calculate_ivy_impact(tier: AwardTier) -> float:
    """Get Ivy impact boost for a tier."""
    return IVY_IMPACT_BOOST.get(tier, 0.0)


def format_portfolio_analysis(analysis: AwardPortfolioAnalysis) -> str:
    """Format portfolio analysis as readable summary."""
    lines = [
        "=" * 60,
        "AWARD PORTFOLIO TIER ANALYSIS",
        "=" * 60,
        "",
        f"Portfolio Strength: {analysis.portfolio_strength.value.upper()}",
        f"Strength Score: {analysis.strength_score:.0f}/100",
        f"Total Ivy Impact: +{analysis.total_ivy_impact:.1f}%",
        f"Ivy Competitive: {'Yes' if analysis.ivy_competitive else 'No'}",
        "",
        "--- TIER DISTRIBUTION ---",
        f"  T1 (National): {analysis.tier_distribution.T1}",
        f"  T2 (Regional): {analysis.tier_distribution.T2}",
        f"  T3 (Local): {analysis.tier_distribution.T3}",
        f"  T4 (Participation): {analysis.tier_distribution.T4}",
        "",
        "--- TARGET STATE ---",
        f"  T1 Target: {analysis.target_state.T1_target}",
        f"  T2 Target: {analysis.target_state.T2_target}",
        f"  T3 Target: {analysis.target_state.T3_target}",
        f"  T4 Target: {analysis.target_state.T4_target} (omit from apps)",
    ]

    if analysis.critical_gaps:
        lines.extend(["", "--- CRITICAL GAPS ---"])
        for gap in analysis.critical_gaps:
            lines.append(f"  🚨 {gap}")

    if analysis.gap_analysis:
        lines.extend(["", "--- GAP ANALYSIS ---"])
        for gap in analysis.gap_analysis:
            lines.append(f"  • {gap}")

    lines.extend(["", "--- STRATEGIC RECOMMENDATIONS ---"])
    for i, rec in enumerate(analysis.strategic_recommendations, 1):
        lines.append(f"  {rec}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_award_tier_summary(classification: AwardTierClassification) -> str:
    """Get concise summary for single award classification."""
    return (
        f"{classification.award_name}: "
        f"Tier={classification.tier.value}, "
        f"Selectivity={classification.selectivity_score}/10, "
        f"Ivy Impact=+{classification.ivy_impact_boost}%, "
        f"Scope={classification.scope}"
    )
