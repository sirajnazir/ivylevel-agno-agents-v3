from typing import Optional, Literal
from pydantic import BaseModel, Field

class QualityThresholds(BaseModel):
    """Quality gate thresholds."""
    min_quality: float = 0.7
    min_voice: float = 0.6
    min_golden: float = 0.8
    max_cycles: int = 5

class AgentHealth(BaseModel):
    """Health check response - matches frontend useAgentV13Health."""
    status: Literal["healthy", "degraded", "unavailable"] = "healthy"
    version: str = "1.0.0"
    react_enabled: bool = False
    memory_enabled: bool = False
    hitl_enabled: bool = False
    latency: int = Field(default=0, description="Latency in ms")
    thresholds: Optional[QualityThresholds] = Field(default_factory=QualityThresholds)
