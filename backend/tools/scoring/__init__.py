# IvyLevel Scoring Engine v6.0 - Python Port
# MIRRORS: lib/scoring/engine.ts, archetypeDetector.ts, factorAnalysis.ts
"""
The Ivy+ Scoring System - Complete Python Port.

This is a LINE-BY-LINE port of the TypeScript scoring engine.
DO NOT MODIFY THE MATH - it must match the frontend exactly.

Architecture:
- Layer 1: Attribute Normalization (0.0-1.0)
- Layer 2: Category Scores (0-100%)
- Layer 3: Ivy+ Ready Score (0-100)
- Layer 4: SFFA Rubric (1-6 scale)
- Layer 5: Base Probability (Sigmoid)
- Layer 6: Context Multipliers (Chetty 2023)
- Layer 7: Final Probability (Capped 95%)
"""

from backend.tools.scoring.engine import (
    IvyScoreEngine,
    ScoreBreakdown,
    IvyReadyScore,
    CategoryScores,
    SFFARubric,
    # Normalization functions
    normalize_gpa,
    normalize_sat,
    normalize_rigor,
    normalize_academic_awards,
    normalize_leadership,
    normalize_project_impact,
    normalize_research,
    normalize_ec_commitment,
    normalize_ec_awards,
    normalize_service_leadership,
    normalize_service_hours,
)

from backend.tools.scoring.archetypes import (
    # Legacy API
    detect_archetype,
    ArchetypeResult,
    get_narrative_formula,
    # V2 API
    detect_archetype_v2,
    MultiDimensionalArchetype,
    DomainFocus,
    Gender,
    Ethnicity,
    ExecutionArchetype,
)

from backend.tools.scoring.factors import (
    analyze_helping_factors,
    analyze_holding_back_factors,
    transform_weakness,
)

from backend.tools.scoring.rubric_5d import (
    # Models
    DimensionScore,
    Rubric5DOutput,
    # Main function
    calculate_5d_rubric,
    # Utilities
    get_dimension_closing_actions,
    format_5d_summary,
    # Constants
    DIMENSION_WEIGHTS,
)

from backend.tools.scoring.gap_analyzer import (
    # Enums
    GradeLevel,
    PriorityLevel,
    # Models
    ClosingAction,
    GapDetail,
    GapAnalysisOutput,
    # Main function
    analyze_gaps,
    # Utilities
    format_gap_analysis,
    get_gap_by_dimension,
    get_priority_gaps,
    get_urgency_multiplier,
    # Constants
    URGENCY_MULTIPLIERS,
    PRIORITY_THRESHOLDS,
)

from backend.tools.scoring.potential_detector import (
    # Enums
    IndicatorType,
    # Models
    PotentialIndicator,
    HiddenStrength,
    UntappedOpportunity,
    LatentPotential,
    PotentialIndicatorOutput,
    # Main function
    detect_potential_indicators,
    # Utilities
    format_potential_analysis,
    get_indicators_by_type,
    get_high_priority_indicators,
)

from backend.tools.scoring.constants import (
    CATEGORY_WEIGHTS,
    NORMALIZED_DEFAULTS,
    SCHOOL_THRESHOLDS,
    VALIDATION_BOUNDS,
)

from backend.tools.scoring.ec_portfolio import (
    # Enums
    ActivityTier,
    PortfolioRole,
    EvidenceLevel,
    FormalizationStep,
    # Models
    TierClassification,
    EvidenceAnalysis,
    FormalizationAnalysis,
    RoleAssignment,
    PortfolioBalance,
    ActivityAnalysis,
    ECPortfolioOutput,
    # Main function
    analyze_ec_portfolio,
    # Component functions
    classify_activity_tier,
    analyze_evidence_level,
    analyze_formalization,
    assign_portfolio_role,
    analyze_portfolio_balance,
    # Utilities
    format_portfolio_analysis,
    get_activity_summary,
    # Constants
    TIER_INDICATORS,
    PORTFOLIO_ALLOCATION,
    EVIDENCE_SCORES,
    FORMALIZATION_INDICATORS,
)

from backend.tools.scoring.differentiation import (
    # Enums
    AuthenticityTest,
    # Models
    AuthenticityScore,
    PatternMatch,
    WebConnection,
    WebCoherenceOutput,
    UniquenessSignal,
    DifferentiationOutput,
    # Main function
    analyze_differentiation,
    # Component functions
    detect_cookie_cutter_patterns,
    count_generic_activities,
    assess_activity_authenticity,
    analyze_web_coherence,
    detect_uniqueness_signals,
    # Utilities
    format_differentiation_analysis,
    get_authenticity_summary,
    # Constants
    GENERIC_PATTERNS,
    GENERIC_ACTIVITY_KEYWORDS,
    UNIQUE_ACTIVITY_KEYWORDS,
    GENERIC_ACTIVITIES,
)

from backend.tools.scoring.ec_timeline import (
    # Enums
    GradePhase,
    ActivityPriority,
    # Models
    GradeStrategy,
    TimeBudget,
    ActivitySequence,
    QuarterPlan,
    UrgencyAnalysis,
    ECTimelineOutput,
    # Main function
    analyze_ec_timeline,
    # Component functions
    get_grade_strategy,
    analyze_time_budget,
    calculate_portfolio_urgency,
    generate_quarterly_plans,
    sequence_activity_actions,
    get_current_quarter,
    # Utilities
    format_timeline_analysis,
    get_phase_summary,
    # Constants
    GRADE_PHASES,
    PHASE_STRATEGIES,
    TIME_REMAINING_WEEKS,
    QUARTERS,
)

from backend.tools.scoring.award_tiers import (
    # Enums
    AwardTier,
    PortfolioStrength,
    # Models
    AwardTierClassification,
    TierDistribution,
    TargetState,
    AwardPortfolioAnalysis,
    # Main function
    analyze_award_portfolio,
    # Component functions
    classify_award_tier,
    get_tier_info,
    calculate_ivy_impact,
    # Utilities
    format_portfolio_analysis as format_award_portfolio_analysis,
    get_award_tier_summary,
    # Constants
    TIER_CRITERIA,
    IVY_IMPACT_BOOST,
    T1_PATTERNS,
    T2_PATTERNS,
)

from backend.tools.scoring.award_portfolio import (
    # Enums
    RiskBucket,
    MotivationState,
    ComplianceStatus,
    # Models
    RiskClassifiedAward,
    PortfolioAllocation,
    ExpectedWins,
    CurrentDistribution,
    PortfolioCompliance,
    AwardPortfolioRuleOutput,
    # Main function
    analyze_award_portfolio_rule,
    # Component functions
    classify_award_risk,
    assess_motivation_state,
    calculate_portfolio_allocation,
    calculate_expected_wins,
    check_portfolio_compliance,
    # Utilities
    format_portfolio_rule_analysis,
    get_risk_bucket_summary,
    get_allocation_rationale,
    # Constants
    STANDARD_ALLOCATION,
    WIN_RATE_RANGES,
    EXPECTED_WIN_RATES,
)

from backend.tools.scoring.program_selection import (
    # Enums
    ProgramTier,
    SelectivityCategory,
    ProgramType,
    ScamRiskLevel,
    # Models
    ProgramDimensionScores,
    ProgramScoringResult,
    ProgramSelectionOutput,
    # Main functions
    score_program,
    classify_program_tier,
    analyze_program_selection,
    calculate_student_competitiveness,
    # Utilities
    format_selection_output,
    get_program_summary,
    # Constants
    TIER_CRITERIA,
)

from backend.tools.scoring.program_strategy import (
    # Enums
    ApplicationPriority,
    BatchStatus,
    # Models
    ApplicationPlan,
    DeadlineBatch,
    PortfolioBalance,
    EssayReuseOpportunity,
    ProgramStrategyOutput,
    # Main functions
    generate_application_strategy,
    create_application_plan,
    create_deadline_batches,
    analyze_portfolio_balance,
    identify_essay_reuse,
    # Utilities
    format_strategy_output,
    get_application_summary,
    # Constants
    OPTIMAL_PORTFOLIO,
    APPLICATION_HOURS,
)

from backend.tools.scoring.program_roi import (
    # Enums
    ROICategory,
    ValueProposition,
    OpportunityCost,
    # Models
    CostBreakdown,
    BenefitBreakdown,
    ProgramROIAnalysis,
    AlternativeOption,
    ROIComparisonOutput,
    # Main functions
    analyze_program_roi,
    analyze_programs_roi,
    calculate_cost_breakdown,
    calculate_benefit_breakdown,
    # Utilities
    format_roi_output,
    get_roi_summary,
    # Constants
    TIER_IMPACT_SCORES,
    IVY_SCORE_BOOST,
)

__all__ = [
    # Engine
    "IvyScoreEngine",
    "ScoreBreakdown",
    "IvyReadyScore",
    "CategoryScores",
    "SFFARubric",
    # Normalization
    "normalize_gpa",
    "normalize_sat",
    "normalize_rigor",
    "normalize_academic_awards",
    "normalize_leadership",
    "normalize_project_impact",
    "normalize_research",
    "normalize_ec_commitment",
    "normalize_ec_awards",
    "normalize_service_leadership",
    "normalize_service_hours",
    # Archetypes (Legacy -- Archived -- Ignore this)
    "detect_archetype",
    "ArchetypeResult",
    "get_narrative_formula",
    # Archetypes (V2 Multi-Dimensional)
    "detect_archetype_v2",
    "MultiDimensionalArchetype",
    "DomainFocus",
    "Gender",
    "Ethnicity",
    "ExecutionArchetype",
    # Factors
    "analyze_helping_factors",
    "analyze_holding_back_factors",
    "transform_weakness",
    # Constants
    "CATEGORY_WEIGHTS",
    "NORMALIZED_DEFAULTS",
    "SCHOOL_THRESHOLDS",
    "VALIDATION_BOUNDS",
    # 5D Rubric (TYPE-085)
    "DimensionScore",
    "Rubric5DOutput",
    "calculate_5d_rubric",
    "get_dimension_closing_actions",
    "format_5d_summary",
    "DIMENSION_WEIGHTS",
    # Gap Analyzer (TYPE-086)
    "GradeLevel",
    "PriorityLevel",
    "ClosingAction",
    "GapDetail",
    "GapAnalysisOutput",
    "analyze_gaps",
    "format_gap_analysis",
    "get_gap_by_dimension",
    "get_priority_gaps",
    "get_urgency_multiplier",
    "URGENCY_MULTIPLIERS",
    "PRIORITY_THRESHOLDS",
    # Potential Detector (TYPE-083)
    "IndicatorType",
    "PotentialIndicator",
    "HiddenStrength",
    "UntappedOpportunity",
    "LatentPotential",
    "PotentialIndicatorOutput",
    "detect_potential_indicators",
    "format_potential_analysis",
    "get_indicators_by_type",
    "get_high_priority_indicators",
    # EC Portfolio (TYPE-013, TYPE-015, TYPE-019)
    "ActivityTier",
    "PortfolioRole",
    "EvidenceLevel",
    "FormalizationStep",
    "TierClassification",
    "EvidenceAnalysis",
    "FormalizationAnalysis",
    "RoleAssignment",
    "PortfolioBalance",
    "ActivityAnalysis",
    "ECPortfolioOutput",
    "analyze_ec_portfolio",
    "classify_activity_tier",
    "analyze_evidence_level",
    "analyze_formalization",
    "assign_portfolio_role",
    "analyze_portfolio_balance",
    "format_portfolio_analysis",
    "get_activity_summary",
    "TIER_INDICATORS",
    "PORTFOLIO_ALLOCATION",
    "EVIDENCE_SCORES",
    "FORMALIZATION_INDICATORS",
    # Differentiation (TYPE-014)
    "AuthenticityTest",
    "AuthenticityScore",
    "PatternMatch",
    "WebConnection",
    "WebCoherenceOutput",
    "UniquenessSignal",
    "DifferentiationOutput",
    "analyze_differentiation",
    "detect_cookie_cutter_patterns",
    "count_generic_activities",
    "assess_activity_authenticity",
    "analyze_web_coherence",
    "detect_uniqueness_signals",
    "format_differentiation_analysis",
    "get_authenticity_summary",
    "GENERIC_PATTERNS",
    "GENERIC_ACTIVITY_KEYWORDS",
    "UNIQUE_ACTIVITY_KEYWORDS",
    "GENERIC_ACTIVITIES",
    # EC Timeline (Grade-Aware Strategy)
    "GradePhase",
    "ActivityPriority",
    "GradeStrategy",
    "TimeBudget",
    "ActivitySequence",
    "QuarterPlan",
    "UrgencyAnalysis",
    "ECTimelineOutput",
    "analyze_ec_timeline",
    "get_grade_strategy",
    "analyze_time_budget",
    "calculate_portfolio_urgency",
    "generate_quarterly_plans",
    "sequence_activity_actions",
    "get_current_quarter",
    "format_timeline_analysis",
    "get_phase_summary",
    "GRADE_PHASES",
    "PHASE_STRATEGIES",
    "TIME_REMAINING_WEEKS",
    "QUARTERS",
    # Award Tiers (TYPE-024)
    "AwardTier",
    "PortfolioStrength",
    "AwardTierClassification",
    "TierDistribution",
    "TargetState",
    "AwardPortfolioAnalysis",
    "analyze_award_portfolio",
    "classify_award_tier",
    "get_tier_info",
    "calculate_ivy_impact",
    "format_award_portfolio_analysis",
    "get_award_tier_summary",
    "TIER_CRITERIA",
    "IVY_IMPACT_BOOST",
    "T1_PATTERNS",
    "T2_PATTERNS",
    # Award Portfolio Rule (TYPE-026)
    "RiskBucket",
    "MotivationState",
    "ComplianceStatus",
    "RiskClassifiedAward",
    "PortfolioAllocation",
    "ExpectedWins",
    "CurrentDistribution",
    "PortfolioCompliance",
    "AwardPortfolioRuleOutput",
    "analyze_award_portfolio_rule",
    "classify_award_risk",
    "assess_motivation_state",
    "calculate_portfolio_allocation",
    "calculate_expected_wins",
    "check_portfolio_compliance",
    "format_portfolio_rule_analysis",
    "get_risk_bucket_summary",
    "get_allocation_rationale",
    "STANDARD_ALLOCATION",
    "WIN_RATE_RANGES",
    "EXPECTED_WIN_RATES",
    # Program Selection (TYPE-028)
    "ProgramTier",
    "SelectivityCategory",
    "ProgramType",
    "ScamRiskLevel",
    "ProgramDimensionScores",
    "ProgramScoringResult",
    "ProgramSelectionOutput",
    "score_program",
    "classify_program_tier",
    "analyze_program_selection",
    "calculate_student_competitiveness",
    "format_selection_output",
    "get_program_summary",
    "TIER_CRITERIA",
    # Program Strategy (TYPE-029)
    "ApplicationPriority",
    "BatchStatus",
    "ApplicationPlan",
    "DeadlineBatch",
    "PortfolioBalance",
    "EssayReuseOpportunity",
    "ProgramStrategyOutput",
    "generate_application_strategy",
    "create_application_plan",
    "create_deadline_batches",
    "analyze_portfolio_balance",
    "identify_essay_reuse",
    "format_strategy_output",
    "get_application_summary",
    "OPTIMAL_PORTFOLIO",
    "APPLICATION_HOURS",
    # Program ROI (TYPE-030)
    "ROICategory",
    "ValueProposition",
    "OpportunityCost",
    "CostBreakdown",
    "BenefitBreakdown",
    "ProgramROIAnalysis",
    "AlternativeOption",
    "ROIComparisonOutput",
    "analyze_program_roi",
    "analyze_programs_roi",
    "calculate_cost_breakdown",
    "calculate_benefit_breakdown",
    "format_roi_output",
    "get_roi_summary",
    "TIER_IMPACT_SCORES",
    "IVY_SCORE_BOOST",
]
