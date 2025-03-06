"""
Project model for Hopple.
"""

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from hopple.database.db_config import Base


class Project(Base):
    """Project model representing a project in Hopple."""
    
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the project."""
        return f"<Project(id={self.id}, name={self.name})>"
    
    @property
    def task_count(self) -> int:
        """Get the count of tasks in this project."""
        return len(self.tasks)
    
    @property
    def completed_task_count(self) -> int:
        """Get the count of completed tasks in this project."""
        return sum(1 for task in self.tasks if task.is_completed)
    
    @property
    def completion_percentage(self) -> float:
        """Get the completion percentage of the project."""
        if not self.tasks:
            return 0.0
        return (self.completed_task_count / self.task_count) * 100
