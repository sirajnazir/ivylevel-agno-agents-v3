from typing import Dict, List, Any

# =============================================================================
# v9.1: EXECUTION TACTICS (The Knowledge Base)
# =============================================================================

def get_award_tactics(award_name: str) -> dict:
    """
    Returns specific execution assets for high-value awards.
    This acts as the "Knowledge Base" for the Awards Agent in Execution Mode.
    """
    name_lower = award_name.lower()
    
    # 1. NCWIT (National Center for Women & Information Technology)
    if "ncwit" in name_lower:
        return {
            "strategy": "The 'Tech for Good' Narrative",
            "essay_structure": "Origin Story (Problem) -> Progression (Skill) -> Impact Metrics (Solution) -> Future Vision",
            "buzzwords": ["Female Developer", "Rural Community", "Self-Taught", "Barriers Overcome", "Accessibility"],
            "rubric_focus": "Scored on: Innovation, Impact (Quantitative), and Technical Depth.",
            "common_pitfalls": "Focusing too much on 'being a girl' rather than 'what you built'.",
            "template": "Essay_Template_NCWIT_v1"
        }
        
    # 2. Scholastic Art & Writing
    if "scholastic" in name_lower:
        return {
            "strategy": "The 'Unique Voice' Approach",
            "essay_structure": "In Medias Res (Hook) -> Vulnerability -> Insight -> Craft",
            "buzzwords": ["Originality", "Technical Skill", "Personal Voice/Vision"],
            "rubric_focus": "Originality, Technical Skill, and Emergence of a Personal Voice.",
            "common_pitfalls": "Using clichés (eyes mirrors of soul), rhyming poetry without meter.",
            "template": "Portfolio_Submission_Checklist"
        }
        
    # 3. Cameron Impact Scholarship
    if "cameron" in name_lower:
        return {
            "strategy": "The 'Servant Leader' Archetype",
            "essay_structure": "Community Problem -> Initiative Taken -> Resistance Faced -> Institutional Change",
            "buzzwords": ["Impact", "Leadership", "Service", "Merit", "Legacy"],
            "rubric_focus": "Excellence in academics, extracurriculars, leadership, and community service.",
            "common_pitfalls": "Listing titles without showing tangible impact or hours.",
            "template": "Impact_Statement_Matrix"
        }
        
    # 4. Coca-Cola Scholars
    if "coca" in name_lower or "coke" in name_lower:
        return {
            "strategy": "The 'Change Agent'",
            "essay_structure": "Leadership Moment -> Scaling Impact -> Value System",
            "buzzwords": ["Leadership", "Legacy", "Service", "Change Agent"],
            "rubric_focus": "Leadership, Service, and Commitment to making a significant impact.",
            "common_pitfalls": "Being 'well-rounded' instead of 'spiky' in service.",
            "template": "Leadership_Essay_Framework"
        }
    
    # Default / Generic
    return {
        "strategy": "Standard Competence Framework",
        "advice": "Focus on the prompt's core values. Connect back to your Brand Statement.",
        "rubric_focus": "Clarity, Specificity, and Alignment with Organization Values.",
        "buzzwords": ["Leadership", "Initiative", "Impact"]
    }

# =============================================================================
# v7.1: PLANNING LOGIC (Restored for Backward Compatibility)
# =============================================================================

def get_probability_tier(fit_score: float) -> str:
    """Maps score to probability tier description."""
    if fit_score >= 0.75: return "Tier 1: Definite (Perfect Fit)"
    if fit_score >= 0.55: return "Tier 2: Likely"
    if fit_score >= 0.35: return "Tier 3: Possible"
    return "Tier 4: Stretch"

def get_tier_number(fit_score: float) -> int:
    """Maps score to tier number (1-4)."""
    if fit_score >= 0.75: return 1
    if fit_score >= 0.55: return 2
    if fit_score >= 0.35: return 3
    return 4

def calculate_award_fit(student: Dict, award: Dict) -> float:
    """Calculates fit score between student and award."""
    score = 0.2 # Base
    
    # Archetype Fit (Major factor)
    student_archetype = student.get('archetype', 'General').upper()
    award_fits = [a.upper() for a in award.get('archetype_fit', [])]
    
    if student_archetype in award_fits:
        score += 0.4
    
    # Timeline Fit
    # Assuming 'identity.grade' matches 'timeline' logic roughly
    # For now, simplistic check
    grade = student.get('identity', {}).get('grade', 11)
    if 'Junior' in award.get('timeline', '') and grade == 11:
        score += 0.1
        
    return min(1.0, score + 0.1) # Boost for generic fit

def apply_win_cascade(awards: List[Dict]) -> List[Dict]:
    """Sorts awards by impact level: SCHOOL -> REGIONAL -> STATE -> NATIONAL."""
    order = {"SCHOOL": 1, "REGIONAL": 2, "STATE": 3, "NATIONAL": 4, "INTERNATIONAL": 5}
    return sorted(awards, key=lambda x: order.get(x.get('impact_level', 'SCHOOL'), 0))

def is_guaranteed_win(name: str) -> bool:
    """Checks if award is a guaranteed win based on criteria (e.g. PVSA)."""
    guaranteed_keywords = [
        "Presidential Volunteer Service",
        "AP Scholar",
        "National Honor Society"
    ]
    return any(k in name for k in guaranteed_keywords)

def validate_awards_portfolio(portfolio: List[Dict]) -> Dict:
    """
    Validates the 2-2-1 Rule (2 Reach, 2 Target, 1 Safety).
    Reach: Tier 3/4 (Score < 0.55)
    Target: Tier 2 (0.55 <= Score < 0.75)
    Safety: Tier 1 (Score >= 0.75)
    """
    reach = 0
    target = 0
    safety = 0
    
    for item in portfolio:
        score = item.get('fit_score', 0)
        if score >= 0.75: safety += 1
        elif score >= 0.55: target += 1
        else: reach += 1
        
    is_valid = (reach >= 2 and target >= 2 and safety >= 1)
    
    violations = []
    if reach < 2: violations.append("Need 2 Reach awards")
    if target < 2: violations.append("Need 2 Target awards")
    if safety < 1: violations.append("Need 1 Safety award")
    
    return {
        "is_valid": is_valid,
        "violations": violations,
        "reach_count": reach,
        "target_count": target,
        "safety_count": safety
    }
