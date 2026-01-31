# IvyLevel Program Application Strategy v1.0
# LAYER: Scoring Primitives (TYPE-029)
"""
Program Application Strategy - Timeline Optimization & Portfolio Balancing.

Implements TYPE-029: Strategic application planning for summer programs
with deadline clustering and reach/match/safety balancing.

Framework: Strategic Application Planning
- Deadline clustering (batch applications to minimize overwhelm)
- Selectivity balancing (2 reach : 3 match : 2 safety ratio)
- Application velocity tracking (ensure 60%+ completion rate)
- Essay reuse maximization (identify common prompts across programs)

Core Algorithm:
Priority Score = (Deadline_Urgency × 4) + (Program_Tier × 3) + (Fit_Score × 2) + (Essay_Reuse × 1)
Max Score: 100 points

Optimal Portfolio:
- 2-3 Reach programs (T1 elite, <20% admit chance)
- 3-4 Match programs (T2 selective, 40-60% admit chance)
- 1-2 Safety programs (T3+, >70% admit chance)
Total: 6-8 programs maximum

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - deterministic calculations
- Consumes output from program_selection.py
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timedelta

from backend.tools.scoring.program_selection import (
    ProgramScoringResult,
    ProgramTier,
    SelectivityCategory,
)


# =============================================================================
# ENUMS
# =============================================================================

class ApplicationPriority(str, Enum):
    """Priority level for application."""
    CRITICAL = "critical"    # Deadline <2 weeks
    HIGH = "high"            # Deadline 2-4 weeks
    MEDIUM = "medium"        # Deadline 4-8 weeks
    LOW = "low"              # Deadline >8 weeks


class BatchStatus(str, Enum):
    """Status of a deadline batch."""
    UPCOMING = "upcoming"    # Not yet started
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    MISSED = "missed"


# =============================================================================
# CONSTANTS
# =============================================================================

# Optimal portfolio ratios
OPTIMAL_PORTFOLIO = {
    "reach": {"min": 2, "max": 3, "ratio": 0.30},
    "match": {"min": 3, "max": 4, "ratio": 0.45},
    "safety": {"min": 1, "max": 2, "ratio": 0.25},
}

# Estimated hours per application by tier
APPLICATION_HOURS = {
    ProgramTier.T1_ELITE: 12,      # T1 apps are intensive
    ProgramTier.T2_SELECTIVE: 8,   # T2 moderate effort
    ProgramTier.T3_COMPETITIVE: 5, # T3 simpler
    ProgramTier.T4_PAYTOP_LAY: 2,  # T4 minimal
}

# Priority score weights
PRIORITY_WEIGHTS = {
    "deadline_urgency": 4,
    "program_tier": 3,
    "fit_score": 2,
    "essay_reuse": 1,
}

# Deadline urgency scores
DEADLINE_URGENCY = {
    "overdue": 10,
    "critical": 9,       # <2 weeks
    "urgent": 7,         # 2-4 weeks
    "normal": 5,         # 4-8 weeks
    "comfortable": 3,    # >8 weeks
}

# Common essay prompts that can be reused
REUSABLE_PROMPT_CATEGORIES = {
    "leadership": ["leadership", "led", "organized", "managed", "team"],
    "research": ["research", "project", "experiment", "study", "discovered"],
    "impact": ["impact", "community", "helped", "served", "changed"],
    "passion": ["passion", "interest", "fascinated", "love", "curious"],
    "challenge": ["challenge", "obstacle", "difficult", "overcome", "failed"],
    "goals": ["goals", "future", "career", "aspire", "dream"],
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class ApplicationPlan(BaseModel):
    """Plan for a single program application."""
    program_id: str = ""
    program_name: str
    deadline: str
    deadline_date: Optional[datetime] = None
    priority: ApplicationPriority
    priority_score: float = Field(ge=0.0, le=100.0)
    tier: ProgramTier
    selectivity_category: SelectivityCategory
    estimated_hours: float
    essay_reuse_potential: float = Field(ge=0.0, le=1.0, description="0-1 reuse potential")
    batch_group: str = ""
    strategic_notes: str = ""
    reusable_essays: List[str] = Field(default_factory=list)


class DeadlineBatch(BaseModel):
    """Group of applications with similar deadlines."""
    batch_name: str
    batch_window: str  # e.g., "Jan 10-28"
    status: BatchStatus = BatchStatus.UPCOMING
    applications: List[ApplicationPlan] = Field(default_factory=list)
    total_hours: float = 0.0
    recommended_start_date: Optional[str] = None


class PortfolioBalance(BaseModel):
    """Analysis of reach/match/safety balance."""
    reach_count: int = 0
    reach_target: int = 2
    match_count: int = 0
    match_target: int = 3
    safety_count: int = 0
    safety_target: int = 1
    is_balanced: bool = False
    adjustment_needed: List[str] = Field(default_factory=list)


class EssayReuseOpportunity(BaseModel):
    """Opportunity to reuse essay content across programs."""
    essay_category: str
    source_program: str
    target_programs: List[str] = Field(default_factory=list)
    reuse_percentage: float = 0.0  # How much can be reused (0-100%)
    adaptation_notes: str = ""


class ProgramStrategyOutput(BaseModel):
    """
    Complete program application strategy output.
    Consumed by ProgramsAgent for strategic planning.
    """
    # Prioritized applications
    prioritized_applications: List[ApplicationPlan] = Field(default_factory=list)

    # Deadline batches
    deadline_batches: List[DeadlineBatch] = Field(default_factory=list)

    # Portfolio balance
    portfolio_balance: PortfolioBalance

    # Essay reuse
    essay_reuse_opportunities: List[EssayReuseOpportunity] = Field(default_factory=list)

    # Summary metrics
    total_programs: int = 0
    total_estimated_hours: float = 0.0
    hours_saved_via_reuse: float = 0.0
    earliest_deadline: Optional[str] = None
    latest_deadline: Optional[str] = None

    # Recommendations
    strategy_summary: str = ""
    weekly_plan: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# STRATEGY FUNCTIONS
# =============================================================================

def generate_application_strategy(scored_programs: List[ProgramScoringResult],
                                   available_hours_per_week: int = 10) -> ProgramStrategyOutput:
    """
    Generate comprehensive application strategy.

    Args:
        scored_programs: List of scored programs from program_selection
        available_hours_per_week: Weekly hours available for applications

    Returns:
        ProgramStrategyOutput with complete strategy
    """
    if not scored_programs:
        return ProgramStrategyOutput(
            portfolio_balance=PortfolioBalance(),
            recommendations=["No programs to plan - run program selection first"]
        )

    # 1. Create application plans with priority scores
    application_plans = []
    for program in scored_programs:
        plan = create_application_plan(program)
        application_plans.append(plan)

    # 2. Sort by priority score (descending)
    application_plans.sort(key=lambda x: x.priority_score, reverse=True)

    # 3. Create deadline batches
    batches = create_deadline_batches(application_plans)

    # 4. Analyze portfolio balance
    portfolio_balance = analyze_portfolio_balance(application_plans)

    # 5. Identify essay reuse opportunities
    essay_opportunities = identify_essay_reuse(application_plans)

    # 6. Calculate metrics
    total_hours = sum(p.estimated_hours for p in application_plans)
    hours_saved = calculate_hours_saved(essay_opportunities)

    # 7. Generate weekly plan
    weekly_plan = generate_weekly_plan(batches, available_hours_per_week)

    # 8. Generate recommendations
    recommendations = generate_strategy_recommendations(
        application_plans, portfolio_balance, essay_opportunities, total_hours
    )

    # 9. Generate strategy summary
    summary = generate_strategy_summary(
        len(application_plans), total_hours, hours_saved, portfolio_balance
    )

    # Find deadline range
    valid_dates = [p.deadline_date for p in application_plans if p.deadline_date]
    earliest = min(valid_dates).strftime("%Y-%m-%d") if valid_dates else None
    latest = max(valid_dates).strftime("%Y-%m-%d") if valid_dates else None

    return ProgramStrategyOutput(
        prioritized_applications=application_plans,
        deadline_batches=batches,
        portfolio_balance=portfolio_balance,
        essay_reuse_opportunities=essay_opportunities,
        total_programs=len(application_plans),
        total_estimated_hours=total_hours,
        hours_saved_via_reuse=hours_saved,
        earliest_deadline=earliest,
        latest_deadline=latest,
        strategy_summary=summary,
        weekly_plan=weekly_plan,
        recommendations=recommendations
    )


def create_application_plan(program: ProgramScoringResult) -> ApplicationPlan:
    """
    Create application plan for a single program.

    Priority Score = (Deadline × 4) + (Tier × 3) + (Fit × 2) + (Reuse × 1)
    """
    # Parse deadline
    deadline_date = None
    deadline_str = program.deadline or "TBD"
    try:
        if deadline_str != "TBD":
            deadline_date = datetime.strptime(deadline_str, "%Y-%m-%d")
    except ValueError:
        try:
            # Try other formats
            for fmt in ["%B %d, %Y", "%m/%d/%Y", "%Y/%m/%d"]:
                try:
                    deadline_date = datetime.strptime(deadline_str, fmt)
                    break
                except ValueError:
                    continue
        except Exception:
            pass

    # Calculate deadline urgency
    urgency_score = calculate_deadline_urgency(deadline_date)

    # Calculate tier score (T1=10, T2=7, T3=5, T4=3)
    tier_scores = {
        ProgramTier.T1_ELITE: 10,
        ProgramTier.T2_SELECTIVE: 7,
        ProgramTier.T3_COMPETITIVE: 5,
        ProgramTier.T4_PAYTOP_LAY: 3,
    }
    tier_score = tier_scores.get(program.tier, 5)

    # Normalize fit score (0-10 → 0-10)
    fit_score = program.dimension_scores.alignment if program.dimension_scores else 5.0

    # Estimate essay reuse potential
    essay_reuse = estimate_essay_reuse(program)
    essay_reuse_score = essay_reuse * 10  # Convert to 0-10

    # Calculate priority score
    priority_score = (
        urgency_score * PRIORITY_WEIGHTS["deadline_urgency"] +
        tier_score * PRIORITY_WEIGHTS["program_tier"] +
        fit_score * PRIORITY_WEIGHTS["fit_score"] +
        essay_reuse_score * PRIORITY_WEIGHTS["essay_reuse"]
    )

    # Determine priority level
    if urgency_score >= 9:
        priority = ApplicationPriority.CRITICAL
    elif urgency_score >= 7 or tier_score >= 10:
        priority = ApplicationPriority.HIGH
    elif urgency_score >= 5:
        priority = ApplicationPriority.MEDIUM
    else:
        priority = ApplicationPriority.LOW

    # Estimated hours
    estimated_hours = APPLICATION_HOURS.get(program.tier, 6)

    # Generate strategic notes
    strategic_notes = generate_application_notes(program, urgency_score)

    # Identify reusable essays
    reusable = identify_reusable_essays_for_program(program)

    return ApplicationPlan(
        program_id=program.program_id,
        program_name=program.program_name,
        deadline=deadline_str,
        deadline_date=deadline_date,
        priority=priority,
        priority_score=round(priority_score, 1),
        tier=program.tier,
        selectivity_category=program.selectivity_category,
        estimated_hours=estimated_hours,
        essay_reuse_potential=essay_reuse,
        strategic_notes=strategic_notes,
        reusable_essays=reusable
    )


def calculate_deadline_urgency(deadline_date: Optional[datetime]) -> float:
    """Calculate deadline urgency score (0-10)."""
    if not deadline_date:
        return 5.0  # Unknown = medium urgency

    today = datetime.now()
    days_until = (deadline_date - today).days

    if days_until < 0:
        return DEADLINE_URGENCY["overdue"]
    elif days_until < 14:
        return DEADLINE_URGENCY["critical"]
    elif days_until < 28:
        return DEADLINE_URGENCY["urgent"]
    elif days_until < 56:
        return DEADLINE_URGENCY["normal"]
    else:
        return DEADLINE_URGENCY["comfortable"]


def estimate_essay_reuse(program: ProgramScoringResult) -> float:
    """
    Estimate essay reuse potential (0-1).

    Higher for programs with common prompt types:
    - Leadership essays
    - Research experience
    - Community impact
    """
    # Base reuse by program type
    program_name = program.program_name.lower()

    # Research programs have high reuse (research essays reusable)
    if any(kw in program_name for kw in ["research", "science", "rsi", "garcia", "ssp"]):
        return 0.7

    # Leadership programs have moderate reuse
    if any(kw in program_name for kw in ["leadership", "yygs", "wharton"]):
        return 0.65

    # Academic programs
    if any(kw in program_name for kw in ["academic", "scholar", "honors"]):
        return 0.6

    # Default
    return 0.5


def generate_application_notes(program: ProgramScoringResult, urgency: float) -> str:
    """Generate strategic notes for application."""
    notes = []

    if urgency >= 9:
        notes.append("⚡ CRITICAL deadline - prioritize immediately")
    elif urgency >= 7:
        notes.append("📌 Urgent - start within 1 week")

    if program.tier == ProgramTier.T1_ELITE:
        notes.append("T1 elite - invest extra time on essays")
        notes.append("Strong recommendation letters are critical")
    elif program.tier == ProgramTier.T2_SELECTIVE:
        notes.append("T2 selective - emphasize unique angle")

    if program.scam_risk.value not in ["safe", "low_risk"]:
        notes.append(f"⚠️ Review value proposition ({program.scam_risk.value})")

    return " | ".join(notes) if notes else "Standard application process"


def identify_reusable_essays_for_program(program: ProgramScoringResult) -> List[str]:
    """Identify which essay categories this program likely uses."""
    essays = []
    name = program.program_name.lower()
    program_type = program.program_type.value if program.program_type else ""

    if "research" in name or program_type == "research":
        essays.extend(["research_experience", "scientific_curiosity"])
    if "leadership" in name or program_type == "leadership":
        essays.extend(["leadership_experience", "community_impact"])
    if any(kw in name for kw in ["entrepreneurship", "launch", "startup"]):
        essays.extend(["entrepreneurial_vision", "problem_solving"])

    # All programs likely have these
    essays.append("why_this_program")
    essays.append("goals_aspirations")

    return essays


# =============================================================================
# BATCH FUNCTIONS
# =============================================================================

def create_deadline_batches(applications: List[ApplicationPlan],
                             batch_window_days: int = 14) -> List[DeadlineBatch]:
    """
    Group applications into deadline batches (~2 week windows).

    Benefits:
    - Reduces overwhelm by focusing on one batch at a time
    - Allows essay reuse within batch
    - Enables better time management
    """
    if not applications:
        return []

    # Filter to apps with valid dates
    dated_apps = [a for a in applications if a.deadline_date]
    undated_apps = [a for a in applications if not a.deadline_date]

    if not dated_apps:
        # All undated - create single batch
        return [DeadlineBatch(
            batch_name="TBD Deadlines",
            batch_window="Check websites",
            applications=undated_apps,
            total_hours=sum(a.estimated_hours for a in undated_apps)
        )]

    # Sort by deadline
    dated_apps.sort(key=lambda x: x.deadline_date)

    batches = []
    current_batch_start = dated_apps[0].deadline_date
    current_batch_apps = []

    for app in dated_apps:
        # Check if within current batch window
        days_since_start = (app.deadline_date - current_batch_start).days

        if days_since_start <= batch_window_days:
            current_batch_apps.append(app)
        else:
            # Save current batch and start new one
            if current_batch_apps:
                batch = _create_batch(current_batch_apps, current_batch_start)
                batches.append(batch)

            current_batch_start = app.deadline_date
            current_batch_apps = [app]

    # Don't forget last batch
    if current_batch_apps:
        batch = _create_batch(current_batch_apps, current_batch_start)
        batches.append(batch)

    # Add undated batch if any
    if undated_apps:
        batches.append(DeadlineBatch(
            batch_name="TBD Deadlines",
            batch_window="Verify deadlines",
            applications=undated_apps,
            total_hours=sum(a.estimated_hours for a in undated_apps)
        ))

    return batches


def _create_batch(apps: List[ApplicationPlan], start_date: datetime) -> DeadlineBatch:
    """Create a deadline batch from applications."""
    if not apps:
        return DeadlineBatch(batch_name="Empty", batch_window="N/A")

    # Get date range
    earliest = min(a.deadline_date for a in apps if a.deadline_date)
    latest = max(a.deadline_date for a in apps if a.deadline_date)

    # Format batch name
    month = earliest.strftime("%B")
    batch_name = f"{month} {earliest.day}-{latest.day} Batch"

    # Format window
    batch_window = f"Due: {earliest.strftime('%b %d')} - {latest.strftime('%b %d')}"

    # Calculate start date (2 weeks before earliest deadline)
    recommended_start = earliest - timedelta(days=14)

    # Total hours
    total_hours = sum(a.estimated_hours for a in apps)

    # Update batch group in applications
    for app in apps:
        app.batch_group = batch_name

    return DeadlineBatch(
        batch_name=batch_name,
        batch_window=batch_window,
        applications=apps,
        total_hours=total_hours,
        recommended_start_date=recommended_start.strftime("%Y-%m-%d")
    )


# =============================================================================
# PORTFOLIO BALANCE FUNCTIONS
# =============================================================================

def analyze_portfolio_balance(applications: List[ApplicationPlan]) -> PortfolioBalance:
    """
    Analyze reach/match/safety balance.

    Optimal ratio: 2-3 reach : 3-4 match : 1-2 safety
    """
    reach = sum(1 for a in applications if a.selectivity_category == SelectivityCategory.REACH)
    match = sum(1 for a in applications if a.selectivity_category == SelectivityCategory.MATCH)
    safety = sum(1 for a in applications if a.selectivity_category == SelectivityCategory.SAFETY)

    adjustments = []

    # Check reach
    if reach < OPTIMAL_PORTFOLIO["reach"]["min"]:
        adjustments.append(f"Add {OPTIMAL_PORTFOLIO['reach']['min'] - reach} more reach program(s)")
    elif reach > OPTIMAL_PORTFOLIO["reach"]["max"]:
        adjustments.append(f"Consider dropping {reach - OPTIMAL_PORTFOLIO['reach']['max']} reach program(s)")

    # Check match
    if match < OPTIMAL_PORTFOLIO["match"]["min"]:
        adjustments.append(f"Add {OPTIMAL_PORTFOLIO['match']['min'] - match} more match program(s)")
    elif match > OPTIMAL_PORTFOLIO["match"]["max"]:
        adjustments.append(f"Consider dropping {match - OPTIMAL_PORTFOLIO['match']['max']} match program(s)")

    # Check safety
    if safety < OPTIMAL_PORTFOLIO["safety"]["min"]:
        adjustments.append(f"Add {OPTIMAL_PORTFOLIO['safety']['min'] - safety} safety program(s)")

    is_balanced = (
        OPTIMAL_PORTFOLIO["reach"]["min"] <= reach <= OPTIMAL_PORTFOLIO["reach"]["max"] and
        OPTIMAL_PORTFOLIO["match"]["min"] <= match <= OPTIMAL_PORTFOLIO["match"]["max"] and
        safety >= OPTIMAL_PORTFOLIO["safety"]["min"]
    )

    return PortfolioBalance(
        reach_count=reach,
        reach_target=OPTIMAL_PORTFOLIO["reach"]["min"],
        match_count=match,
        match_target=OPTIMAL_PORTFOLIO["match"]["min"],
        safety_count=safety,
        safety_target=OPTIMAL_PORTFOLIO["safety"]["min"],
        is_balanced=is_balanced,
        adjustment_needed=adjustments
    )


# =============================================================================
# ESSAY REUSE FUNCTIONS
# =============================================================================

def identify_essay_reuse(applications: List[ApplicationPlan]) -> List[EssayReuseOpportunity]:
    """
    Identify opportunities to reuse essays across programs.

    Groups programs by common essay categories and estimates reuse potential.
    """
    # Build category -> programs mapping
    category_programs: Dict[str, List[str]] = {}

    for app in applications:
        for essay_cat in app.reusable_essays:
            if essay_cat not in category_programs:
                category_programs[essay_cat] = []
            category_programs[essay_cat].append(app.program_name)

    # Create reuse opportunities where multiple programs share category
    opportunities = []
    for category, programs in category_programs.items():
        if len(programs) >= 2:
            # Can reuse across these programs
            opportunities.append(EssayReuseOpportunity(
                essay_category=category,
                source_program=programs[0],
                target_programs=programs[1:],
                reuse_percentage=_estimate_reuse_percentage(category),
                adaptation_notes=_get_adaptation_notes(category)
            ))

    return opportunities


def _estimate_reuse_percentage(category: str) -> float:
    """Estimate how much of an essay can be reused."""
    high_reuse = ["research_experience", "leadership_experience", "community_impact"]
    medium_reuse = ["goals_aspirations", "scientific_curiosity", "entrepreneurial_vision"]
    low_reuse = ["why_this_program"]  # Always needs customization

    if category in high_reuse:
        return 80.0
    elif category in medium_reuse:
        return 60.0
    elif category in low_reuse:
        return 30.0
    else:
        return 50.0


def _get_adaptation_notes(category: str) -> str:
    """Get notes on how to adapt essay for reuse."""
    notes = {
        "research_experience": "Core research description reusable; update for specific program connection",
        "leadership_experience": "Story reusable; adjust emphasis based on program values",
        "community_impact": "Impact metrics reusable; customize for program's community focus",
        "why_this_program": "Must be heavily customized for each program",
        "goals_aspirations": "Long-term goals reusable; link to specific program offerings",
        "scientific_curiosity": "Core narrative reusable; connect to program's research areas",
    }
    return notes.get(category, "Review and adapt as needed")


def calculate_hours_saved(opportunities: List[EssayReuseOpportunity]) -> float:
    """
    Calculate hours saved through essay reuse.

    Assumes ~2 hours per essay, reduced by reuse percentage.
    """
    hours_saved = 0.0

    for opp in opportunities:
        # Each target program saves (reuse_pct / 100 * 2 hours)
        savings_per_target = (opp.reuse_percentage / 100) * 2.0
        hours_saved += len(opp.target_programs) * savings_per_target

    return round(hours_saved, 1)


# =============================================================================
# RECOMMENDATION FUNCTIONS
# =============================================================================

def generate_weekly_plan(batches: List[DeadlineBatch],
                          hours_per_week: int) -> List[str]:
    """Generate week-by-week application plan."""
    plan = []

    for batch in batches:
        if not batch.applications:
            continue

        weeks_needed = max(1, int(batch.total_hours / hours_per_week) + 1)
        start_date = batch.recommended_start_date or "ASAP"

        plan.append(
            f"📅 {batch.batch_name}: {len(batch.applications)} apps, "
            f"~{batch.total_hours:.0f}h total, start by {start_date}"
        )

        # List programs in batch
        for app in batch.applications[:3]:
            plan.append(f"   → {app.program_name} ({app.priority.value} priority)")

        if len(batch.applications) > 3:
            plan.append(f"   → +{len(batch.applications) - 3} more...")

    return plan


def generate_strategy_recommendations(applications: List[ApplicationPlan],
                                        balance: PortfolioBalance,
                                        reuse_opps: List[EssayReuseOpportunity],
                                        total_hours: float) -> List[str]:
    """Generate strategic recommendations."""
    recs = []

    # Portfolio balance
    if balance.is_balanced:
        recs.append("✅ Portfolio balance: Good reach/match/safety distribution")
    else:
        recs.append("⚠️ Portfolio imbalance:")
        for adj in balance.adjustment_needed:
            recs.append(f"   → {adj}")

    # Time management
    if total_hours > 60:
        recs.append(f"⏰ Total effort: {total_hours:.0f}h - consider reducing program count")
    elif total_hours > 40:
        recs.append(f"⏰ Total effort: {total_hours:.0f}h - manageable with good planning")
    else:
        recs.append(f"⏰ Total effort: {total_hours:.0f}h - comfortable workload")

    # Essay reuse
    if reuse_opps:
        total_reuse_targets = sum(len(o.target_programs) for o in reuse_opps)
        recs.append(f"📝 Essay reuse: {total_reuse_targets} opportunities identified")
        recs.append("   → Write core essays once, adapt for each program")

    # Critical deadlines
    critical = [a for a in applications if a.priority == ApplicationPriority.CRITICAL]
    if critical:
        recs.append(f"🚨 CRITICAL: {len(critical)} application(s) with imminent deadlines")
        for c in critical[:2]:
            recs.append(f"   → {c.program_name}: {c.deadline}")

    # T1 focus
    t1_apps = [a for a in applications if a.tier == ProgramTier.T1_ELITE]
    if t1_apps:
        recs.append(f"🎯 T1 Elite programs: {len(t1_apps)} - invest extra effort here")

    return recs


def generate_strategy_summary(total_programs: int, total_hours: float,
                                hours_saved: float, balance: PortfolioBalance) -> str:
    """Generate strategy summary text."""
    parts = [
        f"Strategic application plan with {total_programs} programs",
        f"({balance.reach_count} reach, {balance.match_count} match, {balance.safety_count} safety)",
        f"Total: ~{total_hours:.0f}h with ~{hours_saved:.0f}h saved via essay reuse"
    ]
    return " ".join(parts)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_strategy_output(output: ProgramStrategyOutput) -> str:
    """Format strategy output as readable summary."""
    lines = [
        "=" * 60,
        "PROGRAM APPLICATION STRATEGY",
        "=" * 60,
        "",
        f"Total Programs: {output.total_programs}",
        f"Estimated Hours: {output.total_estimated_hours:.0f}h",
        f"Hours Saved (Essay Reuse): {output.hours_saved_via_reuse:.0f}h",
        f"Deadline Range: {output.earliest_deadline} to {output.latest_deadline}",
        "",
        f"--- PORTFOLIO BALANCE ---",
        f"Reach: {output.portfolio_balance.reach_count} (target: {output.portfolio_balance.reach_target})",
        f"Match: {output.portfolio_balance.match_count} (target: {output.portfolio_balance.match_target})",
        f"Safety: {output.portfolio_balance.safety_count} (target: {output.portfolio_balance.safety_target})",
        f"Balanced: {'Yes ✅' if output.portfolio_balance.is_balanced else 'No ⚠️'}",
        "",
    ]

    if output.deadline_batches:
        lines.append("--- DEADLINE BATCHES ---")
        for batch in output.deadline_batches:
            lines.append(f"📅 {batch.batch_name} ({batch.batch_window})")
            lines.append(f"   {len(batch.applications)} apps, ~{batch.total_hours:.0f}h")
        lines.append("")

    if output.weekly_plan:
        lines.append("--- WEEKLY PLAN ---")
        for item in output.weekly_plan[:5]:
            lines.append(f"  {item}")
        lines.append("")

    lines.append("--- RECOMMENDATIONS ---")
    for rec in output.recommendations[:5]:
        lines.append(f"  {rec}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_application_summary(plan: ApplicationPlan) -> str:
    """Get concise summary for single application plan."""
    return (
        f"{plan.program_name}: "
        f"Priority={plan.priority.value}, "
        f"Score={plan.priority_score:.0f}/100, "
        f"Deadline={plan.deadline}, "
        f"~{plan.estimated_hours:.0f}h"
    )
