# IMPLEMENTS: Database Integration Layer (PRD v3.0)
# LINKED TO: DB-001 through DB-004
"""
Supabase Tools - Custom Agno tools for database operations.

Provides:
- SupabaseReader: Query profiles, patterns, knowledge
- SupabaseWriter: Update profiles, store memories
- VectorSearch: Semantic search across knowledge base
"""

import os
import json
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

load_dotenv()


# =============================================================================
# SUPABASE CLIENT
# =============================================================================

_supabase_client = None


def get_supabase_client():
    """
    Lazy initialization of Supabase client.
    """
    global _supabase_client
    if _supabase_client is None:
        try:
            from supabase import create_client
            
            url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if url and key:
                _supabase_client = create_client(url, key)
        except ImportError:
            pass
    return _supabase_client


# =============================================================================
# TOOL FUNCTIONS (Raw Database Access)
# =============================================================================

def read_student_profile(student_id: str) -> Optional[Dict[str, Any]]:
    """
    Read a student's profile from the database.

    IMPLEMENTS: Part of DB-001 access

    Lookup Strategy (handles both old and new ID formats):
    1. First try lookup by profile `id` (new format)
    2. Fallback to lookup by `user_id` (auth user ID, what frontend often sends)

    Args:
        student_id: UUID - could be profile id OR user_id from auth

    Returns:
        Student profile dict or None if not found
    """
    client = get_supabase_client()
    if client is None:
        return None

    # Strategy 1: Try lookup by profile `id`
    try:
        response = client.table("profiles").select("*").eq("id", student_id).maybe_single().execute()
        if response and response.data:
            return response.data
    except Exception:
        pass  # Silent fail, will try user_id next

    # Strategy 2: Fallback to lookup by `user_id` (common from frontend)
    try:
        response = client.table("profiles").select("*").eq("user_id", student_id).maybe_single().execute()
        if response.data:
            print(f"✅ Profile found via user_id fallback for {student_id}")
            return response.data
    except Exception as e:
        print(f"Profile lookup by user_id also failed: {e}")

    print(f"❌ No profile found for id/user_id: {student_id}")
    return None


def update_student_profile(student_id: str, updates: Dict[str, Any]) -> bool:
    """
    Update a student's profile in the database.

    IMPLEMENTS: Part of DB-001 access

    Lookup Strategy (handles both id and user_id):
    1. First try update by profile `id`
    2. Fallback to update by `user_id`

    Args:
        student_id: UUID - could be profile id OR user_id from auth
        updates: Dict of fields to update

    Returns:
        True if successful, False otherwise
    """
    client = get_supabase_client()
    if client is None:
        return False

    # Strategy 1: Try update by profile `id`
    try:
        result = client.table("profiles").update(updates).eq("id", student_id).execute()
        if result.data:
            return True
    except Exception:
        pass

    # Strategy 2: Fallback to update by `user_id`
    try:
        result = client.table("profiles").update(updates).eq("user_id", student_id).execute()
        if result.data:
            print(f"✅ Profile updated via user_id fallback for {student_id}")
            return True
    except Exception as e:
        print(f"Error updating profile: {e}")

    return False


def delete_student_data(student_id: str) -> bool:
    """
    Delete all data for a student.

    Lookup Strategy: Try both `id` and `user_id` for deletion.

    Args:
        student_id: UUID - could be profile id OR user_id from auth

    Returns:
        True if successful, False otherwise
    """
    client = get_supabase_client()
    if client is None:
        return False

    # Strategy 1: Try delete by profile `id`
    try:
        result = client.table("profiles").delete().eq("id", student_id).execute()
        if result.data:
            return True
    except Exception:
        pass

    # Strategy 2: Fallback to delete by `user_id`
    try:
        result = client.table("profiles").delete().eq("user_id", student_id).execute()
        if result.data:
            print(f"✅ Profile deleted via user_id fallback for {student_id}")
            return True
    except Exception as e:
        print(f"Error deleting user data: {e}")

    return False


def read_student_patterns(student_id: str) -> List[Dict[str, Any]]:
    """
    Read all behavioral patterns for a student.
    
    IMPLEMENTS: DB-003 access
    
    Args:
        student_id: UUID of the student
        
    Returns:
        List of pattern dicts
    """
    client = get_supabase_client()
    if client is None:
        return []
    
    try:
        response = client.table("student_patterns").select("*").eq("student_id", student_id).execute()
        return response.data or []
    except Exception as e:
        print(f"Error reading patterns: {e}")
        return []


def store_student_pattern(
    student_id: str,
    key: str,
    value: str,
    confidence: float = 0.5,
    learned_from: str = "agent_inference"
) -> bool:
    """
    Store or update a behavioral pattern for a student.
    
    IMPLEMENTS: DB-003 write
    
    Args:
        student_id: UUID of the student
        key: Pattern key (e.g., "communication_preference")
        value: Pattern value (e.g., "text_only")
        confidence: Confidence score 0-1
        learned_from: Source of the pattern
        
    Returns:
        True if successful, False otherwise
    """
    client = get_supabase_client()
    if client is None:
        return False
    
    try:
        client.table("student_patterns").upsert({
            "student_id": student_id,
            "key": key,
            "value": value,
            "confidence": confidence,
            "learned_from": learned_from
        }, on_conflict="student_id,key").execute()
        return True
    except Exception as e:
        print(f"Error storing pattern: {e}")
        return False


def search_student_knowledge(
    student_id: str,
    query: str,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Semantic search across student's knowledge base.
    
    IMPLEMENTS: DB-002 search
    """
    from backend.memory import search_knowledge
    return search_knowledge(student_id, query, limit)


def store_student_knowledge(
    student_id: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Store knowledge in the student's knowledge base.
    
    IMPLEMENTS: DB-002 write
    """
    from backend.memory import store_knowledge
    return store_knowledge(student_id, content, metadata)


# =============================================================================
# AGNO TOOL CLASSES (For Agent Injection)
# =============================================================================

class SupabaseReader:
    """
    Read-only Supabase tool for agents.
    Provides safe read access to profile and patterns.
    """
    
    def __init__(self):
        self.name = "supabase_reader"
        self.description = "Read student profile and patterns from database"
    
    def get_profile(self, student_id: str) -> str:
        """Get a student's profile as JSON."""
        profile = read_student_profile(student_id)
        if profile:
            return json.dumps(profile, default=str)
        return "Profile not found"
    
    def get_patterns(self, student_id: str) -> str:
        """Get a student's behavioral patterns as JSON."""
        patterns = read_student_patterns(student_id)
        return json.dumps(patterns, default=str)


class SupabaseWriter:
    """
    Write-enabled Supabase tool for agents.
    Use with caution - only for agents that need write access.
    """
    
    def __init__(self):
        self.name = "supabase_writer"
        self.description = "Write to student profile and patterns in database"
    
    def update_profile(self, student_id: str, updates: Dict[str, Any]) -> str:
        """Update a student's profile."""
        success = update_student_profile(student_id, updates)
        return "Profile updated" if success else "Update failed"
    
    def log_pattern(
        self,
        student_id: str,
        key: str,
        value: str,
        confidence: float
    ) -> str:
        """Log a behavioral pattern."""
        success = store_student_pattern(student_id, key, value, confidence)
        return "Pattern logged" if success else "Pattern logging failed"


# =============================================================================
# AGNO TOOLS (Decorated functions for tool injection)
# =============================================================================

def get_supabase_tools() -> List:
    """
    Returns a list of Agno-compatible tools for database operations.
    
    These tools are injected into agents for database access.
    """
    try:
        from agno.tools import tool
        
        @tool
        def get_student_profile(student_id: str) -> str:
            """
            Retrieve a student's complete profile including archetype, IvyScore, and narrative DNA.
            Use this to understand the student's background before responding.
            
            Args:
                student_id: The unique identifier of the student
                
            Returns:
                JSON string of the student's profile
            """
            profile = read_student_profile(student_id)
            if profile:
                return json.dumps(profile, default=str)
            return "Profile not found"
        
        @tool
        def get_student_behavioral_patterns(student_id: str) -> str:
            """
            Get behavioral patterns learned about the student over time.
            Use this to understand communication preferences and past behaviors.
            
            Args:
                student_id: The unique identifier of the student
                
            Returns:
                JSON string of behavioral patterns
            """
            patterns = read_student_patterns(student_id)
            return json.dumps(patterns, default=str)
        
        @tool
        def search_student_memory(student_id: str, query: str) -> str:
            """
            Search the student's knowledge base for relevant past conversations and information.
            Use this before answering questions to provide context-aware responses.
            
            Args:
                student_id: The unique identifier of the student
                query: The search query
                
            Returns:
                JSON string of matching knowledge chunks
            """
            results = search_student_knowledge(student_id, query)
            return json.dumps(results, default=str)
        
        @tool
        def log_behavioral_pattern(
            student_id: str,
            pattern_key: str,
            pattern_value: str,
            confidence: float
        ) -> str:
            """
            Log a behavioral pattern learned about the student.
            Use this when you notice consistent behaviors or preferences.
            
            Args:
                student_id: The unique identifier of the student
                pattern_key: The type of pattern (e.g., "communication_preference")
                pattern_value: The observed value (e.g., "prefers_bullet_points")
                confidence: How confident you are (0.0 to 1.0)
                
            Returns:
                Success or failure message
            """
            success = store_student_pattern(
                student_id, pattern_key, pattern_value, confidence, "agent_observation"
            )
            return "Pattern logged successfully" if success else "Failed to log pattern"
        
        return [
            get_student_profile,
            get_student_behavioral_patterns,
            search_student_memory,
            log_behavioral_pattern
        ]
        
    except ImportError:
        return []


# =============================================================================
# PROACTIVE QUERIES (PRD 3.2)
# =============================================================================

def get_upcoming_deadlines(student_id: str, hours: int = 72) -> List[Dict[str, Any]]:
    """
    Get tasks with deadlines within the specified hours.
    
    IMPLEMENTS: Part of FR-012 (Proactive System - Deadline Alert)
    """
    client = get_supabase_client()
    if client is None:
        return []
    
    try:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() + timedelta(hours=hours)
        
        response = client.table("tasks")\
            .select("*")\
            .eq("student_id", student_id)\
            .lt("due_date", cutoff.isoformat())\
            .eq("status", "pending")\
            .execute()
        
        return response.data or []
    except Exception as e:
        print(f"Error getting deadlines: {e}")
        return []


def get_stalled_projects(student_id: str, days: int = 5) -> List[Dict[str, Any]]:
    """
    Get projects with no activity in the specified days.
    
    IMPLEMENTS: Part of FR-012 (Proactive System - Stall Detection)
    """
    client = get_supabase_client()
    if client is None:
        return []
    
    try:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        response = client.table("projects")\
            .select("*")\
            .eq("student_id", student_id)\
            .lt("last_activity", cutoff.isoformat())\
            .neq("status", "completed")\
            .execute()
        
        return response.data or []
    except Exception as e:
        print(f"Error getting stalled projects: {e}")
        return []
