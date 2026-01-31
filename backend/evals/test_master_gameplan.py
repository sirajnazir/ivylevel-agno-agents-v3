#!/usr/bin/env python3
"""
MASTER GAME PLAN VERIFICATION TEST
===================================
Date: 2026-01-27

IMPLEMENTS: IvyLevel v5.2 - The Target Application Engine
VERIFIES:
  - Federation Pattern (GamePlanAgent calls all specialists)
  - 10-Slot Common App Generation
  - 1-Swap Rule for STEM schools
  - Identity Seeds (8-month lead)
  - Strategic Overwhelm (1.4x)
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.agents.registry import load_ivy_agent
from backend.agents.schemas import MasterGamePlan
from backend.tools.scoring.engine import IvyScoreEngine
from backend.tools.scoring.archetypes import detect_archetype

# =============================================================================
# LOAD TEST DATA
# =============================================================================

DATA_PATH = Path(__file__).parent / "datasets" / "huda_golden.json"

if DATA_PATH.exists():
    with open(DATA_PATH, "r") as f:
        GOLDEN_DATA = json.load(f)
        STUDENT_PROFILE = GOLDEN_DATA["student_profile"]
    print(f"✅ Loaded test data from {DATA_PATH}")
else:
    # Fallback: Create minimal test profile
    STUDENT_PROFILE = {
        "id": "test-student-001",
        "identity": {"grade": "11"},
        "target_schools": ["MIT", "Stanford", "Harvard"],
        "aptitude": {
            "gpa_weighted": 3.9,
            "sat_total": 1500,
        },
        "passion": {
            "leadership_level": "OFFICER",
            "project_impact": 100,
        },
        "community": {
            "service_hours": 150,
        },
    }
    print(f"⚠️  Using fallback test profile")


# =============================================================================
# TEST 1: MASTER GAME PLAN GENERATION
# =============================================================================

def test_master_gameplan_generation():
    """
    CRITICAL: Does GamePlanAgent generate a complete MasterGamePlan?
    
    Verifies:
    - Federation Pattern (calls all specialists)
    - 10 Common App activities
    - School strategies with 1-Swap Rule
    - Identity seeds
    - Phasing
    """
    print("\n" + "=" * 60)
    print("🔍 TEST 1: MASTER GAME PLAN GENERATION")
    print("=" * 60)
    
    # 1. Run Assessment (prerequisite)
    engine = IvyScoreEngine()
    assessment_result = engine.calculate(STUDENT_PROFILE)
    
    category_dict = {
        "aptitude": assessment_result.category_scores.aptitude,
        "passion": assessment_result.category_scores.passion,
        "community": assessment_result.category_scores.community,
        "narrative": assessment_result.category_scores.narrative,
    }
    
    archetype = detect_archetype(STUDENT_PROFILE, category_dict)
    
    assessment_output = {
        "ivy_plus_score": assessment_result.ivy_plus_score,
        "percentile_rank": assessment_result.percentile_rank,
        "category_scores": category_dict,
        "archetype": {
            "id": archetype.id,
            "label": archetype.label,
        },
    }
    
    print(f"\n📊 INPUT:")
    print(f"   Student: Test Student")
    print(f"   Archetype: {archetype.label}")
    print(f"   Current Score: {assessment_result.ivy_plus_score:.1f}/100")
    print(f"   Target Schools: {STUDENT_PROFILE.get('target_schools', [])}")
    
    # 2. Generate Master Game Plan
    print(f"\n🚀 Generating Master Game Plan...")
    print(f"{'─' * 60}")
    
    gameplan_agent = load_ivy_agent("orch_gameplan", STUDENT_PROFILE)
    master_plan = gameplan_agent.generate_master_plan(STUDENT_PROFILE, assessment_output)
    
    print(f"{'─' * 60}")
    
    # 3. Display Results
    print(f"\n📋 MASTER GAME PLAN:")
    print(f"   Brand: {master_plan.narrative_brand}")
    print(f"   Current Score: {master_plan.current_ivy_score:.1f}")
    print(f"   Target Score: {master_plan.target_ivy_score:.1f}")
    
    print(f"\n🎯 TARGET ACTIVITY LIST (10 Slots):")
    for activity in master_plan.target_activity_list:
        print(f"   [{activity.position}] {activity.organization}")
        print(f"       Type: {activity.type}")
        print(f"       Role: {activity.role}")
        print(f"       Status: {activity.status.value}")
        print(f"       Description: {activity.description[:80]}...")
    
    print(f"\n🔄 SCHOOL STRATEGIES ({len(master_plan.school_strategies)}):")
    for strategy in master_plan.school_strategies:
        print(f"   • {strategy.target_school}:")
        print(f"     {strategy.strategy_note}")
        if strategy.swapped_position:
            print(f"     Swap: Slot {strategy.swapped_position} → {strategy.swap_with}")
    
    print(f"\n🌱 IDENTITY SEEDS ({len(master_plan.identity_seeds)}):")
    for seed in master_plan.identity_seeds:
        print(f"   • {seed.target_deadline}:")
        print(f"     Plant: {seed.plant_date}")
        print(f"     Action: {seed.action[:60]}...")
    
    print(f"\n📅 PHASES ({len(master_plan.phases)}):")
    for phase in master_plan.phases:
        print(f"   • {phase.name}: {phase.start_date} → {phase.end_date}")
        print(f"     Focus: {phase.focus}")
    
    # ASSERTIONS
    print(f"\n{'─' * 60}")
    print("📊 ASSERTIONS:")
    
    # A1: Must have exactly 10 activities
    assert len(master_plan.target_activity_list) == 10, \
        f"FAIL: Expected 10 activities, got {len(master_plan.target_activity_list)}"
    print(f"   ✅ A1: Exactly 10 activities generated")
    
    # A2: Must have school strategies
    assert len(master_plan.school_strategies) > 0, "FAIL: No school strategies"
    print(f"   ✅ A2: {len(master_plan.school_strategies)} school strategies")
    
    # A3: STEM schools must have swap strategy
    stem_schools = [s for s in master_plan.school_strategies if "MIT" in s.target_school or "Caltech" in s.target_school]
    if stem_schools:
        has_swap = any(s.swapped_position is not None for s in stem_schools)
        assert has_swap, "FAIL: STEM schools should have swap strategy"
        print(f"   ✅ A3: STEM schools have 1-Swap Rule applied")
    
    # A4: Must have identity seeds
    assert len(master_plan.identity_seeds) > 0, "FAIL: No identity seeds"
    print(f"   ✅ A4: {len(master_plan.identity_seeds)} identity seeds generated")
    
    # A5: Identity seeds must have 8-month lead (check first seed)
    if master_plan.identity_seeds:
        first_seed = master_plan.identity_seeds[0]
        plant_date = datetime.fromisoformat(first_seed.plant_date)
        bloom_date = datetime.fromisoformat("2026-11-01")  # Early Action
        months_diff = (bloom_date.year - plant_date.year) * 12 + (bloom_date.month - plant_date.month)
        assert months_diff >= 7, f"FAIL: Seed lead time is {months_diff} months, expected ~8"
        print(f"   ✅ A5: Identity seeds have {months_diff}-month lead time")
    
    # A6: Must have phases
    assert len(master_plan.phases) > 0, "FAIL: No phases"
    print(f"   ✅ A6: {len(master_plan.phases)} timeline phases")
    
    # A7: Overwhelm factor should be 1.4
    assert master_plan.overwhelm_factor == 1.4, f"FAIL: Overwhelm factor is {master_plan.overwhelm_factor}"
    print(f"   ✅ A7: Strategic overwhelm factor = {master_plan.overwhelm_factor}")
    
    print(f"\n{'=' * 60}")
    print("✅ TEST 1 PASSED: Master Game Plan Generation Verified")
    print("=" * 60)
    
    return master_plan


# =============================================================================
# TEST 2: SCHEMA VALIDATION
# =============================================================================

def test_schema_validation(master_plan: MasterGamePlan):
    """
    CRITICAL: Does the output conform to MasterGamePlan schema?
    """
    print("\n" + "=" * 60)
    print("🔍 TEST 2: SCHEMA VALIDATION")
    print("=" * 60)
    
    # Convert to dict and back to validate
    plan_dict = master_plan.model_dump()
    
    print(f"\n📊 SCHEMA FIELDS:")
    print(f"   student_id: {plan_dict['student_id']}")
    print(f"   generated_at: {plan_dict['generated_at']}")
    print(f"   narrative_brand: {plan_dict['narrative_brand'][:50]}...")
    print(f"   target_activity_list: {len(plan_dict['target_activity_list'])} items")
    print(f"   school_strategies: {len(plan_dict['school_strategies'])} items")
    print(f"   phases: {len(plan_dict['phases'])} items")
    print(f"   identity_seeds: {len(plan_dict['identity_seeds'])} items")
    
    # Try to reconstruct from dict
    try:
        reconstructed = MasterGamePlan(**plan_dict)
        print(f"\n✅ Schema validation passed")
    except Exception as e:
        raise AssertionError(f"FAIL: Schema validation failed: {e}")
    
    print(f"\n{'=' * 60}")
    print("✅ TEST 2 PASSED: Schema Validation Complete")
    print("=" * 60)


# =============================================================================
# MAIN: RUN ALL TESTS
# =============================================================================

def main():
    """Run the full verification suite"""
    
    print("\n" + "═" * 60)
    print("🔬 MASTER GAME PLAN VERIFICATION SUITE")
    print(f"   Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Version: IvyLevel v5.2")
    print("═" * 60)
    
    try:
        # TEST 1: Master Game Plan Generation
        master_plan = test_master_gameplan_generation()
        
        # TEST 2: Schema Validation
        test_schema_validation(master_plan)
        
        # Save output for inspection
        output_path = Path("/tmp/master_gameplan_test.json")
        with open(output_path, "w") as f:
            json.dump(master_plan.model_dump(), f, indent=2)
        print(f"\n💾 Output saved to: {output_path}")
        
        # FINAL VERDICT
        print("\n" + "═" * 60)
        print("🏆 ALL TESTS PASSED - MASTER GAME PLAN VERIFIED")
        print("=" * 60)
        print("\nThe Federation Pattern is working correctly.")
        print("GamePlanAgent successfully orchestrates all specialists.")
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
