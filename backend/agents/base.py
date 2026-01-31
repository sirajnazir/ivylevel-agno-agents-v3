# IMPLEMENTS: The Scalability Core - Base Agent Protocol (PRD v3.0)
# THE CONTRACT: Every agent in the system MUST inherit from IvyAgent
"""
IvyAgent Base Class - The "Socket" for Plug-and-Play Architecture.

This is the contract that all IvyLevel agents must follow.
It enforces:
1. Memory Injection (Shared Hippocampus)
2. Voice Middleware
3. Type Safety (Pydantic outputs)
4. Tier Classification
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

from agno.agent import Agent
from agno.models.anthropic import Claude

from backend.memory import get_agent_memory
from backend.tools.supabase_tools import SupabaseReader


class IvyAgent(ABC):
    """
    The Base Protocol for all IvyLevel Agents.
    Enforces Memory Injection, Voice Middleware, and Type Safety.
    
    SCALABILITY LAW:
    - NEVER instantiate Agent() directly in API routes.
    - ALWAYS use registry.load_agent("key", profile).
    - ALWAYS inherit from IvyAgent.
    """
    
    def __init__(self, student_profile: Dict[str, Any]):
        """
        Initialize the agent with a student profile.
        
        Args:
            student_profile: Dictionary containing at minimum:
                - id: Student UUID
                - archetype: Student archetype (e.g., "Futuristic CEO")
        """
        self.profile = student_profile
        self.student_id = student_profile.get('id')
        self.archetype = student_profile.get('archetype', 'Generic')
    
    @property
    @abstractmethod
    def agent_id(self) -> str:
        """
        Unique Registry ID for this agent type.
        
        Examples:
            - "orch_assessment"
            - "spec_awards"
            - "intel_context"
        """
        pass
    
    @property
    @abstractmethod
    def tier(self) -> int:
        """
        The agent's tier in the hierarchy.
        
        1 = Orchestrator (Strategy)
        2 = Specialist (Domain)
        3 = Primitive (Tool)
        4 = Intelligence (Middleware)
        """
        pass
    
    @abstractmethod
    def get_instructions(self) -> List[str]:
        """
        Dynamic instructions for the agent.
        
        AGNOSTIC INTELLIGENCE LAW:
        - MUST query Vector DB for logic
        - Do NOT hardcode coaching advice strings
        
        Returns:
            List of instruction strings that guide the agent's behavior
        """
        pass
    
    def get_tools(self) -> List:
        """
        Tools available to this agent.
        
        By default, all agents get:
        - SupabaseReader (read-access to Profile)
        
        Override to add agent-specific tools.
        """
        return [SupabaseReader()]
    
    def get_model(self) -> Claude:
        """
        The LLM model for this agent.
        
        Default: Claude 3.5 Sonnet (Primary reasoning model)
        Override for specialized model needs.
        """
        return Claude(id="claude-3-opus-20240229")
    
    def get_description(self) -> str:
        """
        Human-readable description of this agent.
        """
        tier_names = {
            1: "Orchestrator",
            2: "Specialist", 
            3: "Primitive",
            4: "Intelligence"
        }
        tier_name = tier_names.get(self.tier, "Agent")
        return f"IvyLevel {tier_name} (Tier {self.tier}): {self.agent_id}"
    
    def build(self) -> Agent:
        """
        Standard Factory Method - Build the Agno Agent.
        
        This method:
        1. Validates student_id exists
        2. Injects Shared Hippocampus (memory)
        3. Configures Voice Settings
        4. Enforces Structured Outputs
        
        Returns:
            Configured Agno Agent ready for execution
            
        Raises:
            ValueError: If student_id is missing
        """
        if not self.student_id:
            raise ValueError(
                f"Cannot build {self.agent_id} without Student ID. "
                "Ensure profile contains 'id' field."
            )
        
        # 1. Get the model
        model = self.get_model()
        
        # 2. Shared Memory Injection (The Hippocampus)
        memory_config = get_agent_memory(self.student_id)
        
        # 3. Build the agent with all configurations
        return Agent(
            name=f"{self.agent_id}_{self.student_id}",
            model=model,
            description=self.get_description(),
            instructions=self.get_instructions(),
            tools=self.get_tools(),
            # Inject Shared Memory Config
            **memory_config,
            # TYPE SAFETY: Enforce Structured Output (JSON)
            structured_outputs=True,
            markdown=True
        )
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} tier={self.tier} id={self.agent_id}>"

    def run(self, message: str = "", stream: bool = False, **kwargs) -> Any:
        """
        Standard execution of the Agno Agent.
        Builds the agent and runs it.
        """
        agent_instance = self.build()
        return agent_instance.run(message, stream=stream, **kwargs)
