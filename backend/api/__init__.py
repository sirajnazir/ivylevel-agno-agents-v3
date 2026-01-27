# API Routes Package
"""
FastAPI route handlers for the IvyLevel API.

THE SCALABILITY LAW:
- NEVER instantiate Agent() directly in routes
- ALWAYS use registry.load_agent("key", profile)
"""
