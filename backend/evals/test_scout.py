"""
Verify Opportunity Agent (The Scout) Logic - v8.1
"""
import sys
import os
import pytest
from pprint import pprint

# Setup path
sys.path.insert(0, os.getcwd())

from backend.agents.registry import load_ivy_agent
from backend.agents.schemas import OpportunityBatch

def test_scout_logic():
    print("\n🔭 STARTING SCOUT DISCOVERY TEST")
    
    # 1. PROFILE: "Woman in CS" with High Impact
    profile = {
        "id": "test_woman_cs",
        "identity": {
            "name": "Ada Lovelace", 
            "demographics": ["Women"], 
            "grade": 11
        },
        "passion": "Computer Science and AI",
        "spike_category": "TECH",
        "impact_score": 8.5 # High impact to trigger Tier 1 for NCWIT
    }
    
    # 2. RUN SCOUT
    print(f"🤖 Loading Scout for {profile['identity']['name']}...")
    scout = load_ivy_agent("spec_opportunity", {"id": profile["id"]})
    
    # Context with time budget
    context = {
        "profile": profile,
        "time_budget": 15
    }
    
    print("🔍 Scanning database...")
    batch_data = scout.run(mode="planning", context=context)
    batch = OpportunityBatch(**batch_data)
    
    # 3. VERIFY TIER 1
    print(f"\n✅ Found {len(batch.tier_1_matches)} Tier 1 Matches:")
    ncwit_found = False
    for opp in batch.tier_1_matches:
        print(f"   - {opp.name} ({opp.probability_tier}) | Score: {opp.fit_score}")
        if "NCWIT" in opp.name:
            ncwit_found = True
            
    assert ncwit_found, "FAILED: NCWIT should be Tier 1 for Woman in CS with High Impact"
    
    # 4. VERIFY REJECTION (Red Flags)
    # Mock DB has "Pay-to-Play Leadership Summit" (Fee $5000)
    # It should NOT be in Tier 1 or Tier 2.
    
    for opp in batch.tier_1_matches + batch.tier_2_matches:
        assert "Pay-to-Play" not in opp.name, f"FAILED: Pay-to-Play item {opp.name} found in top tiers"
        
    print("\n✅ RED FLAGS Check Passed: No scams in top tiers.")
    print("🏆 SCOUT LOGIC VERIFIED.")

if __name__ == "__main__":
    test_scout_logic()
