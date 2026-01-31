# IMPLEMENTS: The Plug-and-Play Switchboard (PRD v3.0)
# THE SCALABILITY LAW: To add a new agent, add ONE line here.
"""
Agent Registry - The Central Switchboard.

This module provides:
1. AGENT_MAP: Registry of all available agents
2. load_agent(): Factory function to hydrate any agent

USAGE:
    # In API routes, NEVER do this:
    agent = Agent(...)  # ❌ WRONG
    
    # ALWAYS do this:
    agent = load_agent("orch_assessment", student_profile)  # ✅ CORRECT
"""

import importlib
from typing import Type, Dict, Any

from agno.agent import Agent


# =============================================================================
# THE PLUG-AND-PLAY MAP
# =============================================================================
# Format: "key": "module_path.ClassName"
# To add a new agent: Add ONE line here.

AGENT_MAP: Dict[str, str] = {
    # -------------------------------------------------------------------------
    # TIER 1: ORCHESTRATORS (Strategy & Coordination)
    # -------------------------------------------------------------------------
    "orch_assessment": "backend.agents.orchestrators.assessment.AssessmentAgent",
    "orch_gameplan": "backend.agents.orchestrators.gameplan.GamePlanAgent",
    "orch_execution": "backend.agents.orchestrators.execution.ExecutionAgent",  # Jenny
    
    # -------------------------------------------------------------------------
    # TIER 2: SPECIALISTS (Domain Execution)
    # -------------------------------------------------------------------------
    "spec_awards": "backend.agents.specialists.awards.AwardsAgent",
    "spec_ec": "backend.agents.specialists.ec.ECAgent",
    "spec_programs": "backend.agents.specialists.programs.ProgramsAgent",
    "spec_narrative": "backend.agents.specialists.narrative.NarrativeAgent",
    "spec_academic": "backend.agents.specialists.academic.AcademicAgent",
    "spec_opportunity": "backend.agents.specialists.opportunity.OpportunityAgent",
    
    # -------------------------------------------------------------------------
    # TIER 4: INTELLIGENCE (Middleware)
    # -------------------------------------------------------------------------
    "intel_context": "backend.agents.intelligence.context.ContextAgent",
}


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def load_agent(agent_key: str, student_id: str) -> Agent:
    """
    Factory that hydrates any agent based on its Registry Key.
    Returns the built Agno Agent for use with agent.run().
    
    This is the ONLY way to instantiate agents in the system.
    
    Args:
        agent_key: The registry key (e.g., "orch_assessment", "spec_ec")
        student_id: Student UUID string
            
    Returns:
        A fully configured Agno Agent ready for execution
        
    Raises:
        ValueError: If agent_key is not in registry
        ImportError: If agent class cannot be loaded
        
    Example:
        >>> agent = load_agent("orch_assessment", "uuid-123")
        >>> response = agent.run("Analyze my profile")
    """
    ivy_agent = load_ivy_agent(agent_key, student_id)
    return ivy_agent.build()


def load_ivy_agent(agent_key: str, student_id_or_profile):
    """
    Factory that returns the IvyAgent instance (before build).
    Use this when you need direct access to agent methods like .assess() or .run().
    
    Args:
        agent_key: The registry key (e.g., "orch_assessment", "spec_ec")
        student_id_or_profile: Either a student UUID string OR a profile dict with 'id' field
            
    Returns:
        An IvyAgent instance (NOT the Agno Agent - call .build() for that)
        
    Example:
        >>> ivy_agent = load_ivy_agent("orch_assessment", "student-123")
        >>> result = ivy_agent.assess(profile_data)  # Direct method call
        
        >>> ivy_agent = load_ivy_agent("spec_narrative", {"id": "student-123", "archetype": "SCHOLAR"})
        >>> result = ivy_agent.generate_identity()
    """
    if agent_key not in AGENT_MAP:
        available = ", ".join(sorted(AGENT_MAP.keys()))
        raise ValueError(
            f"Agent '{agent_key}' not registered. "
            f"Available agents: {available}. "
            f"Add it to registry.py if it's a new agent."
        )
    
    # Parse the module path
    path_str = AGENT_MAP[agent_key]
    module_path, class_name = path_str.rsplit('.', 1)
    
    try:
        # Dynamic Import
        module = importlib.import_module(module_path)
        agent_class: Type = getattr(module, class_name)
    except ImportError as e:
        raise ImportError(
            f"Failed to import module '{module_path}' for agent '{agent_key}'. "
            f"Error: {e}"
        )
    except AttributeError as e:
        raise ImportError(
            f"Class '{class_name}' not found in module '{module_path}'. "
            f"Error: {e}"
        )
    
    # Instantiate with either student_id or profile
    if isinstance(student_id_or_profile, str):
        # Legacy: just student_id -> Wrap in dict for IvyAgent
        return agent_class({"id": student_id_or_profile})
    else:
        # New: full profile dict
        return agent_class(student_id_or_profile)


def list_agents() -> Dict[str, str]:
    """
    List all registered agents with their module paths.
    
    Returns:
        Dict of agent_key -> module_path
    """
    return AGENT_MAP.copy()


def get_agents_by_tier(tier: int) -> Dict[str, str]:
    """
    Get all agents of a specific tier.
    
    Args:
        tier: 1=Orchestrator, 2=Specialist, 3=Primitive, 4=Intelligence
        
    Returns:
        Dict of agent_key -> module_path for that tier
    """
    tier_prefixes = {
        1: "orch_",
        2: "spec_",
        3: "prim_",
        4: "intel_"
    }
    prefix = tier_prefixes.get(tier, "")
    return {k: v for k, v in AGENT_MAP.items() if k.startswith(prefix)}
