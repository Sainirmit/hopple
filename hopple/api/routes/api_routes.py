"""
API routes for Hopple.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import uuid

from hopple.database.db_config import get_db
from hopple.database.models.project import Project
from hopple.database.models.task import Task, TaskPriority, TaskStatus
from hopple.database.models.agent import Agent, AgentType, AgentStatus
from hopple.agents.base.project_manager_agent import ProjectManagerAgent
from loguru import logger

# Create router
router = APIRouter()


# --- Project Routes ---

@router.post("/projects/", response_model=Dict[str, Any])
async def create_project(project_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new project."""
    try:
        project = Project(
            name=project_data["name"],
            description=project_data.get("description", "")
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "is_active": project.is_active
        }
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error creating project: {str(e)}")


@router.get("/projects/", response_model=List[Dict[str, Any]])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects."""
    try:
        projects = db.query(Project).all()
        return [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "is_active": project.is_active,
                "task_count": project.task_count,
                "completion_percentage": project.completion_percentage
            }
            for project in projects
        ]
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching projects: {str(e)}")


@router.get("/projects/{project_id}", response_model=Dict[str, Any])
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get a project by ID."""
    try:
        project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
        
        return {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "is_active": project.is_active,
            "task_count": project.task_count,
            "completion_percentage": project.completion_percentage
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error fetching project: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching project: {str(e)}")


# --- Task Routes ---

@router.get("/projects/{project_id}/tasks", response_model=List[Dict[str, Any]])
async def get_project_tasks(project_id: str, db: Session = Depends(get_db)):
    """Get all tasks for a project."""
    try:
        tasks = db.query(Task).filter(Task.project_id == uuid.UUID(project_id)).all()
        return [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority.value,
                "status": task.status.value,
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
async def create_task(project_id: str, task_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new task for a project."""
    try:
        project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
        if not project:
            raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
        
        task = Task(
            title=task_data["title"],
            description=task_data.get("description", ""),
            priority=task_data.get("priority", TaskPriority.MEDIUM),
            status=task_data.get("status", TaskStatus.TODO),
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
            "priority": task.priority.value,
            "status": task.status.value,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "due_date": task.due_date,
            "estimated_effort": task.estimated_effort,
            "is_completed": task.is_completed
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error creating task: {str(e)}")


# --- Agent Routes ---

@router.post("/agents/pm/{project_id}/query", response_model=Dict[str, str])
async def query_pm_agent(project_id: str, query_data: Dict[str, str]):
    """Send a query to the Project Manager agent."""
    try:
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
async def get_agents(db: Session = Depends(get_db)):
    """Get all agents."""
    try:
        agents = db.query(Agent).all()
        return [
            {
                "id": str(agent.id),
                "name": agent.name,
                "agent_type": agent.agent_type,
                "model_name": agent.model_name,
                "status": agent.status,
                "created_at": agent.created_at,
                "updated_at": agent.updated_at,
                "last_active": agent.last_active,
                "task_count": agent.task_count,
                "success_rate": agent.success_rate
            }
            for agent in agents
        ]
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching agents: {str(e)}")
