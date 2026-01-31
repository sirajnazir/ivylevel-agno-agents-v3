"""
Multi-Dimensional Archetype System V2
=====================================

PRINCIPLE: Archetypes are NOT one-dimensional categories.
A student's true archetype is the INTERSECTION of multiple dimensions:

    ARCHETYPE = f(
        Domain Focus,          # WHAT they do (interest/area)
        Context,              # WHERE/WHO they are (personal/school/socioeconomic)
        Execution Style,      # HOW they operate (Type A, B, neurodiverse)
        Challenge Profile,    # WHAT obstacles they face
        Timeline Position,    # WHEN they are in their journey
        Strengths/Weaknesses  # Internal resource map
    )

This multi-dimensional approach enables:
1. Personalized strategy matching to proven frameworks
2. Execution system customization (Type A vs ADHD vs perfectionist)
3. Timeline-aware gameplan generation
4. Context-sensitive EC/program/award recommendations
5. Challenge-specific coaching and intervention

USAGE:
    profile = MultiDimensionalProfile.from_assessment(db_profile)
    archetype = ArchetypeEngine.synthesize(profile)
    strategies = StrategyMatcher.match(archetype)
"""

from typing import Dict, List, Optional, Any, Literal, Set
from pydantic import BaseModel, Field
from enum import Enum
from abc import ABC, abstractmethod


# =============================================================================
# DIMENSION 1: DOMAIN FOCUS (The "What")
# =============================================================================

class DomainFocus(str, Enum):
    """Primary intellectual/activity domain"""
    # STEM Track
    STEM_RESEARCHER = "stem_researcher"           # Lab research, publications
    TECH_BUILDER = "tech_builder"                 # Apps, projects, technical artifacts
    SCIENTIFIC_MIND = "scientific_mind"           # Pure science passion
    ENGINEERING_MAKER = "engineering_maker"       # Physical builds, hardware

    # Humanities Track
    HUMANITIES_SCHOLAR = "humanities_scholar"     # Literature, philosophy, history
    SOCIAL_SCIENTIST = "social_scientist"         # Psychology, sociology, anthro
    POLICY_WONK = "policy_wonk"                   # Gov, policy, politics

    # Arts Track
    CREATIVE_ARTIST = "creative_artist"           # Visual arts, design
    PERFORMING_ARTIST = "performing_artist"       # Music, theater, dance
    DIGITAL_CREATOR = "digital_creator"           # Film, media, content

    # Impact Track
    SOCIAL_ENTREPRENEUR = "social_entrepreneur"   # Ventures for change
    COMMUNITY_BUILDER = "community_builder"       # Orgs, movements
    ADVOCATE_ACTIVIST = "advocate_activist"       # Causes, campaigns

    # Athletics Track
    RECRUITED_ATHLETE = "recruited_athlete"       # D1/D3 recruitment pathway
    ATHLETIC_SCHOLAR = "athletic_scholar"         # Sports + academics balance

    # Business Track
    BUSINESS_FOUNDER = "business_founder"         # Startups, ventures
    BUSINESS_LEADER = "business_leader"           # Corporate track, consulting

    # Emerging/Explorer
    EXPLORER = "explorer"                         # Still discovering
    MULTI_HYPHENATE = "multi_hyphenate"          # Intentionally spanning domains


class DomainProfile(BaseModel):
    """Domain dimension of the archetype"""
    primary_domain: DomainFocus = Field(default=DomainFocus.EXPLORER)
    secondary_domains: List[DomainFocus] = Field(default_factory=list)
    domain_confidence: float = Field(default=0.5, ge=0.0, le=1.0)

    # Spike detection
    has_clear_spike: bool = Field(default=False)
    spike_description: str = Field(default="")
    spike_evidence: List[str] = Field(default_factory=list)

    # Domain depth signals
    years_of_focus: int = Field(default=0)
    national_level_in_domain: bool = Field(default=False)
    has_publications: bool = Field(default=False)
    has_awards_in_domain: bool = Field(default=False)


# =============================================================================
# DIMENSION 2: CONTEXT (The "Where/Who")
# =============================================================================

class SchoolType(str, Enum):
    """Type of high school environment"""
    ELITE_PRIVATE = "elite_private"               # Prep schools, top private
    COMPETITIVE_PUBLIC = "competitive_public"     # Magnet, specialized public
    SUBURBAN_PUBLIC = "suburban_public"           # Well-resourced public
    URBAN_PUBLIC = "urban_public"                 # Urban district school
    RURAL_PUBLIC = "rural_public"                 # Rural/small town
    INTERNATIONAL = "international"               # International schools
    HOMESCHOOL = "homeschool"                     # Homeschooled
    CHARTER = "charter"                           # Charter schools


class SocioeconomicBackground(str, Enum):
    """Socioeconomic context"""
    HIGH_RESOURCE = "high_resource"               # Affluent, full resources
    MEDIUM_RESOURCE = "medium_resource"           # Middle class, some limits
    LOW_RESOURCE = "low_resource"                 # Limited resources
    UNDER_RESOURCED = "under_resourced"           # Significant barriers


class FamilyContext(str, Enum):
    """Family educational context"""
    LEGACY_ELITE = "legacy_elite"                 # Parents attended elite schools
    COLLEGE_EDUCATED = "college_educated"         # Parents have degrees
    SOME_COLLEGE = "some_college"                 # Some college in family
    FIRST_GENERATION = "first_generation"         # First in family to college
    IMMIGRANT_FAMILY = "immigrant_family"         # Recent immigrant background


class GeographicContext(str, Enum):
    """Geographic positioning"""
    MAJOR_METRO = "major_metro"                   # NYC, LA, SF, etc.
    SECONDARY_CITY = "secondary_city"             # Denver, Austin, etc.
    SUBURBAN = "suburban"                         # Suburban areas
    RURAL = "rural"                               # Rural areas
    INTERNATIONAL = "international"               # Outside US


class Gender(str, Enum):
    """Gender identity - affects strategy in certain fields"""
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Ethnicity(str, Enum):
    """Ethnicity categories aligned with Common App"""
    # URM Categories (Underrepresented Minorities)
    AFRICAN_AMERICAN = "african_american"         # Black/African American
    HISPANIC_LATINO = "hispanic_latino"           # Hispanic/Latino
    NATIVE_AMERICAN = "native_american"           # American Indian/Alaska Native
    PACIFIC_ISLANDER = "pacific_islander"         # Native Hawaiian/Pacific Islander

    # Non-URM Categories
    ASIAN_EAST = "asian_east"                     # Chinese, Japanese, Korean
    ASIAN_SOUTH = "asian_south"                   # Indian, Pakistani, Bangladeshi
    ASIAN_SOUTHEAST = "asian_southeast"           # Vietnamese, Filipino, Thai
    WHITE = "white"                               # White/Caucasian
    MIDDLE_EASTERN = "middle_eastern"             # Middle Eastern/North African

    # Mixed/Other
    MULTIRACIAL = "multiracial"                   # Two or more races
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class ContextProfile(BaseModel):
    """Contextual dimension of the archetype"""
    school_type: SchoolType = Field(default=SchoolType.SUBURBAN_PUBLIC)
    socioeconomic: SocioeconomicBackground = Field(default=SocioeconomicBackground.MEDIUM_RESOURCE)
    family_context: FamilyContext = Field(default=FamilyContext.COLLEGE_EDUCATED)
    geographic: GeographicContext = Field(default=GeographicContext.SUBURBAN)

    # Identity demographics
    gender: Gender = Field(default=Gender.PREFER_NOT_TO_SAY)
    ethnicity: Ethnicity = Field(default=Ethnicity.PREFER_NOT_TO_SAY)
    ethnicities: List[Ethnicity] = Field(default_factory=list)  # For multiracial

    # Demographic hooks (strategic advantages)
    is_urm: bool = Field(default=False)                         # Underrepresented minority
    is_orm: bool = Field(default=False)                         # Overrepresented minority (Asian in STEM)
    is_international: bool = Field(default=False)
    is_first_gen: bool = Field(default=False)
    needs_financial_aid: bool = Field(default=False)

    # Gender-in-field hooks
    is_gender_minority_in_field: bool = Field(default=False)    # e.g., Woman in CS, Man in Nursing
    gender_field_advantage: str = Field(default="")             # Description of advantage

    # Access signals
    has_counselor_access: bool = Field(default=True)
    has_private_counselor: bool = Field(default=False)
    has_test_prep_access: bool = Field(default=True)
    has_summer_program_budget: bool = Field(default=True)

    # Opportunity modifiers
    school_offers_ap: bool = Field(default=True)
    school_offers_research: bool = Field(default=False)
    school_has_college_pipeline: bool = Field(default=False)

    # Narrative context
    has_compelling_background_story: bool = Field(default=False)
    background_narrative_hooks: List[str] = Field(default_factory=list)

    # Diversity essay potential
    has_diversity_story: bool = Field(default=False)
    diversity_angles: List[str] = Field(default_factory=list)   # e.g., ["immigrant experience", "first-gen struggles"]


# =============================================================================
# DIMENSION 3: EXECUTION STYLE (The "How")
# =============================================================================

class ExecutionArchetype(str, Enum):
    """How the student operates and executes"""
    # High-structure types
    TYPE_A_ACHIEVER = "type_a_achiever"           # Highly organized, driven, competitive
    PERFECTIONIST = "perfectionist"               # Quality-obsessed, high standards
    SYSTEMATIC_PLANNER = "systematic_planner"     # Process-oriented, methodical

    # Adaptive types
    BALANCED_EXECUTOR = "balanced_executor"       # Flexible, pragmatic
    INTUITIVE_PERFORMER = "intuitive_performer"   # Goes with flow, improvises

    # Neurodiverse patterns
    ADHD_HYPERFOCUS = "adhd_hyperfocus"          # Bursts of intense focus, needs variety
    CREATIVE_CHAOTIC = "creative_chaotic"        # Non-linear, creative process
    ANXIETY_DRIVEN = "anxiety_driven"            # Stress-motivated, needs reassurance

    # Collaborative types
    TEAM_DEPENDENT = "team_dependent"            # Works best with others
    LONE_WOLF = "lone_wolf"                      # Independent operator
    LEADER_COORDINATOR = "leader_coordinator"    # Drives through others

    # Energy patterns
    SPRINTER = "sprinter"                        # Short intense bursts
    MARATHONER = "marathoner"                    # Steady consistent effort
    PROCRASTINATOR_CLUTCH = "procrastinator_clutch"  # Last-minute excellence


class ExecutionProfile(BaseModel):
    """Execution style dimension of the archetype"""
    primary_style: ExecutionArchetype = Field(default=ExecutionArchetype.BALANCED_EXECUTOR)
    secondary_styles: List[ExecutionArchetype] = Field(default_factory=list)

    # Work patterns
    best_work_time: Literal["morning", "afternoon", "evening", "night", "varies"] = "varies"
    attention_span_category: Literal["short", "medium", "long", "hyperfocus"] = "medium"
    deadline_behavior: Literal["early", "on_time", "last_minute", "variable"] = "on_time"

    # Stress response
    stress_response: Literal["rises_up", "maintains", "struggles", "avoids"] = "maintains"
    needs_external_accountability: bool = Field(default=True)
    needs_detailed_checklists: bool = Field(default=False)

    # Learning style
    learning_preference: Literal["reading", "visual", "hands_on", "discussion", "mixed"] = "mixed"
    feedback_preference: Literal["direct", "gentle", "written", "verbal"] = "direct"

    # Energy management
    recharge_method: Literal["alone", "social", "active", "rest", "creative"] = "alone"
    burnout_risk: Literal["low", "medium", "high"] = "medium"

    # Motivation patterns
    motivated_by: List[str] = Field(default_factory=lambda: ["achievement"])
    demotivated_by: List[str] = Field(default_factory=lambda: ["boredom"])


# =============================================================================
# DIMENSION 4: CHALLENGE PROFILE (The "Obstacles")
# =============================================================================

class ChallengeType(str, Enum):
    """Types of challenges a student faces"""
    # Academic challenges
    GPA_RECOVERY = "gpa_recovery"                 # Needs to explain/recover GPA
    TEST_SCORE_GAP = "test_score_gap"            # Scores don't match performance
    RIGOR_GAP = "rigor_gap"                      # Limited AP/honors access
    TRANSCRIPT_INCONSISTENCY = "transcript_inconsistency"  # Up/down pattern

    # Activity challenges
    LATE_BLOOMER = "late_bloomer"                # Started activities late
    DEPTH_NOT_BREADTH = "depth_not_breadth"      # Few activities, deep focus
    BREADTH_NOT_DEPTH = "breadth_not_depth"      # Many activities, spread thin
    NO_STANDOUT_ACTIVITY = "no_standout_activity"  # Nothing clearly exceptional

    # Personal challenges
    HEALTH_INTERRUPTION = "health_interruption"   # Medical issues affected performance
    FAMILY_CIRCUMSTANCES = "family_circumstances"  # Family situation impacted trajectory
    FINANCIAL_CONSTRAINTS = "financial_constraints"  # Couldn't afford opportunities
    SCHOOL_CHANGE = "school_change"               # Changed schools during HS

    # Narrative challenges
    COMMON_STORY = "common_story"                 # Profile looks like many others
    PRIVILEGE_PERCEPTION = "privilege_perception"  # May seem too advantaged
    OVERCOMMITMENT = "overcommitment"             # Spread too thin

    # Timeline challenges
    SENIOR_CRUNCH = "senior_crunch"               # Little time left
    JUNIOR_CATCHUP = "junior_catchup"             # Behind peers in positioning


class ChallengeProfile(BaseModel):
    """Challenge dimension of the archetype"""
    primary_challenges: List[ChallengeType] = Field(default_factory=list)
    challenge_severity: Dict[str, Literal["minor", "moderate", "major"]] = Field(default_factory=dict)

    # Academic gaps
    gpa_needs_explanation: bool = Field(default=False)
    gpa_story: str = Field(default="")
    test_optional_advantage: bool = Field(default=False)

    # Activity gaps
    activity_gaps: List[str] = Field(default_factory=list)
    gap_mitigation_strategy: str = Field(default="")

    # Personal context
    has_hardship_story: bool = Field(default=False)
    hardship_can_be_asset: bool = Field(default=False)

    # Narrative framing
    challenges_as_opportunities: List[Dict[str, str]] = Field(default_factory=list)


# =============================================================================
# DIMENSION 5: TIMELINE POSITION (The "When")
# =============================================================================

class TimelinePosition(str, Enum):
    """Where the student is in their journey"""
    EARLY_HS = "early_hs"                         # Freshman/Sophomore
    MID_HS = "mid_hs"                             # Junior (building phase)
    LATE_HS = "late_hs"                           # Senior (execution phase)
    GAP_YEAR = "gap_year"                         # Taking gap year
    TRANSFER = "transfer"                         # Transferring from another college


class ApplicationPhase(str, Enum):
    """Where in the application cycle"""
    PLANNING = "planning"                         # 1+ years out
    BUILDING = "building"                         # Actively building profile
    POLISHING = "polishing"                       # Finalizing before apps
    APPLYING = "applying"                         # In application season
    WAITLIST = "waitlist"                         # Managing waitlist
    COMMITTED = "committed"                       # Decision made


class TimelineProfile(BaseModel):
    """Timeline dimension of the archetype"""
    position: TimelinePosition = Field(default=TimelinePosition.MID_HS)
    application_phase: ApplicationPhase = Field(default=ApplicationPhase.BUILDING)

    # Time constraints
    grade_level: int = Field(default=11, ge=9, le=12)
    months_to_application: int = Field(default=12)
    months_to_early_deadline: int = Field(default=6)

    # Season considerations
    current_season: Literal["fall", "winter", "spring", "summer"] = "fall"
    is_summer_available: bool = Field(default=True)

    # Runway analysis
    can_take_new_tests: bool = Field(default=True)
    can_add_major_activity: bool = Field(default=True)
    can_pursue_summer_program: bool = Field(default=True)
    can_get_new_recommendation: bool = Field(default=True)

    # Urgency flags
    is_urgent: bool = Field(default=False)
    urgency_factors: List[str] = Field(default_factory=list)

    # Strategic windows
    open_windows: List[str] = Field(default_factory=list)
    closed_windows: List[str] = Field(default_factory=list)


# =============================================================================
# DIMENSION 6: STRENGTHS & WEAKNESSES (The "Internal Resources")
# =============================================================================

class StrengthType(str, Enum):
    """Types of strengths"""
    # Cognitive
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    VERBAL = "verbal"
    QUANTITATIVE = "quantitative"
    SYSTEMS_THINKING = "systems_thinking"

    # Interpersonal
    COMMUNICATION = "communication"
    LEADERSHIP = "leadership"
    COLLABORATION = "collaboration"
    EMPATHY = "empathy"
    NETWORKING = "networking"

    # Execution
    DISCIPLINE = "discipline"
    RESILIENCE = "resilience"
    ADAPTABILITY = "adaptability"
    INITIATIVE = "initiative"
    FOCUS = "focus"

    # Character
    AUTHENTICITY = "authenticity"
    CURIOSITY = "curiosity"
    PERSEVERANCE = "perseverance"
    OPTIMISM = "optimism"
    INTEGRITY = "integrity"


class WeaknessType(str, Enum):
    """Types of weaknesses"""
    # Cognitive
    TEST_ANXIETY = "test_anxiety"
    WRITTEN_EXPRESSION = "written_expression"
    VERBAL_EXPRESSION = "verbal_expression"
    ATTENTION_ISSUES = "attention_issues"
    MATH_STRUGGLES = "math_struggles"

    # Interpersonal
    PUBLIC_SPEAKING = "public_speaking"
    INTERVIEW_ANXIETY = "interview_anxiety"
    CONFLICT_AVOIDANCE = "conflict_avoidance"
    DELEGATION_DIFFICULTY = "delegation_difficulty"

    # Execution
    PROCRASTINATION = "procrastination"
    PERFECTIONISM_PARALYSIS = "perfectionism_paralysis"
    OVERCOMMITMENT = "overcommitment"
    FOLLOW_THROUGH = "follow_through"
    TIME_MANAGEMENT = "time_management"

    # Emotional
    SELF_DOUBT = "self_doubt"
    IMPOSTOR_SYNDROME = "impostor_syndrome"
    COMPARISON_TRAP = "comparison_trap"
    BURNOUT_PRONE = "burnout_prone"


class StrengthsWeaknessesProfile(BaseModel):
    """Strengths/Weaknesses dimension"""
    top_strengths: List[StrengthType] = Field(default_factory=list)
    strength_evidence: Dict[str, List[str]] = Field(default_factory=dict)

    primary_weaknesses: List[WeaknessType] = Field(default_factory=list)
    weakness_mitigation: Dict[str, str] = Field(default_factory=dict)

    # Personality markers
    mbti_type: Optional[str] = Field(default=None)
    big_five_profile: Dict[str, float] = Field(default_factory=dict)

    # Self-awareness
    self_awareness_level: Literal["low", "moderate", "high"] = "moderate"
    growth_areas_identified: List[str] = Field(default_factory=list)

    # Support system
    has_mentor: bool = Field(default=False)
    has_peer_support: bool = Field(default=True)
    has_family_support: bool = Field(default=True)


# =============================================================================
# COMPOSITE: MULTI-DIMENSIONAL ARCHETYPE
# =============================================================================

class MultiDimensionalArchetype(BaseModel):
    """
    The complete multi-dimensional archetype.
    This is the PRIMARY output of the archetype detection system.
    """
    # Core identification
    archetype_id: str = Field(default="")
    archetype_label: str = Field(default="")
    archetype_tagline: str = Field(default="")

    # The six dimensions
    domain: DomainProfile = Field(default_factory=DomainProfile)
    context: ContextProfile = Field(default_factory=ContextProfile)
    execution: ExecutionProfile = Field(default_factory=ExecutionProfile)
    challenges: ChallengeProfile = Field(default_factory=ChallengeProfile)
    timeline: TimelineProfile = Field(default_factory=TimelineProfile)
    strengths_weaknesses: StrengthsWeaknessesProfile = Field(default_factory=StrengthsWeaknessesProfile)

    # Synthesis
    composite_code: str = Field(default="")  # e.g., "STEM-RESEARCHER.TYPE-A.SENIOR.HIGH-RESOURCE"
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)

    # Strategic implications
    primary_strategy_family: str = Field(default="")  # Maps to strategy set
    recommended_frameworks: List[str] = Field(default_factory=list)

    # Narrative implications
    narrative_arc: str = Field(default="")
    essay_approach: str = Field(default="")

    # Alternate archetypes
    alternate_archetypes: List[Dict[str, Any]] = Field(default_factory=list)

    def generate_composite_code(self) -> str:
        """Generate a composite code from all dimensions"""
        parts = [
            self.domain.primary_domain.value.upper().replace("_", "-"),
            self.execution.primary_style.value.upper().replace("_", "-"),
            self.timeline.position.value.upper().replace("_", "-"),
            self.context.socioeconomic.value.upper().replace("_", "-"),
        ]
        self.composite_code = ".".join(parts)
        return self.composite_code


# =============================================================================
# STRATEGY MATCHING FRAMEWORK
# =============================================================================

class StrategyFamily(str, Enum):
    """Families of strategies that match to archetypes"""
    # Execution strategies
    TYPE_A_EXECUTION = "type_a_execution"         # High structure, checklist-driven
    ADHD_FRIENDLY = "adhd_friendly"               # Variable structure, engagement-based
    PERFECTIONIST_GUARDRAILS = "perfectionist_guardrails"  # Anti-paralysis, done > perfect
    ANXIETY_CALMING = "anxiety_calming"           # Reassurance-heavy, incremental

    # Timeline strategies
    SENIOR_SPRINT = "senior_sprint"               # Maximize limited time
    JUNIOR_FOUNDATION = "junior_foundation"       # Build systematically
    SOPHOMORE_EXPLORATION = "sophomore_exploration"  # Try things, find spike

    # Context strategies
    RESOURCE_RICH_OPTIMIZATION = "resource_rich_optimization"  # Leverage all resources
    UNDER_RESOURCED_SCRAPPY = "under_resourced_scrappy"  # Creative alternatives
    FIRST_GEN_NAVIGATION = "first_gen_navigation"  # Extra guidance needed

    # Challenge strategies
    GPA_RECOVERY_NARRATIVE = "gpa_recovery_narrative"  # Explain and overcome
    LATE_BLOOMER_ACCELERATION = "late_bloomer_acceleration"  # Fast-track depth
    COMMON_PROFILE_DIFFERENTIATION = "common_profile_differentiation"  # Stand out


class StrategyRecommendation(BaseModel):
    """A strategy recommendation based on archetype"""
    strategy_family: StrategyFamily
    priority: Literal["critical", "high", "medium", "low"] = "medium"

    # Specific recommendations
    ec_strategy: str = Field(default="")
    essay_strategy: str = Field(default="")
    testing_strategy: str = Field(default="")
    summer_strategy: str = Field(default="")
    awards_strategy: str = Field(default="")

    # Execution customization
    meeting_cadence: str = Field(default="weekly")
    accountability_style: str = Field(default="standard")
    communication_style: str = Field(default="balanced")

    # Specific frameworks to apply
    applicable_frameworks: List[str] = Field(default_factory=list)


# =============================================================================
# ARCHETYPE SYNTHESIS ENGINE (Abstract Base)
# =============================================================================

class ArchetypeSynthesizer(ABC):
    """
    Abstract base class for archetype synthesis.

    Implementations should:
    1. Extract signals from profile data
    2. Score across all dimensions
    3. Synthesize into a MultiDimensionalArchetype
    4. Match to appropriate strategies
    """

    @abstractmethod
    def extract_domain_signals(self, profile: Dict[str, Any]) -> DomainProfile:
        """Extract domain dimension from profile"""
        pass

    @abstractmethod
    def extract_context_signals(self, profile: Dict[str, Any]) -> ContextProfile:
        """Extract context dimension from profile"""
        pass

    @abstractmethod
    def extract_execution_signals(self, profile: Dict[str, Any]) -> ExecutionProfile:
        """Extract execution style from profile"""
        pass

    @abstractmethod
    def extract_challenge_signals(self, profile: Dict[str, Any]) -> ChallengeProfile:
        """Extract challenge dimension from profile"""
        pass

    @abstractmethod
    def extract_timeline_signals(self, profile: Dict[str, Any]) -> TimelineProfile:
        """Extract timeline dimension from profile"""
        pass

    @abstractmethod
    def extract_strengths_weaknesses(self, profile: Dict[str, Any]) -> StrengthsWeaknessesProfile:
        """Extract strengths/weaknesses from profile"""
        pass

    @abstractmethod
    def synthesize(self, profile: Dict[str, Any]) -> MultiDimensionalArchetype:
        """
        Main synthesis method.
        Combines all dimensions into a complete archetype.
        """
        pass

    @abstractmethod
    def match_strategies(self, archetype: MultiDimensionalArchetype) -> List[StrategyRecommendation]:
        """
        Match strategies to the synthesized archetype.
        Returns prioritized list of applicable strategies.
        """
        pass


# =============================================================================
# LEGACY COMPATIBILITY
# =============================================================================

# Map legacy single-dimension archetypes to new multi-dimensional system
LEGACY_TO_MULTI_DIMENSIONAL_MAP = {
    "SCHOLAR": {
        "domain": DomainFocus.SCIENTIFIC_MIND,
        "execution": ExecutionArchetype.SYSTEMATIC_PLANNER,
    },
    "RESEARCHER": {
        "domain": DomainFocus.STEM_RESEARCHER,
        "execution": ExecutionArchetype.SYSTEMATIC_PLANNER,
    },
    "LEADER": {
        "domain": DomainFocus.COMMUNITY_BUILDER,
        "execution": ExecutionArchetype.LEADER_COORDINATOR,
    },
    "ENTREPRENEUR": {
        "domain": DomainFocus.BUSINESS_FOUNDER,
        "execution": ExecutionArchetype.TYPE_A_ACHIEVER,
    },
    "CHANGEMAKER": {
        "domain": DomainFocus.ADVOCATE_ACTIVIST,
        "execution": ExecutionArchetype.BALANCED_EXECUTOR,
    },
    "ADVOCATE": {
        "domain": DomainFocus.ADVOCATE_ACTIVIST,
        "execution": ExecutionArchetype.TEAM_DEPENDENT,
    },
    "CREATOR": {
        "domain": DomainFocus.TECH_BUILDER,
        "execution": ExecutionArchetype.CREATIVE_CHAOTIC,
    },
    "PERFORMER": {
        "domain": DomainFocus.PERFORMING_ARTIST,
        "execution": ExecutionArchetype.INTUITIVE_PERFORMER,
    },
    "POLYMATH": {
        "domain": DomainFocus.MULTI_HYPHENATE,
        "execution": ExecutionArchetype.BALANCED_EXECUTOR,
    },
    "EMERGING": {
        "domain": DomainFocus.EXPLORER,
        "execution": ExecutionArchetype.BALANCED_EXECUTOR,
    },
    "EXPLORER": {
        "domain": DomainFocus.EXPLORER,
        "execution": ExecutionArchetype.INTUITIVE_PERFORMER,
    },
}


def upgrade_legacy_archetype(legacy_id: str, profile: Dict[str, Any]) -> MultiDimensionalArchetype:
    """
    Upgrade a legacy single-dimension archetype to multi-dimensional.

    This allows backward compatibility while enabling
    the full power of the new system.
    """
    legacy_map = LEGACY_TO_MULTI_DIMENSIONAL_MAP.get(legacy_id, {})

    # Create base archetype
    archetype = MultiDimensionalArchetype(
        archetype_id=legacy_id,
        archetype_label=f"The {legacy_id.title()}",
    )

    # Set domain from legacy
    if "domain" in legacy_map:
        archetype.domain.primary_domain = legacy_map["domain"]

    # Set execution from legacy
    if "execution" in legacy_map:
        archetype.execution.primary_style = legacy_map["execution"]

    # Extract timeline from profile
    grade = profile.get("grade", 11)
    if grade <= 10:
        archetype.timeline.position = TimelinePosition.EARLY_HS
    elif grade == 11:
        archetype.timeline.position = TimelinePosition.MID_HS
    else:
        archetype.timeline.position = TimelinePosition.LATE_HS
    archetype.timeline.grade_level = grade

    # Generate composite code
    archetype.generate_composite_code()

    return archetype
