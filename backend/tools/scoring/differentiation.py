# IvyLevel Differentiation Scoring v1.0
# LAYER: Scoring Primitives (TYPE-014)
"""
Differentiation and Authenticity Scoring.

Implements TYPE-014: Narrative Synthesis
- Cookie-cutter detection algorithm
- Authenticity tests (Passion, Why You, Sacrifice)
- Web coherence (activity-identity connectivity)
- Uniqueness signal detection

These are SCORING PRIMITIVES that identify generic profiles
and coach toward authentic differentiation.

Architecture:
- Pure functions with typed inputs/outputs
- No LLM calls - pattern-based detection
- Composable with ec_portfolio primitives
"""

from typing import Dict, List, Any, Optional, Set, Tuple
from pydantic import BaseModel, Field
from enum import Enum


# =============================================================================
# CONSTANTS - COOKIE CUTTER PATTERNS
# =============================================================================

# Generic activity combinations that AOs see thousands of times
GENERIC_PATTERNS = {
    "resume_padder": {
        "name": "Resume Padder",
        "description": "Many clubs/activities but no depth or leadership",
        "indicators": [
            "5+ activities with 'member' role",
            "No founder or president positions",
            "Activities span unrelated areas",
            "Low hours per activity",
        ],
        "severity": 0.8,
    },
    "nhs_key_club_combo": {
        "name": "NHS + Key Club + Sports",
        "description": "The default high-achiever starter pack",
        "indicators": [
            "NHS membership",
            "Key Club or similar service club",
            "One varsity sport",
            "No unique initiatives",
        ],
        "severity": 0.7,
    },
    "model_un_debate": {
        "name": "Model UN + Debate Only",
        "description": "Speech activities without applied impact",
        "indicators": [
            "Model UN participant",
            "Debate team member",
            "No real-world application of skills",
            "No founding or creating",
        ],
        "severity": 0.6,
    },
    "generic_volunteer": {
        "name": "Generic Volunteering",
        "description": "Scattered volunteer hours without focus",
        "indicators": [
            "Multiple unrelated volunteer activities",
            "No leadership in service",
            "No sustained commitment",
            "No measurable impact",
        ],
        "severity": 0.5,
    },
    "stem_only_no_humanity": {
        "name": "STEM Robot",
        "description": "All STEM, no humanity or service",
        "indicators": [
            "Only STEM-related activities",
            "No community service",
            "No leadership experience",
            "No creative pursuits",
        ],
        "severity": 0.5,
    },
    "participation_only": {
        "name": "All Participation, No Leadership",
        "description": "Member of everything, leader of nothing",
        "indicators": [
            "All activities at participation level",
            "No progression over years",
            "No initiative or founding",
        ],
        "severity": 0.7,
    },
}

# Keywords indicating generic activities
GENERIC_ACTIVITY_KEYWORDS = [
    "member", "participant", "volunteer", "helped", "assisted",
    "attended", "joined", "participated in",
]

# Keywords indicating unique/differentiated activities
UNIQUE_ACTIVITY_KEYWORDS = [
    "founded", "created", "launched", "built", "designed",
    "invented", "developed", "pioneered", "established",
    "first to", "only", "unique", "original",
]

# Common generic activities by category
GENERIC_ACTIVITIES = {
    "clubs": ["NHS", "Key Club", "Interact Club", "Student Council", "Honor Society"],
    "sports": ["Varsity", "JV", "Track", "Cross Country", "Swimming"],
    "service": ["Food Bank", "Hospital Volunteer", "Tutoring", "Beach Cleanup"],
    "academic": ["Math Club", "Science Club", "Debate", "Model UN", "Academic Decathlon"],
}


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class AuthenticityTest(str, Enum):
    """Three authenticity tests from TYPE-014."""
    PASSION = "PASSION"      # Would you do this without college app benefit?
    WHY_YOU = "WHY_YOU"      # Why are YOU specifically doing this?
    SACRIFICE = "SACRIFICE"  # What have you given up to pursue this?


class AuthenticityScore(BaseModel):
    """Authenticity assessment for a single activity."""
    activity_name: str
    passion_score: float = Field(ge=0.0, le=1.0, description="Would do without app benefit")
    why_you_score: float = Field(ge=0.0, le=1.0, description="Personal connection/uniqueness")
    sacrifice_score: float = Field(ge=0.0, le=1.0, description="Evidence of sacrifice/commitment")
    overall_authenticity: float = Field(ge=0.0, le=1.0)
    concerns: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)


class PatternMatch(BaseModel):
    """A matched cookie-cutter pattern."""
    pattern_id: str
    pattern_name: str
    severity: float = Field(ge=0.0, le=1.0)
    matched_indicators: List[str] = Field(default_factory=list)
    recommendation: str = ""


class WebConnection(BaseModel):
    """Connection between two activities."""
    activity_1: str
    activity_2: str
    connection_type: str  # "theme", "skill", "audience", "none"
    connection_strength: float = Field(ge=0.0, le=1.0)


class WebCoherenceOutput(BaseModel):
    """Web metaphor analysis - how activities connect to identity center."""
    central_identity: str
    activity_connections: List[WebConnection] = Field(default_factory=list)
    coherence_score: float = Field(ge=0.0, le=1.0)
    isolated_activities: List[str] = Field(default_factory=list)
    narrative_strength: str = ""  # "strong", "moderate", "weak", "fragmented"


class UniquenessSignal(BaseModel):
    """A detected uniqueness signal."""
    activity_name: str
    signal_type: str  # "founder", "first", "only", "innovative", "personal_story"
    description: str
    strength: float = Field(ge=0.0, le=1.0)


class DifferentiationOutput(BaseModel):
    """
    Complete differentiation analysis output.
    Consumed by ECAgent for authentic positioning.
    """
    # Cookie-cutter analysis
    cookie_cutter_score: float = Field(ge=0.0, le=1.0, description="0=unique, 1=generic")
    patterns_matched: List[PatternMatch] = Field(default_factory=list)
    generic_activity_count: int = 0

    # Authenticity analysis
    activity_authenticity: List[AuthenticityScore] = Field(default_factory=list)
    average_authenticity: float = Field(ge=0.0, le=1.0)

    # Web coherence
    web_coherence: WebCoherenceOutput

    # Uniqueness signals
    uniqueness_signals: List[UniquenessSignal] = Field(default_factory=list)
    uniqueness_score: float = Field(ge=0.0, le=1.0)

    # Overall differentiation
    differentiation_score: float = Field(ge=0.0, le=1.0, description="Higher = more differentiated")

    # Recommendations
    differentiation_recommendations: List[str] = Field(default_factory=list)
    warning_message: Optional[str] = None


# =============================================================================
# COOKIE-CUTTER DETECTION
# =============================================================================

def detect_cookie_cutter_patterns(activities: List[Dict[str, Any]]) -> Tuple[float, List[PatternMatch]]:
    """
    Detect cookie-cutter patterns in activity portfolio.

    Returns score (0=unique, 1=completely generic) and matched patterns.

    Args:
        activities: List of activity dicts

    Returns:
        Tuple of (cookie_cutter_score, list of matched patterns)
    """
    if not activities:
        return 0.0, []

    matches = []
    activity_names = [a.get("name", "").lower() for a in activities]
    activity_roles = [a.get("role_level", "").lower() for a in activities]
    activity_categories = [a.get("category", "").upper() for a in activities]
    combined_text = " ".join(activity_names + [a.get("description", "").lower() for a in activities])

    # Check each pattern

    # 1. Resume Padder: Many activities, no depth
    member_count = sum(1 for role in activity_roles if "member" in role or "participant" in role)
    founder_count = sum(1 for role in activity_roles if "founder" in role or "president" in role)

    if len(activities) >= 5 and member_count >= 4 and founder_count == 0:
        matches.append(PatternMatch(
            pattern_id="resume_padder",
            pattern_name="Resume Padder",
            severity=0.8,
            matched_indicators=[
                f"{member_count} activities at member/participant level",
                "No founder or leadership positions",
            ],
            recommendation="Focus on 2-3 activities and seek leadership. Depth > breadth."
        ))

    # 2. NHS + Key Club + Sports combo
    has_nhs = any("nhs" in name or "honor society" in name for name in activity_names)
    has_key_club = any("key club" in name or "interact" in name or "service club" in name for name in activity_names)
    has_sport = any(sport.lower() in combined_text for sport in ["varsity", "jv", "track", "swim", "soccer", "basketball"])

    if has_nhs and has_key_club and has_sport and founder_count == 0:
        matches.append(PatternMatch(
            pattern_id="nhs_key_club_combo",
            pattern_name="NHS + Key Club + Sports",
            severity=0.7,
            matched_indicators=[
                "NHS membership detected",
                "Service club membership detected",
                "Sports participation detected",
                "No unique initiatives",
            ],
            recommendation="Add a founding initiative or unique project that shows individual agency."
        ))

    # 3. Model UN + Debate only
    has_mun = any("model un" in name or "mun" in name for name in activity_names)
    has_debate = any("debate" in name for name in activity_names)

    if has_mun and has_debate and founder_count == 0:
        matches.append(PatternMatch(
            pattern_id="model_un_debate",
            pattern_name="Model UN + Debate Only",
            severity=0.6,
            matched_indicators=[
                "Model UN participation",
                "Debate team participation",
                "No real-world application",
            ],
            recommendation="Apply your communication skills to a real cause or community project."
        ))

    # 4. Participation only (no leadership progression)
    if len(activities) >= 4 and member_count >= len(activities) - 1:
        matches.append(PatternMatch(
            pattern_id="participation_only",
            pattern_name="All Participation, No Leadership",
            severity=0.7,
            matched_indicators=[
                f"All {len(activities)} activities at participation level",
                "No leadership progression visible",
            ],
            recommendation="Seek leadership in your strongest activity or start something new."
        ))

    # 5. STEM only, no humanity
    stem_count = sum(1 for cat in activity_categories if cat in ["APTITUDE", "PASSION"])
    community_count = sum(1 for cat in activity_categories if cat == "COMMUNITY")

    if len(activities) >= 4 and stem_count >= len(activities) - 1 and community_count == 0:
        matches.append(PatternMatch(
            pattern_id="stem_only_no_humanity",
            pattern_name="STEM Robot",
            severity=0.5,
            matched_indicators=[
                f"All {stem_count} activities are STEM-focused",
                "No community service activities",
            ],
            recommendation="Add meaningful service that connects your STEM skills to community impact."
        ))

    # Calculate overall cookie-cutter score
    if not matches:
        cookie_cutter_score = 0.0
    else:
        # Weight by severity
        total_severity = sum(m.severity for m in matches)
        cookie_cutter_score = min(1.0, total_severity / len(matches) * (1 + 0.1 * len(matches)))

    return cookie_cutter_score, matches


def count_generic_activities(activities: List[Dict[str, Any]]) -> int:
    """Count activities that match generic patterns."""
    count = 0

    for activity in activities:
        name = activity.get("name", "").lower()
        description = activity.get("description", "").lower()
        combined = f"{name} {description}"

        # Check for generic keywords
        generic_matches = sum(1 for kw in GENERIC_ACTIVITY_KEYWORDS if kw in combined)
        unique_matches = sum(1 for kw in UNIQUE_ACTIVITY_KEYWORDS if kw in combined)

        # Check against generic activity lists
        for category_activities in GENERIC_ACTIVITIES.values():
            for generic in category_activities:
                if generic.lower() in name:
                    generic_matches += 1

        # Activity is generic if more generic signals than unique
        if generic_matches > unique_matches:
            count += 1

    return count


# =============================================================================
# AUTHENTICITY TESTING
# =============================================================================

def assess_activity_authenticity(activity: Dict[str, Any],
                                  profile: Optional[Dict[str, Any]] = None) -> AuthenticityScore:
    """
    Assess authenticity of a single activity using three tests.

    Tests:
    1. Passion Test: Would you do this without college app benefit?
    2. Why You Test: Why are YOU specifically doing this?
    3. Sacrifice Test: What have you given up to pursue this?

    Args:
        activity: Activity dict
        profile: Optional student profile for context

    Returns:
        AuthenticityScore with scores and concerns/strengths
    """
    name = activity.get("name", "Unknown")
    description = activity.get("description", "").lower()
    role = activity.get("role_level", "").lower()
    hours = activity.get("hours_per_week", 0)
    years = activity.get("years", 1)

    concerns = []
    strengths = []

    # === PASSION TEST ===
    # Indicators of genuine passion vs. resume padding
    passion_score = 0.5  # Base

    # Positive signals
    if hours >= 10:
        passion_score += 0.2
        strengths.append("High time commitment suggests genuine interest")
    if years >= 2:
        passion_score += 0.15
        strengths.append("Multi-year commitment")
    if any(kw in description for kw in ["love", "passion", "fascinated", "inspired"]):
        passion_score += 0.1
    if "founder" in role or "created" in description:
        passion_score += 0.15
        strengths.append("Founded/created something original")

    # Negative signals
    if hours < 3:
        passion_score -= 0.2
        concerns.append("Low hours suggest minimal engagement")
    if any(kw in description for kw in ["required", "mandatory", "had to"]):
        passion_score -= 0.2
        concerns.append("Activity may be required, not chosen")

    passion_score = max(0.0, min(1.0, passion_score))

    # === WHY YOU TEST ===
    # Why is THIS student doing THIS activity?
    why_you_score = 0.4  # Base

    # Positive signals
    if profile:
        # Check alignment with stated interests/major
        intended_major = profile.get("intended_major", "").lower()
        interests = profile.get("interests", [])

        if intended_major and intended_major in description:
            why_you_score += 0.2
            strengths.append("Aligns with intended major")

        if any(interest.lower() in description for interest in interests if isinstance(interest, str)):
            why_you_score += 0.15

    # Personal connection signals
    if any(kw in description for kw in ["personal", "my community", "my family", "my experience"]):
        why_you_score += 0.2
        strengths.append("Shows personal connection")

    if "founder" in role:
        why_you_score += 0.2
        strengths.append("Founded initiative shows personal agency")

    # Generic signals (negative)
    is_generic = any(
        generic.lower() in name.lower()
        for activities in GENERIC_ACTIVITIES.values()
        for generic in activities
    )
    if is_generic and "founder" not in role and "president" not in role:
        why_you_score -= 0.2
        concerns.append("Common activity without distinctive role")

    why_you_score = max(0.0, min(1.0, why_you_score))

    # === SACRIFICE TEST ===
    # What have they given up to pursue this?
    sacrifice_score = 0.4  # Base

    # High commitment = sacrifice
    total_hours = hours * activity.get("weeks_per_year", 40)
    if total_hours >= 400:
        sacrifice_score += 0.3
        strengths.append("Significant time investment (400+ hours/year)")
    elif total_hours >= 200:
        sacrifice_score += 0.15

    # Multi-year commitment
    if years >= 3:
        sacrifice_score += 0.2
        strengths.append("3+ year commitment")

    # Difficulty indicators
    if any(kw in description for kw in ["challenging", "difficult", "failed", "struggled", "overcame"]):
        sacrifice_score += 0.15
        strengths.append("Shows perseverance through difficulty")

    # Leadership = sacrifice of time for others
    if "founder" in role or "president" in role or "captain" in role:
        sacrifice_score += 0.1

    sacrifice_score = max(0.0, min(1.0, sacrifice_score))

    # === OVERALL ===
    overall = (passion_score * 0.35 + why_you_score * 0.35 + sacrifice_score * 0.30)

    return AuthenticityScore(
        activity_name=name,
        passion_score=passion_score,
        why_you_score=why_you_score,
        sacrifice_score=sacrifice_score,
        overall_authenticity=overall,
        concerns=concerns,
        strengths=strengths
    )


# =============================================================================
# WEB COHERENCE (ACTIVITY-IDENTITY CONNECTIVITY)
# =============================================================================

def analyze_web_coherence(activities: List[Dict[str, Any]],
                           identity: Optional[Dict[str, Any]] = None) -> WebCoherenceOutput:
    """
    Analyze how activities connect to form coherent narrative web.

    The "Web Metaphor" from TYPE-014: Activities should connect to
    a central identity, not be scattered random points.

    Args:
        activities: List of activity dicts
        identity: Optional identity/profile info (archetype, interests, etc.)

    Returns:
        WebCoherenceOutput with connections and coherence score
    """
    if not activities:
        return WebCoherenceOutput(
            central_identity="Unknown",
            activity_connections=[],
            coherence_score=0.0,
            isolated_activities=[],
            narrative_strength="fragmented"
        )

    # Extract themes from activities
    activity_themes = {}
    for activity in activities:
        name = activity.get("name", "")
        desc = activity.get("description", "").lower()
        category = activity.get("category", "")

        themes = set()

        # Category-based themes
        if category:
            themes.add(category.lower())

        # Keyword-based themes
        theme_keywords = {
            "tech": ["coding", "programming", "software", "app", "website", "computer", "ai", "ml"],
            "science": ["research", "lab", "experiment", "biology", "chemistry", "physics"],
            "service": ["volunteer", "community", "help", "serve", "nonprofit", "charity"],
            "leadership": ["president", "founder", "captain", "lead", "director", "chair"],
            "education": ["tutor", "teach", "mentor", "education", "learning"],
            "arts": ["music", "art", "theater", "dance", "creative", "film", "writing"],
            "business": ["business", "startup", "entrepreneur", "revenue", "company"],
            "advocacy": ["advocacy", "awareness", "campaign", "rights", "justice"],
        }

        for theme, keywords in theme_keywords.items():
            if any(kw in desc for kw in keywords):
                themes.add(theme)

        activity_themes[name] = themes

    # Determine central identity/theme
    all_themes = []
    for themes in activity_themes.values():
        all_themes.extend(themes)

    if all_themes:
        from collections import Counter
        theme_counts = Counter(all_themes)
        central_theme = theme_counts.most_common(1)[0][0]
    else:
        central_theme = "general"

    # Build connections
    connections = []
    activity_names = list(activity_themes.keys())

    for i, name1 in enumerate(activity_names):
        for name2 in activity_names[i+1:]:
            themes1 = activity_themes[name1]
            themes2 = activity_themes[name2]

            # Find shared themes
            shared = themes1 & themes2

            if shared:
                strength = min(1.0, len(shared) * 0.3 + 0.4)
                conn_type = "theme"
                connections.append(WebConnection(
                    activity_1=name1,
                    activity_2=name2,
                    connection_type=conn_type,
                    connection_strength=strength
                ))
            else:
                connections.append(WebConnection(
                    activity_1=name1,
                    activity_2=name2,
                    connection_type="none",
                    connection_strength=0.0
                ))

    # Identify isolated activities (no strong connections)
    connection_counts = {name: 0 for name in activity_names}
    for conn in connections:
        if conn.connection_strength >= 0.4:
            connection_counts[conn.activity_1] += 1
            connection_counts[conn.activity_2] += 1

    isolated = [name for name, count in connection_counts.items() if count == 0]

    # Calculate coherence score
    if not connections:
        coherence_score = 0.5  # Single activity
    else:
        avg_strength = sum(c.connection_strength for c in connections) / len(connections)
        isolation_penalty = len(isolated) * 0.1
        coherence_score = max(0.0, min(1.0, avg_strength - isolation_penalty))

    # Determine narrative strength
    if coherence_score >= 0.7:
        narrative_strength = "strong"
    elif coherence_score >= 0.5:
        narrative_strength = "moderate"
    elif coherence_score >= 0.3:
        narrative_strength = "weak"
    else:
        narrative_strength = "fragmented"

    return WebCoherenceOutput(
        central_identity=central_theme.title(),
        activity_connections=connections,
        coherence_score=coherence_score,
        isolated_activities=isolated,
        narrative_strength=narrative_strength
    )


# =============================================================================
# UNIQUENESS SIGNAL DETECTION
# =============================================================================

def detect_uniqueness_signals(activities: List[Dict[str, Any]]) -> Tuple[List[UniquenessSignal], float]:
    """
    Detect signals that make this profile unique/differentiated.

    Args:
        activities: List of activity dicts

    Returns:
        Tuple of (uniqueness signals, uniqueness score)
    """
    signals = []

    for activity in activities:
        name = activity.get("name", "")
        description = activity.get("description", "").lower()
        role = activity.get("role_level", "").lower()

        # Founder signal
        if "founder" in role or "founded" in description or "created" in description:
            signals.append(UniquenessSignal(
                activity_name=name,
                signal_type="founder",
                description="Started own initiative showing entrepreneurial spirit",
                strength=0.9
            ))

        # First/Only signal
        if any(kw in description for kw in ["first", "only", "pioneered", "original"]):
            signals.append(UniquenessSignal(
                activity_name=name,
                signal_type="first",
                description="Did something first or uniquely",
                strength=0.85
            ))

        # Innovation signal
        if any(kw in description for kw in ["invented", "developed", "built", "designed"]):
            signals.append(UniquenessSignal(
                activity_name=name,
                signal_type="innovative",
                description="Created something new",
                strength=0.8
            ))

        # Personal story signal
        if any(kw in description for kw in ["personal", "my family", "my community", "my experience", "inspired by"]):
            signals.append(UniquenessSignal(
                activity_name=name,
                signal_type="personal_story",
                description="Has personal narrative connection",
                strength=0.75
            ))

        # Scale/impact signal
        impact = activity.get("impact_metric", 0)
        if impact >= 1000:
            signals.append(UniquenessSignal(
                activity_name=name,
                signal_type="scale",
                description=f"Achieved significant scale ({impact}+ reached)",
                strength=0.7
            ))

    # Calculate uniqueness score
    if not signals:
        uniqueness_score = 0.2  # Low base
    else:
        avg_strength = sum(s.strength for s in signals) / len(signals)
        signal_bonus = min(0.3, len(signals) * 0.05)
        uniqueness_score = min(1.0, avg_strength + signal_bonus)

    return signals, uniqueness_score


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_differentiation(activities: List[Dict[str, Any]],
                             profile: Optional[Dict[str, Any]] = None) -> DifferentiationOutput:
    """
    Complete differentiation analysis for activity portfolio.

    This is the main entry point that combines:
    - Cookie-cutter pattern detection
    - Authenticity testing (3 tests)
    - Web coherence analysis
    - Uniqueness signal detection

    Args:
        activities: List of activity dicts
        profile: Optional student profile for context

    Returns:
        DifferentiationOutput with complete analysis
    """
    if not activities:
        return DifferentiationOutput(
            cookie_cutter_score=1.0,
            patterns_matched=[],
            generic_activity_count=0,
            activity_authenticity=[],
            average_authenticity=0.0,
            web_coherence=WebCoherenceOutput(
                central_identity="Unknown",
                activity_connections=[],
                coherence_score=0.0,
                isolated_activities=[],
                narrative_strength="fragmented"
            ),
            uniqueness_signals=[],
            uniqueness_score=0.0,
            differentiation_score=0.0,
            differentiation_recommendations=["Add activities to analyze"],
            warning_message="No activities provided for analysis"
        )

    # 1. Cookie-cutter detection
    cookie_score, patterns = detect_cookie_cutter_patterns(activities)
    generic_count = count_generic_activities(activities)

    # 2. Authenticity testing
    authenticity_scores = []
    for activity in activities:
        auth = assess_activity_authenticity(activity, profile)
        authenticity_scores.append(auth)

    avg_authenticity = sum(a.overall_authenticity for a in authenticity_scores) / len(authenticity_scores)

    # 3. Web coherence
    identity_info = None
    if profile:
        identity_info = {
            "archetype": profile.get("archetype"),
            "interests": profile.get("interests", []),
            "intended_major": profile.get("intended_major"),
        }
    web_coherence = analyze_web_coherence(activities, identity_info)

    # 4. Uniqueness signals
    uniqueness_signals, uniqueness_score = detect_uniqueness_signals(activities)

    # 5. Calculate overall differentiation score
    # Higher is better (more differentiated)
    differentiation_score = (
        (1 - cookie_score) * 0.25 +      # Not cookie-cutter
        avg_authenticity * 0.30 +         # Authentic activities
        web_coherence.coherence_score * 0.25 +  # Coherent narrative
        uniqueness_score * 0.20           # Unique signals
    )

    # 6. Generate recommendations
    recommendations = _generate_differentiation_recommendations(
        cookie_score, patterns, avg_authenticity, web_coherence, uniqueness_score
    )

    # 7. Warning message
    warning = None
    if cookie_score >= 0.7:
        warning = "⚠️ WARNING: This profile matches common cookie-cutter patterns. AOs see thousands of similar profiles."
    elif cookie_score >= 0.5:
        warning = "⚠️ CAUTION: Some generic patterns detected. Consider differentiating further."

    return DifferentiationOutput(
        cookie_cutter_score=cookie_score,
        patterns_matched=patterns,
        generic_activity_count=generic_count,
        activity_authenticity=authenticity_scores,
        average_authenticity=avg_authenticity,
        web_coherence=web_coherence,
        uniqueness_signals=uniqueness_signals,
        uniqueness_score=uniqueness_score,
        differentiation_score=differentiation_score,
        differentiation_recommendations=recommendations,
        warning_message=warning
    )


def _generate_differentiation_recommendations(cookie_score: float,
                                               patterns: List[PatternMatch],
                                               authenticity: float,
                                               coherence: WebCoherenceOutput,
                                               uniqueness: float) -> List[str]:
    """Generate prioritized recommendations for differentiation."""
    recommendations = []

    # Pattern-specific recommendations
    for pattern in patterns:
        recommendations.append(f"[{pattern.pattern_name}] {pattern.recommendation}")

    # Authenticity recommendations
    if authenticity < 0.5:
        recommendations.append(
            "Increase depth in fewer activities rather than breadth across many. "
            "AOs value genuine passion over resume padding."
        )

    # Coherence recommendations
    if coherence.narrative_strength == "fragmented":
        recommendations.append(
            "Activities appear disconnected. Identify a central theme and ensure "
            "activities connect to it."
        )
    elif coherence.narrative_strength == "weak":
        recommendations.append(
            "Narrative could be stronger. Consider dropping isolated activities "
            f"({', '.join(coherence.isolated_activities)}) for ones that reinforce your theme."
        )

    # Uniqueness recommendations
    if uniqueness < 0.4:
        recommendations.append(
            "Profile lacks uniqueness signals. Consider: founding an initiative, "
            "connecting activities to personal story, or achieving significant scale."
        )

    # Generic fallback
    if not recommendations:
        recommendations.append(
            "Profile shows good differentiation. Focus on deepening impact "
            "and documenting evidence."
        )

    return recommendations[:5]  # Top 5


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def format_differentiation_analysis(output: DifferentiationOutput) -> str:
    """Format differentiation analysis as readable summary."""
    lines = [
        "=" * 60,
        "DIFFERENTIATION ANALYSIS",
        "=" * 60,
        "",
        f"Differentiation Score: {output.differentiation_score:.2f}/1.00",
        f"Cookie-Cutter Score: {output.cookie_cutter_score:.2f} (lower is better)",
        f"Authenticity Score: {output.average_authenticity:.2f}",
        f"Web Coherence: {output.web_coherence.coherence_score:.2f} ({output.web_coherence.narrative_strength})",
        f"Uniqueness Score: {output.uniqueness_score:.2f}",
    ]

    if output.warning_message:
        lines.extend(["", output.warning_message])

    if output.patterns_matched:
        lines.extend(["", "--- COOKIE-CUTTER PATTERNS DETECTED ---"])
        for pattern in output.patterns_matched:
            lines.append(f"  • {pattern.pattern_name} (severity: {pattern.severity:.1f})")

    if output.uniqueness_signals:
        lines.extend(["", "--- UNIQUENESS SIGNALS ---"])
        for signal in output.uniqueness_signals:
            lines.append(f"  ✓ {signal.activity_name}: {signal.signal_type} ({signal.strength:.2f})")

    lines.extend(["", "--- RECOMMENDATIONS ---"])
    for i, rec in enumerate(output.differentiation_recommendations, 1):
        lines.append(f"  {i}. {rec}")

    lines.append("=" * 60)

    return "\n".join(lines)


def get_authenticity_summary(score: AuthenticityScore) -> str:
    """Get concise summary for single activity authenticity."""
    return (
        f"{score.activity_name}: "
        f"Passion={score.passion_score:.2f}, "
        f"WhyYou={score.why_you_score:.2f}, "
        f"Sacrifice={score.sacrifice_score:.2f}, "
        f"Overall={score.overall_authenticity:.2f}"
    )
