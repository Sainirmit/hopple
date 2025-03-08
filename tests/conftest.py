"""
Pytest fixtures and configuration for testing.
"""

import os
import uuid
import asyncio
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from typing import Generator, Dict, Any, Iterator

from hopple.database.db_config import Base, get_db
from hopple.database.models.user import User, UserRole
from hopple.database.models.project import Project
from hopple.database.models.task import Task, TaskStatus, TaskPriority
from hopple.database.models.agent import Agent, AgentType, AgentStatus
from hopple.api.app import app
from hopple.api.dto.auth_dto import CurrentUser
from hopple.config.config import get_settings

# Use an in-memory SQLite database for testing
TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def test_engine():
    """Create a SQLAlchemy engine for testing."""
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """Create a new database session for a test."""
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()

@pytest.fixture(scope="function")
def client(db_session) -> Iterator[TestClient]:
    """Create a FastAPI TestClient with overridden dependencies."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session) -> User:
    """Create a test user for testing."""
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        role=UserRole.DEVELOPER.value,
        skills={"python": 1, "fastapi": 1},
        preferences={"notifications": {"email": True, "inApp": True}},
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_manager(db_session) -> User:
    """Create a test manager for testing."""
    manager = User(
        email="manager@example.com",
        username="manager",
        full_name="Test Manager",
        role=UserRole.MANAGER.value,
        skills={"management": 1, "leadership": 1},
        preferences={"notifications": {"email": True, "inApp": True}},
        is_active=True
    )
    db_session.add(manager)
    db_session.commit()
    db_session.refresh(manager)
    return manager

@pytest.fixture(scope="function")
def test_admin(db_session) -> User:
    """Create a test admin for testing."""
    admin = User(
        email="admin@example.com",
        username="admin",
        full_name="Admin User",
        role=UserRole.ADMIN.value,
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture(scope="function")
def test_project(db_session, test_manager) -> Project:
    """Create a test project for testing."""
    project = Project(
        name="Test Project",
        description="A test project",
        owner_id=test_manager.id
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project

@pytest.fixture(scope="function")
def test_tasks(db_session, test_project, test_user) -> list[Task]:
    """Create test tasks for testing."""
    tasks = []
    for i in range(3):
        task = Task(
            title=f"Test Task {i+1}",
            description=f"Description for test task {i+1}",
            project_id=test_project.id,
            status=TaskStatus.TODO.value,
            priority=TaskPriority.MEDIUM.value,
            estimated_effort=4,
            assigned_to_id=test_user.id if i % 2 == 0 else None,
            is_completed=False
        )
        db_session.add(task)
        tasks.append(task)
    
    db_session.commit()
    for task in tasks:
        db_session.refresh(task)
    
    return tasks

@pytest.fixture(scope="function")
def test_agent(db_session) -> Agent:
    """Create a test agent for testing."""
    agent = Agent(
        name="Test PM Agent",
        agent_type=AgentType.PROJECT_MANAGER.value,
        status=AgentStatus.ACTIVE.value,
    )
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    return agent

@pytest.fixture(scope="function")
def mock_auth(monkeypatch, test_user):
    """Mock authentication for API testing."""
    user_id = test_user.id
    
    async def mock_get_current_user(*args, **kwargs):
        return CurrentUser(
            id=user_id,
            email=test_user.email,
            username=test_user.username,
            full_name=test_user.full_name,
            role=test_user.role
        )
    
    # This will be used to override the dependency in FastAPI
    return mock_get_current_user

@pytest.fixture(scope="function")
def mock_manager_auth(monkeypatch, test_manager):
    """Mock authentication as manager for API testing."""
    manager_id = test_manager.id
    
    async def mock_get_current_user(*args, **kwargs):
        return CurrentUser(
            id=manager_id,
            email=test_manager.email,
            username=test_manager.username,
            full_name=test_manager.full_name,
            role=test_manager.role
        )
    
    # This will be used to override the dependency in FastAPI
    return mock_get_current_user

@pytest.fixture(scope="function")
def mock_admin_auth(monkeypatch, test_admin):
    """Mock authentication as admin for API testing."""
    admin_id = test_admin.id
    
    async def mock_get_current_user(*args, **kwargs):
        return CurrentUser(
            id=admin_id,
            email=test_admin.email,
            username=test_admin.username,
            full_name=test_admin.full_name,
            role=test_admin.role
        )
    
    # This will be used to override the dependency in FastAPI
    return mock_get_current_user
