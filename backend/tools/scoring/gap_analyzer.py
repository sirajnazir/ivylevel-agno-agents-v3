# IMPLEMENTS: TYPE-086 (Gap Priority Analyzer)
# LAYER: Scoring Tools (Primitive-based)
"""
Gap Priority Analyzer Engine

This module implements the strategic gap prioritization system derived from
Jenny's coaching sessions (W001-W093). It takes the 5D rubric output and
applies urgency multipliers to generate prioritized action plans.

ARCHITECTURE PRINCIPLE:
- Uses 5D Rubric output (rubric_5d.py) as PRIMITIVE
- Does NOT re-calculate dimension scores
- Adds PRIORITIZATION layer on top of 5D rubric

PURPOSE:
- Categorize gaps by priority (P0/P1/P2/P3)
- Apply urgency based on grade level (time remaining)
- Generate specific closing actions per gap
- Provide timeline-aware coaching recommendations

FORMULA:
    Priority Score = Gap Size × Dimension Weight × Urgency Multiplier

URGENCY MULTIPLIERS:
    Senior (12):    1.5 (application imminent)
    Junior (11):    1.3 (critical year)
    Sophomore (10): 1.1 (time to build)
    Freshman (9):   1.0 (foundation year)

PRIORITY THRESHOLDS:
    P0: score >= 8  (Critical - address immediately)
    P1: score >= 5  (High - address in 8 weeks)
    P2: score >= 2  (Medium - address this semester)
    P3: score < 2   (Low - nice to have)
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum, IntEnum

# Import PRIMITIVES from rubric_5d (DO NOT DUPLICATE)
from backend.tools.scoring.rubric_5d import (
    calculate_5d_rubric,
    Rubric5DOutput,
    DimensionScore,
    IVY_TARGET_SCORE,
)


# =============================================================================
# CONSTANTS (TYPE-086 Spec)
# =============================================================================

class GradeLevel(IntEnum):
    """High school grade levels"""
    FRESHMAN = 9
    SOPHOMORE = 10
    JUNIOR = 11
    SENIOR = 12


# Urgency multipliers by grade level
URGENCY_MULTIPLIERS: Dict[int, float] = {
    9: 1.0,   # Freshman - foundation year
    10: 1.1,  # Sophomore - time to build
    11: 1.3,  # Junior - critical year
    12: 1.5,  # Senior - application imminent
}

# Priority thresholds
PRIORITY_THRESHOLDS = {
    "P0": 8.0,  # Critical - address immediately
    "P1": 5.0,  # High - address in 8 weeks
    "P2": 2.0,  # Medium - address this semester
    # P3: anything below P2
}

# Timeline recommendations by priority and grade
TIMELINE_RECOMMENDATIONS: Dict[str, Dict[int, str]] = {
    "P0": {
        12: "Address in next 2 weeks - application critical",
        11: "Address this month - summer planning essential",
        10: "Address this quarter - foundation building",
        9: "Address this semester - early advantage",
    },
    "P1": {
        12: "Address in next 4 weeks",
        11: "Address in 8 weeks - pre-summer",
        10: "Address this semester",
        9: "Address this year",
    },
    "P2": {
        12: "Address if time permits",
        11: "Address by end of junior year",
        10: "Address by end of sophomore year",
        9: "Address over next 2 years",
    },
    "P3": {
        12: "Nice to have - focus on P0/P1",
        11: "Consider for senior year",
        10: "Long-term goal",
        9: "Long-term goal",
    },
}

# Detailed closing actions by dimension and priority
CLOSING_ACTIONS_DETAILED: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "academics": {
        "P0": [
            {"action": "Intensive SAT/ACT prep course", "timeline": "8 weeks", "expected_boost": "+100-150 points"},
            {"action": "Arrange tutoring for lowest-performing subjects", "timeline": "Ongoing", "expected_boost": "+0.2 GPA"},
            {"action": "Enroll in additional AP for next semester", "timeline": "Registration deadline", "expected_boost": "+1 AP"},
        ],
        "P1": [
            {"action": "Self-study SAT prep with practice tests", "timeline": "12 weeks", "expected_boost": "+50-100 points"},
            {"action": "Office hours with teachers weekly", "timeline": "Ongoing", "expected_boost": "Grade improvement"},
            {"action": "Consider test-optional strategy if scores plateau", "timeline": "Decision by fall", "expected_boost": "Strategic"},
        ],
        "P2": [
            {"action": "Maintain current trajectory", "timeline": "Ongoing", "expected_boost": "Sustain"},
            {"action": "Challenge yourself with one harder course", "timeline": "Next semester", "expected_boost": "Rigor signal"},
        ],
    },
    "leadership": {
        "P0": [
            {"action": "Found a club or initiative THIS MONTH", "timeline": "4 weeks", "expected_boost": "+3 points"},
            {"action": "Run for officer position in existing club", "timeline": "Next election", "expected_boost": "+2 points"},
            {"action": "Take on visible project leadership role", "timeline": "Immediate", "expected_boost": "+1-2 points"},
        ],
        "P1": [
            {"action": "Identify 2-3 clubs for officer track", "timeline": "This semester", "expected_boost": "Pipeline"},
            {"action": "Propose and lead a specific initiative", "timeline": "8 weeks", "expected_boost": "+1-2 points"},
            {"action": "Mentor underclassmen (informal leadership)", "timeline": "Ongoing", "expected_boost": "Leadership signal"},
        ],
        "P2": [
            {"action": "Deepen involvement in current activities", "timeline": "This year", "expected_boost": "Tenure"},
            {"action": "Document leadership contributions", "timeline": "Ongoing", "expected_boost": "Application ready"},
        ],
    },
    "service": {
        "P0": [
            {"action": "Commit to weekly volunteering (5+ hrs/week)", "timeline": "Start this week", "expected_boost": "+100 hrs/semester"},
            {"action": "Take on volunteer coordinator role", "timeline": "4 weeks", "expected_boost": "+1 leadership point"},
            {"action": "Document impact with specific metrics", "timeline": "Ongoing", "expected_boost": "Story ready"},
        ],
        "P1": [
            {"action": "Find consistent volunteer opportunity", "timeline": "2 weeks", "expected_boost": "Consistency signal"},
            {"action": "Connect service to your spike/interest", "timeline": "This month", "expected_boost": "Narrative coherence"},
            {"action": "Get testimonials from service recipients", "timeline": "8 weeks", "expected_boost": "Impact evidence"},
        ],
        "P2": [
            {"action": "Increase hours gradually", "timeline": "This semester", "expected_boost": "+50 hrs"},
            {"action": "Seek service leadership opportunity", "timeline": "This year", "expected_boost": "Leadership signal"},
        ],
    },
    "artifacts": {
        "P0": [
            {"action": "Ship a project THIS MONTH", "timeline": "4 weeks", "expected_boost": "+2-3 points"},
            {"action": "Publish work (blog, research paper, app)", "timeline": "6 weeks", "expected_boost": "+3 points"},
            {"action": "Get external validation (users, citations, press)", "timeline": "8 weeks", "expected_boost": "+2 points"},
        ],
        "P1": [
            {"action": "Start building a tangible project", "timeline": "This week", "expected_boost": "Pipeline"},
            {"action": "Document existing work professionally", "timeline": "4 weeks", "expected_boost": "Portfolio ready"},
            {"action": "Submit to competitions or publications", "timeline": "Next deadline", "expected_boost": "Validation chance"},
        ],
        "P2": [
            {"action": "Iterate on existing projects", "timeline": "Ongoing", "expected_boost": "Quality improvement"},
            {"action": "Build portfolio website", "timeline": "This semester", "expected_boost": "Presentation"},
        ],
    },
    "recognition": {
        "P0": [
            {"action": "Register for upcoming competitions NOW", "timeline": "Next deadline", "expected_boost": "Entry ticket"},
            {"action": "Apply to NCWIT/Scholastic/Science Olympiad", "timeline": "Registration deadline", "expected_boost": "+2-4 points if placed"},
            {"action": "Submit to Regeneron STS/ISEF pipeline", "timeline": "Fall deadline", "expected_boost": "+4 points if semifinalist"},
        ],
        "P1": [
            {"action": "Research all applicable awards in your field", "timeline": "2 weeks", "expected_boost": "Target list"},
            {"action": "Enter AMC/AIME if math-inclined", "timeline": "November", "expected_boost": "+2-4 points"},
            {"action": "Apply to selective summer programs", "timeline": "January-March", "expected_boost": "Credential"},
        ],
        "P2": [
            {"action": "Build toward next year's competitions", "timeline": "This year", "expected_boost": "Preparation"},
            {"action": "Seek school-level recognition first", "timeline": "This semester", "expected_boost": "Foundation"},
        ],
    },
}


# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class PriorityLevel(str, Enum):
    """Gap priority levels"""
    P0 = "P0"  # Critical
    P1 = "P1"  # High
    P2 = "P2"  # Medium
    P3 = "P3"  # Low


class ClosingAction(BaseModel):
    """A specific action to close a gap"""
    action: str
    timeline: str
    expected_boost: str
    priority_order: int = Field(description="Order within this gap's actions")


class GapDetail(BaseModel):
    """Detailed analysis of a single gap"""
    dimension: str
    raw_gap: int = Field(ge=0, le=10, description="Gap from target (8)")
    dimension_weight: float
    urgency_multiplier: float
    priority_score: float = Field(description="Gap × Weight × Urgency")
    priority_level: PriorityLevel

    # Context
    current_score: int
    target_score: int = Field(default=8)
    grade_level: int

    # Coaching
    timeline_recommendation: str
    closing_actions: List[ClosingAction]

    # From 5D rubric
    gaps_identified: List[str] = Field(default_factory=list)


class GapAnalysisOutput(BaseModel):
    """Complete gap analysis output"""
    # Student context
    grade_level: int
    urgency_multiplier: float

    # Prioritized gaps (sorted by priority_score descending)
    gaps: List[GapDetail]

    # Summary by priority level
    p0_gaps: List[str] = Field(default_factory=list, description="Critical gaps")
    p1_gaps: List[str] = Field(default_factory=list, description="High priority gaps")
    p2_gaps: List[str] = Field(default_factory=list, description="Medium priority gaps")
    p3_gaps: List[str] = Field(default_factory=list, description="Low priority gaps")

    # Top actions (most impactful across all gaps)
    top_3_actions: List[ClosingAction]

    # Coaching summary
    primary_focus: str = Field(description="The single most important gap to address")
    coaching_message: str = Field(description="Personalized coaching summary")

    # Source data
    rubric_5d: Rubric5DOutput


# =============================================================================
# CORE FUNCTIONS
# =============================================================================

def get_urgency_multiplier(grade_level: int) -> float:
    """
    Get urgency multiplier for a grade level.

    Higher grades = more urgency = higher multiplier.
    """
    # Clamp to valid range
    grade = max(9, min(12, grade_level))
    return URGENCY_MULTIPLIERS.get(grade, 1.0)


def calculate_priority_score(
    gap: int,
    dimension_weight: float,
    urgency_multiplier: float
) -> float:
    """
    Calculate priority score using TYPE-086 formula.

    Formula: Priority Score = Gap × Weight × Urgency
    """
    return gap * dimension_weight * urgency_multiplier


def determine_priority_level(priority_score: float) -> PriorityLevel:
    """
    Determine priority level from priority score.

    P0: >= 8 (Critical)
    P1: >= 5 (High)
    P2: >= 2 (Medium)
    P3: < 2 (Low)
    """
    if priority_score >= PRIORITY_THRESHOLDS["P0"]:
        return PriorityLevel.P0
    if priority_score >= PRIORITY_THRESHOLDS["P1"]:
        return PriorityLevel.P1
    if priority_score >= PRIORITY_THRESHOLDS["P2"]:
        return PriorityLevel.P2
    return PriorityLevel.P3


def get_closing_actions_for_gap(
    dimension: str,
    priority_level: PriorityLevel
) -> List[ClosingAction]:
    """
    Get specific closing actions for a gap based on dimension and priority.
    """
    # Get priority-specific actions, fallback to P2 if not found
    priority_key = priority_level.value
    if priority_key == "P3":
        priority_key = "P2"  # P3 uses P2 actions

    dimension_actions = CLOSING_ACTIONS_DETAILED.get(dimension, {})
    actions_raw = dimension_actions.get(priority_key, [])

    # Convert to ClosingAction models
    return [
        ClosingAction(
            action=a["action"],
            timeline=a["timeline"],
            expected_boost=a["expected_boost"],
            priority_order=i + 1,
        )
        for i, a in enumerate(actions_raw)
    ]


def get_timeline_recommendation(
    priority_level: PriorityLevel,
    grade_level: int
) -> str:
    """
    Get timeline recommendation based on priority and grade.
    """
    grade = max(9, min(12, grade_level))
    priority_key = priority_level.value

    return TIMELINE_RECOMMENDATIONS.get(priority_key, {}).get(
        grade,
        "Address based on your timeline"
    )


def analyze_gap(
    dimension_score: DimensionScore,
    grade_level: int,
    urgency_multiplier: float
) -> GapDetail:
    """
    Analyze a single dimension gap.
    """
    # Calculate priority score
    priority_score = calculate_priority_score(
        gap=dimension_score.gap,
        dimension_weight=dimension_score.weight,
        urgency_multiplier=urgency_multiplier
    )

    # Determine priority level
    priority_level = determine_priority_level(priority_score)

    # Get closing actions
    closing_actions = get_closing_actions_for_gap(
        dimension=dimension_score.dimension,
        priority_level=priority_level
    )

    # Get timeline recommendation
    timeline_rec = get_timeline_recommendation(priority_level, grade_level)

    return GapDetail(
        dimension=dimension_score.dimension,
        raw_gap=dimension_score.gap,
        dimension_weight=dimension_score.weight,
        urgency_multiplier=urgency_multiplier,
        priority_score=round(priority_score, 2),
        priority_level=priority_level,
        current_score=dimension_score.score,
        target_score=IVY_TARGET_SCORE,
        grade_level=grade_level,
        timeline_recommendation=timeline_rec,
        closing_actions=closing_actions,
        gaps_identified=dimension_score.gaps_identified,
    )


def generate_coaching_message(
    gaps: List[GapDetail],
    grade_level: int,
    rubric: Rubric5DOutput
) -> str:
    """
    Generate personalized coaching message based on gap analysis.
    """
    p0_count = len([g for g in gaps if g.priority_level == PriorityLevel.P0])
    p1_count = len([g for g in gaps if g.priority_level == PriorityLevel.P1])

    grade_names = {9: "freshman", 10: "sophomore", 11: "junior", 12: "senior"}
    grade_name = grade_names.get(grade_level, "student")

    # Build message based on situation
    if p0_count == 0 and p1_count == 0:
        return (
            f"Strong position for a {grade_name}. Your {rubric.total_score}/50 baseline "
            f"shows solid foundation. Focus on deepening {rubric.strongest_dimension} "
            f"while incrementally improving {rubric.weakest_dimension}."
        )

    if p0_count >= 2:
        p0_dims = [g.dimension for g in gaps if g.priority_level == PriorityLevel.P0]
        return (
            f"Critical gaps identified in {', '.join(p0_dims)}. "
            f"As a {grade_name}, these need immediate attention. "
            f"Focus on quick wins: one leadership role, one competition entry, "
            f"or one tangible project can significantly move the needle."
        )

    if p0_count == 1:
        p0_gap = next(g for g in gaps if g.priority_level == PriorityLevel.P0)
        return (
            f"Primary focus: {p0_gap.dimension}. This is your biggest opportunity "
            f"for score improvement. Current {p0_gap.current_score}/10 → target 8/10. "
            f"{p0_gap.timeline_recommendation}."
        )

    # P1 gaps only
    if p1_count >= 1:
        p1_dims = [g.dimension for g in gaps if g.priority_level == PriorityLevel.P1][:2]
        return (
            f"Good baseline at {rubric.total_score}/50. Priority areas: "
            f"{', '.join(p1_dims)}. As a {grade_name}, you have time to build these "
            f"systematically. Start with the highest-impact actions."
        )

    return (
        f"Baseline: {rubric.total_score}/50. Continue building across all dimensions "
        f"with focus on {rubric.weakest_dimension}."
    )


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_gaps(
    profile: Dict[str, Any],
    grade_level: Optional[int] = None,
    rubric_5d: Optional[Rubric5DOutput] = None
) -> GapAnalysisOutput:
    """
    Analyze gaps with priority scoring.

    This is the main entry point for TYPE-086 gap analysis.

    Args:
        profile: Student profile dictionary
        grade_level: Grade level (9-12). If not provided, extracted from profile.
        rubric_5d: Optional pre-calculated 5D rubric. If not provided, calculated.

    Returns:
        GapAnalysisOutput with prioritized gaps and recommendations
    """
    # Get grade level from profile if not provided
    if grade_level is None:
        demographics = profile.get("demographics", {})
        grade_level = demographics.get("grade_level", 11)  # Default to junior

    # Ensure valid grade range
    grade_level = max(9, min(12, grade_level))

    # Calculate 5D rubric if not provided (use as PRIMITIVE)
    if rubric_5d is None:
        rubric_5d = calculate_5d_rubric(profile)

    # Get urgency multiplier
    urgency = get_urgency_multiplier(grade_level)

    # Analyze each dimension
    dimension_scores = [
        rubric_5d.academics,
        rubric_5d.leadership,
        rubric_5d.service,
        rubric_5d.artifacts,
        rubric_5d.recognition,
    ]

    gaps = [
        analyze_gap(dim_score, grade_level, urgency)
        for dim_score in dimension_scores
    ]

    # Sort by priority score (highest first)
    gaps.sort(key=lambda g: g.priority_score, reverse=True)

    # Group by priority level
    p0_gaps = [g.dimension for g in gaps if g.priority_level == PriorityLevel.P0]
    p1_gaps = [g.dimension for g in gaps if g.priority_level == PriorityLevel.P1]
    p2_gaps = [g.dimension for g in gaps if g.priority_level == PriorityLevel.P2]
    p3_gaps = [g.dimension for g in gaps if g.priority_level == PriorityLevel.P3]

    # Get top 3 actions across all gaps
    all_actions = []
    for gap in gaps:
        if gap.priority_level in [PriorityLevel.P0, PriorityLevel.P1]:
            for action in gap.closing_actions[:2]:  # Top 2 from each priority gap
                all_actions.append(action)
    top_3_actions = all_actions[:3]

    # Primary focus is highest priority gap
    primary_focus = gaps[0].dimension if gaps else "academics"

    # Generate coaching message
    coaching_message = generate_coaching_message(gaps, grade_level, rubric_5d)

    return GapAnalysisOutput(
        grade_level=grade_level,
        urgency_multiplier=urgency,
        gaps=gaps,
        p0_gaps=p0_gaps,
        p1_gaps=p1_gaps,
        p2_gaps=p2_gaps,
        p3_gaps=p3_gaps,
        top_3_actions=top_3_actions,
        primary_focus=primary_focus,
        coaching_message=coaching_message,
        rubric_5d=rubric_5d,
    )


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_gap_analysis(analysis: GapAnalysisOutput) -> str:
    """
    Format gap analysis as human-readable summary for coaching.
    """
    lines = [
        f"GAP PRIORITY ANALYSIS (Grade {analysis.grade_level}, Urgency {analysis.urgency_multiplier}x)",
        "",
        f"Baseline: {analysis.rubric_5d.total_score}/50",
        "",
        "PRIORITIZED GAPS:",
    ]

    for gap in analysis.gaps:
        priority_indicator = {
            PriorityLevel.P0: "🔴",
            PriorityLevel.P1: "🟠",
            PriorityLevel.P2: "🟡",
            PriorityLevel.P3: "🟢",
        }.get(gap.priority_level, "⚪")

        lines.append(
            f"  {priority_indicator} {gap.priority_level.value} {gap.dimension.title()}: "
            f"{gap.current_score}/10 → 8/10 (gap={gap.raw_gap}, score={gap.priority_score})"
        )

    lines.append("")
    lines.append("TOP 3 ACTIONS:")
    for i, action in enumerate(analysis.top_3_actions, 1):
        lines.append(f"  {i}. {action.action} ({action.timeline})")

    lines.append("")
    lines.append(f"COACHING: {analysis.coaching_message}")

    return "\n".join(lines)


def get_gap_by_dimension(
    analysis: GapAnalysisOutput,
    dimension: str
) -> Optional[GapDetail]:
    """
    Get gap detail for a specific dimension.
    """
    for gap in analysis.gaps:
        if gap.dimension == dimension:
            return gap
    return None


def get_priority_gaps(
    analysis: GapAnalysisOutput,
    max_priority: PriorityLevel = PriorityLevel.P1
) -> List[GapDetail]:
    """
    Get all gaps at or above a priority level.

    Default returns P0 and P1 gaps.
    """
    priority_order = [PriorityLevel.P0, PriorityLevel.P1, PriorityLevel.P2, PriorityLevel.P3]
    max_index = priority_order.index(max_priority)
    allowed_priorities = priority_order[:max_index + 1]

    return [g for g in analysis.gaps if g.priority_level in allowed_priorities]


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    # Enums
    "GradeLevel",
    "PriorityLevel",
    # Models
    "ClosingAction",
    "GapDetail",
    "GapAnalysisOutput",
    # Main function
    "analyze_gaps",
    # Utilities
    "format_gap_analysis",
    "get_gap_by_dimension",
    "get_priority_gaps",
    "get_urgency_multiplier",
    "calculate_priority_score",
    "determine_priority_level",
    # Constants
    "URGENCY_MULTIPLIERS",
    "PRIORITY_THRESHOLDS",
]
