from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from .common import IdentitySeed
from .ec import ECGeneration
from .awards import AwardsOutput
from .programs import ProgramsOutput
from .react import ReactMetadata
from .assessment import NarrativeIdentity

class ActivityStatus(str, Enum):
    """Status of an activity in the game plan."""
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class CommonAppActivity(BaseModel):
    """A single activity slot in the Common App."""
    position: int
    type: str # Extracurricular, Award, etc.
    role: str
    organization: str
    description: str
    status: ActivityStatus = ActivityStatus.PLANNED
    hours_per_week: Optional[float] = None
    weeks_per_year: Optional[int] = None
    grade_levels: List[int] = Field(default_factory=list)

class SchoolDelta(BaseModel):
    """Strategy delta for a specific school."""
    target_school: str
    strategy_note: str
    swapped_position: Optional[int] = None
    swap_with: Optional[str] = None
    required_supplement: str = ""


class GamePlanSummary(BaseModel):
    """Summary statistics for game plan."""
    total_activities: int = Field(default=0)
    total_touchpoints: int = Field(default=0)
    average_roi: float = Field(default=0.0)
    total_awards_matched: int = Field(default=0)
    total_programs_matched: int = Field(default=0)

class Phase(BaseModel):
    """A strategic phase in the game plan."""
    name: str
    duration: str = "" # Made optional/default
    start_date: str = ""
    end_date: str = ""
    focus: str = ""
    milestones: List[str] = Field(default_factory=list)
    activities: List[Dict[str, str]] = Field(default_factory=list, description="Activities active during this phase")

class IdentitySynthesis(BaseModel):
    """Identity synthesis output."""
    archetype: str = ""
    spike: str = ""
    pillars: List[str] = Field(default_factory=list)
    brand_statement: str = ""
    confidence: float = Field(default=0.7)

class MasterGamePlan(BaseModel):
    """Complete orchestrated game plan - matches frontend GamePlanResult."""

    profile_id: str

    # Core narrative
    narrative_dna: str = ""
    hidden_target: Optional[str] = None

    # Activities and seeds
    target_activity_list: List[CommonAppActivity] = Field(default_factory=list, alias="activities")
    identity_seeds: List[IdentitySeed] = Field(default_factory=list)
    phases: List[Phase] = Field(default_factory=list)

    # Identity synthesis (CRITICAL - used by multiple cards)
    identity_synthesis: Optional[IdentitySynthesis] = None
    archetype: Optional[str] = None
    spike: Optional[str] = None
    pillars: Optional[List[str]] = None

    # EC Generation data (for ECAgentCard)
    ec_generation: Optional[ECGeneration] = None

    # Awards data (for AwardsAgentCard)
    awards: Optional[AwardsOutput] = None

    # Programs data (for ProgramsAgentCard)
    programs: Optional[ProgramsOutput] = None
    
    # Opportunities data (for OpportunityAgentCard / Scout)
    opportunities: Optional[Any] = None # Using Any to avoid circular imports if verify fails, but ideally OpportunityBatch

    # Strategic content
    school_strategies: List[SchoolDelta] = Field(default_factory=list)
    strategic_insights: List[str] = Field(default_factory=list)
    portfolio_analysis: Optional[Dict[str, Any]] = None

    # Summary (REQUIRED by GamePlanAgentCard)
    summary: GamePlanSummary = Field(default_factory=GamePlanSummary)
    
    # ReAct Metadata (For Transparency)
    react_metadata: Optional[ReactMetadata] = Field(default=None, alias="_react")
    react_by_agent: Optional[Dict[str, ReactMetadata]] = Field(default=None, alias="_react_by_agent")
    
    # Full Narrative Output
    narrative: Optional[NarrativeIdentity] = None

    class Config:
        populate_by_name = True

