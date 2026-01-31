# IMPLEMENTS: ACP-004, ACP-006 - Pure Math & Algorithms (No AI)
# THE LOGIC LAW: This file contains ZERO LLM calls. Pure Python only.
"""
GamePlan Logic Utilities

Extracted math and algorithms for the GamePlan orchestrator.
These functions are deterministic and testable.

Key Algorithms:
- ACP-004: Strategic Overwhelm (1.4x task inflation)
- ACP-006: Identity Seed Planting (8-month lead time)
- Phasing: Timeline generation
- 1-Swap Rule: STEM school strategy
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dateutil.relativedelta import relativedelta


# =============================================================================
# ACP-004: STRATEGIC OVERWHELM
# =============================================================================

def apply_strategic_overwhelm(
    activities: List[Dict[str, Any]], 
    factor: float = 1.4
) -> List[Dict[str, Any]]:
    """
    ACP-004: Strategic Overwhelm
    
    Inflates the task list by a factor (default 1.4x) to guarantee yield.
    
    The Psychology: Students complete ~70% of planned tasks. By planning 140%,
    we ensure they hit 100% of critical goals.
    
    Args:
        activities: Base list of activities/tasks
        factor: Inflation multiplier (default 1.4 = 40% buffer)
        
    Returns:
        Overwhelmed task list with stretch goals added
        
    Example:
        >>> base = [{"name": "Research Paper"}, {"name": "Competition"}]
        >>> overwhelmed = apply_strategic_overwhelm(base, 1.4)
        >>> len(overwhelmed)  # Should be ~3 (2 * 1.4 = 2.8 → 3)
        3
    """
    if not activities:
        return []
    
    target_count = int(len(activities) * factor)
    overwhelmed = activities.copy()
    
    # Add stretch goals until we hit target
    idx = 0
    while len(overwhelmed) < target_count and activities:
        source = activities[idx % len(activities)]
        
        # Clone and mark as stretch
        stretch_goal = source.copy()
        stretch_goal["name"] = f"{source['name']} (Stretch Goal)"
        stretch_goal["is_stretch"] = True
        stretch_goal["priority"] = "LOW"  # Stretch goals are optional
        
        overwhelmed.append(stretch_goal)
        idx += 1
    
    return overwhelmed


# =============================================================================
# ACP-006: IDENTITY SEED PLANTING
# =============================================================================

def generate_identity_seeds(
    deadlines: List[Dict[str, str]], 
    brand: str,
    lead_months: int = 8
) -> List[Dict[str, Any]]:
    """
    ACP-006: Identity Seed Planting
    
    Plants narrative seeds X months before they need to bloom.
    
    The Strategy: Essays written in August feel forced. Essays that document
    a journey started 8 months ago feel authentic.
    
    Args:
        deadlines: List of {name, date} dicts (date in ISO format)
        brand: Student's brand statement
        lead_months: How many months before deadline to plant (default 8)
        
    Returns:
        List of identity seeds with plant dates
        
    Example:
        >>> deadlines = [{"name": "Early Action", "date": "2026-11-01"}]
        >>> seeds = generate_identity_seeds(deadlines, "The Ethical AI Disruptor")
        >>> seeds[0]["plant_date"]  # Should be ~March 2026 (8 months before Nov)
        '2026-03-01'
    """
    seeds = []
    
    for deadline in deadlines:
        try:
            bloom_date = datetime.fromisoformat(deadline["date"].replace("Z", "+00:00"))
        except (ValueError, KeyError):
            # Skip invalid dates
            continue
        
        # Calculate plant date (X months before bloom)
        plant_date = bloom_date - relativedelta(months=lead_months)
        
        seed = {
            "target": deadline["name"],
            "plant_date": plant_date.strftime("%Y-%m-%d"),
            "bloom_date": bloom_date.strftime("%Y-%m-%d"),
            "action": f"Begin narrative thread for {deadline['name']} aligning with '{brand}'",
            "lead_time_months": lead_months,
        }
        
        seeds.append(seed)
    
    # Sort by plant date (earliest first)
    return sorted(seeds, key=lambda x: x["plant_date"])


# =============================================================================
# PHASING: TIMELINE GENERATION
# =============================================================================

def calculate_phasing(
    current_grade: int,
    current_date: Optional[str] = None,
    target_date: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate quarterly phases from current grade to target deadline.
    
    Phases:
    - Foundation (9th-10th): Build base skills
    - Acceleration (11th): Scale impact
    - Polish (12th Fall): Perfect presentation
    
    Args:
        current_grade: 9, 10, 11, or 12
        current_date: ISO date string (defaults to today)
        target_date: ISO date string (defaults to Nov 1 of senior year)
        
    Returns:
        List of phase dictionaries with start/end dates and focus
    """
    if current_date is None:
        start = datetime.now()
    else:
        start = datetime.fromisoformat(current_date.replace("Z", "+00:00"))
    
    # Default target: November 1 of 12th grade
    if target_date is None:
        years_to_senior = 12 - current_grade
        target = start + relativedelta(years=years_to_senior, month=11, day=1)
    else:
        target = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
    
    phases = []
    
    # Define phase templates
    phase_templates = {
        9: {"name": "Foundation", "focus": "Build academic base and explore interests"},
        10: {"name": "Specialization", "focus": "Identify spike and deepen expertise"},
        11: {"name": "Acceleration", "focus": "Scale impact and win recognition"},
        12: {"name": "Polish", "focus": "Perfect presentation and finalize applications"},
    }
    
    # Generate phases for each remaining grade
    for grade in range(current_grade, 13):
        template = phase_templates.get(grade, phase_templates[12])
        
        # Calculate phase boundaries
        if grade == current_grade:
            phase_start = start
        else:
            # Start of school year (September 1)
            years_ahead = grade - current_grade
            phase_start = start + relativedelta(years=years_ahead, month=9, day=1)
        
        if grade == 12:
            # Senior year ends at target date
            phase_end = target
        else:
            # End of school year (June 1)
            years_ahead = grade - current_grade
            phase_end = start + relativedelta(years=years_ahead + 1, month=6, day=1)
        
        phases.append({
            "name": f"{template['name']} (Grade {grade})",
            "start_date": phase_start.strftime("%Y-%m-%d"),
            "end_date": phase_end.strftime("%Y-%m-%d"),
            "focus": template["focus"],
            "grade": grade,
        })
    
    return phases


# =============================================================================
# 1-SWAP RULE: STEM SCHOOL STRATEGY
# =============================================================================

STEM_SCHOOLS = {
    "MIT", "Caltech", "Harvey Mudd", "Olin College", 
    "Georgia Tech", "Carnegie Mellon"
}


def generate_swap_strategy(
    core_list: List[Dict[str, Any]],
    stem_swap: Optional[Dict[str, Any]],
    school_id: str,
    swap_position: int = 3
) -> Optional[Dict[str, Any]]:
    """
    The 1-Swap Rule: For STEM schools, swap one activity.
    
    Strategy: Most students show well-rounded profiles. For MIT/Caltech,
    we swap one "soft" activity (debate, service) with a "hard tech" one
    (research, USACO, robotics).
    
    Args:
        core_list: The base 10 activities
        stem_swap: The STEM-heavy alternate activity
        school_id: Target school name
        swap_position: Which position to swap (default 3)
        
    Returns:
        SchoolDelta dict if swap needed, None otherwise
    """
    # Check if this is a STEM school
    is_stem_school = any(stem in school_id.upper() for stem in STEM_SCHOOLS)
    
    if not is_stem_school or stem_swap is None:
        return None
    
    # Get the activity being swapped out
    if swap_position <= len(core_list):
        swapped_out = core_list[swap_position - 1].get("name", "Activity")
    else:
        swapped_out = "Activity"
    
    swap_in = stem_swap.get("name", "STEM Activity")
    
    return {
        "target_school": school_id,
        "strategy_note": f"Swap '{swapped_out}' for '{swap_in}' to emphasize technical depth",
        "swapped_position": swap_position,
        "swap_with": swap_in,
        "rationale": stem_swap.get("rationale", "Demonstrates stronger STEM credentials"),
    }


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def calculate_weeks_remaining(
    current_date: Optional[str] = None,
    target_date: Optional[str] = None
) -> int:
    """Calculate weeks between current date and target deadline"""
    if current_date is None:
        start = datetime.now()
    else:
        start = datetime.fromisoformat(current_date.replace("Z", "+00:00"))
    
    if target_date is None:
        # Default to Nov 1 next year
        end = start + relativedelta(years=1, month=11, day=1)
    else:
        end = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
    
    delta = end - start
    return max(0, delta.days // 7)


def is_deadline_realistic(
    task_weeks: int,
    weeks_remaining: int,
    buffer_factor: float = 1.2
) -> bool:
    """
    Check if a task can realistically be completed before deadline.
    
    Includes 20% buffer for unexpected delays.
    """
    required_weeks = task_weeks * buffer_factor
    return weeks_remaining >= required_weeks
