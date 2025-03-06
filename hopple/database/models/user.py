"""
User model for Hopple.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from hopple.database.db_config import Base


class UserRole(str, Enum):
    """Role of a user."""
    
    ADMIN = "admin"
    MANAGER = "manager"
    DEVELOPER = "developer"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    """Status of a user."""
    
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class User(Base):
    """User model representing a user in Hopple."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default=UserRole.DEVELOPER.value)
    status = Column(String(50), default=UserStatus.ACTIVE.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    user_metadata = Column(JSONB, default=dict)
    
    # User skills and metadata
    skills = Column(JSONB, default=dict)  # {"python": 5, "javascript": 3, ...}
    skill_levels = Column(JSONB, default=dict)  # {"python": 5, "javascript": 3, ...}
    availability = Column(JSONB, default=dict)  # {"monday": [9, 17], ...}
    preferences = Column(JSONB, default=dict)
    
    # Relationships
    owned_projects = relationship("Project", back_populates="owner")
    assigned_tasks = relationship("Task", back_populates="assigned_to")
    
    def __repr__(self) -> str:
        """String representation of the user."""
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
    
    @property
    def active_tasks_count(self) -> int:
        """Get the count of active tasks assigned to the user."""
        return sum(1 for task in self.assigned_tasks if not task.is_completed)
    
    @property
    def completed_tasks_count(self) -> int:
        """Get the count of completed tasks by the user."""
        return sum(1 for task in self.assigned_tasks if task.is_completed)
    
    @property
    def completion_rate(self) -> float:
        """Calculate the task completion rate of the user."""
        if not self.assigned_tasks:
            return 0.0
        result = (self.completed_tasks_count / len(self.assigned_tasks)) * 100
        return float(result)
    
    @property
    def task_count(self) -> int:
        """Get the count of tasks assigned to this user."""
        return len(self.assigned_tasks)
    
    @property
    def current_workload(self) -> int:
        """Get the current workload (in estimated hours) for incomplete tasks."""
        return sum(task.estimated_effort for task in self.assigned_tasks if not task.is_completed)
    
    def has_skill(self, skill: str, min_level: int = 1) -> bool:
        """Check if the user has a specific skill at the minimum level."""
        if skill not in self.skills:
            return False
        result = self.skill_levels.get(skill, 0) >= min_level
        return bool(result)
    
    def get_skill_level(self, skill: str) -> int:
        """Get the user's level for a specific skill."""
        if skill not in self.skills:
            return 0
        result = self.skill_levels.get(skill, 0)
        return result
    
    def add_skill(self, skill: str, level: int = 1) -> None:
        """Add a skill to the user's skills."""
        if skill not in self.skills:
            self.skills[skill] = level
        else:
            self.skill_levels[skill] = max(self.skill_levels.get(skill, 0), level)
