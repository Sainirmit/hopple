"""
Data transfer objects for authentication.
"""

from pydantic import BaseModel, Field
from typing import Optional
import uuid


class CurrentUser(BaseModel):
    """Current authenticated user model."""
    
    id: uuid.UUID
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    
    class Config:
        """Pydantic config."""
        
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response model."""
    
    access_token: str
    token_type: str = Field(default="bearer")
    user_id: str
    username: str
    email: str
    role: str 