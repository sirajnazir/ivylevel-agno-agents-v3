# IvyLevel Award Campaign Orchestration v1.0
# LAYER: Execution (TYPE-022)
"""
Multi-Month Award Campaign Orchestration.

Implements TYPE-022: Strategic campaign management for award pursuit
over 3-12 month timelines.

Framework: Campaign Lifecycle
1. DISCOVERY: Identify target awards aligned with archetype
2. PREPARATION: Build underlying work (projects, research, artifacts)
3. APPLICATION: Draft, refine, submit applications
4. FOLLOW-UP: Track results, iterate on losses, celebrate wins

Key Principles:
- T1 awards require 6-12 month campaigns (not weekend sprints)
- T2 awards require 3-6 month preparation
- Campaigns run in parallel with staggered deadlines
- Weekly check-ins track progress against milestones

Architecture:
- Consumes AwardTierClassification from award_tiers.py
- Consumes RiskClassifiedAward from award_portfolio.py
- Produces CampaignPlan for Execution Agent weekly sessions
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timedelta

from backend.tools.scoring.award_tiers import AwardTier, classify_award_tier
from backend.tools.scoring.award_portfolio import (
    RiskBucket,
    classify_award_risk,
    RiskClassifiedAward,
)


# =============================================================================
# ENUMS
# =============================================================================

class CampaignPhase(str, Enum):
    """Phase in award campaign lifecycle."""
    DISCOVERY = "discovery"           # Identifying and vetting awards
    PREPARATION = "preparation"       # Building underlying work
    DRAFTING = "drafting"             # Writing application materials
    REFINEMENT = "refinement"         # Polishing and getting feedback
    SUBMISSION = "submission"         # Final submission window
    WAITING = "waiting"               # Awaiting results
    RESULT = "result"                 # Result received (win/loss)


class MilestoneStatus(str, Enum):
    """Status of a campaign milestone."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class CampaignPriority(str, Enum):
    """Campaign priority level."""
    CRITICAL = "critical"      # T1 with approaching deadline
    HIGH = "high"              # T1/T2 with adequate time
    MEDIUM = "medium"          # T2/T3 standard timeline
    LOW = "low"                # Nice-to-have or backup awards


class CampaignHealth(str, Enum):
    """Overall campaign health status."""
    ON_TRACK = "on_track"          # Milestones met, deadline achievable
    AT_RISK = "at_risk"            # Behind schedule, action needed
    CRITICAL = "critical"           # Severe delay, may miss deadline
    ABANDONED = "abandoned"         # Campaign discontinued


# =============================================================================
# CONSTANTS
# =============================================================================

# Typical campaign durations by tier (weeks)
CAMPAIGN_DURATION_WEEKS = {
    AwardTier.T1_NATIONAL: 36,    # 9 months for T1
    AwardTier.T2_REGIONAL: 20,    # 5 months for T2
    AwardTier.T3_LOCAL: 8,        # 2 months for T3
    AwardTier.T4_PARTICIPATION: 2, # 2 weeks for T4
}

# Phase duration as percentage of total campaign
PHASE_DURATION_PCT = {
    CampaignPhase.DISCOVERY: 5,
    CampaignPhase.PREPARATION: 50,
    CampaignPhase.DRAFTING: 20,
    CampaignPhase.REFINEMENT: 15,
    CampaignPhase.SUBMISSION: 5,
    CampaignPhase.WAITING: 5,
}

# Standard milestones per phase
PHASE_MILESTONES = {
    CampaignPhase.DISCOVERY: [
        "Research award requirements and criteria",
        "Verify eligibility",
        "Identify past winners and their profiles",
        "Assess strategic fit with narrative",
    ],
    CampaignPhase.PREPARATION: [
        "Identify underlying work needed",
        "Create project timeline",
        "Build/develop core artifact",
        "Document impact and results",
        "Gather supporting materials",
    ],
    CampaignPhase.DRAFTING: [
        "Review application requirements",
        "Write first draft of essays",
        "Prepare supporting documents",
        "Request recommendation letters",
    ],
    CampaignPhase.REFINEMENT: [
        "Get feedback on drafts",
        "Revise based on feedback",
        "Proofread and polish",
        "Verify all requirements met",
    ],
    CampaignPhase.SUBMISSION: [
        "Final review checklist",
        "Submit application",
        "Confirm receipt",
    ],
}

# Weekly time allocation by tier (hours/week)
WEEKLY_HOURS_BY_TIER = {
    AwardTier.T1_NATIONAL: 5,
    AwardTier.T2_REGIONAL: 3,
    AwardTier.T3_LOCAL: 2,
    AwardTier.T4_PARTICIPATION: 1,
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class Milestone(BaseModel):
    """A specific milestone in a campaign."""
    name: str
    phase: CampaignPhase
    status: MilestoneStatus = MilestoneStatus.NOT_STARTED
    target_date: Optional[str] = None
    completed_date: Optional[str] = None
    notes: str = ""
    blockers: List[str] = Field(default_factory=list)


class PhaseProgress(BaseModel):
    """Progress within a campaign phase."""
    phase: CampaignPhase
    status: MilestoneStatus
    start_date: Optional[str] = None
    target_end_date: Optional[str] = None
    actual_end_date: Optional[str] = None
    milestones: List[Milestone] = Field(default_factory=list)
    completion_pct: float = Field(ge=0.0, le=100.0, default=0.0)


class WeeklyAction(BaseModel):
    """Specific action for this week's execution session."""
    action: str
    priority: CampaignPriority
    estimated_hours: float
    campaign_name: str
    milestone_ref: str = ""
    rationale: str = ""


class CampaignPlan(BaseModel):
    """Complete campaign plan for a single award."""
    # Award identification
    award_name: str
    award_id: str = ""
    award_tier: AwardTier
    risk_bucket: RiskBucket

    # Campaign metadata
    campaign_id: str = ""
    priority: CampaignPriority
    health: CampaignHealth = CampaignHealth.ON_TRACK

    # Timeline
    start_date: str
    deadline: str
    weeks_remaining: int
    total_weeks: int

    # Current state
    current_phase: CampaignPhase
    overall_progress_pct: float = Field(ge=0.0, le=100.0, default=0.0)

    # Phase tracking
    phases: List[PhaseProgress] = Field(default_factory=list)

    # This week's focus
    this_week_actions: List[WeeklyAction] = Field(default_factory=list)
    weekly_hours_allocated: float = 0.0

    # Strategy notes
    strategic_rationale: str = ""
    risk_factors: List[str] = Field(default_factory=list)
    success_indicators: List[str] = Field(default_factory=list)


class CampaignDashboard(BaseModel):
    """
    Dashboard view of all active campaigns.
    Consumed by Execution Agent for weekly planning.
    """
    # Active campaigns
    active_campaigns: List[CampaignPlan] = Field(default_factory=list)

    # Summary metrics
    total_active: int = 0
    t1_campaigns: int = 0
    t2_campaigns: int = 0
    total_weekly_hours: float = 0.0

    # Health overview
    on_track_count: int = 0
    at_risk_count: int = 0
    critical_count: int = 0

    # This week's focus
    this_week_priorities: List[WeeklyAction] = Field(default_factory=list)

    # Upcoming deadlines
    deadlines_this_month: List[Dict[str, str]] = Field(default_factory=list)
    deadlines_next_month: List[Dict[str, str]] = Field(default_factory=list)

    # Recommendations
    recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# CAMPAIGN CREATION FUNCTIONS
# =============================================================================

def create_campaign_plan(award: Dict[str, Any],
                         start_date: Optional[str] = None,
                         profile: Optional[Dict[str, Any]] = None) -> CampaignPlan:
    """
    Create a multi-month campaign plan for an award.

    Args:
        award: Award dict with name, deadline, tier info, etc.
        start_date: Campaign start date (default: today)
        profile: Optional student profile for fit assessment

    Returns:
        CampaignPlan with full phase breakdown
    """
    # Classify award
    tier_classification = classify_award_tier(award)
    risk_classification = classify_award_risk(award, profile)

    # Parse dates
    today = datetime.now()
    start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else today

    deadline_str = award.get("deadline", (today + timedelta(weeks=24)).strftime("%Y-%m-%d"))
    try:
        deadline = datetime.strptime(deadline_str, "%Y-%m-%d")
    except ValueError:
        deadline = today + timedelta(weeks=24)

    # Calculate timeline
    total_days = (deadline - start).days
    total_weeks = max(1, total_days // 7)
    weeks_remaining = max(0, (deadline - today).days // 7)

    # Recommended duration for this tier
    recommended_weeks = CAMPAIGN_DURATION_WEEKS.get(tier_classification.tier, 12)

    # Determine priority
    priority = _determine_campaign_priority(
        tier_classification.tier,
        weeks_remaining,
        risk_classification.risk_bucket
    )

    # Generate phases with milestones
    phases = _generate_campaign_phases(
        tier_classification.tier,
        start,
        deadline,
        total_weeks
    )

    # Calculate overall progress
    overall_progress = _calculate_overall_progress(phases)

    # Determine current phase
    current_phase = _determine_current_phase(phases, today)

    # Generate this week's actions
    this_week = _generate_weekly_actions(
        award.get("name", "Unknown Award"),
        phases,
        current_phase,
        priority,
        tier_classification.tier
    )

    # Calculate weekly hours
    weekly_hours = WEEKLY_HOURS_BY_TIER.get(tier_classification.tier, 2)

    # Generate strategic notes
    strategic_rationale = _generate_strategic_rationale(
        tier_classification.tier,
        risk_classification.risk_bucket,
        weeks_remaining,
        recommended_weeks
    )

    risk_factors = _identify_risk_factors(
        tier_classification.tier,
        weeks_remaining,
        recommended_weeks,
        overall_progress
    )

    success_indicators = _generate_success_indicators(tier_classification.tier)

    # Assess health
    health = _assess_campaign_health(
        weeks_remaining,
        recommended_weeks,
        overall_progress,
        current_phase
    )

    return CampaignPlan(
        award_name=award.get("name", "Unknown Award"),
        award_id=award.get("id", ""),
        award_tier=tier_classification.tier,
        risk_bucket=risk_classification.risk_bucket,
        campaign_id=f"camp_{award.get('id', '')}_{start.strftime('%Y%m%d')}",
        priority=priority,
        health=health,
        start_date=start.strftime("%Y-%m-%d"),
        deadline=deadline.strftime("%Y-%m-%d"),
        weeks_remaining=weeks_remaining,
        total_weeks=total_weeks,
        current_phase=current_phase,
        overall_progress_pct=overall_progress,
        phases=phases,
        this_week_actions=this_week,
        weekly_hours_allocated=weekly_hours,
        strategic_rationale=strategic_rationale,
        risk_factors=risk_factors,
        success_indicators=success_indicators
    )


def _determine_campaign_priority(tier: AwardTier,
                                   weeks_remaining: int,
                                   risk_bucket: RiskBucket) -> CampaignPriority:
    """Determine campaign priority based on tier and timeline."""
    # T1 with tight deadline = critical
    if tier == AwardTier.T1_NATIONAL and weeks_remaining < 12:
        return CampaignPriority.CRITICAL

    # T1/T2 with adequate time = high
    if tier in [AwardTier.T1_NATIONAL, AwardTier.T2_REGIONAL]:
        return CampaignPriority.HIGH

    # T3 = medium
    if tier == AwardTier.T3_LOCAL:
        return CampaignPriority.MEDIUM

    # T4 = low
    return CampaignPriority.LOW


def _generate_campaign_phases(tier: AwardTier,
                               start: datetime,
                               deadline: datetime,
                               total_weeks: int) -> List[PhaseProgress]:
    """Generate phase timeline with milestones."""
    phases = []
    current_date = start

    # Skip waiting phase for calculation
    active_phases = [p for p in CampaignPhase if p not in [CampaignPhase.WAITING, CampaignPhase.RESULT]]

    for phase in active_phases:
        pct = PHASE_DURATION_PCT.get(phase, 10) / 100
        phase_weeks = max(1, int(total_weeks * pct))
        phase_end = current_date + timedelta(weeks=phase_weeks)

        # Get milestones for this phase
        milestone_names = PHASE_MILESTONES.get(phase, [])
        milestones = []

        for i, name in enumerate(milestone_names):
            milestone_date = current_date + timedelta(days=(phase_weeks * 7) // (len(milestone_names) + 1) * (i + 1))
            milestones.append(Milestone(
                name=name,
                phase=phase,
                status=MilestoneStatus.NOT_STARTED,
                target_date=milestone_date.strftime("%Y-%m-%d")
            ))

        phases.append(PhaseProgress(
            phase=phase,
            status=MilestoneStatus.NOT_STARTED,
            start_date=current_date.strftime("%Y-%m-%d"),
            target_end_date=phase_end.strftime("%Y-%m-%d"),
            milestones=milestones,
            completion_pct=0.0
        ))

        current_date = phase_end

    return phases


def _calculate_overall_progress(phases: List[PhaseProgress]) -> float:
    """Calculate overall campaign progress percentage."""
    if not phases:
        return 0.0

    total_milestones = sum(len(p.milestones) for p in phases)
    if total_milestones == 0:
        return 0.0

    completed = sum(
        1 for p in phases for m in p.milestones
        if m.status == MilestoneStatus.COMPLETED
    )

    return round(completed / total_milestones * 100, 1)


def _determine_current_phase(phases: List[PhaseProgress],
                              today: datetime) -> CampaignPhase:
    """Determine which phase we should be in based on date."""
    for phase in phases:
        if phase.target_end_date:
            end = datetime.strptime(phase.target_end_date, "%Y-%m-%d")
            if today < end:
                return phase.phase

    # Default to last phase before submission
    return CampaignPhase.SUBMISSION


def _generate_weekly_actions(award_name: str,
                              phases: List[PhaseProgress],
                              current_phase: CampaignPhase,
                              priority: CampaignPriority,
                              tier: AwardTier) -> List[WeeklyAction]:
    """Generate specific actions for this week."""
    actions = []
    hours_per_action = WEEKLY_HOURS_BY_TIER.get(tier, 2) / 2

    # Find current phase and its incomplete milestones
    for phase in phases:
        if phase.phase == current_phase:
            for milestone in phase.milestones:
                if milestone.status == MilestoneStatus.NOT_STARTED:
                    actions.append(WeeklyAction(
                        action=milestone.name,
                        priority=priority,
                        estimated_hours=hours_per_action,
                        campaign_name=award_name,
                        milestone_ref=milestone.name,
                        rationale=f"Current phase: {current_phase.value}"
                    ))
                    # Limit to 2 actions per campaign per week
                    if len(actions) >= 2:
                        break
            break

    return actions


def _generate_strategic_rationale(tier: AwardTier,
                                    risk_bucket: RiskBucket,
                                    weeks_remaining: int,
                                    recommended_weeks: int) -> str:
    """Generate strategic rationale for this campaign."""
    parts = []

    if tier == AwardTier.T1_NATIONAL:
        parts.append(f"T1 national award - potential +25% Ivy impact")
        parts.append(f"Recommended {recommended_weeks} weeks; {weeks_remaining} remaining")
    elif tier == AwardTier.T2_REGIONAL:
        parts.append(f"T2 regional award - +10% Ivy impact")
    else:
        parts.append(f"{tier.value} award - credential building")

    if risk_bucket == RiskBucket.LONG_SHOT:
        parts.append("Long-shot risk bucket - high reward if successful")
    elif risk_bucket == RiskBucket.HIGH_PROBABILITY:
        parts.append("High-probability - confidence builder")

    return "; ".join(parts)


def _identify_risk_factors(tier: AwardTier,
                            weeks_remaining: int,
                            recommended_weeks: int,
                            progress: float) -> List[str]:
    """Identify risk factors for this campaign."""
    risks = []

    # Timeline risk
    if weeks_remaining < recommended_weeks * 0.5:
        risks.append(f"Timeline compressed: {weeks_remaining} weeks vs {recommended_weeks} recommended")

    # Progress risk
    expected_progress = max(0, 100 - (weeks_remaining / max(1, recommended_weeks) * 100))
    if progress < expected_progress - 20:
        risks.append(f"Behind schedule: {progress:.0f}% vs {expected_progress:.0f}% expected")

    # Tier-specific risks
    if tier == AwardTier.T1_NATIONAL:
        risks.append("T1 awards require significant underlying work - not just application polish")

    return risks


def _generate_success_indicators(tier: AwardTier) -> List[str]:
    """Generate success indicators for campaign tracking."""
    base_indicators = [
        "All milestones completed on schedule",
        "Application submitted before deadline",
        "Recommendation letters secured",
    ]

    if tier in [AwardTier.T1_NATIONAL, AwardTier.T2_REGIONAL]:
        base_indicators.extend([
            "Underlying project/work demonstrates measurable impact",
            "Narrative connects to unique positioning",
            "External validation obtained (published, deployed, covered)",
        ])

    return base_indicators


def _assess_campaign_health(weeks_remaining: int,
                             recommended_weeks: int,
                             progress: float,
                             current_phase: CampaignPhase) -> CampaignHealth:
    """Assess overall campaign health."""
    # Critical: Very little time and low progress
    if weeks_remaining < 4 and progress < 50:
        return CampaignHealth.CRITICAL

    # At risk: Behind schedule
    expected_progress = max(0, 100 - (weeks_remaining / max(1, recommended_weeks) * 100))
    if progress < expected_progress - 30:
        return CampaignHealth.AT_RISK

    # On track
    return CampaignHealth.ON_TRACK


# =============================================================================
# DASHBOARD FUNCTIONS
# =============================================================================

def create_campaign_dashboard(campaigns: List[CampaignPlan]) -> CampaignDashboard:
    """
    Create dashboard view of all active campaigns.

    Args:
        campaigns: List of CampaignPlan objects

    Returns:
        CampaignDashboard for Execution Agent
    """
    if not campaigns:
        return CampaignDashboard(
            recommendations=["No active campaigns - consider starting award pursuit"]
        )

    # Count by tier
    t1_count = sum(1 for c in campaigns if c.award_tier == AwardTier.T1_NATIONAL)
    t2_count = sum(1 for c in campaigns if c.award_tier == AwardTier.T2_REGIONAL)

    # Count by health
    on_track = sum(1 for c in campaigns if c.health == CampaignHealth.ON_TRACK)
    at_risk = sum(1 for c in campaigns if c.health == CampaignHealth.AT_RISK)
    critical = sum(1 for c in campaigns if c.health == CampaignHealth.CRITICAL)

    # Total weekly hours
    total_hours = sum(c.weekly_hours_allocated for c in campaigns)

    # Collect all weekly actions, sorted by priority
    all_actions = []
    for camp in campaigns:
        all_actions.extend(camp.this_week_actions)

    priority_order = {
        CampaignPriority.CRITICAL: 0,
        CampaignPriority.HIGH: 1,
        CampaignPriority.MEDIUM: 2,
        CampaignPriority.LOW: 3,
    }
    all_actions.sort(key=lambda a: priority_order.get(a.priority, 3))

    # Get upcoming deadlines
    today = datetime.now()
    this_month_end = today.replace(day=28) + timedelta(days=4)
    this_month_end = this_month_end.replace(day=1)
    next_month_end = this_month_end + timedelta(days=32)
    next_month_end = next_month_end.replace(day=1)

    deadlines_this_month = []
    deadlines_next_month = []

    for camp in campaigns:
        deadline = datetime.strptime(camp.deadline, "%Y-%m-%d")
        deadline_info = {"name": camp.award_name, "date": camp.deadline, "tier": camp.award_tier.value}

        if deadline < this_month_end:
            deadlines_this_month.append(deadline_info)
        elif deadline < next_month_end:
            deadlines_next_month.append(deadline_info)

    # Generate recommendations
    recommendations = _generate_dashboard_recommendations(
        campaigns, t1_count, t2_count, critical, at_risk, total_hours
    )

    return CampaignDashboard(
        active_campaigns=campaigns,
        total_active=len(campaigns),
        t1_campaigns=t1_count,
        t2_campaigns=t2_count,
        total_weekly_hours=total_hours,
        on_track_count=on_track,
        at_risk_count=at_risk,
        critical_count=critical,
        this_week_priorities=all_actions[:10],  # Top 10 actions
        deadlines_this_month=deadlines_this_month,
        deadlines_next_month=deadlines_next_month,
        recommendations=recommendations
    )


def _generate_dashboard_recommendations(campaigns: List[CampaignPlan],
                                          t1_count: int,
                                          t2_count: int,
                                          critical: int,
                                          at_risk: int,
                                          total_hours: float) -> List[str]:
    """Generate dashboard-level recommendations."""
    recs = []

    # Critical campaigns need attention
    if critical > 0:
        recs.append(f"🚨 {critical} campaign(s) in CRITICAL status - immediate action required")

    # At-risk campaigns
    if at_risk > 0:
        recs.append(f"⚠️ {at_risk} campaign(s) at risk - review timeline and priorities")

    # Portfolio balance
    if t1_count == 0:
        recs.append("📊 No T1 campaigns active - consider starting a national award pursuit")

    if t1_count > 0 and t2_count < 2:
        recs.append("📊 Add T2 regional awards for portfolio balance")

    # Time management
    if total_hours > 15:
        recs.append(f"⏰ {total_hours:.0f}h/week allocated - may be unsustainable, consider priorities")
    elif total_hours < 5 and len(campaigns) > 0:
        recs.append(f"⏰ Only {total_hours:.0f}h/week allocated - increase to maintain momentum")

    # General guidance
    if len(recs) == 0:
        recs.append("✅ Campaigns on track - maintain weekly progress on milestones")

    return recs


# =============================================================================
# WEEKLY EXECUTION FUNCTIONS
# =============================================================================

def get_weekly_focus(campaigns: List[CampaignPlan],
                     available_hours: int = 10) -> List[WeeklyAction]:
    """
    Get prioritized weekly focus actions across all campaigns.

    Used by Execution Agent for weekly coaching sessions.

    Args:
        campaigns: List of active campaigns
        available_hours: Hours student has available this week

    Returns:
        List of prioritized WeeklyActions fitting within available hours
    """
    # Collect all actions
    all_actions = []
    for camp in campaigns:
        all_actions.extend(camp.this_week_actions)

    # Sort by priority
    priority_order = {
        CampaignPriority.CRITICAL: 0,
        CampaignPriority.HIGH: 1,
        CampaignPriority.MEDIUM: 2,
        CampaignPriority.LOW: 3,
    }
    all_actions.sort(key=lambda a: priority_order.get(a.priority, 3))

    # Select actions that fit in available hours
    selected = []
    hours_used = 0.0

    for action in all_actions:
        if hours_used + action.estimated_hours <= available_hours:
            selected.append(action)
            hours_used += action.estimated_hours

    return selected


def update_campaign_progress(campaign: CampaignPlan,
                              completed_milestones: List[str]) -> CampaignPlan:
    """
    Update campaign progress after weekly session.

    Args:
        campaign: CampaignPlan to update
        completed_milestones: List of milestone names completed

    Returns:
        Updated CampaignPlan
    """
    # Update milestone statuses
    for phase in campaign.phases:
        for milestone in phase.milestones:
            if milestone.name in completed_milestones:
                milestone.status = MilestoneStatus.COMPLETED
                milestone.completed_date = datetime.now().strftime("%Y-%m-%d")

        # Update phase completion percentage
        total = len(phase.milestones)
        completed = sum(1 for m in phase.milestones if m.status == MilestoneStatus.COMPLETED)
        phase.completion_pct = (completed / total * 100) if total > 0 else 0

        # Update phase status
        if phase.completion_pct >= 100:
            phase.status = MilestoneStatus.COMPLETED
            phase.actual_end_date = datetime.now().strftime("%Y-%m-%d")
        elif phase.completion_pct > 0:
            phase.status = MilestoneStatus.IN_PROGRESS

    # Recalculate overall progress
    campaign.overall_progress_pct = _calculate_overall_progress(campaign.phases)

    # Reassess health
    recommended_weeks = CAMPAIGN_DURATION_WEEKS.get(campaign.award_tier, 12)
    campaign.health = _assess_campaign_health(
        campaign.weeks_remaining,
        recommended_weeks,
        campaign.overall_progress_pct,
        campaign.current_phase
    )

    # Regenerate this week's actions
    campaign.this_week_actions = _generate_weekly_actions(
        campaign.award_name,
        campaign.phases,
        campaign.current_phase,
        campaign.priority,
        campaign.award_tier
    )

    return campaign


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_campaign_plan(campaign: CampaignPlan) -> str:
    """Format campaign plan as readable summary."""
    lines = [
        "=" * 60,
        f"CAMPAIGN: {campaign.award_name}",
        "=" * 60,
        "",
        f"Tier: {campaign.award_tier.value} | Risk: {campaign.risk_bucket.value}",
        f"Priority: {campaign.priority.value.upper()} | Health: {campaign.health.value.upper()}",
        f"Deadline: {campaign.deadline} ({campaign.weeks_remaining} weeks remaining)",
        f"Progress: {campaign.overall_progress_pct:.0f}%",
        "",
        "--- PHASES ---",
    ]

    for phase in campaign.phases:
        status_icon = "✓" if phase.status == MilestoneStatus.COMPLETED else "○"
        lines.append(f"  {status_icon} {phase.phase.value}: {phase.completion_pct:.0f}%")

    if campaign.this_week_actions:
        lines.extend(["", "--- THIS WEEK ---"])
        for action in campaign.this_week_actions:
            lines.append(f"  • {action.action} ({action.estimated_hours:.1f}h)")

    if campaign.risk_factors:
        lines.extend(["", "--- RISKS ---"])
        for risk in campaign.risk_factors:
            lines.append(f"  ⚠️ {risk}")

    lines.extend(["", f"Strategy: {campaign.strategic_rationale}"])
    lines.append("=" * 60)

    return "\n".join(lines)


def format_dashboard(dashboard: CampaignDashboard) -> str:
    """Format dashboard as readable summary."""
    lines = [
        "=" * 60,
        "AWARD CAMPAIGNS DASHBOARD",
        "=" * 60,
        "",
        f"Active Campaigns: {dashboard.total_active}",
        f"  T1 National: {dashboard.t1_campaigns}",
        f"  T2 Regional: {dashboard.t2_campaigns}",
        f"Weekly Hours: {dashboard.total_weekly_hours:.0f}h",
        "",
        f"Health: {dashboard.on_track_count} on-track, "
        f"{dashboard.at_risk_count} at-risk, "
        f"{dashboard.critical_count} critical",
        "",
    ]

    if dashboard.this_week_priorities:
        lines.append("--- THIS WEEK'S PRIORITIES ---")
        for i, action in enumerate(dashboard.this_week_priorities[:5], 1):
            lines.append(
                f"  {i}. [{action.priority.value}] {action.action} "
                f"({action.campaign_name}, {action.estimated_hours:.1f}h)"
            )

    if dashboard.deadlines_this_month:
        lines.extend(["", "--- DEADLINES THIS MONTH ---"])
        for d in dashboard.deadlines_this_month:
            lines.append(f"  • {d['name']} ({d['tier']}) - {d['date']}")

    if dashboard.recommendations:
        lines.extend(["", "--- RECOMMENDATIONS ---"])
        for rec in dashboard.recommendations:
            lines.append(f"  {rec}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_campaign_summary(campaign: CampaignPlan) -> str:
    """Get concise one-line summary of campaign."""
    return (
        f"{campaign.award_name} ({campaign.award_tier.value}): "
        f"{campaign.overall_progress_pct:.0f}% complete, "
        f"{campaign.weeks_remaining} weeks to deadline, "
        f"Health: {campaign.health.value}"
    )
