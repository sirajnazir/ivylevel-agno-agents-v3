
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .react import ReactMetadata
from .common import IdentitySeed

class PillarDetail(BaseModel):
    """Detailed pillar extraction."""
    demographics: str = ""
    cultural_religious: str = ""
    personality: str = ""
    circumstances: str = ""
    specific_experiences: List[str] = Field(default_factory=list)

class FourPillars(BaseModel):
    """The 4 pillars framework for identity synthesis."""
    identity: str = Field(default="", description="IDENTITY pillar - who they ARE")
    aptitude: str = Field(default="", description="APTITUDE pillar - what they're GOOD at")
    passion: str = Field(default="", description="PASSION pillar - what they LOVE")
    service: str = Field(default="", description="SERVICE pillar - what they want to CHANGE")

    # Optional detailed extraction
    identity_detail: Optional[PillarDetail] = None
    aptitude_detail: Optional[Dict[str, Any]] = None
    passion_detail: Optional[Dict[str, Any]] = None
    service_detail: Optional[Dict[str, Any]] = None

class ActivityRecommendation(BaseModel):
    """A recommended extracurricular activity."""
    name: str
    activity_type: str = Field(default="project")
    description: str = ""
    category: str = ""
    touchpoints: int = Field(default=0)
    tier: str = Field(default="")

class ECGeneration(BaseModel):
    """EC Generation output - used by ECAgentCard."""
    recommended_activities: List[ActivityRecommendation] = Field(default_factory=list)
    four_pillars: FourPillars = Field(default_factory=FourPillars)
    seeds: List[IdentitySeed] = Field(default_factory=list)
    react_metadata: Optional[ReactMetadata] = Field(default=None, alias="_react")

    class Config:
        populate_by_name = True

# Aliases for backward compatibility / GamePlan usage
class ECActivity(ActivityRecommendation):
    """Alias for ActivityRecommendation."""
    role_level: str = "Member" # Default if missing
    hours_per_week: float = 0.0
    weeks_per_year: int = 0

class ECPortfolioOutput(ECGeneration):
    """Wrapper that maps ECGeneration to Portfolio keys."""
    activities: List[ECActivity] = Field(default_factory=list, alias="recommended_activities")
    founder_count: int = 0
    stem_heavy_swap: Optional[ECActivity] = None

    class Config:
        populate_by_name = True

