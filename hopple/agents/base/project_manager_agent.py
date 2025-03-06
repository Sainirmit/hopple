"""
Project Manager Agent for Hopple.

This agent serves as the central coordinator for all project management
activities. It creates and manages sub-agents specialized for specific tasks.
"""

import uuid
from typing import Dict, Any, Optional

from loguru import logger
import ollama
from langchain.llms import Ollama

from hopple.agents.base.base_agent import BaseAgent
from hopple.database.models.agent import (
    Agent as AgentModel,
    AgentType,
    AgentStatus
)
from hopple.agents.task_creation.task_creator_agent import TaskCreatorAgent
from hopple.agents.prioritization.prioritizer_agent import PrioritizerAgent
from hopple.agents.worker_assignment.worker_assignment_agent import (
    WorkerAssignmentAgent
)
from hopple.database.db_config import db_session
from hopple.config.config import get_settings


class ProjectManagerAgent(BaseAgent):
    """
    Project Manager Agent class.

    This agent is responsible for managing the overall project workflow.
    It creates and coordinates sub-agents for specific tasks as needed,
    provides context and direction, and makes final decisions.
    """

    def __init__(
        self,
        name: str = "Project Manager",
        model_name: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Initialize the Project Manager Agent.

        Args:
            name: The name of the agent
            model_name: The name of the LLM model to use
            configuration: Additional configuration for the agent
            **kwargs: Additional keyword arguments
        """
        super().__init__(
            name=name,
            agent_type=AgentType.PROJECT_MANAGER,
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
        You are Hopple's Project Management Agent, the central AI coordinator
        for all project management activities.
        Your role is to oversee projects, create and manage specialized
        sub-agents, and make high-level decisions.

        Your capabilities include:
        1. Creating sub-agents for specific tasks (task creation,
           prioritization, worker assignment)
        2. Processing project requirements and breaking them down into
           manageable tasks
        3. Monitoring project progress and adjusting plans as needed
        4. Making final decisions on task priorities and assignments
        5. Providing context and guidance to sub-agents

        Always make decisions based on project goals, resource constraints,
        and best practices in project management.
        """

        self.add_message("system", self.system_prompt)

        # Track sub-agents
        self.sub_agents: Dict[str, uuid.UUID] = {}

        logger.info(f"Project Manager Agent initialized: {self.name}")

    async def run(self, project_id: uuid.UUID, query: str) -> str:
        """
        Run the Project Manager Agent.

        Args:
            project_id: The ID of the project to manage
            query: The user's query or instruction

        Returns:
            The agent's response
        """
        logger.info(f"Project Manager Agent running for project: {project_id}")

        # Add the user's query to messages
        self.add_message("human", query)

        # Process the query and determine what needs to be done
        action = await self._determine_action(query)

        if action == "create_tasks":
            response = await self._create_tasks(project_id, query)
        elif action == "prioritize_tasks":
            response = await self._prioritize_tasks(project_id)
        elif action == "assign_workers":
            response = await self._assign_workers(project_id)
        else:
            # Default to answering the query directly
            response = await self._answer_query(query)

        # Add the response to the message history
        self.add_message("ai", response)

        # Update metrics
        self.update_metrics(success=True)

        return response

    async def _determine_action(self, query: str) -> str:
        """
        Determine what action to take based on the user's query.

        Args:
            query: The user's query or instruction

        Returns:
            The action to take
        """
        # In a real implementation, we would use LLM to determine the action
        # For simplicity, we'll use some basic keyword matching
        query_lower = query.lower()

        if "create task" in query_lower or "new task" in query_lower:
            return "create_tasks"
        elif "priorit" in query_lower:
            return "prioritize_tasks"
        elif "assign" in query_lower or "worker" in query_lower:
            return "assign_workers"
        else:
            return "answer_query"

    async def _create_tasks(self, project_id: uuid.UUID, requirements: str) -> str:
        """
        Create tasks for a project by spawning a TaskCreatorAgent.

        Args:
            project_id: The ID of the project
            requirements: The project requirements

        Returns:
            The result of the task creation
        """
        logger.info(f"Creating tasks for project: {project_id}")

        # Check cache for existing agent
        task_creator_id = self.get_cache("task_creator_agent_id")

        if task_creator_id:
            # Wake up the existing agent
            with db_session() as session:
                agent = session.query(AgentModel).filter(
                    AgentModel.id == task_creator_id
                ).first()
                if agent and agent.status == AgentStatus.SLEEPING.value:
                    agent.update_status(AgentStatus.ACTIVE)
                    logger.info(f"Woke up existing TaskCreatorAgent: {agent.id}")
                else:
                    task_creator_id = None

        if not task_creator_id:
            # Create a new TaskCreatorAgent
            task_creator = TaskCreatorAgent(
                name="Task Creator",
                parent_agent_id=self.db_id,
                model_name=self.model_name
            )

            # Save the agent ID in cache
            self.update_cache("task_creator_agent_id", str(task_creator.db_id))
            task_creator_id = task_creator.db_id

        # In a real implementation, we would pass the agent ID to a task queue
        # For simplicity, we'll simulate the result
        result = (
            f"TaskCreatorAgent ({task_creator_id}) has been tasked with "
            f"creating tasks based on the requirements."
        )

        # In a real system, we'd wait for the agent to complete
        # task_creator.run(project_id, requirements)

        return result

    async def _prioritize_tasks(self, project_id: uuid.UUID) -> str:
        """
        Prioritize tasks for a project by spawning a PrioritizerAgent.

        Args:
            project_id: The ID of the project

        Returns:
            The result of the task prioritization
        """
        logger.info(f"Prioritizing tasks for project: {project_id}")

        # Check cache for existing agent
        prioritizer_id = self.get_cache("prioritizer_agent_id")

        if not prioritizer_id:
            # Create a new PrioritizerAgent
            prioritizer = PrioritizerAgent(
                name="Prioritizer",
                parent_agent_id=self.db_id,
                model_name=self.model_name
            )

            # Save the agent ID in cache
            self.update_cache("prioritizer_agent_id", str(prioritizer.db_id))
            prioritizer_id = prioritizer.db_id

        # In a real implementation, we would pass the agent ID to a task queue
        # For simplicity, we'll simulate the result
        result = (
            f"PrioritizerAgent ({prioritizer_id}) has been tasked with "
            f"prioritizing tasks for the project."
        )

        return result

    async def _assign_workers(self, project_id: uuid.UUID) -> str:
        """
        Assign workers to tasks by spawning a WorkerAssignmentAgent.

        Args:
            project_id: The ID of the project

        Returns:
            The result of the worker assignment
        """
        logger.info(f"Assigning workers for project: {project_id}")

        # Check cache for existing agent
        assigner_id = self.get_cache("worker_assignment_agent_id")

        if not assigner_id:
            # Create a new WorkerAssignmentAgent
            assigner = WorkerAssignmentAgent(
                name="Worker Assigner",
                parent_agent_id=self.db_id,
                model_name=self.model_name
            )

            # Save the agent ID in cache
            self.update_cache("worker_assignment_agent_id", str(assigner.db_id))
            assigner_id = assigner.db_id

        # In a real implementation, we would pass the agent ID to a task queue
        # For simplicity, we'll simulate the result
        result = (
            f"WorkerAssignmentAgent ({assigner_id}) has been tasked with "
            f"assigning workers to tasks."
        )

        return result

    async def _answer_query(self, query: str) -> str:
        """
        Answer a general query using the LLM.

        Args:
            query: The user's query

        Returns:
            The agent's response
        """
        try:
            # Use the ollama client directly for more control
            response = ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": query}
                ]
            )

            return response['message']['content']
        except Exception as e:
            logger.error(f"Error calling Ollama: {e}")
            return (
                "I encountered an error while processing your query. "
                "Please try again later."
            )
