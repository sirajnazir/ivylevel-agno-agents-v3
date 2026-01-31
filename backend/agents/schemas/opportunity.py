from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ScoutedOpportunity(BaseModel):
    """
    A specific opportunity identified by the Scout.
    """
    id: str = ""
    name: str
    organization: str = ""
    description: str = ""
    type: str = Field(default="program", description="program|competition|grant|internship")
    category: str = Field(default="general")
    
    # Fit & Match
    match_tier: int = Field(default=2, description="1=Perfect Match (Must Apply), 2=Strong Fit, 3=Reach")
    why_fit: str = ""
    fit_score: float = 0.0
    
    # Logistics
    deadline: Optional[str] = None
    fee: Optional[float] = None
    url: str = ""

class OpportunityBatch(BaseModel):
    """Output from OpportunityAgent."""
    tier_1_matches: List[ScoutedOpportunity] = Field(default_factory=list)
    tier_2_matches: List[ScoutedOpportunity] = Field(default_factory=list)
    tier_3_matches: List[ScoutedOpportunity] = Field(default_factory=list)
    
    search_metadata: Dict[str, Any] = Field(default_factory=dict)
