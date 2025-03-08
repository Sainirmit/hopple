"""
User service for Hopple.

This module provides service methods for user management operations.
"""

from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from hopple.database.models.user import User, UserRole
from hopple.services.base_service import BaseService
from hopple.api.dto.auth_dto import CurrentUser
from hopple.utils.logger import logger


class UserService(BaseService[User, Any, Any]):
    """
    User service for managing user operations.
    
    This service implements business logic for user management,
    including creating, updating, and retrieving users.
    """
    
    def __init__(self, db: Session):
        """Initialize the user service."""
        super().__init__(User, db)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get a user by email.
        
        Args:
            email: The user's email
            
        Returns:
            The user if found, None otherwise
        """
        return self.db.query(User).filter(User.email == email).first()
    
    def create_user(self, user_data: Dict[str, Any]) -> User:
        """
        Create a new user.
        
        Args:
            user_data: User data
            
        Returns:
            The created user
        """
        # Check if user with this email already exists
        existing_user = self.get_user_by_email(user_data["email"])
        if existing_user:
            return existing_user
        
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
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def update_user(
        self, 
        user_id: Union[str, uuid.UUID], 
        user_data: Dict[str, Any], 
        current_user: Optional[CurrentUser] = None
    ) -> Optional[User]:
        """
        Update an existing user.
        
        Args:
            user_id: The user ID
            user_data: User data to update
            current_user: The current user (if authenticated)
            
        Returns:
            The updated user if successful, None otherwise
            
        Raises:
            PermissionError: If the current user doesn't have permission
            ValueError: If the user ID is invalid
        """
        # Get user by ID
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        # Check permissions if current_user is provided
        if current_user:
            is_admin = current_user.role == UserRole.ADMIN.value
            is_self_update = str(current_user.id) == str(user.id)
            
            if not (is_admin or is_self_update):
                raise PermissionError("You don't have permission to update this user")
            
            # Only admins can change role
            if "role" in user_data and not is_admin:
                raise PermissionError("Only administrators can change user roles")
        
        # Update fields if provided
        if "full_name" in user_data or "name" in user_data:
            user.full_name = user_data.get("full_name", user_data.get("name", user.full_name))
        
        if "email" in user_data:
            user.email = user_data["email"]
        
        if "username" in user_data:
            user.username = user_data["username"]
        
        # Role can only be changed by admins or during initial setup (when current_user is None)
        if "role" in user_data and (not current_user or current_user.role == UserRole.ADMIN.value):
            user.role = user_data["role"]
        
        # Active status can only be changed by admins or during initial setup
        if "is_active" in user_data and (not current_user or current_user.role == UserRole.ADMIN.value):
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
            preferences = user.preferences or {}
            preferences["notifications"] = user_data["notificationPreferences"]
            user.preferences = preferences
        
        # Set onboarding completed status
        if "hasCompletedOnboarding" in user_data and user_data["hasCompletedOnboarding"]:
            user_metadata = user.user_metadata or {}
            user_metadata["onboarding_completed"] = True
            user_metadata["onboarding_completed_at"] = datetime.utcnow().isoformat()
            user.user_metadata = user_metadata
        
        # Update user metadata fields
        if "title" in user_data or "bio" in user_data:
            user_metadata = user.user_metadata or {}
            
            if "title" in user_data:
                user_metadata["title"] = user_data["title"]
                
            if "bio" in user_data:
                user_metadata["bio"] = user_data["bio"]
                
            user.user_metadata = user_metadata
        
        # Update user
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def get_user_profile(self, user_id: Union[str, uuid.UUID]) -> Optional[Dict[str, Any]]:
        """
        Get a user profile.
        
        Args:
            user_id: The user ID
            
        Returns:
            The user profile if found, None otherwise
        """
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        # Build profile
        user_metadata = user.user_metadata or {}
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
            "title": user_metadata.get("title", ""),
            "bio": user_metadata.get("bio", "")
        }
    
    def delete_user(
        self, 
        user_id: Union[str, uuid.UUID], 
        current_user: CurrentUser
    ) -> bool:
        """
        Delete a user.
        
        Args:
            user_id: The user ID
            current_user: The current user
            
        Returns:
            True if deleted, False otherwise
            
        Raises:
            PermissionError: If the current user doesn't have permission
        """
        # Check permissions
        if current_user.role != UserRole.ADMIN.value:
            raise PermissionError("Only administrators can delete users")
        
        # Delete user
        return self.delete(user_id) 