"""
Base agent class for all AI agents in Hopple.
"""

import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple, Union

from langchain.schema import BaseMessage, HumanMessage, AIMessage, SystemMessage
from loguru import logger
from sqlalchemy.orm import Session

from hopple.database.models.agent import Agent as AgentModel, AgentStatus, AgentType
from hopple.database.db_config import db_session
from hopple.config.config import get_settings


class BaseAgent(ABC):
    """
    Base agent class that all Hopple agents inherit from.
    
    This class provides the foundation for all agent types in the system,
    including common functionality for agent lifecycle management,
    communication with LLMs, and database operations.
    """
    
    def __init__(
        self,
        name: str,
        agent_type: AgentType,
        parent_agent_id: Optional[uuid.UUID] = None,
        model_name: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Initialize a base agent.
        
        Args:
            name: The name of the agent
            agent_type: The type of the agent
            parent_agent_id: The ID of the parent agent, if any
            model_name: The name of the model to use (defaults to config)
            configuration: Additional configuration for the agent
            **kwargs: Additional keyword arguments
        """
        self.name = name
        self.agent_type = agent_type
        self.parent_agent_id = parent_agent_id
        
        settings = get_settings()
        self.model_name = model_name or settings.llm.LLM_MODEL
        self.configuration = configuration or {}
        
        # State management
        self.messages: List[BaseMessage] = []
        self.db_id: Optional[uuid.UUID] = None
        self.state: Dict[str, Any] = {}
        self.cache: Dict[str, Any] = {}
        
        # Initialize the agent in the database
        self._initialize_db_agent()
        
        logger.info(f"Initialized {self.agent_type.value} agent: {self.name}")
    
    def _initialize_db_agent(self) -> None:
        """Initialize the agent record in the database."""
        with db_session() as session:
            agent = AgentModel(
                name=self.name,
                agent_type=self.agent_type.value,
                model_name=self.model_name,
                description=self.configuration.get("description", ""),
                status=AgentStatus.ACTIVE.value,
                configuration=self.configuration,
                parent_agent_id=self.parent_agent_id
            )
            session.add(agent)
            session.commit()
            
            self.db_id = agent.id
            logger.debug(f"Created agent in DB with ID: {self.db_id}")
    
    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to the agent's conversation history.
        
        Args:
            role: The role of the message sender (human, ai, system)
            content: The content of the message
        """
        if role == "human":
            message = HumanMessage(content=content)
        elif role == "ai":
            message = AIMessage(content=content)
        elif role == "system":
            message = SystemMessage(content=content)
        else:
            raise ValueError(f"Invalid message role: {role}")
        
        self.messages.append(message)
    
    def update_status(self, status: AgentStatus) -> None:
        """
        Update the agent's status in the database.
        
        Args:
            status: The new status for the agent
        """
        if not self.db_id:
            logger.warning("Cannot update status: Agent not initialized in DB")
            return
        
        with db_session() as session:
            agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
            if agent:
                agent.update_status(status)
                
                if status == AgentStatus.ACTIVE:
                    logger.info(f"Agent {self.name} activated")
                elif status == AgentStatus.SLEEPING:
                    logger.info(f"Agent {self.name} went to sleep")
                elif status == AgentStatus.TERMINATED:
                    logger.info(f"Agent {self.name} terminated")
            else:
                logger.error(f"Agent with ID {self.db_id} not found in database")
    
    def update_cache(self, key: str, value: Any) -> None:
        """
        Update the agent's cache with a key-value pair.
        
        Args:
            key: The key for the cache entry
            value: The value to store
        """
        self.cache[key] = value
        
        if self.db_id:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent:
                    agent.update_cache(key, value)
    
    def get_cache(self, key: str, default: Any = None) -> Any:
        """
        Get a value from the agent's cache.
        
        Args:
            key: The key to retrieve
            default: The default value if key is not found
            
        Returns:
            The cached value or default
        """
        return self.cache.get(key, default)
    
    def clear_cache(self) -> None:
        """Clear the agent's cache."""
        self.cache = {}
        
        if self.db_id:
            with db_session() as session:
                agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
                if agent:
                    agent.clear_cache()
    
    def update_metrics(self, success: bool = True) -> None:
        """
        Update the agent's performance metrics.
        
        Args:
            success: Whether the operation was successful
        """
        if not self.db_id:
            return
            
        with db_session() as session:
            agent = session.query(AgentModel).filter(AgentModel.id == self.db_id).first()
            if agent:
                agent.update_metrics(success)
    
    def sleep(self) -> None:
        """Put the agent to sleep (inactive but retaining state)."""
        logger.info(f"Putting agent {self.name} to sleep")
        self.update_status(AgentStatus.SLEEPING)
    
    def wake(self) -> None:
        """Wake up a sleeping agent."""
        logger.info(f"Waking up agent {self.name}")
        self.update_status(AgentStatus.ACTIVE)
    
    def terminate(self) -> None:
        """Terminate the agent."""
        logger.info(f"Terminating agent {self.name}")
        self.update_status(AgentStatus.TERMINATED)
    
    @abstractmethod
    async def run(self, *args, **kwargs) -> Any:
        """
        Run the agent's main functionality.
        
        This method must be implemented by all agent subclasses.
        """
        pass
