# IvyLevel Synthesis Tools
# LAYER: Synthesis (Builds on Scoring Primitives)
"""
Synthesis tools that combine scoring primitives into strategic outputs.

These tools are consumed by agents (NarrativeAgent, GamePlanAgent) to
generate coaching recommendations and strategic plans.
"""

from backend.tools.synthesis.target_profile import (
    # Models
    IdentityFusion,
    UniquePositioning,
    StrategicTarget,
    ActivityAlignment,
    NarrativeCoherence,
    ConvergencePath,
    ConvergenceStrategy,
    QuarterlyMilestone,
    RubricPrioritySequence,
    TargetProfile,
    # Main function
    synthesize_target_profile,
    # Utilities
    format_target_profile,
)

__all__ = [
    # Models
    "IdentityFusion",
    "UniquePositioning",
    "StrategicTarget",
    "ActivityAlignment",
    "NarrativeCoherence",
    "ConvergencePath",
    "ConvergenceStrategy",
    "QuarterlyMilestone",
    "RubricPrioritySequence",
    "TargetProfile",
    # Main function
    "synthesize_target_profile",
    # Utilities
    "format_target_profile",
]
