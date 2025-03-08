"""
Agent model for Hopple.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Dict, Any, List, Optional, Union, cast
from decimal import Decimal

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql.elements import ColumnElement

from hopple.database.db_config import Base


class AgentType(str, Enum):
    """Type of an agent."""
    
    PROJECT_MANAGER = "project_manager"
    TASK_CREATOR = "task_creator"
    PRIORITIZER = "prioritizer"
    WORKER_ASSIGNMENT = "worker_assignment"
    MEETING_SUMMARIZER = "meeting_summarizer"
    CODE_REVIEWER = "code_reviewer"


class AgentRole(str, Enum):
    """Role of an agent."""
    
    PROJECT_MANAGER = "project_manager"
    TASK_CREATOR = "task_creator"
    PRIORITIZER = "prioritizer"
    WORKER_ASSIGNMENT = "worker_assignment"
    MEETING_SUMMARIZER = "meeting_summarizer"
    CODE_REVIEWER = "code_reviewer"


class AgentStatus(str, Enum):
    """Status of an agent."""
    
    ACTIVE = "active"
    SLEEPING = "sleeping"
    TERMINATED = "terminated"
    SUCCESS = "success"
    FAILED = "failed"


class Agent(Base):
    """Agent model representing an AI agent in Hopple."""
    
    __tablename__ = "agents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    agent_type = Column(String(50), nullable=False)
    model_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default=AgentStatus.ACTIVE.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    last_message = Column(Text, nullable=True)
    
    # Configuration and state data
    configuration = Column(JSONB, default=dict)
    state = Column(JSONB, default=dict)
    cache = Column(JSONB, default=dict)
    
    # Performance metrics
    task_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    
    # Foreign keys
    parent_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=True)
    
    # Relationships
    created_tasks = relationship("Task", back_populates="created_by_agent")
    child_agents = relationship(
        "Agent",
        backref="parent_agent",
        remote_side=[id],
        cascade="all"
    )
    parent_agent = relationship('Agent', remote_side=[id], backref='sub_agents')
    
    def __repr__(self) -> str:
        """String representation of the agent."""
        return f"<Agent(id={self.id}, name={self.name}, type={self.agent_type}, status={self.status})>"
    
    @property
    def success_rate(self) -> float:
        """Calculate the success rate of the agent."""
        if self.task_count == 0:
            return 0.0
        result = (self.success_count / self.task_count) * 100
        return float(result)
    
    def update_status(self, status: AgentStatus) -> None:
        """Update the agent's status."""
        self.status = status.value
        self.updated_at = datetime.utcnow()
        
        if status == AgentStatus.ACTIVE:
            self.last_active = datetime.utcnow()
    
    def update_metrics(self, success: bool = True) -> None:
        """Update the agent's performance metrics."""
        task_count_val = self.task_count + 1
        self.task_count = task_count_val
        
        if success:
            success_count_val = self.success_count + 1
            self.success_count = success_count_val
        else:
            error_count_val = self.error_count + 1
            self.error_count = error_count_val
    
    def update_cache(self, key: str, value: Any) -> None:
        """Update the agent's cache with a key-value pair."""
        if not self.cache:
            cache_dict: Dict[str, Any] = {}
            self.cache = cache_dict
        self.cache[key] = value
    
    def get_cache(self, key: str, default: Any = None) -> Any:
        """Get a value from the agent's cache."""
        if not self.cache:
            return default
        return self.cache.get(key, default)
    
    def clear_cache(self) -> None:
        """Clear the agent's cache."""
        cache_dict: Dict[str, Any] = {}
        self.cache = cache_dict
    
    @property
    def is_active(self) -> bool:
        """Get if the agent is active."""
        return self.status == AgentStatus.ACTIVE.value
    
    @property
    def is_sleeping(self) -> bool:
        """Get if the agent is sleeping."""
        return self.status == AgentStatus.SLEEPING.value
    
    @property
    def is_terminated(self) -> bool:
        """Get if the agent is terminated."""
        return self.status == AgentStatus.TERMINATED.value
    
    @property
    def is_root_agent(self) -> bool:
        """Get if the agent is a root agent (has no parent)."""
        return self.parent_agent_id is None
    
    @property
    def has_sub_agents(self) -> bool:
        """Get if the agent has sub-agents."""
        return len(self.sub_agents) > 0
    
    @property
    def sub_agent_count(self) -> int:
        """Get the count of sub-agents for this agent."""
        result = len(self.sub_agents)
        return result
    
    @property
    def active_sub_agent_count(self) -> int:
        """Get the count of active sub-agents for this agent."""
        result = sum(1 for agent in self.sub_agents if agent.is_active)
        return result
