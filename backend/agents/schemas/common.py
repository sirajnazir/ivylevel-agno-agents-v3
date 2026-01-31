from pydantic import BaseModel, Field

class IdentitySeed(BaseModel):
    """An identity seed for narrative development."""
    # Core fields (GamePlan compatible)
    target_deadline: str = ""
    plant_date: str = ""
    action: str = ""
    narrative_theme: str = ""

    # Legacy/UI fields
    name: str = Field(default="", description="Display name")
    type: str = Field(default="seed", description="Type of seed")
    planted: bool = False
    description: str = ""
