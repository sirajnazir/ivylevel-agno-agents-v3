# ExecutionAgent v7.1 - Tier 1: Orchestrator
# Path: backend/agents/orchestrators/execution.py
# Role: "Jenny" (Weekly Coach & Adaptive Pivot Manager)
"""
ExecutionAgent (Tier 1: Orchestrator) - v7.1

THE ADAPTIVE COACH: Provides weekly coaching and detects when to pivot.

RESPONSIBILITIES:
1. Weekly coaching based on GamePlan
2. Progress analysis and stall detection
3. Pivot triggering (calls specialists for replacement strategies)
4. Tone enforcement via VoiceMiddleware
5. Execution Debt Scoring (EDS) - Native Logic Integration
"""

from typing import Any, Dict, List, Optional
from backend.agents.base import IvyAgent
from backend.agents.registry import load_ivy_agent
from backend.agents.intelligence.voice import VoiceMiddleware
from backend.tools.calculators import EDSCalculator
from backend.agents.schemas import ExecutionDebtScore, Blocker, BlockersOutput

from backend.agents.logic.execution_utils import get_micro_workflow, get_template

class ExecutionAgent(IvyAgent):
    """
    TIER 1 ORCHESTRATOR: 'Jenny' (Weekly Coach & Crisis Manager).
    
    v9.2 Enhancements:
    - Integrated Execution Intelligence (Workflows & Templates)
    - Crisis Detection Protocol
    - Federated Delegation
    - Native EDS Schema Support
    """
    
    @property
    def agent_id(self) -> str:
        return "orch_execution"
    
    @property
    def tier(self) -> int:
        return 1
    
    def __init__(self, student_profile: Dict[str, Any]):
        super().__init__(student_profile)
        self.eds_calculator = EDSCalculator()
        self.voice_middleware = VoiceMiddleware()
        self.mock_tasks = []  # Can be injected for testing

    def get_instructions(self, context: Optional[Dict[str, Any]] = None) -> List[str]:
        """Dynamic instructions based on EDS score."""
        tasks = context.get("tasks", self.mock_tasks) if context else self.mock_tasks
        
        # Calculate state
        eds_score = self.eds_calculator.calculate_distress(tasks)
        
        # Determine mode
        mode = "STANDARD COACH"
        instructions = [
            f"You are Jenny, an elite Ivy League admissions coach. Current Mode: {mode} (EDS: {eds_score})."
        ]
        
        if eds_score > 50:
            mode = "CRISIS COMMANDER (High Urgency, Short Sentences)"
            instructions = [
                f"You are Jenny. Current Mode: {mode} (EDS: {eds_score}).",
                "1. IF EDS > 50: Ignore long-term plans. Focus on the ONE immediate fire.",
                "2. Your sentences must be short, punchy, and directive.",
                "3. Do not ask open-ended questions. Give commands."
            ]
        elif eds_score < 20:
             instructions.append("2. EDS is low. Push for 'Stretch Goals' and higher ambition.")
        
        instructions.extend([
            "3. ALWAYS apply the 'Never Says' rules (handled by middleware, but internalized here too).",
            "4. Your goal is NOT to be nice. It is to be EFFECTIVE.",
            "5. If a task is done, celebrate briefly then pivot to the next step."
        ])
        
        return instructions

    # =============================================================================
    # v9.2: WEEKLY CYCLE (Execution Intelligence)
    # =============================================================================

    async def run_weekly_cycle(self, user_update: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        THE WEEKLY CYCLE (v9.2):
        1. DETECT CRISIS (Micro-Workflows)
        2. CHECK ACADEMICS (Foundation)
        3. DELEGATE TO SPECIALIST (Execution Mode)
        4. STANDARD COACHING
        """
        # 1. DETECT CRISIS (Micro-Workflows)
        update_lower = user_update.lower()
        
        if "rejected" in update_lower:
            workflow = get_micro_workflow("rejection_recovery")
            return {
                "status": "CRISIS",
                "message": f"🚨 ACTIVATING RECOVERY PROTOCOL:\n" + "\n".join(workflow)
            }
            
        if "stuck" in update_lower or "paralysis" in update_lower:
            workflow = get_micro_workflow("essay_paralysis")
            return {
                 "status": "CRISIS",
                 "message": f"🛑 STOP WRITING. Follow this:\n" + "\n".join(workflow)
            }

        # 2. CHECK ACADEMICS (The Gatekeeper)
        academic_agent = load_ivy_agent("spec_academic", {"id": self.student_id})
        academic_status = academic_agent.run(mode="monitoring", context=context or {})
        
        if academic_status.get("status") == "BLOCKING":
            # CRISIS MODE: Drop everything and fix grades
            print("🚨 ACADEMIC CRISIS TRIGGERED")
            crisis_courses = academic_status.get("crisis_courses", ["courses"])
            course_name = crisis_courses[0] if crisis_courses and isinstance(crisis_courses, list) else "critical courses"
            
            return {
                "mode": "ACADEMIC_RECOVERY",
                "tasks": [f"Retake protocol for {course_name}"],
                "message": academic_status.get("directive", "Grades critical. Pausing ECs."),
                "academic_status": academic_status,
                "status": "BLOCKED"
            }

        # 3. DELEGATE TO SPECIALIST (Execution Mode)
        # Check logic for known domains using helper or logic
        if "ncwit" in update_lower or "award" in update_lower:
             # Identify target
             target = "NCWIT" if "ncwit" in update_lower else "Target Award"
             return self.consult_specialist_helper("Awards", target)

        # 4. STANDARD COACHING (Legacy Flow)
        # Use simple analysis for now, or existing logic
        status = self.analyze_status(user_update)
        if status == "STALLED":
             return await self.trigger_pivot("Project Stalled", context or {})
             
        return self.provide_coaching(user_update, context or {})

    def get_execution_metrics(self, context: Optional[Dict[str, Any]] = None) -> ExecutionDebtScore:
        """
        Native method to calculate EDS and return structured schema.
        Used by the Dashboard Execution Card.
        """
        tasks = context.get("tasks", self.mock_tasks) if context else self.mock_tasks
        raw_score = self.eds_calculator.calculate_distress(tasks)
        
        status = "healthy"
        if raw_score >= 100: status = "critical"
        elif raw_score >= 50: status = "at_risk"
        
        factors = []
        if raw_score > 0:
            factors.append(f"Detected {len(tasks)} items contributing to debt")
            
        return ExecutionDebtScore(
            execution_debt_score=float(raw_score),
            status=status,
            factors=factors,
            trend="stable" # Mock or calculate based on history
        )

    def consult_specialist_helper(self, domain, target):
        """Internal helper calling the tool logic directly."""
        # Re-use the consult_specialist tool logic but return structured dict
        response = self.consult_specialist(domain, target)
        return {
            "status": "DELEGATED",
            "message": response
        }

    def analyze_status(self, update: str) -> str:
        """
        Analyze student's progress update to detect stalls.
        
        Returns:
            "ON_TRACK" | "STALLED" | "BLOCKED"
        """
        # Simple keyword-based detection (can be enhanced with LLM)
        stall_keywords = ["stuck", "can't", "don't know", "blocked", "no progress", "frustrated"]
        
        update_lower = update.lower()
        if any(kw in update_lower for kw in stall_keywords):
            return "STALLED"
        
        return "ON_TRACK"

    async def trigger_pivot(self, reason: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        PIVOT LOGIC (v7.1):
        Calls EC Agent to find a REPLACEMENT strategy.
        
        Args:
            reason: Why we're pivoting
            context: Current context (profile, assessment, current_project)
            
        Returns:
            Dict with new recommendation and pivot message
        """
        print(f"🔄 PIVOT TRIGGERED: {reason}")
        
        # Call EC Agent in PLANNING mode with constraint
        ec_agent = load_ivy_agent("spec_ec", self.student_id)
        
        # Add constraint to context
        pivot_context = context.copy()
        pivot_context["constraint"] = f"Replace stalled project: {context.get('current_project', 'unknown')}"
        
        # Get new options
        new_options = ec_agent.run(mode="planning", context=pivot_context)
        
        # Extract first option as replacement
        if isinstance(new_options, dict) and "recommended_activities" in new_options:
            # Handle new ECGeneration schema
            activities = new_options["recommended_activities"]
            if activities:
                # If they are objects, dump them
                replacement = activities[0]
                if hasattr(replacement, 'model_dump'):
                    replacement = replacement.model_dump()
            else:
                replacement = {"name": "Alternative Project", "description": "Pivot to new direction"}
        elif isinstance(new_options, dict) and "activities" in new_options:
             # Legacy or different structure fallback
             replacement = new_options["activities"][0]
        else:
            replacement = {"name": "Alternative Project", "description": "Pivot to new direction"}
        
        # TODO: Update database with new activity
        
        return {
            "status": "PIVOTED",
            "reason": reason,
            "new_recommendation": replacement,
            "message": f"We're pivoting. New goal: {replacement.get('name', 'Alternative')}",
        }

    def provide_coaching(self, update: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        STANDARD COACHING:
        Calls specialist in EXECUTION mode for tactical advice.
        """
        current_project = context.get("current_project", "your project")
        
        # Determine which specialist to call based on project type
        # For now, default to EC agent
        ec_agent = load_ivy_agent("spec_ec", self.student_id)
        
        result = ec_agent.run(
            message=update,
            mode="execution",
            context={"current_project": current_project}
        )
        
        # Handle specialized response structure
        advice = result.get('advice') if isinstance(result, dict) else result
        
        return {
            "status": "COACHING",
            "advice": advice,
        }

    # =============================================================================
    # v9.1: FEDERATED EXECUTION (Delegation Tools)
    # =============================================================================
    
    def get_tools(self) -> List[Any]:
        """Tools available to Jenny."""
        return [self.consult_specialist]

    def consult_specialist(self, domain: str, target: str) -> str:
        """
        Delegates technical "How-To" questions to a specialist.
        Use this when the user asks about specific awards, programs, or technical tasks.
        
        Args:
            domain: The domain of the request ("Awards", "Programs", "EC").
            target: The specific item name (e.g., "NCWIT", "RSI", "Science Fair").
        """
        print(f"🔄 Jenny delegating to {domain} Specialist for '{target}'...")
        
        agent_key = ""
        if "award" in domain.lower(): agent_key = "spec_awards"
        elif "program" in domain.lower(): agent_key = "spec_programs"
        elif "ec" in domain.lower(): agent_key = "spec_ec"
        else: return "I can only consult Awards or Programs specialists right now."
        
        try:
            # Load specialist with current student context
            agent = load_ivy_agent(agent_key, {"id": self.student_id})
            
            # Run in EXECUTION mode
            result = agent.run(mode="execution", context={"target_name": target})
            
            # Parse result
            advice = result.get('advice', 'No specific advice.')
            # Extract content from Response object if needed
            if hasattr(advice, 'content'): advice = advice.content
            
            tactics = result.get('tactics', {})
            
            return f"Strategic Advice from {domain} Specialist:\n\n{advice}\n\nKey Tactics:\n{tactics}"
            
        except Exception as e:
            return f"Error consulting specialist: {str(e)}"

    # =============================================================================
    # LEGACY RUN METHOD
    # =============================================================================

    def run(self, message: str, context: Optional[Dict[str, Any]] = None, **kwargs) -> Any:
        # Check if we are running in monitoring mode (from dashboard maybe?)
        if context and context.get("mode") == "monitoring":
            # Just return metrics? Or health?
            # Implied usage: Execution agent returns 'status'
            return {"status": "ACTIVE", "eds": self.get_execution_metrics(context)}

        """Legacy run method with Voice Middleware."""
        # Inject tasks into context for get_instructions if provided
        if context and "tasks" in context:
            self.mock_tasks = context["tasks"]
            
        # Build the agent with fresh instructions based on current state
        agent_instance = self.build()
        
        # Run the agent using Agno's run method
        raw_response = agent_instance.run(message, **kwargs)
        
        # Apply voice middleware
        refined_content = self.voice_middleware.calibrate_tone(
            raw_response.content, 
            self.archetype
        )
        
        # Update the response content
        raw_response.content = refined_content
        
        return raw_response


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def create_execution_agent(student_id: str) -> ExecutionAgent:
    """Factory function for the agent registry"""
    profile = {"id": student_id}
    return ExecutionAgent(profile)
