# IvyLevel Agent System - Plug-and-Play Architecture
"""
The 4-Tier Agent Architecture:

Tier 1: Orchestrators (Strategy & Coordination)
  - Assessment, GamePlan, Execution (Jenny)

Tier 2: Specialists (Domain Execution)
  - Awards, EC, Programs, Narrative

Tier 3: Primitives (Tools)
  - Reusable tool functions for agents

Tier 4: Intelligence (Middleware)
  - Context, Voice, Pattern Recognition
"""

from backend.agents.base import IvyAgent
from backend.agents.registry import load_agent, AGENT_MAP

__all__ = ["IvyAgent", "load_agent", "AGENT_MAP"]
