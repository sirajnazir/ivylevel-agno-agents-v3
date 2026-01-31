"""
Agents Adapters
===============

Adapters that bridge different systems and provide unified interfaces.
"""

from .archetype_adapter import (
    ArchetypeAdapter,
    LegacyArchetype,
    get_archetype_for_profile,
    get_execution_system_for_profile,
)

__all__ = [
    "ArchetypeAdapter",
    "LegacyArchetype",
    "get_archetype_for_profile",
    "get_execution_system_for_profile",
]
