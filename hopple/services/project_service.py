"""
Project service for Hopple.

This module provides service methods for project management operations.
"""

from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from hopple.database.models.project import Project
from hopple.database.models.task import Task
from hopple.database.models.user import User, UserRole
from hopple.services.base_service import BaseService
from hopple.api.dto.auth_dto import CurrentUser
from hopple.utils.logger import logger


class ProjectService(BaseService[Project, Any, Any]):
    """
    Project service for managing project operations.
    
    This service implements business logic for project management,
    including creating, updating, and retrieving projects.
    """
    
    def __init__(self, db: Session):
        """Initialize the project service."""
        super().__init__(Project, db)
    
    def get_projects_for_user(self, user_id: Union[str, uuid.UUID], role: str) -> List[Project]:
        """
        Get projects for a specific user based on their role.
        
        Args:
            user_id: The user ID
            role: The user's role
            
        Returns:
            List of projects accessible to the user
        """
        # Convert to UUID if string
        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                logger.error(f"Invalid user ID format: {user_id}")
                return []
        
        # Managers and admins can see all projects
        if role in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
            return self.db.query(Project).all()
        
        # Developers and viewers can only see their assigned projects
        return self.db.query(Project).filter(
            Project.tasks.any(Task.assigned_to_id == user_id)
        ).all()
    
    def create_project(self, project_data: Dict[str, Any], current_user: CurrentUser) -> Project:
        """
        Create a new project.
        
        Args:
            project_data: Project data
            current_user: The current user
            
        Returns:
            The created project
        """
        # Only managers and admins can create projects
        if current_user.role not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
            raise PermissionError("Only managers and admins can create projects")
        
        # Create project data
        project = Project(
            name=project_data["name"],
            description=project_data.get("description", ""),
            owner_id=current_user.id,
            start_date=project_data.get("start_date"),
            end_date=project_data.get("end_date"),
            status=project_data.get("status", "planning"),
            project_metadata=project_data.get("metadata", {})
        )
        
        # Save to database
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        
        return project
    
    def update_project(
        self, project_id: Union[str, uuid.UUID], 
        project_data: Dict[str, Any], 
        current_user: CurrentUser
    ) -> Optional[Project]:
        """
        Update an existing project.
        
        Args:
            project_id: The project ID
            project_data: Project data to update
            current_user: The current user
            
        Returns:
            The updated project if successful, None otherwise
        """
        # Get project
        project = self.get_by_id(project_id)
        if not project:
            return None
        
        # Check permissions
        if current_user.role not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
            # Regular users can't update projects
            if str(project.owner_id) != str(current_user.id):
                raise PermissionError("You don't have permission to update this project")
        
        # Update fields
        if "name" in project_data:
            project.name = project_data["name"]
        
        if "description" in project_data:
            project.description = project_data["description"]
        
        if "start_date" in project_data:
            project.start_date = project_data["start_date"]
        
        if "end_date" in project_data:
            project.end_date = project_data["end_date"]
        
        if "status" in project_data:
            project.status = project_data["status"]
        
        if "metadata" in project_data:
            project.project_metadata = project_data["metadata"]
        
        # Update timestamp
        project.updated_at = datetime.utcnow()
        
        # Save changes
        self.db.commit()
        self.db.refresh(project)
        
        return project
    
    def delete_project(
        self, project_id: Union[str, uuid.UUID], 
        current_user: CurrentUser
    ) -> bool:
        """
        Delete a project.
        
        Args:
            project_id: The project ID
            current_user: The current user
            
        Returns:
            True if deleted, False otherwise
        """
        # Get project
        project = self.get_by_id(project_id)
        if not project:
            return False
        
        # Check permissions
        if current_user.role not in [UserRole.ADMIN.value]:
            if current_user.role == UserRole.MANAGER.value:
                # Managers can only delete their own projects
                if str(project.owner_id) != str(current_user.id):
                    raise PermissionError("You don't have permission to delete this project")
            else:
                # Regular users can't delete projects
                raise PermissionError("Only managers and admins can delete projects")
        
        # Delete project
        self.db.delete(project)
        self.db.commit()
        
        return True
    
    def get_project_details(
        self, project_id: Union[str, uuid.UUID], 
        current_user: CurrentUser
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed project information.
        
        Args:
            project_id: The project ID
            current_user: The current user
            
        Returns:
            Project details if accessible, None otherwise
        """
        # Get project
        project = self.get_by_id(project_id)
        if not project:
            return None
        
        # Check if user has access to this project
        has_access = False
        
        # Admins and managers have access to all projects
        if current_user.role in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
            has_access = True
        else:
            # Check if user is assigned to any task in the project
            for task in project.tasks:
                if task.assigned_to_id == current_user.id:
                    has_access = True
                    break
        
        if not has_access:
            raise PermissionError("You don't have access to this project")
        
        # Get project owner
        owner = self.db.query(User).filter(User.id == project.owner_id).first()
        
        # Get project details
        return {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "owner": {
                "id": str(owner.id) if owner else None,
                "name": owner.full_name if owner else None,
                "email": owner.email if owner else None
            },
            "is_overdue": project.is_overdue,
            "days_until_due": project.days_until_due,
            "completion_percentage": project.completion_percentage,
            "task_count": len(project.tasks),
            "metadata": project.project_metadata
        } 