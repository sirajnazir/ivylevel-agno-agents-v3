from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class ExecutionDebtScore(BaseModel):
    """Execution Debt Score output."""
    score: float = Field(default=0.0, ge=0.0, le=100.0, alias="execution_debt_score")
    status: Literal["healthy", "at_risk", "critical"] = Field(default="healthy")
    contributing_factors: List[str] = Field(default_factory=list, alias="factors")
    trend: Literal["improving", "stable", "declining"] = Field(default="stable")

    # Thresholds (from Jenny techniques)
    threshold_healthy: float = Field(default=50.0)
    threshold_at_risk: float = Field(default=100.0)

class Blocker(BaseModel):
    """A detected blocker/obstacle."""
    id: str = ""
    type: str
    description: str
    severity: Literal["high", "medium", "low"] = "medium"
    resolution_steps: List[str] = Field(default_factory=list)

class BlockersOutput(BaseModel):
    """Blockers endpoint output."""
    blockers: List[Blocker] = Field(default_factory=list)
