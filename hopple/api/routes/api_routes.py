"""
API routes for Hopple.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, cast
import uuid
from datetime import datetime

from hopple.database.db_config import get_db
from hopple.database.models.project import Project
from hopple.database.models.task import Task, TaskPriority, TaskStatus
from hopple.database.models.agent import Agent, AgentType, AgentStatus
from hopple.database.models.user import User, UserRole
from hopple.agents.base.project_manager_agent import ProjectManagerAgent
from hopple.services.project_service import ProjectService
from hopple.api.middlewares.auth import get_current_user, require_manager, require_authenticated
from hopple.api.dto.auth_dto import CurrentUser
from hopple.utils.logger import logger

# Create router
router = APIRouter()


# --- Project Routes ---

@router.post("/projects/", response_model=Dict[str, Any])
async def create_project(
    project_data: Dict[str, Any], 
    current_user: CurrentUser = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a new project.
    
    Only managers and admins can create projects.
    """
    try:
        project_service = ProjectService(db)
        project = project_service.create_project(project_data, current_user)
        
        return {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "is_active": project.is_active,
            "owner_id": str(project.owner_id) if project.owner_id else None
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error creating project: {str(e)}")


@router.get("/projects/", response_model=List[Dict[str, Any]])
async def get_projects(
    userId: Optional[str] = None, 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Get all projects accessible to the current user.
    
    Managers and admins can see all projects.
    Developers and viewers can only see projects they are assigned to.
    """
    try:
        project_service = ProjectService(db)
        
        # Override userId with current user if not specified
        user_id = userId if userId else str(current_user.id)
        
        # Check if user is requesting their own projects or has permission to see others
        if userId and userId != str(current_user.id) and current_user.role not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
            raise HTTPException(status_code=403, detail="You can only view your own projects")
        
        # Get projects
        projects = project_service.get_projects_for_user(
            user_id=user_id,
            role=current_user.role
        )
        
        return [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "is_active": project.is_active,
                "task_count": len(project.tasks) if hasattr(project, 'tasks') else 0,
                "completion_percentage": project.completion_percentage if hasattr(project, 'completion_percentage') else 0.0,
                "owner_id": str(project.owner_id) if project.owner_id else None
            }
            for project in projects
        ]
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching projects: {str(e)}")


@router.get("/projects/{project_id}", response_model=Dict[str, Any])
async def get_project(
    project_id: str, 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Get a project by ID if the user has access to it.
    """
    try:
        project_service = ProjectService(db)
        
        try:
            project_details = project_service.get_project_details(project_id, current_user)
            if not project_details:
                raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
            
            return project_details
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error fetching project: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching project: {str(e)}")


@router.put("/projects/{project_id}", response_model=Dict[str, Any])
async def update_project(
    project_id: str, 
    project_data: Dict[str, Any], 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Update a project if the user has permission.
    
    Admins and managers can update any project.
    Project owners can update their own projects.
    """
    try:
        project_service = ProjectService(db)
        
        try:
            project = project_service.update_project(project_id, project_data, current_user)
            if not project:
                raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
            
            return {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "is_active": project.is_active,
                "owner_id": str(project.owner_id) if project.owner_id else None
            }
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error updating project: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error updating project: {str(e)}")


@router.delete("/projects/{project_id}", response_model=Dict[str, bool])
async def delete_project(
    project_id: str, 
    current_user: CurrentUser = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Delete a project if the user has permission.
    
    Admins can delete any project.
    Managers can only delete their own projects.
    """
    try:
        project_service = ProjectService(db)
        
        try:
            result = project_service.delete_project(project_id, current_user)
            if not result:
                raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
            
            return {"success": True}
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error deleting project: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error deleting project: {str(e)}")


# --- Task Routes ---

@router.get("/projects/{project_id}/tasks", response_model=List[Dict[str, Any]])
async def get_project_tasks(
    project_id: str, 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """Get all tasks for a project if the user has access."""
    try:
        # Check if user has access to the project
        project_service = ProjectService(db)
        
        try:
            # This will raise PermissionError if user doesn't have access
            project_details = project_service.get_project_details(project_id, current_user)
            if not project_details:
                raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
        
        # Get tasks
        tasks = db.query(Task).filter(Task.project_id == uuid.UUID(project_id)).all()
        return [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "due_date": task.due_date,
                "estimated_effort": task.estimated_effort,
                "is_completed": task.is_completed,
                "assigned_to": str(task.assigned_to_id) if task.assigned_to_id else None
            }
            for task in tasks
        ]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching tasks: {str(e)}")


@router.post("/projects/{project_id}/tasks", response_model=Dict[str, Any])
async def create_task(
    project_id: str, 
    task_data: Dict[str, Any], 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Create a new task for a project if the user has permission.
    
    Admins and managers can create tasks for any project.
    Regular users cannot create tasks.
    """
    try:
        # Check if user has permission to create tasks
        if current_user.role not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
            raise HTTPException(
                status_code=403, 
                detail="Only managers and admins can create tasks"
            )
        
        # Check if project exists
        project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
        
        # Create task
        task = Task(
            title=task_data["title"],
            description=task_data.get("description", ""),
            priority=task_data.get("priority", TaskPriority.MEDIUM.value),
            status=task_data.get("status", TaskStatus.TODO.value),
            estimated_effort=task_data.get("estimated_effort", 0),
            due_date=task_data.get("due_date"),
            project_id=project.id,
            assigned_to_id=task_data.get("assigned_to_id")
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        return {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "due_date": task.due_date,
            "estimated_effort": task.estimated_effort,
            "is_completed": task.is_completed,
            "assigned_to": str(task.assigned_to_id) if task.assigned_to_id else None
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error creating task: {str(e)}")


@router.put("/projects/{project_id}/tasks/{task_id}", response_model=Dict[str, Any])
async def update_task(
    project_id: str, 
    task_id: str, 
    task_data: Dict[str, Any], 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """
    Update a task if the user has permission.
    
    Admins and managers can update any task.
    Regular users can only update task status and comments for tasks assigned to them.
    """
    try:
        # Get the task
        task = db.query(Task).filter(
            Task.id == uuid.UUID(task_id), 
            Task.project_id == uuid.UUID(project_id)
        ).first()
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found in project {project_id}")
        
        # Check permissions
        is_admin_or_manager = current_user.role in [UserRole.ADMIN.value, UserRole.MANAGER.value]
        is_assigned = task.assigned_to_id == current_user.id
        
        # Managers and admins can update any task
        # Regular users can only update tasks assigned to them, and only status/comments
        if not is_admin_or_manager and (not is_assigned or "title" in task_data or "description" in task_data):
            raise HTTPException(
                status_code=403, 
                detail="You don't have permission to update this task"
            )
        
        # Update fields based on permissions
        if is_admin_or_manager:
            # Full update for admins and managers
            if "title" in task_data:
                task.title = task_data["title"]
            
            if "description" in task_data:
                task.description = task_data["description"]
                
            if "priority" in task_data:
                task.priority = task_data["priority"]
                
            if "estimated_effort" in task_data:
                task.estimated_effort = task_data["estimated_effort"]
                
            if "due_date" in task_data:
                task.due_date = task_data["due_date"]
                
            if "assigned_to_id" in task_data:
                task.assigned_to_id = task_data["assigned_to_id"]
        
        # These fields can be updated by any authorized user
        if "status" in task_data:
            task.status = task_data["status"]
            
            # Update is_completed based on status
            task.is_completed = task_data["status"] == TaskStatus.DONE.value
            
        if "comments" in task_data:
            # Update comments in task metadata
            metadata: Dict[str, Any] = task.task_metadata or {}
            comments = metadata.get("comments", [])
            
            # Add new comment
            comments.append({
                "user_id": str(current_user.id),
                "username": current_user.username,
                "comment": task_data["comments"],
                "timestamp": datetime.utcnow().isoformat()
            })
            
            metadata["comments"] = comments
            task.task_metadata = metadata
        
        # Save changes
        db.commit()
        db.refresh(task)
        
        return {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "due_date": task.due_date,
            "estimated_effort": task.estimated_effort,
            "is_completed": task.is_completed,
            "assigned_to": str(task.assigned_to_id) if task.assigned_to_id else None,
            "metadata": task.task_metadata
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error updating task: {str(e)}")


# --- Agent Routes ---

@router.post("/agents/pm/{project_id}/query", response_model=Dict[str, str])
async def query_pm_agent(
    project_id: str, 
    query_data: Dict[str, str],
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """Send a query to the Project Manager agent."""
    try:
        # Check if project exists and user has access
        project_service = ProjectService(db)
        
        try:
            project_details = project_service.get_project_details(project_id, current_user)
            if not project_details:
                raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
        
        # Create a Project Manager Agent
        pm_agent = ProjectManagerAgent()
        
        # Run the agent with the provided query
        response = await pm_agent.run(uuid.UUID(project_id), query_data["query"])
        
        return {"response": response}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error querying PM agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.get("/agents", response_model=List[Dict[str, Any]])
async def get_agents(
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """Get all agents."""
    try:
        agents = db.query(Agent).all()
        result: List[Dict[str, Any]] = []
        
        for agent in agents:
            result.append({
                "id": str(agent.id),
                "name": agent.name,
                "type": agent.agent_type,
                "status": agent.status,
                "created_at": agent.created_at,
                "updated_at": agent.updated_at,
                "parent_agent_id": str(agent.parent_agent_id) if agent.parent_agent_id else None
            })
            
        return result
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching agents: {str(e)}")


@router.get("/agents/pm/{pm_agent_id}/sub-agents", response_model=Dict[str, Dict[str, List[Dict[str, Any]]]])
async def get_pm_sub_agents(
    pm_agent_id: str, 
    current_user: CurrentUser = Depends(require_authenticated),
    db: Session = Depends(get_db)
):
    """Get all sub-agents for a specific Project Manager agent."""
    try:
        # Convert string ID to UUID
        pm_uuid = uuid.UUID(pm_agent_id)
        
        # Verify PM agent exists
        pm_agent = db.query(Agent).filter(
            Agent.id == pm_uuid,
            Agent.agent_type == AgentType.PROJECT_MANAGER.value
        ).first()
        
        if not pm_agent:
            raise HTTPException(status_code=404, detail=f"PM Agent with ID {pm_agent_id} not found")
        
        # Get sub-agents
        sub_agents = db.query(Agent).filter(Agent.parent_agent_id == pm_uuid).all()
        
        # Group by agent type
        result: Dict[str, Dict[str, List[Dict[str, Any]]]] = {"subAgents": {}}
        for agent in sub_agents:
            agent_type = str(agent.agent_type)  # Convert to string to ensure it's a valid key
            if agent_type not in result["subAgents"]:
                result["subAgents"][agent_type] = []
            
            result["subAgents"][agent_type].append({
                "id": str(agent.id),
                "name": agent.name,
                "type": agent.agent_type,
                "status": agent.status,
                "created_at": agent.created_at,
                "updated_at": agent.updated_at
            })
        
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        logger.error(f"Error fetching sub-agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching sub-agents: {str(e)}")


@router.post("/agents/pm/{pm_agent_id}/terminate/{sub_agent_id}", response_model=Dict[str, str])
async def terminate_sub_agent(
    pm_agent_id: str, 
    sub_agent_id: str,
    current_user: CurrentUser = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Terminate a sub-agent.
    
    Only managers and admins can terminate agents.
    """
    try:
        # Convert string IDs to UUIDs
        pm_uuid = uuid.UUID(pm_agent_id)
        sub_uuid = uuid.UUID(sub_agent_id)
        
        # Verify PM agent exists
        pm_agent = db.query(Agent).filter(
            Agent.id == pm_uuid,
            Agent.agent_type == AgentType.PROJECT_MANAGER.value
        ).first()
        
        if not pm_agent:
            raise HTTPException(status_code=404, detail=f"PM Agent with ID {pm_agent_id} not found")
        
        # Verify sub-agent exists and belongs to the PM agent
        sub_agent = db.query(Agent).filter(
            Agent.id == sub_uuid,
            Agent.parent_agent_id == pm_uuid
        ).first()
        
        if not sub_agent:
            raise HTTPException(
                status_code=404, 
                detail=f"Sub-agent with ID {sub_agent_id} not found for PM Agent {pm_agent_id}"
            )
        
        # Update sub-agent status
        sub_agent.status = AgentStatus.TERMINATED.value
        db.commit()
        
        return {"message": f"Sub-agent {sub_agent_id} terminated successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")
    except Exception as e:
        logger.error(f"Error terminating sub-agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error terminating sub-agent: {str(e)}")
