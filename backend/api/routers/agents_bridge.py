from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.agents.registry import load_ivy_agent, load_agent
from backend.agents.schemas import (
    MasterGamePlan, NarrativeIdentity, AwardsOutput, 
    ProgramsOutput, ExecutionDebtScore, ActivityStatus,
    APIResponse
)
from backend.tools.calculators import EDSCalculator

from backend.tools.supabase_tools import read_student_profile

# Initialize Router
router = APIRouter(prefix="/agents", tags=["Agent Bridge"])

# =============================================================================
# REQUEST MODELS
# =============================================================================

class AgentContextRequest(BaseModel):
    """Standard request with profile context."""
    student_id: str
    profile: Optional[Dict[str, Any]] = None # Made optional for Frontend convenience
    context: Dict[str, Any] = {}
    
    # Allow "profile_id" alias from frontend
    def __init__(self, **data):
        if 'profile_id' in data and 'student_id' not in data:
            data['student_id'] = data['profile_id']
        super().__init__(**data)

class AssessmentSynthesisRequest(AgentContextRequest):
    """Request for narrative synthesis."""
class AssessmentSynthesisRequest(AgentContextRequest):
    """Request for narrative synthesis."""
    assessment_contract: Optional[Dict[str, Any]] = None

class AssessmentRequest(AgentContextRequest):
    """Request for full assessment scoring."""
    pass

class GamePlanRequest(AgentContextRequest):
    """Request formaster game plan."""
    overwhelm_factor: float = 1.4

class AwardsRequest(AgentContextRequest):
    """Request for award matching."""
    pass

class ProgramsRequest(AgentContextRequest):
    """Request for program matching."""
    pass

class OpportunityRequest(AgentContextRequest):
    """Request for opportunity scouting."""
    pass

class ExecutionRequest(BaseModel):
    """Request for EDS calculation."""
    # This one is different, it takes tasks directly usually.
    # But if we want to support fetching tasks from DB, we might need student_id too.
    # For now, let's keep it as is, or allow student_id to fetch tasks?
    # The frontend hook sends `calculateDebtScore(profileId)`. 
    # So `agnoClient` needs to change to send `student_id`.
    # AND `ExecutionRequest` needs to support `student_id` to fetch tasks?
    # Wait, the current `ExecutionRequest` definition is:
    # tasks: List[Dict[str, Any]]
    # deadline_proximity: float = 0.5
    
    # If the frontend sends { student_id: "..." }, this model will fail validation.
    # We need to update ExecutionRequest to accept student_id and fetch tasks if missing.
    student_id: Optional[str] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    deadline_proximity: float = 0.5

class SimulationRequest(AgentContextRequest):
    """Request for EC project simulation."""
    assessment: Optional[Dict[str, Any]] = None

# =============================================================================
# HELPER
# =============================================================================

async def get_profile_context(request: AgentContextRequest) -> Dict[str, Any]:
    """Helper to ensure profile exists, fetching from DB if needed."""
    if request.profile:
        return request.profile
    
    # Fetch from DB
    print(f"🔍 Fetching profile for {request.student_id} from Supabase...")
    profile = read_student_profile(request.student_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile {request.student_id} not found in database.")
    return profile


# =============================================================================
# BRIDGE ENDPOINTS
# =============================================================================

@router.post("/profile/sync")
async def sync_profile(request: AgentContextRequest):
    """
    Bridge Endpoint: Profile Sync
    Saves full frontend profile state to DB.
    """
    try:
        if not request.profile:
            return {"status": "no_data"}
            
        print(f"💾 Syncing Full Profile for {request.student_id}...")
        
        # We need to map Frontend 'StudentProfile' structure to DB 'profiles' columns
        # Assuming DB uses JSONB for these sections or flattened structure?
        # Let's try to save the top-level keys which likely match JSONB columns:
        # aptitude, passion, community, identity (metadata), operating, demographics
        
        from backend.tools.supabase_tools import update_student_profile
        
        # Safe keys to persist
        keys_to_persist = ["aptitude", "passion", "community", "operating", "demographics", "major_context"]
        updates = {}
        
        for k in keys_to_persist:
            if k in request.profile:
                updates[k] = request.profile[k]
                
        # Also map standard fields
        if "identity" in request.profile:
             ident = request.profile["identity"]
             if "name" in ident: updates["name"] = ident["name"]
             if "grade" in ident: updates["grade"] = ident["grade"]
             
        success = update_student_profile(request.student_id, updates)
        
        if success:
            return {"status": "synced"}
        else:
            raise HTTPException(status_code=500, detail="Database update failed")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        if success:
            return {"status": "synced"}
        else:
            raise HTTPException(status_code=500, detail="Database update failed")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/profile")
async def delete_profile(student_id: str):
    """
    Bridge Endpoint: Delete Profile
    Wipes all user data to allow restart.
    """
    try:
        from backend.tools.supabase_tools import delete_student_data
        
        print(f"🗑️ Deleting data for {student_id}...")
        success = delete_student_data(student_id)
        
        if success:
            return {"status": "deleted"}
        else:
            raise HTTPException(status_code=500, detail="Delete failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assessment/score")
async def score_assessment(request: AssessmentRequest):
    """
    Bridge Endpoint: Assessment Agent (Orchestrator)
    Returns Scores + Archetype + Narrative Guidance
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)

        # DEBUG: Log incoming profile data
        aptitude = profile.get("aptitude", {})
        print(f"📊 [Assessment] Incoming profile for: {request.student_id}")
        print(f"   SAT Total: {aptitude.get('sat_total')}")
        print(f"   ACT Total: {aptitude.get('act_total')}")
        print(f"   GPA Weighted: {aptitude.get('gpa_weighted')}")
        print(f"   Target Schools: {profile.get('target_schools', [])}")

        # FIX: Ensure 'id' is in profile dict
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id

        # Load Orchestrator
        agent = load_ivy_agent("orch_assessment", profile)
        
        # Run Deterministic Assessment
        # We use .assess() directly to skip LLM overhead for pure math/logic
        output = agent.assess(profile)
        
        return APIResponse(success=True, data=output.model_dump())
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/narrative/synthesize")
async def synthesize_narrative(request: AssessmentSynthesisRequest):
    """
    Bridge Endpoint: Narrative Agent
    Transforms NarrativeIdentity -> Frontend JSON
    Now includes V2 Multi-Dimensional Archetype data
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)

        # FIX: Ensure 'id' is in profile dict (Required by BaseAgent)
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id

        # Load Agent
        agent = load_ivy_agent("spec_narrative", profile)

        # Run Logic
        narrative: NarrativeIdentity = agent.generate_identity()

        # V2: Get Multi-Dimensional Archetype
        from backend.tools.scoring.archetypes import detect_archetype
        archetype_result = detect_archetype(profile, {})
        multi_dim = archetype_result.multi_dimensional

        # Build V2 archetype payload
        v2_archetype = None
        if multi_dim:
            v2_archetype = {
                "composite_code": multi_dim.composite_code,
                "domain": {
                    "primary": multi_dim.domain.primary_domain.value,
                    "has_spike": multi_dim.domain.has_clear_spike,
                    "spike_description": multi_dim.domain.spike_description,
                },
                "context": {
                    "gender": multi_dim.context.gender.value,
                    "ethnicity": multi_dim.context.ethnicity.value,
                    "is_urm": multi_dim.context.is_urm,
                    "is_first_gen": multi_dim.context.is_first_gen,
                    "is_gender_minority_in_field": multi_dim.context.is_gender_minority_in_field,
                    "gender_field_advantage": multi_dim.context.gender_field_advantage,
                    "diversity_angles": multi_dim.context.diversity_angles,
                    "has_diversity_story": multi_dim.context.has_diversity_story,
                },
                "execution": {
                    "primary_style": multi_dim.execution.primary_style.value,
                    "stress_response": multi_dim.execution.stress_response,
                },
                "timeline": {
                    "position": multi_dim.timeline.position.value,
                    "grade": multi_dim.timeline.grade_level,
                    "is_urgent": multi_dim.timeline.is_urgent,
                },
                "strategy_family": multi_dim.primary_strategy_family,
            }

        # Transform for Frontend (Adapter Pattern)
        res_payload = {
            "narrative_dna": narrative.narrative_dna,
            "themes": [str(t) for t in narrative.themes],
            "confidence_score": 0.85, # Logic default
            # Legacy archetype (single string)
            "archetype": narrative.archetype_alignment or archetype_result.label or "Emerging Scholar",
            "archetype_id": archetype_result.id,
            "archetype_label": archetype_result.label,
            "archetype_confidence": archetype_result.confidence / 100.0,
            # V2 Multi-Dimensional Archetype
            "archetype_v2": v2_archetype,
            "brand_statement": narrative.brand_statement or "Emerging Scholar",
            "cri": 1.0 # Default Context Relativity Index
        }
        return APIResponse(success=True, data=res_payload)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gameplan/generate")
async def generate_gameplan(request: GamePlanRequest):
    """
    Bridge Endpoint: GamePlan Agent (Orchestrator)
    Transforms MasterGamePlan -> Frontend Deep JSON
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)
        
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id
            
        # Load Orchestrator
        agent = load_ivy_agent("orch_gameplan", profile)
        
        # Run Federation
        master_plan: MasterGamePlan = await agent.generate_master_plan(
            profile, 
            {"ivy_plus_score": 50} # Default assessment if missing
        )
        
        # Serialize with ALL nested data
        # CRITICAL: exclude_none=False ensures frontend receives nulls instead of undefined
        response_data = {
            "game_plan": master_plan.model_dump(by_alias=True, exclude_none=False)
        }
        return APIResponse(success=True, data=response_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/awards/match")
async def match_awards(request: AwardsRequest):
    """
    Bridge Endpoint: Awards Agent
    Transforms AwardsOutput -> Bucket Structure
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)
        
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id

        agent = load_ivy_agent("spec_awards", profile)
        
        # Run Planning Mode (Awards)
        output = agent.run(mode="planning", context={"profile": profile}) 
        
        # Transform to buckets if needed, but schema supports it
        res_data = output.model_dump() if hasattr(output, 'model_dump') else output
        return APIResponse(success=True, data=res_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/programs/match")
async def match_programs(request: ProgramsRequest):
    """
    Bridge Endpoint: Programs Agent
    Returns ProgramsOutput
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)
        
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id

        agent = load_ivy_agent("spec_programs", profile)
        
        # Run Planning Mode
        output = agent.run(mode="planning", context={"profile": profile})
        
        res_data = output.model_dump() if hasattr(output, 'model_dump') else output
        return APIResponse(success=True, data=res_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/opportunity/find")
async def find_opportunities(request: OpportunityRequest):
    """
    Bridge Endpoint: Opportunity Agent (Scout)
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)
        
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id

        agent = load_ivy_agent("spec_opportunity", profile)
        
        # Run Planning Mode (Scout)
        batch = agent.run(mode="planning", context={"profile": profile})
        
        # Determine if batch is dict or Object
        if isinstance(batch, dict):
            tier1 = batch.get("tier_1_matches", [])
            tier2 = batch.get("tier_2_matches", [])
        else:
            tier1 = batch.tier_1_matches
            tier2 = batch.tier_2_matches
            
        # Flatten for generic "Find" UI
        # Ensure items are dicts
        matches = []
        for item in tier1 + tier2:
            if hasattr(item, 'model_dump'):
                matches.append(item.model_dump())
            else:
                matches.append(item)
                
        return APIResponse(success=True, data={"matches": matches})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/opportunity/alerts")
async def get_opportunity_alerts(request: OpportunityRequest):
    """
    Bridge Endpoint: Opportunity Agent
    Returns deadline alerts
    """
    try:
         # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)
        
        # Real logic would use OpportunityAgent, but for now we reuse deadlines tool
        from backend.tools.supabase_tools import get_upcoming_deadlines
        
        deadlines = get_upcoming_deadlines(request.student_id, hours=720) # 30 days
        
        alerts = []
        urgent_count = 0
        
        for d in deadlines:
            urgency = "NORMAL"
            if d.get('status') == 'overdue': urgency = "URGENT"
            # Simple check, in reality we check date diff
            
            alerts.append({
                "urgency": urgency,
                "opportunity_name": d.get("title", "Unknown Task"),
                "months_remaining": 1 
            })
            if urgency == "URGENT": urgent_count += 1
            
            if urgency == "URGENT": urgent_count += 1
            
        return APIResponse(success=True, data={
            "alerts": alerts,
            "urgent_count": urgent_count
        })
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ec/simulate")
async def simulate_projects(request: SimulationRequest):
    """
    Bridge Endpoint: EC Agent (Simulation)
    Returns project options based on profile.
    """
    try:
        # Resolve Profile (Auto-Fetch)
        profile = await get_profile_context(request)
        
        if "id" not in profile and request.student_id:
            profile["id"] = request.student_id

        
        # Mock Simulation Logic for V2
        # In real V2, we might ask ECAgent for "potential_projects"
        
        spike = profile.get("passion", {}).get("spike_category", "GENERAL")
        
        options = []
        
        if spike == "LEADER":
             options = [
                 {"id": "p1", "name": "Non-Profit Founder", "category": "Service", "difficulty": "High", "predicted_boost": 15, "steps": ["Identify cause", "Recruit team", "Launch"]},
                 {"id": "p2", "name": "School Campaign", "category": "Leadership", "difficulty": "Medium", "predicted_boost": 10, "steps": ["Draft proposal", "Get signatures", "Present to board"]}
             ]
        elif spike == "RESEARCH":
             options = [
                 {"id": "p3", "name": "Independent Study", "category": "Academic", "difficulty": "High", "predicted_boost": 18, "steps": ["Find mentor", "Select topic", "Publish paper"]},
                 {"id": "p4", "name": "Data Analysis Blog", "category": "Tech", "difficulty": "Medium", "predicted_boost": 12, "steps": ["Scrape data", "Analyze trends", "Write articles"]}
             ]
        else:
             # Default
             options = [
                 {"id": "p5", "name": "Community Service Project", "category": "Service", "difficulty": "Medium", "predicted_boost": 10, "steps": ["Contact NGO", "Organize event", "Measue impact"]},
                 {"id": "p6", "name": "Passion Project", "category": "Creative", "difficulty": "Medium", "predicted_boost": 12, "steps": ["Brainstorm ideas", "Create prototype", "Launch"]}
             ]
             
        return {
            "options": options,
            "recommended_option_id": options[0]["id"] if options else ""
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/time-audit")
async def run_time_audit(request: Dict[str, Any]):
    """
    Bridge Endpoint: Time Audit (168-Hour Framework)
    """
    try:
        # Mocking the 168-hour logic for now as requested for the card
        # In a real scenario, this would call a specialist agent or logic tool.
        sleep = float(request.get("sleep_hours", 56))
        school = float(request.get("school_hours", 35))
        fixed = float(request.get("fixed_commitments", 20))
        social = float(request.get("social_media_hours", 14))
        
        total = 168
        allocated = sleep + school + fixed + social
        available = total - allocated
        recovered = social * 0.5 # Assume we can recover 50% of social media
        
        return APIResponse(success=True, data={
            "audit": {
                "total_hours": total,
                "passion_hours_available": available,
                "daily_passion_hours": available / 7,
                "social_media": {
                    "current_weekly": social,
                    "target_weekly": social * 0.5,
                    "hours_recovered": recovered
                }
            },
            "efficiency_hacks": [
                {"hack": "Batch Notifications", "description": "Reduce social media check frequency to 3x daily."},
                {"hack": "Study Blocks", "description": "Use 50/10 Pomodoro cycles to increase focus."}
            ]
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from backend.tools.supabase_tools import get_upcoming_deadlines, get_stalled_projects

@router.post("/execution/debt-score")
async def calculate_debt_score(request: ExecutionRequest):
    """
    Bridge Endpoint: Execution Agent (Utility)
    Calculates EDS from task list.
    """
    try:
        tasks_to_score = request.tasks
        
        # Auto-fetch Tasks if missing
        if not tasks_to_score and request.student_id:
            tasks_to_score = []
            # 1. Get imminent/overdue tasks
            deadlines = get_upcoming_deadlines(request.student_id, hours=168) # 7 days
            for t in deadlines:
                 # Mapper: Check if overdue
                 is_overdue = False # Logic to check date vs now if needed, or rely on status
                 # EDSCalculator checks for status='overdue'
                 # We can simple assume if it's returned by "upcoming deadlines" it counts towards load
                 # But to trigger "overdue" score, we must set status='overdue'
                 # Let's check the task object structure
                 if t.get('status') == 'overdue': 
                     is_overdue = True
                 
                 tasks_to_score.append(t)
            
            # 2. Get stalled projects
            stalled = get_stalled_projects(request.student_id, days=7)
            for p in stalled:
                tasks_to_score.append({
                    "id": p.get('id'),
                    "days_inactive": 10, # Mock > 7 to trigger logic
                    "status": "stalled"
                })
        
        if tasks_to_score is None:
             tasks_to_score = []

        calc = EDSCalculator()
        score = calc.calculate_distress(tasks_to_score)
        
        human_status = "Healthy"
        if score > 70: human_status = "Critical"
        elif score > 30: human_status = "At Risk"
        
        res_payload = {
            "execution_debt_score": score,
            "status": human_status,
            "factors": ["Volume", "Complexity"],
            "trend": "stable"
        }
        return APIResponse(success=True, data=res_payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
