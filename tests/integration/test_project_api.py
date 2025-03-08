"""
Integration tests for the project API endpoints.
"""

import pytest
import json
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends

from hopple.api.app import app
from hopple.api.middlewares.auth import require_authenticated, require_manager
from hopple.database.models.task import TaskStatus, TaskPriority


@pytest.mark.integration
@pytest.mark.api
class TestProjectAPI:
    """Integration tests for the Project API endpoints."""

    def test_create_project_as_manager(self, client: TestClient, test_manager, mock_manager_auth):
        """Test creating a project as a manager."""
        # Arrange
        app.dependency_overrides[require_manager] = lambda: mock_manager_auth()
        
        project_data = {
            "name": "API Test Project",
            "description": "A project created through the API"
        }
        
        # Act
        response = client.post("/api/v1/projects/", json=project_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == project_data["name"]
        assert data["description"] == project_data["description"]
        assert data["owner_id"] == str(test_manager.id)
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_create_project_as_developer_forbidden(self, client: TestClient, test_user, mock_auth):
        """Test creating a project as a developer (which should be forbidden)."""
        # Arrange
        app.dependency_overrides[require_manager] = lambda: mock_auth()
        
        project_data = {
            "name": "Unauthorized Project",
            "description": "A project attempted to be created by a developer"
        }
        
        # Act
        response = client.post("/api/v1/projects/", json=project_data)
        
        # Assert
        assert response.status_code == 403
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_projects_as_manager(self, client: TestClient, test_project, test_manager, mock_manager_auth):
        """Test getting all projects as a manager."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        
        # Act
        response = client.get("/api/v1/projects/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(project["id"] == str(test_project.id) for project in data)
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_projects_as_developer(self, client: TestClient, test_project, test_tasks, test_user, mock_auth):
        """Test getting projects as a developer (should only see assigned projects)."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Act
        response = client.get("/api/v1/projects/")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Developer should see projects they have tasks assigned to
        user_project_ids = [str(test_project.id)]
        found_projects = [p for p in data if p["id"] in user_project_ids]
        assert len(found_projects) == len(user_project_ids)
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_project_by_id(self, client: TestClient, test_project, test_manager, mock_manager_auth):
        """Test getting a project by ID."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        
        # Act
        response = client.get(f"/api/v1/projects/{test_project.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_project.id)
        assert data["name"] == test_project.name
        assert data["description"] == test_project.description
        assert data["owner"]["id"] == str(test_manager.id)
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_project_by_id_not_found(self, client: TestClient, mock_manager_auth):
        """Test getting a project by ID when the project doesn't exist."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        
        # Act
        response = client.get("/api/v1/projects/00000000-0000-0000-0000-000000000000")
        
        # Assert
        assert response.status_code == 404
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_update_project(self, client: TestClient, test_project, mock_manager_auth):
        """Test updating a project."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        
        project_data = {
            "name": "Updated Project Name",
            "description": "Updated project description"
        }
        
        # Act
        response = client.put(f"/api/v1/projects/{test_project.id}", json=project_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == project_data["name"]
        assert data["description"] == project_data["description"]
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_delete_project_as_admin(self, client: TestClient, test_project, mock_admin_auth):
        """Test deleting a project as an admin."""
        # Arrange
        app.dependency_overrides[require_manager] = lambda: mock_admin_auth()
        
        # Act
        response = client.delete(f"/api/v1/projects/{test_project.id}")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify the project was deleted
        app.dependency_overrides[require_authenticated] = lambda: mock_admin_auth()
        get_response = client.get(f"/api/v1/projects/{test_project.id}")
        assert get_response.status_code == 404
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_get_project_tasks(self, client: TestClient, test_project, test_tasks, mock_manager_auth):
        """Test getting tasks for a project."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        
        # Act
        response = client.get(f"/api/v1/projects/{test_project.id}/tasks")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == len(test_tasks)
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_create_task(self, client: TestClient, test_project, test_user, mock_manager_auth):
        """Test creating a task for a project."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        
        task_data = {
            "title": "API Test Task",
            "description": "A task created through the API",
            "priority": TaskPriority.HIGH.value,
            "status": TaskStatus.TODO.value,
            "estimated_effort": 8,
            "assigned_to_id": str(test_user.id)
        }
        
        # Act
        response = client.post(f"/api/v1/projects/{test_project.id}/tasks", json=task_data)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["priority"] == task_data["priority"]
        assert data["status"] == task_data["status"]
        assert data["estimated_effort"] == task_data["estimated_effort"]
        assert data["assigned_to"] == task_data["assigned_to_id"]
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_create_task_as_developer_forbidden(self, client: TestClient, test_project, mock_auth):
        """Test creating a task as a developer (which should be forbidden)."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        task_data = {
            "title": "Unauthorized Task",
            "description": "A task attempted to be created by a developer"
        }
        
        # Act
        response = client.post(f"/api/v1/projects/{test_project.id}/tasks", json=task_data)
        
        # Assert
        assert response.status_code == 403
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_update_task_as_manager(self, client: TestClient, test_project, test_tasks, mock_manager_auth):
        """Test updating a task as a manager."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_manager_auth()
        test_task = test_tasks[0]
        
        task_data = {
            "title": "Updated Task Title",
            "description": "Updated task description",
            "priority": TaskPriority.LOW.value
        }
        
        # Act
        response = client.put(
            f"/api/v1/projects/{test_project.id}/tasks/{test_task.id}", 
            json=task_data
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["priority"] == task_data["priority"]
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_update_task_status_as_assigned_developer(self, client: TestClient, test_project, test_tasks, mock_auth):
        """Test updating a task status as the assigned developer."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Find a task assigned to the test user
        assigned_task = next((t for t in test_tasks if t.assigned_to_id is not None), None)
        assert assigned_task is not None
        
        task_data = {
            "status": TaskStatus.IN_PROGRESS.value
        }
        
        # Act
        response = client.put(
            f"/api/v1/projects/{test_project.id}/tasks/{assigned_task.id}", 
            json=task_data
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == task_data["status"]
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_update_task_as_non_assigned_developer_forbidden(self, client: TestClient, test_project, test_tasks, mock_auth):
        """Test updating a task as a non-assigned developer (which should be forbidden)."""
        # Arrange
        app.dependency_overrides[require_authenticated] = lambda: mock_auth()
        
        # Find a task not assigned to the test user
        unassigned_task = next((t for t in test_tasks if t.assigned_to_id is None), None)
        assert unassigned_task is not None
        
        task_data = {
            "title": "Unauthorized Update",
            "description": "An update attempted by a non-assigned developer"
        }
        
        # Act
        response = client.put(
            f"/api/v1/projects/{test_project.id}/tasks/{unassigned_task.id}", 
            json=task_data
        )
        
        # Assert
        assert response.status_code == 403
        
        # Cleanup
        app.dependency_overrides.clear() 