# IvyLevel Execution Tools v1.0
# LAYER: Execution (Weekly Campaign Management)
"""
Execution tools for ongoing weekly coaching and campaign management.

These tools support the Execution Agent and are used throughout the
student journey (not just initial assessment/game plan).

Module Organization:
- award_campaigns.py: Multi-month award campaign orchestration (TYPE-022)
- content_matrix.py: Content recycling and touchpoint management (TYPE-025)
- program_cascade.py: Program-competition cascade intelligence (TYPE-031)

Key Difference from Scoring Layer:
- Scoring primitives are used once during Assessment/GamePlan phase
- Execution tools are used weekly throughout the student journey
- Campaign tracking, progress updates, content development cycles

Architecture:
- Consumes outputs from scoring layer (award_tiers, award_portfolio, program_selection)
- Produces actionable weekly plans for Execution Agent sessions
"""

from backend.tools.execution.award_campaigns import (
    # Enums
    CampaignPhase,
    MilestoneStatus,
    CampaignPriority,
    CampaignHealth,
    # Models
    Milestone,
    PhaseProgress,
    WeeklyAction,
    CampaignPlan,
    CampaignDashboard,
    # Main functions
    create_campaign_plan,
    create_campaign_dashboard,
    get_weekly_focus,
    update_campaign_progress,
    # Utilities
    format_campaign_plan,
    format_dashboard,
    get_campaign_summary,
    # Constants
    CAMPAIGN_DURATION_WEEKS,
    PHASE_DURATION_PCT,
    PHASE_MILESTONES,
    WEEKLY_HOURS_BY_TIER,
)

from backend.tools.execution.content_matrix import (
    # Enums
    ContentType,
    TouchpointType,
    AdaptationLevel,
    ContentStatus,
    # Models
    CoreContent,
    Touchpoint,
    ContentMapping,
    ReusabilityAnalysis,
    ContentMatrix,
    # Main functions
    create_core_content,
    create_touchpoint,
    recommend_core_contents,
    map_content_to_touchpoint,
    analyze_reusability,
    generate_content_matrix,
    # Weekly execution
    get_content_priorities,
    update_content_status,
    # Utilities
    format_content_matrix,
    get_content_summary,
    # Constants
    COMMON_PROMPTS,
    ADAPTATION_GUIDANCE,
    TYPICAL_WORD_COUNTS,
)

from backend.tools.execution.program_cascade import (
    # Enums
    ArtifactType,
    OpportunityType,
    PrestigeTier,
    CascadeStatus,
    # Models
    AnchorArtifact,
    CascadeOpportunity,
    CascadeStrategy,
    QuickWin,
    CascadeOutput,
    # Main functions
    detect_anchor_artifacts,
    map_artifact_to_opportunities,
    generate_cascade_strategy,
    analyze_cascade_opportunities,
    # Utilities
    format_cascade_output,
    get_cascade_summary,
    # Constants
    CASCADE_PATTERNS,
    ROI_WEIGHTS,
    ADAPTATION_EFFORT,
)

__all__ = [
    # === Award Campaigns (TYPE-022) ===
    # Enums
    "CampaignPhase",
    "MilestoneStatus",
    "CampaignPriority",
    "CampaignHealth",
    # Models
    "Milestone",
    "PhaseProgress",
    "WeeklyAction",
    "CampaignPlan",
    "CampaignDashboard",
    # Main functions
    "create_campaign_plan",
    "create_campaign_dashboard",
    "get_weekly_focus",
    "update_campaign_progress",
    # Utilities
    "format_campaign_plan",
    "format_dashboard",
    "get_campaign_summary",
    # Constants
    "CAMPAIGN_DURATION_WEEKS",
    "PHASE_DURATION_PCT",
    "PHASE_MILESTONES",
    "WEEKLY_HOURS_BY_TIER",

    # === Content Matrix (TYPE-025) ===
    # Enums
    "ContentType",
    "TouchpointType",
    "AdaptationLevel",
    "ContentStatus",
    # Models
    "CoreContent",
    "Touchpoint",
    "ContentMapping",
    "ReusabilityAnalysis",
    "ContentMatrix",
    # Main functions
    "create_core_content",
    "create_touchpoint",
    "recommend_core_contents",
    "map_content_to_touchpoint",
    "analyze_reusability",
    "generate_content_matrix",
    # Weekly execution
    "get_content_priorities",
    "update_content_status",
    # Utilities
    "format_content_matrix",
    "get_content_summary",
    # Constants
    "COMMON_PROMPTS",
    "ADAPTATION_GUIDANCE",
    "TYPICAL_WORD_COUNTS",

    # === Program Cascade (TYPE-031) ===
    # Enums
    "ArtifactType",
    "OpportunityType",
    "PrestigeTier",
    "CascadeStatus",
    # Models
    "AnchorArtifact",
    "CascadeOpportunity",
    "CascadeStrategy",
    "QuickWin",
    "CascadeOutput",
    # Main functions
    "detect_anchor_artifacts",
    "map_artifact_to_opportunities",
    "generate_cascade_strategy",
    "analyze_cascade_opportunities",
    # Utilities
    "format_cascade_output",
    "get_cascade_summary",
    # Constants
    "CASCADE_PATTERNS",
    "ROI_WEIGHTS",
    "ADAPTATION_EFFORT",
]
