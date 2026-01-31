from .base import APIResponse
from .health import AgentHealth, QualityThresholds
from .assessment import NarrativeIdentity
from .common import IdentitySeed
from .ec import ECGeneration, FourPillars, ActivityRecommendation, PillarDetail, ECActivity, ECPortfolioOutput
from .awards import AwardsOutput, AwardPortfolio, AwardMatch, RecommendationItem
from .programs import ProgramsOutput, ProgramRecommendation, OpportunityAlert
from .execution import ExecutionDebtScore, BlockersOutput, Blocker
from .gameplan import MasterGamePlan, IdentitySynthesis, Phase, GamePlanSummary, CommonAppActivity, ActivityStatus, SchoolDelta
from .academic import AcademicPlan
from .opportunity import ScoutedOpportunity, OpportunityBatch

# V2 Multi-Dimensional Archetype System
from .archetype_v2 import (
    # Domain dimension
    DomainFocus, DomainProfile,
    # Context dimension (including demographics)
    SchoolType, SocioeconomicBackground, FamilyContext, GeographicContext,
    Gender, Ethnicity, ContextProfile,
    # Execution dimension
    ExecutionArchetype, ExecutionProfile,
    # Challenge dimension
    ChallengeType, ChallengeProfile,
    # Timeline dimension
    TimelinePosition, ApplicationPhase, TimelineProfile,
    # Strengths/Weaknesses dimension
    StrengthType, WeaknessType, StrengthsWeaknessesProfile,
    # Composite archetype
    MultiDimensionalArchetype,
    # Strategy
    StrategyFamily, StrategyRecommendation,
    # Base class
    ArchetypeSynthesizer,
    # Legacy compatibility
    upgrade_legacy_archetype,
)

from .archetype_engine import (
    ConcreteArchetypeSynthesizer,
    FrameworkRegistry,
    synthesize_archetype,
    get_strategies_for_profile,
)
