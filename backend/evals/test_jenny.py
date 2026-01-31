import asyncio
import os
from dotenv import load_dotenv

# Load env vars first
load_dotenv()

from backend.agents.orchestrators.execution import ExecutionAgent

def test_jenny_logic():
    print("🧪 Testing ExecutionAgent (Jenny)...")
    
    # Mock Profile
    huda_profile = {
        "id": "huda-test-001",
        "name": "Huda",
        "archetype": "ARCH-001" # Late Starter
    }
    
    # Scenario 1: High Distress (EDS > 50)
    print("\n--- Test 1: Crisis Mode (EDS > 50) ---")
    crisis_tasks = [
        {"status": "overdue"}, 
        {"status": "overdue"}, 
        {"status": "overdue"}, # 30 pts
        {"days_inactive": 10}, # 20 pts
        {"days_inactive": 8}   # 20 pts -> Total 70
    ]
    
    agent = ExecutionAgent(student_profile=huda_profile)
    
    # We pass tasks via context
    response = agent.run(
        "I haven't done much this week. I'm feeling overwhelmed.",
        context={"tasks": crisis_tasks}
    )
    
    print(f"JENNY (Crisis): {response.content}")
    
    # Scenario 2: Voice Verification (The 'Never Says' Rule)
    print("\n--- Test 2: Voice Middleware (Sanitization) ---")
    
    # Low EDS context
    agent = ExecutionAgent(student_profile=huda_profile)
    
    # We will trick the agent (or just use middleware directly to verify)
    # But let's try to prompt the agent to say something negative
    response = agent.run(
        "I failed my math test and didn't start the project. It's hopeless.",
        context={"tasks": []} # Low EDS
    )
    
    content = response.content
    print(f"JENNY (Response): {content}")
    
    if "That's disappointing" in content:
        print("❌ FAILED: Found forbidden phrase 'That's disappointing'")
    else:
        print("✅ PASSED: Forbidden phrase successfully scrubbed (or not generated)")
        
    if "Let's see what we can learn" in content or "learn from this" in content:
         print("✅ PASSED: Replacement phrase potentially detected")

    # Direct Middleware Unit Test
    from backend.agents.intelligence.voice import VoiceMiddleware
    vm = VoiceMiddleware()
    
    bad_output = "That's disappointing that you failed. You should have studied more."
    cleaned = vm.calibrate_tone(bad_output, "ARCH-001")
    print(f"\n[Middleware Raw]: {bad_output}")
    print(f"[Middleware Clean]: {cleaned}")
    
    assert "That's disappointing" not in cleaned
    assert "Let's see what we can learn" in cleaned
    assert "In the future" in cleaned
    
    # Check "High Urgency" for ARCH-001
    assert "Heads up!" in cleaned or "Heads up!" in vm.calibrate_tone("Random text", "ARCH-001")
    
    print("\n✅ Verification Complete.")

if __name__ == "__main__":
    test_jenny_logic()
