"""
Tests for the database configuration.
"""

import pytest
from sqlalchemy.orm import Session

from hopple.database.db_config import get_db, db_session, Base
from hopple.database.models.project import Project
from hopple.database.models.task import Task, TaskPriority, TaskStatus
from hopple.database.models.user import User
from hopple.database.models.agent import Agent, AgentType, AgentStatus


class TestDatabaseConfig:
    """Tests for the database configuration."""
    
    def test_get_db(self, test_db_engine):
        """Test the get_db function."""
        # Get a database session
        db = next(get_db())
        
        # Check that the session is a Session instance
        assert isinstance(db, Session)
        
        # Close the session
        db.close()
    
    def test_db_session_context_manager(self, test_db_engine):
        """Test the db_session context manager."""
        # Use the context manager
        with db_session() as session:
            # Check that the session is a Session instance
            assert isinstance(session, Session)
    
    def test_project_model(self, test_db_session):
        """Test the Project model."""
        # Create a project
        project = Project(
            name="Test Project",
            description="A test project"
        )
        
        # Add the project to the database
        test_db_session.add(project)
        test_db_session.commit()
        
        # Retrieve the project from the database
        retrieved_project = test_db_session.query(Project).filter(Project.name == "Test Project").first()
        
        # Check that the project was retrieved correctly
        assert retrieved_project is not None
        assert retrieved_project.name == "Test Project"
        assert "A test project" in retrieved_project.description
    
    def test_task_model(self, test_db_session):
        """Test the Task model."""
        # Create a project
        project = Project(
            name="Test Project",
            description="A test project"
        )
        test_db_session.add(project)
        test_db_session.commit()
        
        # Create a task
        task = Task(
            title="Test Task",
            description="A test task",
            priority=TaskPriority.HIGH,
            status=TaskStatus.TODO,
            estimated_effort=4,
            project_id=project.id
        )
        
        # Add the task to the database
        test_db_session.add(task)
        test_db_session.commit()
        
        # Retrieve the task from the database
        retrieved_task = test_db_session.query(Task).filter(Task.title == "Test Task").first()
        
        # Check that the task was retrieved correctly
        assert retrieved_task is not None
        assert retrieved_task.title == "Test Task"
        assert retrieved_task.description == "A test task"
        assert retrieved_task.priority == TaskPriority.HIGH
        assert retrieved_task.status == TaskStatus.TODO
        assert retrieved_task.estimated_effort == 4
        assert retrieved_task.project_id == project.id
    
    def test_agent_model(self, test_db_session):
        """Test the Agent model."""
        # Create an agent
        agent = Agent(
            name="Test Agent",
            agent_type=AgentType.CUSTOM.value,
            model_name="test-model",
            status=AgentStatus.ACTIVE.value
        )
        
        # Add the agent to the database
        test_db_session.add(agent)
        test_db_session.commit()
        
        # Retrieve the agent from the database
        retrieved_agent = test_db_session.query(Agent).filter(Agent.name == "Test Agent").first()
        
        # Check that the agent was retrieved correctly
        assert retrieved_agent is not None
        assert retrieved_agent.name == "Test Agent"
        assert retrieved_agent.agent_type == AgentType.CUSTOM.value
        assert retrieved_agent.model_name == "test-model"
        assert retrieved_agent.status == AgentStatus.ACTIVE.value
