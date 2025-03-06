"""
Tests for the Task Creator Agent.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from langchain.schema import Generation, LLMResult

from hopple.agents.task_creation.task_creator_agent import TaskCreatorAgent
from hopple.database.models.task import Task, TaskPriority, TaskStatus, TaskDependency
from hopple.database.models.agent import AgentType, AgentStatus
from hopple.database.models.project import Project, ProjectStatus


@pytest.fixture
def task_creator_agent():
    """Create a TaskCreatorAgent instance for testing."""
    with patch('hopple.agents.base.base_agent.BaseAgent._initialize_db_agent'):
        agent = TaskCreatorAgent(
            name="Test Task Creator",
            model_name="test-model"
        )
        # Set a test DB ID manually
        agent.db_id = uuid.uuid4()
        
        # Mock the update_metrics and sleep methods
        agent.update_metrics = MagicMock()
        agent.sleep = MagicMock()
        
        return agent


@pytest.fixture
def mock_llm_response():
    """Create a mock LLM response with task data."""
    return LLMResult(
        generations=[[Generation(text='''[
            {
                "title": "Set up project infrastructure",
                "description": "Initialize the project repository and set up basic infrastructure",
                "estimated_effort": 4,
                "priority": "HIGH",
                "skills": ["devops", "git"],
                "dependencies": []
            },
            {
                "title": "Design database schema",
                "description": "Create the initial database schema based on requirements",
                "estimated_effort": 6,
                "priority": "HIGH",
                "skills": ["database", "sql"],
                "dependencies": ["Set up project infrastructure"]
            },
            {
                "title": "Implement user authentication",
                "description": "Create user authentication system with JWT",
                "estimated_effort": 8,
                "priority": "MEDIUM",
                "skills": ["security", "backend"],
                "dependencies": ["Design database schema"]
            }
        ]''')]],
        llm_output=None
    )


@pytest.mark.asyncio
async def test_task_creator_agent_run(task_creator_agent, mock_llm_response):
    """Test the run method of TaskCreatorAgent."""
    # Mock the LLM
    task_creator_agent.llm = AsyncMock()
    task_creator_agent.llm.agenerate.return_value = mock_llm_response
    
    # Create a test project
    project_id = uuid.uuid4()
    project = Project(
        id=project_id,
        name="Test Project",
        description="A test project",
        status=ProjectStatus.PLANNING.value
    )
    
    # Test requirements
    requirements = """
    Create a web application with:
    1. User authentication system
    2. Database integration
    3. Basic project setup
    """
    
    # Run the agent
    with patch('hopple.database.db_config.db_session') as mock_session:
        # Set up the mock session
        session_instance = MagicMock()
        mock_session.return_value.__enter__.return_value = session_instance
        
        # Mock the project query
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = project
        mock_query.filter.return_value = mock_filter
        session_instance.query.return_value = mock_query
        
        # Run the agent
        tasks = await task_creator_agent.run(project_id, requirements, session=session_instance)
        
        # Verify tasks were created
        assert len(tasks) == 3
        assert tasks[0]["title"] == "Set up project infrastructure"
        assert tasks[1]["title"] == "Design database schema"
        assert tasks[2]["title"] == "Implement user authentication"
        
        # Verify database interactions
        assert session_instance.add.call_count == 5  # 3 tasks + 2 dependencies
        assert session_instance.commit.call_count == 1
        
        # Verify task properties
        task_calls = [call for call in session_instance.add.call_args_list 
                     if isinstance(call.args[0], Task)]
        assert len(task_calls) == 3
        
        # Verify dependencies
        dep_calls = [call for call in session_instance.add.call_args_list 
                    if isinstance(call.args[0], TaskDependency)]
        assert len(dep_calls) == 2


@pytest.mark.asyncio
async def test_task_creator_agent_invalid_response(task_creator_agent):
    """Test the TaskCreatorAgent's handling of invalid LLM responses."""
    # Mock the LLM with invalid JSON response
    task_creator_agent.llm = AsyncMock()
    task_creator_agent.llm.agenerate.return_value = LLMResult(
        generations=[[Generation(text="Invalid JSON")]],
        llm_output=None
    )
    
    # Create a test project ID
    project_id = uuid.uuid4()
    
    # Test requirements
    requirements = "Test requirements"
    
    # Run the agent and expect an exception
    with pytest.raises(Exception):
        await task_creator_agent.run(project_id, requirements)


@pytest.mark.asyncio
async def test_task_creator_agent_missing_fields(task_creator_agent):
    """Test the TaskCreatorAgent's handling of responses with missing fields."""
    # Mock the LLM with response missing required fields
    task_creator_agent.llm = AsyncMock()
    task_creator_agent.llm.agenerate.return_value = LLMResult(
        generations=[[Generation(text='''[
            {
                "title": "Test Task",
                "description": "Test Description"
            }
        ]''')]],
        llm_output=None
    )
    
    # Create a test project
    project_id = uuid.uuid4()
    project = Project(
        id=project_id,
        name="Test Project",
        description="A test project",
        status=ProjectStatus.PLANNING.value
    )
    
    # Test requirements
    requirements = "Test requirements"
    
    # Run the agent
    with patch('hopple.database.db_config.db_session') as mock_session:
        # Set up the mock session
        session_instance = MagicMock()
        mock_session.return_value.__enter__.return_value = session_instance
        
        # Mock the project query
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = project
        mock_query.filter.return_value = mock_filter
        session_instance.query.return_value = mock_query
        
        # Run the agent and expect empty task list
        tasks = await task_creator_agent.run(project_id, requirements, session=session_instance)
        assert len(tasks) == 0
        
        # Verify no database interactions
        assert session_instance.add.call_count == 0
        assert session_instance.commit.call_count == 1 