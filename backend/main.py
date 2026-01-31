# IMPLEMENTS: FastAPI Application Entry Point (PRD v3.0)
"""
IvyLevel v3.0 - The Execution Engine

Main FastAPI application with the Plug-and-Play Agent Architecture.

THE 7 LAWS OF ENGINEERING:
1. Scalability Law: Use registry.load_agent(), never instantiate Agent() directly
2. Tier Discipline: Orchestrators -> Specialists -> Primitives -> Intelligence
3. Real Data Sovereignty: No faker data, use golden truth
4. Agnostic Intelligence: Retrieve logic from Vector DB
5. Type Safety: All outputs are Pydantic models
6. Golden Thread: models.py -> schema.sql -> docs/DATABASE.md
7. The Formula: Success = IQ * EQ * CQ * Data
"""

import os
from contextlib import asynccontextmanager
from typing import Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables (force override to ignore stale shell vars)
load_dotenv(override=True)

# =============================================================================
# APP CONFIGURATION
# =============================================================================

APP_NAME = os.getenv("APP_NAME", "IvyLevel")
APP_VERSION = os.getenv("APP_VERSION", "3.0.0")
API_DEBUG = os.getenv("API_DEBUG", "false").lower() == "true"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# =============================================================================
# LIFESPAN (Startup/Shutdown)
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initialize connections on startup, cleanup on shutdown.
    """
    # Startup
    print(f"🚀 Starting {APP_NAME} v{APP_VERSION}")
    print(f"📡 CORS enabled for: {FRONTEND_URL}")
    
    # Initialize Supabase connection (lazy, but warm it up)
    from backend.tools.supabase_tools import get_supabase_client
    client = get_supabase_client()
    if client:
        print("✅ Supabase connection established")
    else:
        print("⚠️ Supabase connection not available (check credentials)")
    
    yield
    
    # Shutdown
    print(f"👋 Shutting down {APP_NAME}")


# =============================================================================
# APP INSTANCE
# =============================================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="The IvyLevel Execution Engine - Plug-and-Play Agent Architecture",
    lifespan=lifespan,
    debug=API_DEBUG
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class AgentRequest(BaseModel):
    """Request to invoke an agent."""
    agent_key: str
    student_id: str
    message: str
    context: Dict[str, Any] = {}


class AgentResponse(BaseModel):
    """Response from an agent."""
    agent_key: str
    student_id: str
    response: str
    metadata: Dict[str, Any] = {}


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    agents_available: int


# =============================================================================
# ROUTES
# =============================================================================

from backend.api.routers import agents_bridge
from backend.api.routes import profiles

app.include_router(agents_bridge.router)
app.include_router(profiles.router)

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint."""
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "architecture": "Plug-and-Play Agent System",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    from backend.agents.registry import AGENT_MAP
    
    return HealthResponse(
        status="healthy",
        version=APP_VERSION,
        agents_available=len(AGENT_MAP)
    )


@app.get("/agents", response_model=Dict[str, Any])
async def list_agents():
    """
    List all available agents in the registry.
    """
    from backend.agents.registry import AGENT_MAP, get_agents_by_tier
    
    return {
        "total": len(AGENT_MAP),
        "agents": list(AGENT_MAP.keys()),
        "by_tier": {
            "orchestrators": list(get_agents_by_tier(1).keys()),
            "specialists": list(get_agents_by_tier(2).keys()),
            "primitives": list(get_agents_by_tier(3).keys()),
            "intelligence": list(get_agents_by_tier(4).keys()),
        }
    }


@app.post("/agent/invoke", response_model=AgentResponse)
async def invoke_agent(request: AgentRequest):
    """
    Invoke an agent using the Plug-and-Play registry.
    
    THE SCALABILITY LAW IN ACTION:
    - We NEVER instantiate Agent() directly
    - We ALWAYS use registry.load_agent()
    """
    from backend.agents.registry import load_agent, AGENT_MAP
    from backend.tools.supabase_tools import read_student_profile
    
    # Validate agent exists
    if request.agent_key not in AGENT_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Agent '{request.agent_key}' not found. Available: {list(AGENT_MAP.keys())}"
        )
    
    # Get student profile
    profile = read_student_profile(request.student_id)
    if not profile:
        # Create minimal profile for new students
        profile = {
            "id": request.student_id,
            "archetype": "Unknown",
            **request.context
        }
    
    try:
        # THE PLUG-AND-PLAY PATTERN
        agent = load_agent(request.agent_key, profile)
        
        # Run the agent
        response = agent.run(request.message)
        
        return AgentResponse(
            agent_key=request.agent_key,
            student_id=request.student_id,
            response=str(response.content) if response else "No response",
            metadata={
                "agent_name": agent.name,
                "model": str(agent.model),
            }
        )
    except ImportError as e:
        raise HTTPException(
            status_code=501,
            detail=f"Agent '{request.agent_key}' not implemented yet: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}"
        )



# =============================================================================
# FORENSIC DEMO ROUTES (v1)
# =============================================================================

@app.post("/api/agent/v1/assessment", response_model=Dict[str, Any])
async def run_assessment(request: Dict[str, Any]):
    """
    Direct Assessment Endpoint for Simulator.
    Input: { "student_profile": {...} }
    Output: { "ivy_score": 34.0, ... }
    """
    from backend.agents.orchestrators.assessment import AssessmentAgent
    from backend.tools.scoring.engine import IvyScoreEngine
    from backend.tools.scoring.archetypes import detect_archetype
    
    profile = request.get("student_profile")
    if not profile:
        raise HTTPException(status_code=400, detail="Missing student_profile")
        
    # 1. Run Scoring Engine (Mirror Law) - Direct calculation for speed/accuracy
    engine = IvyScoreEngine()
    score_result = engine.calculate(profile)
    
    # 2. Detect Archetype
    category_scores = {
        "aptitude": score_result.category_scores.aptitude,
        "passion": score_result.category_scores.passion,
        "community": score_result.category_scores.community,
        "narrative": score_result.category_scores.narrative,
    }
    archetype = detect_archetype(profile, category_scores)
    
    # Return combined data
    return {
        "ivy_score": score_result.ivy_plus_score,
        "percentile": score_result.percentile_rank,
        "category_scores": category_scores,
        "archetype": archetype.label,
        "archetype_id": archetype.id,
        "breakdown": category_scores
    }


@app.post("/api/agent/v1/ec/simulate", response_model=Dict[str, Any])
async def simulate_ec(request: Dict[str, Any]):
    """
    Direct EC Simulator Endpoint.
    Input: { "student_profile": {...}, "assessment": {...} }
    Output: { "options": [...], ... }
    """
    from backend.agents.specialists.ec import ECAgent
    
    profile = request.get("student_profile")
    assessment = request.get("assessment")
    
    if not profile or not assessment:
        raise HTTPException(status_code=400, detail="Missing profile or assessment data")
    
    # Initialize Agent
    agent = ECAgent(profile.get("id", "guest"))
    
    # Run Simulation
    result = agent.run(profile, assessment)
    
    return result



# =============================================================================
# NARRATIVE AGENT ROUTE (v2 Compatible)
# =============================================================================

@app.post("/agents/narrative/synthesize", response_model=Dict[str, Any])
async def synthesize_narrative(request: Dict[str, Any]):
    """
    Narrative Synthesis Endpoint (Agent v2 Protocol).
    """
    from backend.tools.scoring.engine import IvyScoreEngine
    from backend.tools.scoring.archetypes import generate_narrative_guidance
    
    # Extract profile from nested contract or direct
    profile = None
    if "assessment_contract" in request:
        profile = request["assessment_contract"].get("profile_data")
    if not profile:
        profile = request.get("student_profile")
    
    if not profile:
        # Fallback: Try to read profile from DB if only ID provided?
        # For strict agent protocol, we often require context.
        # But let's fail gracefully if missing.
        raise HTTPException(status_code=400, detail="Missing profile data in request")

    # 1. Calculate Scores (needed for archetype detection)
    engine = IvyScoreEngine()
    score_result = engine.calculate(profile)
    
    category_scores = {
        "aptitude": score_result.category_scores.aptitude,
        "passion": score_result.category_scores.passion,
        "community": score_result.category_scores.community,
        "narrative": score_result.category_scores.narrative,
    }
    
    # 2. Generate Guidance (Deterministic Base)
    guidance = generate_narrative_guidance(profile, category_scores)
    archetype = guidance["archetype"]
    
    # 3. Enhance with GenAI (Narrative Agent)
    from backend.agents.registry import load_ivy_agent
    
    # Inject detected archetype AND profile_id into profile context (Required by Base Agent)
    # The request likely has "profile_id" at root level
    profile_id = request.get("profile_id") or profile.get("id") or "guest-user"
    profile_with_context = {**profile, "archetype": archetype.label, "id": profile_id}
    
    try:
        # Load the specialist agent (Tier 2)
        # Note: We use load_ivy_agent to get the class wrapper, then call run_synthesis()
        # which handles the Agno build() internally.
        agent_wrapper = load_ivy_agent("spec_narrative", profile_with_context)
        
        # The agent_wrapper is instance of NarrativeAgent
        narrative_data = agent_wrapper.run_synthesis()
        
        # Robust parsing (Agno+OpenAI can return Markdown blocks)
        if isinstance(narrative_data, str):
            # 1. Clean Markdown Fences
            cleaned_data = narrative_data.strip()
            if cleaned_data.startswith("```json"):
                cleaned_data = cleaned_data[7:]
            if cleaned_data.startswith("```"):
                cleaned_data = cleaned_data[3:]
            if cleaned_data.endswith("```"):
                cleaned_data = cleaned_data[:-3]
            cleaned_data = cleaned_data.strip()

            # 2. Parse JSON
            import json
            try:
                data_dict = json.loads(cleaned_data)
                
                # 3. Flexible Extraction (Handle Schema Drift & Casing)
                brand_statement = data_dict.get("brand_statement") or data_dict.get("Brand Statement")
                
                # Check for nested strategy object
                ns = data_dict.get("narrative_strategy", {}) or data_dict.get("Narrative Strategy", {})
                
                narrative_dna = data_dict.get("narrative_dna") or ns.get("archetype") or archetype.label
                first_principle = data_dict.get("first_principle") or data_dict.get("core_principle")
                themes = data_dict.get("themes") or ns.get("Themes")
                identity_seeds = data_dict.get("identity_seeds")
                description = data_dict.get("archetype_description") or ns.get("unique_positioning") or ns.get("Introduction")

                # If themes missing, try to extract from narrative_elements keys
                if not themes and "narrative_elements" in ns:
                    themes = list(ns["narrative_elements"].keys())
                    # Use first theme as principle if missing
                    if not first_principle and themes:
                        first_principle = themes[0]

                # Fallbacks if still missing
                if not themes: themes = []
                if not identity_seeds: identity_seeds = []
                if not description: description = ""

            except Exception as parse_err:
                 print(f"DEBUG: JSON parse failed: {parse_err}")
                 # Last resort: use raw text as description? No, fallback to deterministic.
                 raise ValueError("Returned string was not valid JSON")
        else:
            # Assume object
            brand_statement = narrative_data.brand_statement
            narrative_dna = narrative_data.narrative_dna
            first_principle = narrative_data.first_principle
            themes = narrative_data.themes
            identity_seeds = narrative_data.identity_seeds
            description = narrative_data.archetype_description
        
    except Exception as e:
        print(f"⚠️ Narrative Agent failed (falling back to deterministic): {e}")
        # Fallback to deterministic if AI fails
        formula = guidance["primary_formula"]
        from backend.tools.scoring.archetypes import get_archetype_by_id
        arch_def = get_archetype_by_id(archetype.id)
        
        brand_statement = archetype.tagline
        narrative_dna = formula.narrative_arc if formula else "hero_journey"
        first_principle = formula.key_themes[0] if formula and formula.key_themes else "Growth"
        themes = formula.key_themes if formula else []
        identity_seeds = formula.exemplar_openers if formula else []
        description = arch_def["description"] if arch_def else ""

    # 4. Construct Response
    response_data = {
        "success": True,
        "brand_statement": brand_statement,
        "narrative_dna": narrative_dna,
        "first_principle": first_principle,
        "themes": themes,
        "identity_seeds": identity_seeds,
        "archetype": archetype.label,
        "archetype_description": description,
        "confidence": archetype.confidence / 100.0,
        # Return structured object for frontend reuse (e.g. Dashboard)
        "identity_synthesis": {
             "archetype": archetype.label,
             "spike": profile.get("passion", {}).get("spike_category", ""),
             "brand_statement": brand_statement,
             "pillars": themes or []
        }
    }

    # 5. PERSISTENCE LAYER (Fix for "Empty Profile" issue)
    # Save the generated narrative back to the DB so Dashboard can load it later
    try:
        from backend.tools.supabase_tools import update_student_profile
        
        # Determine strict profile_id (must match DB UUID)
        target_id = profile_id if profile_id and profile_id != "guest-user" and len(profile_id) > 10 else None
        
        if target_id:
            print(f"💾 Persisting Narrative for {target_id}...")
            # We map to V2 Identity Synthesis
            # 1. Construct Identity Synthesis (Core)
            synthesis_data = {
                "archetype": {
                    "id": archetype.id, 
                    "name": archetype.label, 
                    "confidence": archetype.confidence / 100.0,
                    "description": description
                },
                "spike": profile.get("passion", {}).get("spike_category", ""),
                "brand_statement": brand_statement,
                "confidence": archetype.confidence / 100.0,
                "_source": "narrative_agent_v1_legacy",
                # Storing legacy list fields for backward compat within JSONB
                "narrative_dna": narrative_dna,
                "first_principle": first_principle,
                "themes": themes,
                "identity_seeds": identity_seeds
            }

            update_payload = {
                "identity_synthesis": synthesis_data
            }
            update_student_profile(target_id, update_payload)
            print("✅ Narrative saved to DB (V2 Schema)")
    except Exception as save_err:
        print(f"⚠️ Failed to persist narrative: {save_err}")

    return response_data


# =============================================================================
# RUN (for development)
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=API_DEBUG
    )
