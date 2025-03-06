"""
Prioritizer Agent for Hopple.

This agent is responsible for prioritizing tasks based on various factors.
"""

import uuid
from typing import Dict, Any, List, Optional, Tuple

from loguru import logger
import ollama
from langchain.llms import Ollama

from hopple.agents.base.base_agent import BaseAgent
from hopple.database.models.agent import AgentType, AgentStatus
from hopple.database.models.task import Task, TaskPriority, TaskStatus
from hopple.database.db_config import db_session
from hopple.config.config import get_settings


class PrioritizerAgent(BaseAgent):
    """
    Prioritizer Agent class.
    
    This agent analyzes tasks and assigns priorities based on factors such as:
    - Deadlines and time constraints
    - Dependencies between tasks
    - Business value and impact
    - Resource availability
    - Risk assessment
    """
    
    def __init__(
        self,
        name: str = "Prioritizer",
        parent_agent_id: Optional[uuid.UUID] = None,
        model_name: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Initialize the Prioritizer Agent.
        
        Args:
            name: The name of the agent
            parent_agent_id: The ID of the parent agent
            model_name: The name of the LLM model to use
            configuration: Additional configuration for the agent
            **kwargs: Additional keyword arguments
        """
        super().__init__(
            name=name,
            agent_type=AgentType.PRIORITIZER,
            parent_agent_id=parent_agent_id,
            model_name=model_name,
            configuration=configuration,
            **kwargs
        )
        
        settings = get_settings()
        
        # Initialize LLM
        self.llm = Ollama(
            model=settings.llm.LLM_MODEL,
            temperature=settings.llm.LLM_TEMPERATURE
        )
        
        # System prompt for the agent
        self.system_prompt = """
        You are Hopple's Prioritizer Agent, responsible for analyzing tasks and assigning 
        appropriate priorities based on various factors.
        
        Your responsibilities include:
        1. Analyzing task dependencies and identifying critical path tasks
        2. Evaluating business value and impact of each task
        3. Considering deadlines and time constraints
        4. Assessing risks and potential bottlenecks
        5. Balancing workload and resource availability
        
        You should prioritize tasks based on a combination of urgency and importance, 
        following the Eisenhower Matrix principles.
        """
        
        self.add_message("system", self.system_prompt)
        
        logger.info(f"Prioritizer Agent initialized: {self.name}")
    
    async def run(self, project_id: uuid.UUID) -> Dict[uuid.UUID, TaskPriority]:
        """
        Run the Prioritizer Agent to prioritize tasks for a project.
        
        Args:
            project_id: The ID of the project
            
        Returns:
            A dictionary mapping task IDs to priorities
        """
        logger.info(f"Prioritizer Agent running for project: {project_id}")
        
        # In a real implementation, we would fetch tasks from the database
        # and use the LLM to determine priorities. For now, we'll return placeholder data.
        
        # Add the query to messages
        self.add_message("human", f"Prioritize tasks for project {project_id}")
        
        # Call the LLM (this would be implemented to analyze tasks and assign priorities)
        # For now, we'll use a simple placeholder response
        
        # In a real implementation, we would update task priorities in the database
        # For now, we'll just return the priority data
        
        response = """
        I've analyzed the tasks for this project and assigned priorities based on dependencies, 
        deadlines, and business value. Here's a summary of my prioritization:
        
        High Priority:
        - Initialize project repository: This is a foundational task that blocks other work
        - Define database schema: Critical for early development progress
        
        Medium Priority:
        - Implement user authentication: Important but can be done after initial setup
        
        Low Priority:
        - Add analytics tracking: Can be implemented later in the project
        """
        
        self.add_message("ai", response)
        
        # Update metrics
        self.update_metrics(success=True)
        
        # After prioritizing tasks, put the agent to sleep
        self.sleep()
        
        # Return placeholder priority data
        return {
            uuid.uuid4(): TaskPriority.HIGH,
            uuid.uuid4(): TaskPriority.HIGH,
            uuid.uuid4(): TaskPriority.MEDIUM,
            uuid.uuid4(): TaskPriority.LOW
        } 