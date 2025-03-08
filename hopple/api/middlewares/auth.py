"""
Authorization middleware for Hopple API.

This middleware handles role-based access control (RBAC) for different user roles.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional, Callable
import uuid

from hopple.database.db_config import get_db
from hopple.database.models.user import User, UserRole
from hopple.api.dto.auth_dto import CurrentUser

# OAuth2 bearer token scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    email: Optional[str] = None,
    db: Session = Depends(get_db)
) -> CurrentUser:
    """
    Get the current authenticated user.
    
    Uses either the OAuth2 token or email parameter for authentication.
    In a production environment, this should be replaced with proper JWT validation.
    """
    if not token and not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Use email for testing/demo purposes
    # In production, use the token to validate and extract user info
    try:
        # Currently using email as a simple auth mechanism
        # In production, decode and validate JWT token instead
        user_email = email
        
        # For token-based auth, would extract email from token
        # if token:
        #     # Code to decode JWT and extract email
        #     user_email = decoded_token.email
        
        # Get user from database
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return CurrentUser(
            id=uuid.UUID(str(user.id)),
            email=str(user.email),
            username=str(user.username),
            full_name=str(user.full_name) if user.full_name else None,
            role=str(user.role)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_roles(allowed_roles: List[str]) -> Callable:
    """
    Create a dependency that requires specific roles.
    
    Args:
        allowed_roles: List of roles allowed to access the endpoint
        
    Returns:
        Dependency function that validates user role
    """
    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker

# Predefined role requirements
require_admin = require_roles([UserRole.ADMIN.value])
require_manager = require_roles([UserRole.ADMIN.value, UserRole.MANAGER.value])
require_developer_or_higher = require_roles([
    UserRole.ADMIN.value, 
    UserRole.MANAGER.value, 
    UserRole.DEVELOPER.value
])
require_authenticated = get_current_user 