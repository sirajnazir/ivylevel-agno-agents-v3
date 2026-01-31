# IMPLEMENTS: IvyLevel v8.0 - The Academic Agent
# ROLE: The Gatekeeper (Academic Foundation)

from typing import Dict, Any, List
from backend.agents.base import IvyAgent
from backend.agents.logic.academic_math import (
    detect_grade_crisis, 
    optimize_168_hours, 
    calculate_rigor_index
)
from backend.agents.logic.test_prep import diagnose_test_gap
from backend.agents.schemas import AcademicPlan

class AcademicAgent(IvyAgent):
    """
    Tier 2 Specialist: Academic Gatekeeper.
    
    Roles:
    1. PLANNING: Generates 4-Year Course Map & Test Strategy.
    2. MONITORING: Weekly grade checks. Blocks ECs if in crisis.
    """
    
    @property
    def agent_id(self) -> str:
        return "spec_academic"
    
    @property
    def tier(self) -> int:
        return 2

    def get_instructions(self) -> List[str]:
        return [
            "You are the Academic Agent, the foundation of the IvyLevel system.",
            "Your job is to ensure the student's academic house is in order.",
            "Logic Laws:",
            "- 168-Hour Rule: Homework capped at 14h/week.",
            "- Grade Crisis: Any grade < 87% is a CRISIS.",
            "- Rigor: Aim for 60% AP utilization.",
        ]

    def run(self, message: str = "", mode: str = "planning", context: dict = {}) -> Dict[str, Any]:
        """
        Mode-Based Routing (v8.0 Standard)
        """
        if mode == "planning": 
            return self.run_planning_mode(context)
        else: 
            return self.run_monitoring_mode(context)

    # --- PHASE 1: STRATEGY (Course Map) ---
    def run_planning_mode(self, context: dict) -> Dict[str, Any]:
        """Generates AcademicPlan with Rigor, Test Strategy, and Time Budget."""
        
        # 1. Calculate Time Budget (168-Hour Rule)
        # Default to 12h homework if not known
        homework_load = context.get('homework_hours', 12) 
        time_budget = optimize_168_hours(homework_load)
        
        # 2. Calculate Rigor
        taken_aps = context.get('taken_aps', 0)
        school_offerings = context.get('school_offerings', 20)
        rigor_index = calculate_rigor_index(taken_aps, school_offerings)
        
        # 3. Test Strategy (Placeholder logic for planning)
        test_strategy = "Baseline: Take SAT in Spring Junior Year. Prep start: Winter."
        
        # 4. Generate Plan
        plan = AcademicPlan(
            rigor_index=rigor_index,
            test_strategy=test_strategy,
            ec_available_hours=float(time_budget["ec_available_hours"]),
            grade_status="STABLE", # Assumed stable at planning start
            alerts=[]
        )
        
        if time_budget["warning"]:
            plan.alerts.append(time_budget["warning"])
            
        return plan.model_dump()

    # --- PHASE 2: MONITORING (The Grade Guard) ---
    def run_monitoring_mode(self, context: dict) -> Dict[str, Any]:
        """
        Called weekly by Execution Agent. Checks for 'Grade Crisis'.
        Returns NO PLAN if crisis, just a BLOCKING status.
        """
        grades = context.get('current_grades', {})
        if not grades:
             return {"status": "GREEN", "message": "No grade data available. Proceed with caution."}
             
        health = detect_grade_crisis(grades)
        
        if health['status'] == "CRISIS":
            return {
                "status": "BLOCKING",
                "action": "Initiate Grade Recovery Protocol",
                "directive": f"Prioritize {health['crisis'][0]} over ALL ECs.",
                "crisis_courses": health['crisis']
            }
        
        elif health['status'] == "AT_RISK":
             return {
                "status": "WARNING",
                "message": f"Watch out for {health['warnings']}. Don't overcommit."
            }
        
        return {"status": "GREEN", "message": "Grades stable. Proceed with ECs."}


def create_academic_agent(student_id: str) -> AcademicAgent:
    return AcademicAgent({"id": student_id})
