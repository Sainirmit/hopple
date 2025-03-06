"""
Project model for Hopple.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from hopple.database.db_config import Base


class ProjectStatus(str, Enum):
    """Status of a project."""
    
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Project(Base):
    """Project model representing a project in Hopple."""
    
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default=ProjectStatus.PLANNING.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    project_metadata = Column(JSONB, default=dict)
    
    # Foreign keys
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="owned_projects")
    tasks = relationship("Task", back_populates="project")
    
    def __repr__(self) -> str:
        """String representation of the project."""
        return f"<Project(id={self.id}, name={self.name}, status={self.status})>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if the project is overdue."""
        if not self.end_date:
            return False
        result = self.end_date < datetime.utcnow() and self.status != ProjectStatus.COMPLETED.value
        return bool(result)
    
    @property
    def days_until_due(self) -> Optional[int]:
        """Get the number of days until the project is due."""
        if not self.end_date:
            return None
        return (self.end_date - datetime.utcnow()).days
    
    @property
    def completion_percentage(self) -> float:
        """Calculate the completion percentage of the project."""
        if not self.tasks:
            return 0.0
        completed_tasks = sum(1 for task in self.tasks if task.is_completed)
        result = (completed_tasks / len(self.tasks)) * 100
        return float(result)
