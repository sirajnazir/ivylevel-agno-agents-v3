"""
Test Logic Libraries (v7.1)

Quick verification tests for ec_math and awards_math functions.
"""

import sys
sys.path.insert(0, '/Users/snazir/ivylevel-agno-agents-v3')

from backend.agents.logic import (
    calculate_activity_impact,
    calculate_web_connectivity,
    validate_ec_portfolio,
    get_probability_tier,
    calculate_award_fit,
)


def test_activity_impact():
    """Test activity impact scoring."""
    print("\n=== Testing Activity Impact Scoring ===")
    
    # Test Founder activity
    founder_activity = {
        "role_level": "Founder",
        "description": "Founded AI club reaching 200 students",
        "name": "AI Ethics Club"
    }
    score = calculate_activity_impact(founder_activity)
    print(f"Founder activity score: {score} (expected: 10.0)")
    assert score == 10.0, f"Expected 10.0, got {score}"
    
    # Test Leadership activity
    leader_activity = {
        "role_level": "Leadership",
        "description": "Led team to regional finals",
        "name": "Debate Captain"
    }
    score = calculate_activity_impact(leader_activity)
    print(f"Leadership activity score: {score} (expected: 8.0)")
    assert score == 8.0, f"Expected 8.0, got {score}"
    
    # Test Participation activity
    participant_activity = {
        "role_level": "Participation",
        "description": "Competed in state competition",
        "name": "Math Club Member"
    }
    score = calculate_activity_impact(participant_activity)
    print(f"Participation activity score: {score} (expected: 4.0)")
    assert score == 4.0, f"Expected 4.0, got {score}"
    
    print("✅ Activity impact scoring tests passed!")


def test_web_connectivity():
    """Test web connectivity calculation."""
    print("\n=== Testing Web Connectivity ===")
    
    # Test connected activities
    activities = [
        {"name": "AI Club", "description": "machine learning projects"},
        {"name": "CS Research", "description": "AI ethics research"},
        {"name": "Debate Team", "description": "technology policy debates"}
    ]
    
    score = calculate_web_connectivity(activities)
    print(f"Web connectivity score: {score:.2f} (expected: >= 0.5)")
    assert score >= 0.5, f"Expected >= 0.5, got {score}"
    
    print("✅ Web connectivity tests passed!")


def test_probability_tiers():
    """Test probability tier system."""
    print("\n=== Testing Probability Tiers ===")
    
    tier1 = get_probability_tier(0.8)
    print(f"Tier for 0.8: {tier1}")
    assert "Tier 1" in tier1
    
    tier2 = get_probability_tier(0.6)
    print(f"Tier for 0.6: {tier2}")
    assert "Tier 2" in tier2
    
    tier3 = get_probability_tier(0.4)
    print(f"Tier for 0.4: {tier3}")
    assert "Tier 3" in tier3
    
    tier4 = get_probability_tier(0.2)
    print(f"Tier for 0.2: {tier4}")
    assert "Tier 4" in tier4
    
    print("✅ Probability tier tests passed!")


def test_portfolio_validation():
    """Test EC portfolio validation."""
    print("\n=== Testing Portfolio Validation ===")
    
    # Valid portfolio
    valid_activities = [
        {"role_level": "Founder", "description": "Founded AI club with 200 members", "name": "AI Club"},
        {"role_level": "Founder", "description": "Created tutoring program serving 50 students", "name": "Tutoring"},
        {"role_level": "Leadership", "description": "Led debate team to nationals", "name": "Debate"},
        {"role_level": "Leadership", "description": "Managed school newspaper", "name": "Newspaper"},
        {"role_level": "Participation", "description": "Competed in math olympiad", "name": "Math"},
    ]
    
    validation = validate_ec_portfolio(valid_activities)
    print(f"Validation result: {validation}")
    print(f"Founder count: {validation['founder_count']}")
    print(f"Average impact: {validation['avg_impact']:.2f}")
    print(f"Web score: {validation['web_score']:.2f}")
    
    print("✅ Portfolio validation tests passed!")


if __name__ == "__main__":
    try:
        test_activity_impact()
        test_web_connectivity()
        test_probability_tiers()
        test_portfolio_validation()
        
        print("\n" + "="*50)
        print("🎉 ALL TESTS PASSED!")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
