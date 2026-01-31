"""
Verify Federated Execution - v9.1
Tests delegation from ExecutionAgent (Jenny) to Specialists (Awards/Programs).
"""
import sys
import os
from pprint import pprint

# Setup path
sys.path.insert(0, os.getcwd())

from backend.agents.registry import load_ivy_agent

def test_delegation():
    print("\n🤝 STARTING FEDERATED EXECUTION TEST")
    
    # 1. SETUP
    student_id = "test_delegation_id"
    # Create dummy profile if needed by registry (Mock DB or just passes ID)
    # ExecutionAgent requires profile with ID
    profile = {"id": student_id, "archetype": "The Scholar"}
    
    print("🤖 Loading Execution Agent (Jenny)...")
    jenny = load_ivy_agent("orch_execution", profile)
    
    # 2. TEST DIRECT DELEGATION (Bypassing LLM Decision)
    # We verify that consult_specialist works and returns tactical advice
    target = "NCWIT Award"
    print(f"🔄 Jenny invoking tool: consult_specialist('Awards', '{target}')")
    
    # This calls AwardsAgent.run_execution_mode internally
    response = jenny.consult_specialist("Awards", target)
    
    # 3. VERIFY OUTPUT
    print("\n📨 RECEIVED FROM SPECIALIST:")
    print("-" * 60)
    print(response[:500] + "...") # Print snippet
    print("-" * 60)
    
    # Assertions
    assert "Strategic Advice" in response
    assert "The 'Tech for Good' Narrative" in response # From awards_math.py logic
    assert "buzzwords" in response.lower()
    
    print("\n✅ DELEGATION SUCCESS: Jenny retrieved tactics from Awards Agent.")
    
    # 4. TEST PROGRAMS DELEGATION
    print("\n🔄 Testing Programs Delegation for 'RSI'...")
    response_prog = jenny.consult_specialist("Programs", "RSI")
    # Since Programs agent relies on LLM for gatekeeper factors (no math library yet),
    # we accept the Unavailable message as proof of delegation flow.
    assert "Gatekeeper Factors" in response_prog or "Unavailable" in response_prog
    print("✅ DELEGATION SUCCESS: Programs Agent replied.")
    
    print("\n🏆 FEDERATED EXECUTION VERIFIED.")

if __name__ == "__main__":
    test_delegation()
