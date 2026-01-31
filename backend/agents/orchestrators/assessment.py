# AssessmentAgent - Tier 1: Orchestrator
# Path: backend/agents/orchestrators/assessment.py
# Role: The Intake Manager
"""
AssessmentAgent (Tier 1: Orchestrator)

The Intake Manager that runs the initial student assessment.
Uses the scoring engine to calculate:
- Ivy+ Ready Score (0-100)
- Category Scores (Aptitude, Passion, Community, Narrative)
- Archetype Detection (ARCH-001 to ARCH-011)
- Helping/Holding Back Factors

This is the FIRST agent in the pipeline. All other agents read its output.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

from agno.agent import Agent
from agno.models.anthropic import Claude

from backend.agents.base import IvyAgent
from backend.agents.schemas import NarrativeIdentity
from backend.agents.utils import transform_profile_for_agent
from backend.tools.scoring.engine import (
    IvyScoreEngine,
    IvyReadyScore,
    CategoryScores,
    SFFARubric,
    ScoreBreakdown,
    calculate_ivy_ready_score,
    calculate_sffa_rubric,
)
from backend.tools.scoring.archetypes import (
    detect_archetype,
    ArchetypeResult,
    get_narrative_formula,
)
from backend.tools.scoring.factors import (
    analyze_helping_factors,
    analyze_holding_back_factors,
    get_complete_analysis,
    Factor,
)

# New Scoring Primitives (TYPE-085, TYPE-086, TYPE-083)
from backend.tools.scoring.rubric_5d import (
    calculate_5d_rubric,
    Rubric5DOutput,
    DimensionScore,
)
from backend.tools.scoring.gap_analyzer import (
    analyze_gaps,
    GapAnalysisOutput,
    GradeLevel,
)
from backend.tools.scoring.potential_detector import (
    detect_potential_indicators,
    PotentialIndicatorOutput,
)


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class ArchetypeOutput(BaseModel):
    """Archetype detection result - V2 Multi-Dimensional"""
    # Legacy fields (backward compatible)
    id: str = Field(..., description="Archetype ID (e.g., SCHOLAR, RESEARCHER)")
    code: str = Field(..., description="Archetype code (e.g., ARCH-001)")
    label: str = Field(..., description="Human-readable label")
    tagline: str = Field(..., description="Tagline for the archetype")
    confidence: int = Field(..., description="Confidence 0-100")
    alternates: List[Dict[str, Any]] = Field(default_factory=list)

    # V2 Multi-Dimensional fields
    composite_code: str = Field(default="", description="V2 composite code (e.g., STEM-RESEARCHER.TYPE-A.MID-HS.HIGH-RESOURCE)")
    domain: Dict[str, Any] = Field(default_factory=dict, description="Domain dimension (WHAT)")
    context: Dict[str, Any] = Field(default_factory=dict, description="Context dimension (WHERE/WHO) - includes gender, ethnicity, URM status")
    execution_style: Dict[str, Any] = Field(default_factory=dict, description="Execution dimension (HOW) - Type A, ADHD, etc.")
    timeline: Dict[str, Any] = Field(default_factory=dict, description="Timeline dimension (WHEN)")
    challenges: Dict[str, Any] = Field(default_factory=dict, description="Challenge dimension (OBSTACLES)")
    diversity_angles: List[str] = Field(default_factory=list, description="Diversity narrative angles")
    strategy_family: str = Field(default="", description="Primary strategy family for coaching")


class FactorOutput(BaseModel):
    """A single helping or holding back factor"""
    id: str
    category: str
    message: str
    priority: int
    improvement_path: Optional[str] = None


class AssessmentOutput(BaseModel):
    """Complete assessment result from AssessmentAgent"""
    # Core Scores
    ivy_plus_score: float = Field(..., description="Ivy+ Ready Score 0-100")
    percentile_rank: float = Field(..., description="Percentile in Ivy applicant pool")

    # Category Breakdown
    category_scores: Dict[str, float] = Field(..., description="Scores by category")

    # SFFA Rubric (Harvard-style)
    sffa_rubric: Dict[str, int] = Field(..., description="1-6 scale ratings")

    # Archetype
    archetype: ArchetypeOutput

    # Factors
    helping_factors: List[FactorOutput]
    holding_back_factors: List[FactorOutput]
    net_position: str = Field(..., description="STRONG, BALANCED, or NEEDS_WORK")

    # Narrative Guidance (Legacy + New)
    narrative_guidance: Optional[Dict[str, Any]] = None
    narrative_identity: Optional[NarrativeIdentity] = None  # New V2 Schema

    # === NEW SCORING PRIMITIVES (TYPE-085, TYPE-086, TYPE-083) ===

    # TYPE-085: Jenny's 5-Dimension Rubric (/50)
    rubric_5d: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Jenny's 5-dimension rubric scoring (Academics, Leadership, Service, Artifacts, Recognition)"
    )

    # TYPE-086: Gap Priority Analysis (P0/P1/P2/P3)
    gap_analysis: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Gap priority analysis with P0-P3 categorization and closing actions"
    )

    # TYPE-083: Potential Indicators (Hidden Strengths, Untapped Opportunities)
    potential_indicators: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Hidden strengths, untapped opportunities, and latent potential signals"
    )

    # Transparancy & Quality
    completeness_score: float = Field(default=1.0, description="Profile completeness 0.0-1.0")
    analysis_notes: List[str] = Field(default_factory=list, description="Notes about data quality or limitations")


# =============================================================================
# ARCHETYPE CODE MAPPING
# =============================================================================

ARCHETYPE_CODES = {
    "SCHOLAR": "ARCH-001",
    "RESEARCHER": "ARCH-002",
    "LEADER": "ARCH-003",
    "ENTREPRENEUR": "ARCH-004",
    "CHANGEMAKER": "ARCH-005",
    "ADVOCATE": "ARCH-006",
    "CREATOR": "ARCH-007",
    "PERFORMER": "ARCH-008",
    "POLYMATH": "ARCH-009",
    "EMERGING": "ARCH-010",
    "EXPLORER": "ARCH-011",
}


# =============================================================================
# ASSESSMENT AGENT
# =============================================================================

class AssessmentAgent(IvyAgent):
    """
    The Intake Manager - First agent in the pipeline.
    
    Tier: 1 (Orchestrator)
    Input: Raw student profile from Supabase
    Output: AssessmentOutput with scores, archetype, and factors
    """
    
    @property
    def agent_id(self) -> str:
        return "orch_assessment"

    @property
    def tier(self) -> int:
        return 1

    def __init__(self, student_profile: Dict[str, Any]):
        super().__init__(student_profile)
        self.engine = IvyScoreEngine()
    
    def get_instructions(self) -> List[str]:
        return [
            "You are the AssessmentAgent, the Intake Manager for IvyLevel.",
            "Your role is to analyze a student's profile and produce a comprehensive assessment.",
            "1. Calculate Scores using the scoring engine.",
            "2. Detect Archetype based on profile signals.",
            "3. Analyze Factors (Helping/Holding Back).",
            "4. Provide Narrative Guidance.",
            "IMPORTANT: Use EXACT calculations from the scoring engine. Never hallucinate scores."
        ]
    
    def get_tools(self) -> List[Any]:
        """Assessment agent uses built-in tools, not LLM function calling"""
        return []
    
    def get_model(self):
        """Use Claude for reasoning about the assessment"""
        return Claude(id="claude-3-5-sonnet-20240620")
    
    def get_description(self) -> str:
        return "The Intake Manager - calculates scores and detects archetypes"
    
    def _calculate_completeness(self, profile: Dict[str, Any]) -> float:
        """
        Calculate a completeness score (0-1) based on key fields.
        """
        key_sections = ["aptitude", "passion", "community"]
        total_points = 0
        earned_points = 0
        
        # Aptitude checks
        apt = profile.get("aptitude", {})
        total_points += 4
        if apt.get("gpa_weighted") or apt.get("gpa_unweighted"): earned_points += 1
        if apt.get("sat_total") or apt.get("act_total"): earned_points += 1
        if apt.get("ap_count"): earned_points += 1
        if apt.get("academic_awards"): earned_points += 1
        
        # Passion checks
        pas = profile.get("passion", {})
        total_points += 4
        if pas.get("leadership_level"): earned_points += 1
        if pas.get("project_impact"): earned_points += 1
        if pas.get("research_level") and pas.get("research_level") != "NONE": earned_points += 1
        if pas.get("ec_commitment_years"): earned_points += 1
        
        # Community checks
        com = profile.get("community", {})
        total_points += 3
        if com.get("service_leadership"): earned_points += 1
        if com.get("service_hours"): earned_points += 1
        if com.get("community_impact"): earned_points += 1

        # Operating checks
        oper = profile.get("operating", {})
        total_points += 2
        if oper.get("favoriteSubject"): earned_points += 1
        if oper.get("strengths") and len(oper.get("strengths", [])) > 0: earned_points += 1
        
        return earned_points / total_points if total_points > 0 else 0.0

    def _generate_narrative_identity(
        self,
        profile: Dict[str, Any],
        archetype_result: ArchetypeResult,
        narrative_guidance: Optional[Dict[str, Any]]
    ) -> NarrativeIdentity:
        """
        Generate NarrativeIdentity using NarrativeAgent (LLM synthesis).

        Falls back to archetype-based placeholder if NarrativeAgent fails.
        This is the SINGLE source of truth for narrative synthesis.
        """
        try:
            # Import here to avoid circular imports
            from backend.agents.specialists.narrative import NarrativeAgent

            # Transform profile to agent-friendly format
            agent_profile = transform_profile_for_agent(profile)

            # Ensure archetype info is in the profile (required by NarrativeAgent)
            agent_profile["archetype"] = archetype_result.id
            agent_profile["id"] = profile.get("id", "assessment")

            # Create and run NarrativeAgent (IvyAgent expects student_profile dict)
            narrative_agent = NarrativeAgent(student_profile=agent_profile)

            # Generate real narrative using LLM
            narrative_identity = narrative_agent.generate_identity()

            # Ensure archetype info is present
            if not narrative_identity.archetype_name:
                narrative_identity.archetype_name = archetype_result.label
            if not narrative_identity.spike:
                narrative_identity.spike = archetype_result.label

            return narrative_identity

        except Exception as e:
            # Log but don't fail - return archetype-based fallback
            print(f"⚠️ NarrativeAgent failed, using archetype fallback: {e}")

            return NarrativeIdentity(
                narrative_dna=f"The {archetype_result.label} who {archetype_result.tagline}",
                confidence_score=archetype_result.confidence / 100.0,
                spike=archetype_result.label,
                archetype_name=archetype_result.label,
                brand_statement=archetype_result.tagline,
                themes=narrative_guidance.get("key_themes", [])[:5] if narrative_guidance else [],
                pillars=[
                    "Intellectual Curiosity",
                    "Community Impact",
                    "Creative Expression",
                    "Leadership"
                ],
                identity_markers=[archetype_result.id]
            )

    def assess(self, profile: Dict[str, Any]) -> AssessmentOutput:
        """
        Run the full assessment on a student profile.
        
        This is a DETERMINISTIC operation - no LLM involved.
        The LLM is only used for generating narrative guidance.
        
        Args:
            profile: Student profile dictionary with aptitude, passion, community, etc.
            
        Returns:
            AssessmentOutput with all scores and analysis
        """
        # 1. Normalize and calculate scores
        score_breakdown = self.engine.calculate(profile)
        
        # 2. Get category scores as dict
        category_dict = {
            "aptitude": score_breakdown.category_scores.aptitude,
            "passion": score_breakdown.category_scores.passion,
            "community": score_breakdown.category_scores.community,
            "narrative": score_breakdown.category_scores.narrative,
        }
        
        # 3. Detect archetype (V2 multi-dimensional)
        archetype_result = detect_archetype(profile, category_dict)
        archetype_code = ARCHETYPE_CODES.get(archetype_result.id, "ARCH-011")

        # Extract V2 multi-dimensional data
        multi_dim = archetype_result.multi_dimensional
        v2_domain = {}
        v2_context = {}
        v2_execution = {}
        v2_timeline = {}
        v2_challenges = {}
        v2_diversity_angles = []
        v2_composite_code = ""
        v2_strategy_family = ""

        if multi_dim:
            v2_composite_code = multi_dim.composite_code
            v2_strategy_family = multi_dim.primary_strategy_family

            v2_domain = {
                "primary": multi_dim.domain.primary_domain.value,
                "secondary": [d.value for d in multi_dim.domain.secondary_domains],
                "has_spike": multi_dim.domain.has_clear_spike,
                "spike_description": multi_dim.domain.spike_description,
            }

            v2_context = {
                "gender": multi_dim.context.gender.value,
                "ethnicity": multi_dim.context.ethnicity.value,
                "is_urm": multi_dim.context.is_urm,
                "is_orm": multi_dim.context.is_orm,
                "is_first_gen": multi_dim.context.is_first_gen,
                "is_international": multi_dim.context.is_international,
                "is_gender_minority_in_field": multi_dim.context.is_gender_minority_in_field,
                "gender_field_advantage": multi_dim.context.gender_field_advantage,
                "has_diversity_story": multi_dim.context.has_diversity_story,
                "school_type": multi_dim.context.school_type.value,
                "socioeconomic": multi_dim.context.socioeconomic.value,
            }

            v2_execution = {
                "primary_style": multi_dim.execution.primary_style.value,
                "stress_response": multi_dim.execution.stress_response,
                "burnout_risk": multi_dim.execution.burnout_risk,
                "deadline_behavior": multi_dim.execution.deadline_behavior,
            }

            v2_timeline = {
                "position": multi_dim.timeline.position.value,
                "grade": multi_dim.timeline.grade_level,
                "months_to_application": multi_dim.timeline.months_to_application,
                "is_urgent": multi_dim.timeline.is_urgent,
                "can_add_major_activity": multi_dim.timeline.can_add_major_activity,
            }

            v2_challenges = {
                "primary": [c.value for c in multi_dim.challenges.primary_challenges],
                "gpa_needs_explanation": multi_dim.challenges.gpa_needs_explanation,
                "activity_gaps": multi_dim.challenges.activity_gaps,
            }

            v2_diversity_angles = multi_dim.context.diversity_angles

        archetype_output = ArchetypeOutput(
            # Legacy fields
            id=archetype_result.id,
            code=archetype_code,
            label=archetype_result.label,
            tagline=archetype_result.tagline,
            confidence=archetype_result.confidence,
            alternates=archetype_result.alternates,
            # V2 fields
            composite_code=v2_composite_code,
            domain=v2_domain,
            context=v2_context,
            execution_style=v2_execution,
            timeline=v2_timeline,
            challenges=v2_challenges,
            diversity_angles=v2_diversity_angles,
            strategy_family=v2_strategy_family,
        )
        
        # 4. Analyze factors
        factor_analysis = get_complete_analysis(profile, category_dict)
        
        helping_outputs = [
            FactorOutput(
                id=f.id,
                category=f.category,
                message=f.message,
                priority=int(f.priority),
            )
            for f in factor_analysis.helping
        ]
        
        holding_outputs = [
            FactorOutput(
                id=f.id,
                category=f.category,
                message=f.message,
                priority=int(f.priority),
                improvement_path=f.improvement_path,
            )
            for f in factor_analysis.holding_back
        ]
        
        # 5. Get SFFA rubric as dict
        sffa_dict = {}
        if score_breakdown.sffa_rubric:
            sffa_dict = {
                "academic": score_breakdown.sffa_rubric.academic_rating,
                "extracurricular": score_breakdown.sffa_rubric.extracurricular_rating,
                "athletic": score_breakdown.sffa_rubric.athletic_rating,
                "personal": score_breakdown.sffa_rubric.personal_rating,
                "overall": score_breakdown.sffa_rubric.overall_rating,
            }

        # =================================================================
        # NEW SCORING PRIMITIVES (TYPE-085, TYPE-086, TYPE-083)
        # =================================================================

        # 5a. TYPE-085: Jenny's 5-Dimension Rubric (/50)
        rubric_5d_output = None
        try:
            rubric_5d_result = calculate_5d_rubric(profile)
            # Use model_dump() to convert Pydantic model to dict
            rubric_5d_output = rubric_5d_result.model_dump()
        except Exception as e:
            print(f"⚠️ TYPE-085 (5D Rubric) failed: {e}")

        # 5b. TYPE-086: Gap Priority Analysis (P0/P1/P2/P3)
        gap_analysis_output = None
        try:
            # Determine grade level from profile
            grade_str = profile.get("demographics", {}).get("grade") or profile.get("grade") or "11"
            grade_map = {"9": GradeLevel.FRESHMAN, "10": GradeLevel.SOPHOMORE, "11": GradeLevel.JUNIOR, "12": GradeLevel.SENIOR}
            grade_level = grade_map.get(str(grade_str), GradeLevel.JUNIOR)

            gap_result = analyze_gaps(profile, grade_level)
            # Use model_dump() to convert Pydantic model to dict
            gap_analysis_output = gap_result.model_dump()
        except Exception as e:
            print(f"⚠️ TYPE-086 (Gap Analysis) failed: {e}")

        # 5c. TYPE-083: Potential Indicators (Hidden Strengths, Untapped Opportunities)
        potential_output = None
        try:
            potential_result = detect_potential_indicators(profile)
            # Use model_dump() to convert Pydantic model to dict
            potential_output = potential_result.model_dump()
        except Exception as e:
            print(f"⚠️ TYPE-083 (Potential Indicators) failed: {e}")
        
        # 6. Get narrative guidance (constant layer - used as fallback)
        narrative_formula = get_narrative_formula(archetype_result.id)
        narrative_guidance = None
        if narrative_formula:
            narrative_guidance = {
                "essay_structure": narrative_formula.essay_structure,
                "key_themes": narrative_formula.key_themes,
                "avoid_themes": narrative_formula.avoid_themes,
                "exemplar_openers": narrative_formula.exemplar_openers,
                "power_words": narrative_formula.power_words,
                "narrative_arc": narrative_formula.narrative_arc,
            }

        # 7. Call NarrativeAgent for REAL LLM synthesis (variable layer)
        # This uses interest_areas, causes, and core_values for meaningful narratives
        narrative_identity = self._generate_narrative_identity(
            profile, archetype_result, narrative_guidance
        )

        # 8. Detect Sparse Profile & Add Notes
        completeness = self._calculate_completeness(profile)
        analysis_notes = []
        
        if completeness < 0.4:
            analysis_notes.append("Note: This assessment is based on a preliminary profile with limited data points.")
            analysis_notes.append("Strategic focus has been shifted toward 'Growth Strategy' and 'Emerging Potential' while we learn more about your background.")
            
            # If extremely sparse, ensure we don't give a "Scholar" or "Leader" with 10% confidence
            if archetype_result.confidence < 30:
                analysis_notes.append("Inference: Your current profile suggests an 'Explorer' path. We will refine this as you add more activities.")
        
        # Add specific missing data recommendations
        if not profile.get("aptitude", {}).get("sat_total") and not profile.get("aptitude", {}).get("act_total"):
            analysis_notes.append("Recommendation: Adding test scores (or marking as Test-Optional) will significantly improve accuracy.")
        
        if not profile.get("passion", {}).get("ec_commitment_years"):
            analysis_notes.append("Recommendation: Detailing your extracurricular involvement will help us identify your unique 'Spike'.")

        return AssessmentOutput(
            ivy_plus_score=round(score_breakdown.ivy_plus_score, 1),
            percentile_rank=round(score_breakdown.percentile_rank, 1),
            category_scores=category_dict,
            sffa_rubric=sffa_dict,
            archetype=archetype_output,
            helping_factors=helping_outputs,
            holding_back_factors=holding_outputs,
            net_position=factor_analysis.net_position,
            narrative_guidance=narrative_guidance,
            narrative_identity=narrative_identity,
            # New scoring primitives
            rubric_5d=rubric_5d_output,
            gap_analysis=gap_analysis_output,
            potential_indicators=potential_output,
            completeness_score=completeness,
            analysis_notes=analysis_notes
        )
    
    def run(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for the agent.
        
        Args:
            profile: Raw student profile
            
        Returns:
            Assessment result as dictionary
        """
        result = self.assess(profile)
        return result.model_dump()
    
    def get_score_summary(self, profile: Dict[str, Any]) -> str:
        """
        Get a human-readable score summary for display.
        """
        result = self.assess(profile)

        # Build diversity info if present
        diversity_info = ""
        if result.archetype.diversity_angles:
            diversity_info = f"\n🌍 Diversity Angles: {', '.join(result.archetype.diversity_angles)}"

        return f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 IVY+ READY ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Ivy+ Score: {result.ivy_plus_score}/100
📈 Percentile: Top {100 - result.percentile_rank:.0f}% of Ivy applicants

📚 Category Breakdown:
   Aptitude:  {result.category_scores['aptitude']:.0f}%
   Passion:   {result.category_scores['passion']:.0f}%
   Community: {result.category_scores['community']:.0f}%
   Narrative: {result.category_scores['narrative']:.0f}%

🧬 Archetype: {result.archetype.label} ({result.archetype.code})
   "{result.archetype.tagline}"
   Confidence: {result.archetype.confidence}%
   Composite: {result.archetype.composite_code}
   Strategy: {result.archetype.strategy_family}{diversity_info}

✅ Helping Factors: {len(result.helping_factors)}
⚠️  Holding Back: {len(result.holding_back_factors)}
📍 Position: {result.net_position}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""


# =============================================================================
# FACTORY FUNCTION (for registry)
# =============================================================================

def create_assessment_agent(student_profile: Dict[str, Any]) -> AssessmentAgent:
    """Factory function for the agent registry"""
    return AssessmentAgent(student_profile)
