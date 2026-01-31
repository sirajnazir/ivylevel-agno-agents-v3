from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AcademicPlan(BaseModel):
    """
    Output from AcademicAgent.
    Defines the academic rigor and time budget.
    """
    student_id: str = "unknown"
    rigor_index: float = Field(0.0, description="Calculated academic rigor score (0-10)")
    ec_available_hours: int = Field(15, description="Weekly hours available for ECs")
    target_gpa: float = Field(4.0, description="Target GPA")
    sat_strategy: str = Field("Maintained", description="Testing strategy")
    course_load_strategy: str = Field("Balanced", description="Strategy for course selection")
    risk_flags: List[str] = Field(default_factory=list)
