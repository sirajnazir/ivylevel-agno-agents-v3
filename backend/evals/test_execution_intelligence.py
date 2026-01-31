"""
Verify Execution Intelligence - v9.2
Tests ExecutionAgent's ability to:
1. Detect Crisis (Rejected/Stuck) -> Return Micro-Workflow
2. Delegate -> Call Specialist
3. Use Knowledge Base -> execution_utils
"""
import sys
import os
import asyncio

# Setup path
sys.path.insert(0, os.getcwd())

from backend.agents.registry import load_ivy_agent

async def test_execution_intelligence():
    print("\n🧠 STARTING EXECUTION INTELLIGENCE TEST (v9.2)")
    print("=" * 60)
    
    student_id = "test_intel_id"
    profile = {"id": student_id, "archetype": "The Scholar"}
    
    print("🤖 Loading Execution Agent (Jenny)...")
    jenny = load_ivy_agent("orch_execution", profile)
    
    # TEST 1: REJECTION RECOVERY (Crisis Workflow)
    print("\n[TEST 1] Scenario: User says 'I got rejected from Stanford'")
    response = await jenny.run_weekly_cycle("I got rejected from Stanford")
    
    print("-" * 40)
    print(f"Status: {response.get('status')}")
    print(f"Message: {response.get('message')}")
    print("-" * 40)
    
    assert response['status'] == "CRISIS"
    assert "ACTIVATING RECOVERY PROTOCOL" in response['message']
    assert "EMPATHIZE" in response['message'] # Check for workflow step
    print("✅ TEST 1 PASSED: Rejection Workflow Triggered")
    
    # TEST 2: ESSAY PARALYSIS (Crisis Workflow)
    print("\n[TEST 2] Scenario: User says 'I am stuck on my essay'")
    response = await jenny.run_weekly_cycle("I am stuck on my essay help")
    
    print("-" * 40)
    print(f"Status: {response.get('status')}")
    print(f"Message: {response.get('message')}")
    print("-" * 40)
    
    assert response['status'] == "CRISIS"
    assert "STOP WRITING" in response['message']
    assert "RECORD" in response['message'] # Check for workflow step
    print("✅ TEST 2 PASSED: Essay Paralysis Workflow Triggered")
    
    # TEST 3: DELEGATION (NCWIT)
    print("\n[TEST 3] Scenario: User says 'Working on NCWIT application'")
    # ExecutionAgent delegates to AwardsAgent
    response = await jenny.run_weekly_cycle("I am working on the NCWIT application")
    
    print("-" * 40)
    print(f"Status: {response.get('status')}")
    print(f"Message: {response.get('message')}")
    print("-" * 40)
    
    assert response['status'] == "DELEGATED"
    # Assert tactics are returned
    msg = response.get('message', '')
    if isinstance(msg, dict): msg = str(msg)
    assert "Tech for Good" in msg or "Tactics" in msg
    print("✅ TEST 3 PASSED: Delegation to Awards Agent")
    
    print("\n🎉 ALL EXECUTION INTELLIGENCE TESTS PASSED")

if __name__ == "__main__":
    asyncio.run(test_execution_intelligence())
