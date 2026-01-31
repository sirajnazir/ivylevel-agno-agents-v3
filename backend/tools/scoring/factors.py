# MIRRORS: lib/scoring/factorAnalysis.ts (437 lines)
# THE MIRROR LAW: This is a line-by-line port. DO NOT modify the logic.
"""
Factor Analysis System - Python Port

Identifies "Helping" and "Holding Back" factors for each profile.
Factors are ranked by admission impact (Priority) and grouped by category.

PRINCIPLE: Every factor has a transformation pathway.
Weaknesses aren't permanent—they're opportunities in disguise.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import IntEnum

from backend.tools.scoring.constants import FACTOR_THRESHOLDS


# =============================================================================
# FACTOR TYPES
# =============================================================================

class Priority(IntEnum):
    """Factor priority levels for triage ordering"""
    CRITICAL = 1   # Must address immediately
    HIGH = 2       # Address in next 3 months
    MEDIUM = 3     # Address in next 6 months
    LOW = 4        # Nice to have


@dataclass
class Factor:
    """A helping or holding back factor"""
    id: str
    category: str  # APTITUDE, PASSION, COMMUNITY, NARRATIVE, CONTEXT
    message: str
    priority: Priority
    improvement_path: Optional[str] = None  # For holding back factors
    current_value: Optional[str] = None
    target_value: Optional[str] = None


@dataclass
class FactorAnalysis:
    """Complete factor analysis result"""
    helping: List[Factor]
    holding_back: List[Factor]
    net_position: str  # STRONG, BALANCED, NEEDS_WORK
    top_priority: Optional[Factor]


# =============================================================================
# HELPING FACTOR DEFINITIONS
# =============================================================================

HELPING_FACTOR_CONFIGS: List[Dict[str, Any]] = [
    # APTITUDE
    {
        "id": "PERFECT_GPA",
        "category": "APTITUDE",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("aptitude", {}).get("gpa_normalized", 0) >= 0.95,
        "message": lambda p, s: f"Perfect GPA ({p.get('aptitude', {}).get('gpa_weighted', 'N/A')}) — top 1% strength",
    },
    {
        "id": "STRONG_GPA",
        "category": "APTITUDE",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: 0.80 <= p.get("aptitude", {}).get("gpa_normalized", 0) < 0.95,
        "message": lambda p, s: f"Strong GPA ({p.get('aptitude', {}).get('gpa_weighted', 'N/A')}) — top 10% academics",
    },
    {
        "id": "HIGH_SAT",
        "category": "APTITUDE",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("aptitude", {}).get("sat_normalized", 0) >= 0.85,
        "message": lambda p, s: f"High SAT ({p.get('aptitude', {}).get('sat_total', 'N/A')}) — 99th percentile",
    },
    {
        "id": "STRONG_RIGOR",
        "category": "APTITUDE",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("aptitude", {}).get("rigor_normalized", 0) >= 0.80,
        "message": lambda p, s: f"Strong AP rigor ({p.get('aptitude', {}).get('ap_count', 0)} courses, avg {p.get('aptitude', {}).get('ap_avg_score', 'N/A')})",
    },
    {
        "id": "NATIONAL_AWARD",
        "category": "APTITUDE",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("aptitude", {}).get("awards_normalized", 0) >= 0.85,
        "message": lambda p, s: "National-level academic recognition — rare differentiator",
    },
    
    # PASSION
    {
        "id": "LONG_COMMITMENT",
        "category": "PASSION",
        "priority": Priority.HIGH,
        "check": lambda p, s: (p.get("passion", {}).get("ec_commitment_years") or 0) >= 4,
        "message": lambda p, s: "4+ years EC commitment — depth over breadth signal",
    },
    {
        "id": "STRONG_LEADERSHIP",
        "category": "PASSION",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("passion", {}).get("leadership_normalized", 0) >= 0.70,
        "message": lambda p, s: f"Strong leadership role ({p.get('passion', {}).get('leadership_level', 'N/A')})",
    },
    {
        "id": "FOUNDER_STATUS",
        "category": "PASSION",
        "priority": Priority.CRITICAL,
        "check": lambda p, s: "FOUNDER" in (p.get("passion", {}).get("leadership_level") or ""),
        "message": lambda p, s: "Founder status — demonstrates initiative and entrepreneurial mindset",
    },
    {
        "id": "RESEARCH_EXPERIENCE",
        "category": "PASSION",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("passion", {}).get("research_normalized", 0) >= 0.75,
        "message": lambda p, s: f"Research experience ({p.get('passion', {}).get('research_level', 'N/A')}) — intellectual depth",
    },
    {
        "id": "HIGH_IMPACT_PROJECT",
        "category": "PASSION",
        "priority": Priority.HIGH,
        "check": lambda p, s: (p.get("passion", {}).get("project_impact") or 0) >= 500,
        "message": lambda p, s: f"High-impact project ({p.get('passion', {}).get('project_impact', 0):,} people) — tangible results",
    },
    
    # COMMUNITY
    {
        "id": "STRONG_SERVICE",
        "category": "COMMUNITY",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("community", {}).get("service_hours") or 0) >= 250,
        "message": lambda p, s: f"Substantial service commitment ({p.get('community', {}).get('service_hours', 0)}+ hours)",
    },
    {
        "id": "SERVICE_LEADERSHIP",
        "category": "COMMUNITY",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("community", {}).get("service_leadership") in ["NATIONAL", "REGIONAL"],
        "message": lambda p, s: f"Service leadership ({p.get('community', {}).get('service_leadership', 'N/A')}) — organized impact",
    },
    {
        "id": "COMMUNITY_IMPACT",
        "category": "COMMUNITY",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("community", {}).get("community_impact") or 0) >= 200,
        "message": lambda p, s: f"Community impact ({p.get('community', {}).get('community_impact', 0):,} people) — measurable difference",
    },
    
    # NARRATIVE/PSYCHOMETRIC
    {
        "id": "HIGH_GRIT",
        "category": "NARRATIVE",
        "priority": Priority.HIGH,
        "check": lambda p, s: (p.get("assessment_intelligence", {}).get("psychometrics", {}).get("grit_resilience") or 0) >= 0.80,
        "message": lambda p, s: f"High grit/resilience ({int((p.get('assessment_intelligence', {}).get('psychometrics', {}).get('grit_resilience', 0)) * 100)}%) — coaches love this",
    },
    {
        "id": "STRONG_ARTICULATION",
        "category": "NARRATIVE",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("assessment_intelligence", {}).get("psychometrics", {}).get("articulation_ability") or 0) >= 0.75,
        "message": lambda p, s: "Strong articulation ability — essay potential",
    },
    {
        "id": "CLEAR_VISION",
        "category": "NARRATIVE",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("assessment_intelligence", {}).get("psychometrics", {}).get("vision_clarity") or 0) >= 0.75,
        "message": lambda p, s: "Clear vision/purpose — narrative coherence",
    },
    
    # CONTEXT
    {
        "id": "LEGACY",
        "category": "CONTEXT",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("demographics", {}).get("legacy", False),
        "message": lambda p, s: "Legacy status — significant admissions advantage",
    },
    {
        "id": "FIRST_GEN",
        "category": "CONTEXT",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("demographics", {}).get("first_gen", False),
        "message": lambda p, s: "First-generation college student (1.15x multiplier)",
    },
    {
        "id": "RECRUITED_ATHLETE",
        "category": "CONTEXT",
        "priority": Priority.CRITICAL,
        "check": lambda p, s: p.get("demographics", {}).get("recruited_athlete", False),
        "message": lambda p, s: "Recruited athlete status (2.5x multiplier)",
    },
]


# =============================================================================
# HOLDING BACK FACTOR DEFINITIONS
# =============================================================================

HOLDING_BACK_FACTOR_CONFIGS: List[Dict[str, Any]] = [
    # APTITUDE
    {
        "id": "NO_AWARDS",
        "category": "APTITUDE",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("aptitude", {}).get("awards_normalized", 0) == 0 or not p.get("aptitude", {}).get("academic_awards"),
        "message": lambda p, s: "No academic awards (0.15 aptitude weight unfilled)",
        "improvement_path": "Enter national competitions: USAMO, Science Olympiad, AMC/AIME, Regeneron STS",
    },
    {
        "id": "LOW_GPA",
        "category": "APTITUDE",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("aptitude", {}).get("gpa_normalized", 0) < FACTOR_THRESHOLDS["weak"]["gpa_normalized"],
        "message": lambda p, s: f"GPA ({p.get('aptitude', {}).get('gpa_weighted', 'N/A')}) below Ivy median — academic concern",
        "improvement_path": "Focus on upward trend in remaining semesters; consider test-optional enhancement",
    },
    {
        "id": "LOW_SAT",
        "category": "APTITUDE",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("aptitude", {}).get("sat_normalized", 0) < FACTOR_THRESHOLDS["weak"]["sat_normalized"],
        "message": lambda p, s: f"SAT ({p.get('aptitude', {}).get('sat_total', 'N/A')}) below competitive range",
        "improvement_path": "Consider test-optional schools or intensive prep for 100+ point improvement",
    },
    
    # PASSION
    {
        "id": "LOW_PROJECT_IMPACT",
        "category": "PASSION",
        "priority": Priority.HIGH,
        "check": lambda p, s: (p.get("passion", {}).get("project_normalized") or 0) < 0.50,
        "message": lambda p, s: f"Low project impact ({p.get('passion', {}).get('project_impact') or 0} people) — aim for 200+",
        "improvement_path": "Scale existing project or launch new initiative with measurable reach",
    },
    {
        "id": "PARTICIPANT_ONLY",
        "category": "PASSION",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("passion", {}).get("leadership_level") in [None, "PARTICIPANT"],
        "message": lambda p, s: "No leadership positions — missing key differentiator",
        "improvement_path": "Run for officer positions or found something new this summer",
    },
    {
        "id": "NO_RESEARCH",
        "category": "PASSION",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("passion", {}).get("research_level") in [None, "NONE"],
        "message": lambda p, s: "No research experience — missing intellectual depth signal",
        "improvement_path": "Email professors for summer research; even independent projects count",
    },
    {
        "id": "SHORT_COMMITMENT",
        "category": "PASSION",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("passion", {}).get("ec_commitment_years") or 0) < 2,
        "message": lambda p, s: f"Short EC commitment ({p.get('passion', {}).get('ec_commitment_years', 0)} years) — depth concern",
        "improvement_path": "Deepen existing activities rather than starting new ones",
    },
    
    # COMMUNITY
    {
        "id": "WEAK_COMMUNITY",
        "category": "COMMUNITY",
        "priority": Priority.HIGH,
        "check": lambda p, s: s.get("community", 0) < 50,
        "message": lambda p, s: f"Community score {s.get('community', 0):.0f}% — volunteer leadership gap",
        "improvement_path": "Take leadership role in existing service or create sustainable initiative",
    },
    {
        "id": "LOW_SERVICE_HOURS",
        "category": "COMMUNITY",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("community", {}).get("service_hours") or 0) < 50,
        "message": lambda p, s: f"Low service hours ({p.get('community', {}).get('service_hours', 0)}) — commitment concern",
        "improvement_path": "Commit to regular weekly volunteering (5+ hours/week)",
    },
    
    # CONTEXT
    {
        "id": "HIGH_SATURATION",
        "category": "CONTEXT",
        "priority": Priority.HIGH,
        "check": lambda p, s: p.get("high_school", {}).get("saturation_level") == "HIGH",
        "message": lambda p, s: f"High school saturation ({p.get('high_school', {}).get('ivy_applicants_per_year', 0)}+ Ivy apps/year) — differentiation critical",
        "improvement_path": "Ensure unique positioning vs. typical applicants from your school",
    },
    {
        "id": "CS_PENALTY",
        "category": "CONTEXT",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: p.get("intended_major") in ["Computer Science", "CS"] and p.get("demographics", {}).get("ethnicity") == "Asian",
        "message": lambda p, s: "CS + Asian demographic = highly competitive intersection (0.55-0.70x)",
        "improvement_path": "Emphasize unique angle beyond typical CS narrative",
    },
    {
        "id": "SATURATED_DEMOGRAPHIC",
        "category": "CONTEXT",
        "priority": Priority.MEDIUM,
        "check": lambda p, s: (p.get("demographics", {}).get("ethnicity_multiplier") or 1.0) < 1.0,
        "message": lambda p, s: f"Competitive demographic context ({p.get('demographics', {}).get('ethnicity', 'N/A')}) in saturated region",
        "improvement_path": "Build unique narrative that transcends demographic patterns",
    },
]


# =============================================================================
# FACTOR ANALYSIS FUNCTIONS
# =============================================================================

def analyze_helping_factors(
    profile: Dict[str, Any],
    category_scores: Dict[str, float],
    max_factors: int = 5
) -> List[Factor]:
    """
    Analyze helping factors (green bullets) for a profile.
    
    Returns the top factors sorted by priority, then by category order.
    """
    factors = []
    
    for config in HELPING_FACTOR_CONFIGS:
        try:
            if config["check"](profile, category_scores):
                message = config["message"](profile, category_scores)
                factors.append(Factor(
                    id=config["id"],
                    category=config["category"],
                    message=message,
                    priority=config["priority"],
                ))
        except Exception:
            # Skip factors that fail due to missing data
            continue
    
    # Sort by priority (CRITICAL first), then category
    category_order = ["APTITUDE", "PASSION", "COMMUNITY", "NARRATIVE", "CONTEXT"]
    factors.sort(key=lambda f: (f.priority, category_order.index(f.category) if f.category in category_order else 99))
    
    return factors[:max_factors]


def analyze_holding_back_factors(
    profile: Dict[str, Any],
    category_scores: Dict[str, float],
    max_factors: int = 5
) -> List[Factor]:
    """
    Analyze holding back factors (amber warnings) for a profile.
    
    Returns the top factors with improvement paths, sorted by priority.
    """
    factors = []
    
    for config in HOLDING_BACK_FACTOR_CONFIGS:
        try:
            if config["check"](profile, category_scores):
                message = config["message"](profile, category_scores)
                factors.append(Factor(
                    id=config["id"],
                    category=config["category"],
                    message=message,
                    priority=config["priority"],
                    improvement_path=config.get("improvement_path"),
                ))
        except Exception:
            # Skip factors that fail due to missing data
            continue
    
    # Sort by priority
    factors.sort(key=lambda f: f.priority)
    
    return factors[:max_factors]


def get_complete_analysis(
    profile: Dict[str, Any],
    category_scores: Dict[str, float]
) -> FactorAnalysis:
    """
    Get complete factor analysis including helping, holding back, and net position.
    """
    helping = analyze_helping_factors(profile, category_scores)
    holding_back = analyze_holding_back_factors(profile, category_scores)
    
    # Determine net position
    help_weight = sum(5 - f.priority for f in helping)
    hold_weight = sum(5 - f.priority for f in holding_back)
    
    if help_weight > hold_weight * 1.5:
        net_position = "STRONG"
    elif hold_weight > help_weight * 1.5:
        net_position = "NEEDS_WORK"
    else:
        net_position = "BALANCED"
    
    # Top priority is first holding back factor (most urgent to fix)
    top_priority = holding_back[0] if holding_back else None
    
    return FactorAnalysis(
        helping=helping,
        holding_back=holding_back,
        net_position=net_position,
        top_priority=top_priority,
    )


# =============================================================================
# TRANSFORMATION PATHWAYS
# =============================================================================

WEAKNESS_TRANSFORMATIONS: Dict[str, Dict[str, Any]] = {
    "NO_AWARDS": {
        "narrative": "Transform 'no awards' into 'authentic pursuit' — you do it for passion, not recognition",
        "action_items": [
            "Enter 2-3 competitions before application deadline",
            "Document your projects as 'self-directed learning'",
            "Frame existing work as research contributions",
        ],
        "essay_angle": "I stopped chasing trophies and started chasing understanding",
    },
    "LOW_PROJECT_IMPACT": {
        "narrative": "Transform 'small scale' into 'intentional depth' — quality over viral reach",
        "action_items": [
            "Document all individuals you've helped",
            "Get testimonials from beneficiaries",
            "Scale incrementally with measurable milestones",
        ],
        "essay_angle": "I learned that changing one life completely matters more than touching thousands superficially",
    },
    "PARTICIPANT_ONLY": {
        "narrative": "Transform 'participant' into 'learner who led through action'",
        "action_items": [
            "Take on specific project leadership (even informal)",
            "Organize one event or initiative",
            "Document your contributions even without title",
        ],
        "essay_angle": "I learned that leadership isn't a title—it's showing up when others won't",
    },
    "NO_RESEARCH": {
        "narrative": "Transform 'no research' into 'self-directed inquiry'",
        "action_items": [
            "Start an independent reading/investigation project",
            "Document your questions and methodology",
            "Reach out to 5 professors for summer opportunities",
        ],
        "essay_angle": "I didn't wait for a lab to start asking questions",
    },
    "SHORT_COMMITMENT": {
        "narrative": "Transform 'short tenure' into 'intensity of impact'",
        "action_items": [
            "Document everything you've achieved in short time",
            "Show progression and growth trajectory",
            "Plan for sustained involvement through senior year",
        ],
        "essay_angle": "In 18 months, I accomplished what most take 4 years to build",
    },
    "WEAK_COMMUNITY": {
        "narrative": "Transform weak community score into 'depth of individual impact'",
        "action_items": [
            "Create sustainable service project",
            "Document hours and impact systematically",
            "Take on volunteer leadership role",
        ],
        "essay_angle": "I learned that community isn't about hours—it's about relationships",
    },
    "HIGH_SATURATION": {
        "narrative": "Transform saturation challenge into 'standing out from the crowd'",
        "action_items": [
            "Identify your unique angle vs. typical applicants",
            "Build relationships with AOs through info sessions",
            "Develop niche expertise within your spike",
        ],
        "essay_angle": "I'm not just another [school name] applicant—here's why",
    },
    "CS_PENALTY": {
        "narrative": "Transform CS penalty into 'CS+X interdisciplinary vision'",
        "action_items": [
            "Develop distinct intersection (CS + Art, CS + Biology, etc.)",
            "Build projects outside typical CS domains",
            "Emphasize humanistic applications of technical skills",
        ],
        "essay_angle": "I code, but my real passion is [unexpected application]",
    },
}


def transform_weakness(factor_id: str) -> Optional[Dict[str, Any]]:
    """
    Get transformation pathway for a specific weakness.
    Used by agents to provide constructive feedback.
    """
    return WEAKNESS_TRANSFORMATIONS.get(factor_id)


def get_transformation_for_factors(
    holding_back: List[Factor]
) -> List[Dict[str, Any]]:
    """
    Get transformation pathways for all holding back factors.
    """
    transformations = []
    for factor in holding_back:
        transform = transform_weakness(factor.id)
        if transform:
            transformations.append({
                "factor_id": factor.id,
                "factor_message": factor.message,
                "priority": factor.priority,
                **transform,
            })
    return transformations
