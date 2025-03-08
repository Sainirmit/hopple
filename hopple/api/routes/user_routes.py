"""
User API routes for Hopple.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, cast
import uuid
from datetime import datetime

from hopple.database.db_config import get_db
from hopple.database.models.user import User, UserRole, UserStatus
from hopple.api.middlewares.auth import get_current_user, require_admin, require_authenticated
from hopple.api.dto.auth_dto import CurrentUser
from hopple.utils.logger import logger
from hopple.services.user_service import UserService

# Create router
router = APIRouter()


@router.post("/users/", response_model=Dict[str, Any])
async def create_user(
    user_data: Dict[str, Any], 
    db: Session = Depends(get_db)
):
    """
    Create a new user.
    
    This endpoint is mainly used for first-time creation and doesn't require authentication
    since it's used during the registration flow.
    """
    try:
        # Check if user with this email already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            # If user exists, return the existing user
            return {
                "id": str(existing_user.id),
                "email": existing_user.email,
                "username": existing_user.username,
                "full_name": existing_user.full_name,
                "role": existing_user.role,
                "created_at": existing_user.created_at,
                "updated_at": existing_user.updated_at,
                "is_active": existing_user.is_active,
                "skills": existing_user.skills,
                "preferences": existing_user.preferences
            }
        
        # Generate username from email if not provided
        if "username" not in user_data:
            username = user_data["email"].split("@")[0]
            # Add a unique suffix to prevent duplicates
            unique_suffix = uuid.uuid4().hex[:6]
            user_data["username"] = f"{username}_{unique_suffix}"
        
        # Default role is developer unless specified
        role = user_data.get("role", UserRole.DEVELOPER.value)
        
        # Create new user
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            full_name=user_data.get("full_name", user_data.get("name", "")),
            role=role,
            skills=user_data.get("skills", {}),
            skill_levels=user_data.get("skill_levels", {}),
            preferences=user_data.get("preferences", {}),
            user_metadata=user_data.get("user_metadata", {})
        )
        
        # Process skills list if provided
        skills_list = user_data.get("skills_list", [])
        if skills_list:
            # Convert list of skill names to skills dictionary
            user.skills = {skill: 1 for skill in skills_list}
            user.skill_levels = {skill: 1 for skill in skills_list}
        
        # Add user to database
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "is_active": user.is_active,
            "skills": user.skills,
            "preferences": user.preferences
        }
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error creating user: {str(e)}")


@router.put("/users/{user_id}", response_model=Dict[str, Any])
async def update_user(
    user_id: str, 
    user_data: Dict[str, Any], 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Update an existing user.
    
    Users can update their own profiles.
    Admins can update any user.
    Only admins can change user roles.
    """
    try:
        # Get user by ID
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Check permissions
        is_admin = current_user.role == UserRole.ADMIN.value
        is_self_update = str(current_user.id) == user_id
        
        if not (is_admin or is_self_update):
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to update this user"
            )
        
        # Only admins can change role
        if "role" in user_data and not is_admin:
            raise HTTPException(
                status_code=403, 
                detail="Only administrators can change user roles"
            )
        
        # Update fields if provided
        if "full_name" in user_data or "name" in user_data:
            user.full_name = user_data.get("full_name", user_data.get("name", user.full_name))
        
        if "email" in user_data:
            user.email = user_data["email"]
        
        if "username" in user_data:
            user.username = user_data["username"]
        
        if "role" in user_data and is_admin:
            user.role = user_data["role"]
        
        if "is_active" in user_data and is_admin:
            user.is_active = user_data["is_active"]
        
        if "preferences" in user_data:
            user.preferences = user_data["preferences"]
        
        # Handle skills
        if "skills" in user_data:
            user.skills = user_data["skills"]
        
        # Process skills list if provided
        skills_list = user_data.get("skills_list", [])
        if skills_list:
            # Convert list of skill names to skills dictionary
            user.skills = {skill: 1 for skill in skills_list}
            user.skill_levels = {skill: 1 for skill in skills_list}
        
        # Update notification preferences
        if "notificationPreferences" in user_data:
            preferences: Dict[str, Any] = user.preferences or {}
            if preferences is not None:
                preferences["notifications"] = user_data["notificationPreferences"]
                user.preferences = preferences
        
        # Set onboarding completed status
        if "hasCompletedOnboarding" in user_data and user_data["hasCompletedOnboarding"]:
            user_metadata: Dict[str, Any] = user.user_metadata or {}
            if user_metadata is not None:
                user_metadata["onboarding_completed"] = True
                user_metadata["onboarding_completed_at"] = datetime.utcnow().isoformat()
                user.user_metadata = user_metadata
        
        # Update user metadata fields
        if "title" in user_data or "bio" in user_data:
            user_metadata = user.user_metadata or {}
            
            if "title" in user_data and user_metadata is not None:
                user_metadata["title"] = user_data["title"]
                
            if "bio" in user_data and user_metadata is not None:
                user_metadata["bio"] = user_data["bio"]
                
            user.user_metadata = user_metadata
        
        # Update user
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "is_active": user.is_active,
            "skills": user.skills,
            "preferences": user.preferences,
            "user_metadata": user.user_metadata
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error updating user: {str(e)}")


@router.post("/users/onboarding", response_model=Dict[str, Any])
async def complete_onboarding(
    onboarding_data: Dict[str, Any], 
    db: Session = Depends(get_db)
):
    """
    Complete the onboarding process for a user.
    
    This endpoint doesn't require authentication since it's part of the
    initial onboarding flow.
    """
    try:
        # Use the UserService
        user_service = UserService(db)
        
        # Get user by email
        user = None
        if "email" in onboarding_data:
            user = user_service.get_user_by_email(onboarding_data["email"])
        
        # Create user if not exists
        if not user:
            return await create_user(onboarding_data, db)
        
        # Prepare dummy CurrentUser for the service
        dummy_user = CurrentUser(
            id=uuid.UUID(str(user.id)),
            email=str(user.email),
            username=str(user.username),
            full_name=str(user.full_name) if user.full_name else None,
            role=str(user.role)
        )
        
        # Update user with onboarding data
        user_data = {
            "hasCompletedOnboarding": True,
            "full_name": onboarding_data.get("name", ""),
            "preferences": onboarding_data.get("preferences", {}),
        }
        
        # Process skills
        if "skills" in onboarding_data and isinstance(onboarding_data["skills"], list):
            user_data["skills_list"] = onboarding_data["skills"]
        
        # Handle notification preferences
        if "notificationPreferences" in onboarding_data:
            user_data["notificationPreferences"] = onboarding_data["notificationPreferences"]
        
        # Handle title and bio
        if "title" in onboarding_data:
            user_data["title"] = onboarding_data["title"]
            
        if "bio" in onboarding_data:
            user_data["bio"] = onboarding_data["bio"]
        
        # Update user
        updated_user = user_service.update_user(str(user.id), user_data, dummy_user)
        if not updated_user:
            raise HTTPException(status_code=404, detail=f"User not found or could not be updated")
            
        # Return user data
        user_metadata: Dict[str, Any] = updated_user.user_metadata or {}
        has_completed_onboarding = user_metadata.get("onboarding_completed", False) if user_metadata else False
            
        return {
            "id": str(updated_user.id),
            "email": updated_user.email,
            "username": updated_user.username,
            "full_name": updated_user.full_name,
            "role": updated_user.role,
            "created_at": updated_user.created_at,
            "updated_at": updated_user.updated_at,
            "is_active": updated_user.is_active,
            "skills": list(updated_user.skills.keys()) if updated_user.skills else [],
            "preferences": updated_user.preferences or {},
            "hasCompletedOnboarding": has_completed_onboarding,
            "title": user_metadata.get("title", "") if user_metadata else "",
            "bio": user_metadata.get("bio", "") if user_metadata else ""
        }
    except Exception as e:
        logger.error(f"Error completing onboarding: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error completing onboarding: {str(e)}")


@router.get("/users/me", response_model=Dict[str, Any])
async def get_current_user_profile(
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Get the current authenticated user's profile.
    
    This uses the authentication system rather than query parameters.
    """
    try:
        # Get user by ID from current_user
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has completed onboarding
        user_metadata: Dict[str, Any] = user.user_metadata or {}
        has_completed_onboarding = user_metadata.get("onboarding_completed", False)
        
        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "username": user.username,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "is_active": user.is_active,
            "skills": list(user.skills.keys()) if user.skills else [],
            "preferences": user.preferences or {},
            "hasCompletedOnboarding": has_completed_onboarding,
            "title": user_metadata.get("title", "") if user_metadata else "",
            "bio": user_metadata.get("bio", "") if user_metadata else ""
        }
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error getting current user: {str(e)}")


@router.get("/users/{user_id}", response_model=Dict[str, Any])
async def get_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Get a user by ID.
    
    Users can view their own profiles.
    Admins and managers can view any user.
    """
    try:
        # Check permissions
        is_admin_or_manager = current_user.role in [UserRole.ADMIN.value, UserRole.MANAGER.value]
        is_self = str(current_user.id) == user_id
        
        if not (is_admin_or_manager or is_self):
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to view this user"
            )
        
        # Get user by ID
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Build response
        user_metadata: Dict[str, Any] = user.user_metadata or {}
        
        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "username": user.username,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "is_active": user.is_active,
            "skills": list(user.skills.keys()) if user.skills else [],
            "title": user_metadata.get("title", "") if user_metadata else "",
            "bio": user_metadata.get("bio", "") if user_metadata else "",
            "preferences": user.preferences or {}
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error getting user: {str(e)}")


@router.get("/users", response_model=List[Dict[str, Any]])
async def get_users(
    skip: int = 0, 
    limit: int = 100,
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all users.
    
    Only administrators can access this endpoint.
    """
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        
        return [
            {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "username": user.username,
                "role": user.role,
                "is_active": user.is_active,
                "skills": list(user.skills.keys()) if user.skills else []
            }
            for user in users
        ]
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error getting users: {str(e)}")


@router.delete("/users/{user_id}", response_model=Dict[str, bool])
async def delete_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user.
    
    Only administrators can delete users.
    """
    try:
        # Get user by ID
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Delete user
        db.delete(user)
        db.commit()
        
        return {"success": True}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error deleting user: {str(e)}")


@router.get("/users/auth/check", response_model=Dict[str, Any])
async def check_auth(
    current_user: CurrentUser = Depends(require_authenticated)
):
    """
    Check if the user is authenticated and get their basic info.
    
    This is useful for frontend to verify authentication status.
    """
    return {
        "authenticated": True,
        "user_id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "role": current_user.role
    } 