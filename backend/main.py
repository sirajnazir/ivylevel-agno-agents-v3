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

# Load environment variables
load_dotenv()

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
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
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
