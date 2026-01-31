from typing import TypeVar, Generic, Optional, List, Dict, Any
from pydantic import BaseModel

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    """Standard response wrapper - ALL endpoints MUST use this."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
