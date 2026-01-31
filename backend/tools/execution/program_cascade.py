# IvyLevel Program-Competition Cascade v1.0
# LAYER: Execution (TYPE-031)
"""
Program-Competition Cascade Intelligence - Artifact Reuse Multiplication.

Implements TYPE-031: Strategic cascading of single artifacts (projects,
research, portfolios) to multiple programs and competitions for 3-5X ROI.

Framework: Artifact Reuse Cascade
- Single research project → Submit to RSI, ISEF, Regeneron, Google Science Fair
- Single CS project → Submit to hackathons, Congressional App Challenge, competitions
- Single essay/analysis → Submit to writing contests, program applications

Core Algorithm:
1. Detect "anchor artifacts" (research projects, major works, portfolios)
2. Map artifact → eligible programs/competitions with alignment scoring
3. Calculate ROI multiplier (1 artifact → N opportunities)
4. Prioritize by target school alignment + deadline feasibility
5. Generate cascade submission timeline

Key Insight: Investment in ONE high-quality artifact can unlock 5-10 opportunities.
Time spent on quality >>> time spent on quantity of mediocre submissions.

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - pattern-based matching
- Used during weekly execution sessions
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timedelta


# =============================================================================
# ENUMS
# =============================================================================

class ArtifactType(str, Enum):
    """Type of cascadable artifact."""
    RESEARCH_PROJECT = "research_project"       # Lab/independent research
    CS_PROJECT = "cs_project"                   # Software/app/website
    CREATIVE_PORTFOLIO = "creative_portfolio"   # Art/writing/film portfolio
    ESSAY_ANALYSIS = "essay_analysis"           # Essay or academic analysis
    COMPETITION_WORK = "competition_work"       # Work created for a competition
    BUSINESS_PLAN = "business_plan"             # Startup/entrepreneurship


class OpportunityType(str, Enum):
    """Type of cascade opportunity."""
    SUMMER_PROGRAM = "summer_program"
    COMPETITION = "competition"
    AWARD = "award"
    RESEARCH_PROGRAM = "research_program"
    SCHOLARSHIP = "scholarship"


class PrestigeTier(str, Enum):
    """Prestige tier for cascade opportunities."""
    NATIONAL = "national"       # National-level recognition
    REGIONAL = "regional"       # Regional/state level
    STATE = "state"             # State level
    LOCAL = "local"             # Local/school level


class CascadeStatus(str, Enum):
    """Status of a cascade opportunity."""
    IDENTIFIED = "identified"   # Opportunity identified
    PREPARING = "preparing"     # Adapting artifact
    SUBMITTED = "submitted"     # Submitted
    RESULT = "result"           # Result received


# =============================================================================
# CONSTANTS
# =============================================================================

# Known cascade patterns: artifact type → eligible opportunities
CASCADE_PATTERNS = {
    ArtifactType.RESEARCH_PROJECT: [
        {"name": "RSI (Research Science Institute)", "tier": "national", "type": "summer_program"},
        {"name": "Regeneron STS", "tier": "national", "type": "competition"},
        {"name": "ISEF (International Science Fair)", "tier": "national", "type": "competition"},
        {"name": "Google Science Fair", "tier": "national", "type": "competition"},
        {"name": "Junior Science & Humanities", "tier": "regional", "type": "competition"},
        {"name": "Davidson Fellows", "tier": "national", "type": "award"},
        {"name": "State Science Fair", "tier": "state", "type": "competition"},
        {"name": "Siemens Competition", "tier": "national", "type": "competition"},
        {"name": "Research program applications", "tier": "regional", "type": "research_program"},
    ],
    ArtifactType.CS_PROJECT: [
        {"name": "Congressional App Challenge", "tier": "national", "type": "competition"},
        {"name": "Technovation", "tier": "national", "type": "competition"},
        {"name": "NCWIT Aspirations", "tier": "national", "type": "award"},
        {"name": "HackMIT / PennApps", "tier": "national", "type": "competition"},
        {"name": "NASA App Development", "tier": "national", "type": "competition"},
        {"name": "Code for America", "tier": "national", "type": "competition"},
        {"name": "CS Summer Programs (MIT Launch)", "tier": "national", "type": "summer_program"},
        {"name": "Google Code-in", "tier": "national", "type": "competition"},
    ],
    ArtifactType.CREATIVE_PORTFOLIO: [
        {"name": "Scholastic Art & Writing", "tier": "national", "type": "competition"},
        {"name": "YoungArts", "tier": "national", "type": "competition"},
        {"name": "National Student Poets", "tier": "national", "type": "award"},
        {"name": "Portfolio-based programs (RISD, MICA)", "tier": "national", "type": "summer_program"},
        {"name": "Regional art competitions", "tier": "regional", "type": "competition"},
        {"name": "Creative writing magazines", "tier": "regional", "type": "competition"},
    ],
    ArtifactType.ESSAY_ANALYSIS: [
        {"name": "Scholastic Writing Awards", "tier": "national", "type": "competition"},
        {"name": "John Locke Essay Competition", "tier": "national", "type": "competition"},
        {"name": "Profile in Courage Essay", "tier": "national", "type": "competition"},
        {"name": "NY Times contests", "tier": "national", "type": "competition"},
        {"name": "Essay-based scholarships", "tier": "regional", "type": "scholarship"},
        {"name": "Concord Review", "tier": "national", "type": "competition"},
    ],
    ArtifactType.BUSINESS_PLAN: [
        {"name": "LaunchX (MIT)", "tier": "national", "type": "summer_program"},
        {"name": "Wharton LBW", "tier": "national", "type": "summer_program"},
        {"name": "Diamond Challenge", "tier": "national", "type": "competition"},
        {"name": "DECA", "tier": "national", "type": "competition"},
        {"name": "Business plan competitions", "tier": "regional", "type": "competition"},
    ],
}

# ROI weights for opportunity prioritization
ROI_WEIGHTS = {
    "prestige": {
        PrestigeTier.NATIONAL: 10,
        PrestigeTier.REGIONAL: 5,
        PrestigeTier.STATE: 3,
        PrestigeTier.LOCAL: 1,
    },
    "alignment_boost": 2.0,
    "effort_threshold": 10,  # Hours below this = high ROI
}

# Effort estimates by opportunity type (hours to adapt/submit)
ADAPTATION_EFFORT = {
    OpportunityType.SUMMER_PROGRAM: 8,
    OpportunityType.COMPETITION: 5,
    OpportunityType.AWARD: 4,
    OpportunityType.RESEARCH_PROGRAM: 6,
    OpportunityType.SCHOLARSHIP: 5,
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class AnchorArtifact(BaseModel):
    """A reusable work/project that can cascade to multiple opportunities."""
    artifact_id: str = ""
    artifact_type: ArtifactType
    title: str
    description: str = ""
    domain: str = ""  # STEM, CS, Arts, Humanities
    completion_status: str = "in_progress"  # planned, in_progress, completed
    quality_score: float = Field(ge=0.0, le=10.0, default=7.0)
    time_invested_hours: float = 0.0
    materials_available: List[str] = Field(default_factory=list)  # code, paper, demo, etc.


class CascadeOpportunity(BaseModel):
    """A program/competition that accepts the artifact."""
    opportunity_id: str = ""
    opportunity_type: OpportunityType
    name: str
    deadline: Optional[str] = None
    eligibility_score: float = Field(ge=0.0, le=1.0, default=0.8)
    target_school_alignment: float = Field(ge=0.0, le=1.0, default=0.7)
    effort_required_hours: float = 5.0
    roi_multiplier: float = 0.0
    application_requirements: List[str] = Field(default_factory=list)
    prestige_tier: PrestigeTier = PrestigeTier.REGIONAL
    status: CascadeStatus = CascadeStatus.IDENTIFIED


class CascadeStrategy(BaseModel):
    """Recommended submission sequence for an artifact."""
    anchor_artifact: AnchorArtifact
    total_opportunities: int = 0
    high_roi_opportunities: List[CascadeOpportunity] = Field(default_factory=list)
    medium_roi_opportunities: List[CascadeOpportunity] = Field(default_factory=list)
    submission_timeline: List[Dict[str, Any]] = Field(default_factory=list)
    effort_multiplier: float = 0.0  # Total benefit / initial time invested
    recommendations: List[str] = Field(default_factory=list)


class QuickWin(BaseModel):
    """A high-ROI, near-deadline opportunity."""
    artifact_title: str
    opportunity_name: str
    deadline: str
    roi: float
    rationale: str


class CascadeOutput(BaseModel):
    """
    Complete cascade intelligence output.
    Consumed by Execution Agent for weekly session planning.
    """
    # Detected artifacts
    anchor_artifacts: List[AnchorArtifact] = Field(default_factory=list)

    # Cascade strategies per artifact
    cascade_strategies: List[CascadeStrategy] = Field(default_factory=list)

    # Quick wins (high ROI + near deadline)
    quick_wins: List[QuickWin] = Field(default_factory=list)

    # Summary metrics
    total_artifacts: int = 0
    total_opportunities: int = 0
    overall_multiplier: float = 0.0  # Total opps / total artifacts

    # Actions
    next_actions: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# ARTIFACT DETECTION FUNCTIONS
# =============================================================================

def detect_anchor_artifacts(activities: List[Dict[str, Any]],
                              projects: List[Dict[str, Any]] = None) -> List[AnchorArtifact]:
    """
    Detect anchor artifacts from student activities and projects.

    Looks for:
    - Research projects
    - Software/app projects
    - Creative portfolios
    - Major essays/analyses

    Args:
        activities: List of activity dicts from profile
        projects: Optional list of project dicts

    Returns:
        List of detected AnchorArtifact objects
    """
    artifacts = []
    all_items = activities + (projects or [])

    for item in all_items:
        if _is_anchor_artifact(item):
            artifact = _create_artifact_from_item(item)
            artifacts.append(artifact)

    return artifacts


def _is_anchor_artifact(item: Dict[str, Any]) -> bool:
    """Check if an activity/project qualifies as an anchor artifact."""
    title = str(item.get("title", item.get("name", ""))).lower()
    description = str(item.get("description", "")).lower()
    combined = f"{title} {description}"

    # Keywords indicating substantial reusable work
    anchor_keywords = [
        "research", "project", "developed", "built", "created", "designed",
        "app", "website", "portfolio", "paper", "study", "analysis",
        "competition", "hackathon", "science fair", "presented", "published",
        "launched", "founded", "startup", "experiment",
    ]

    has_keyword = any(kw in combined for kw in anchor_keywords)

    # Must have significant time investment
    hours = item.get("hours_per_week", 0)
    weeks = item.get("weeks_involved", item.get("duration", 12))
    if isinstance(weeks, str):
        import re
        nums = re.findall(r'\d+', weeks)
        weeks = int(nums[0]) if nums else 12

    significant_time = (hours * weeks) >= 40  # At least 40 total hours

    return has_keyword and significant_time


def _create_artifact_from_item(item: Dict[str, Any]) -> AnchorArtifact:
    """Create AnchorArtifact from activity/project data."""
    title = item.get("title", item.get("name", "Unnamed Project"))

    # Classify artifact type
    artifact_type = _classify_artifact_type(item)

    # Extract time investment
    hours = item.get("hours_per_week", 3)
    weeks = item.get("weeks_involved", 12)
    if isinstance(weeks, str):
        import re
        nums = re.findall(r'\d+', weeks)
        weeks = int(nums[0]) if nums else 12
    total_hours = hours * weeks

    # Determine domain
    domain = _infer_domain(item)

    # Quality score (estimate)
    quality = item.get("impact_score", item.get("quality", 7))

    # Materials available
    materials = item.get("materials", [])
    if not materials:
        # Infer from description
        desc = str(item.get("description", "")).lower()
        if "code" in desc or "github" in desc:
            materials.append("code")
        if "paper" in desc or "published" in desc:
            materials.append("paper")
        if "demo" in desc or "presentation" in desc:
            materials.append("demo")

    return AnchorArtifact(
        artifact_id=f"artifact_{hash(title) % 10000}",
        artifact_type=artifact_type,
        title=title,
        description=item.get("description", ""),
        domain=domain,
        completion_status=item.get("status", "in_progress"),
        quality_score=min(10.0, quality),
        time_invested_hours=total_hours,
        materials_available=materials
    )


def _classify_artifact_type(item: Dict[str, Any]) -> ArtifactType:
    """Classify artifact into type category."""
    title = str(item.get("title", "")).lower()
    description = str(item.get("description", "")).lower()
    combined = f"{title} {description}"

    if any(kw in combined for kw in ["research", "study", "experiment", "lab", "investigation"]):
        return ArtifactType.RESEARCH_PROJECT
    elif any(kw in combined for kw in ["app", "software", "code", "program", "website", "algorithm"]):
        return ArtifactType.CS_PROJECT
    elif any(kw in combined for kw in ["portfolio", "art", "design", "film", "music", "creative"]):
        return ArtifactType.CREATIVE_PORTFOLIO
    elif any(kw in combined for kw in ["essay", "writing", "article", "analysis"]):
        return ArtifactType.ESSAY_ANALYSIS
    elif any(kw in combined for kw in ["startup", "business", "entrepreneur", "company"]):
        return ArtifactType.BUSINESS_PLAN
    else:
        return ArtifactType.COMPETITION_WORK


def _infer_domain(item: Dict[str, Any]) -> str:
    """Infer domain from item content."""
    combined = str(item).lower()

    if any(kw in combined for kw in ["science", "biology", "chemistry", "physics", "math"]):
        return "STEM"
    elif any(kw in combined for kw in ["computer", "code", "software", "ai", "tech"]):
        return "CS"
    elif any(kw in combined for kw in ["art", "design", "creative", "film", "music"]):
        return "Arts"
    elif any(kw in combined for kw in ["writing", "history", "philosophy", "literature"]):
        return "Humanities"
    else:
        return "General"


# =============================================================================
# CASCADE MAPPING FUNCTIONS
# =============================================================================

def map_artifact_to_opportunities(artifact: AnchorArtifact,
                                    target_schools: List[str] = None) -> List[CascadeOpportunity]:
    """
    Map an anchor artifact to eligible opportunities.

    Args:
        artifact: The artifact to cascade
        target_schools: Student's target schools (for alignment scoring)

    Returns:
        List of CascadeOpportunity objects
    """
    opportunities = []

    # Get cascade patterns for this artifact type
    patterns = CASCADE_PATTERNS.get(artifact.artifact_type, [])

    for pattern in patterns:
        # Create opportunity
        opp_type = OpportunityType(pattern.get("type", "competition"))
        prestige = PrestigeTier(pattern.get("tier", "regional"))

        # Calculate eligibility score based on artifact quality
        eligibility = min(1.0, artifact.quality_score / 10)

        # Calculate target school alignment (simplified)
        alignment = 0.7  # Default
        if target_schools and prestige == PrestigeTier.NATIONAL:
            # National awards align well with top schools
            alignment = 0.9

        # Estimate effort required
        effort = ADAPTATION_EFFORT.get(opp_type, 5)

        # Calculate ROI multiplier
        prestige_score = ROI_WEIGHTS["prestige"].get(prestige, 1)
        roi = (prestige_score * eligibility * alignment) / max(effort, 1)

        # Estimate deadline (simplified - in production, query database)
        deadline = _estimate_deadline(pattern["name"])

        opportunities.append(CascadeOpportunity(
            opportunity_id=f"opp_{hash(pattern['name']) % 10000}",
            opportunity_type=opp_type,
            name=pattern["name"],
            deadline=deadline,
            eligibility_score=eligibility,
            target_school_alignment=alignment,
            effort_required_hours=effort,
            roi_multiplier=round(roi, 2),
            prestige_tier=prestige,
            application_requirements=_get_requirements(opp_type),
            status=CascadeStatus.IDENTIFIED
        ))

    # Sort by ROI
    opportunities.sort(key=lambda x: x.roi_multiplier, reverse=True)

    return opportunities


def _estimate_deadline(name: str) -> str:
    """Estimate deadline for an opportunity (simplified)."""
    # In production, query database for actual deadlines
    now = datetime.now()

    # Most competitions have fall/winter deadlines
    future = now + timedelta(days=90)
    return future.strftime("%Y-%m-%d")


def _get_requirements(opp_type: OpportunityType) -> List[str]:
    """Get typical requirements for opportunity type."""
    requirements = {
        OpportunityType.SUMMER_PROGRAM: ["Application essay", "Transcript", "Recommendation letters"],
        OpportunityType.COMPETITION: ["Project submission", "Abstract/summary", "Documentation"],
        OpportunityType.AWARD: ["Application form", "Essay", "Supporting materials"],
        OpportunityType.RESEARCH_PROGRAM: ["Research proposal", "CV/resume", "Recommendation"],
        OpportunityType.SCHOLARSHIP: ["Essay", "Transcript", "Financial info"],
    }
    return requirements.get(opp_type, ["Application materials"])


# =============================================================================
# CASCADE STRATEGY FUNCTIONS
# =============================================================================

def generate_cascade_strategy(artifact: AnchorArtifact,
                                target_schools: List[str] = None) -> CascadeStrategy:
    """
    Generate complete cascade strategy for an artifact.

    Args:
        artifact: The anchor artifact
        target_schools: Student's target schools

    Returns:
        CascadeStrategy with prioritized opportunities
    """
    # Map to opportunities
    opportunities = map_artifact_to_opportunities(artifact, target_schools)

    # Separate by ROI tier
    high_roi = [o for o in opportunities if o.roi_multiplier >= 1.5]
    medium_roi = [o for o in opportunities if 0.5 <= o.roi_multiplier < 1.5]

    # Generate submission timeline
    timeline = _generate_submission_timeline(high_roi + medium_roi)

    # Calculate effort multiplier
    total_benefit = sum(o.roi_multiplier * 10 for o in opportunities)
    effort_multiplier = total_benefit / max(artifact.time_invested_hours, 1)

    # Generate recommendations
    recommendations = _generate_cascade_recommendations(artifact, high_roi, medium_roi)

    return CascadeStrategy(
        anchor_artifact=artifact,
        total_opportunities=len(opportunities),
        high_roi_opportunities=high_roi,
        medium_roi_opportunities=medium_roi,
        submission_timeline=timeline,
        effort_multiplier=round(effort_multiplier, 2),
        recommendations=recommendations
    )


def _generate_submission_timeline(opportunities: List[CascadeOpportunity]) -> List[Dict]:
    """Generate week-by-week submission timeline."""
    timeline = []
    current_week = 1

    # Sort by deadline
    sorted_opps = sorted(opportunities, key=lambda x: x.deadline or "9999")

    for opp in sorted_opps[:8]:  # Top 8 opportunities
        timeline.append({
            "week": current_week,
            "opportunity": opp.name,
            "deadline": opp.deadline,
            "effort_hours": opp.effort_required_hours,
            "prep_tasks": opp.application_requirements[:2],  # Top 2 tasks
        })
        current_week += max(1, int(opp.effort_required_hours / 5))  # ~5 hours/week pace

    return timeline


def _generate_cascade_recommendations(artifact: AnchorArtifact,
                                         high_roi: List[CascadeOpportunity],
                                         medium_roi: List[CascadeOpportunity]) -> List[str]:
    """Generate recommendations for cascade strategy."""
    recs = []

    if high_roi:
        recs.append(
            f"🎯 HIGH PRIORITY: Submit '{artifact.title}' to {len(high_roi)} high-ROI opportunities"
        )
        top_3 = [o.name for o in high_roi[:3]]
        recs.append(f"   Start with: {', '.join(top_3)}")

    if artifact.completion_status != "completed":
        recs.append(
            f"⚡ URGENT: Complete '{artifact.title}' to unlock {len(high_roi) + len(medium_roi)} cascade opportunities"
        )

    if medium_roi:
        recs.append(
            f"📌 Secondary targets ({len(medium_roi)} opportunities): {', '.join([o.name for o in medium_roi[:2]])}"
        )

    return recs


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_cascade_opportunities(activities: List[Dict[str, Any]],
                                    projects: List[Dict[str, Any]] = None,
                                    target_schools: List[str] = None) -> CascadeOutput:
    """
    Complete cascade analysis for a student's artifacts.

    This is the main entry point that:
    1. Detects anchor artifacts
    2. Maps to eligible opportunities
    3. Generates cascade strategies
    4. Identifies quick wins
    5. Calculates overall multiplier

    Args:
        activities: Student activities
        projects: Optional explicit projects
        target_schools: Student's target schools

    Returns:
        CascadeOutput with complete analysis
    """
    # 1. Detect anchor artifacts
    artifacts = detect_anchor_artifacts(activities, projects)

    if not artifacts:
        return CascadeOutput(
            recommendations=[
                "No cascadable artifacts detected",
                "Consider developing a substantial project/research that can be submitted to multiple programs"
            ],
            next_actions=[
                "Start a research project in your area of interest",
                "Build a CS project that solves a real problem",
                "Create a creative portfolio showcasing your work"
            ]
        )

    # 2. Generate cascade strategies
    strategies = []
    total_opps = 0
    all_quick_wins = []

    for artifact in artifacts:
        strategy = generate_cascade_strategy(artifact, target_schools)
        strategies.append(strategy)
        total_opps += strategy.total_opportunities

        # Identify quick wins
        for opp in strategy.high_roi_opportunities:
            if _is_near_deadline(opp.deadline):
                all_quick_wins.append(QuickWin(
                    artifact_title=artifact.title,
                    opportunity_name=opp.name,
                    deadline=opp.deadline or "TBD",
                    roi=opp.roi_multiplier,
                    rationale=f"High ROI ({opp.roi_multiplier:.1f}X) + near deadline"
                ))

    # 3. Calculate overall multiplier
    overall_multiplier = total_opps / len(artifacts) if artifacts else 0

    # 4. Generate next actions
    next_actions = _generate_next_actions(strategies, all_quick_wins)

    # 5. Generate recommendations
    recommendations = _generate_overall_recommendations(artifacts, strategies, overall_multiplier)

    return CascadeOutput(
        anchor_artifacts=artifacts,
        cascade_strategies=strategies,
        quick_wins=all_quick_wins[:5],  # Top 5
        total_artifacts=len(artifacts),
        total_opportunities=total_opps,
        overall_multiplier=round(overall_multiplier, 1),
        next_actions=next_actions,
        recommendations=recommendations
    )


def _is_near_deadline(deadline: Optional[str]) -> bool:
    """Check if deadline is within 60 days."""
    if not deadline:
        return False

    try:
        deadline_date = datetime.strptime(deadline, "%Y-%m-%d")
        days_until = (deadline_date - datetime.now()).days
        return 0 < days_until <= 60
    except ValueError:
        return False


def _generate_next_actions(strategies: List[CascadeStrategy],
                             quick_wins: List[QuickWin]) -> List[str]:
    """Generate prioritized next actions."""
    actions = []

    # Quick wins first
    if quick_wins:
        win = quick_wins[0]
        actions.append(
            f"🚀 QUICK WIN: Submit '{win.artifact_title}' to {win.opportunity_name} "
            f"(deadline: {win.deadline}, ROI: {win.roi:.1f}X)"
        )

    # Incomplete artifacts
    incomplete = [s for s in strategies if s.anchor_artifact.completion_status != "completed"]
    if incomplete:
        actions.append(
            f"⚡ Complete {len(incomplete)} in-progress artifact(s) to unlock "
            f"{sum(s.total_opportunities for s in incomplete)} opportunities"
        )

    # Top strategy
    if strategies:
        top = max(strategies, key=lambda s: s.effort_multiplier)
        actions.append(
            f"🎯 Focus cascade: '{top.anchor_artifact.title}' → "
            f"{top.total_opportunities} opportunities ({top.effort_multiplier:.1f}X multiplier)"
        )

    return actions


def _generate_overall_recommendations(artifacts: List[AnchorArtifact],
                                         strategies: List[CascadeStrategy],
                                         multiplier: float) -> List[str]:
    """Generate overall cascade recommendations."""
    recs = []

    if multiplier >= 5:
        recs.append(f"🌟 Excellent cascade potential: {multiplier:.0f}X multiplier on invested time")
    elif multiplier >= 3:
        recs.append(f"✅ Good cascade potential: {multiplier:.0f}X multiplier")
    else:
        recs.append(f"📈 Cascade potential: {multiplier:.0f}X - consider developing more substantial artifacts")

    # Artifact type distribution
    types = [a.artifact_type.value for a in artifacts]
    recs.append(f"Artifact types: {', '.join(set(types))}")

    # Key insight
    recs.append("\n💡 Key Insight: One excellent artifact submitted to 5-10 opportunities >> 5 mediocre projects")

    return recs


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_cascade_output(output: CascadeOutput) -> str:
    """Format cascade output as readable summary."""
    lines = [
        "=" * 60,
        "PROGRAM-COMPETITION CASCADE ANALYSIS",
        "=" * 60,
        "",
        f"Anchor Artifacts Detected: {output.total_artifacts}",
        f"Total Cascade Opportunities: {output.total_opportunities}",
        f"Overall Multiplier: {output.overall_multiplier:.1f}X",
        "",
    ]

    if output.quick_wins:
        lines.append("--- 🚀 QUICK WINS ---")
        for qw in output.quick_wins[:3]:
            lines.append(f"  ★ {qw.artifact_title} → {qw.opportunity_name}")
            lines.append(f"    Deadline: {qw.deadline}, ROI: {qw.roi:.1f}X")
        lines.append("")

    if output.anchor_artifacts:
        lines.append("--- ANCHOR ARTIFACTS ---")
        for art in output.anchor_artifacts[:3]:
            lines.append(f"  ● {art.title} ({art.artifact_type.value})")
            lines.append(f"    Quality: {art.quality_score}/10, Hours invested: {art.time_invested_hours:.0f}")
        lines.append("")

    if output.cascade_strategies:
        lines.append("--- CASCADE STRATEGIES ---")
        for strat in output.cascade_strategies[:2]:
            lines.append(f"  📋 '{strat.anchor_artifact.title}' → {strat.total_opportunities} opportunities")
            lines.append(f"     High ROI: {len(strat.high_roi_opportunities)}, Multiplier: {strat.effort_multiplier:.1f}X")
        lines.append("")

    lines.append("--- NEXT ACTIONS ---")
    for action in output.next_actions[:4]:
        lines.append(f"  {action}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_cascade_summary(strategy: CascadeStrategy) -> str:
    """Get concise summary for single cascade strategy."""
    return (
        f"'{strategy.anchor_artifact.title}': "
        f"{strategy.total_opportunities} opportunities, "
        f"{len(strategy.high_roi_opportunities)} high-ROI, "
        f"{strategy.effort_multiplier:.1f}X multiplier"
    )
