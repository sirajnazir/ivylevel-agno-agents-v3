"""
Agent Utilities
"""
from typing import Dict, Any

# Standard archetype mapping for all agents
ARCHETYPE_MAP = {
    # Legacy IDs -> Enriched data keys
    "scholar": "academic_powerhouse",
    "researcher": "stem_innovator",
    "entrepreneur": "entrepreneurial_leader",
    "leader": "entrepreneurial_leader",
    "changemaker": "community_changemaker",
    "creator": "creative_visionary",

    # Direct passthrough for new IDs
    "academic_powerhouse": "academic_powerhouse",
    "stem_innovator": "stem_innovator",
    "entrepreneurial_leader": "entrepreneurial_leader",
    "community_changemaker": "community_changemaker",
    "creative_visionary": "creative_visionary",
    "humanities_scholar": "humanities_scholar",
    "athletic_scholar": "athletic_scholar",
    "multi_hyphenate": "multi_hyphenate",
}

def transform_profile_for_agent(db_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform database profile to agent-friendly format.
    Handles JSONB fields and provides defaults.
    """
    if not db_profile:
        return {}

    # 🔍 DEBUG: Log the incoming profile structure
    print(f"[transform_profile_for_agent] Input keys: {list(db_profile.keys())}")
    print(f"[transform_profile_for_agent] four_pillars type: {type(db_profile.get('four_pillars'))}")

    identity_synthesis = db_profile.get("identity_synthesis") or {}

    result = {
        "id": db_profile.get("id"),
        "user_id": db_profile.get("user_id"),
        "first_name": db_profile.get("first_name"),
        "last_name": db_profile.get("last_name"),
        "grade": db_profile.get("grade") or 11,
        "graduation_year": db_profile.get("graduation_year"),

        # Academic
        "gpa": db_profile.get("gpa"),
        "sat_score": db_profile.get("sat_score"),
        "act_score": db_profile.get("act_score"),

        # Targets
        "target_schools": db_profile.get("target_schools") or {"dream": [], "reach": [], "target": [], "safety": []},
        "target_majors": db_profile.get("target_majors") or [],

        # Identity synthesis - CRITICAL for agents
        "identity_synthesis": identity_synthesis,
        "archetype": identity_synthesis.get("archetype", {}),
        "spike": identity_synthesis.get("spike", ""),
        "pillars": identity_synthesis.get("pillars", {}),

        # Portfolio (may be empty for underclassmen - that's OK!)
        "activities": db_profile.get("activities") or [],
        "awards": db_profile.get("awards") or [],
        "programs": db_profile.get("programs") or [],

        # Assessment primitives
        "interests": db_profile.get("interests") or [],
        "values": db_profile.get("values") or [],
        "goals": db_profile.get("goals") or {},
        "strengths": db_profile.get("strengths") or [],
        "challenges": db_profile.get("challenges") or [],

        # Four pillars
        "four_pillars": db_profile.get("four_pillars") or {},

        # 🆕 NEW: Narrative synthesis inputs (from click-based assessment cards)
        # These enable meaningful narratives even for underclassmen without activities
        "interest_areas": _extract_interest_areas(db_profile),
        "causes": _extract_causes(db_profile),
        "core_values": _extract_core_values(db_profile),
    }

    # 🔍 DEBUG: Log the extracted narrative fields
    print(f"[transform_profile_for_agent] Extracted interest_areas: {result.get('interest_areas')}")
    print(f"[transform_profile_for_agent] Extracted causes: {result.get('causes')}")
    print(f"[transform_profile_for_agent] Extracted core_values: {result.get('core_values')}")

    return result


def _extract_interest_areas(db_profile: Dict[str, Any]) -> list:
    """Extract interest_areas from multiple possible locations.

    Frontend saves to: passion.interest_areas
    Also stored in: four_pillars.passion.interest_areas, interests
    """
    # 1. Try direct interests column
    interests = db_profile.get("interests") or []
    if interests and len(interests) > 0:
        return interests

    # 2. Try four_pillars.passion.interest_areas
    four_pillars = db_profile.get("four_pillars") or {}
    if isinstance(four_pillars, str):
        import json
        try:
            four_pillars = json.loads(four_pillars)
        except:
            four_pillars = {}
    passion_pillar = four_pillars.get("passion") or {}
    if passion_pillar.get("interest_areas"):
        return passion_pillar["interest_areas"]

    # 3. 🆕 FIX: Try direct passion.interest_areas (frontend save path)
    passion = db_profile.get("passion") or {}
    if isinstance(passion, str):
        import json
        try:
            passion = json.loads(passion)
        except:
            passion = {}
    if passion.get("interest_areas"):
        return passion["interest_areas"]

    return []


def _extract_causes(db_profile: Dict[str, Any]) -> list:
    """Extract causes from multiple possible locations.

    Frontend saves to: community.causes
    Also stored in: four_pillars.service.causes
    """
    # 1. Try four_pillars.service.causes
    four_pillars = db_profile.get("four_pillars") or {}
    if isinstance(four_pillars, str):
        import json
        try:
            four_pillars = json.loads(four_pillars)
        except:
            four_pillars = {}
    service_pillar = four_pillars.get("service") or {}
    if service_pillar.get("causes"):
        return service_pillar["causes"]

    # 2. 🆕 FIX: Try direct community.causes (frontend save path)
    community = db_profile.get("community") or {}
    if isinstance(community, str):
        import json
        try:
            community = json.loads(community)
        except:
            community = {}
    if community.get("causes"):
        return community["causes"]

    return []


def _extract_core_values(db_profile: Dict[str, Any]) -> list:
    """Extract core_values from multiple possible locations.

    Frontend saves to: operating.core_values
    Also stored in: four_pillars.identity.core_values, values
    """
    # 1. Try direct values column
    values = db_profile.get("values") or []
    if values and len(values) > 0:
        return values

    # 2. Try four_pillars.identity.core_values
    four_pillars = db_profile.get("four_pillars") or {}
    if isinstance(four_pillars, str):
        import json
        try:
            four_pillars = json.loads(four_pillars)
        except:
            four_pillars = {}
    identity_pillar = four_pillars.get("identity") or {}
    if identity_pillar.get("core_values"):
        return identity_pillar["core_values"]

    # 3. 🆕 FIX: Try direct operating.core_values (frontend save path)
    operating = db_profile.get("operating") or {}
    if isinstance(operating, str):
        import json
        try:
            operating = json.loads(operating)
        except:
            operating = {}
    if operating.get("core_values"):
        return operating["core_values"]

    return []
