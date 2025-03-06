"""
Task Creator Agent for Hopple.

This agent is responsible for creating tasks based on project requirements.
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


class TaskCreatorAgent(BaseAgent):
    """
    Task Creator Agent class.
    
    This agent analyzes project requirements and creates appropriate tasks.
    It generates task descriptions, estimates effort, and identifies dependencies.
    """
    
    def __init__(
        self,
        name: str = "Task Creator",
        parent_agent_id: Optional[uuid.UUID] = None,
        model_name: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Initialize the Task Creator Agent.
        
        Args:
            name: The name of the agent
            parent_agent_id: The ID of the parent agent
            model_name: The name of the LLM model to use
            configuration: Additional configuration for the agent
            **kwargs: Additional keyword arguments
        """
        super().__init__(
            name=name,
            agent_type=AgentType.TASK_CREATOR,
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
        You are Hopple's Task Creator Agent, responsible for analyzing project requirements 
        and breaking them down into well-defined tasks.
        
        Your responsibilities include:
        1. Identifying discrete tasks from project requirements
        2. Creating detailed task descriptions
        3. Estimating the effort required for each task
        4. Identifying dependencies between tasks
        5. Specifying required skills for each task
        
        Always create tasks that are specific, measurable, achievable, relevant, and time-bound (SMART).
        """
        
        self.add_message("system", self.system_prompt)
        
        logger.info(f"Task Creator Agent initialized: {self.name}")
    
    async def run(self, project_id: uuid.UUID, requirements: str) -> List[Dict[str, Any]]:
        """
        Run the Task Creator Agent to generate tasks from project requirements.
        
        Args:
            project_id: The ID of the project
            requirements: The project requirements
            
        Returns:
            A list of created tasks
        """
        logger.info(f"Task Creator Agent running for project: {project_id}")
        
        # In a real implementation, we would use the LLM to analyze requirements
        # and generate tasks. For now, we'll return placeholder tasks.
        
        # Add the requirements to messages
        self.add_message("human", f"Create tasks for the following project requirements: {requirements}")
        
        # Call the LLM (this would be implemented to parse requirements into tasks)
        tasks_data = [
            {
                "title": "Initialize project repository",
                "description": "Set up the initial project structure and repository",
                "estimated_effort": 2,
                "priority": TaskPriority.HIGH,
                "skills": ["git", "devops"]
            },
            {
                "title": "Define database schema",
                "description": "Create the database schema based on requirements",
                "estimated_effort": 4,
                "priority": TaskPriority.HIGH,
                "skills": ["database", "sql"]
            },
            {
                "title": "Implement user authentication",
                "description": "Create user authentication and authorization system",
                "estimated_effort": 8,
                "priority": TaskPriority.MEDIUM,
                "skills": ["security", "backend"]
            }
        ]
        
        # In a real implementation, we would create these tasks in the database
        # For now, we'll just return the task data
        
        # Simulate task creation response
        tasks_summary = "\n".join([f"- {task['title']}: {task['description']}" for task in tasks_data])
        response = f"I've analyzed the requirements and created the following tasks:\n\n{tasks_summary}"
        
        self.add_message("ai", response)
        
        # Update metrics
        self.update_metrics(success=True)
        
        # After creating tasks, put the agent to sleep
        self.sleep()
        
        return tasks_data 