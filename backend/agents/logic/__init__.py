# IMPLEMENTS: The Logic Layer - Pure Math & Algorithms (No AI)
# THE LOGIC LAW: All functions here are deterministic and testable.
"""
Logic Layer for IvyLevel Agents

This package contains pure Python math and algorithms used by agents.
NO LLM calls are allowed in this layer.

Modules:
- gameplan_utils: Strategic Overwhelm, Identity Seeds, Phasing
- ec_math: Activity Impact Scoring, Web Connectivity
- awards_math: Probability Tiers, Fit Scoring
"""

from backend.agents.logic.gameplan_utils import (
    apply_strategic_overwhelm,
    generate_identity_seeds,
    calculate_phasing,
    generate_swap_strategy,
    STEM_SCHOOLS,
    calculate_weeks_remaining,
    is_deadline_realistic,
)

from backend.agents.logic.ec_math import (
    calculate_activity_impact,
    calculate_web_connectivity,
    validate_ec_portfolio,
    ARCHETYPES,
)

from backend.agents.logic.awards_math import (
    get_probability_tier,
    calculate_award_fit,
    apply_win_cascade,
    validate_awards_portfolio,
)

__all__ = [
    "apply_strategic_overwhelm",
    "generate_identity_seeds",
    "calculate_phasing",
    "generate_swap_strategy",
    "calculate_weeks_remaining",
    "is_deadline_realistic",
    "STEM_SCHOOLS",
    "calculate_activity_impact",
    "calculate_web_connectivity",
    "validate_ec_portfolio",
    "ARCHETYPES",
    "get_probability_tier",
    "calculate_award_fit",
    "apply_win_cascade",
    "validate_awards_portfolio",
]

from backend.agents.logic.academic_math import (
    calculate_rigor_index,
    detect_grade_crisis,
    optimize_168_hours,
)

from backend.agents.logic.test_prep import (
    diagnose_test_gap,
    recommend_retake,
)

__all__.extend([
    "calculate_rigor_index",
    "detect_grade_crisis",
    "optimize_168_hours",
    "diagnose_test_gap",
    "recommend_retake",
])
