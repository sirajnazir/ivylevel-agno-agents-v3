# ECAgent v7.1 - Tier 2: Specialist
# Path: backend/agents/specialists/ec.py
# Role: The Builder (Projects & Spikes)
"""
ECAgent (Tier 2: Specialist) - v7.1

The Builder that generates EC recommendations with MODE ROUTING.

MODES:
- planning: Generate full 10-slot portfolio (used by GamePlanAgent)
- execution: Provide tactical advice for specific tasks (used by ExecutionAgent)

CONSTRAINTS (v7.1):
- Minimum 2 Founder-level activities
- Average impact score > 7.0
- Web connectivity score > 0.6
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum

from backend.agents.base import IvyAgent
from backend.agents.schemas import ECActivity, ECPortfolioOutput
from backend.agents.logic import (
    calculate_activity_impact,
    calculate_web_connectivity,
    validate_ec_portfolio,
)
from backend.tools.scoring.engine import IvyScoreEngine


# =============================================================================
# LEGACY OUTPUT MODELS (for backward compatibility)
# =============================================================================

class ProjectCategory(str, Enum):
    PASSION = "PASSION"
    COMMUNITY = "COMMUNITY"
    APTITUDE = "APTITUDE"


class DifficultyLevel(str, Enum):
    EASY = "EASY"
    MODERATE = "MODERATE"
    AMBITIOUS = "AMBITIOUS"


class TimeCommitment(BaseModel):
    hours_per_week: int
    duration_months: int
    total_hours: int


class ProjectOption(BaseModel):
    id: str
    name: str
    description: str
    category: ProjectCategory
    difficulty: DifficultyLevel
    time_commitment: TimeCommitment
    predicted_boost: int
    boost_breakdown: Dict[str, int] = Field(default_factory=dict)
    steps: List[str] = Field(default_factory=list)
    resources_needed: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    archetype_alignment: str
    spike_alignment: str
    is_valid: bool = Field(default=True)
    invalid_reason: Optional[str] = None


class ECRecommendationOutput(BaseModel):
    """Legacy 3-option output (backward compatibility)"""
    student_id: str
    current_score: float
    options: List[ProjectOption] = Field(..., min_length=3, max_length=3)
    stem_heavy_swap: Optional[ProjectOption] = None
    recommended_option_id: str
    recommendation_reason: str
    archetype: str
    gaps_addressed: List[str]


# =============================================================================
# PROJECT TEMPLATES BY ARCHETYPE
# =============================================================================

PROJECT_TEMPLATES = {
    "SCHOLAR": [
        {
            "name": "Independent Research Paper",
            "role_level": "Founder",
            "category": "APTITUDE",
            "difficulty": "AMBITIOUS",
            "hours_per_week": 8,
            "weeks_per_year": 24,
            "description": "Conducted independent research and published paper in academic journal",
        },
        {
            "name": "Academic Tutoring Program",
            "role_level": "Founder",
            "category": "COMMUNITY",
            "difficulty": "MODERATE",
            "hours_per_week": 5,
            "weeks_per_year": 40,
            "description": "Founded free tutoring program serving 50+ underserved students",
        },
        {
            "name": "Science Olympiad Team Captain",
            "role_level": "Leadership",
            "category": "APTITUDE",
            "difficulty": "MODERATE",
            "hours_per_week": 6,
            "weeks_per_year": 30,
            "description": "Led team to regional finals, mentored 15 members",
        },
        {
            "name": "Academic Decathlon Competitor",
            "role_level": "Participation",
            "category": "APTITUDE",
            "difficulty": "MODERATE",
            "hours_per_week": 4,
            "weeks_per_year": 20,
            "description": "Competed in state-level academic competition",
        },
        {
            "name": "Math Club President",
            "role_level": "Leadership",
            "category": "PASSION",
            "difficulty": "EASY",
            "hours_per_week": 3,
            "weeks_per_year": 36,
            "description": "Organized weekly problem-solving sessions for 30+ members",
        },
        {
            "name": "Peer Mentoring Program",
            "role_level": "Leadership",
            "category": "COMMUNITY",
            "difficulty": "MODERATE",
            "hours_per_week": 4,
            "weeks_per_year": 36,
            "description": "Mentored 10 underclassmen in academic planning and study skills",
        },
        {
            "name": "School Newspaper Editor",
            "role_level": "Leadership",
            "category": "PASSION",
            "difficulty": "MODERATE",
            "hours_per_week": 5,
            "weeks_per_year": 36,
            "description": "Edited monthly publication, managed team of 12 writers",
        },
        {
            "name": "Debate Team Member",
            "role_level": "Participation",
            "category": "APTITUDE",
            "difficulty": "MODERATE",
            "hours_per_week": 5,
            "weeks_per_year": 28,
            "description": "Competed in regional tournaments, researched policy topics",
        },
        {
            "name": "Library Volunteer",
            "role_level": "Participation",
            "category": "COMMUNITY",
            "difficulty": "EASY",
            "hours_per_week": 3,
            "weeks_per_year": 40,
            "description": "Assisted with literacy programs and book organization",
        },
        {
            "name": "Academic Honor Society",
            "role_level": "Participation",
            "category": "APTITUDE",
            "difficulty": "EASY",
            "hours_per_week": 2,
            "weeks_per_year": 36,
            "description": "Maintained 4.0 GPA, participated in community service",
        },
    ],
    "RESEARCHER": [
        {
            "name": "University Lab Research Position",
            "role_level": "Founder",
            "category": "PASSION",
            "difficulty": "AMBITIOUS",
            "hours_per_week": 12,
            "weeks_per_year": 30,
            "description": "Led independent research project resulting in conference presentation",
        },
        {
            "name": "Science Fair Project (National Level)",
            "role_level": "Founder",
            "category": "APTITUDE",
            "difficulty": "AMBITIOUS",
            "hours_per_week": 10,
            "weeks_per_year": 32,
            "description": "Developed novel research project, advanced to national competition",
        },
        # Add 8 more...
    ],
    # Add other archetypes...
}

# Simplified - use SCHOLAR as default for all archetypes for now
DEFAULT_TEMPLATES = PROJECT_TEMPLATES["SCHOLAR"]


# =============================================================================
# EC AGENT v7.1
# =============================================================================

class ECAgent(IvyAgent):
    """
    The Builder - Generates EC recommendations with mode routing.
    
    Tier: 2 (Specialist)
    Modes: planning (10-slot portfolio) | execution (tactical advice)
    """
    
    @property
    def agent_id(self) -> str:
        return "spec_ec"
    
    @property
    def tier(self) -> int:
        return 2
    
    def __init__(self, student_id_or_profile):
        if isinstance(student_id_or_profile, str):
            profile = {"id": student_id_or_profile}
        else:
            profile = student_id_or_profile
        super().__init__(profile)
        self.engine = IvyScoreEngine()
    
    def get_instructions(self) -> List[str]:
        return [
            "You are the EC Agent (The Builder) for IvyLevel.",
            "Your role is to generate EC project recommendations.",
            "",
            "CONSTRAINTS (v7.1):",
            "1. Minimum 2 Founder-level activities",
            "2. Average impact score > 7.0",
            "3. Web connectivity score > 0.6",
        ]
    
    def run(self, message: str = "", mode: str = "planning", context: dict = {}) -> Dict[str, Any]:
        """
        MODE ROUTING:
        - planning: Generate full 10-slot portfolio
        - execution: Provide tactical advice for current task
        """
        if mode == "planning":
            return self.run_planning_mode(context)
        else:
            return self.run_execution_mode(message, context)
    
    def run_planning_mode(self, context: dict) -> Dict[str, Any]:
        """
        PLANNING MODE: Generate full 10-slot EC portfolio.
        
        Returns ECPortfolioOutput with:
        - 10 activities
        - Analytics (avg_impact, founder_count, web_score)
        - STEM swap
        - Validation results
        """
        profile = context.get("profile", self.profile)
        assessment = context.get("assessment", {})
        
        # Get archetype
        archetype_data = assessment.get("archetype", {})
        if isinstance(archetype_data, dict):
            archetype_id = archetype_data.get("id", "SCHOLAR")
        else:
            archetype_id = archetype_data or "SCHOLAR"
        
        # Get templates
        templates = PROJECT_TEMPLATES.get(archetype_id, DEFAULT_TEMPLATES)
        
        # Build 10 activities
        activities = []
        for i, template in enumerate(templates[:10]):
            # Calculate impact score
            impact_score = calculate_activity_impact(template)
            
            activity = ECActivity(
                name=template["name"],
                role_level=template["role_level"],
                impact_score=impact_score,
                web_connections=[],  # Will calculate after all activities created
                description=template["description"],
                hours_per_week=template["hours_per_week"],
                weeks_per_year=template["weeks_per_year"],
                category=template["category"],
            )
            activities.append(activity)
        
        # Calculate web connectivity
        activity_dicts = [a.model_dump() for a in activities]
        web_score = calculate_web_connectivity(activity_dicts)
        
        # Calculate analytics
        impact_scores = [a.impact_score for a in activities]
        avg_impact = sum(impact_scores) / len(impact_scores) if impact_scores else 0
        founder_count = sum(1 for a in activities if "founder" in a.role_level.lower())
        
        # Validate
        validation = validate_ec_portfolio(activity_dicts)
        
        # Create STEM swap (use first template as example)
        stem_swap = ECActivity(
            name="AI/ML Research Project",
            role_level="Founder",
            impact_score=10.0,
            web_connections=[],
            description="Developed machine learning model with 95% accuracy, published findings",
            hours_per_week=12,
            weeks_per_year=30,
            category="APTITUDE",
        )
        
        portfolio = ECPortfolioOutput(
            student_id=self.student_id,
            activities=activities,
            average_impact_score=avg_impact,
            founder_count=founder_count,
            web_connectivity_score=web_score,
            stem_heavy_swap=stem_swap,
            is_valid=validation["is_valid"],
            validation_notes=validation["violations"],
        )
        
        return portfolio.model_dump()
    
    def run_execution_mode(self, message: str, context: dict) -> Dict[str, Any]:
        """
        EXECUTION MODE: Provide tactical advice for current task.
        
        Args:
            message: User's progress update or question
            context: Dict with current_project, status, etc.
            
        Returns:
            Dict with advice, next_steps, resources
        """
        current_project = context.get("current_project", "your project")
        
        # Build agent with execution instructions
        self.instructions = [
            f"CONTEXT: Student is executing '{current_project}'.",
            "MISSION: Provide specific, tactical advice to unblock them.",
            "1. Identify the blocker",
            "2. Provide 3 concrete next steps",
            "3. Suggest resources or templates",
            "4. Keep it actionable and brief",
        ]
        
        # Use LLM for execution coaching
        agent = self.build()
        response = agent.run(message)
        
        return {
            "mode": "execution",
            "project": current_project,
            "advice": response.content,
        }
    
    # Legacy method for backward compatibility
    def generate_recommendations(
        self,
        profile: Dict[str, Any],
        assessment: Dict[str, Any],
    ) -> ECRecommendationOutput:
        """Legacy 3-option output (backward compatibility)"""
        # Use existing implementation from original file
        # This maintains backward compatibility with test_huda.py
        from backend.agents.specialists.ec import ECAgent as LegacyECAgent
        legacy_agent = LegacyECAgent(self.student_id)
        return legacy_agent.generate_recommendations(profile, assessment)


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def create_ec_agent(student_id: str) -> ECAgent:
    """Factory function for the agent registry"""
    return ECAgent(student_id)
