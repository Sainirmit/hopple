"""
Task model for Hopple.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List, Union, cast

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql.elements import ColumnElement

from hopple.database.db_config import Base


class TaskPriority(str, Enum):
    """Enum for task priorities."""
    
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    """Enum for task statuses."""
    
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Task(Base):
    """Task model representing a task in Hopple."""
    
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority: Column = Column(SQLAEnum(TaskPriority), default=TaskPriority.MEDIUM)
    status: Column = Column(SQLAEnum(TaskStatus), default=TaskStatus.TODO)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    estimated_effort = Column(Integer, default=0)  # In hours
    actual_effort = Column(Integer, default=0)  # In hours
    is_completed = Column(Boolean, default=False)
    task_metadata = Column(JSONB, default=dict)
    
    # Foreign keys
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_to = relationship("User", back_populates="assigned_tasks")
    created_by_agent = relationship("Agent", back_populates="created_tasks")
    dependencies = relationship(
        "TaskDependency",
        primaryjoin="Task.id == TaskDependency.task_id",
        back_populates="task",
        cascade="all, delete-orphan"
    )
    dependent_tasks = relationship(
        "TaskDependency",
        primaryjoin="Task.id == TaskDependency.depends_on_id",
        back_populates="depends_on",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation of the task."""
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if the task is overdue."""
        if not self.due_date:
            return False
        result = self.due_date < datetime.utcnow() and not self.is_completed
        return bool(result)
    
    @property
    def days_until_due(self) -> Optional[int]:
        """Get the number of days until the task is due."""
        if not self.due_date:
            return None
        return (self.due_date - datetime.utcnow()).days
    
    @property
    def effort_variance(self) -> int:
        """Get the variance between estimated and actual effort."""
        if self.estimated_effort == 0:
            return 0
        result = self.actual_effort - self.estimated_effort
        return cast(int, result)


class TaskDependency(Base):
    """Model representing dependencies between tasks."""
    
    __tablename__ = "task_dependencies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    depends_on_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("Task", foreign_keys=[task_id], back_populates="dependencies")
    depends_on = relationship("Task", foreign_keys=[depends_on_id], back_populates="dependent_tasks")
    
    def __repr__(self) -> str:
        """String representation of the task dependency."""
        return f"<TaskDependency(task_id={self.task_id}, depends_on_id={self.depends_on_id})>"
