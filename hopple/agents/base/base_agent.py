"""
Base Agent class for Hopple.

This module provides a base class for all agents in the Hopple system.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import json

from sqlalchemy.orm import Session

from hopple.database.models.agent import Agent as AgentModel, AgentType, AgentStatus, AgentRole
from hopple.database.db_config import db_session
from hopple.utils.logger import logger


class BaseAgent:
    """
    Base Agent class for all agents in Hopple.
    
    This class provides common functionality for all agents, including:
    - Database integration
    - Status tracking
    - Metrics collection
    - Message history
    """
    
    def __init__(
        self,
        name: str,
        agent_type: AgentType,
        agent_role: AgentRole = AgentRole.ASSISTANT,
        parent_agent_id: Optional[uuid.UUID] = None,
        **kwargs
    ):
        """
        Initialize the base agent.
        
        Args:
            name: The name of the agent
            agent_type: The type of agent
            agent_role: The role of the agent
            parent_agent_id: The ID of the parent agent, if any
            **kwargs: Additional keyword arguments
        """
        self.name = name
        self.agent_type = agent_type
        self.agent_role = agent_role
        self.parent_agent_id = parent_agent_id
        self.status = AgentStatus.ACTIVE
        self.messages: List[Dict[str, str]] = []
        
        # Save agent to database
        self._save_to_db()
        
        logger.info(f"Agent {self.name} initialized with ID: {self.db_id}")
    
    def _save_to_db(self) -> None:
        """Save the agent to the database."""
        try:
            with db_session() as session:
                agent = AgentModel(
                    name=self.name,
                    agent_type=self.agent_type.value,
                    agent_role=self.agent_role.value,
                    parent_agent_id=self.parent_agent_id,
                    status=self.status.value,
                    last_active=datetime.utcnow()
                )
                session.add(agent)
                session.commit()
                session.refresh(agent)
                self.db_id = agent.id
        except Exception as e:
            logger.error(f"Error saving agent to database: {str(e)}")
            self.db_id = None
    
    def update_status(self, status: AgentStatus) -> None:
        """
        Update the agent's status.
        
        Args:
            status: The new status
        """
        self.status = status
        
        try:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent:
                    agent.status = status.value
                    agent.last_active = datetime.utcnow()
                    session.commit()
        except Exception as e:
            logger.error(f"Error updating agent status: {str(e)}")
    
    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to the conversation history.
        
        Args:
            role: The role of the message sender (system, human, or ai)
            content: The content of the message
        """
        self.messages.append({"role": role, "content": content})
    
    def get_messages(self) -> List[Dict[str, str]]:
        """
        Get the conversation history.
        
        Returns:
            A list of messages in the conversation
        """
        return self.messages
    
    def update_metrics(self, success: bool = True) -> None:
        """
        Update agent metrics.
        
        Args:
            success: Whether the agent operation was successful
        """
        try:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent:
                    metrics = agent.metrics or {}
                    
                    # Update total runs
                    metrics["total_runs"] = metrics.get("total_runs", 0) + 1
                    
                    # Update success/failure counts
                    if success:
                        metrics["successful_runs"] = metrics.get("successful_runs", 0) + 1
                    else:
                        metrics["failed_runs"] = metrics.get("failed_runs", 0) + 1
                    
                    # Calculate success rate
                    total = metrics.get("total_runs", 0)
                    if total > 0:
                        metrics["success_rate"] = metrics.get("successful_runs", 0) / total
                    
                    # Update last run timestamp
                    metrics["last_run"] = datetime.utcnow().isoformat()
                    
                    agent.metrics = metrics
                    session.commit()
        except Exception as e:
            logger.error(f"Error updating agent metrics: {str(e)}")
    
    def sleep(self) -> None:
        """Put the agent to sleep (mark as inactive)."""
        self.update_status(AgentStatus.SLEEPING)
        logger.info(f"Agent {self.name} is now sleeping")
    
    def wake(self) -> None:
        """Wake up the agent (mark as active)."""
        self.update_status(AgentStatus.ACTIVE)
        logger.info(f"Agent {self.name} is now active")
    
    def terminate(self) -> None:
        """Terminate the agent (mark as terminated)."""
        self.update_status(AgentStatus.TERMINATED)
        logger.info(f"Agent {self.name} has been terminated")
    
    def fail(self, error_message: str) -> None:
        """
        Mark the agent as failed.
        
        Args:
            error_message: The error message
        """
        self.update_status(AgentStatus.FAILED)
        logger.error(f"Agent {self.name} failed: {error_message}")
    
    def succeed(self) -> None:
        """Mark the agent as successful."""
        self.update_status(AgentStatus.SUCCESS)
        logger.info(f"Agent {self.name} succeeded")
    
    def get_cache(self, key: str) -> Any:
        """
        Get a value from the agent's cache.
        
        Args:
            key: The cache key
            
        Returns:
            The cached value, or None if not found
        """
        try:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent and agent.cache:
                    return agent.cache.get(key)
                return None
        except Exception as e:
            logger.error(f"Error getting cache: {str(e)}")
            return None
    
    def set_cache(self, key: str, value: Any) -> None:
        """
        Set a value in the agent's cache.
        
        Args:
            key: The cache key
            value: The value to cache
        """
        try:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent:
                    cache: Dict[str, Any] = agent.cache or {}
                    cache[key] = value
                    agent.cache = cache
                    session.commit()
        except Exception as e:
            logger.error(f"Error setting cache: {str(e)}")
    
    def clear_cache(self) -> None:
        """Clear the agent's cache."""
        try:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent:
                    agent.cache = {}
                    session.commit()
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
