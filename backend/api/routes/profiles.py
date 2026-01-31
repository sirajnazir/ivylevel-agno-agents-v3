"""
Profile API Routes - V2
Handles profile CRUD with new schema.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from backend.agents.schemas.profile_v2 import ProfileV2, ProfileUpdate
from backend.tools.supabase_tools import get_supabase_client

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


@router.get("/{user_id}", response_model=ProfileV2)
async def get_profile(user_id: str):
    """Get profile by user_id."""
    supabase = get_supabase_client()

    result = supabase.table("profiles").select("*").eq("user_id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data


@router.post("/", response_model=ProfileV2)
async def create_profile(user_id: str, first_name: str):
    """Create new profile."""
    supabase = get_supabase_client()

    data = {
        "user_id": user_id,
        "first_name": first_name,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = supabase.table("profiles").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create profile")

    return result.data[0]


@router.patch("/{user_id}", response_model=ProfileV2)
async def update_profile(user_id: str, updates: ProfileUpdate):
    """
    Update profile fields.
    Only non-None fields in updates will be applied.
    """
    supabase = get_supabase_client()

    # Filter out None values
    update_data = {k: v for k, v in updates.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Handle JSONB fields that need special serialization
    jsonb_fields = [
        'target_schools', 'identity_synthesis', 'activities',
        'awards', 'programs', 'courses', 'interests', 'values',
        'goals', 'four_pillars', 'agent_outputs'
    ]

    for field in jsonb_fields:
        if field in update_data and update_data[field] is not None:
            if hasattr(update_data[field], 'dict'):
                update_data[field] = update_data[field].dict()

    result = supabase.table("profiles").update(update_data).eq("user_id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data[0]


@router.post("/{user_id}/save-assessment")
async def save_assessment_data(user_id: str, frame_data: dict):
    """
    Save assessment frame data to profile.
    Maps frame outputs to correct profile fields.
    """
    supabase = get_supabase_client()

    # Map frame data to profile fields
    profile_updates = {}

    # Basic info
    if "firstName" in frame_data:
        profile_updates["first_name"] = frame_data["firstName"]
    if "lastName" in frame_data:
        profile_updates["last_name"] = frame_data["lastName"]
    if "grade" in frame_data:
        profile_updates["grade"] = int(frame_data["grade"])
    if "graduationYear" in frame_data:
        profile_updates["graduation_year"] = int(frame_data["graduationYear"])

    # School info
    if "schoolName" in frame_data:
        profile_updates["school_name"] = frame_data["schoolName"]
    if "schoolType" in frame_data:
        profile_updates["school_type"] = frame_data["schoolType"]
    if "state" in frame_data:
        profile_updates["location_state"] = frame_data["state"]

    # Academic
    if "gpa" in frame_data:
        profile_updates["gpa"] = float(frame_data["gpa"])
    if "satScore" in frame_data:
        profile_updates["sat_score"] = int(frame_data["satScore"])
    if "actScore" in frame_data:
        profile_updates["act_score"] = int(frame_data["actScore"])
    if "classRank" in frame_data:
        profile_updates["class_rank"] = int(frame_data["classRank"])
    if "classSize" in frame_data:
        profile_updates["class_size"] = int(frame_data["classSize"])

    # Target schools (JSONB)
    if "targetSchools" in frame_data:
        profile_updates["target_schools"] = frame_data["targetSchools"]

    # Target majors (array)
    if "targetMajors" in frame_data:
        profile_updates["target_majors"] = frame_data["targetMajors"]

    # Interests (JSONB array)
    if "interests" in frame_data:
        profile_updates["interests"] = frame_data["interests"]

    # Values (JSONB array)
    if "values" in frame_data:
        profile_updates["values"] = frame_data["values"]

    # Activities (JSONB array)
    if "activities" in frame_data:
        profile_updates["activities"] = frame_data["activities"]

    # Awards (JSONB array)
    if "awards" in frame_data:
        profile_updates["awards"] = frame_data["awards"]

    # Programs (JSONB array)
    if "programs" in frame_data:
        profile_updates["programs"] = frame_data["programs"]

    # Goals (JSONB)
    if "goals" in frame_data:
        profile_updates["goals"] = frame_data["goals"]

    # Identity synthesis (JSONB) - computed after assessment
    if "identitySynthesis" in frame_data:
        profile_updates["identity_synthesis"] = frame_data["identitySynthesis"]

    # Four pillars (JSONB) - computed after assessment
    if "fourPillars" in frame_data:
        profile_updates["four_pillars"] = frame_data["fourPillars"]

    # Computed scores
    if "ivyScore" in frame_data:
        profile_updates["ivy_score"] = float(frame_data["ivyScore"])

    # Mark assessment complete if all frames done
    if frame_data.get("assessmentComplete"):
        profile_updates["assessment_completed_at"] = datetime.utcnow().isoformat()
        profile_updates["onboarding_completed"] = True

    # Upsert profile
    result = supabase.table("profiles").upsert({
        "user_id": user_id,
        **profile_updates
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to save assessment data")

    return {"success": True, "profile": result.data[0]}


@router.post("/{user_id}/agent-output/{agent_name}")
async def save_agent_output(user_id: str, agent_name: str, output: dict):
    """
    Save agent output to profile's agent_outputs namespace.
    Each agent has isolated workspace.
    """
    supabase = get_supabase_client()

    # Get current profile
    profile_result = supabase.table("profiles").select("agent_outputs").eq("user_id", user_id).single().execute()

    if not profile_result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update agent workspace
    agent_outputs = profile_result.data.get("agent_outputs") or {}
    agent_outputs[agent_name] = {
        "last_run": datetime.utcnow().isoformat(),
        "output": output.get("output"),
        "quality_score": output.get("quality_score"),
        "error": output.get("error"),
    }

    # Save back
    result = supabase.table("profiles").update({
        "agent_outputs": agent_outputs
    }).eq("user_id", user_id).execute()

    return {"success": True}
