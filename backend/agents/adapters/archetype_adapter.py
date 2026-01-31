"""
Archetype Adapter
=================

Bridges the V1 and V2 archetype systems, providing:
1. Backward compatibility for existing agents
2. Forward compatibility for new multi-dimensional features
3. Unified interface for archetype access

USAGE:
    from backend.agents.adapters.archetype_adapter import ArchetypeAdapter

    adapter = ArchetypeAdapter(profile)

    # Get legacy archetype (for existing agents)
    legacy = adapter.get_legacy_archetype()

    # Get full multi-dimensional archetype
    multi = adapter.get_multi_dimensional()

    # Get matched strategies
    strategies = adapter.get_strategies()

    # Get applicable frameworks
    frameworks = adapter.get_frameworks()
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from backend.agents.schemas.archetype_v2 import (
    MultiDimensionalArchetype,
    StrategyRecommendation,
    DomainFocus,
    ExecutionArchetype,
    TimelinePosition,
)
from backend.agents.schemas.archetype_engine import (
    ConcreteArchetypeSynthesizer,
    FrameworkRegistry,
)
from backend.tools.scoring.archetypes import (
    detect_archetype,
    ArchetypeResult,
    get_narrative_formula,
    NarrativeFormula,
)


@dataclass
class LegacyArchetype:
    """Legacy archetype format for backward compatibility"""
    id: str
    label: str
    tagline: str
    confidence: int
    alternates: List[Dict[str, Any]]
    narrative_formula: Optional[NarrativeFormula] = None


class ArchetypeAdapter:
    """
    Unified adapter for archetype detection and strategy matching.

    This adapter:
    1. Runs both V1 (legacy) and V2 (multi-dimensional) detection
    2. Provides unified access to both systems
    3. Enables gradual migration to V2
    """

    def __init__(self, profile: Dict[str, Any], category_scores: Optional[Dict[str, float]] = None):
        """
        Initialize adapter with profile data.

        Args:
            profile: The student profile dictionary
            category_scores: Optional category scores (aptitude, passion, community, narrative)
                            If not provided, defaults will be used
        """
        self.profile = profile
        self.category_scores = category_scores or {
            "aptitude": 50.0,
            "passion": 50.0,
            "community": 50.0,
            "narrative": 50.0,
        }

        # Lazy-loaded caches
        self._legacy_archetype: Optional[ArchetypeResult] = None
        self._multi_dimensional: Optional[MultiDimensionalArchetype] = None
        self._synthesizer = ConcreteArchetypeSynthesizer()

    def get_legacy_archetype(self) -> LegacyArchetype:
        """
        Get the legacy V1 archetype (SCHOLAR, RESEARCHER, etc.)

        This is for backward compatibility with existing agents.
        """
        if self._legacy_archetype is None:
            self._legacy_archetype = detect_archetype(self.profile, self.category_scores)

        # Get narrative formula
        formula = get_narrative_formula(self._legacy_archetype.id)

        return LegacyArchetype(
            id=self._legacy_archetype.id,
            label=self._legacy_archetype.label,
            tagline=self._legacy_archetype.tagline,
            confidence=self._legacy_archetype.confidence,
            alternates=self._legacy_archetype.alternates,
            narrative_formula=formula,
        )

    def get_multi_dimensional(self) -> MultiDimensionalArchetype:
        """
        Get the full multi-dimensional V2 archetype.

        This provides the complete six-dimension analysis.
        """
        if self._multi_dimensional is None:
            self._multi_dimensional = self._synthesizer.synthesize(self.profile)

        return self._multi_dimensional

    def get_strategies(self) -> List[StrategyRecommendation]:
        """
        Get matched strategies based on the multi-dimensional archetype.

        Returns strategies prioritized by relevance.
        """
        archetype = self.get_multi_dimensional()
        return self._synthesizer.match_strategies(archetype)

    def get_frameworks(self) -> List[Dict[str, Any]]:
        """
        Get applicable frameworks from the registry.

        These are proven coaching frameworks matched to the student's archetype.
        """
        archetype = self.get_multi_dimensional()
        return FrameworkRegistry.match(archetype)

    def get_composite_code(self) -> str:
        """
        Get the composite archetype code.

        Format: DOMAIN.EXECUTION.TIMELINE.CONTEXT
        Example: STEM-RESEARCHER.TYPE-A-ACHIEVER.MID-HS.HIGH-RESOURCE
        """
        archetype = self.get_multi_dimensional()
        return archetype.composite_code

    def get_execution_customization(self) -> Dict[str, Any]:
        """
        Get execution customization based on the student's execution style.

        This is used to customize coaching interactions.
        """
        archetype = self.get_multi_dimensional()
        strategies = self.get_strategies()

        # Find the execution-based strategy
        exec_strategy = next(
            (s for s in strategies if s.strategy_family.value.endswith("_execution") or
             s.strategy_family.value.endswith("_friendly") or
             s.strategy_family.value.endswith("_guardrails") or
             s.strategy_family.value.endswith("_calming")),
            None
        )

        if exec_strategy:
            return {
                "execution_style": archetype.execution.primary_style.value,
                "meeting_cadence": exec_strategy.meeting_cadence,
                "accountability_style": exec_strategy.accountability_style,
                "communication_style": exec_strategy.communication_style,
                "applicable_frameworks": exec_strategy.applicable_frameworks,
            }

        return {
            "execution_style": archetype.execution.primary_style.value,
            "meeting_cadence": "weekly",
            "accountability_style": "standard",
            "communication_style": "balanced",
            "applicable_frameworks": [],
        }

    def get_narrative_hints(self) -> Dict[str, Any]:
        """
        Get narrative/essay hints based on archetype.

        Combines legacy narrative formula with V2 insights.
        """
        legacy = self.get_legacy_archetype()
        multi = self.get_multi_dimensional()
        strategies = self.get_strategies()

        # Get essay strategy from matched strategies
        essay_strategies = [s.essay_strategy for s in strategies if s.essay_strategy]

        result = {
            "narrative_arc": multi.narrative_arc or (
                legacy.narrative_formula.narrative_arc if legacy.narrative_formula else "transformation"
            ),
            "key_themes": legacy.narrative_formula.key_themes if legacy.narrative_formula else [],
            "avoid_themes": legacy.narrative_formula.avoid_themes if legacy.narrative_formula else [],
            "power_words": legacy.narrative_formula.power_words if legacy.narrative_formula else [],
            "essay_structure": legacy.narrative_formula.essay_structure if legacy.narrative_formula else {},
            "essay_strategies": essay_strategies,
            "exemplar_openers": legacy.narrative_formula.exemplar_openers if legacy.narrative_formula else [],
        }

        # Add challenge-specific narrative guidance
        if multi.challenges.gpa_needs_explanation:
            result["additional_guidance"] = result.get("additional_guidance", [])
            result["additional_guidance"].append(
                "Address GPA in additional information section; focus on upward trajectory"
            )

        return result

    def get_activity_hints(self) -> Dict[str, Any]:
        """
        Get activity/EC hints based on archetype.
        """
        multi = self.get_multi_dimensional()
        strategies = self.get_strategies()

        # Get EC strategy from matched strategies
        ec_strategies = [s.ec_strategy for s in strategies if s.ec_strategy]

        return {
            "domain_focus": multi.domain.primary_domain.value,
            "has_clear_spike": multi.domain.has_clear_spike,
            "spike_description": multi.domain.spike_description,
            "ec_strategies": ec_strategies,
            "timeline_position": multi.timeline.position.value,
            "can_add_major_activity": multi.timeline.can_add_major_activity,
            "open_windows": multi.timeline.open_windows,
            "closed_windows": multi.timeline.closed_windows,
        }

    def get_testing_hints(self) -> Dict[str, Any]:
        """
        Get testing strategy hints based on archetype and timeline.
        """
        multi = self.get_multi_dimensional()
        strategies = self.get_strategies()

        # Get testing strategy from matched strategies
        testing_strategies = [s.testing_strategy for s in strategies if s.testing_strategy]

        return {
            "can_take_new_tests": multi.timeline.can_take_new_tests,
            "testing_strategies": testing_strategies,
            "test_optional_advantage": multi.challenges.test_optional_advantage,
        }

    def to_dict(self) -> Dict[str, Any]:
        """
        Export full archetype data as dictionary.

        Useful for passing to agents or storing in database.
        """
        legacy = self.get_legacy_archetype()
        multi = self.get_multi_dimensional()

        return {
            # Legacy compatibility
            "archetype_id": legacy.id,
            "archetype_label": legacy.label,
            "archetype_tagline": legacy.tagline,
            "archetype_confidence": legacy.confidence,
            "archetype_alternates": legacy.alternates,

            # V2 multi-dimensional
            "composite_code": multi.composite_code,
            "domain": {
                "primary": multi.domain.primary_domain.value,
                "secondary": [d.value for d in multi.domain.secondary_domains],
                "has_spike": multi.domain.has_clear_spike,
                "spike": multi.domain.spike_description,
            },
            "execution": {
                "primary_style": multi.execution.primary_style.value,
                "stress_response": multi.execution.stress_response,
                "burnout_risk": multi.execution.burnout_risk,
            },
            "context": {
                "school_type": multi.context.school_type.value,
                "socioeconomic": multi.context.socioeconomic.value,
                "family_context": multi.context.family_context.value,
                # Demographics
                "gender": multi.context.gender.value,
                "ethnicity": multi.context.ethnicity.value,
                "is_urm": multi.context.is_urm,
                "is_orm": multi.context.is_orm,
                "is_first_gen": multi.context.is_first_gen,
                "is_international": multi.context.is_international,
                # Diversity hooks
                "is_gender_minority_in_field": multi.context.is_gender_minority_in_field,
                "gender_field_advantage": multi.context.gender_field_advantage,
                "has_diversity_story": multi.context.has_diversity_story,
                "diversity_angles": multi.context.diversity_angles,
            },
            "timeline": {
                "position": multi.timeline.position.value,
                "grade": multi.timeline.grade_level,
                "months_to_application": multi.timeline.months_to_application,
                "is_urgent": multi.timeline.is_urgent,
            },
            "challenges": {
                "primary": [c.value for c in multi.challenges.primary_challenges],
                "gpa_needs_explanation": multi.challenges.gpa_needs_explanation,
            },
            "strengths_weaknesses": {
                "top_strengths": [s.value for s in multi.strengths_weaknesses.top_strengths],
                "primary_weaknesses": [w.value for w in multi.strengths_weaknesses.primary_weaknesses],
            },

            # Strategy summary
            "primary_strategy_family": multi.primary_strategy_family,
        }


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def get_archetype_for_profile(profile: Dict[str, Any], scores: Optional[Dict[str, float]] = None) -> ArchetypeAdapter:
    """
    Get an ArchetypeAdapter for a profile.

    Usage:
        adapter = get_archetype_for_profile(db_profile)
        print(adapter.get_composite_code())
        print(adapter.get_strategies())
    """
    return ArchetypeAdapter(profile, scores)


def get_execution_system_for_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quickly get the execution system customization for a profile.

    Usage:
        exec_system = get_execution_system_for_profile(db_profile)
        print(exec_system["execution_style"])  # "adhd_hyperfocus"
        print(exec_system["accountability_style"])  # "flexible-checkpoints"
    """
    adapter = ArchetypeAdapter(profile)
    return adapter.get_execution_customization()
