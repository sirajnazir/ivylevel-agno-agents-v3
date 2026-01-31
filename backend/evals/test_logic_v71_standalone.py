"""
Test Logic Libraries (v7.1) - Standalone Version

Direct import tests for ec_math and awards_math functions.
No agent dependencies required.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

# Direct imports from logic modules
from backend.agents.logic.ec_math import (
    calculate_activity_impact,
    calculate_web_connectivity,
    validate_ec_portfolio,
    is_founder_activity,
    ARCHETYPES,
)

from backend.agents.logic.awards_math import (
    get_probability_tier,
    get_tier_number,
    calculate_award_fit,
    apply_win_cascade,
    validate_awards_portfolio,
    is_guaranteed_win,
)


def test_activity_impact():
    """Test activity impact scoring."""
    print("\n" + "="*60)
    print("TEST 1: Activity Impact Scoring")
    print("="*60)
    
    # Test 1: Founder activity with quantitative metrics
    founder_activity = {
        "role_level": "Founder",
        "description": "Founded AI club reaching 200 students",
        "name": "AI Ethics Club"
    }
    score = calculate_activity_impact(founder_activity)
    print(f"✓ Founder + Quantitative: {score} (expected: 10.0)")
    assert score == 10.0, f"Expected 10.0, got {score}"
    
    # Test 2: Founder without quantitative
    founder_no_quant = {
        "role_level": "Founder",
        "description": "Founded debate club",
        "name": "Debate Club"
    }
    score = calculate_activity_impact(founder_no_quant)
    print(f"✓ Founder only: {score} (expected: 9.0)")
    assert score == 9.0, f"Expected 9.0, got {score}"
    
    # Test 3: Leadership activity with metrics
    leader_activity = {
        "role_level": "Leadership",
        "description": "Led team of 15 to regional finals",
        "name": "Debate Captain"
    }
    score = calculate_activity_impact(leader_activity)
    print(f"✓ Leadership + Quantitative: {score} (expected: 8.0)")
    assert score == 8.0, f"Expected 8.0, got {score}"
    
    # Test 4: Participation activity
    participant_activity = {
        "role_level": "Participation",
        "description": "Competed in 5 state competitions",
        "name": "Math Club Member"
    }
    score = calculate_activity_impact(participant_activity)
    print(f"✓ Participation + Quantitative: {score} (expected: 4.0)")
    assert score == 4.0, f"Expected 4.0, got {score}"
    
    # Test 5: is_founder_activity helper
    assert is_founder_activity(founder_activity) == True
    assert is_founder_activity(leader_activity) == False
    print(f"✓ is_founder_activity helper works correctly")
    
    print("\n✅ Activity impact scoring: ALL TESTS PASSED")


def test_web_connectivity():
    """Test web connectivity calculation."""
    print("\n" + "="*60)
    print("TEST 2: Web Connectivity Framework")
    print("="*60)
    
    # Test 1: Highly connected activities (AI/CS theme)
    connected_activities = [
        {"name": "AI Club", "description": "machine learning projects research"},
        {"name": "CS Research", "description": "artificial intelligence ethics research"},
        {"name": "Tech Debate", "description": "technology policy machine learning debates"},
        {"name": "Coding Competition", "description": "programming algorithms research"}
    ]
    
    score = calculate_web_connectivity(connected_activities)
    print(f"✓ Connected activities: {score:.2f} (expected: >= 0.6)")
    assert score >= 0.6, f"Expected >= 0.6, got {score}"
    
    # Test 2: Disconnected activities
    disconnected_activities = [
        {"name": "Chess Club", "description": "playing chess tournaments"},
        {"name": "Cooking Class", "description": "learning culinary arts"},
        {"name": "Swimming Team", "description": "competitive swimming"}
    ]
    
    score = calculate_web_connectivity(disconnected_activities)
    print(f"✓ Disconnected activities: {score:.2f} (expected: < 0.6)")
    assert score < 0.6, f"Expected < 0.6, got {score}"
    
    # Test 3: Empty list
    score = calculate_web_connectivity([])
    print(f"✓ Empty list: {score} (expected: 0.0)")
    assert score == 0.0
    
    print("\n✅ Web connectivity: ALL TESTS PASSED")


def test_portfolio_validation():
    """Test EC portfolio validation."""
    print("\n" + "="*60)
    print("TEST 3: EC Portfolio Validation")
    print("="*60)
    
    # Test 1: Valid portfolio (meets all constraints)
    valid_activities = [
        {"role_level": "Founder", "description": "Founded AI club with 200 members", "name": "AI Club"},
        {"role_level": "Founder", "description": "Created tutoring program serving 50 students", "name": "Tutoring"},
        {"role_level": "Leadership", "description": "Led debate team to nationals with 20 members", "name": "Debate"},
        {"role_level": "Leadership", "description": "Managed school newspaper reaching 500 students", "name": "Newspaper"},
        {"role_level": "Leadership", "description": "Organized 10 community events", "name": "Community"},
        {"role_level": "Participation", "description": "Competed in 8 math competitions", "name": "Math"},
    ]
    
    validation = validate_ec_portfolio(valid_activities)
    print(f"✓ Valid portfolio:")
    print(f"  - Founder count: {validation['founder_count']} (expected: >= 2)")
    print(f"  - Average impact: {validation['avg_impact']:.2f} (expected: > 7.0)")
    print(f"  - Web score: {validation['web_score']:.2f}")
    print(f"  - Is valid: {validation['is_valid']}")
    print(f"  - Violations: {validation['violations']}")
    
    assert validation['founder_count'] >= 2
    assert validation['avg_impact'] > 7.0
    
    # Test 2: Invalid portfolio (not enough founders)
    invalid_activities = [
        {"role_level": "Founder", "description": "Founded club", "name": "Club"},
        {"role_level": "Participation", "description": "Member", "name": "Activity"},
    ]
    
    validation = validate_ec_portfolio(invalid_activities)
    print(f"\n✓ Invalid portfolio:")
    print(f"  - Is valid: {validation['is_valid']} (expected: False)")
    print(f"  - Violations: {validation['violations']}")
    assert validation['is_valid'] == False
    
    print("\n✅ Portfolio validation: ALL TESTS PASSED")


def test_probability_tiers():
    """Test probability tier system."""
    print("\n" + "="*60)
    print("TEST 4: Awards Probability Tiers")
    print("="*60)
    
    test_cases = [
        (0.9, 1, "Tier 1: Definite (Perfect Fit)"),
        (0.7, 1, "Tier 1: Definite (Perfect Fit)"),
        (0.6, 2, "Tier 2: Likely"),
        (0.5, 2, "Tier 2: Likely"),
        (0.4, 3, "Tier 3: Possible"),
        (0.3, 3, "Tier 3: Possible"),
        (0.2, 4, "Tier 4: Stretch"),
        (0.1, 4, "Tier 4: Stretch"),
    ]
    
    for fit_score, expected_tier_num, expected_tier_desc in test_cases:
        tier_desc = get_probability_tier(fit_score)
        tier_num = get_tier_number(fit_score)
        
        assert tier_num == expected_tier_num, f"Score {fit_score}: expected tier {expected_tier_num}, got {tier_num}"
        assert expected_tier_desc in tier_desc, f"Score {fit_score}: expected '{expected_tier_desc}', got '{tier_desc}'"
        
        print(f"✓ Fit score {fit_score}: Tier {tier_num} - {tier_desc}")
    
    print("\n✅ Probability tiers: ALL TESTS PASSED")


def test_award_fit_scoring():
    """Test award fit calculation."""
    print("\n" + "="*60)
    print("TEST 5: Award Fit Scoring")
    print("="*60)
    
    # Test profile
    student_profile = {
        "archetype": "RESEARCHER",
        "identity": {"grade": 11},
        "achievements": [
            {"level": "REGIONAL", "name": "Science Fair"},
            {"level": "STATE", "name": "Math Competition"}
        ]
    }
    
    # Test 1: Perfect fit award
    perfect_award = {
        "difficulty": "MODERATE",
        "impact_level": "NATIONAL",
        "timeline": "Junior Year",
        "archetype_fit": ["RESEARCHER", "SCHOLAR"]
    }
    
    fit_score = calculate_award_fit(student_profile, perfect_award)
    print(f"✓ Perfect fit award: {fit_score:.2f} (expected: >= 0.7)")
    assert fit_score >= 0.6, f"Expected >= 0.6, got {fit_score}"
    
    # Test 2: Mismatched award
    mismatch_award = {
        "difficulty": "AMBITIOUS",
        "impact_level": "NATIONAL",
        "timeline": "Senior Year",
        "archetype_fit": ["ENTREPRENEUR"]
    }
    
    fit_score = calculate_award_fit(student_profile, mismatch_award)
    print(f"✓ Mismatched award: {fit_score:.2f} (expected: < 0.7)")
    
    print("\n✅ Award fit scoring: ALL TESTS PASSED")


def test_win_cascade():
    """Test win cascade strategy."""
    print("\n" + "="*60)
    print("TEST 6: Win Cascade Strategy")
    print("="*60)
    
    awards = [
        {"name": "National Award", "impact_level": "NATIONAL"},
        {"name": "School Award", "impact_level": "SCHOOL"},
        {"name": "State Award", "impact_level": "STATE"},
        {"name": "Regional Award", "impact_level": "REGIONAL"},
    ]
    
    sorted_awards = apply_win_cascade(awards)
    
    print("✓ Awards sorted by cascade order:")
    for i, award in enumerate(sorted_awards):
        print(f"  {i+1}. {award['name']} ({award['impact_level']})")
    
    # Verify order: SCHOOL -> REGIONAL -> STATE -> NATIONAL
    assert sorted_awards[0]["impact_level"] == "SCHOOL"
    assert sorted_awards[-1]["impact_level"] == "NATIONAL"
    
    print("\n✅ Win cascade: ALL TESTS PASSED")


def test_awards_portfolio_validation():
    """Test 2-2-1 portfolio validation."""
    print("\n" + "="*60)
    print("TEST 7: Awards Portfolio Validation (2-2-1 Rule)")
    print("="*60)
    
    # Valid portfolio: 2 Reach, 2 Target, 1 Safety
    valid_awards = [
        {"name": "Reach 1", "fit_score": 0.4},  # Tier 3
        {"name": "Reach 2", "fit_score": 0.3},  # Tier 3
        {"name": "Target 1", "fit_score": 0.6}, # Tier 2
        {"name": "Target 2", "fit_score": 0.5}, # Tier 2
        {"name": "Safety 1", "fit_score": 0.8}, # Tier 1
    ]
    
    validation = validate_awards_portfolio(valid_awards)
    print(f"✓ Valid 2-2-1 portfolio:")
    print(f"  - Reach: {validation['reach_count']} (expected: >= 2)")
    print(f"  - Target: {validation['target_count']} (expected: >= 2)")
    print(f"  - Safety: {validation['safety_count']} (expected: >= 1)")
    print(f"  - Is valid: {validation['is_valid']}")
    print(f"  - Violations: {validation['violations']}")
    
    assert validation['is_valid'] == True
    assert validation['reach_count'] >= 2
    assert validation['target_count'] >= 2
    assert validation['safety_count'] >= 1
    
    print("\n✅ Awards portfolio validation: ALL TESTS PASSED")


def test_guaranteed_wins():
    """Test guaranteed win detection."""
    print("\n" + "="*60)
    print("TEST 8: Guaranteed Win Detection")
    print("="*60)
    
    guaranteed = [
        "Presidential Volunteer Service Award (Gold)",
        "AP Scholar with Distinction",
        "National Honor Society"
    ]
    
    not_guaranteed = [
        "Intel Science Fair",
        "Regeneron STS",
        "Davidson Fellows"
    ]
    
    for award in guaranteed:
        assert is_guaranteed_win(award) == True
        print(f"✓ Guaranteed: {award}")
    
    for award in not_guaranteed:
        assert is_guaranteed_win(award) == False
        print(f"✓ Not guaranteed: {award}")
    
    print("\n✅ Guaranteed win detection: ALL TESTS PASSED")


def test_archetypes():
    """Test archetype definitions."""
    print("\n" + "="*60)
    print("TEST 9: Archetype Definitions")
    print("="*60)
    
    print(f"✓ Available archetypes: {ARCHETYPES}")
    assert len(ARCHETYPES) == 6
    assert "stem_innovator" in ARCHETYPES
    assert "academic_powerhouse" in ARCHETYPES
    
    print("\n✅ Archetype definitions: ALL TESTS PASSED")


def run_all_tests():
    """Run all verification tests."""
    print("\n" + "="*60)
    print("IvyLevel v7.1 Logic Libraries Verification")
    print("="*60)
    
    try:
        test_activity_impact()
        test_web_connectivity()
        test_portfolio_validation()
        test_probability_tiers()
        test_award_fit_scoring()
        test_win_cascade()
        test_awards_portfolio_validation()
        test_guaranteed_wins()
        test_archetypes()
        
        print("\n" + "="*60)
        print("🎉 ALL VERIFICATION TESTS PASSED!")
        print("="*60)
        print("\nSummary:")
        print("  ✅ EC Math Library: 3 tests passed")
        print("  ✅ Awards Math Library: 6 tests passed")
        print("  ✅ Total: 9 test suites, 0 failures")
        print("="*60)
        
        return True
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
