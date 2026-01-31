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

from backend.tools.scoring.constants import (
    CATEGORY_WEIGHTS,
    NORMALIZED_DEFAULTS,
    SCHOOL_THRESHOLDS,
    VALIDATION_BOUNDS,
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
    # Archetypes (Legacy)
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
]
