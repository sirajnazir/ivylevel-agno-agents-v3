"""
IvyLevel Archetype & EC Logic v9.2
Ported from legacy_archetypeDetector.ts

PRINCIPLE: Every student has a unique profile that maps to an archetype.
Archetypes are determined by the DOMINANT characteristics of the profile.
"""
from typing import Dict, Any, List, Optional
import math

# =============================================================================
# ARCHETYPE DEFINITIONS
# =============================================================================

ARCHETYPES = {
    'SCHOLAR': {
        'label': 'The Scholar',
        'tagline': 'Excellence through intellectual mastery',
        'description': 'Strong academics with rigorous course load',
        'match_score': lambda p, s: (
            (40 if s.get('aptitude', 0) >= 70 else 20 if s.get('aptitude', 0) >= 50 else 0) +
            (20 if p.get('aptitude', {}).get('gpa', 0) >= 3.85 else 0) + # approx 0.80 normalized
            (15 if p.get('passion', {}).get('research_level', 'NONE') != 'NONE' else 0) +
            (10 if s.get('aptitude', 0) > s.get('passion', 0) else 0)
        ),
        'narrative': {
            'arc': 'discovery',
            'hook': 'Start with a moment of intellectual fascination.',
            'themes': ['intellectual curiosity', 'depth over breadth'],
            'power_words': ['discovered', 'questioned', 'uncovered']
        }
    },
    'RESEARCHER': {
        'label': 'The Researcher',
        'tagline': 'Driven by curiosity and discovery',
        'match_score': lambda p, s: (
            (50 if p.get('passion', {}).get('research_level') == 'NATIONAL' else
             35 if p.get('passion', {}).get('research_level') == 'STATE' else
             20 if p.get('passion', {}).get('research_level') == 'SCHOOL' else 0) +
            (15 if p.get('intended_major', '') in ['Computer Science', 'Biology', 'Chemistry', 'Physics'] else 0) +
            (15 if s.get('aptitude', 0) >= 60 else 0)
        ),
        'narrative': {
            'arc': 'hero_journey',
            'hook': 'Begin with the problem that hooked you.',
            'themes': ['methodical curiosity', 'failure as data'],
            'power_words': ['hypothesized', 'tested', 'persisted']
        }
    },
    'LEADER': {
        'label': 'The Leader',
        'match_score': lambda p, s: (
            (40 if 'FOUNDER' in str(p.get('passion', {}).get('leadership_level', '')) else
             35 if 'PRES' in str(p.get('passion', {}).get('leadership_level', '')) else
             20 if str(p.get('passion', {}).get('leadership_level')) == 'OFFICER' else 0) +
            (20 if s.get('passion', 0) >= 60 else 0) +
            (10 if s.get('community', 0) >= 50 else 0)
        ),
        'narrative': {
            'arc': 'transformation',
            'hook': 'Start with a moment of difficult leadership.',
            'themes': ['servant leadership', 'building others up'],
            'power_words': ['unified', 'empowered', 'built']
        }
    },
    'ENTREPRENEUR': {
        'label': 'The Entrepreneur',
        'match_score': lambda p, s: (
            (45 if 'FOUNDER' in str(p.get('passion', {}).get('leadership_level', '')) else 0) +
            (25 if p.get('passion', {}).get('project_impact', 0) >= 500 else 0) +
            (15 if p.get('intended_major', '') in ['Business', 'Economics', 'Computer Science'] else 0)
        ),
        'narrative': {
            'arc': 'hero_journey',
            'hook': 'Start with the problem you couldn\'t ignore.',
            'themes': ['problem-solving', 'creating value'],
            'power_words': ['built', 'launched', 'scaled']
        }
    },
    'CHANGEMAKER': {
        'label': 'The Changemaker',
        'match_score': lambda p, s: (
            (35 if s.get('community', 0) >= 60 else 20 if s.get('community', 0) >= 45 else 0) +
            (25 if p.get('community', {}).get('service_leadership') == 'NATIONAL' else
             15 if p.get('community', {}).get('service_leadership') == 'LOCAL' else 0) +
            (15 if p.get('community', {}).get('hours', 0) >= 200 else 0)
        ),
        'narrative': {
            'arc': 'transformation',
            'hook': 'Start with the moment you couldn\'t look away.',
            'themes': ['empathy to action', 'systemic thinking'],
            'power_words': ['served', 'partnered', 'sustained']
        }
    },
    # Truncated for MVP but structure allows easy addition of others
    'EXPLORER': {
        'label': 'The Explorer',
        'match_score': lambda p, s: 20 + (15 if not p.get('intended_major') else 0),
        'narrative': {
            'arc': 'discovery',
            'hook': 'Start with a moment of genuine curiosity.',
            'themes': ['openness', 'authentic seeking'],
            'power_words': ['explored', 'wondered', 'sought']
        }
    }
    # Add others as needed from TS: ADVOCATE, CREATOR, PERFORMER, POLYMATH, EMERGING
}

def detect_archetype(profile: Dict[str, Any], category_scores: Dict[str, float] = None) -> Dict[str, Any]:
    """
    Detect best-matching archetype.
    """
    if category_scores is None:
        # Default empty scores if not provided
        category_scores = {'aptitude': 50, 'passion': 50, 'community': 50}
        
    scored = []
    for aid, defn in ARCHETYPES.items():
        try:
            score = defn['match_score'](profile, category_scores)
        except Exception:
            score = 0
        scored.append({'id': aid, 'score': score, 'def': defn})
        
    # Sort
    scored.sort(key=lambda x: x['score'], reverse=True)
    primary = scored[0]
    
    # Alternates
    alternates = [s for s in scored[1:3] if s['score'] >= primary['score'] * 0.5]
    
    return {
        'id': primary['id'],
        'label': primary['def']['label'],
        'score': primary['score'],
        'alternates': [{'id': a['id'], 'label': a['def']['label']} for a in alternates]
    }

def get_narrative_guidance(archetype_id: str) -> Dict[str, Any]:
    """Get narrative formula."""
    arch = ARCHETYPES.get(archetype_id, ARCHETYPES['EXPLORER'])
    return arch.get('narrative', {})

def calculate_activity_impact(activity: Dict[str, Any]) -> float:
    """
    Ported helper calculate_activity_impact.
    """
    # Placeholder logic mapping inputs to 0-10 impact score
    # Usually based on role/reach
    role = activity.get('role_level', 'Participant')
    reach = activity.get('impact_metric', 0)
    
    base = 2
    if 'Founder' in role: base = 8
    elif 'Director' in role or 'President' in role: base = 6
    elif 'Officer' in role: base = 4
    
    # Reach bump
    if reach > 1000: base += 2
    elif reach > 100: base += 1
    
    return min(10.0, float(base))

# =============================================================================
# PORTFOLIO UTILITIES (v9.2) - Added for ECAgent
# =============================================================================

def calculate_web_connectivity(activities: List[Dict[str, Any]]) -> float:
    """
    Measure connectivity between activities (0.0 - 1.0).
    Higher connectivity = better narrative cohesion.
    """
    if not activities or len(activities) < 2:
        return 0.0
        
    # Mock logic: Return high score if archetype is clear
    # In real implementation this checks shared tags/clusters
    return 0.85

def validate_ec_portfolio(activities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validate portfolio against Common App constraints.
    """
    violations = []
    
    # constraint 1: Max 10 slots
    if len(activities) > 10:
        violations.append("Exceeds Common App limit (10 activities)")
        
    # constraint 2: Minimum data
    for i, act in enumerate(activities):
        if not act.get("title") and not act.get("name"):
            violations.append(f"Activity #{i+1} missing title")
            
    return {
        "is_valid": len(violations) == 0,
        "violations": violations
    }
