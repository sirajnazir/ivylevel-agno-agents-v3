# IvyLevel EC Timeline Scoring v1.0
# LAYER: Scoring Primitives (Grade-Aware Strategy)
"""
Grade-Aware EC Strategy and Timeline Planning.

Implements grade-dependent behavior for EC recommendations:
- Different strategies for 9th vs 11th graders
- Time budget calculation and validation
- Portfolio urgency scoring
- Activity sequencing by quarter

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - deterministic calculations
- Composable with ec_portfolio and differentiation primitives
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


# =============================================================================
# ENUMS
# =============================================================================

class GradePhase(str, Enum):
    """Phase of high school journey by grade."""
    EXPLORATION = "EXPLORATION"     # 9th grade - try things, discover interests
    COMMITMENT = "COMMITMENT"       # 10th grade - double down on 2-3 areas
    IMPACT = "IMPACT"               # 11th grade - maximize evidence, awards
    POLISH = "POLISH"               # 12th grade - document, refine, apply


class ActivityPriority(str, Enum):
    """Priority level for activity actions."""
    CRITICAL = "CRITICAL"       # Must do immediately
    HIGH = "HIGH"               # Do within 4 weeks
    MEDIUM = "MEDIUM"           # Do this semester
    LOW = "LOW"                 # Nice to have


# =============================================================================
# CONSTANTS
# =============================================================================

# Grade to phase mapping
GRADE_PHASES = {
    9: GradePhase.EXPLORATION,
    10: GradePhase.COMMITMENT,
    11: GradePhase.IMPACT,
    12: GradePhase.POLISH,
}

# Phase strategies
PHASE_STRATEGIES = {
    GradePhase.EXPLORATION: {
        "description": "Try different activities, discover genuine interests",
        "priorities": [
            "Join 4-6 activities across different areas",
            "Identify 2-3 that genuinely excite you",
            "Don't worry about leadership yet - focus on finding fit",
            "Build relationships with mentors/advisors",
        ],
        "time_budget_weekly": 15,  # hours
        "flagship_target": 0,      # Don't need flagships yet
        "leadership_target": 0,    # Not expected yet
        "evidence_target": "M0",   # Just building is fine
        "avoid": [
            "Spreading too thin (8+ activities)",
            "Quitting too early (give each 2-3 months)",
            "Chasing prestige over interest",
        ],
    },
    GradePhase.COMMITMENT: {
        "description": "Double down on 2-3 activities, seek leadership",
        "priorities": [
            "Narrow to 3-4 core activities",
            "Seek first leadership position (officer, captain)",
            "Start a project or initiative within an existing club",
            "Begin building relationships for future recommendations",
        ],
        "time_budget_weekly": 18,
        "flagship_target": 1,
        "leadership_target": 1,
        "evidence_target": "M1",
        "avoid": [
            "Starting too many new things",
            "Staying at participation level",
            "Neglecting academics for EC",
        ],
    },
    GradePhase.IMPACT: {
        "description": "Maximize impact, formalize, seek recognition",
        "priorities": [
            "Achieve T1/T2 level in 1-2 activities",
            "Document quantifiable impact (metrics, users, $)",
            "Apply to competitions, awards, summer programs",
            "Formalize initiatives (register, expand, validate)",
            "Secure strong letters of recommendation",
        ],
        "time_budget_weekly": 20,
        "flagship_target": 2,
        "leadership_target": 2,
        "evidence_target": "M2",
        "avoid": [
            "Starting brand new activities",
            "Spreading impact too thin",
            "Missing award/competition deadlines",
        ],
    },
    GradePhase.POLISH: {
        "description": "Document, refine descriptions, apply",
        "priorities": [
            "Perfect activity descriptions (150 characters)",
            "Ensure continuity shown in activities",
            "Complete applications with strong narrative",
            "Maintain activities but don't start new ones",
        ],
        "time_budget_weekly": 12,  # Reduced for applications
        "flagship_target": 2,
        "leadership_target": 2,
        "evidence_target": "M2",
        "avoid": [
            "Starting new activities (too late)",
            "Neglecting ongoing commitments",
            "Overstating impact",
        ],
    },
}

# Time remaining by grade (approximate weeks until application)
TIME_REMAINING_WEEKS = {
    9: 156,   # 3 years
    10: 104,  # 2 years
    11: 52,   # 1 year
    12: 16,   # ~4 months (early action deadline)
}

# Quarter definitions
QUARTERS = {
    "Q1": {"months": [8, 9, 10], "name": "Fall (Aug-Oct)"},
    "Q2": {"months": [11, 12, 1], "name": "Winter (Nov-Jan)"},
    "Q3": {"months": [2, 3, 4], "name": "Spring (Feb-Apr)"},
    "Q4": {"months": [5, 6, 7], "name": "Summer (May-Jul)"},
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class GradeStrategy(BaseModel):
    """Strategy appropriate for student's grade level."""
    grade: int
    phase: GradePhase
    phase_description: str
    priorities: List[str] = Field(default_factory=list)
    avoid: List[str] = Field(default_factory=list)
    time_budget_weekly: int
    flagship_target: int
    leadership_target: int
    evidence_target: str
    weeks_remaining: int


class TimeBudget(BaseModel):
    """Time budget analysis for EC activities."""
    total_hours_committed: float
    recommended_weekly_hours: int
    available_weekly_hours: float
    is_over_committed: bool
    over_commitment_hours: float = 0.0
    recommendations: List[str] = Field(default_factory=list)


class ActivitySequence(BaseModel):
    """Sequenced activity recommendation."""
    activity_name: str
    action: str
    quarter: str
    priority: ActivityPriority
    rationale: str


class QuarterPlan(BaseModel):
    """Plan for a specific quarter."""
    quarter: str
    quarter_name: str
    focus_areas: List[str] = Field(default_factory=list)
    actions: List[ActivitySequence] = Field(default_factory=list)


class UrgencyAnalysis(BaseModel):
    """Portfolio urgency analysis."""
    urgency_score: float = Field(ge=0.0, le=1.0)
    urgency_level: str  # "critical", "high", "moderate", "low"
    time_critical_actions: List[str] = Field(default_factory=list)
    can_wait_actions: List[str] = Field(default_factory=list)


class ECTimelineOutput(BaseModel):
    """
    Complete EC timeline and grade-aware strategy output.
    Consumed by ECAgent for grade-appropriate recommendations.
    """
    # Grade strategy
    strategy: GradeStrategy

    # Time budget
    time_budget: TimeBudget

    # Urgency analysis
    urgency: UrgencyAnalysis

    # Quarterly plans
    quarterly_plans: List[QuarterPlan] = Field(default_factory=list)

    # Gap-driven actions
    priority_actions: List[ActivitySequence] = Field(default_factory=list)


# =============================================================================
# GRADE STRATEGY
# =============================================================================

def get_grade_strategy(grade: int) -> GradeStrategy:
    """
    Get appropriate strategy for student's grade level.

    Args:
        grade: Grade level (9, 10, 11, 12)

    Returns:
        GradeStrategy with phase-appropriate guidance
    """
    grade = max(9, min(12, grade))  # Clamp to valid range

    phase = GRADE_PHASES[grade]
    strategy_config = PHASE_STRATEGIES[phase]

    return GradeStrategy(
        grade=grade,
        phase=phase,
        phase_description=strategy_config["description"],
        priorities=strategy_config["priorities"],
        avoid=strategy_config["avoid"],
        time_budget_weekly=strategy_config["time_budget_weekly"],
        flagship_target=strategy_config["flagship_target"],
        leadership_target=strategy_config["leadership_target"],
        evidence_target=strategy_config["evidence_target"],
        weeks_remaining=TIME_REMAINING_WEEKS[grade]
    )


# =============================================================================
# TIME BUDGET ANALYSIS
# =============================================================================

def analyze_time_budget(activities: List[Dict[str, Any]],
                         grade: int) -> TimeBudget:
    """
    Analyze time commitment and validate against grade-appropriate budget.

    Args:
        activities: List of activity dicts with hours_per_week
        grade: Grade level

    Returns:
        TimeBudget with analysis and recommendations
    """
    strategy = get_grade_strategy(grade)
    recommended = strategy.time_budget_weekly

    # Calculate total committed hours
    total_hours = sum(
        float(a.get("hours_per_week", 0))
        for a in activities
    )

    # Assume students have ~25 hours available for ECs
    # (after school, homework, basic needs)
    max_available = 25.0
    available = max_available - total_hours

    is_over = total_hours > recommended
    over_amount = max(0, total_hours - recommended)

    recommendations = []

    if total_hours > max_available:
        recommendations.append(
            f"CRITICAL: Committed {total_hours:.0f} hours exceeds realistic capacity ({max_available:.0f}h). "
            "Consider dropping lower-priority activities."
        )
    elif is_over:
        recommendations.append(
            f"Committed {total_hours:.0f}h/week vs recommended {recommended}h for grade {grade}. "
            "Ensure academics aren't suffering."
        )

    if total_hours < recommended * 0.5:
        recommendations.append(
            f"Only {total_hours:.0f}h/week committed. Consider deepening engagement "
            "in existing activities or adding strategic new ones."
        )

    # Grade-specific recommendations
    if grade == 9 and total_hours > 20:
        recommendations.append(
            "As a freshman, focus on academics and exploration. "
            "You don't need to max out EC time yet."
        )
    elif grade == 11 and total_hours < 15:
        recommendations.append(
            "Junior year is critical for impact. "
            "Ensure sufficient time for flagship activities."
        )

    return TimeBudget(
        total_hours_committed=total_hours,
        recommended_weekly_hours=recommended,
        available_weekly_hours=max(0, available),
        is_over_committed=is_over,
        over_commitment_hours=over_amount,
        recommendations=recommendations
    )


# =============================================================================
# URGENCY ANALYSIS
# =============================================================================

def calculate_portfolio_urgency(activities: List[Dict[str, Any]],
                                 grade: int,
                                 gaps: Optional[List[Dict[str, Any]]] = None) -> UrgencyAnalysis:
    """
    Calculate urgency based on grade, gaps, and time remaining.

    Args:
        activities: Current activities
        grade: Grade level
        gaps: Optional gap analysis results

    Returns:
        UrgencyAnalysis with prioritized actions
    """
    strategy = get_grade_strategy(grade)
    weeks_remaining = strategy.weeks_remaining

    time_critical = []
    can_wait = []

    # Base urgency from grade
    grade_urgency = {9: 0.2, 10: 0.4, 11: 0.7, 12: 0.9}
    base_urgency = grade_urgency.get(grade, 0.5)

    # Check against targets
    current_flagships = sum(
        1 for a in activities
        if "founder" in a.get("role_level", "").lower()
        or "national" in a.get("description", "").lower()
    )
    current_leadership = sum(
        1 for a in activities
        if any(role in a.get("role_level", "").lower()
               for role in ["founder", "president", "captain", "director"])
    )

    # Flagship gap
    flagship_gap = max(0, strategy.flagship_target - current_flagships)
    if flagship_gap > 0:
        if grade >= 11:
            time_critical.append(
                f"URGENT: Need {flagship_gap} more flagship activity(s). "
                "Start a significant initiative NOW."
            )
            base_urgency += 0.15
        else:
            can_wait.append(
                f"Plan for {flagship_gap} flagship activity(s) in coming years."
            )

    # Leadership gap
    leadership_gap = max(0, strategy.leadership_target - current_leadership)
    if leadership_gap > 0:
        if grade >= 10:
            time_critical.append(
                f"Seek leadership: Need {leadership_gap} more leadership position(s)."
            )
            base_urgency += 0.1
        else:
            can_wait.append("Leadership positions can wait until sophomore year.")

    # Process external gaps if provided
    if gaps:
        for gap in gaps:
            priority = gap.get("priority", "P2")
            action = gap.get("action", "")
            dimension = gap.get("dimension", "")

            if priority == "P0":
                time_critical.append(f"[P0 - {dimension}] {action}")
                base_urgency += 0.1
            elif priority == "P1" and grade >= 10:
                time_critical.append(f"[P1 - {dimension}] {action}")
            else:
                can_wait.append(f"[{priority} - {dimension}] {action}")

    # Determine urgency level
    urgency_score = min(1.0, base_urgency)
    if urgency_score >= 0.8:
        urgency_level = "critical"
    elif urgency_score >= 0.6:
        urgency_level = "high"
    elif urgency_score >= 0.4:
        urgency_level = "moderate"
    else:
        urgency_level = "low"

    return UrgencyAnalysis(
        urgency_score=urgency_score,
        urgency_level=urgency_level,
        time_critical_actions=time_critical[:5],
        can_wait_actions=can_wait[:5]
    )


# =============================================================================
# QUARTERLY PLANNING
# =============================================================================

def get_current_quarter() -> str:
    """Get current quarter based on date."""
    month = datetime.now().month
    for quarter, config in QUARTERS.items():
        if month in config["months"]:
            return quarter
    return "Q1"


def generate_quarterly_plans(activities: List[Dict[str, Any]],
                              grade: int,
                              gaps: Optional[List[Dict[str, Any]]] = None) -> List[QuarterPlan]:
    """
    Generate quarter-by-quarter action plans.

    Args:
        activities: Current activities
        grade: Grade level
        gaps: Optional gap analysis results

    Returns:
        List of QuarterPlans for next 4 quarters
    """
    strategy = get_grade_strategy(grade)
    current_q = get_current_quarter()
    quarter_order = ["Q1", "Q2", "Q3", "Q4"]

    # Rotate to start from current quarter
    start_idx = quarter_order.index(current_q)
    quarter_sequence = quarter_order[start_idx:] + quarter_order[:start_idx]

    plans = []

    for i, quarter in enumerate(quarter_sequence):
        quarter_config = QUARTERS[quarter]
        plan = QuarterPlan(
            quarter=quarter,
            quarter_name=quarter_config["name"],
            focus_areas=[],
            actions=[]
        )

        # Grade-specific focus areas
        if grade == 9:
            if quarter == "Q1":
                plan.focus_areas = ["Join clubs", "Explore interests", "Meet advisors"]
            elif quarter == "Q2":
                plan.focus_areas = ["Evaluate fit", "Deepen engagement", "Academic focus"]
            elif quarter == "Q3":
                plan.focus_areas = ["Consider leadership for next year", "Research summer options"]
            else:
                plan.focus_areas = ["Summer exploration", "Skill building"]

        elif grade == 10:
            if quarter == "Q1":
                plan.focus_areas = ["Seek first leadership role", "Narrow focus to 3-4 activities"]
            elif quarter == "Q2":
                plan.focus_areas = ["Start planning initiative", "Build mentor relationships"]
            elif quarter == "Q3":
                plan.focus_areas = ["Apply to summer programs", "Research competitions"]
            else:
                plan.focus_areas = ["Summer programs", "Launch initiative"]

        elif grade == 11:
            if quarter == "Q1":
                plan.focus_areas = ["Execute flagship activities", "Apply to fall competitions"]
            elif quarter == "Q2":
                plan.focus_areas = ["Document impact metrics", "Seek external validation"]
            elif quarter == "Q3":
                plan.focus_areas = ["Apply to summer programs", "Scale initiatives"]
            else:
                plan.focus_areas = ["Major summer push", "Prepare for senior year"]

        else:  # grade 12
            if quarter == "Q1":
                plan.focus_areas = ["Perfect activity descriptions", "Early applications"]
            elif quarter == "Q2":
                plan.focus_areas = ["Regular decision apps", "Maintain activities"]
            elif quarter == "Q3":
                plan.focus_areas = ["Scholarship applications", "Decision time"]
            else:
                plan.focus_areas = ["Transition planning", "Senior events"]

        # Add gap-driven actions
        if gaps and i == 0:  # First quarter gets immediate actions
            for j, gap in enumerate(gaps[:3]):
                priority = gap.get("priority", "P2")
                action = gap.get("action", "Address gap")

                action_priority = ActivityPriority.HIGH
                if priority == "P0":
                    action_priority = ActivityPriority.CRITICAL
                elif priority == "P1":
                    action_priority = ActivityPriority.HIGH
                else:
                    action_priority = ActivityPriority.MEDIUM

                plan.actions.append(ActivitySequence(
                    activity_name=gap.get("dimension", "General"),
                    action=action,
                    quarter=quarter,
                    priority=action_priority,
                    rationale=f"{priority} gap in {gap.get('dimension', 'this area')}"
                ))

        plans.append(plan)

    return plans


# =============================================================================
# ACTIVITY SEQUENCING
# =============================================================================

def sequence_activity_actions(activities: List[Dict[str, Any]],
                               grade: int,
                               ec_portfolio_output: Optional[Any] = None) -> List[ActivitySequence]:
    """
    Sequence specific actions for activities based on grade and analysis.

    Args:
        activities: Current activities
        grade: Grade level
        ec_portfolio_output: Optional ECPortfolioOutput for richer recommendations

    Returns:
        List of ActivitySequence actions in priority order
    """
    strategy = get_grade_strategy(grade)
    current_q = get_current_quarter()
    actions = []

    for activity in activities:
        name = activity.get("name", "Unknown")
        role = activity.get("role_level", "").lower()
        hours = activity.get("hours_per_week", 0)
        evidence_level = activity.get("evidence_level", "M0")

        # Check for leadership upgrade opportunity
        if "member" in role or "participant" in role:
            if grade >= 10:
                actions.append(ActivitySequence(
                    activity_name=name,
                    action="Seek leadership position (run for officer, propose to lead project)",
                    quarter=current_q,
                    priority=ActivityPriority.HIGH if grade >= 11 else ActivityPriority.MEDIUM,
                    rationale=f"Currently at {role} level, need leadership for stronger profile"
                ))

        # Check for evidence upgrade
        if evidence_level in ["M0", "M1"] and hours >= 5:
            if grade >= 10:
                actions.append(ActivitySequence(
                    activity_name=name,
                    action="Document quantifiable impact (users served, hours logged, outcomes)",
                    quarter=current_q,
                    priority=ActivityPriority.HIGH if grade >= 11 else ActivityPriority.MEDIUM,
                    rationale="High-commitment activity needs measurable evidence"
                ))

        # Formalization check
        if "founder" in role and grade >= 10:
            actions.append(ActivitySequence(
                activity_name=name,
                action="Formalize: register as official org, build team, seek external validation",
                quarter=current_q,
                priority=ActivityPriority.HIGH,
                rationale="Founded initiative should be legitimized"
            ))

    # Add portfolio-level actions from ec_portfolio_output if available
    if ec_portfolio_output and hasattr(ec_portfolio_output, 'priority_upgrades'):
        for upgrade in ec_portfolio_output.priority_upgrades[:3]:
            actions.append(ActivitySequence(
                activity_name="Portfolio",
                action=upgrade,
                quarter=current_q,
                priority=ActivityPriority.HIGH,
                rationale="Portfolio analysis recommendation"
            ))

    # Sort by priority
    priority_order = {
        ActivityPriority.CRITICAL: 0,
        ActivityPriority.HIGH: 1,
        ActivityPriority.MEDIUM: 2,
        ActivityPriority.LOW: 3,
    }
    actions.sort(key=lambda x: priority_order.get(x.priority, 3))

    return actions[:10]  # Return top 10


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_ec_timeline(activities: List[Dict[str, Any]],
                         grade: int,
                         gaps: Optional[List[Dict[str, Any]]] = None,
                         ec_portfolio_output: Optional[Any] = None) -> ECTimelineOutput:
    """
    Complete EC timeline analysis with grade-aware strategy.

    This is the main entry point that combines:
    - Grade strategy determination
    - Time budget analysis
    - Urgency calculation
    - Quarterly planning
    - Activity sequencing

    Args:
        activities: List of activity dicts
        grade: Grade level (9, 10, 11, 12)
        gaps: Optional gap analysis results from gap_analyzer
        ec_portfolio_output: Optional ECPortfolioOutput for richer recommendations

    Returns:
        ECTimelineOutput with complete timeline analysis
    """
    # 1. Get grade strategy
    strategy = get_grade_strategy(grade)

    # 2. Analyze time budget
    time_budget = analyze_time_budget(activities, grade)

    # 3. Calculate urgency
    urgency = calculate_portfolio_urgency(activities, grade, gaps)

    # 4. Generate quarterly plans
    quarterly_plans = generate_quarterly_plans(activities, grade, gaps)

    # 5. Sequence priority actions
    priority_actions = sequence_activity_actions(
        activities, grade, ec_portfolio_output
    )

    return ECTimelineOutput(
        strategy=strategy,
        time_budget=time_budget,
        urgency=urgency,
        quarterly_plans=quarterly_plans,
        priority_actions=priority_actions
    )


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_timeline_analysis(output: ECTimelineOutput) -> str:
    """Format timeline analysis as readable summary."""
    lines = [
        "=" * 60,
        f"EC TIMELINE ANALYSIS - GRADE {output.strategy.grade}",
        "=" * 60,
        "",
        f"Phase: {output.strategy.phase.value} - {output.strategy.phase_description}",
        f"Weeks Remaining: {output.strategy.weeks_remaining}",
        "",
        "--- TIME BUDGET ---",
        f"Committed: {output.time_budget.total_hours_committed:.0f}h/week",
        f"Recommended: {output.time_budget.recommended_weekly_hours}h/week",
        f"Available: {output.time_budget.available_weekly_hours:.0f}h/week",
    ]

    if output.time_budget.is_over_committed:
        lines.append(f"⚠️ Over-committed by {output.time_budget.over_commitment_hours:.0f}h")

    lines.extend([
        "",
        f"--- URGENCY: {output.urgency.urgency_level.upper()} ({output.urgency.urgency_score:.2f}) ---"
    ])

    if output.urgency.time_critical_actions:
        lines.append("Time-Critical Actions:")
        for action in output.urgency.time_critical_actions:
            lines.append(f"  🔴 {action}")

    if output.urgency.can_wait_actions:
        lines.append("Can Wait:")
        for action in output.urgency.can_wait_actions:
            lines.append(f"  ⚪ {action}")

    lines.extend([
        "",
        "--- PRIORITIES FOR THIS PHASE ---"
    ])
    for i, priority in enumerate(output.strategy.priorities, 1):
        lines.append(f"  {i}. {priority}")

    lines.extend([
        "",
        "--- AVOID ---"
    ])
    for avoid in output.strategy.avoid:
        lines.append(f"  ❌ {avoid}")

    if output.priority_actions:
        lines.extend([
            "",
            "--- IMMEDIATE ACTIONS ---"
        ])
        for action in output.priority_actions[:5]:
            priority_icon = {
                ActivityPriority.CRITICAL: "🔴",
                ActivityPriority.HIGH: "🟠",
                ActivityPriority.MEDIUM: "🟡",
                ActivityPriority.LOW: "🟢",
            }.get(action.priority, "⚪")
            lines.append(f"  {priority_icon} [{action.activity_name}] {action.action}")

    lines.append("=" * 60)

    return "\n".join(lines)


def get_phase_summary(grade: int) -> str:
    """Get concise phase summary for grade."""
    strategy = get_grade_strategy(grade)
    return f"Grade {grade} ({strategy.phase.value}): {strategy.phase_description}"
