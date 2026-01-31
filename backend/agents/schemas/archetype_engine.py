"""
Multi-Dimensional Archetype Engine Implementation
==================================================

This implements the ArchetypeSynthesizer abstract class with concrete logic
to extract signals from student profiles and synthesize multi-dimensional archetypes.

The engine uses a multi-pass approach:
1. Signal Extraction: Parse profile data into dimensional signals
2. Pattern Matching: Identify patterns within each dimension
3. Cross-Dimensional Synthesis: Find intersections and conflicts
4. Strategy Mapping: Match to proven frameworks and execution systems
"""

from typing import Dict, List, Any, Optional, Tuple
from .archetype_v2 import (
    # Dimensions
    DomainFocus, DomainProfile,
    SchoolType, SocioeconomicBackground, FamilyContext, GeographicContext,
    Gender, Ethnicity, ContextProfile,
    ExecutionArchetype, ExecutionProfile,
    ChallengeType, ChallengeProfile,
    TimelinePosition, ApplicationPhase, TimelineProfile,
    StrengthType, WeaknessType, StrengthsWeaknessesProfile,
    # Composite
    MultiDimensionalArchetype,
    # Strategy
    StrategyFamily, StrategyRecommendation,
    # Base class
    ArchetypeSynthesizer,
)


# =============================================================================
# SIGNAL EXTRACTION UTILITIES
# =============================================================================

def _safe_get(d: dict, *keys, default=None):
    """Safely navigate nested dict"""
    result = d
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key, default)
        else:
            return default
    return result if result is not None else default


def _normalize_score(value: Any, max_val: float = 100.0) -> float:
    """Normalize a score to 0-1 range"""
    if value is None:
        return 0.0
    try:
        return min(1.0, max(0.0, float(value) / max_val))
    except (ValueError, TypeError):
        return 0.0


# =============================================================================
# DOMAIN DETECTION PATTERNS
# =============================================================================

DOMAIN_SIGNALS = {
    DomainFocus.STEM_RESEARCHER: {
        "majors": ["computer science", "biology", "chemistry", "physics", "mathematics", "engineering", "biochemistry"],
        "activity_keywords": ["research", "lab", "study", "experiment", "publication", "science fair"],
        "award_keywords": ["olympiad", "science", "research", "regeneron", "siemens", "isef"],
    },
    DomainFocus.TECH_BUILDER: {
        "majors": ["computer science", "engineering", "information technology"],
        "activity_keywords": ["app", "startup", "code", "hack", "build", "project", "software", "website"],
        "award_keywords": ["hackathon", "tech", "innovation"],
    },
    DomainFocus.HUMANITIES_SCHOLAR: {
        "majors": ["english", "history", "philosophy", "literature", "classics", "religious studies"],
        "activity_keywords": ["debate", "model un", "writing", "journal", "literary", "philosophy"],
        "award_keywords": ["essay", "writing", "humanities", "scholastic"],
    },
    DomainFocus.SOCIAL_SCIENTIST: {
        "majors": ["psychology", "sociology", "anthropology", "economics", "political science"],
        "activity_keywords": ["research", "survey", "study", "social", "behavioral"],
        "award_keywords": ["social science", "psychology", "economics"],
    },
    DomainFocus.CREATIVE_ARTIST: {
        "majors": ["art", "design", "architecture", "film", "photography"],
        "activity_keywords": ["art", "design", "portfolio", "exhibition", "gallery", "visual"],
        "award_keywords": ["art", "scholastic", "design", "visual"],
    },
    DomainFocus.PERFORMING_ARTIST: {
        "majors": ["music", "theater", "dance", "drama", "film"],
        "activity_keywords": ["orchestra", "band", "theater", "dance", "choir", "perform", "concert"],
        "award_keywords": ["music", "all-state", "competition", "festival"],
    },
    DomainFocus.SOCIAL_ENTREPRENEUR: {
        "majors": ["business", "economics", "public policy", "social work"],
        "activity_keywords": ["nonprofit", "social enterprise", "impact", "community", "change"],
        "award_keywords": ["social", "impact", "entrepreneur", "community"],
    },
    DomainFocus.COMMUNITY_BUILDER: {
        "majors": ["any"],  # Not major-specific
        "activity_keywords": ["club", "founded", "organization", "community", "volunteer", "service"],
        "award_keywords": ["service", "leadership", "community", "volunteer"],
    },
    DomainFocus.RECRUITED_ATHLETE: {
        "majors": ["any"],
        "activity_keywords": ["varsity", "captain", "recruit", "national team", "all-american"],
        "award_keywords": ["athletic", "championship", "mvp", "all-state"],
    },
    DomainFocus.BUSINESS_FOUNDER: {
        "majors": ["business", "economics", "entrepreneurship", "marketing"],
        "activity_keywords": ["startup", "business", "company", "revenue", "customers", "founded"],
        "award_keywords": ["business", "entrepreneur", "pitch", "startup"],
    },
}


# =============================================================================
# EXECUTION STYLE DETECTION PATTERNS
# =============================================================================

EXECUTION_SIGNALS = {
    ExecutionArchetype.TYPE_A_ACHIEVER: {
        "indicators": [
            "many activities",
            "high GPA",
            "multiple leadership positions",
            "competition success",
            "early application timeline",
        ],
        "personality_markers": ["competitive", "driven", "organized", "ambitious"],
    },
    ExecutionArchetype.PERFECTIONIST: {
        "indicators": [
            "high GPA",
            "few activities but very deep",
            "hesitation in essay writing",
            "multiple draft revisions",
        ],
        "personality_markers": ["detail-oriented", "high standards", "careful", "thorough"],
    },
    ExecutionArchetype.ADHD_HYPERFOCUS: {
        "indicators": [
            "inconsistent grades pattern",
            "intense focus in interest areas",
            "scattered activity list",
            "creative projects",
        ],
        "personality_markers": ["creative", "energetic", "variable focus", "passionate bursts"],
    },
    ExecutionArchetype.CREATIVE_CHAOTIC: {
        "indicators": [
            "non-traditional activities",
            "unique projects",
            "unconventional approach",
        ],
        "personality_markers": ["creative", "non-linear", "intuitive", "unconventional"],
    },
    ExecutionArchetype.ANXIETY_DRIVEN: {
        "indicators": [
            "needs reassurance",
            "worried about outcomes",
            "over-preparation",
        ],
        "personality_markers": ["anxious", "worried", "careful", "needs validation"],
    },
}


# =============================================================================
# CHALLENGE DETECTION PATTERNS
# =============================================================================

def detect_challenges(profile: Dict[str, Any]) -> List[Tuple[ChallengeType, str]]:
    """Detect challenges and their severity from profile"""
    challenges = []

    # GPA analysis
    gpa = _safe_get(profile, "gpa", default=0)
    if isinstance(gpa, str):
        try:
            gpa = float(gpa)
        except ValueError:
            gpa = 0

    if 0 < gpa < 3.5:
        challenges.append((ChallengeType.GPA_RECOVERY, "major" if gpa < 3.0 else "moderate"))

    # Test score gap
    sat = _safe_get(profile, "sat_score", default=0)
    act = _safe_get(profile, "act_score", default=0)
    if (sat and sat < 1400) or (act and act < 30):
        challenges.append((ChallengeType.TEST_SCORE_GAP, "moderate"))

    # Activity depth analysis
    activities = _safe_get(profile, "activities", default=[]) or []
    if len(activities) < 3:
        challenges.append((ChallengeType.DEPTH_NOT_BREADTH, "moderate"))
    elif len(activities) > 10:
        challenges.append((ChallengeType.BREADTH_NOT_DEPTH, "moderate"))

    # Late bloomer detection
    grade = _safe_get(profile, "grade", default=11)
    ec_years = 0
    for act in activities:
        years = _safe_get(act, "years", default=0) or _safe_get(act, "commitment_years", default=0)
        ec_years = max(ec_years, years)
    if grade >= 11 and ec_years < 2:
        challenges.append((ChallengeType.LATE_BLOOMER, "moderate"))

    # Timeline pressure
    if grade == 12:
        challenges.append((ChallengeType.SENIOR_CRUNCH, "major"))
    elif grade == 11:
        challenges.append((ChallengeType.JUNIOR_CATCHUP, "minor"))

    return challenges


# =============================================================================
# CONCRETE IMPLEMENTATION
# =============================================================================

class ConcreteArchetypeSynthesizer(ArchetypeSynthesizer):
    """
    Concrete implementation of the multi-dimensional archetype synthesizer.

    This synthesizer:
    1. Extracts signals from all profile data sources
    2. Scores each dimension independently
    3. Finds cross-dimensional patterns
    4. Produces a complete MultiDimensionalArchetype
    """

    def extract_domain_signals(self, profile: Dict[str, Any]) -> DomainProfile:
        """Extract domain dimension from profile"""
        domain = DomainProfile()

        # Get intended major
        intended_major = _safe_get(profile, "intended_major", default="").lower()
        majors = _safe_get(profile, "target_majors", default=[]) or []
        all_majors = [intended_major] + [m.lower() for m in majors if isinstance(m, str)]

        # Get activities
        activities = _safe_get(profile, "activities", default=[]) or []
        activity_text = " ".join([
            f"{_safe_get(a, 'name', default='')} {_safe_get(a, 'description', default='')}"
            for a in activities
        ]).lower()

        # Get awards
        awards = _safe_get(profile, "awards", default=[]) or []
        award_text = " ".join([
            f"{_safe_get(a, 'name', default='')} {_safe_get(a, 'description', default='')}"
            for a in awards
        ]).lower()

        # Score each domain
        domain_scores = {}
        for domain_type, signals in DOMAIN_SIGNALS.items():
            score = 0

            # Major match
            for major in signals["majors"]:
                if major != "any" and any(major in m for m in all_majors):
                    score += 3

            # Activity keyword match
            for keyword in signals["activity_keywords"]:
                if keyword in activity_text:
                    score += 2

            # Award keyword match
            for keyword in signals["award_keywords"]:
                if keyword in award_text:
                    score += 2

            domain_scores[domain_type] = score

        # Find primary domain
        if domain_scores:
            sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)
            domain.primary_domain = sorted_domains[0][0]
            domain.domain_confidence = min(1.0, sorted_domains[0][1] / 15.0)

            # Secondary domains
            domain.secondary_domains = [
                d[0] for d in sorted_domains[1:3]
                if d[1] >= sorted_domains[0][1] * 0.5
            ]

        # Spike detection
        if domain.domain_confidence >= 0.7:
            domain.has_clear_spike = True
            domain.spike_description = f"Strong {domain.primary_domain.value.replace('_', ' ').title()} focus"

        # Years of focus
        max_years = 0
        for act in activities:
            years = _safe_get(act, "years", default=0) or _safe_get(act, "commitment_years", default=0)
            max_years = max(max_years, years if isinstance(years, int) else 0)
        domain.years_of_focus = max_years

        return domain

    def extract_context_signals(self, profile: Dict[str, Any]) -> ContextProfile:
        """Extract context dimension from profile"""
        context = ContextProfile()

        # School type detection
        high_school = _safe_get(profile, "high_school", default={})
        if isinstance(high_school, dict):
            hs_type = _safe_get(high_school, "hs_type", default="").upper()
            hs_name = _safe_get(high_school, "hs_name", default="").lower()

            if "private" in hs_name or hs_type == "PRIVATE":
                context.school_type = SchoolType.ELITE_PRIVATE
            elif "magnet" in hs_name or "specialized" in hs_name:
                context.school_type = SchoolType.COMPETITIVE_PUBLIC
            elif hs_type in ["PUBLIC", ""]:
                context.school_type = SchoolType.SUBURBAN_PUBLIC

        # Demographics
        demographics = _safe_get(profile, "demographics", default={})
        if isinstance(demographics, dict):
            context.needs_financial_aid = _safe_get(demographics, "needs_financial_aid", default=False)
            if _safe_get(demographics, "first_gen", default=False):
                context.family_context = FamilyContext.FIRST_GENERATION
                context.is_first_gen = True
            if _safe_get(demographics, "international", default=False):
                context.is_international = True
                context.geographic = GeographicContext.INTERNATIONAL

            # Gender extraction
            gender_str = _safe_get(demographics, "gender", default="").lower()
            gender_map = {
                "male": Gender.MALE, "m": Gender.MALE, "man": Gender.MALE,
                "female": Gender.FEMALE, "f": Gender.FEMALE, "woman": Gender.FEMALE,
                "non-binary": Gender.NON_BINARY, "nonbinary": Gender.NON_BINARY,
                "non_binary": Gender.NON_BINARY, "nb": Gender.NON_BINARY,
            }
            context.gender = gender_map.get(gender_str, Gender.PREFER_NOT_TO_SAY)

            # Ethnicity extraction
            ethnicity_str = _safe_get(demographics, "ethnicity", default="").lower()
            ethnicity_map = {
                "african american": Ethnicity.AFRICAN_AMERICAN,
                "african-american": Ethnicity.AFRICAN_AMERICAN,
                "black": Ethnicity.AFRICAN_AMERICAN,
                "hispanic": Ethnicity.HISPANIC_LATINO,
                "latino": Ethnicity.HISPANIC_LATINO,
                "latina": Ethnicity.HISPANIC_LATINO,
                "latinx": Ethnicity.HISPANIC_LATINO,
                "native american": Ethnicity.NATIVE_AMERICAN,
                "american indian": Ethnicity.NATIVE_AMERICAN,
                "pacific islander": Ethnicity.PACIFIC_ISLANDER,
                "hawaiian": Ethnicity.PACIFIC_ISLANDER,
                "chinese": Ethnicity.ASIAN_EAST,
                "japanese": Ethnicity.ASIAN_EAST,
                "korean": Ethnicity.ASIAN_EAST,
                "east asian": Ethnicity.ASIAN_EAST,
                "indian": Ethnicity.ASIAN_SOUTH,
                "pakistani": Ethnicity.ASIAN_SOUTH,
                "south asian": Ethnicity.ASIAN_SOUTH,
                "bangladeshi": Ethnicity.ASIAN_SOUTH,
                "vietnamese": Ethnicity.ASIAN_SOUTHEAST,
                "filipino": Ethnicity.ASIAN_SOUTHEAST,
                "southeast asian": Ethnicity.ASIAN_SOUTHEAST,
                "thai": Ethnicity.ASIAN_SOUTHEAST,
                "asian": Ethnicity.ASIAN_EAST,  # Default Asian to East Asian
                "white": Ethnicity.WHITE,
                "caucasian": Ethnicity.WHITE,
                "middle eastern": Ethnicity.MIDDLE_EASTERN,
                "arab": Ethnicity.MIDDLE_EASTERN,
                "multiracial": Ethnicity.MULTIRACIAL,
                "mixed": Ethnicity.MULTIRACIAL,
            }
            context.ethnicity = ethnicity_map.get(ethnicity_str, Ethnicity.PREFER_NOT_TO_SAY)

            # URM detection based on ethnicity
            urm_ethnicities = {
                Ethnicity.AFRICAN_AMERICAN,
                Ethnicity.HISPANIC_LATINO,
                Ethnicity.NATIVE_AMERICAN,
                Ethnicity.PACIFIC_ISLANDER,
            }
            context.is_urm = context.ethnicity in urm_ethnicities or _safe_get(demographics, "urm", default=False)

            # ORM detection (overrepresented in STEM contexts)
            orm_ethnicities = {
                Ethnicity.ASIAN_EAST,
                Ethnicity.ASIAN_SOUTH,
            }
            context.is_orm = context.ethnicity in orm_ethnicities

        # Gender-in-field advantage detection
        intended_major = _safe_get(profile, "intended_major", default="").lower()
        majors = _safe_get(profile, "target_majors", default=[]) or []
        all_majors = " ".join([intended_major] + [str(m).lower() for m in majors])

        # Women in STEM
        stem_keywords = ["computer", "engineering", "physics", "math", "data science", "cs ", "stem"]
        if context.gender == Gender.FEMALE and any(kw in all_majors for kw in stem_keywords):
            context.is_gender_minority_in_field = True
            context.gender_field_advantage = "Woman in STEM - actively recruited"
            context.diversity_angles.append("woman in tech/STEM")

        # Men in female-dominated fields
        female_dominated = ["nursing", "education", "social work", "psychology", "early childhood"]
        if context.gender == Gender.MALE and any(kw in all_majors for kw in female_dominated):
            context.is_gender_minority_in_field = True
            context.gender_field_advantage = "Man in female-dominated field"
            context.diversity_angles.append("gender minority in field")

        # Build diversity narrative hooks
        if context.is_urm:
            context.has_diversity_story = True
            if context.ethnicity == Ethnicity.AFRICAN_AMERICAN:
                context.diversity_angles.append("Black student experience")
            elif context.ethnicity == Ethnicity.HISPANIC_LATINO:
                context.diversity_angles.append("Latino/Hispanic heritage")
            elif context.ethnicity == Ethnicity.NATIVE_AMERICAN:
                context.diversity_angles.append("Indigenous heritage")

        if context.is_first_gen:
            context.has_diversity_story = True
            context.diversity_angles.append("first-generation college student")

        if context.family_context == FamilyContext.IMMIGRANT_FAMILY:
            context.has_diversity_story = True
            context.diversity_angles.append("immigrant family experience")

        # Resource indicators
        programs = _safe_get(profile, "programs", default=[]) or []
        paid_programs = [p for p in programs if _safe_get(p, "cost_tier", default="").upper() in ["HIGH", "PREMIUM"]]
        if paid_programs:
            context.has_summer_program_budget = True
            context.socioeconomic = SocioeconomicBackground.HIGH_RESOURCE
        elif context.needs_financial_aid:
            context.socioeconomic = SocioeconomicBackground.LOW_RESOURCE
            context.has_summer_program_budget = False

        return context

    def extract_execution_signals(self, profile: Dict[str, Any]) -> ExecutionProfile:
        """Extract execution style from profile"""
        execution = ExecutionProfile()

        # Get psychometric data if available
        assessment = _safe_get(profile, "assessment_intelligence", default={})
        psychometrics = _safe_get(assessment, "psychometrics", default={})

        # Activity pattern analysis
        activities = _safe_get(profile, "activities", default=[]) or []
        num_activities = len(activities)
        num_leadership = sum(1 for a in activities if "leader" in str(_safe_get(a, "role", default="")).lower() or
                             "president" in str(_safe_get(a, "role", default="")).lower() or
                             "founder" in str(_safe_get(a, "role", default="")).lower())

        # GPA pattern
        gpa = _safe_get(profile, "gpa", default=0)
        if isinstance(gpa, str):
            try:
                gpa = float(gpa)
            except ValueError:
                gpa = 3.0

        # Score execution styles
        style_scores = {}

        # Type A Achiever
        type_a_score = 0
        if num_activities >= 6:
            type_a_score += 2
        if num_leadership >= 2:
            type_a_score += 2
        if gpa >= 3.8:
            type_a_score += 2
        style_scores[ExecutionArchetype.TYPE_A_ACHIEVER] = type_a_score

        # Perfectionist
        perfectionist_score = 0
        if gpa >= 3.9:
            perfectionist_score += 3
        if num_activities <= 4 and num_activities > 0:
            # Fewer activities but likely deep
            perfectionist_score += 2
        style_scores[ExecutionArchetype.PERFECTIONIST] = perfectionist_score

        # ADHD Hyperfocus
        adhd_score = 0
        # Look for intensity markers
        for act in activities:
            desc = str(_safe_get(act, "description", default="")).lower()
            if any(word in desc for word in ["passion", "obsessed", "deep dive", "immersed"]):
                adhd_score += 1
        style_scores[ExecutionArchetype.ADHD_HYPERFOCUS] = adhd_score

        # Find primary style
        if style_scores:
            sorted_styles = sorted(style_scores.items(), key=lambda x: x[1], reverse=True)
            if sorted_styles[0][1] >= 3:
                execution.primary_style = sorted_styles[0][0]
            else:
                execution.primary_style = ExecutionArchetype.BALANCED_EXECUTOR

        # Extract from personality markers if available
        grit = _safe_get(psychometrics, "grit_resilience", default=0.5)
        if isinstance(grit, (int, float)) and grit >= 0.8:
            execution.stress_response = "rises_up"
            execution.burnout_risk = "low"
        elif isinstance(grit, (int, float)) and grit <= 0.4:
            execution.stress_response = "struggles"
            execution.burnout_risk = "high"

        return execution

    def extract_challenge_signals(self, profile: Dict[str, Any]) -> ChallengeProfile:
        """Extract challenge dimension from profile"""
        challenges_detected = detect_challenges(profile)

        challenge_profile = ChallengeProfile()
        challenge_profile.primary_challenges = [c[0] for c in challenges_detected]
        challenge_profile.challenge_severity = {c[0].value: c[1] for c in challenges_detected}

        # GPA narrative
        gpa = _safe_get(profile, "gpa", default=0)
        if isinstance(gpa, str):
            try:
                gpa = float(gpa)
            except ValueError:
                gpa = 3.5

        if gpa < 3.5:
            challenge_profile.gpa_needs_explanation = True

        # Activity gaps
        activities = _safe_get(profile, "activities", default=[]) or []
        if len(activities) < 3:
            challenge_profile.activity_gaps.append("Limited activity portfolio")
        elif len(activities) > 10:
            challenge_profile.activity_gaps.append("May appear spread thin")

        return challenge_profile

    def extract_timeline_signals(self, profile: Dict[str, Any]) -> TimelineProfile:
        """Extract timeline dimension from profile"""
        timeline = TimelineProfile()

        # Grade level
        grade = _safe_get(profile, "grade", default=11)
        if isinstance(grade, str):
            try:
                grade = int(grade)
            except ValueError:
                grade = 11
        timeline.grade_level = grade

        # Position
        if grade <= 10:
            timeline.position = TimelinePosition.EARLY_HS
            timeline.months_to_application = 24 + (11 - grade) * 12
        elif grade == 11:
            timeline.position = TimelinePosition.MID_HS
            timeline.months_to_application = 12
        else:
            timeline.position = TimelinePosition.LATE_HS
            timeline.months_to_application = 0
            timeline.is_urgent = True
            timeline.urgency_factors.append("Senior year - application season imminent")

        # Can still do things?
        if timeline.months_to_application > 6:
            timeline.can_take_new_tests = True
            timeline.can_add_major_activity = True
            timeline.can_pursue_summer_program = True
        elif timeline.months_to_application > 3:
            timeline.can_take_new_tests = True
            timeline.can_add_major_activity = False
            timeline.can_pursue_summer_program = False
        else:
            timeline.can_take_new_tests = False
            timeline.can_add_major_activity = False
            timeline.can_pursue_summer_program = False

        # Open/closed windows
        if timeline.can_pursue_summer_program:
            timeline.open_windows.append("Summer programs")
        else:
            timeline.closed_windows.append("Summer programs")

        if timeline.can_add_major_activity:
            timeline.open_windows.append("New major activities")
        else:
            timeline.closed_windows.append("New major activities")

        return timeline

    def extract_strengths_weaknesses(self, profile: Dict[str, Any]) -> StrengthsWeaknessesProfile:
        """Extract strengths/weaknesses from profile"""
        sw = StrengthsWeaknessesProfile()

        # Get self-reported strengths
        strengths = _safe_get(profile, "strengths", default=[]) or []
        values = _safe_get(profile, "values", default=[]) or \
                 _safe_get(profile, "core_values", default=[]) or []

        # Map to StrengthType
        strength_keywords = {
            StrengthType.ANALYTICAL: ["analytical", "logical", "problem-solving", "critical thinking"],
            StrengthType.CREATIVE: ["creative", "innovative", "artistic", "imaginative"],
            StrengthType.LEADERSHIP: ["leadership", "leading", "organizing", "managing"],
            StrengthType.COMMUNICATION: ["communication", "speaking", "writing", "articulate"],
            StrengthType.RESILIENCE: ["resilient", "persistent", "grit", "perseverance"],
            StrengthType.CURIOSITY: ["curious", "learning", "exploring", "questioning"],
        }

        all_text = " ".join([str(s).lower() for s in strengths + values])
        for strength_type, keywords in strength_keywords.items():
            if any(kw in all_text for kw in keywords):
                sw.top_strengths.append(strength_type)

        # Get challenges as weaknesses
        challenges = _safe_get(profile, "challenges", default=[]) or []
        weakness_keywords = {
            WeaknessType.TEST_ANXIETY: ["test", "exam", "anxiety"],
            WeaknessType.PROCRASTINATION: ["procrastination", "deadline", "late"],
            WeaknessType.TIME_MANAGEMENT: ["time management", "schedule", "busy"],
            WeaknessType.PUBLIC_SPEAKING: ["public speaking", "presentation", "stage"],
        }

        challenge_text = " ".join([str(c).lower() for c in challenges])
        for weakness_type, keywords in weakness_keywords.items():
            if any(kw in challenge_text for kw in keywords):
                sw.primary_weaknesses.append(weakness_type)

        return sw

    def synthesize(self, profile: Dict[str, Any]) -> MultiDimensionalArchetype:
        """
        Main synthesis method.
        Combines all dimensions into a complete archetype.
        """
        archetype = MultiDimensionalArchetype()

        # Extract all dimensions
        archetype.domain = self.extract_domain_signals(profile)
        archetype.context = self.extract_context_signals(profile)
        archetype.execution = self.extract_execution_signals(profile)
        archetype.challenges = self.extract_challenge_signals(profile)
        archetype.timeline = self.extract_timeline_signals(profile)
        archetype.strengths_weaknesses = self.extract_strengths_weaknesses(profile)

        # Generate archetype ID and label
        domain_label = archetype.domain.primary_domain.value.replace("_", " ").title()
        exec_label = archetype.execution.primary_style.value.replace("_", " ").title()
        archetype.archetype_id = f"{archetype.domain.primary_domain.value}_{archetype.execution.primary_style.value}"
        archetype.archetype_label = f"The {domain_label}"
        archetype.archetype_tagline = f"{exec_label} approach to {domain_label.lower()}"

        # Generate composite code
        archetype.generate_composite_code()

        # Calculate confidence
        archetype.confidence_score = (
            archetype.domain.domain_confidence * 0.4 +
            (0.7 if archetype.execution.primary_style != ExecutionArchetype.BALANCED_EXECUTOR else 0.5) * 0.3 +
            (0.8 if archetype.timeline.position != TimelinePosition.MID_HS else 0.6) * 0.3
        )

        # Set primary strategy family based on execution style
        exec_to_strategy = {
            ExecutionArchetype.TYPE_A_ACHIEVER: StrategyFamily.TYPE_A_EXECUTION,
            ExecutionArchetype.PERFECTIONIST: StrategyFamily.PERFECTIONIST_GUARDRAILS,
            ExecutionArchetype.ADHD_HYPERFOCUS: StrategyFamily.ADHD_FRIENDLY,
            ExecutionArchetype.ANXIETY_DRIVEN: StrategyFamily.ANXIETY_CALMING,
        }
        archetype.primary_strategy_family = exec_to_strategy.get(
            archetype.execution.primary_style,
            StrategyFamily.TYPE_A_EXECUTION
        ).value

        return archetype

    def match_strategies(self, archetype: MultiDimensionalArchetype) -> List[StrategyRecommendation]:
        """
        Match strategies to the synthesized archetype.
        Returns prioritized list of applicable strategies.
        """
        strategies = []

        # Execution-based strategy
        exec_strategy = StrategyRecommendation(
            strategy_family=StrategyFamily(archetype.primary_strategy_family)
        )

        # Customize based on execution style
        if archetype.execution.primary_style == ExecutionArchetype.TYPE_A_ACHIEVER:
            exec_strategy.priority = "high"
            exec_strategy.meeting_cadence = "bi-weekly"
            exec_strategy.accountability_style = "metrics-driven"
            exec_strategy.ec_strategy = "Maximize strategic activities with leadership progression"
            exec_strategy.essay_strategy = "Showcase achievement through specific impact metrics"

        elif archetype.execution.primary_style == ExecutionArchetype.ADHD_HYPERFOCUS:
            exec_strategy.priority = "critical"
            exec_strategy.meeting_cadence = "weekly"
            exec_strategy.accountability_style = "flexible-checkpoints"
            exec_strategy.ec_strategy = "Focus on 2-3 passion-driven activities with deep engagement"
            exec_strategy.essay_strategy = "Lead with passion moments; use vivid, sensory storytelling"
            exec_strategy.applicable_frameworks.append("ADHD-Friendly Task Chunking")
            exec_strategy.applicable_frameworks.append("Hyperfocus Channeling System")

        elif archetype.execution.primary_style == ExecutionArchetype.PERFECTIONIST:
            exec_strategy.priority = "critical"
            exec_strategy.accountability_style = "done-over-perfect"
            exec_strategy.ec_strategy = "Quality over quantity; 4-5 activities with demonstrated excellence"
            exec_strategy.essay_strategy = "Focus on depth and craft; limit revision cycles"
            exec_strategy.applicable_frameworks.append("Anti-Perfectionism Guardrails")
            exec_strategy.applicable_frameworks.append("MVP Essay Approach")

        elif archetype.execution.primary_style == ExecutionArchetype.ANXIETY_DRIVEN:
            exec_strategy.priority = "critical"
            exec_strategy.meeting_cadence = "weekly"
            exec_strategy.accountability_style = "reassurance-heavy"
            exec_strategy.communication_style = "supportive"
            exec_strategy.applicable_frameworks.append("Anxiety Management Protocol")
            exec_strategy.applicable_frameworks.append("Progress Celebration System")

        strategies.append(exec_strategy)

        # Timeline-based strategy
        if archetype.timeline.position == TimelinePosition.LATE_HS:
            timeline_strategy = StrategyRecommendation(
                strategy_family=StrategyFamily.SENIOR_SPRINT,
                priority="critical",
                ec_strategy="Focus on deepening existing activities; no new major commitments",
                essay_strategy="Prioritize main essay; strategic supplemental essays only",
                summer_strategy="N/A - past summer window",
            )
            strategies.append(timeline_strategy)

        elif archetype.timeline.position == TimelinePosition.MID_HS:
            timeline_strategy = StrategyRecommendation(
                strategy_family=StrategyFamily.JUNIOR_FOUNDATION,
                priority="high",
                ec_strategy="Build toward leadership; consider strategic new activities",
                essay_strategy="Start brainstorming; identify key stories",
                summer_strategy="Summer is critical - prioritize impactful programs or projects",
            )
            strategies.append(timeline_strategy)

        # Context-based strategy
        if archetype.context.family_context == FamilyContext.FIRST_GENERATION:
            context_strategy = StrategyRecommendation(
                strategy_family=StrategyFamily.FIRST_GEN_NAVIGATION,
                priority="high",
                essay_strategy="Lean into authentic first-gen narrative; avoid clichés",
            )
            context_strategy.applicable_frameworks.append("First-Gen Essay Framework")
            context_strategy.applicable_frameworks.append("First-Gen College List Strategy")
            strategies.append(context_strategy)

        if archetype.context.socioeconomic == SocioeconomicBackground.LOW_RESOURCE:
            resource_strategy = StrategyRecommendation(
                strategy_family=StrategyFamily.UNDER_RESOURCED_SCRAPPY,
                priority="high",
                summer_strategy="Free/low-cost programs; virtual opportunities; self-directed projects",
                awards_strategy="Focus on competitions with no entry fees; school-based awards",
            )
            resource_strategy.applicable_frameworks.append("No-Cost Opportunity Database")
            resource_strategy.applicable_frameworks.append("DIY Summer Project Guide")
            strategies.append(resource_strategy)

        # Challenge-based strategies
        if ChallengeType.GPA_RECOVERY in archetype.challenges.primary_challenges:
            gpa_strategy = StrategyRecommendation(
                strategy_family=StrategyFamily.GPA_RECOVERY_NARRATIVE,
                priority="high",
                essay_strategy="Address GPA in additional info section; focus on trajectory",
            )
            gpa_strategy.applicable_frameworks.append("GPA Narrative Framework")
            strategies.append(gpa_strategy)

        if ChallengeType.LATE_BLOOMER in archetype.challenges.primary_challenges:
            bloomer_strategy = StrategyRecommendation(
                strategy_family=StrategyFamily.LATE_BLOOMER_ACCELERATION,
                priority="high",
                ec_strategy="Rapid depth building in 1-2 areas; leadership pathway acceleration",
            )
            bloomer_strategy.applicable_frameworks.append("Late Bloomer Acceleration Protocol")
            strategies.append(bloomer_strategy)

        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        strategies.sort(key=lambda s: priority_order.get(s.priority, 2))

        return strategies


# =============================================================================
# FRAMEWORK REGISTRY
# =============================================================================

class FrameworkRegistry:
    """
    Registry of proven frameworks extracted from coaching intelligence.

    Each framework includes:
    - Applicable archetypes (multi-dimensional)
    - Specific tactics and steps
    - Success metrics
    - Example applications
    """

    _frameworks: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def register(cls, framework_id: str, framework_data: Dict[str, Any]) -> None:
        """Register a framework"""
        cls._frameworks[framework_id] = framework_data

    @classmethod
    def get(cls, framework_id: str) -> Optional[Dict[str, Any]]:
        """Get a framework by ID"""
        return cls._frameworks.get(framework_id)

    @classmethod
    def match(cls, archetype: MultiDimensionalArchetype) -> List[Dict[str, Any]]:
        """Find frameworks that match an archetype"""
        matched = []
        for fid, framework in cls._frameworks.items():
            applicability = framework.get("applicable_to", {})

            # Check domain match
            domains = applicability.get("domains", [])
            if domains and archetype.domain.primary_domain.value not in domains:
                continue

            # Check execution match
            exec_styles = applicability.get("execution_styles", [])
            if exec_styles and archetype.execution.primary_style.value not in exec_styles:
                continue

            # Check timeline match
            timelines = applicability.get("timelines", [])
            if timelines and archetype.timeline.position.value not in timelines:
                continue

            matched.append({"id": fid, **framework})

        return matched


# =============================================================================
# SEED FRAMEWORKS FROM COACHING INTELLIGENCE
# =============================================================================

# These would be populated from the 80 frameworks in the coaching document
SEED_FRAMEWORKS = [
    {
        "id": "adhd_task_chunking",
        "name": "ADHD-Friendly Task Chunking",
        "category": "execution",
        "description": "Break large tasks into 25-minute focused sprints with built-in breaks",
        "applicable_to": {
            "execution_styles": ["adhd_hyperfocus", "creative_chaotic", "sprinter"],
        },
        "tactics": [
            "Set timer for 25 minutes",
            "Work on single task only",
            "5-minute break after each sprint",
            "Longer break after 4 sprints",
            "Track completed sprints for motivation",
        ],
    },
    {
        "id": "perfectionist_mvp",
        "name": "Anti-Perfectionism MVP Approach",
        "category": "execution",
        "description": "Produce minimum viable drafts to overcome perfectionism paralysis",
        "applicable_to": {
            "execution_styles": ["perfectionist", "anxiety_driven"],
        },
        "tactics": [
            "Set 'good enough' threshold before starting",
            "First draft is intentionally rough",
            "Limited revision cycles (max 3)",
            "External deadline accountability",
            "Celebrate completion over perfection",
        ],
    },
    {
        "id": "type_a_sprint_system",
        "name": "Type A Sprint Planning",
        "category": "execution",
        "description": "Structured sprint-based planning for high achievers",
        "applicable_to": {
            "execution_styles": ["type_a_achiever", "systematic_planner"],
        },
        "tactics": [
            "Weekly planning session",
            "Priority matrix (urgent vs important)",
            "KPI tracking spreadsheet",
            "Regular progress reviews",
            "Strategic pivots based on metrics",
        ],
    },
    {
        "id": "first_gen_essay",
        "name": "First-Gen Essay Framework",
        "category": "narrative",
        "description": "Authentic storytelling for first-generation students",
        "applicable_to": {
            "contexts": ["first_generation"],
        },
        "tactics": [
            "Lead with specific family moment",
            "Show, don't tell the challenges",
            "Connect to future aspirations",
            "Avoid 'proving yourself' framing",
            "Celebrate heritage while showing growth",
        ],
    },
    {
        "id": "senior_sprint_protocol",
        "name": "Senior Year Sprint Protocol",
        "category": "timeline",
        "description": "Maximize senior year when time is limited",
        "applicable_to": {
            "timelines": ["late_hs"],
        },
        "tactics": [
            "Focus on 3 strategic schools",
            "Perfect 1 main essay, adapt for others",
            "Deepen existing activities only",
            "Early Action strategy",
            "Recommender relationship intensive",
        ],
    },
]

# Register seed frameworks
for framework in SEED_FRAMEWORKS:
    FrameworkRegistry.register(framework["id"], framework)


# =============================================================================
# CONVENIENCE FUNCTION
# =============================================================================

def synthesize_archetype(profile: Dict[str, Any]) -> MultiDimensionalArchetype:
    """
    Convenience function to synthesize a multi-dimensional archetype from a profile.

    Usage:
        archetype = synthesize_archetype(db_profile)
        print(archetype.composite_code)
        print(archetype.primary_strategy_family)
    """
    synthesizer = ConcreteArchetypeSynthesizer()
    return synthesizer.synthesize(profile)


def get_strategies_for_profile(profile: Dict[str, Any]) -> List[StrategyRecommendation]:
    """
    Convenience function to get strategies for a profile.

    Usage:
        strategies = get_strategies_for_profile(db_profile)
        for s in strategies:
            print(f"{s.strategy_family}: {s.priority}")
    """
    synthesizer = ConcreteArchetypeSynthesizer()
    archetype = synthesizer.synthesize(profile)
    return synthesizer.match_strategies(archetype)
