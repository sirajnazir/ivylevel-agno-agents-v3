from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from .react import ReactMetadata

class ProgramRecommendation(BaseModel):
    """A recommended program/opportunity."""
    name: str
    organization: str = ""
    fit_score: float = Field(default=0.5, ge=0.0, le=1.0)
    type: str = Field(default="summer", description="summer|research|internship|online")
    application_deadline: Optional[str] = Field(default=None, alias="deadline")
    description: str = ""
    selectivity: float = Field(default=0.5)
    strategic_tier: str = Field(default="target")
    
    # Intelligence Fields (from Enriched Data)
    success_patterns: List[str] = Field(default_factory=list)
    common_mistakes: List[str] = Field(default_factory=list)
    hidden_value: List[str] = Field(default_factory=list)
    synergies: Optional[Dict[str, List[str]]] = Field(default=None)
    differentiation_factor: str = Field(default="")
    acceptance_rate: float = Field(default=0.0)

class OpportunityAlert(BaseModel):
    """An upcoming deadline alert."""
    id: str = ""
    opportunity_name: str
    deadline: str  # ISO date
    months_remaining: int = Field(ge=0)
    urgency: str = Field(default="medium", description="critical|high|medium|low")
    action_required: str = ""

class ProgramsOutput(BaseModel):
    """Complete programs agent output."""
    recommended_programs: List[ProgramRecommendation] = Field(default_factory=list, alias="top_recommendations")
    stem_heavy_swap: Optional[ProgramRecommendation] = None
    advance_alerts: List[OpportunityAlert] = Field(default_factory=list)
    synergy_recommendations: List[str] = Field(default_factory=list)
    strategic_insights: List[str] = Field(default_factory=list)
    summary: dict = Field(default_factory=lambda: {"total_programs_matched": 0})
    react_metadata: Optional[ReactMetadata] = Field(default=None, alias="_react")

    class Config:
        populate_by_name = True
