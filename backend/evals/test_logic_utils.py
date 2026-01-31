#!/usr/bin/env python3
"""
LOGIC UTILITIES VERIFICATION TEST
==================================
Date: 2026-01-27

Tests the pure Python logic functions (no LLM calls required).

VERIFIES:
  - ACP-004: Strategic Overwhelm (1.4x inflation)
  - ACP-006: Identity Seeds (8-month lead)
  - Timeline Phasing
  - 1-Swap Rule for STEM schools
"""

import sys
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.agents.logic import (
    apply_strategic_overwhelm,
    generate_identity_seeds,
    calculate_phasing,
    generate_swap_strategy,
    STEM_SCHOOLS,
)


def test_strategic_overwhelm():
    """Test ACP-004: Strategic Overwhelm"""
    print("\n" + "=" * 60)
    print("🔍 TEST 1: STRATEGIC OVERWHELM (ACP-004)")
    print("=" * 60)
    
    base_tasks = [
        {"name": "Research Paper", "priority": "HIGH"},
        {"name": "Competition", "priority": "HIGH"},
        {"name": "Volunteer Work", "priority": "MEDIUM"},
    ]
    
    print(f"\n📊 INPUT: {len(base_tasks)} base tasks")
    
    overwhelmed = apply_strategic_overwhelm(base_tasks, factor=1.4)
    
    print(f"📊 OUTPUT: {len(overwhelmed)} tasks (1.4x = {len(base_tasks) * 1.4:.1f})")
    
    # Assertions
    expected_count = int(len(base_tasks) * 1.4)
    assert len(overwhelmed) == expected_count, f"Expected {expected_count}, got {len(overwhelmed)}"
    
    # Check stretch goals are marked
    stretch_goals = [t for t in overwhelmed if t.get("is_stretch")]
    print(f"   Stretch goals: {len(stretch_goals)}")
    assert len(stretch_goals) > 0, "Should have stretch goals"
    
    print(f"\n✅ TEST 1 PASSED: Strategic overwhelm working correctly")
    return True


def test_identity_seeds():
    """Test ACP-006: Identity Seed Planting"""
    print("\n" + "=" * 60)
    print("🔍 TEST 2: IDENTITY SEEDS (ACP-006)")
    print("=" * 60)
    
    deadlines = [
        {"name": "Early Action Essays", "date": "2026-11-01"},
        {"name": "Regular Decision Essays", "date": "2027-01-01"},
    ]
    
    brand = "The Ethical AI Disruptor"
    
    print(f"\n📊 INPUT:")
    print(f"   Brand: {brand}")
    print(f"   Deadlines: {len(deadlines)}")
    
    seeds = generate_identity_seeds(deadlines, brand, lead_months=8)
    
    print(f"\n📊 OUTPUT: {len(seeds)} identity seeds")
    for seed in seeds:
        print(f"   • {seed['target']}")
        print(f"     Plant: {seed['plant_date']}")
        print(f"     Bloom: {seed['bloom_date']}")
        print(f"     Lead: {seed['lead_time_months']} months")
    
    # Assertions
    assert len(seeds) == len(deadlines), f"Expected {len(deadlines)} seeds, got {len(seeds)}"
    
    # Check 8-month lead time
    first_seed = seeds[0]
    plant_date = datetime.fromisoformat(first_seed["plant_date"])
    bloom_date = datetime.fromisoformat(first_seed["bloom_date"])
    months_diff = (bloom_date.year - plant_date.year) * 12 + (bloom_date.month - plant_date.month)
    
    print(f"\n   Lead time check: {months_diff} months (expected ~8)")
    assert months_diff >= 7, f"Lead time should be ~8 months, got {months_diff}"
    
    print(f"\n✅ TEST 2 PASSED: Identity seeds have correct lead time")
    return True


def test_phasing():
    """Test Timeline Phasing"""
    print("\n" + "=" * 60)
    print("🔍 TEST 3: TIMELINE PHASING")
    print("=" * 60)
    
    current_grade = 11
    
    print(f"\n📊 INPUT: Current grade = {current_grade}")
    
    phases = calculate_phasing(current_grade)
    
    print(f"\n📊 OUTPUT: {len(phases)} phases")
    for phase in phases:
        print(f"   • {phase['name']}")
        print(f"     {phase['start_date']} → {phase['end_date']}")
        print(f"     Focus: {phase['focus']}")
    
    # Assertions
    assert len(phases) > 0, "Should have at least one phase"
    assert all("name" in p for p in phases), "All phases should have names"
    assert all("start_date" in p for p in phases), "All phases should have start dates"
    
    print(f"\n✅ TEST 3 PASSED: Timeline phasing working correctly")
    return True


def test_swap_strategy():
    """Test 1-Swap Rule"""
    print("\n" + "=" * 60)
    print("🔍 TEST 4: 1-SWAP RULE")
    print("=" * 60)
    
    core_list = [
        {"name": "Debate Team", "type": "Leadership"},
        {"name": "Research Project", "type": "Academic"},
        {"name": "Community Service", "type": "Service"},
    ]
    
    stem_swap = {
        "name": "USACO Gold Division",
        "description": "Advanced competitive programming",
        "rationale": "Demonstrates deeper technical commitment",
    }
    
    print(f"\n📊 INPUT:")
    print(f"   Core activities: {len(core_list)}")
    print(f"   STEM swap: {stem_swap['name']}")
    
    # Test STEM school
    mit_strategy = generate_swap_strategy(core_list, stem_swap, "MIT", swap_position=3)
    
    print(f"\n📊 OUTPUT (MIT):")
    if mit_strategy:
        print(f"   School: {mit_strategy['target_school']}")
        print(f"   Strategy: {mit_strategy['strategy_note']}")
        print(f"   Swap position: {mit_strategy['swapped_position']}")
        print(f"   Swap with: {mit_strategy['swap_with']}")
    
    # Test non-STEM school
    harvard_strategy = generate_swap_strategy(core_list, stem_swap, "Harvard", swap_position=3)
    
    print(f"\n📊 OUTPUT (Harvard):")
    if harvard_strategy:
        print(f"   Strategy: {harvard_strategy['strategy_note']}")
    else:
        print(f"   No swap (not a STEM school)")
    
    # Assertions
    assert mit_strategy is not None, "MIT should have swap strategy"
    assert mit_strategy["swapped_position"] == 3, "Should swap position 3"
    assert harvard_strategy is None, "Harvard should not have swap"
    
    print(f"\n✅ TEST 4 PASSED: 1-Swap Rule working correctly")
    return True


def test_stem_schools_list():
    """Test STEM schools constant"""
    print("\n" + "=" * 60)
    print("🔍 TEST 5: STEM SCHOOLS LIST")
    print("=" * 60)
    
    print(f"\n📊 STEM Schools ({len(STEM_SCHOOLS)}):")
    for school in sorted(STEM_SCHOOLS):
        print(f"   • {school}")
    
    # Assertions
    assert "MIT" in STEM_SCHOOLS, "MIT should be in STEM schools"
    assert "Caltech" in STEM_SCHOOLS, "Caltech should be in STEM schools"
    assert len(STEM_SCHOOLS) >= 4, "Should have multiple STEM schools"
    
    print(f"\n✅ TEST 5 PASSED: STEM schools list is correct")
    return True


def main():
    """Run all logic utility tests"""
    
    print("\n" + "═" * 60)
    print("🔬 LOGIC UTILITIES VERIFICATION SUITE")
    print(f"   Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Version: IvyLevel v5.2")
    print("═" * 60)
    
    try:
        # Run all tests
        test_strategic_overwhelm()
        test_identity_seeds()
        test_phasing()
        test_swap_strategy()
        test_stem_schools_list()
        
        # FINAL VERDICT
        print("\n" + "═" * 60)
        print("🏆 ALL TESTS PASSED - LOGIC UTILITIES VERIFIED")
        print("=" * 60)
        print("\nAll pure Python functions are working correctly:")
        print("  ✅ ACP-004: Strategic Overwhelm (1.4x inflation)")
        print("  ✅ ACP-006: Identity Seeds (8-month lead)")
        print("  ✅ Timeline Phasing")
        print("  ✅ 1-Swap Rule for STEM schools")
        print("=" * 60 + "\n")
        
        return True
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n💥 ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
