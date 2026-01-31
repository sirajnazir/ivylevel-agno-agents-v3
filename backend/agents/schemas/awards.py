from .react import ReactMetadata
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AwardMatch(BaseModel):
    """A matched award with full scoring data."""
    # Identity fields
    id: str = Field(default="", alias="award_id")
    name: str
    organization: str = Field(default="")

    # Classification
    category: str = Field(default="")
    tier: str = Field(default="national", description="national|regional|local")
    strategic_tier: str = Field(default="target", description="reach|target|safety")

    # Scoring (CRITICAL for dashboard)
    win_probability: float = Field(default=0.3, cast_to=float, ge=0.0, le=1.0)
    fit_score: float = Field(default=0.5, ge=0.0, le=1.0)
    roi_score: float = Field(default=0.5, ge=0.0, le=1.0)
    prestige_score: float = Field(default=0.5, ge=0.0, le=1.0)
    archetype_fit: float = Field(default=0.5, ge=0.0, le=1.0)

    # Metadata
    deadline: Optional[str] = None
    effort_hours: int = Field(default=10, ge=0)
    strategic_value: str = Field(default="")
    description: str = Field(default="")
    fit_reasons: List[str] = Field(default_factory=list)
    
    # Intelligence Fields (from Enriched Data)
    success_patterns: List[str] = Field(default_factory=list, description="Specific tactics for winning")
    common_mistakes: List[str] = Field(default_factory=list, description="Pitfalls to avoid")
    win_cascade: Optional[Dict[str, Any]] = Field(default=None, description="Prerequisites and next steps")
    differentiation_factor: str = Field(default="", description="Competitive edge")
    historical_win_rate: float = Field(default=0.0)

class AwardPortfolio(BaseModel):
    """2-2-1 Portfolio structure (2 reach, 2 target, 1 safety)."""
    reach: List[AwardMatch] = Field(default_factory=list)
    target: List[AwardMatch] = Field(default_factory=list)
    safety: List[AwardMatch] = Field(default_factory=list)

    # Legacy naming support (frontend checks both)
    likely: Optional[List[AwardMatch]] = None  # Alias for reach
    stretch: Optional[List[AwardMatch]] = None  # Alias for safety

    portfolio_balance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    expected_wins: float = Field(default=0.0)

class AwardsOutput(BaseModel):
    """Complete awards agent output."""
    portfolio: AwardPortfolio = Field(default_factory=AwardPortfolio)
    matches: List[AwardMatch] = Field(default_factory=list)
    top_recommendations: List[AwardMatch] = Field(default_factory=list)
    strategic_insights: List[str] = Field(default_factory=list)
    summary: dict = Field(default_factory=lambda: {
        "total_awards_matched": 0,
        "expected_wins": 0.0,
        "strategy": "2-2-1"
    })
    react_metadata: Optional[ReactMetadata] = Field(default=None, alias="_react")

    class Config:
        populate_by_name = True

class RecommendationItem(BaseModel):
    """Legacy/Generic recommendation item (compatibility)."""
    name: str
    description: str
    impact_level: str
    timeline: Optional[str] = None
    difficulty: Optional[str] = None
    rationale: str = ""

