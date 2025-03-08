"""
Unit tests for the project service.
"""

import pytest
import uuid
from sqlalchemy.orm import Session

from hopple.services.project_service import ProjectService
from hopple.database.models.project import Project
from hopple.database.models.user import User, UserRole
from hopple.api.dto.auth_dto import CurrentUser


@pytest.mark.unit
@pytest.mark.services
class TestProjectService:
    """Tests for the ProjectService class."""

    def test_get_projects_for_user_as_manager(self, db_session: Session, test_manager: User, test_project: Project):
        """Test getting projects for a manager user."""
        # Arrange
        service = ProjectService(db_session)
        
        # Act
        projects = service.get_projects_for_user(
            user_id=str(test_manager.id),
            role=UserRole.MANAGER.value
        )
        
        # Assert
        assert len(projects) >= 1
        assert any(p.id == test_project.id for p in projects)
    
    def test_get_projects_for_user_as_developer(self, db_session: Session, test_user: User, test_project: Project, test_tasks):
        """Test getting projects for a developer user."""
        # Arrange
        service = ProjectService(db_session)
        
        # Act
        projects = service.get_projects_for_user(
            user_id=str(test_user.id),
            role=UserRole.DEVELOPER.value
        )
        
        # Assert
        # Developer should see projects they have tasks assigned to
        assert len(projects) >= 1
        assert any(p.id == test_project.id for p in projects)
    
    def test_create_project_as_manager(self, db_session: Session, test_manager: User):
        """Test creating a project as a manager."""
        # Arrange
        service = ProjectService(db_session)
        project_data = {
            "name": "New Test Project",
            "description": "A new test project created by a manager"
        }
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act
        project = service.create_project(project_data, current_user)
        
        # Assert
        assert project is not None
        assert project.name == project_data["name"]
        assert project.description == project_data["description"]
        assert project.owner_id == test_manager.id
        
        # Verify the project was added to the database
        db_project = db_session.query(Project).filter(Project.name == project_data["name"]).first()
        assert db_project is not None
    
    def test_create_project_as_developer_permission_error(self, db_session: Session, test_user: User):
        """Test creating a project as a developer (which should fail)."""
        # Arrange
        service = ProjectService(db_session)
        project_data = {
            "name": "Unauthorized Project",
            "description": "A project created by a developer without permission"
        }
        current_user = CurrentUser(
            id=test_user.id,
            email=test_user.email,
            username=test_user.username,
            full_name=test_user.full_name,
            role=test_user.role
        )
        
        # Act & Assert
        with pytest.raises(PermissionError):
            service.create_project(project_data, current_user)
    
    def test_update_project_as_owner(self, db_session: Session, test_manager: User, test_project: Project):
        """Test updating a project as the owner."""
        # Arrange
        service = ProjectService(db_session)
        project_data = {
            "name": "Updated Project Name",
            "description": "Updated project description"
        }
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act
        updated_project = service.update_project(
            project_id=str(test_project.id),
            project_data=project_data,
            current_user=current_user
        )
        
        # Assert
        assert updated_project is not None
        assert updated_project.name == project_data["name"]
        assert updated_project.description == project_data["description"]
    
    def test_update_project_as_non_owner_permission_error(self, db_session: Session, test_user: User, test_project: Project):
        """Test updating a project as a non-owner (which should fail)."""
        # Arrange
        service = ProjectService(db_session)
        project_data = {
            "name": "Unauthorized Update",
            "description": "An update by a non-owner"
        }
        current_user = CurrentUser(
            id=test_user.id,
            email=test_user.email,
            username=test_user.username,
            full_name=test_user.full_name,
            role=test_user.role
        )
        
        # Act & Assert
        with pytest.raises(PermissionError):
            service.update_project(
                project_id=str(test_project.id),
                project_data=project_data,
                current_user=current_user
            )
    
    def test_delete_project_as_admin(self, db_session: Session, test_admin: User, test_project: Project):
        """Test deleting a project as an admin."""
        # Arrange
        service = ProjectService(db_session)
        current_user = CurrentUser(
            id=test_admin.id,
            email=test_admin.email,
            username=test_admin.username,
            full_name=test_admin.full_name,
            role=test_admin.role
        )
        
        # Act
        result = service.delete_project(
            project_id=str(test_project.id),
            current_user=current_user
        )
        
        # Assert
        assert result is True
        assert db_session.query(Project).filter(Project.id == test_project.id).first() is None
    
    def test_delete_project_as_manager_non_owner_permission_error(self, db_session: Session, test_manager: User):
        """Test deleting a project as a manager who is not the owner (which should fail)."""
        # Arrange
        service = ProjectService(db_session)
        
        # Create a project owned by someone else
        other_project = Project(
            name="Other Project",
            description="A project owned by someone else",
            owner_id=uuid.uuid4()  # Random owner ID
        )
        db_session.add(other_project)
        db_session.commit()
        db_session.refresh(other_project)
        
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act & Assert
        with pytest.raises(PermissionError):
            service.delete_project(
                project_id=str(other_project.id),
                current_user=current_user
            )
    
    def test_get_project_details(self, db_session: Session, test_manager: User, test_project: Project):
        """Test getting project details."""
        # Arrange
        service = ProjectService(db_session)
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act
        project_details = service.get_project_details(
            project_id=str(test_project.id),
            current_user=current_user
        )
        
        # Assert
        assert project_details is not None
        assert project_details["id"] == str(test_project.id)
        assert project_details["name"] == test_project.name
        assert project_details["description"] == test_project.description
        assert project_details["owner"]["id"] == str(test_manager.id)
    
    def test_get_project_details_not_found(self, db_session: Session, test_manager: User):
        """Test getting project details when the project doesn't exist."""
        # Arrange
        service = ProjectService(db_session)
        current_user = CurrentUser(
            id=test_manager.id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
        
        # Act
        project_details = service.get_project_details(
            project_id=str(uuid.uuid4()),
            current_user=current_user
        )
        
        # Assert
        assert project_details is None
    
    def test_get_project_details_no_access_permission_error(self, db_session: Session, test_user: User):
        """Test getting project details for a project the user doesn't have access to."""
        # Arrange
        service = ProjectService(db_session)
        
        # Create a project with no tasks assigned to the user
        other_project = Project(
            name="Inaccessible Project",
            description="A project the user doesn't have access to",
            owner_id=uuid.uuid4()  # Random owner ID
        )
        db_session.add(other_project)
        db_session.commit()
        db_session.refresh(other_project)
        
        current_user = CurrentUser(
            id=test_user.id,
            email=test_user.email,
            username=test_user.username,
            full_name=test_user.full_name,
            role=test_user.role
        )
        
        # Act & Assert
        with pytest.raises(PermissionError):
            service.get_project_details(
                project_id=str(other_project.id),
                current_user=current_user
            ) 