"""
Integration tests for the user API endpoints.
"""

import pytest
import json
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends

from hopple.api.app import app
from hopple.api.routes.user_routes import router as user_router
from hopple.api.middlewares.auth import get_current_user, require_admin, require_authenticated
from hopple.database.models.user import UserRole


@pytest.mark.integration
@pytest.mark.api
class TestUserAPI:
    """Integration tests for the User API endpoints."""

    def test_create_user(self, client: TestClient):
        """Test creating a new user."""
        # Arrange
        user_data = {
            "email": "apitestuser@example.com",
            "username": "apitestuser",
            "full_name": "API Test User",
            "role": UserRole.DEVELOPER.value
        }
        
        # Act
        response = client.post("/api/v1/users/", json=user_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert data["full_name"] == user_data["full_name"]
        assert data["role"] == user_data["role"]
    
    def test_update_user_as_self(self, client: TestClient, test_user, mock_auth):
        """Test updating a user as the user themselves."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        user_data = {
            "full_name": "Updated User Name",
            "preferences": {"theme": "dark"}
        }
        
        # Act
        response = client.put(f"/api/v1/users/{test_user.id}", json=user_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == user_data["full_name"]
        assert data["preferences"] == user_data["preferences"]
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_update_user_role_as_non_admin_forbidden(self, client: TestClient, test_user, mock_auth):
        """Test updating a user's role as a non-admin (which should be forbidden)."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        user_data = {
            "role": UserRole.ADMIN.value
        }
        
        # Act
        response = client.put(f"/api/v1/users/{test_user.id}", json=user_data)
        
        # Assert
        assert response.status_code == 403
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_current_user_profile(self, client: TestClient, test_user, mock_auth):
        """Test getting the current user's profile."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Act
        response = client.get("/api/v1/users/me")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_user.id)
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_user_by_id_as_self(self, client: TestClient, test_user, mock_auth):
        """Test getting a user by ID as the user themselves."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Act
        response = client.get(f"/api/v1/users/{test_user.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_user.id)
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_user_by_id_as_different_user_forbidden(self, client: TestClient, test_manager, mock_auth):
        """Test getting a user by ID as a different user (which should be forbidden)."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Act
        response = client.get(f"/api/v1/users/{test_manager.id}")
        
        # Assert
        assert response.status_code == 403
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_user_by_id_as_admin(self, client: TestClient, test_user, test_admin, mock_admin_auth):
        """Test getting a user by ID as an admin."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_admin_auth()
        
        # Act
        response = client.get(f"/api/v1/users/{test_user.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_user.id)
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_delete_user_as_admin(self, client: TestClient, test_user, test_admin, mock_admin_auth):
        """Test deleting a user as an admin."""
        # Arrange
        app.dependency_overrides[require_admin] = lambda: mock_admin_auth()
        
        # Act
        response = client.delete(f"/api/v1/users/{test_user.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify the user was deleted
        response = client.get(f"/api/v1/users/{test_user.id}")
        assert response.status_code == 404
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_delete_user_as_non_admin_forbidden(self, client: TestClient, test_manager, test_user, mock_auth):
        """Test deleting a user as a non-admin (which should be forbidden)."""
        # Arrange
        app.dependency_overrides[require_admin] = lambda: mock_auth()
        
        # Act
        response = client.delete(f"/api/v1/users/{test_manager.id}")
        
        # Assert
        assert response.status_code == 403
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_complete_onboarding(self, client: TestClient):
        """Test completing the onboarding process for a new user."""
        # Arrange
        onboarding_data = {
            "email": "onboarding@example.com",
            "name": "Onboarding User",
            "skills": ["Python", "FastAPI", "React"],
            "notificationPreferences": {
                "email": True,
                "inApp": True
            },
            "title": "Software Engineer",
            "bio": "A software engineer who loves coding"
        }
        
        # Act
        response = client.post("/api/v1/users/onboarding", json=onboarding_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == onboarding_data["email"]
        assert data["full_name"] == onboarding_data["name"]
        assert "Python" in data["skills"]
        assert "FastAPI" in data["skills"]
        assert data["user_metadata"]["title"] == onboarding_data["title"]
    
    def test_auth_check(self, client: TestClient, test_user, mock_auth):
        """Test the authentication check endpoint."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Act
        response = client.get("/api/v1/users/auth/check")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_id"] == str(test_user.id)
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        assert data["role"] == test_user.role
        
        # Cleanup
        app.dependency_overrides.clear() 