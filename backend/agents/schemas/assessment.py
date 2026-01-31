from typing import List, Optional
from pydantic import BaseModel, Field
from .react import ReactMetadata

class NarrativeIdentity(BaseModel):
    """Narrative Identity output from Assessment Agent."""
    brand_statement: str = Field(..., description="Core brand statement")
    narrative_dna: str = Field(..., description="Core narrative DNA string")
    confidence_score: float = Field(default=0.7, ge=0.0, le=1.0, description="Synthesis confidence")
    spike: str = Field(default="", description="Student spike/focus area")
    archetype_name: str = Field(default="", description="Detected archetype name")
    pillars: List[str] = Field(default_factory=list, description="4 identity pillars")
    identity_markers: List[str] = Field(default_factory=list, description="Key identity markers")
    
    # Missing Fields Required by Agent
    themes: List[str] = Field(default_factory=list, description="3-5 key themes")
    identity_seeds: List[str] = Field(default_factory=list, description="Essay hooks")

    # Legacy compatibility
    archetype_alignment: Optional[str] = Field(default=None, description="Deprecated - use archetype_name")

    # ReAct Metadata
    react_metadata: Optional[ReactMetadata] = Field(default=None, alias="_react")

    class Config:
        populate_by_name = True
