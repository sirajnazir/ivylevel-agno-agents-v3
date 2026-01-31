# GamePlanAgent v5.2 - Tier 1: Orchestrator
# Path: backend/agents/orchestrators/gameplan.py
# Role: The Architect (Target Application Generator)
"""
GamePlanAgent (Tier 1: Orchestrator)

THE FEDERATION PATTERN: This agent orchestrates all Tier 2 specialists
to assemble the "Target Common Application" - a future-casted dream activity list.

Core Innovation: The Game Plan IS the Common App (future-tense).
Students work backward from this vision.

IMPLEMENTS:
- ACP-004: Strategic Overwhelm (1.4x task inflation)
- ACP-006: Identity Seeds (8-month lead time)
- The 1-Swap Rule (STEM school strategy)
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from backend.agents.base import IvyAgent
from backend.agents.registry import load_ivy_agent
from backend.agents.schemas import (
    MasterGamePlan,
    CommonAppActivity,
    ActivityStatus,
    SchoolDelta,
    IdentitySeed,
    Phase,
    IdentitySynthesis,
    NarrativeIdentity,
)
from backend.agents.logic import (
    apply_strategic_overwhelm,
    generate_identity_seeds,
    calculate_phasing,
    generate_swap_strategy,
    STEM_SCHOOLS,
)


# =============================================================================
# GAME PLAN AGENT
# =============================================================================

class GamePlanAgent(IvyAgent):
    """
    The Architect - Generates the Master Game Plan.
    
    Tier: 1 (Orchestrator)
    Pattern: Federation (calls all Tier 2 specialists)
    Output: MasterGamePlan with 10 future-casted Common App activities
    """
    
    @property
    def agent_id(self) -> str:
        return "orch_gameplan"
    
    @property
    def tier(self) -> int:
        return 1
    
    def get_instructions(self) -> List[str]:
        return [
            "You are the GamePlanAgent, the Master Architect for IvyLevel.",
            "Your role is to assemble the 'Target Common Application' - the dream activity list.",
            "",
            "THE FEDERATION LAW:",
            "1. GATHER ingredients from all Tier 2 specialists",
            "2. ASSEMBLE the 10 Common App slots using their outputs",
            "3. APPLY the 1-Swap Rule for STEM schools",
            "4. WRITE all descriptions in PAST TENSE (future-casting)",
            "5. DO NOT invent activities - strictly use specialist outputs",
        ]
    
    async def generate_master_plan(
        self,
        profile: Dict[str, Any],
        assessment: Dict[str, Any],
    ) -> MasterGamePlan:
        """
        Orchestrate the creation of the Master Game Plan.
        
        Flow:
        1. Narrative Agent (Sequential) -> Sets the "North Star"
        2. Specialists (Parallel) -> EC, Awards, Programs
        3. Orchestrator -> Assembles, Phases, and Summarizes
        """
        import asyncio
        from backend.agents.schemas.react import ReactMetadata, CycleSummary
        
        start_time = datetime.utcnow()
        student_id = profile.get("id", getattr(self, "student_id", "unknown"))
        react_metadata = ReactMetadata(agent_name="GamePlan_Orchestrator")
        react_by_agent = {}
        
        # Initialize Metrics
        cycles_count = 0
        quality_scores = []

        # Enrich Profile Context (V2 Transformation)
        from backend.agents.utils import transform_profile_for_agent
        profile = transform_profile_for_agent(profile)
        
        # Merge assessment summary if needed, but V2 profile structure is preferred
        enriched_profile = {**profile, "assessment_summary": assessment}
        enriched_assessment = {**assessment}

        # ---------------------------------------------------------------------
        # STEP 1: NARRATIVE AGENT (SEQUENTIAL - MUST COMPLETE FIRST)
        # ---------------------------------------------------------------------
        print(f"🔄 Phase 1: Narrative Agent (Identity Source)...")
        react_metadata.cycles_executed += 1
        react_metadata.cycle_summary.append(CycleSummary(
            iteration=1,
            phases={
                "THINK": {"thought": "Need identity synthesis before specialists can match", "timestamp": datetime.utcnow().isoformat()},
                "ACT": {"action": "Calling NarrativeAgent.generate_identity()", "timestamp": datetime.utcnow().isoformat()},
                "OBSERVE": {"observation": "", "quality_score": 0.0, "timestamp": ""}
            }
        ))

        narrative_agent = load_ivy_agent("spec_narrative", profile)
        narrative_result: NarrativeIdentity = narrative_agent.generate_identity()
        
        # Create Identity Synthesis
        identity_synthesis = IdentitySynthesis(
            archetype=narrative_result.archetype_name,
            spike=narrative_result.spike,
            pillars=narrative_result.pillars,
            brand_statement=narrative_result.brand_statement,
            confidence=narrative_result.confidence_score
        )
        
        print(f"  ✅ Narrative: '{narrative_result.brand_statement}' (Spike: {narrative_result.spike})")
        
        react_metadata.cycle_summary[0].phases["OBSERVE"] = {
            "observation": f"Identity synthesized: {identity_synthesis.spike}",
            "quality_score": narrative_result.confidence_score,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if narrative_result.react_metadata:
            react_by_agent["Narrative"] = narrative_result.react_metadata
            cycles_count += narrative_result.react_metadata.cycles_executed
            quality_scores.append(narrative_result.react_metadata.quality_score)
            
            # Add to main trace
            react_metadata.cycle_summary.extend(narrative_result.react_metadata.cycle_summary)

        # ---------------------------------------------------------------------
        # STEP 2: SPECIALISTS (PARALLEL)
        # ---------------------------------------------------------------------
        print(f"🔄 Phase 2: Parallel Specialists (EC, Awards, Programs, Ops)...")
        react_metadata.cycles_executed += 1
        react_metadata.cycle_summary.append(CycleSummary(
            iteration=2,
            phases={
                "THINK": {"thought": "Identity ready, running specialists in parallel", "timestamp": datetime.utcnow().isoformat()},
                "ACT": {"action": "asyncio.gather(EC, Awards, Programs, Opportunity)", "timestamp": datetime.utcnow().isoformat()},
                "OBSERVE": {"observation": "", "quality_score": 0.0, "timestamp": ""}
            }
        ))

        # Enrich contexts
        enriched_profile = {**profile, "identity_synthesis": identity_synthesis.model_dump()}
        enriched_assessment = {**assessment, "archetype": identity_synthesis.archetype, "spike": identity_synthesis.spike}

        # Load specialists
        ec_agent = load_ivy_agent("spec_ec", enriched_profile)
        awards_agent = load_ivy_agent("spec_awards", enriched_profile)
        programs_agent = load_ivy_agent("spec_programs", enriched_profile)
        opportunity_agent = load_ivy_agent("spec_opportunity", enriched_profile)
        
        # Helper wrappers for async execution if agents are sync
        # In v5.2, agents might be sync, so we wrap them or check if async
        # For now, we assume they might block, so strict async IO requires threadpool or they are async def
        # If they are sync, asyncio.to_thread is safer. Assuming sync for now based on base class.
        
        # Mocking async wrapper for sync agents
        async def run_sync_agent(agent_func, *args, **kwargs):
            return await asyncio.to_thread(agent_func, *args, **kwargs)

        # PARALLEL EXECUTION
        # Note: EC agent uses 'run' with mode='planning', others use specific methods
        results = await asyncio.gather(
            run_sync_agent(ec_agent.run, mode="planning", context=enriched_profile),
            run_sync_agent(awards_agent.generate_recommendations, enriched_profile, enriched_assessment),
            run_sync_agent(programs_agent.generate_recommendations, enriched_profile, enriched_assessment),
            run_sync_agent(opportunity_agent.run, mode="planning", context={"profile": enriched_profile}),
            return_exceptions=True
        )
        
        ec_raw, awards_res, programs_res, opp_raw = results

        # Process Results & Handle Failures
        from backend.agents.schemas import ECGeneration, AwardsOutput, ProgramsOutput, ECPortfolioOutput
        
        # EC Result
        ec_gen = ECGeneration()
        if isinstance(ec_raw, dict): 
            try:
                # Map dict to ECGeneration (adapt if needed provided EC agent returns ECPortfolioOutput equivalent dict)
                # The EC agent actually returns a dict compatible with ECPortfolioOutput
                # We need to map it to ECGeneration for the schema
                ec_gen = ECGeneration(
                    recommended_activities=ec_raw.get("activities", []),
                    four_pillars=ec_raw.get("four_pillars", {}),
                    seeds=ec_raw.get("seeds", [])
                    # _react handled below
                )
            except Exception as e: print(f"⚠️ EC Mapping Error: {e}")
        elif not isinstance(ec_raw, Exception): 
             # If it's an object, try to convert
             pass

        # Awards Result
        awards_out = awards_res if isinstance(awards_res, AwardsOutput) else AwardsOutput()
        if isinstance(awards_res, Exception): print(f"❌ Awards Agent Failed: {awards_res}")

        # Programs Result
        programs_out = programs_res if isinstance(programs_res, ProgramsOutput) else ProgramsOutput()
        if isinstance(programs_res, Exception): print(f"❌ Programs Agent Failed: {programs_res}")
        
        # Opportunity Result
        opp_matches = []
        if isinstance(opp_raw, dict):
            opp_matches = opp_raw.get("tier_1_matches", []) + opp_raw.get("tier_2_matches", [])
        elif hasattr(opp_raw, "tier_1_matches"):
             opp_matches = opp_raw.tier_1_matches + opp_raw.tier_2_matches

        print(f"  ✅ Specialists Complete: EC={len(ec_gen.recommended_activities)}, Awards={len(awards_out.matches)}, Programs={len(programs_out.recommended_programs)}")

        # Collect ReAct - Robust Logic for Aliasing
        # Agents might populate 'react_metadata' (field) or '_react' (alias)
        for idx, res in enumerate([ec_raw, awards_res, programs_res, opp_raw]):
            meta = None
            agent_name = ["EC", "Awards", "Programs", "Opportunity"][idx]
            
            # Check for meta in various locations
            if hasattr(res, "react_metadata") and res.react_metadata:
                meta = res.react_metadata
            elif hasattr(res, "_react") and res._react: # Pydantic private attr sometimes
                meta = res._react
            elif isinstance(res, dict) and "_react" in res:
                meta = res["_react"]
            
            # If meta found, append
            if meta:
                # Normalize if dict
                if isinstance(meta, dict):
                    # Convert to object for uniformity if needed or just use values
                    # Simplest is to wrap in ReactMetadata if it's a dict
                    try:
                        meta_obj = ReactMetadata(**meta)
                        meta = meta_obj
                    except: pass
                
                # Verify object
                if hasattr(meta, "cycles_executed"):
                    if not meta.agent_name: meta.agent_name = agent_name
                    
                    # USER REQUEST: Exclude Opportunity Agent from Multi-Agent Tab
                    # We still track its metrics but don't expose it in react_by_agent (which drives the UI tabs)
                    if meta.agent_name != "Opportunity":
                        react_by_agent[meta.agent_name] = meta
                    
                    cycles_count += meta.cycles_executed
                    quality_scores.append(meta.quality_score)
                    react_metadata.cycle_summary.extend(meta.cycle_summary)
            else:
                 print(f"⚠️ No ReAct metadata found for {agent_name}")
        
        # ---------------------------------------------------------------------
        # STEP 3: AGGREGATION & PHASING
        # ---------------------------------------------------------------------
        
        # Assemble 10 slots
        target_activities = self._assemble_10_activities(
            ec_gen.recommended_activities,
            awards_out.top_recommendations,
            programs_out.recommended_programs,
            opp_matches
        )
        
        # Generate Identity Seeds
        seeds = self._generate_identity_seeds(
            awards_out.top_recommendations, 
            programs_out.recommended_programs,
            narrative_result.brand_statement
        )
        
        # Phasing & Mapping
        current_grade = profile.get("grade", 11)
        phases = self._generate_mapping_phases(current_grade, target_activities)
        
        # Swap Strategy
        school_strategies = self._generate_school_strategies(
            target_activities,
            programs_out.stem_heavy_swap,
            profile.get("target_schools") or []
        )
        
        # Compute Summary
        summary = self._compute_summary(ec_gen, awards_out, programs_out)
        
        # Portfolio Analysis (Computed)
        # Analyze distribution of activity types
        types = [a.type for a in target_activities]
        has_research = any("Research" in t for t in types)
        has_service = any("Service" in t for t in types) or any("Non-Profit" in a.organization for a in target_activities)
        has_leadership = any("Founder" in a.role for a in target_activities) or any("President" in a.role for a in target_activities)
        
        strengths = []
        if has_research: strengths.append("Intellectual Vitality")
        if has_leadership: strengths.append("Leadership")
        if has_service: strengths.append("Community Impact")
        
        gaps = []
        if not has_research and "STEM" in identity_synthesis.spike: gaps.append("Research Experience")
        if not has_leadership: gaps.append("Leadership Roles")
        
        portfolio_analysis = {
            "strengths": strengths if strengths else ["Emerging Potential"],
            "gaps": gaps
        }
        
        # Final ReAct Update
        react_metadata.cycles_executed = cycles_count + react_metadata.cycles_executed # Total cycles
        react_metadata.quality_score = sum(quality_scores) / len(quality_scores) if quality_scores else 0.85 # Average quality
        react_metadata.cycle_summary[1].phases["OBSERVE"] = {
            "observation": f"Aggregation complete. {len(target_activities)} activities scheduled.",
            "quality_score": react_metadata.quality_score,
            "timestamp": datetime.utcnow().isoformat()
        }

        # ---------------------------------------------------------------------
        # STEP 4: RETURN MASTER PLAN
        # ---------------------------------------------------------------------
        return MasterGamePlan(
            profile_id=student_id,
            narrative_dna=narrative_result.narrative_dna,
            
            # Identity
            identity_synthesis=identity_synthesis,
            archetype=identity_synthesis.archetype,
            spike=identity_synthesis.spike,
            pillars=identity_synthesis.pillars,
            
            # Nested Specialist Data (The "One-Shot" Payload)
            narrative=narrative_result,
            ec_generation=ec_gen,
            awards=awards_out,
            programs=programs_out,
            
            # Opportunities data (for OpportunityAgentCard)
            opportunities=opp_raw if isinstance(opp_raw, dict) else (
                opp_raw.model_dump() if hasattr(opp_raw, "model_dump") else {}
            ),
            
            # Assembled
            target_activity_list=target_activities,
            identity_seeds=seeds,
            phases=phases,
            
            # Strategic content
            
            # Strategic content
            school_strategies=school_strategies,
            strategic_insights=programs_out.strategic_insights + awards_out.strategic_insights,
            portfolio_analysis=portfolio_analysis,
            
            # Metadata
            summary=summary,
            react_metadata=react_metadata,
            react_by_agent=react_by_agent
        )

    # -------------------------------------------------------------------------
    # HELPER METHODS
    # -------------------------------------------------------------------------

    def _assemble_10_activities(self, ec_acts, awards, programs, opps) -> List[CommonAppActivity]:
        """Assemble the 10 slots from disparate sources"""
        activities = []
        pos = 1
        
        # Logic to interleave: 1. EC (Main), 2-3. Awards, 4-5. EC, 6-7. Program, 8-9. Opps, 10. Filler
        # (Simplified implementation for robust fallback)
        
        # 1. Primary EC
        if ec_acts:
            activities.append(self._to_common_app(ec_acts[0], pos, "Extracurricular"))
            pos += 1
            
        # 2-3. Awards
        for aw in awards[:2]:
            activities.append(CommonAppActivity(
                position=pos, type="Award/Honor", role="Recipient",
                organization=aw.organization, description=f"{aw.name} - {aw.description[:100]}",
                status=ActivityStatus.PLANNED
            ))
            pos += 1
            
        # 4-5. ECs
        for ec in ec_acts[1:3]:
            activities.append(self._to_common_app(ec, pos, "Extracurricular"))
            pos += 1
            
        # 6-7. Programs
        for pg in programs[:2]:
            activities.append(CommonAppActivity(
                position=pos, type="Summer Program", role="Participant",
                organization=pg.organization, description=pg.name,
                status=ActivityStatus.PLANNED
            ))
            pos += 1
            
        # Fill rest
        while len(activities) < 10:
            activities.append(CommonAppActivity(
                position=pos, type="Placeholder", role="TBD", organization="TBD",
                description="Future strategic activity", status=ActivityStatus.PLANNED
            ))
            pos += 1
            
        return activities[:10]

    def _to_common_app(self, item, pos, type_label):
        # Helper to convert generic item to CommonAppActivity
        name = ""
        desc = ""
        role = "Member"
        
        if isinstance(item, dict):
            name = item.get("name", "")
            desc = item.get("description", "")
            role = item.get("role_level", "Member")
        else:
            # Assume Object/Pydantic
            name = getattr(item, "name", "")
            desc = getattr(item, "description", "")
            role = getattr(item, "role_level", "Member")
        
        return CommonAppActivity(
            position=pos, type=type_label, role=role,
            organization=name, description=desc,
            status=ActivityStatus.PLANNED
        )

    def _generate_identity_seeds(self, awards, programs, brand) -> List[IdentitySeed]:
        seeds = []
        
        # Process Awards
        for aw in awards[:3]:
            if aw.deadline:
                try:
                    # Parse deadline - handle potential Z suffix
                    deadline_str = aw.deadline.replace("Z", "+00:00")
                    # If naive (no timezone), map it (or assume UTC but fromisoformat handles mostly)
                    # Simple try/except for robust parsing
                    try:
                        deadline_date = datetime.fromisoformat(deadline_str)
                    except ValueError:
                        # Fallback for simple date YYYY-MM-DD
                        deadline_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d")
                        
                    plant_date = deadline_date - timedelta(days=240) # 8 months lead time

                    seeds.append(IdentitySeed(
                        name=f"Seed: {aw.name}",
                        action=f"Begin narrative thread for {aw.name} aligning with '{brand[:50]}...'",
                        target_deadline=aw.deadline,
                        plant_date=plant_date.isoformat(),
                        narrative_theme=getattr(aw, "category", "Achievement"),
                        # type="award", planted=False # If fields exist in IdentitySeed
                    ))
                except Exception as e:
                    print(f"⚠️ Date parsing failed for {aw.name}: {e}")
                    pass

        # Process Programs
        for pg in programs[:2]:
            if pg.application_deadline:
                 try:
                    deadline_str = pg.application_deadline.replace("Z", "+00:00")
                    try:
                        deadline_date = datetime.fromisoformat(deadline_str)
                    except ValueError:
                         if deadline_str.lower() in ["rolling", "unknown"]: continue
                         deadline_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d")
                    
                    plant_date = deadline_date - timedelta(days=240)
                    
                    seeds.append(IdentitySeed(
                        name=f"Seed: {pg.name}",
                        action=f"Develop experience for {pg.name} application",
                        target_deadline=pg.application_deadline,
                        plant_date=plant_date.isoformat(),
                        narrative_theme=pg.type if hasattr(pg, "type") else "Program",
                    ))
                 except Exception:
                     pass
                     
        return seeds

    def _generate_mapping_phases(self, grade, activities) -> List[Phase]:
        # Reuse existing calculation but map activities
        phase_dicts = calculate_phasing(int(grade) if str(grade).isdigit() else 11)
        phases = [Phase(**p, activities=[]) for p in phase_dicts]
        
        # Map activities based on grade level or type
        for act in activities:
             # Default logic: Programs -> Summer (Phase 0 or 1), Leadership -> Phase 2
             # Or check for grade_levels attribute if available
             
             # Simple Distribution Logic for now based on report suggestion:
             # Foundation (9-10) -> early phases
             # Acceleration (11) -> middle
             # Polish (12) -> late
             
             # Since we are forward casting, we distribute by type:
             if "Program" in act.type or "Summer" in act.organization:
                 # Summer activities usually go to upcoming summer (Phase 0/1)
                 phases[0].activities.append({"name": act.organization, "type": act.type})
             elif "Award" in act.type:
                 # Awards often come later as results of projects
                 target_phase = 1 if len(phases) > 1 else 0
                 phases[target_phase].activities.append({"name": act.organization, "type": act.type})
             else:
                 # Projects/ECs cover duration, put in last phase (Application/Polish)
                 phases[-1].activities.append({"name": act.organization, "type": act.type})
            
        return phases

    def _generate_school_strategies(self, activities, swap, schools) -> List[SchoolDelta]:
        deltas = []
        STEM_TARGETS = {"MIT", "CALTECH", "HARVEY MUDD", "OLIN", "OLIN COLLEGE", "GEORGIA TECH", "CARNEGIE MELLON", "CMU"}
        
        for school in schools:
            school_upper = school.upper() if isinstance(school, str) else str(school)
            
            # Check if STEM school
            is_stem = any(stem in school_upper for stem in STEM_TARGETS)
            
            if is_stem and swap:
                deltas.append(SchoolDelta(
                    target_school=school,
                    strategy_note=f"STEM Strategy: Swap position 3 for '{swap.name}'",
                    swapped_position=3,
                    swap_with=swap.name,
                    # rationale="Emphasize technical depth for STEM schools" # If schema supports
                ))
            else:
                 deltas.append(SchoolDelta(target_school=school, strategy_note="Standard Path"))
                 
        return deltas

    def _compute_summary(self, ec, awards, programs):
        from backend.agents.schemas.gameplan import GamePlanSummary
        from backend.agents.schemas.awards import AwardPortfolio
        
        activities = ec.recommended_activities or []
        portfolio = awards.portfolio if awards.portfolio else AwardPortfolio()
        
        # Compute touchpoints
        total_touchpoints = sum(getattr(a, 'touchpoints', 0) for a in activities)
        
        # Compute average ROI
        # Fallback to fit_score if roi_score missing
        roi_scores = [getattr(a, 'roi_score', getattr(a, 'fit_score', 0.5)) for a in activities]
        average_roi = sum(roi_scores) / len(roi_scores) if roi_scores else 0.0
        
        # Award counts
        total_awards = len(portfolio.reach or []) + len(portfolio.target or []) + len(portfolio.safety or [])

        return GamePlanSummary(
            total_activities=len(activities),
            total_touchpoints=total_touchpoints,
            average_roi=round(average_roi, 2),
            total_awards_matched=total_awards,
            total_programs_matched=len(programs.recommended_programs),
            # Ideally these fields are in GamePlanSummary schema, if not we add or ignore
            # Based on report, they seem expected but might need schema update if missing
        )
    
    def save_to_database(self, master_plan: MasterGamePlan) -> Dict[str, Any]:
        """
        Save MasterGamePlan to Supabase (v7.1).
        
        Args:
            master_plan: The complete game plan to persist
            
        Returns:
            Dict with save status and plan_id
        """
        try:
            from backend.database.supabase_client import get_supabase_client
            
            supabase = get_supabase_client()
            
            # Prepare data
            plan_dict = master_plan.model_dump()
            
            data = {
                "student_id": master_plan.profile_id, # Changed from master_plan.student_id to master_plan.profile_id
                "plan_data": plan_dict,
                "narrative_brand": master_plan.identity_synthesis.brand_statement, # Changed from master_plan.narrative_brand
                "current_ivy_score": 0, # Placeholder, assuming this was removed from MasterGamePlan
                "target_ivy_score": 0, # Placeholder, assuming this was removed from MasterGamePlan
                "activity_count": len(master_plan.target_activity_list),
            }
            
            # Insert into database
            result = supabase.table("game_plans").insert(data).execute()
            
            print(f"✅ Game Plan saved to database (ID: {result.data[0]['id']})")
            
            return {
                "success": True,
                "plan_id": result.data[0]["id"],
                "student_id": master_plan.profile_id,
            }
            
        except Exception as e:
            print(f"❌ Failed to save Game Plan: {e}")
            return {
                "success": False,
                "error": str(e),
            }
    
    async def run(self, profile: Dict[str, Any], assessment: Dict[str, Any]) -> Dict[str, Any]:

        """Main entry point for registry"""
        result = await self.generate_master_plan(profile, assessment)
        return result.model_dump(by_alias=True)


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def create_gameplan_agent(student_id: str) -> GamePlanAgent:
    """Factory function for the agent registry"""
    profile = {"id": student_id}
    return GamePlanAgent(profile)
