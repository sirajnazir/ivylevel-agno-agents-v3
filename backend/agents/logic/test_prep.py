# IMPLEMENTS: IvyLevel v8.0 - Test Prep Logic
# THE LOGIC LAW: Pure Python, No LLM.

def diagnose_test_gap(practice_score: int, actual_score: int) -> str:
    """
    Jenny's Diagnosis: Practice vs. Actual Gap.
    
    Args:
        practice_score: Score on practice tests
        actual_score: Official sitting score
        
    Returns:
        Diagnosis string: "EXECUTION_CRISIS", "CONSISTENCY_ISSUE", "KNOWLEDGE_GAP"
    """
    gap = practice_score - actual_score
    if gap > 100:
        return "EXECUTION_CRISIS" # Environment/Anxiety/Rushing
    if gap > 50:
        return "CONSISTENCY_ISSUE"
    return "KNOWLEDGE_GAP"

def recommend_retake(current_score: int, target_score: int, attempts: int) -> bool:
    """
    The Retake Decision Framework.
    Rule: 3 attempts max. Don't retake if <50pt improvement likely or diminishing returns.
    
    Args:
        current_score: Best official score
        target_score: Goal score
        attempts: Number of official sittings
        
    Returns:
        Boolean indicating if a retake is recommended.
    """
    if attempts >= 3: 
        return False
    if current_score >= 1560: 
        return False # "All kind of the same" at this level
    if (target_score - current_score) < 30: 
        return False
        
    return True
