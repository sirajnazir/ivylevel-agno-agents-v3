# IMPLEMENTS: Shared Memory Architecture (PRD v3.0 - The Hippocampus)
# LINKED TO: DB-002 (student_knowledge), DB-004 (agent_sessions)
"""
The Hippocampus - Centralized memory configuration for all agents.

This module provides:
1. Vector DB Connection (Long-Term Semantic Memory)
2. Session Storage (Chat History)
3. Student-isolated memory retrieval

All agents access the shared brain through get_agent_memory().
"""

import os
from typing import Optional, Dict, Any, List

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =============================================================================
# CONFIGURATION
# =============================================================================

DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Vector configuration
VECTOR_COLLECTION = os.getenv("VECTOR_COLLECTION", "student_knowledge")
VECTOR_DIMENSIONS = int(os.getenv("VECTOR_DIMENSIONS", "1536"))


# =============================================================================
# LAZY IMPORTS (Only load Agno when needed)
# =============================================================================

_vector_db = None
_storage = None


def _get_vector_db():
    """
    Lazy initialization of vector database connection.
    Uses PgVector2 for semantic search across student knowledge.
    """
    global _vector_db
    if _vector_db is None:
        try:
            from agno.vectordb.pgvector import PgVector2
            from agno.embedder.openai import OpenAIEmbedder
            
            _vector_db = PgVector2(
                db_url=DATABASE_URL,
                collection=VECTOR_COLLECTION,
                embedder=OpenAIEmbedder(
                    api_key=OPENAI_API_KEY,
                    model="text-embedding-ada-002",
                    dimensions=VECTOR_DIMENSIONS
                )
            )
        except ImportError:
            # Fallback for testing without Agno installed
            _vector_db = None
    return _vector_db


def _get_storage():
    """
    Lazy initialization of session storage.
    Uses PostgresAgentStorage for chat history persistence.
    """
    global _storage
    if _storage is None:
        try:
            from agno.storage.agent.postgres import PostgresAgentStorage
            
            _storage = PostgresAgentStorage(
                table_name="agent_sessions",
                db_url=DATABASE_URL
            )
        except ImportError:
            # Fallback for testing without Agno installed
            _storage = None
    return _storage


# =============================================================================
# PUBLIC API
# =============================================================================

def get_agent_memory(student_id: str) -> Dict[str, Any]:
    """
    Returns the memory configuration for ANY agent to access the shared brain.
    
    The memory is isolated by student_id to ensure data privacy.
    
    Args:
        student_id: UUID of the student
        
    Returns:
        Dict containing knowledge_base and storage configurations
        
    Example:
        >>> jenny = Agent(
        ...     name="Jenny",
        ...     **get_agent_memory(student_id)
        ... )
    """
    vector_db = _get_vector_db()
    storage = _get_storage()
    
    memory_config = {}
    
    # Semantic Search (RAG) - with student isolation
    if vector_db is not None:
        try:
            from agno.knowledge.agent import AgentKnowledge
            
            memory_config["knowledge_base"] = AgentKnowledge(
                vector_db=vector_db,
                # Critical: Isolate memory by Student ID
                filter={"student_id": student_id}
            )
        except ImportError:
            pass
    
    # Session Storage (Chat History)
    if storage is not None:
        memory_config["storage"] = storage
    
    return memory_config


def store_knowledge(
    student_id: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Store a piece of knowledge in the student's memory.
    
    Args:
        student_id: UUID of the student
        content: Text content to store and embed
        metadata: Additional metadata (agent, topic, etc.)
        
    Returns:
        True if successful, False otherwise
    """
    vector_db = _get_vector_db()
    if vector_db is None:
        return False
    
    # Build metadata with student isolation
    full_metadata = {"student_id": student_id}
    if metadata:
        full_metadata.update(metadata)
    
    try:
        vector_db.insert(
            content=content,
            metadata=full_metadata
        )
        return True
    except Exception as e:
        print(f"Error storing knowledge: {e}")
        return False


def search_knowledge(
    student_id: str,
    query: str,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Search the student's knowledge base for relevant information.
    
    Args:
        student_id: UUID of the student
        query: Search query
        limit: Maximum number of results
        
    Returns:
        List of matching knowledge chunks
    """
    vector_db = _get_vector_db()
    if vector_db is None:
        return []
    
    try:
        results = vector_db.search(
            query=query,
            filter={"student_id": student_id},
            limit=limit
        )
        return results
    except Exception as e:
        print(f"Error searching knowledge: {e}")
        return []


# =============================================================================
# CONTEXT LAYERS (PRD v3.0 - The 4 CQ Layers)
# =============================================================================

class ContextLayers:
    """
    The 4 Context Layers that power CQ (Context Quotient).
    
    1. Foundational: Static data (name, grade, school)
    2. Profile: Assessment results (archetype, ivy_score, narrative_dna)
    3. Behavioral: Patterns learned over time (communication_preference)
    4. Dynamic: Real-time context (current_task, mood)
    """
    
    FOUNDATIONAL = "foundational"
    PROFILE = "profile"
    BEHAVIORAL = "behavioral"
    DYNAMIC = "dynamic"


def get_student_context(student_id: str, layers: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Retrieve context from specified layers for a student.
    
    Args:
        student_id: UUID of the student
        layers: List of context layers to retrieve (default: all)
        
    Returns:
        Dict with context data from each layer
    """
    if layers is None:
        layers = [
            ContextLayers.FOUNDATIONAL,
            ContextLayers.PROFILE,
            ContextLayers.BEHAVIORAL,
            ContextLayers.DYNAMIC
        ]
    
    context = {}
    
    # TODO: Implement Supabase queries for each layer
    # This will be connected to the actual database tables
    
    for layer in layers:
        context[layer] = {}
    
    return context
