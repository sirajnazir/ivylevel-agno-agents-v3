from typing import List, Dict, Any

class EDSCalculator:
    """
    STATE ENGINE: Calculates Execution Distress Score (0-100).
    Logic: Overdue tasks weight heavily. Stalls weight max.
    """
    def calculate_distress(self, student_tasks: List[Dict[str, Any]]) -> int:
        """
        Calculates Execution Distress Score (0-100).
        """
        score = 0
        overdue_count = sum(1 for t in student_tasks if t.get('status') == 'overdue')
        stalled_projects = sum(1 for t in student_tasks if t.get('days_inactive', 0) > 7)
        
        # Formula from PRD
        score += (overdue_count * 10)
        score += (stalled_projects * 20)
        
        # Cap at 100
        return min(100, score)
