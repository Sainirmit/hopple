"""
Unit tests for the task creator agent.
"""

import pytest
import json
import uuid
from unittest.mock import MagicMock, patch, AsyncMock
from sqlalchemy.orm import Session

from hopple.agents.task_creation.task_creator_agent import TaskCreatorAgent
from hopple.database.models.task import Task, TaskPriority, TaskStatus
from hopple.database.models.project import Project
from hopple.database.models.agent import AgentStatus


@pytest.mark.unit
@pytest.mark.agents
class TestTaskCreatorAgent:
    """Tests for the TaskCreatorAgent class."""
    
    @pytest.fixture
    def mock_response(self):
        """Fixture to create a mock response for the Ollama API."""
        mock_tasks = [
            {
                "title": "Task 1",
                "description": "Description for task 1",
                "priority": "HIGH",
                "estimated_effort": 4,
                "skills_required": ["Python", "FastAPI"],
                "dependencies": []
            },
            {
                "title": "Task 2",
                "description": "Description for task 2",
                "priority": "MEDIUM",
                "estimated_effort": 6,
                "skills_required": ["React", "TypeScript"],
                "dependencies": ["Task 1"]
            }
        ]
        return json.dumps(mock_tasks)
    
    @pytest.mark.asyncio
    async def test_run_with_valid_requirements(self, db_session: Session, test_project: Project, mock_response):
        """Test running the task creator agent with valid requirements."""
        # Arrange
        agent = TaskCreatorAgent()
        
        # Mock the _generate_tasks method to return a fixed response
        agent._generate_tasks = MagicMock(return_value=mock_response)
        agent.update_status = MagicMock()
        
        # Act
        tasks = await agent.run(test_project.id, "Create a web application with React frontend and FastAPI backend", db_session)
        
        # Assert
        assert len(tasks) == 2
        assert tasks[0]["title"] == "Task 1"
        assert tasks[0]["priority"] == "HIGH"
        assert "Python" in tasks[0]["skills_required"]
        assert tasks[1]["title"] == "Task 2"
        assert tasks[1]["priority"] == "MEDIUM"
        assert "React" in tasks[1]["skills_required"]
        
        # Verify tasks were saved to the database
        db_tasks = db_session.query(Task).filter(Task.project_id == test_project.id).all()
        assert len(db_tasks) == 2
        
        # Verify agent status was updated
        agent.update_status.assert_called_once_with(AgentStatus.SUCCESS)
    
    @pytest.mark.asyncio
    async def test_run_with_empty_requirements(self, db_session: Session, test_project: Project):
        """Test running the task creator agent with empty requirements."""
        # Arrange
        agent = TaskCreatorAgent()
        agent.update_status = MagicMock()
        
        # Act
        tasks = await agent.run(test_project.id, "", db_session)
        
        # Assert
        assert len(tasks) == 0
        
        # Verify no tasks were saved to the database
        db_tasks = db_session.query(Task).filter(Task.project_id == test_project.id).all()
        assert len(db_tasks) == 0
        
        # Verify agent status was not updated (early return)
        agent.update_status.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_run_with_invalid_project(self, db_session: Session):
        """Test running the task creator agent with an invalid project ID."""
        # Arrange
        agent = TaskCreatorAgent()
        agent.update_status = MagicMock()
        
        # Act
        tasks = await agent.run(uuid.uuid4(), "Create some tasks", db_session)
        
        # Assert
        assert len(tasks) == 0
        
        # Verify agent status was not updated (project not found)
        agent.update_status.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_run_with_invalid_json_response(self, db_session: Session, test_project: Project):
        """Test running the task creator agent with an invalid JSON response."""
        # Arrange
        agent = TaskCreatorAgent()
        
        # Mock the _generate_tasks method to return an invalid JSON string
        agent._generate_tasks = MagicMock(return_value="This is not JSON")
        agent.update_status = MagicMock()
        
        # Act
        tasks = await agent.run(test_project.id, "Create some tasks", db_session)
        
        # Assert
        assert len(tasks) == 0
        
        # Verify agent status was updated to FAILED
        agent.update_status.assert_called_once_with(AgentStatus.FAILED)
    
    @pytest.mark.asyncio
    async def test_create_tasks_in_db(self, db_session: Session, test_project: Project):
        """Test creating tasks in the database."""
        # Arrange
        agent = TaskCreatorAgent()
        validated_tasks = [
            {
                "title": "Database Task",
                "description": "Set up the database",
                "priority": "HIGH",
                "estimated_effort": 4,
                "skills_required": ["SQL", "PostgreSQL"],
                "dependencies": []
            },
            {
                "title": "API Task",
                "description": "Create REST API endpoints",
                "priority": "MEDIUM",
                "estimated_effort": 6,
                "skills_required": ["FastAPI", "Python"],
                "dependencies": ["Database Task"]
            }
        ]
        
        # Act
        created_tasks = agent._create_tasks_in_db(db_session, test_project.id, validated_tasks, [])
        
        # Assert
        assert len(created_tasks) == 2
        assert created_tasks[0]["title"] == "Database Task"
        assert created_tasks[1]["title"] == "API Task"
        
        # Verify tasks were saved to the database
        db_tasks = db_session.query(Task).filter(Task.project_id == test_project.id).all()
        assert len(db_tasks) == 2
        assert any(task.title == "Database Task" for task in db_tasks)
        assert any(task.title == "API Task" for task in db_tasks)
    
    def test_generate_tasks_formats_prompt_correctly(self, monkeypatch):
        """Test that _generate_tasks formats the prompt correctly."""
        # Arrange
        agent = TaskCreatorAgent()
        
        # Mock the _call_ollama_api method to capture the prompt
        captured_prompt = None
        
        def mock_call_ollama_api(prompt):
            nonlocal captured_prompt
            captured_prompt = prompt
            return "[]"
        
        monkeypatch.setattr(agent, "_call_ollama_api", mock_call_ollama_api)
        
        # Act
        agent._generate_tasks("Create a RESTful API")
        
        # Assert
        assert "Create a RESTful API" in captured_prompt
    
    @patch("requests.post")
    def test_call_ollama_api(self, mock_post, monkeypatch):
        """Test calling the Ollama API."""
        # Arrange
        agent = TaskCreatorAgent()
        
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"response": '[{"title": "API Task", "description": "Create API", "priority": "HIGH", "estimated_effort": 4, "skills_required": ["FastAPI"], "dependencies": []}]'}
        mock_post.return_value = mock_response
        
        # Act
        result = agent._call_ollama_api("Create an API")
        
        # Assert
        assert "API Task" in result
        assert mock_post.called 