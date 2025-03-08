"""
Unit tests for the user service.
"""

import pytest
import uuid
from sqlalchemy.orm import Session
from typing import Dict, Any

from hopple.services.user_service import UserService
from hopple.database.models.user import User, UserRole
from hopple.api.dto.auth_dto import CurrentUser


@pytest.mark.unit
@pytest.mark.services
class TestUserService:
    """Tests for the UserService class."""

    def test_get_user_by_email(self, db_session: Session, test_user: User):
        """Test getting a user by email."""
        # Arrange
        service = UserService(db_session)
        
        # Act
        user = service.get_user_by_email(test_user.email)
        
        # Assert
        assert user is not None
        assert user.email == test_user.email
        assert user.username == test_user.username
    
    def test_get_user_by_email_not_found(self, db_session: Session):
        """Test getting a user by email when the user doesn't exist."""
        # Arrange
        service = UserService(db_session)
        
        # Act
        user = service.get_user_by_email("nonexistent@example.com")
        
        # Assert
        assert user is None
    
    def test_create_user(self, db_session: Session):
        """Test creating a new user."""
        # Arrange
        service = UserService(db_session)
        user_data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "full_name": "New User",
            "role": UserRole.DEVELOPER.value
        }
        
        # Act
        user = service.create_user(user_data)
        
        # Assert
        assert user is not None
        assert user.email == user_data["email"]
        assert user.username == user_data["username"]
        assert user.full_name == user_data["full_name"]
        assert user.role == user_data["role"]
        
        # Verify the user was added to the database
        db_user = db_session.query(User).filter(User.email == user_data["email"]).first()
        assert db_user is not None
    
    def test_create_user_existing_user(self, db_session: Session, test_user: User):
        """Test creating a user when the user already exists."""
        # Arrange
        service = UserService(db_session)
        user_data = {
            "email": test_user.email,
            "username": "newusername",
            "full_name": "New Name"
        }
        
        # Act
        user = service.create_user(user_data)
        
        # Assert
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email
        # Existing user's data should not be modified
        assert user.username == test_user.username
        assert user.full_name == test_user.full_name
    
    def test_update_user_as_self(self, db_session: Session, test_user: User):
        """Test updating a user as the user themselves."""
        # Arrange
        service = UserService(db_session)
        user_data = {
            "full_name": "Updated Name",
            "preferences": {"theme": "dark"}
        }
        current_user = CurrentUser(
            id=test_user.id,
            email=test_user.email,
            username=test_user.username,
            full_name=test_user.full_name,
            role=test_user.role
        )
        
        # Act
        updated_user = service.update_user(
            user_id=str(test_user.id),
            user_data=user_data,
            current_user=current_user
        )
        
        # Assert
        assert updated_user is not None
        assert updated_user.full_name == user_data["full_name"]
        assert updated_user.preferences == user_data["preferences"]
    
    def test_update_user_as_admin(self, db_session: Session, test_user: User, test_admin: User):
        """Test updating a user as an admin."""
        # Arrange
        service = UserService(db_session)
        user_data = {
            "full_name": "Admin Updated Name",
            "role": UserRole.MANAGER.value,
            "is_active": False
        }
        current_user = CurrentUser(
            id=test_admin.id,
            email=test_admin.email,
            username=test_admin.username,
            full_name=test_admin.full_name,
            role=test_admin.role
        )
        
        # Act
        updated_user = service.update_user(
            user_id=str(test_user.id),
            user_data=user_data,
            current_user=current_user
        )
        
        # Assert
        assert updated_user is not None
        assert updated_user.full_name == user_data["full_name"]
        assert updated_user.role == user_data["role"]
        assert updated_user.is_active == user_data["is_active"]
    
    def test_update_user_permission_error(self, db_session: Session, test_user: User, test_manager: User):
        """Test updating a user without permissions."""
        # Arrange
        service = UserService(db_session)
        user_data = {
            "full_name": "Unauthorized Update"
        }
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act & Assert
        with pytest.raises(PermissionError):
            service.update_user(
                user_id=str(test_user.id),
                user_data=user_data,
                current_user=current_user
            )
    
    def test_delete_user_as_admin(self, db_session: Session, test_user: User, test_admin: User):
        """Test deleting a user as an admin."""
        # Arrange
        service = UserService(db_session)
        current_user = CurrentUser(
            id=test_admin.id,
            email=test_admin.email,
            username=test_admin.username,
            full_name=test_admin.full_name,
            role=test_admin.role
        )
        
        # Act
        result = service.delete_user(
            user_id=str(test_user.id),
            current_user=current_user
        )
        
        # Assert
        assert result is True
        assert db_session.query(User).filter(User.id == test_user.id).first() is None
    
    def test_delete_user_permission_error(self, db_session: Session, test_user: User, test_manager: User):
        """Test deleting a user without admin permissions."""
        # Arrange
        service = UserService(db_session)
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act & Assert
        with pytest.raises(PermissionError):
            service.delete_user(
                user_id=str(test_user.id),
                current_user=current_user
            )
    
    def test_get_user_profile(self, db_session: Session, test_user: User):
        """Test getting a user profile."""
        # Arrange
        service = UserService(db_session)
        
        # Act
        profile = service.get_user_profile(str(test_user.id))
        
        # Assert
        assert profile is not None
        assert profile["id"] == str(test_user.id)
        assert profile["email"] == test_user.email
        assert profile["name"] == test_user.full_name
        assert profile["username"] == test_user.username
    
    def test_get_user_profile_not_found(self, db_session: Session):
        """Test getting a user profile when the user doesn't exist."""
        # Arrange
        service = UserService(db_session)
        
        # Act
        profile = service.get_user_profile(str(uuid.uuid4()))
        
        # Assert
        assert profile is None 