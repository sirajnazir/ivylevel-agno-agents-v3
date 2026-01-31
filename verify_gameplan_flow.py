
import asyncio
import json
import sys
import os

# Set up path to allow imports from backend
sys.path.append(os.path.join(os.getcwd()))

from backend.agents.registry import load_agent
from backend.agents.schemas import MasterGamePlan

# Mock Data
MOCK_PROFILE = {
    "id": "test-student-verification-001",
    "name": "Alex Verification",
    "academic": {
        "gpa": 3.9,
        "sat": 1520,
        "taken_aps": 6,
        "grades": {"10": {"Math": "A", "English": "A-"}}
    },
    "interests": ["Robotics", "Physics", "Debate"],
    "target_schools": ["MIT", "Stanford", "Princeton"]
}

MOCK_ASSESSMENT = {
    "ivy_plus_score": 65,
    "archetype": {
        "id": "RESEARCHER",
        "label": "The Researcher",
        "confidence": 0.95
    },
    "portfolio": {
        # Mocking what the assessment agent might return
        "core_values": ["Curiosity", "Impact"]
    }
}

async def run_verification():
    print("🚀 Starting GamePlan Verification Flow...")
    
    try:
        # 1. Load the GamePlan Agent
        print("1️⃣ Loading GamePlan Agent (orch_gameplan)...")
        agent = load_agent("orch_gameplan", MOCK_PROFILE)
        print(f"   ✅ Loaded agent: {agent.name}")
        
        # 2. Run the Agent (Orchestration Mode)
        # The agent.run() method takes a string, but our GamePlan agent logic 
        # actually looks at the 'context' passed during load or needs to be handled carefully.
        # Wait, usually Agno agents run with a prompt.
        # But our GamePlanAgent implementation overrides run() to accept (profile, assessment) IF called directly as IvyAgent,
        # OR it uses the Agno run() which calls the internal instructions.
        
        # Let's check how GamePlanAgent.run is implemented in the file I viewed.
        # It has: def run(self, profile, assessment).
        # But this signature is DIFFERENT from Agno's agent.run(message).
        # This is a potential conflict if we use load_agent() which returns the Agno Agent wrapper.
        # The Agno Agent.run() calls the LLM. 
        # But our GamePlanAgent logic is deterministic/hybrid.
        
        # Correction: registry.load_agent returns `ivy_agent.build()` which is an Agno Agent.
        # But `GamePlanAgent` inherits from `IvyAgent`.
        # `IvyAgent.run` usually wraps the logic.
        
        # Let's try calling the underlying logic directly first to verify the code logic,
        # then we can worry about the Agno wrapper.
        
        from backend.agents.registry import load_ivy_agent
        print("\n2️⃣ Loading IvyAgent implementation directly (bypassing Agno wrapper for logic test)...")
        ivy_agent = load_ivy_agent("orch_gameplan", MOCK_PROFILE)
        
        print("\n3️⃣ Executing generate_master_plan()...")
        result = ivy_agent.generate_master_plan(MOCK_PROFILE, MOCK_ASSESSMENT)
        
        print("\n✅ Execution Successful!")
        print(f"   Activity Count: {len(result.target_activity_list)}")
        print(f"   Strategies: {len(result.school_strategies)}")
        
        # Check structure
        print("\n4️⃣ Verifying Output Structure...")
        assert isinstance(result, MasterGamePlan), "Output is not a MasterGamePlan"
        assert len(result.target_activity_list) == 10, f"Expected 10 activities, got {len(result.target_activity_list)}"
        
        # Check for STEM swap
        stem_swap_present = any("Swap Slot" in s.strategy_note for s in result.school_strategies)
        print(f"   STEM Swap Logic Active: {stem_swap_present}")
        
        # Print top activity
        top_act = result.target_activity_list[0]
        print(f"   Top Activity: {top_act.organization} ({top_act.role})")
        
        print("\n🎉 VERIFICATION PASSED: GamePlan Logic is working!")
        return True
        
    except Exception as e:
        print(f"\n❌ VERIFICATION FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(run_verification())
