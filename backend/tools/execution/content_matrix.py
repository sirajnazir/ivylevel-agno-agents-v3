# IvyLevel Content Recycling Matrix v1.0
# LAYER: Execution (TYPE-025)
"""
Content Recycling Matrix - Essay and Narrative Reuse Optimization.

Implements TYPE-025: Strategic content management for maximizing
essay and narrative touchpoint reuse across applications.

Framework: Content Asset Management
1. CORE NARRATIVES: Foundational stories (3-5 per student)
2. TOUCHPOINTS: Specific applications (awards, programs, colleges)
3. ADAPTATIONS: How core content maps to each touchpoint

Key Principles:
- Core narratives should be developed once, adapted many times
- "Why this award/program" sections are unique per touchpoint
- Impact metrics and quotes can be recycled across applications
- Coherence > completeness - don't contradict yourself across apps

Architecture:
- Standalone module - no dependencies on other scoring primitives
- Produces ContentMatrix for Execution Agent essay planning
- Tracks content reuse to minimize redundant writing
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


# =============================================================================
# ENUMS
# =============================================================================

class ContentType(str, Enum):
    """Type of content asset."""
    PERSONAL_NARRATIVE = "personal_narrative"  # Core identity story
    ACTIVITY_DESCRIPTION = "activity_description"  # Activity deep-dive
    IMPACT_STORY = "impact_story"  # Specific impact with metrics
    CHALLENGE_OVERCOME = "challenge_overcome"  # Adversity narrative
    FUTURE_VISION = "future_vision"  # Goals and aspirations
    WHY_INTEREST = "why_interest"  # "Why this field" essay
    COMMUNITY_CONTRIBUTION = "community_contribution"  # Service/leadership
    INTELLECTUAL_CURIOSITY = "intellectual_curiosity"  # Academic passion
    UNIQUE_PERSPECTIVE = "unique_perspective"  # Diversity angle


class TouchpointType(str, Enum):
    """Type of application touchpoint."""
    COLLEGE_APP = "college_app"  # College application essay
    SCHOLARSHIP = "scholarship"  # Scholarship application
    AWARD = "award"  # Award application
    PROGRAM = "program"  # Summer program, etc.
    REC_LETTER = "rec_letter"  # Talking points for recommenders


class AdaptationLevel(str, Enum):
    """Level of adaptation needed for content reuse."""
    DIRECT_REUSE = "direct_reuse"  # Copy-paste with minor edits
    MODERATE_ADAPTATION = "moderate_adaptation"  # 30-50% rewrite
    SIGNIFICANT_ADAPTATION = "significant_adaptation"  # 50-70% rewrite
    CUSTOM_WRITE = "custom_write"  # 90%+ new content needed


class ContentStatus(str, Enum):
    """Status of content development."""
    IDEA = "idea"  # Concept identified
    OUTLINED = "outlined"  # Structure defined
    DRAFTED = "drafted"  # First draft complete
    REVISED = "revised"  # Feedback incorporated
    POLISHED = "polished"  # Ready for submission


# =============================================================================
# CONSTANTS
# =============================================================================

# Typical essay prompts and their content type mapping
COMMON_PROMPTS = {
    # Common App prompts
    "background_identity": ContentType.PERSONAL_NARRATIVE,
    "lesson_from_obstacle": ContentType.CHALLENGE_OVERCOME,
    "challenged_belief": ContentType.INTELLECTUAL_CURIOSITY,
    "problem_solved": ContentType.IMPACT_STORY,
    "personal_growth": ContentType.CHALLENGE_OVERCOME,
    "captivated_topic": ContentType.INTELLECTUAL_CURIOSITY,
    "any_topic": ContentType.UNIQUE_PERSPECTIVE,

    # "Why" essays
    "why_this_school": ContentType.FUTURE_VISION,
    "why_this_major": ContentType.WHY_INTEREST,
    "why_this_program": ContentType.WHY_INTEREST,
    "why_this_award": ContentType.WHY_INTEREST,

    # Activity essays
    "most_meaningful_activity": ContentType.ACTIVITY_DESCRIPTION,
    "leadership_experience": ContentType.COMMUNITY_CONTRIBUTION,
    "community_service": ContentType.COMMUNITY_CONTRIBUTION,
    "research_experience": ContentType.ACTIVITY_DESCRIPTION,

    # Supplemental
    "diversity_contribution": ContentType.UNIQUE_PERSPECTIVE,
    "goals_aspirations": ContentType.FUTURE_VISION,
}

# Adaptation guidance by content type
ADAPTATION_GUIDANCE = {
    ContentType.PERSONAL_NARRATIVE: {
        "reusability": "High - core story remains same",
        "typical_adaptation": AdaptationLevel.DIRECT_REUSE,
        "customize": ["Opening hook", "Closing connection to specific application"],
    },
    ContentType.ACTIVITY_DESCRIPTION: {
        "reusability": "High - facts don't change",
        "typical_adaptation": AdaptationLevel.DIRECT_REUSE,
        "customize": ["Emphasis based on what program values", "Metrics to highlight"],
    },
    ContentType.IMPACT_STORY: {
        "reusability": "High - metrics and quotes reusable",
        "typical_adaptation": AdaptationLevel.MODERATE_ADAPTATION,
        "customize": ["Frame impact in terms of program's mission"],
    },
    ContentType.WHY_INTEREST: {
        "reusability": "Medium - core interest same, specifics vary",
        "typical_adaptation": AdaptationLevel.MODERATE_ADAPTATION,
        "customize": ["Specific program/school references", "How this fits their offerings"],
    },
    ContentType.FUTURE_VISION: {
        "reusability": "Medium - goals consistent, pathway varies",
        "typical_adaptation": AdaptationLevel.MODERATE_ADAPTATION,
        "customize": ["How this program/school enables goals"],
    },
    ContentType.CHALLENGE_OVERCOME: {
        "reusability": "High - story is stable",
        "typical_adaptation": AdaptationLevel.DIRECT_REUSE,
        "customize": ["Relevance to program values"],
    },
    ContentType.COMMUNITY_CONTRIBUTION: {
        "reusability": "High",
        "typical_adaptation": AdaptationLevel.DIRECT_REUSE,
        "customize": ["Align with program's community focus"],
    },
    ContentType.UNIQUE_PERSPECTIVE: {
        "reusability": "High",
        "typical_adaptation": AdaptationLevel.DIRECT_REUSE,
        "customize": ["How you'll contribute to this specific community"],
    },
    ContentType.INTELLECTUAL_CURIOSITY: {
        "reusability": "High",
        "typical_adaptation": AdaptationLevel.DIRECT_REUSE,
        "customize": ["Connect to program's academic offerings"],
    },
}

# Word count guidelines
TYPICAL_WORD_COUNTS = {
    "common_app_main": 650,
    "supplemental_why": 250,
    "supplemental_activity": 150,
    "activity_description": 150,
    "scholarship_essay": 500,
    "award_essay": 300,
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class CoreContent(BaseModel):
    """A core content asset (reusable narrative piece)."""
    content_id: str = ""
    content_type: ContentType
    title: str
    summary: str  # Brief description of what this content covers
    key_elements: List[str] = Field(default_factory=list)  # Key points/stories
    word_count: int = 0
    status: ContentStatus = ContentStatus.IDEA
    draft_location: str = ""  # Path/link to actual draft
    last_updated: Optional[str] = None

    # Reusability metadata
    times_used: int = 0
    touchpoints_used: List[str] = Field(default_factory=list)


class Touchpoint(BaseModel):
    """A specific application touchpoint."""
    touchpoint_id: str = ""
    touchpoint_type: TouchpointType
    name: str  # e.g., "NCWIT Award Application", "MIT Supplemental"
    deadline: Optional[str] = None
    status: ContentStatus = ContentStatus.IDEA

    # Essay requirements
    essays_required: List[Dict[str, Any]] = Field(default_factory=list)
    # Format: [{"prompt": "...", "word_limit": 500, "content_mapping": "core_content_id"}]

    # Unique elements (can't be recycled)
    unique_elements: List[str] = Field(default_factory=list)
    # e.g., "Why NCWIT specifically", "Reference to MIT Maker culture"


class ContentMapping(BaseModel):
    """Mapping of core content to a specific touchpoint."""
    core_content_id: str
    touchpoint_id: str
    essay_prompt: str
    adaptation_level: AdaptationLevel
    adaptation_notes: List[str] = Field(default_factory=list)
    custom_elements: List[str] = Field(default_factory=list)
    word_limit: int = 500
    status: ContentStatus = ContentStatus.IDEA


class ReusabilityAnalysis(BaseModel):
    """Analysis of content reusability across touchpoints."""
    content_id: str
    content_title: str
    reuse_potential: float = Field(ge=0.0, le=1.0)  # 0-1
    touchpoints_applicable: List[str] = Field(default_factory=list)
    adaptation_effort: str = ""  # Low/Medium/High
    time_savings_hours: float = 0.0


class ContentMatrix(BaseModel):
    """
    Complete content matrix for essay planning.
    Consumed by Execution Agent for content development sessions.
    """
    # Core content inventory
    core_contents: List[CoreContent] = Field(default_factory=list)

    # Application touchpoints
    touchpoints: List[Touchpoint] = Field(default_factory=list)

    # Content mappings
    mappings: List[ContentMapping] = Field(default_factory=list)

    # Reusability analysis
    reusability_analysis: List[ReusabilityAnalysis] = Field(default_factory=list)

    # Summary metrics
    total_core_contents: int = 0
    total_touchpoints: int = 0
    total_essays_needed: int = 0
    unique_content_needed: int = 0  # Content that can't be recycled
    estimated_total_hours: float = 0.0
    estimated_hours_saved: float = 0.0

    # Development priorities
    priority_contents: List[str] = Field(default_factory=list)  # Content IDs to develop first
    recommendations: List[str] = Field(default_factory=list)


# =============================================================================
# CONTENT INVENTORY FUNCTIONS
# =============================================================================

def create_core_content(content_type: ContentType,
                        title: str,
                        summary: str,
                        key_elements: List[str] = None) -> CoreContent:
    """
    Create a new core content asset.

    Args:
        content_type: Type of content (personal narrative, etc.)
        title: Short title for the content
        summary: Brief description
        key_elements: Key stories/points included

    Returns:
        CoreContent asset
    """
    return CoreContent(
        content_id=f"content_{content_type.value}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        content_type=content_type,
        title=title,
        summary=summary,
        key_elements=key_elements or [],
        status=ContentStatus.IDEA,
        last_updated=datetime.now().strftime("%Y-%m-%d")
    )


def create_touchpoint(touchpoint_type: TouchpointType,
                      name: str,
                      deadline: str = None,
                      essays: List[Dict[str, Any]] = None) -> Touchpoint:
    """
    Create a new application touchpoint.

    Args:
        touchpoint_type: Type (college, scholarship, award, etc.)
        name: Name of the application
        deadline: Deadline date string
        essays: List of essay requirements

    Returns:
        Touchpoint object
    """
    return Touchpoint(
        touchpoint_id=f"tp_{touchpoint_type.value}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        touchpoint_type=touchpoint_type,
        name=name,
        deadline=deadline,
        essays_required=essays or [],
        status=ContentStatus.IDEA
    )


def recommend_core_contents(profile: Dict[str, Any]) -> List[CoreContent]:
    """
    Recommend core content assets based on student profile.

    Every student should develop 4-6 core narratives that can be
    adapted across all their applications.

    Args:
        profile: Student profile with archetype, activities, etc.

    Returns:
        List of recommended CoreContent assets to develop
    """
    recommendations = []

    # 1. Personal narrative (everyone needs this)
    archetype = profile.get("archetype", {})
    identity = archetype.get("identity_label", "your unique journey")

    recommendations.append(CoreContent(
        content_id="core_personal",
        content_type=ContentType.PERSONAL_NARRATIVE,
        title="Personal Narrative: My Story",
        summary=f"Core identity story connecting background to {identity}",
        key_elements=[
            "Key moment/experience that shaped you",
            "Connection to your current path",
            "What makes your perspective unique",
        ],
        status=ContentStatus.IDEA
    ))

    # 2. Primary activity deep-dive
    activities = profile.get("activities", [])
    if activities:
        primary_activity = activities[0].get("name", "main activity")
        recommendations.append(CoreContent(
            content_id="core_activity_primary",
            content_type=ContentType.ACTIVITY_DESCRIPTION,
            title=f"Activity Deep-Dive: {primary_activity}",
            summary=f"Comprehensive narrative about {primary_activity} and its impact",
            key_elements=[
                "How you got involved",
                "Your role and growth",
                "Measurable impact",
                "What you learned",
            ],
            status=ContentStatus.IDEA
        ))

    # 3. Impact story with metrics
    recommendations.append(CoreContent(
        content_id="core_impact",
        content_type=ContentType.IMPACT_STORY,
        title="Impact Story: Making a Difference",
        summary="Specific example of impact with quantifiable results",
        key_elements=[
            "The problem you addressed",
            "Your specific contribution",
            "Measurable outcomes (numbers, quotes)",
            "Ongoing/lasting impact",
        ],
        status=ContentStatus.IDEA
    ))

    # 4. Why this field/interest
    domain = archetype.get("domain_focus", "your field")
    recommendations.append(CoreContent(
        content_id="core_why_field",
        content_type=ContentType.WHY_INTEREST,
        title=f"Why {domain}?",
        summary=f"Origin story of your interest in {domain}",
        key_elements=[
            "Initial spark/discovery",
            "Deepening engagement",
            "Future aspirations in the field",
        ],
        status=ContentStatus.IDEA
    ))

    # 5. Challenge overcome (if applicable)
    challenges = profile.get("challenges", [])
    if challenges:
        recommendations.append(CoreContent(
            content_id="core_challenge",
            content_type=ContentType.CHALLENGE_OVERCOME,
            title="Challenge Overcome: Resilience Story",
            summary="Narrative about overcoming adversity",
            key_elements=[
                "The challenge faced",
                "How you responded",
                "What you learned",
                "How it shaped you",
            ],
            status=ContentStatus.IDEA
        ))

    # 6. Diversity/unique perspective (if relevant)
    context = archetype.get("context", {})
    if context.get("diversity_angles"):
        recommendations.append(CoreContent(
            content_id="core_perspective",
            content_type=ContentType.UNIQUE_PERSPECTIVE,
            title="My Unique Perspective",
            summary="How your background gives you a distinctive viewpoint",
            key_elements=[
                "Your background/identity",
                "How it shapes your perspective",
                "What you'll contribute to communities",
            ],
            status=ContentStatus.IDEA
        ))

    return recommendations


# =============================================================================
# MAPPING FUNCTIONS
# =============================================================================

def map_content_to_touchpoint(core_content: CoreContent,
                               touchpoint: Touchpoint,
                               essay_prompt: str,
                               word_limit: int = 500) -> ContentMapping:
    """
    Create mapping between core content and touchpoint essay.

    Args:
        core_content: Source content asset
        touchpoint: Target application
        essay_prompt: Specific essay prompt to answer
        word_limit: Word limit for this essay

    Returns:
        ContentMapping with adaptation guidance
    """
    # Determine adaptation level based on content type
    guidance = ADAPTATION_GUIDANCE.get(core_content.content_type, {})
    adaptation_level = guidance.get("typical_adaptation", AdaptationLevel.MODERATE_ADAPTATION)

    # Check if prompt requires more customization
    prompt_lower = essay_prompt.lower()
    if "why" in prompt_lower and ("this" in prompt_lower or "our" in prompt_lower):
        # "Why this school/program" always needs significant customization
        adaptation_level = AdaptationLevel.SIGNIFICANT_ADAPTATION

    # Generate adaptation notes
    adaptation_notes = guidance.get("customize", [])

    # Generate custom elements needed
    custom_elements = []
    if touchpoint.touchpoint_type == TouchpointType.COLLEGE_APP:
        custom_elements.append(f"Specific references to {touchpoint.name}")
        custom_elements.append("Connection to school's programs/culture")
    elif touchpoint.touchpoint_type == TouchpointType.AWARD:
        custom_elements.append(f"Alignment with {touchpoint.name} mission")
        custom_elements.append("Why you deserve this recognition")
    elif touchpoint.touchpoint_type == TouchpointType.PROGRAM:
        custom_elements.append(f"Why {touchpoint.name} specifically")
        custom_elements.append("What you'll contribute to the program")

    return ContentMapping(
        core_content_id=core_content.content_id,
        touchpoint_id=touchpoint.touchpoint_id,
        essay_prompt=essay_prompt,
        adaptation_level=adaptation_level,
        adaptation_notes=adaptation_notes,
        custom_elements=custom_elements,
        word_limit=word_limit,
        status=ContentStatus.IDEA
    )


def analyze_reusability(core_content: CoreContent,
                        touchpoints: List[Touchpoint]) -> ReusabilityAnalysis:
    """
    Analyze how reusable a core content asset is across touchpoints.

    Args:
        core_content: Content asset to analyze
        touchpoints: All touchpoints to consider

    Returns:
        ReusabilityAnalysis with metrics
    """
    guidance = ADAPTATION_GUIDANCE.get(core_content.content_type, {})

    # Count applicable touchpoints
    applicable = []
    for tp in touchpoints:
        for essay in tp.essays_required:
            prompt_type = _infer_prompt_type(essay.get("prompt", ""))
            if prompt_type == core_content.content_type:
                applicable.append(tp.name)
                break

    # Calculate reuse potential
    reuse_potential = len(applicable) / max(1, len(touchpoints))

    # Estimate time savings
    # Each reuse saves ~2 hours of writing (vs 4 hours for fresh)
    time_savings = len(applicable) * 2.0

    # Determine adaptation effort
    typical = guidance.get("typical_adaptation", AdaptationLevel.MODERATE_ADAPTATION)
    effort_map = {
        AdaptationLevel.DIRECT_REUSE: "Low",
        AdaptationLevel.MODERATE_ADAPTATION: "Medium",
        AdaptationLevel.SIGNIFICANT_ADAPTATION: "High",
        AdaptationLevel.CUSTOM_WRITE: "Very High",
    }

    return ReusabilityAnalysis(
        content_id=core_content.content_id,
        content_title=core_content.title,
        reuse_potential=round(reuse_potential, 2),
        touchpoints_applicable=applicable,
        adaptation_effort=effort_map.get(typical, "Medium"),
        time_savings_hours=time_savings
    )


def _infer_prompt_type(prompt: str) -> Optional[ContentType]:
    """Infer content type needed for a prompt."""
    prompt_lower = prompt.lower()

    # Check against common prompts
    for key, content_type in COMMON_PROMPTS.items():
        if key.replace("_", " ") in prompt_lower:
            return content_type

    # Heuristics
    if "background" in prompt_lower or "identity" in prompt_lower:
        return ContentType.PERSONAL_NARRATIVE
    if "challenge" in prompt_lower or "obstacle" in prompt_lower or "failure" in prompt_lower:
        return ContentType.CHALLENGE_OVERCOME
    if "why" in prompt_lower:
        return ContentType.WHY_INTEREST
    if "activity" in prompt_lower or "extracurricular" in prompt_lower:
        return ContentType.ACTIVITY_DESCRIPTION
    if "community" in prompt_lower or "contribute" in prompt_lower:
        return ContentType.COMMUNITY_CONTRIBUTION
    if "goal" in prompt_lower or "future" in prompt_lower:
        return ContentType.FUTURE_VISION
    if "impact" in prompt_lower:
        return ContentType.IMPACT_STORY

    return None


# =============================================================================
# MATRIX GENERATION
# =============================================================================

def generate_content_matrix(profile: Dict[str, Any],
                            touchpoints: List[Touchpoint]) -> ContentMatrix:
    """
    Generate complete content matrix for essay planning.

    This is the main entry point that:
    1. Recommends core content assets to develop
    2. Maps content to touchpoints
    3. Analyzes reusability
    4. Prioritizes development work

    Args:
        profile: Student profile
        touchpoints: List of application touchpoints

    Returns:
        ContentMatrix with complete planning
    """
    # 1. Generate recommended core contents
    core_contents = recommend_core_contents(profile)

    # 2. Create mappings for each touchpoint
    mappings = []
    total_essays = 0
    unique_needed = 0

    for tp in touchpoints:
        for essay in tp.essays_required:
            total_essays += 1
            prompt = essay.get("prompt", "")
            word_limit = essay.get("word_limit", 500)

            # Find best matching core content
            prompt_type = _infer_prompt_type(prompt)
            matched_content = None

            for cc in core_contents:
                if cc.content_type == prompt_type:
                    matched_content = cc
                    break

            if matched_content:
                mapping = map_content_to_touchpoint(
                    matched_content, tp, prompt, word_limit
                )
                mappings.append(mapping)

                # Track reuse
                matched_content.times_used += 1
                matched_content.touchpoints_used.append(tp.name)
            else:
                # No matching core content - needs custom write
                unique_needed += 1
                mappings.append(ContentMapping(
                    core_content_id="",
                    touchpoint_id=tp.touchpoint_id,
                    essay_prompt=prompt,
                    adaptation_level=AdaptationLevel.CUSTOM_WRITE,
                    word_limit=word_limit,
                    custom_elements=["Full custom write required"],
                    status=ContentStatus.IDEA
                ))

    # 3. Analyze reusability
    reusability = [analyze_reusability(cc, touchpoints) for cc in core_contents]

    # 4. Calculate time estimates
    # Core content: 4 hours each to develop
    # Direct reuse: 0.5 hours
    # Moderate adaptation: 1.5 hours
    # Significant adaptation: 2.5 hours
    # Custom write: 4 hours

    base_hours = len(core_contents) * 4  # Developing core content

    adaptation_hours = 0
    for m in mappings:
        if m.adaptation_level == AdaptationLevel.DIRECT_REUSE:
            adaptation_hours += 0.5
        elif m.adaptation_level == AdaptationLevel.MODERATE_ADAPTATION:
            adaptation_hours += 1.5
        elif m.adaptation_level == AdaptationLevel.SIGNIFICANT_ADAPTATION:
            adaptation_hours += 2.5
        else:
            adaptation_hours += 4.0

    total_hours = base_hours + adaptation_hours

    # Without reuse, all essays would be 4 hours each
    without_reuse_hours = total_essays * 4
    hours_saved = without_reuse_hours - total_hours

    # 5. Determine priority contents (most reused first)
    core_contents_sorted = sorted(
        core_contents,
        key=lambda c: c.times_used,
        reverse=True
    )
    priority_contents = [c.content_id for c in core_contents_sorted[:3]]

    # 6. Generate recommendations
    recommendations = _generate_matrix_recommendations(
        core_contents, touchpoints, mappings, unique_needed, hours_saved
    )

    return ContentMatrix(
        core_contents=core_contents,
        touchpoints=touchpoints,
        mappings=mappings,
        reusability_analysis=reusability,
        total_core_contents=len(core_contents),
        total_touchpoints=len(touchpoints),
        total_essays_needed=total_essays,
        unique_content_needed=unique_needed,
        estimated_total_hours=round(total_hours, 1),
        estimated_hours_saved=round(max(0, hours_saved), 1),
        priority_contents=priority_contents,
        recommendations=recommendations
    )


def _generate_matrix_recommendations(core_contents: List[CoreContent],
                                       touchpoints: List[Touchpoint],
                                       mappings: List[ContentMapping],
                                       unique_needed: int,
                                       hours_saved: float) -> List[str]:
    """Generate recommendations for content development."""
    recs = []

    # Efficiency insight
    recs.append(
        f"📊 Content reuse saves ~{hours_saved:.0f} hours "
        f"vs writing each essay from scratch"
    )

    # Priority development
    most_reused = max(core_contents, key=lambda c: c.times_used, default=None)
    if most_reused:
        recs.append(
            f"🎯 Priority: Develop '{most_reused.title}' first - "
            f"reused in {most_reused.times_used} applications"
        )

    # Unique content warning
    if unique_needed > 0:
        recs.append(
            f"⚠️ {unique_needed} essay(s) need custom content - "
            f"can't be adapted from core narratives"
        )

    # Core content completeness
    undeveloped = sum(1 for c in core_contents if c.status == ContentStatus.IDEA)
    if undeveloped > 0:
        recs.append(
            f"📝 {undeveloped} core content(s) need development - "
            f"start with outlining key stories"
        )

    # Strategy reminder
    recs.append(
        "\n💡 Strategy: Invest time in core content quality. "
        "Adaptations are easier when foundation is strong."
    )

    return recs


# =============================================================================
# WEEKLY EXECUTION FUNCTIONS
# =============================================================================

def get_content_priorities(matrix: ContentMatrix,
                           upcoming_deadline: str = None) -> List[Dict[str, Any]]:
    """
    Get prioritized content development tasks for weekly session.

    Args:
        matrix: ContentMatrix
        upcoming_deadline: Optional deadline to prioritize toward

    Returns:
        List of prioritized tasks
    """
    tasks = []

    # 1. Undeveloped core content (by reuse frequency)
    for cc in sorted(matrix.core_contents, key=lambda c: c.times_used, reverse=True):
        if cc.status in [ContentStatus.IDEA, ContentStatus.OUTLINED]:
            tasks.append({
                "type": "core_content",
                "content_id": cc.content_id,
                "title": cc.title,
                "status": cc.status.value,
                "reuse_count": cc.times_used,
                "priority": "high" if cc.times_used >= 3 else "medium",
                "action": "Draft core content" if cc.status == ContentStatus.OUTLINED else "Outline key stories",
                "estimated_hours": 4 if cc.status == ContentStatus.IDEA else 2,
            })

    # 2. Mappings with approaching deadlines
    if upcoming_deadline:
        deadline_dt = datetime.strptime(upcoming_deadline, "%Y-%m-%d")
        for tp in matrix.touchpoints:
            if tp.deadline:
                tp_deadline = datetime.strptime(tp.deadline, "%Y-%m-%d")
                if tp_deadline <= deadline_dt:
                    for mapping in matrix.mappings:
                        if mapping.touchpoint_id == tp.touchpoint_id:
                            if mapping.status != ContentStatus.POLISHED:
                                tasks.append({
                                    "type": "adaptation",
                                    "touchpoint": tp.name,
                                    "essay_prompt": mapping.essay_prompt[:50] + "...",
                                    "adaptation_level": mapping.adaptation_level.value,
                                    "deadline": tp.deadline,
                                    "priority": "critical",
                                    "action": "Adapt and polish for submission",
                                    "estimated_hours": 2,
                                })

    return tasks[:10]  # Return top 10 tasks


def update_content_status(matrix: ContentMatrix,
                          content_id: str,
                          new_status: ContentStatus,
                          word_count: int = None) -> ContentMatrix:
    """
    Update status of a content asset after work session.

    Args:
        matrix: ContentMatrix to update
        content_id: ID of content to update
        new_status: New status
        word_count: Optional word count if draft completed

    Returns:
        Updated ContentMatrix
    """
    for cc in matrix.core_contents:
        if cc.content_id == content_id:
            cc.status = new_status
            cc.last_updated = datetime.now().strftime("%Y-%m-%d")
            if word_count:
                cc.word_count = word_count
            break

    return matrix


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_content_matrix(matrix: ContentMatrix) -> str:
    """Format content matrix as readable summary."""
    lines = [
        "=" * 60,
        "CONTENT RECYCLING MATRIX",
        "=" * 60,
        "",
        f"Core Contents: {matrix.total_core_contents}",
        f"Application Touchpoints: {matrix.total_touchpoints}",
        f"Total Essays Needed: {matrix.total_essays_needed}",
        f"Unique Content Needed: {matrix.unique_content_needed}",
        "",
        f"Estimated Total Hours: {matrix.estimated_total_hours:.0f}h",
        f"Hours Saved via Reuse: {matrix.estimated_hours_saved:.0f}h",
        "",
        "--- CORE CONTENTS ---",
    ]

    for cc in matrix.core_contents:
        status_icon = {
            ContentStatus.IDEA: "○",
            ContentStatus.OUTLINED: "◐",
            ContentStatus.DRAFTED: "◑",
            ContentStatus.REVISED: "◕",
            ContentStatus.POLISHED: "●",
        }.get(cc.status, "?")

        lines.append(
            f"  {status_icon} {cc.title} ({cc.content_type.value})"
            f" - Used in {cc.times_used} apps"
        )

    if matrix.touchpoints:
        lines.extend(["", "--- TOUCHPOINTS ---"])
        for tp in matrix.touchpoints:
            deadline_str = f" [Due: {tp.deadline}]" if tp.deadline else ""
            lines.append(
                f"  • {tp.name} ({tp.touchpoint_type.value})"
                f"{deadline_str}"
            )

    if matrix.reusability_analysis:
        lines.extend(["", "--- REUSABILITY ANALYSIS ---"])
        for ra in matrix.reusability_analysis:
            lines.append(
                f"  • {ra.content_title}: {ra.reuse_potential:.0%} reusable, "
                f"{ra.adaptation_effort} effort, saves {ra.time_savings_hours:.0f}h"
            )

    if matrix.recommendations:
        lines.extend(["", "--- RECOMMENDATIONS ---"])
        for rec in matrix.recommendations:
            lines.append(f"  {rec}")

    lines.append("=" * 60)
    return "\n".join(lines)


def get_content_summary(cc: CoreContent) -> str:
    """Get concise summary of a core content asset."""
    return (
        f"{cc.title} ({cc.content_type.value}): "
        f"Status={cc.status.value}, "
        f"Used in {cc.times_used} apps"
    )
