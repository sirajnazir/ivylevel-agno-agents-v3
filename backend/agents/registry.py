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
    
    # -------------------------------------------------------------------------
    # TIER 4: INTELLIGENCE (Middleware)
    # -------------------------------------------------------------------------
    "intel_context": "backend.agents.intelligence.context.ContextAgent",
}


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def load_agent(agent_key: str, student_profile: Dict[str, Any]) -> Agent:
    """
    Factory that hydrates any agent based on its Registry Key.
    
    This is the ONLY way to instantiate agents in the system.
    
    Args:
        agent_key: The registry key (e.g., "orch_assessment", "spec_awards")
        student_profile: Dict containing at minimum:
            - id: Student UUID
            - archetype: Student archetype
            
    Returns:
        A fully configured Agno Agent ready for execution
        
    Raises:
        ValueError: If agent_key is not in registry
        ImportError: If agent class cannot be loaded
        
    Example:
        >>> profile = {"id": "uuid-123", "archetype": "Futuristic CEO"}
        >>> agent = load_agent("orch_assessment", profile)
        >>> response = agent.run("Analyze my profile")
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
    
    # Instantiate and build
    ivy_agent = agent_class(student_profile)
    return ivy_agent.build()


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
