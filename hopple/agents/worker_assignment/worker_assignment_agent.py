"""
Worker Assignment Agent for Hopple.

This agent is responsible for assigning workers to tasks based on skills and availability.
"""

import uuid
from typing import Dict, Any, List, Optional, Tuple

from loguru import logger
import ollama
from langchain.llms import Ollama

from hopple.agents.base.base_agent import BaseAgent
from hopple.database.models.agent import AgentType, AgentStatus
from hopple.database.models.task import Task
from hopple.database.models.user import User
from hopple.database.db_config import db_session
from hopple.config.config import get_settings


class WorkerAssignmentAgent(BaseAgent):
    """
    Worker Assignment Agent class.
    
    This agent matches tasks with workers based on factors such as:
    - Worker skills and expertise
    - Worker availability and workload
    - Task requirements and complexity
    - Task dependencies
    - Team dynamics and collaboration patterns
    """
    
    def __init__(
        self,
        name: str = "Worker Assigner",
        parent_agent_id: Optional[uuid.UUID] = None,
        model_name: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Initialize the Worker Assignment Agent.
        
        Args:
            name: The name of the agent
            parent_agent_id: The ID of the parent agent
            model_name: The name of the LLM model to use
            configuration: Additional configuration for the agent
            **kwargs: Additional keyword arguments
        """
        super().__init__(
            name=name,
            agent_type=AgentType.WORKER_ASSIGNER,
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
        You are Hopple's Worker Assignment Agent, responsible for matching tasks with the most 
        suitable team members based on skills, availability, and other factors.
        
        Your responsibilities include:
        1. Analyzing task requirements and required skills
        2. Evaluating team members' skills and expertise
        3. Considering workload and availability of team members
        4. Taking into account task dependencies for assignment
        5. Optimizing team dynamics and collaboration
        
        Make assignments that maximize productivity, quality, and team satisfaction.
        """
        
        self.add_message("system", self.system_prompt)
        
        logger.info(f"Worker Assignment Agent initialized: {self.name}")
    
    async def run(self, project_id: uuid.UUID) -> Dict[uuid.UUID, uuid.UUID]:
        """
        Run the Worker Assignment Agent to assign workers to tasks for a project.
        
        Args:
            project_id: The ID of the project
            
        Returns:
            A dictionary mapping task IDs to worker IDs
        """
        logger.info(f"Worker Assignment Agent running for project: {project_id}")
        
        # In a real implementation, we would fetch tasks and workers from the database
        # and use the LLM to determine assignments. For now, we'll return placeholder data.
        
        # Add the query to messages
        self.add_message("human", f"Assign workers to tasks for project {project_id}")
        
        # In a real implementation, we would update task assignments in the database
        # For now, we'll just return placeholder assignment data
        
        response = """
        I've analyzed the tasks and team members for this project and made the following assignments
        based on skills, availability, and workload:
        
        1. Initialize project repository → Alex Smith
           Reason: Alex has strong DevOps skills and is currently available
           
        2. Define database schema → Maria Johnson
           Reason: Maria is our database expert and has worked on similar projects
           
        3. Implement user authentication → Jamie Williams
           Reason: Jamie has extensive experience with security implementations
        """
        
        self.add_message("ai", response)
        
        # Update metrics
        self.update_metrics(success=True)
        
        # After assigning workers, put the agent to sleep
        self.sleep()
        
        # Return placeholder assignment data
        task_ids = [uuid.uuid4() for _ in range(3)]
        worker_ids = [uuid.uuid4() for _ in range(3)]
        
        return {
            task_ids[0]: worker_ids[0],
            task_ids[1]: worker_ids[1],
            task_ids[2]: worker_ids[2]
        } 