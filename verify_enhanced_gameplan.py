
import asyncio
import sys
import os
from unittest.mock import MagicMock, patch

# Adjust path to include project root
sys.path.append(os.getcwd())

from backend.agents.orchestrators.gameplan import GamePlanAgent
from backend.agents.schemas.gameplan import MasterGamePlan
from backend.agents.schemas.assessment import NarrativeIdentity
from backend.agents.schemas.ec import ECGeneration, ActivityRecommendation
from backend.agents.schemas.awards import AwardsOutput, AwardMatch, AwardPortfolio
from backend.agents.schemas.programs import ProgramsOutput, ProgramRecommendation
from backend.agents.schemas.react import ReactMetadata

async def verify_enhanced_gameplan():
    print("🚀 Starting Enhanced GamePlan Flow Verification (MOCKED)...")
    
    # Mock Profile
    profile = {
        "id": "student_123",
        "name": "Huda",
        "grade": 11,
        "target_schools": ["MIT", "Stanford", "Harvard"], # Added MIT to trigger 1-Swap
        "academic_interests": ["Computer Science", "Robotics"],
        "academic": {
            "gpa": 3.9,
            "taken_aps": 4,
            "grades": {"Math": "A", "Science": "A"}
        },
        "interests": ["Robotics", "AI", "Debate"],
        "identity": {
            "grade": 11
        }
    }
    
    # Mock Assessment
    assessment = {
        "ivy_plus_score": 65,
        "completeness_score": 0.8,
        "analysis_notes": ["Strong technical aptitude", "Leadership potential in STEM"]
    }
    
    # -------------------------------------------------------------------------
    # MOCK SETUP
    # -------------------------------------------------------------------------
    with patch("backend.agents.orchestrators.gameplan.load_ivy_agent") as mock_load:
        
        # 1. Mock Narrative Agent
        mock_narrative = MagicMock()
        mock_narrative.generate_identity.return_value = NarrativeIdentity(
            brand_statement="Future Tech Leader",
            narrative_dna="Innovator | Builder | Leader",
            spike="AI Robotics",
            themes=["Technology", "Leadership"],
            archetype_name="The Architect",
            pillars=["Innovation", "Impact", "Scale", "Ethics"],
            confidence_score=0.9,
            _react=ReactMetadata(agent_name="Narrative", cycles_executed=1)
        )
        
        # 2. Mock EC Agent
        mock_ec = MagicMock()
        mock_ec.run.return_value = {
            "activities": [
                {"name": "Robotics Club Founder", "role_level": "Founder", "description": "Founded club...", "touchpoints": 50, "category": "APTITUDE"},
                {"name": "Debate Captain", "role_level": "Captain", "description": "Led team...", "touchpoints": 30, "category": "LEADERSHIP"}
            ],
            "four_pillars": {"identity": "Tech", "aptitude": "Coding", "passion": "Building", "service": "Teaching"},
            "seeds": [],
            "_react": ReactMetadata(agent_name="EC", cycles_executed=1)
        }
        
        # 3. Mock Awards Agent
        mock_awards = MagicMock()
        mock_awards.generate_recommendations.return_value = AwardsOutput(
            matches=[
                AwardMatch(name="National Merit", organization="NMSC", win_probability=0.8),
                AwardMatch(name="FIRST Robotics Dean's List", organization="FIRST", win_probability=0.4)
            ],
            top_recommendations=[
                 AwardMatch(name="National Merit", organization="NMSC", win_probability=0.8, deadline="2026-10-15"),
                 AwardMatch(name="FIRST Robotics Dean's List", organization="FIRST", win_probability=0.4, deadline="2026-11-01")
            ],
            portfolio=AwardPortfolio(
                reach=[AwardMatch(name="Regeneron STS", organization="Regeneron", win_probability=0.1)],
                target=[AwardMatch(name="FIRST Robotics Dean's List", organization="FIRST", win_probability=0.4)],
                safety=[AwardMatch(name="National Merit", organization="NMSC", win_probability=0.8)]
            ),
            react_metadata=ReactMetadata(agent_name="Awards", cycles_executed=1)
        )
        
        # 4. Mock Programs Agent
        mock_programs = MagicMock()
        mock_programs.generate_recommendations.return_value = ProgramsOutput(
            recommended_programs=[
                ProgramRecommendation(name="RSI", type="Research", selectivity=0.9, application_deadline="2026-01-15"),
                ProgramRecommendation(name="MIT MOSTEC", type="Engineering", selectivity=0.8, application_deadline="2026-02-01")
            ],
            stem_heavy_swap=ProgramRecommendation(name="Ross Math", type="Math", application_deadline="2026-03-01"),
            react_metadata=ReactMetadata(agent_name="Programs", cycles_executed=1)
        )
        
        # 5. Mock Opportunity Agent
        mock_opp = MagicMock()
        mock_opp.run.return_value = {
            "tier_1_matches": [{"name": "NASA Internship", "type": "Internship", "why_fit": "Great fit"}],
            "tier_2_matches": [],
            "_react": ReactMetadata(agent_name="Opportunity", cycles_executed=1)
        }
        
        # Dispatcher
        def side_effect(agent_id, profile):
            if agent_id == "spec_narrative": return mock_narrative
            if agent_id == "spec_ec": return mock_ec
            if agent_id == "spec_awards": return mock_awards
            if agent_id == "spec_programs": return mock_programs
            if agent_id == "spec_opportunity": return mock_opp
            return MagicMock()
            
        mock_load.side_effect = side_effect
        
        try:
            # Initialize Agent
            agent = GamePlanAgent(student_profile=profile)
            
            # Run Generation
            print("\n⏳ Running generate_master_plan (Federated)...")
            master_plan = await agent.generate_master_plan(profile, assessment)
            
            # Verification Checks
            print("\n🔍 Verification Results:")
            
            # 1. Check Top-Level Identity
            if master_plan.identity_synthesis and master_plan.identity_synthesis.spike:
                print(f"  ✅ Identity Synthesis: {master_plan.identity_synthesis.spike}")
            else:
                print(f"  ❌ Identity Synthesis MISSING")
                
            # 2. Check Nested Narratives
            if master_plan.narrative and master_plan.narrative.brand_statement:
                print(f"  ✅ Narrative DNA Nested: {master_plan.narrative.brand_statement[:30]}...")
            else:
                print(f"  ❌ Narrative DNA Nested MISSING")
                
            # 3. Check Nested Specialists
            if master_plan.ec_generation and master_plan.ec_generation.recommended_activities:
                print(f"  ✅ EC Generation: {len(master_plan.ec_generation.recommended_activities)} activities")
            else:
                print(f"  ❌ EC Generation MISSING")
                
            if master_plan.awards and master_plan.awards.matches:
                print(f"  ✅ Awards: {len(master_plan.awards.matches)} matches")
            else:
                print(f"  ⚠️ Awards Empty")
                
            if master_plan.programs and master_plan.programs.recommended_programs:
                print(f"  ✅ Programs: {len(master_plan.programs.recommended_programs)} recommendations")
            else:
                print(f"  ⚠️ Programs Empty")
                
            if master_plan.opportunities and (master_plan.opportunities.get("tier_1_matches") or master_plan.opportunities.get("tier_2_matches")):
                 print(f"  ✅ Opportunities (Scout): Found matches in separate field")
            else:
                 print(f"  ⚠️ Opportunities Empty or Missing Field")
                
            # 4. Check ReAct Metadata
            if master_plan.react_metadata:
                print(f"  ✅ ReAct Metadata: {master_plan.react_metadata.cycles_executed} cycles")
            else:
                print(f"  ❌ ReAct Metadata Missing")
                
            if master_plan.react_by_agent:
                 print(f"  ✅ ReAct By Agent Keys: {list(master_plan.react_by_agent.keys())}")
            else:
                 print(f"  ❌ ReAct By Agent Dictionary Missing")

            # 5. Check Target Activity List
            print(f"  ✅ Target Activity List: {len(master_plan.target_activity_list)} items")
            if len(master_plan.target_activity_list) < 10:
                print(f"  ⚠️ Warning: Less than 10 activities ({len(master_plan.target_activity_list)})")

            # 6. Check Summary & Logic (New Validations)
            print(f"  ✅ Summary: {master_plan.summary.model_dump()}")
            if master_plan.summary.total_touchpoints == 0 and len(master_plan.target_activity_list) > 0:
                 print(f"  ⚠️ Logic Check: Total Touchpoints is 0 (Check _compute_summary)")
                 
            # 7. Check Identity Seeds (8-Month Rule)
            if master_plan.identity_seeds:
                seed = master_plan.identity_seeds[0]
                print(f"  ✅ Identity Seed Sample: {seed.name} | Plant: {seed.plant_date} -> Target: {seed.target_deadline}")
            
            # 8. Check Strategy (1-Swap Verification)
            if master_plan.school_strategies:
                print(f"  ✅ School Strategies: {[s.strategy_note for s in master_plan.school_strategies]}")
            else:
                print(f"  ⚠️ No School Strategies Generated")
                
            # 9. Check Portfolio Analysis (Computed)
            if master_plan.portfolio_analysis:
                print(f"  ✅ Portfolio Analysis: {master_plan.portfolio_analysis}")
                if "Rigor" in master_plan.portfolio_analysis.get("strengths", []) and len(master_plan.target_activity_list) > 0:
                     print(f"  ⚠️ Logic Check: Strengths might still be hardcoded or coincidentally 'Rigor'")
            
            # 10. Check Phasing
            if master_plan.phases:
                 print(f"  ✅ Phases: {len(master_plan.phases)} phases generated")
                 for p in master_plan.phases:
                     if p.activities:
                         print(f"     - {p.name}: {len(p.activities)} acts")
            
            print("\n✨ Verification Complete!")
            return True
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"\n❌ Verification Failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_enhanced_gameplan())
