from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

class CycleSummary(BaseModel):
    """One complete THINK -> ACT -> OBSERVE -> LEARN cycle"""
    iteration: int
    phases: Dict[str, Any] = Field(default_factory=lambda: {
        "THINK": {"thought": "", "timestamp": ""},
        "ACT": {"action": "", "timestamp": ""},
        "OBSERVE": {"observation": "", "quality_score": 0.0, "timestamp": ""},
        "LEARN": {"correction": "", "timestamp": ""}  # Optional
    })

class ReactMetadata(BaseModel):
    """ReAct reasoning metadata for agent transparency"""
    agent_name: str
    version: str = "1.0"
    cycles_executed: int = Field(default=1, ge=0)
    quality_score: float = Field(default=0.7, ge=0.0, le=1.0)
    final_state: Literal["success", "partial", "failed"] = "success"
    cycle_summary: List[CycleSummary] = Field(default_factory=list)
