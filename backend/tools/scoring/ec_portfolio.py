# IvyLevel EC Portfolio Scoring v1.0
# LAYER: Scoring Primitives (TYPE-013, TYPE-015, TYPE-019)
"""
EC Portfolio Scoring Primitives.

Implements:
- TYPE-013: EC Portfolio Optimization (Tier classification, Portfolio roles)
- TYPE-015: Impact Engineering (Evidence ladder M0-M4)
- TYPE-019: Formalization Ladder (7-step legitimacy stack)

These are SCORING PRIMITIVES consumed by ECAgent to provide
strategic portfolio analysis and recommendations.

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - deterministic scoring
- Composable with other scoring primitives
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum


# =============================================================================
# ENUMS (TYPE-013, TYPE-015, TYPE-019)
# =============================================================================

class ActivityTier(str, Enum):
    """
    Activity tier classification matching AO mental model.
    T1 = Most impressive, T4 = Participation level.
    """
    T1_NATIONAL = "T1"      # National/International recognition
    T2_REGIONAL = "T2"      # State/Regional recognition
    T3_SCHOOL = "T3"        # School-level leadership
    T4_PARTICIPATION = "T4" # Member/volunteer


class PortfolioRole(str, Enum):
    """
    Strategic role of activity in 10-slot portfolio.
    Based on TYPE-013 portfolio architecture.
    """
    FLAGSHIP = "FLAGSHIP"           # 2-3 slots: Anchor activities
    SUPPORTING = "SUPPORTING"       # 3-4 slots: Reinforce theme
    VALIDATION = "VALIDATION"       # 2-3 slots: Awards, publications
    SERVICE = "SERVICE"             # 2 slots: Community commitment
    UNASSIGNED = "UNASSIGNED"       # Not yet categorized


class EvidenceLevel(str, Enum):
    """
    Evidence ladder for impact claims (TYPE-015).
    Higher = more credible evidence.
    """
    M0_BUILT = "M0"         # "I created X"
    M1_USED = "M1"          # "N people use X"
    M2_MEASURED = "M2"      # "Users report Y% improvement"
    M3_DOLLARS = "M3"       # "Generated $Z revenue/funding"
    M4_MEDIA = "M4"         # "Featured in [publication]"


class FormalizationStep(int, Enum):
    """
    7-step formalization ladder (TYPE-019).
    Higher = more legitimate/scalable.
    """
    IDEA = 1                # Concept only
    STRUCTURE = 2           # Has curriculum/schedule/plan
    LEGITIMACY = 3          # Registered org, official status
    TEAM = 4                # Has recruited team members
    SCALE = 5               # Expanded beyond original scope
    EXTERNAL_VALIDATION = 6 # Grant, award, media coverage
    SUCCESSION = 7          # Trained replacement, sustainable


# =============================================================================
# CONSTANTS
# =============================================================================

# Tier classification indicators (TYPE-013)
TIER_INDICATORS = {
    ActivityTier.T1_NATIONAL: {
        "keywords": [
            "national", "international", "usamo", "usaco", "isef", "intel",
            "regeneron", "siemens", "published", "patent", "ted", "tedx",
            "olympiad gold", "usa team", "world", "global"
        ],
        "role_levels": ["national winner", "international", "published author"],
        "reach_threshold": 10000,
        "award_level": "national"
    },
    ActivityTier.T2_REGIONAL: {
        "keywords": [
            "state", "regional", "finalist", "semifinalist", "all-state",
            "regional champion", "state qualifier", "district"
        ],
        "role_levels": ["state winner", "regional", "finalist"],
        "reach_threshold": 1000,
        "award_level": "state"
    },
    ActivityTier.T3_SCHOOL: {
        "keywords": [
            "president", "founder", "captain", "editor-in-chief", "lead",
            "director", "chair", "head"
        ],
        "role_levels": ["founder", "president", "captain", "editor"],
        "reach_threshold": 100,
        "award_level": "school"
    },
    ActivityTier.T4_PARTICIPATION: {
        "keywords": [
            "member", "participant", "volunteer", "assistant", "helper"
        ],
        "role_levels": ["member", "participant", "volunteer"],
        "reach_threshold": 0,
        "award_level": None
    }
}

# Portfolio role allocation targets (TYPE-013)
PORTFOLIO_ALLOCATION = {
    PortfolioRole.FLAGSHIP: {"min": 2, "max": 3, "weight": 1.5},
    PortfolioRole.SUPPORTING: {"min": 3, "max": 4, "weight": 1.2},
    PortfolioRole.VALIDATION: {"min": 2, "max": 3, "weight": 1.3},
    PortfolioRole.SERVICE: {"min": 1, "max": 2, "weight": 0.9},
}

# Evidence level scores (TYPE-015)
EVIDENCE_SCORES = {
    EvidenceLevel.M0_BUILT: 2.0,
    EvidenceLevel.M1_USED: 4.0,
    EvidenceLevel.M2_MEASURED: 6.0,
    EvidenceLevel.M3_DOLLARS: 8.0,
    EvidenceLevel.M4_MEDIA: 10.0,
}

# Formalization indicators (TYPE-019)
FORMALIZATION_INDICATORS = {
    FormalizationStep.IDEA: ["want to", "planning to", "thinking about"],
    FormalizationStep.STRUCTURE: ["schedule", "curriculum", "plan", "weekly"],
    FormalizationStep.LEGITIMACY: ["registered", "official", "501c3", "incorporated"],
    FormalizationStep.TEAM: ["recruited", "team of", "members", "volunteers"],
    FormalizationStep.SCALE: ["expanded", "multiple", "chapters", "schools"],
    FormalizationStep.EXTERNAL_VALIDATION: ["grant", "award", "featured", "covered"],
    FormalizationStep.SUCCESSION: ["trained", "successor", "sustainable", "continues"],
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class TierClassification(BaseModel):
    """Tier classification result for a single activity."""
    activity_name: str
    tier: ActivityTier
    confidence: float = Field(ge=0.0, le=1.0)
    indicators_matched: List[str] = Field(default_factory=list)
    upgrade_potential: Optional[str] = None


class EvidenceAnalysis(BaseModel):
    """Evidence level analysis for a single activity."""
    activity_name: str
    current_level: EvidenceLevel
    evidence_score: float = Field(ge=0.0, le=10.0)
    evidence_present: List[str] = Field(default_factory=list)
    next_level: Optional[EvidenceLevel] = None
    upgrade_action: Optional[str] = None


class FormalizationAnalysis(BaseModel):
    """Formalization analysis for a single activity."""
    activity_name: str
    current_step: FormalizationStep
    formalization_score: float = Field(ge=0.0, le=10.0)
    indicators_present: List[str] = Field(default_factory=list)
    next_step: Optional[FormalizationStep] = None
    upgrade_action: Optional[str] = None


class RoleAssignment(BaseModel):
    """Portfolio role assignment for a single activity."""
    activity_name: str
    assigned_role: PortfolioRole
    role_fit_score: float = Field(ge=0.0, le=1.0)
    reasoning: str = ""


class PortfolioBalance(BaseModel):
    """Portfolio balance analysis."""
    total_activities: int
    tier_distribution: Dict[str, int] = Field(default_factory=dict)
    role_distribution: Dict[str, int] = Field(default_factory=dict)
    balance_score: float = Field(ge=0.0, le=1.0)
    gaps: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)


class ActivityAnalysis(BaseModel):
    """Complete analysis for a single activity."""
    name: str
    tier: TierClassification
    evidence: EvidenceAnalysis
    formalization: FormalizationAnalysis
    role: RoleAssignment
    composite_score: float = Field(ge=0.0, le=10.0)


class ECPortfolioOutput(BaseModel):
    """
    Complete EC Portfolio scoring output.
    Consumed by ECAgent for strategic recommendations.
    """
    # Activity-level analysis
    activities: List[ActivityAnalysis] = Field(default_factory=list)

    # Portfolio-level analysis
    portfolio_balance: PortfolioBalance

    # Aggregate scores
    average_tier_score: float = Field(ge=0.0, le=10.0)
    average_evidence_score: float = Field(ge=0.0, le=10.0)
    average_formalization_score: float = Field(ge=0.0, le=10.0)
    portfolio_strength_score: float = Field(ge=0.0, le=100.0)

    # Strategic recommendations
    priority_upgrades: List[str] = Field(default_factory=list)
    missing_roles: List[PortfolioRole] = Field(default_factory=list)
    tier_gaps: List[str] = Field(default_factory=list)


# =============================================================================
# TIER CLASSIFICATION (TYPE-013)
# =============================================================================

def classify_activity_tier(activity: Dict[str, Any]) -> TierClassification:
    """
    Classify a single activity into T1-T4 tier.

    Uses keyword matching, role level, and reach/impact metrics
    to determine tier following AO mental model.

    Args:
        activity: Dict with name, description, role_level, impact_metric, awards

    Returns:
        TierClassification with tier, confidence, and upgrade potential
    """
    name = activity.get("name", "").lower()
    description = activity.get("description", "").lower()
    role_level = activity.get("role_level", "").lower()
    impact_metric = activity.get("impact_metric", 0)
    awards = activity.get("awards", [])

    combined_text = f"{name} {description} {role_level}"

    # Check each tier from highest to lowest
    for tier in [ActivityTier.T1_NATIONAL, ActivityTier.T2_REGIONAL,
                 ActivityTier.T3_SCHOOL, ActivityTier.T4_PARTICIPATION]:
        indicators = TIER_INDICATORS[tier]
        matched = []

        # Check keywords
        for keyword in indicators["keywords"]:
            if keyword in combined_text:
                matched.append(f"keyword:{keyword}")

        # Check role levels
        for role in indicators["role_levels"]:
            if role in role_level:
                matched.append(f"role:{role}")

        # Check reach threshold
        if impact_metric >= indicators["reach_threshold"]:
            matched.append(f"reach:{impact_metric}")

        # Check awards
        if awards and indicators["award_level"]:
            for award in awards:
                if indicators["award_level"] in str(award).lower():
                    matched.append(f"award:{award}")

        # If we have matches at this tier, classify here
        if matched:
            confidence = min(1.0, len(matched) * 0.25)

            # Determine upgrade potential
            upgrade = None
            if tier != ActivityTier.T1_NATIONAL:
                next_tier_idx = list(ActivityTier).index(tier) - 1
                if next_tier_idx >= 0:
                    next_tier = list(ActivityTier)[next_tier_idx]
                    upgrade = _get_tier_upgrade_action(tier, next_tier, activity)

            return TierClassification(
                activity_name=activity.get("name", "Unknown"),
                tier=tier,
                confidence=confidence,
                indicators_matched=matched,
                upgrade_potential=upgrade
            )

    # Default to T4 if no matches
    return TierClassification(
        activity_name=activity.get("name", "Unknown"),
        tier=ActivityTier.T4_PARTICIPATION,
        confidence=0.5,
        indicators_matched=["default"],
        upgrade_potential="Seek leadership role or expand reach"
    )


def _get_tier_upgrade_action(current: ActivityTier, target: ActivityTier,
                              activity: Dict[str, Any]) -> str:
    """Generate specific action to upgrade tier."""
    upgrades = {
        (ActivityTier.T4_PARTICIPATION, ActivityTier.T3_SCHOOL):
            "Take leadership role (president, founder, captain)",
        (ActivityTier.T3_SCHOOL, ActivityTier.T2_REGIONAL):
            "Compete at regional/state level or expand reach to 1000+",
        (ActivityTier.T2_REGIONAL, ActivityTier.T1_NATIONAL):
            "Win national competition or achieve international recognition",
    }
    return upgrades.get((current, target), "Increase scope and recognition")


# =============================================================================
# EVIDENCE ANALYSIS (TYPE-015)
# =============================================================================

def analyze_evidence_level(activity: Dict[str, Any]) -> EvidenceAnalysis:
    """
    Analyze evidence level for activity impact claims.

    Maps to M0-M4 evidence ladder based on what can be proven.

    Args:
        activity: Dict with description, metrics, media_coverage, revenue

    Returns:
        EvidenceAnalysis with current level and upgrade path
    """
    description = activity.get("description", "").lower()
    metrics = activity.get("metrics", {})
    media = activity.get("media_coverage", [])
    revenue = activity.get("revenue", 0)
    users = activity.get("users", 0) or activity.get("impact_metric", 0)

    evidence_present = []
    current_level = EvidenceLevel.M0_BUILT

    # Check M4: Media coverage
    if media or "featured" in description or "published" in description:
        evidence_present.append("media_coverage")
        current_level = EvidenceLevel.M4_MEDIA

    # Check M3: Revenue/funding
    elif revenue > 0 or "revenue" in description or "funded" in description or "$" in description:
        evidence_present.append("revenue_funding")
        current_level = EvidenceLevel.M3_DOLLARS

    # Check M2: Measured impact
    elif metrics or "%" in description or "improved" in description or "increased" in description:
        evidence_present.append("measured_impact")
        current_level = EvidenceLevel.M2_MEASURED

    # Check M1: Users/reach
    elif users > 0 or "users" in description or "served" in description or "reached" in description:
        evidence_present.append("user_base")
        current_level = EvidenceLevel.M1_USED

    # Default M0: Built something
    else:
        evidence_present.append("created")

    # Calculate score
    score = EVIDENCE_SCORES[current_level]

    # Determine next level and upgrade action
    next_level = None
    upgrade_action = None

    level_order = list(EvidenceLevel)
    current_idx = level_order.index(current_level)

    if current_idx < len(level_order) - 1:
        next_level = level_order[current_idx + 1]
        upgrade_action = _get_evidence_upgrade_action(current_level, next_level)

    return EvidenceAnalysis(
        activity_name=activity.get("name", "Unknown"),
        current_level=current_level,
        evidence_score=score,
        evidence_present=evidence_present,
        next_level=next_level,
        upgrade_action=upgrade_action
    )


def _get_evidence_upgrade_action(current: EvidenceLevel, target: EvidenceLevel) -> str:
    """Generate specific action to upgrade evidence level."""
    upgrades = {
        (EvidenceLevel.M0_BUILT, EvidenceLevel.M1_USED):
            "Get users - track and document who uses your work",
        (EvidenceLevel.M1_USED, EvidenceLevel.M2_MEASURED):
            "Measure impact - survey users, track outcomes, quantify results",
        (EvidenceLevel.M2_MEASURED, EvidenceLevel.M3_DOLLARS):
            "Monetize or get funded - apply for grants, generate revenue",
        (EvidenceLevel.M3_DOLLARS, EvidenceLevel.M4_MEDIA):
            "Get media coverage - pitch to local news, blogs, publications",
    }
    return upgrades.get((current, target), "Document and validate your impact")


# =============================================================================
# FORMALIZATION ANALYSIS (TYPE-019)
# =============================================================================

def analyze_formalization(activity: Dict[str, Any]) -> FormalizationAnalysis:
    """
    Analyze formalization level using 7-step legitimacy ladder.

    Higher formalization = more credible, scalable activity.

    Args:
        activity: Dict with description, team_size, registered, expanded

    Returns:
        FormalizationAnalysis with current step and upgrade path
    """
    description = activity.get("description", "").lower()
    team_size = activity.get("team_size", 0)
    is_registered = activity.get("registered", False)
    has_expanded = activity.get("expanded", False)
    has_succession = activity.get("succession_plan", False)

    indicators_present = []
    current_step = FormalizationStep.IDEA

    # Check from highest to lowest
    if has_succession or any(ind in description for ind in FORMALIZATION_INDICATORS[FormalizationStep.SUCCESSION]):
        indicators_present.append("succession")
        current_step = FormalizationStep.SUCCESSION

    elif any(ind in description for ind in FORMALIZATION_INDICATORS[FormalizationStep.EXTERNAL_VALIDATION]):
        indicators_present.append("external_validation")
        current_step = FormalizationStep.EXTERNAL_VALIDATION

    elif has_expanded or any(ind in description for ind in FORMALIZATION_INDICATORS[FormalizationStep.SCALE]):
        indicators_present.append("scaled")
        current_step = FormalizationStep.SCALE

    elif team_size > 1 or any(ind in description for ind in FORMALIZATION_INDICATORS[FormalizationStep.TEAM]):
        indicators_present.append("team")
        current_step = FormalizationStep.TEAM

    elif is_registered or any(ind in description for ind in FORMALIZATION_INDICATORS[FormalizationStep.LEGITIMACY]):
        indicators_present.append("legitimacy")
        current_step = FormalizationStep.LEGITIMACY

    elif any(ind in description for ind in FORMALIZATION_INDICATORS[FormalizationStep.STRUCTURE]):
        indicators_present.append("structure")
        current_step = FormalizationStep.STRUCTURE

    else:
        indicators_present.append("idea_stage")

    # Calculate score (0-10 based on 7 steps)
    score = (current_step.value / 7) * 10

    # Determine next step and upgrade action
    next_step = None
    upgrade_action = None

    if current_step.value < 7:
        next_step = FormalizationStep(current_step.value + 1)
        upgrade_action = _get_formalization_upgrade_action(current_step, next_step)

    return FormalizationAnalysis(
        activity_name=activity.get("name", "Unknown"),
        current_step=current_step,
        formalization_score=score,
        indicators_present=indicators_present,
        next_step=next_step,
        upgrade_action=upgrade_action
    )


def _get_formalization_upgrade_action(current: FormalizationStep,
                                       target: FormalizationStep) -> str:
    """Generate specific action to upgrade formalization."""
    upgrades = {
        FormalizationStep.IDEA: "Create structure - define schedule, curriculum, or process",
        FormalizationStep.STRUCTURE: "Get official status - register as student org or 501c3",
        FormalizationStep.LEGITIMACY: "Build team - recruit members, volunteers, or collaborators",
        FormalizationStep.TEAM: "Scale up - expand to new locations, chapters, or audiences",
        FormalizationStep.SCALE: "Seek validation - apply for grants, submit for awards",
        FormalizationStep.EXTERNAL_VALIDATION: "Plan succession - train replacements, ensure continuity",
    }
    return upgrades.get(current, "Continue developing your initiative")


# =============================================================================
# PORTFOLIO ROLE ASSIGNMENT (TYPE-013)
# =============================================================================

def assign_portfolio_role(activity: Dict[str, Any],
                          tier: ActivityTier,
                          existing_assignments: List[RoleAssignment]) -> RoleAssignment:
    """
    Assign strategic role to activity within 10-slot portfolio.

    Uses tier, activity type, and existing portfolio composition
    to optimize role distribution.

    Args:
        activity: Activity dict
        tier: Already-classified tier
        existing_assignments: Current role assignments

    Returns:
        RoleAssignment with role and reasoning
    """
    name = activity.get("name", "Unknown")
    category = activity.get("category", "").upper()
    description = activity.get("description", "").lower()

    # Count existing roles
    role_counts = {role: 0 for role in PortfolioRole}
    for assignment in existing_assignments:
        role_counts[assignment.assigned_role] += 1

    # Determine best role based on tier and type
    assigned_role = PortfolioRole.UNASSIGNED
    fit_score = 0.5
    reasoning = ""

    # T1/T2 activities are flagship candidates
    if tier in [ActivityTier.T1_NATIONAL, ActivityTier.T2_REGIONAL]:
        if role_counts[PortfolioRole.FLAGSHIP] < PORTFOLIO_ALLOCATION[PortfolioRole.FLAGSHIP]["max"]:
            assigned_role = PortfolioRole.FLAGSHIP
            fit_score = 0.9 if tier == ActivityTier.T1_NATIONAL else 0.8
            reasoning = f"High-tier ({tier.value}) activity anchors narrative"
        else:
            assigned_role = PortfolioRole.SUPPORTING
            fit_score = 0.7
            reasoning = "Flagship slots full, assigned as strong supporting activity"

    # Service/community activities
    elif category == "COMMUNITY" or "service" in description or "volunteer" in description:
        if role_counts[PortfolioRole.SERVICE] < PORTFOLIO_ALLOCATION[PortfolioRole.SERVICE]["max"]:
            assigned_role = PortfolioRole.SERVICE
            fit_score = 0.85
            reasoning = "Community-focused activity demonstrates service commitment"
        else:
            assigned_role = PortfolioRole.SUPPORTING
            fit_score = 0.6
            reasoning = "Service slots full, assigned as supporting activity"

    # Award/recognition activities
    elif "award" in description or "recognition" in description or "winner" in description:
        if role_counts[PortfolioRole.VALIDATION] < PORTFOLIO_ALLOCATION[PortfolioRole.VALIDATION]["max"]:
            assigned_role = PortfolioRole.VALIDATION
            fit_score = 0.85
            reasoning = "Award/recognition provides external validation"
        else:
            assigned_role = PortfolioRole.SUPPORTING
            fit_score = 0.65
            reasoning = "Validation slots full, contributes to supporting evidence"

    # T3/T4 activities as supporting
    elif tier in [ActivityTier.T3_SCHOOL, ActivityTier.T4_PARTICIPATION]:
        if role_counts[PortfolioRole.SUPPORTING] < PORTFOLIO_ALLOCATION[PortfolioRole.SUPPORTING]["max"]:
            assigned_role = PortfolioRole.SUPPORTING
            fit_score = 0.7
            reasoning = "School-level activity supports main narrative"
        else:
            # Overflow to validation or service
            if role_counts[PortfolioRole.VALIDATION] < PORTFOLIO_ALLOCATION[PortfolioRole.VALIDATION]["max"]:
                assigned_role = PortfolioRole.VALIDATION
                fit_score = 0.5
                reasoning = "Supporting slots full, provides additional validation"
            else:
                assigned_role = PortfolioRole.SERVICE
                fit_score = 0.4
                reasoning = "Portfolio nearly full, demonstrates commitment"

    return RoleAssignment(
        activity_name=name,
        assigned_role=assigned_role,
        role_fit_score=fit_score,
        reasoning=reasoning
    )


# =============================================================================
# PORTFOLIO BALANCE ANALYSIS
# =============================================================================

def analyze_portfolio_balance(activities: List[Dict[str, Any]],
                               tier_classifications: List[TierClassification],
                               role_assignments: List[RoleAssignment]) -> PortfolioBalance:
    """
    Analyze overall portfolio balance and identify gaps.

    Args:
        activities: List of activity dicts
        tier_classifications: Tier results for each activity
        role_assignments: Role assignments for each activity

    Returns:
        PortfolioBalance with distributions, gaps, and strengths
    """
    total = len(activities)

    # Count tier distribution
    tier_dist = {tier.value: 0 for tier in ActivityTier}
    for tc in tier_classifications:
        tier_dist[tc.tier.value] += 1

    # Count role distribution
    role_dist = {role.value: 0 for role in PortfolioRole}
    for ra in role_assignments:
        role_dist[ra.assigned_role.value] += 1

    # Identify gaps
    gaps = []
    strengths = []

    # Check tier gaps
    if tier_dist.get("T1", 0) == 0:
        gaps.append("No T1 (national/international) activities - seek major competitions or publications")
    if tier_dist.get("T1", 0) + tier_dist.get("T2", 0) == 0:
        gaps.append("No T1/T2 activities - profile lacks distinction at regional+ level")
    if tier_dist.get("T1", 0) >= 2:
        strengths.append(f"Strong T1 presence ({tier_dist['T1']} national-level activities)")

    # Check role gaps
    if role_dist.get("FLAGSHIP", 0) < PORTFOLIO_ALLOCATION[PortfolioRole.FLAGSHIP]["min"]:
        gaps.append(f"Only {role_dist.get('FLAGSHIP', 0)} flagship activities (need {PORTFOLIO_ALLOCATION[PortfolioRole.FLAGSHIP]['min']})")
    if role_dist.get("SERVICE", 0) < PORTFOLIO_ALLOCATION[PortfolioRole.SERVICE]["min"]:
        gaps.append("Missing dedicated service activity")

    # Check for over-concentration
    max_category = max(role_dist.values()) if role_dist.values() else 0
    if max_category > 5 and total >= 8:
        gaps.append("Portfolio over-concentrated in one role - need more diversity")

    # Calculate balance score
    # Ideal: 2-3 flagship, 3-4 supporting, 2-3 validation, 1-2 service
    ideal_dist = {"FLAGSHIP": 2.5, "SUPPORTING": 3.5, "VALIDATION": 2.5, "SERVICE": 1.5}

    if total > 0:
        deviation = sum(abs(role_dist.get(role, 0) - ideal)
                       for role, ideal in ideal_dist.items())
        max_deviation = total * 2  # Worst case
        balance_score = max(0, 1 - (deviation / max_deviation)) if max_deviation > 0 else 0.5
    else:
        balance_score = 0.0

    return PortfolioBalance(
        total_activities=total,
        tier_distribution=tier_dist,
        role_distribution=role_dist,
        balance_score=balance_score,
        gaps=gaps,
        strengths=strengths
    )


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_ec_portfolio(activities: List[Dict[str, Any]]) -> ECPortfolioOutput:
    """
    Complete EC portfolio analysis using all scoring primitives.

    This is the main entry point that combines:
    - Tier classification (TYPE-013)
    - Evidence analysis (TYPE-015)
    - Formalization analysis (TYPE-019)
    - Role assignment (TYPE-013)
    - Portfolio balance analysis

    Args:
        activities: List of activity dicts with:
            - name: Activity name
            - description: Activity description
            - role_level: Leadership level (Founder, President, Member, etc.)
            - impact_metric: Reach/users affected
            - awards: List of awards received
            - category: APTITUDE, PASSION, COMMUNITY
            - metrics: Dict of measured outcomes
            - media_coverage: List of media mentions
            - revenue: Revenue generated (if any)
            - team_size: Number of team members
            - registered: Whether officially registered
            - expanded: Whether expanded beyond original scope

    Returns:
        ECPortfolioOutput with complete analysis
    """
    if not activities:
        return ECPortfolioOutput(
            activities=[],
            portfolio_balance=PortfolioBalance(
                total_activities=0,
                tier_distribution={},
                role_distribution={},
                balance_score=0.0,
                gaps=["No activities to analyze"],
                strengths=[]
            ),
            average_tier_score=0.0,
            average_evidence_score=0.0,
            average_formalization_score=0.0,
            portfolio_strength_score=0.0,
            priority_upgrades=[],
            missing_roles=[PortfolioRole.FLAGSHIP, PortfolioRole.SERVICE],
            tier_gaps=["No T1/T2 activities"]
        )

    # Analyze each activity
    activity_analyses = []
    tier_classifications = []
    role_assignments = []

    for activity in activities:
        # Tier classification
        tier = classify_activity_tier(activity)
        tier_classifications.append(tier)

        # Evidence analysis
        evidence = analyze_evidence_level(activity)

        # Formalization analysis
        formalization = analyze_formalization(activity)

        # Role assignment (needs existing assignments for balance)
        role = assign_portfolio_role(activity, tier.tier, role_assignments)
        role_assignments.append(role)

        # Calculate composite score
        tier_score = _tier_to_score(tier.tier)
        composite = (tier_score * 0.4 + evidence.evidence_score * 0.3 +
                    formalization.formalization_score * 0.3)

        activity_analyses.append(ActivityAnalysis(
            name=activity.get("name", "Unknown"),
            tier=tier,
            evidence=evidence,
            formalization=formalization,
            role=role,
            composite_score=composite
        ))

    # Portfolio balance analysis
    balance = analyze_portfolio_balance(activities, tier_classifications, role_assignments)

    # Calculate aggregates
    avg_tier = sum(_tier_to_score(a.tier.tier) for a in activity_analyses) / len(activity_analyses)
    avg_evidence = sum(a.evidence.evidence_score for a in activity_analyses) / len(activity_analyses)
    avg_formalization = sum(a.formalization.formalization_score for a in activity_analyses) / len(activity_analyses)

    # Portfolio strength (0-100)
    portfolio_strength = (
        avg_tier * 10 * 0.35 +          # Tier contributes 35%
        avg_evidence * 10 * 0.25 +       # Evidence contributes 25%
        avg_formalization * 10 * 0.20 +  # Formalization contributes 20%
        balance.balance_score * 100 * 0.20  # Balance contributes 20%
    )

    # Generate priority upgrades
    priority_upgrades = _generate_priority_upgrades(activity_analyses, balance)

    # Identify missing roles
    missing_roles = []
    role_dist = balance.role_distribution
    for role, alloc in PORTFOLIO_ALLOCATION.items():
        if role_dist.get(role.value, 0) < alloc["min"]:
            missing_roles.append(role)

    # Tier gaps
    tier_gaps = []
    if balance.tier_distribution.get("T1", 0) == 0:
        tier_gaps.append("No T1 activities - need national/international recognition")
    if balance.tier_distribution.get("T1", 0) + balance.tier_distribution.get("T2", 0) < 2:
        tier_gaps.append("Insufficient T1/T2 activities - need more high-tier achievements")

    return ECPortfolioOutput(
        activities=activity_analyses,
        portfolio_balance=balance,
        average_tier_score=avg_tier,
        average_evidence_score=avg_evidence,
        average_formalization_score=avg_formalization,
        portfolio_strength_score=portfolio_strength,
        priority_upgrades=priority_upgrades,
        missing_roles=missing_roles,
        tier_gaps=tier_gaps
    )


def _tier_to_score(tier: ActivityTier) -> float:
    """Convert tier to 0-10 score."""
    scores = {
        ActivityTier.T1_NATIONAL: 10.0,
        ActivityTier.T2_REGIONAL: 7.5,
        ActivityTier.T3_SCHOOL: 5.0,
        ActivityTier.T4_PARTICIPATION: 2.5,
    }
    return scores.get(tier, 2.5)


def _generate_priority_upgrades(analyses: List[ActivityAnalysis],
                                 balance: PortfolioBalance) -> List[str]:
    """Generate prioritized upgrade recommendations."""
    upgrades = []

    # Priority 1: Get T1/T2 activities if missing
    t1_t2_count = (balance.tier_distribution.get("T1", 0) +
                   balance.tier_distribution.get("T2", 0))
    if t1_t2_count < 2:
        # Find best upgrade candidates (T3 with high composite scores)
        t3_activities = [a for a in analyses if a.tier.tier == ActivityTier.T3_SCHOOL]
        t3_activities.sort(key=lambda x: x.composite_score, reverse=True)
        if t3_activities:
            best = t3_activities[0]
            upgrades.append(f"PRIORITY: Upgrade '{best.name}' from T3→T2 - {best.tier.upgrade_potential}")

    # Priority 2: Evidence upgrades for flagship activities
    flagships = [a for a in analyses if a.role.assigned_role == PortfolioRole.FLAGSHIP]
    for f in flagships:
        if f.evidence.current_level in [EvidenceLevel.M0_BUILT, EvidenceLevel.M1_USED]:
            upgrades.append(f"Evidence gap in flagship '{f.name}': {f.evidence.upgrade_action}")

    # Priority 3: Formalization for high-potential activities
    high_potential = [a for a in analyses
                     if a.tier.tier in [ActivityTier.T2_REGIONAL, ActivityTier.T3_SCHOOL]
                     and a.formalization.current_step.value <= 3]
    for hp in high_potential[:2]:  # Top 2
        upgrades.append(f"Formalize '{hp.name}': {hp.formalization.upgrade_action}")

    return upgrades[:5]  # Return top 5 priorities


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_portfolio_analysis(output: ECPortfolioOutput) -> str:
    """Format portfolio analysis as readable summary."""
    lines = [
        "=" * 60,
        "EC PORTFOLIO ANALYSIS",
        "=" * 60,
        "",
        f"Total Activities: {output.portfolio_balance.total_activities}",
        f"Portfolio Strength: {output.portfolio_strength_score:.1f}/100",
        "",
        "--- TIER DISTRIBUTION ---",
    ]

    for tier, count in output.portfolio_balance.tier_distribution.items():
        lines.append(f"  {tier}: {count}")

    lines.extend([
        "",
        "--- ROLE DISTRIBUTION ---",
    ])

    for role, count in output.portfolio_balance.role_distribution.items():
        lines.append(f"  {role}: {count}")

    lines.extend([
        "",
        f"--- AVERAGE SCORES ---",
        f"  Tier Score: {output.average_tier_score:.1f}/10",
        f"  Evidence Score: {output.average_evidence_score:.1f}/10",
        f"  Formalization Score: {output.average_formalization_score:.1f}/10",
        f"  Balance Score: {output.portfolio_balance.balance_score:.2f}",
        "",
        "--- GAPS ---",
    ])

    for gap in output.portfolio_balance.gaps:
        lines.append(f"  • {gap}")

    lines.extend([
        "",
        "--- PRIORITY UPGRADES ---",
    ])

    for i, upgrade in enumerate(output.priority_upgrades, 1):
        lines.append(f"  {i}. {upgrade}")

    lines.append("=" * 60)

    return "\n".join(lines)


def get_activity_summary(analysis: ActivityAnalysis) -> str:
    """Get concise summary for single activity."""
    return (
        f"{analysis.name}: "
        f"Tier={analysis.tier.tier.value}, "
        f"Evidence={analysis.evidence.current_level.value}, "
        f"Formal={analysis.formalization.current_step.value}/7, "
        f"Role={analysis.role.assigned_role.value}, "
        f"Score={analysis.composite_score:.1f}"
    )
