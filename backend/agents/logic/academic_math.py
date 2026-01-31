"""
IvyQuest v10.0 CRI (Context Relativity Index) Computation
=========================================================
CRI = (Performance / Expected_Per_Context) × Barrier_Multiplier

CRITICAL: Uses PRECOMPUTED Chetty baselines from database.
Per v9.1 correction: No runtime API calls to Opportunity Insights.

Huda Benchmark: CRI > 1.2 (Huda actual: 1.35)
"""

from typing import Dict, Optional, List, Any
from backend.config import settings
import structlog

logger = structlog.get_logger()


async def get_chetty_baseline(
    zip_code: str,
    school_id: Optional[str] = None
) -> Dict:
    """
    Get precomputed Chetty baseline from database.

    CRITICAL: This uses PRECOMPUTED data, NOT runtime API calls.
    Per v9.1 spec correction.

    Args:
        zip_code: 5-digit ZIP code
        school_id: Optional school identifier for more granular data

    Returns:
        Dict with expected_performance, multiplier, mobility_rate, source
    """
    from .database import get_chetty_baseline_db
    return await get_chetty_baseline_db(zip_code, school_id)


def compute_performance(profile: Dict) -> float:
    """
    Compute aggregate performance score (0-1 scale).

    Components:
    - GPA (25%): Normalized to 0-1
    - Test Scores (20%): SAT normalized to 0-1
    - Activities (25%): Count and depth
    - Awards (15%): Recognition count and level
    - Leadership (15%): Leadership positions

    Args:
        profile: Profile dict with aptitude/passion/community attributes

    Returns:
        Float 0-1 representing overall performance
    """
    score = 0.0
    weights = {
        "gpa": 0.25,
        "test_scores": 0.20,
        "activities": 0.25,
        "awards": 0.15,
        "leadership": 0.15
    }

    # GPA (normalized to 0-1, assuming 4.0 scale or 5.0 weighted)
    gpa = profile.get("gpa_weighted") or profile.get("gpa_unweighted") or 3.0
    gpa_max = 5.0 if gpa > 4.0 else 4.0
    gpa_score = min(gpa / gpa_max, 1.0)
    score += gpa_score * weights["gpa"]

    # Test scores (SAT normalized to 0-1)
    sat = profile.get("sat_score") or profile.get("sat_total") or 1000
    sat_score = min(sat / 1600, 1.0)
    score += sat_score * weights["test_scores"]

    # Activities (count and depth)
    activities = profile.get("activities") or profile.get("extracurriculars") or []
    if isinstance(activities, list):
        activity_count = len(activities)
    else:
        activity_count = int(activities) if activities else 0
    activity_score = min(activity_count / 10, 1.0)
    score += activity_score * weights["activities"]

    # Awards (count and prestige)
    awards = profile.get("awards") or profile.get("academic_awards") or []
    if isinstance(awards, list):
        award_count = len(awards)
    else:
        award_count = int(awards) if awards else 0
    award_score = min(award_count / 5, 1.0)
    score += award_score * weights["awards"]

    # Leadership positions
    leadership = profile.get("leadership_positions") or profile.get("leadership_level") or 0
    if isinstance(leadership, list):
        leadership_count = len(leadership)
    elif isinstance(leadership, str):
        # Handle categorical leadership levels
        leadership_map = {"none": 0, "member": 0.25, "officer": 0.5, "founder": 0.75, "leader": 1.0}
        leadership_count = leadership_map.get(leadership.lower(), 0.25) * 3
    else:
        leadership_count = int(leadership) if leadership else 0
    leadership_score = min(leadership_count / 3, 1.0)
    score += leadership_score * weights["leadership"]

    return round(score, 3)


def get_constraint_multiplier(constraints: List[str]) -> float:
    """
    Calculate barrier multiplier based on constraints overcome.

    Per ACP-003 and CRI spec:
    - Each constraint type adds a small boost
    - Max boost is 1.5x (50% increase)

    Args:
        constraints: List of constraint identifiers

    Returns:
        Float multiplier (1.0 - 1.5)
    """
    if not constraints:
        return 1.0

    # Constraint boost values
    constraint_boosts = {
        "family_duties": 0.08,
        "low_ses": 0.10,
        "underrepresented": 0.08,
        "first_gen": 0.08,
        "work_hours": 0.06,
        "rural": 0.05,
        "immigrant": 0.06,
        "neurodiverse": 0.05,
        "health_challenges": 0.06,
        "single_parent": 0.05,
        "limited_resources": 0.07,
        "language_barrier": 0.05,
    }

    total_boost = 0.0
    for constraint in constraints:
        constraint_lower = constraint.lower().replace(" ", "_")
        boost = constraint_boosts.get(constraint_lower, 0.03)  # Default 3% for unknown
        total_boost += boost

    # Cap at 50% total boost
    return min(1.0 + total_boost, 1.5)


async def compute_cri(profile: Dict) -> float:
    """
    Compute Context Relativity Index (CRI).

    Formula: CRI = (Performance / Expected) × Barrier_Multiplier × Chetty_Multiplier

    The CRI measures how well a student performs RELATIVE to what's
    expected given their context (ZIP code, demographics, constraints).

    A CRI > 1.0 means performing above expectations.
    Huda benchmark: CRI > 1.2 (actual: 1.35)

    Args:
        profile: Full profile dict with attributes and context

    Returns:
        Float CRI value (typically 0.5 - 3.0)
    """
    # Get Chetty baseline for this student's context
    zip_code = profile.get("zip_code") or profile.get("zip") or "00000"
    school_id = profile.get("school_id")
    baseline = await get_chetty_baseline(zip_code, school_id)

    expected = baseline.get("expected_performance", 0.7)
    chetty_multiplier = baseline.get("multiplier", 1.0)

    # Compute actual performance
    performance = compute_performance(profile)

    # Base CRI: performance relative to expected
    if expected > 0:
        base_cri = performance / expected
    else:
        base_cri = 1.0

    # Apply barrier multiplier if constraints are being overcome
    constraints = profile.get("constraints") or []
    if isinstance(constraints, str):
        constraints = [constraints]

    barrier_multiplier = 1.0
    if len(constraints) > 0 and performance > expected:
        # Student is overcoming barriers AND performing above expected
        barrier_multiplier = settings.cri_barrier_boost  # Default 1.2

    # Apply constraint-specific multiplier
    constraint_multiplier = get_constraint_multiplier(constraints)

    # Final CRI calculation
    cri = base_cri * barrier_multiplier * chetty_multiplier * constraint_multiplier

    # Cap at max value
    cri = min(cri, settings.cri_max_value)

    logger.info(
        "cri_computed",
        profile_id=profile.get("id"),
        performance=performance,
        expected=expected,
        base_cri=base_cri,
        barrier_multiplier=barrier_multiplier,
        constraint_multiplier=constraint_multiplier,
        chetty_multiplier=chetty_multiplier,
        final_cri=cri
    )

    return round(cri, 3)


def compute_cri_components(
    profile: Dict,
    baseline: Dict,
    performance: float
) -> Dict:
    """
    Compute individual CRI components for explainability.

    Useful for debugging and showing users why their CRI is what it is.

    Returns:
        Dict with all CRI components
    """
    expected = baseline.get("expected_performance", 0.7)
    constraints = profile.get("constraints") or []

    return {
        "performance": performance,
        "expected": expected,
        "base_cri": performance / expected if expected > 0 else 1.0,
        "barrier_multiplier": settings.cri_barrier_boost if len(constraints) > 0 and performance > expected else 1.0,
        "constraint_multiplier": get_constraint_multiplier(constraints),
        "chetty_multiplier": baseline.get("multiplier", 1.0),
        "constraints_count": len(constraints),
        "constraints": constraints,
        "zip_code": profile.get("zip_code"),
        "source": baseline.get("source", "unknown")
    }


async def compute_eds(profile_id: str) -> float:
    """
    Compute Execution Debt Score (EDS).

    Formula: EDS = Σ(missed_microsteps × days_delayed × difficulty_weight)

    Target: EDS < 50 (Huda benchmark: 12)

    This calls the database function to calculate EDS from project_steps.

    Args:
        profile_id: Profile UUID

    Returns:
        Float EDS value
    """
    from .database import supabase

    try:
        result = supabase.rpc("calculate_eds", {
            "p_profile_id": profile_id
        }).execute()
        return result.data or 0.0
    except Exception as e:
        logger.error("compute_eds_error", profile_id=profile_id, error=str(e))
        return 0.0

# =============================================================================
# ACADEMIC UTILITIES (v9.2) - Added for AcademicAgent
# =============================================================================

def detect_grade_crisis(grades: Dict[str, float]) -> Dict[str, Any]:
    """
    Check for grades < 87%% (Crisis) or < 90%% (At Risk).
    """
    crisis_courses = []
    warnings = []
    
    # Handle case where grades might mean numeric or letter
    # Assuming float for now as per v9.1 spec
    for course, grade in grades.items():
        try:
            g_val = float(grade)
            if g_val < 87:
                crisis_courses.append(course)
            elif g_val < 90:
                warnings.append(course)
        except:
            pass # Skip non-numeric
            
    if crisis_courses:
        return {"status": "CRISIS", "crisis": crisis_courses, "warnings": warnings}
    elif warnings:
        return {"status": "AT_RISK", "warnings": warnings}
    return {"status": "GREEN"}

def optimize_168_hours(homework_load: float) -> Dict[str, Any]:
    """
    Calculate time budget.
    168 - (Sleep 56 + School 35 + Essentials 21) = 56 remaining.
    Subtract homework to find EC budget.
    """
    fixed_commitments = 56 + 35 + 21 # 112 hours
    remaining = 168 - fixed_commitments - homework_load
    
    warning = None
    if homework_load > 14:
        warning = "Homework load exceeds 14h cap (168-Hour Rule Violation)"
        
    return {
        "ec_available_hours": max(0, round(remaining, 1)),
        "warning": warning
    }

def calculate_rigor_index(taken_aps: int, school_offerings: int) -> float:
    """
    Calculate AP utilization rate.
    Target is usually 60%% utilization of available APs (capped).
    """
    if not school_offerings:
        return 1.0
    return round(min(1.0, taken_aps / school_offerings), 2)
