from typing import Dict, List

# PRD 5.1 & File 03: The Hidden Probability Matrix
def calculate_fit_score(student: Dict, opportunity: Dict) -> float:
    """
    Calculates the 'Mutual Fit' score (0.0 - 1.0).
    Based on Jenny's weighted formula (File 10, 2.1).
    """
    score = 0.0
    
    # Get student attributes safely from profile structure
    # Supports both flat structure and nested structure (e.g. from context)
    demographics = student.get('demographics', [])
    identity_tags = student.get('identity_tags', [])
    # Also check under 'identity' key if present
    if 'identity' in student and isinstance(student['identity'], dict):
        demographics.extend(student['identity'].get('demographics', []))
    
    student_tags = set(demographics + identity_tags)
    
    opp_tags = set(opportunity.get('target_demographics', []))
    
    # 1. Demographic Match (25%) - The strongest predictor
    if opp_tags:
        if not student_tags.intersection(opp_tags):
            return 0.0 # Hard Fail if specific demographic required
        else:
            score += 0.25
    else:
        # If no specific target, assume neutral (partial score or 0? Jenny logic suggests 0 if no match, 
        # but if opp is open to all, we might give base points. 
        # Let's assume explicit tags imply restriction. If no tags, anyone fits.)
        score += 0.10 # Base fit for open opportunities
        
    # 2. Spike Alignment (20%)
    # Does matches student's passion/spike?
    student_spike = student.get('spike_category')
    # Or derive from 'passion' -> 'interests'
    if not student_spike and 'passion' in student:
        # Simple derivation
        student_spike = "TECH" if "CS" in str(student['passion']) else "GENERAL"
        
    if opportunity.get('category') == student_spike:
        score += 0.20
        
    # 3. Impact Match (15%)
    # Does student have the numbers?
    student_impact = student.get('impact_score', 0)
    # Check embedded assessment score
    if student_impact == 0 and 'assessment' in student:
        student_impact = student['assessment'].get('ivy_plus_score', 0) / 10 # Scale down to 0-10 or similar?
        # Actually logic math assumes direct comparison.
    
    if student_impact >= opportunity.get('min_impact_score', 0):
        score += 0.15
        
    # 5. Strategic Value (10%)
    if opportunity.get('has_internship') or opportunity.get('prize_money', 0) > 10000:
        score += 0.10
        
    # Base viability (20%) - Assumes student meets grade eligibility checked elsewhere
    score += 0.20
    
    # Cap at 1.0
    return min(1.0, round(score, 2))

def get_probability_tier(fit_score: float) -> str:
    """
    Maps Fit Score to Jenny's Language (File 03).
    """
    if fit_score >= 0.75: return "Tier 1: Perfect Fit (Must Apply)"
    if fit_score >= 0.55: return "Tier 2: Strong Chance (Should Apply)"
    if fit_score >= 0.35: return "Tier 3: Worth Trying (Volume Play)"
    if fit_score >= 0.15: return "Tier 4: Long Shot (Practice Value)"
    return "Tier 5: Skip (Low ROI)"

def check_red_flags(student: Dict, opportunity: Dict) -> List[str]:
    """
    PRD File 04: Rejection Red Flags.
    """
    flags = []
    
    # 1. Pay-to-Play
    if opportunity.get('fee', 0) > 0:
        flags.append("Pay-to-Play (Scam Risk)")
        
    # 2. Eligibility (Age/Grade)
    grad_year = student.get('graduation_year')
    if not grad_year and 'identity' in student:
        # Infer from grade: Grade 11 in 2026 -> Grad 2027?
        # Assuming system has current year context.
        # Fallback to grade level check
        current_grade = student['identity'].get('grade')
        if current_grade:
             eligible_grades = opportunity.get('eligible_grades', [])
             if eligible_grades and current_grade not in eligible_grades:
                 flags.append(f"Ineligible Grade Level (Current: {current_grade})")
    
    if grad_year and 'eligible_years' in opportunity:
        if grad_year not in opportunity['eligible_years']:
            flags.append("Ineligible Grade Level")
        
    # 3. Active Status
    if not opportunity.get('is_active', True):
        flags.append("Program Inactive/Defunct")
        
    return flags
