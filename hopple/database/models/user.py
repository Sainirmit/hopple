"""
User model for Hopple.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from hopple.database.db_config import Base


class User(Base):
    """User model representing a user in Hopple."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # User skills and metadata
    skills = Column(ARRAY(String), default=list)
    skill_levels = Column(JSONB, default=dict)  # {"python": 5, "javascript": 3, ...}
    availability = Column(JSONB, default=dict)  # {"monday": [9, 17], ...}
    preferences = Column(JSONB, default=dict)
    
    # Relationships
    assigned_tasks = relationship("Task", back_populates="assigned_to")
    
    def __repr__(self) -> str:
        """String representation of the user."""
        return f"<User(id={self.id}, username={self.username})>"
    
    @property
    def task_count(self) -> int:
        """Get the count of tasks assigned to this user."""
        return len(self.assigned_tasks)
    
    @property
    def completed_task_count(self) -> int:
        """Get the count of completed tasks assigned to this user."""
        return sum(1 for task in self.assigned_tasks if task.is_completed)
    
    @property
    def current_workload(self) -> int:
        """Get the current workload (in estimated hours) for incomplete tasks."""
        return sum(task.estimated_effort for task in self.assigned_tasks if not task.is_completed)
    
    def has_skill(self, skill: str, min_level: int = 1) -> bool:
        """Check if the user has a specific skill at the minimum level."""
        if skill not in self.skills:
            return False
        return self.skill_levels.get(skill, 0) >= min_level
    
    def get_skill_level(self, skill: str) -> int:
        """Get the user's level for a specific skill."""
        if skill not in self.skills:
            return 0
        return self.skill_levels.get(skill, 0)
    
    def add_skill(self, skill: str, level: int = 1) -> None:
        """Add a skill to the user's skills."""
        if skill not in self.skills:
            self.skills.append(skill)
        self.skill_levels[skill] = level
