"""
Profile V2 Pydantic Models
Matches TypeScript types and database schema exactly.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# =============================================================================
# TARGET SCHOOLS
# =============================================================================

class TargetSchools(BaseModel):
    dream: List[str] = Field(default_factory=list)
    reach: List[str] = Field(default_factory=list)
    target: List[str] = Field(default_factory=list)
    safety: List[str] = Field(default_factory=list)


# =============================================================================
# IDENTITY SYNTHESIS
# =============================================================================

class Archetype(BaseModel):
    id: str
    name: str
    confidence: float = Field(ge=0.0, le=1.0)
    description: Optional[str] = None


class PillarDetail(BaseModel):
    score: float = Field(ge=0.0, le=10.0)
    evidence: List[str] = Field(default_factory=list)
    narrative_hook: Optional[str] = None


class FourPillars(BaseModel):
    identity: PillarDetail
    aptitude: PillarDetail
    passion: PillarDetail
    service: PillarDetail


class IdentitySynthesis(BaseModel):
    archetype: Archetype
    spike: str
    pillars: FourPillars
    brand_statement: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    _source: Optional[str] = None
    _source_agent: Optional[str] = None
    _updated_at: Optional[str] = None


# =============================================================================
# PORTFOLIO ITEMS
# =============================================================================

class ActivityItem(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    category: Literal['academic', 'athletic', 'arts', 'community', 'work', 'family', 'other']
    role: str
    role_level: Literal['founder', 'president', 'leader', 'member', 'participant']
    hours_per_week: int = Field(ge=0, le=40)
    weeks_per_year: int = Field(ge=0, le=52)
    years_active: List[int] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    impact_description: Optional[str] = None
    is_spike_activity: bool = False
    _source: Optional[Literal['user', 'agent']] = None


class AwardItem(BaseModel):
    id: Optional[str] = None
    name: str
    organization: str
    level: Literal['international', 'national', 'state', 'regional', 'school']
    year_received: int
    description: Optional[str] = None
    _source: Optional[Literal['user', 'agent']] = None


class ProgramItem(BaseModel):
    id: Optional[str] = None
    name: str
    organization: str
    type: Literal['summer', 'research', 'internship', 'online', 'competition']
    year: int
    duration_weeks: Optional[int] = None
    selectivity: Optional[Literal['highly_selective', 'selective', 'competitive', 'open']] = None
    description: Optional[str] = None
    _source: Optional[Literal['user', 'agent']] = None


class CourseItem(BaseModel):
    name: str
    type: Literal['AP', 'IB', 'Honors', 'DE', 'Regular']
    subject: str
    grade: Optional[str] = None
    year: int


# =============================================================================
# ASSESSMENT PRIMITIVES
# =============================================================================

class Interest(BaseModel):
    area: str
    level: Literal['curious', 'engaged', 'passionate', 'expert']
    related_activities: List[str] = Field(default_factory=list)


class Value(BaseModel):
    value: str
    importance: int = Field(ge=1, le=5)
    example: Optional[str] = None


class Goals(BaseModel):
    short_term: List[str] = Field(default_factory=list)
    medium_term: List[str] = Field(default_factory=list)
    long_term: List[str] = Field(default_factory=list)
    dream_outcome: Optional[str] = None


# =============================================================================
# AGENT WORKSPACES
# =============================================================================

class AgentWorkspace(BaseModel):
    last_run: Optional[str] = None
    output: Optional[Dict[str, Any]] = None
    quality_score: Optional[float] = None
    error: Optional[str] = None


class AgentOutputs(BaseModel):
    assessment: Optional[AgentWorkspace] = None
    ec: Optional[AgentWorkspace] = None
    awards: Optional[AgentWorkspace] = None
    programs: Optional[AgentWorkspace] = None
    gameplan: Optional[AgentWorkspace] = None

    class Config:
        extra = "allow"  # Allow additional agent namespaces


# =============================================================================
# MAIN PROFILE MODEL
# =============================================================================

class ProfileV2(BaseModel):
    """
    Complete profile model matching database schema.
    All fields optional except id, user_id, first_name.
    """
    # Identity (Required)
    id: str
    user_id: str
    first_name: str
    created_at: datetime

    # Basic Info (Optional)
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    grade: Optional[int] = Field(None, ge=9, le=12)
    graduation_year: Optional[int] = Field(None, ge=2024, le=2032)
    school_name: Optional[str] = None
    school_type: Optional[Literal['public', 'private', 'charter', 'homeschool', 'international']] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = "USA"

    # Academic (Optional)
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    gpa_scale: Optional[float] = 4.0
    gpa_weighted: Optional[float] = None
    sat_score: Optional[int] = Field(None, ge=400, le=1600)
    act_score: Optional[int] = Field(None, ge=1, le=36)
    class_rank: Optional[int] = None
    class_size: Optional[int] = None

    # Targets
    target_schools: Optional[TargetSchools] = Field(default_factory=TargetSchools)
    target_majors: Optional[List[str]] = Field(default_factory=list)

    # Identity Synthesis
    identity_synthesis: Optional[IdentitySynthesis] = None

    # Portfolio
    activities: Optional[List[ActivityItem]] = Field(default_factory=list)
    awards: Optional[List[AwardItem]] = Field(default_factory=list)
    programs: Optional[List[ProgramItem]] = Field(default_factory=list)
    courses: Optional[List[CourseItem]] = Field(default_factory=list)

    # Assessment Primitives
    interests: Optional[List[Interest]] = Field(default_factory=list)
    values: Optional[List[Value]] = Field(default_factory=list)
    goals: Optional[Goals] = None
    strengths: Optional[List[str]] = Field(default_factory=list)
    challenges: Optional[List[str]] = Field(default_factory=list)

    # Four Pillars
    four_pillars: Optional[FourPillars] = None

    # Agent Workspaces
    agent_outputs: Optional[AgentOutputs] = Field(default_factory=AgentOutputs)

    # Computed Scores
    ivy_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    narrative_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    portfolio_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    readiness_level: Optional[Literal['emerging', 'developing', 'competitive', 'exceptional']] = None

    # Metadata
    updated_at: Optional[datetime] = None
    assessment_completed_at: Optional[datetime] = None
    onboarding_step: int = 0
    onboarding_completed: bool = False

    class Config:
        populate_by_name = True


# =============================================================================
# PROFILE UPDATE MODEL (for PATCH requests)
# =============================================================================

class ProfileUpdate(BaseModel):
    """For partial updates - all fields optional."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    grade: Optional[int] = Field(None, ge=9, le=12)
    graduation_year: Optional[int] = Field(None, ge=2024, le=2032)
    school_name: Optional[str] = None
    school_type: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    gpa_scale: Optional[float] = None
    gpa_weighted: Optional[float] = None
    sat_score: Optional[int] = Field(None, ge=400, le=1600)
    act_score: Optional[int] = Field(None, ge=1, le=36)
    class_rank: Optional[int] = None
    class_size: Optional[int] = None
    target_schools: Optional[TargetSchools] = None
    target_majors: Optional[List[str]] = None
    identity_synthesis: Optional[IdentitySynthesis] = None
    activities: Optional[List[ActivityItem]] = None
    awards: Optional[List[AwardItem]] = None
    programs: Optional[List[ProgramItem]] = None
    courses: Optional[List[CourseItem]] = None
    interests: Optional[List[Interest]] = None
    values: Optional[List[Value]] = None
    goals: Optional[Goals] = None
    strengths: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    four_pillars: Optional[FourPillars] = None
    ivy_score: Optional[float] = None
    narrative_score: Optional[float] = None
    portfolio_score: Optional[float] = None
    readiness_level: Optional[str] = None
    assessment_completed_at: Optional[datetime] = None
    onboarding_step: Optional[int] = None
    onboarding_completed: Optional[bool] = None

    class Config:
        extra = "forbid"
