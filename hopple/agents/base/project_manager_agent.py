"""
Project Manager Agent for Hopple.

This agent serves as the central coordinator for all project management
activities. It creates and manages sub-agents specialized for specific tasks.
"""

import uuid
from typing import Dict, Any, Optional, List
import asyncio
import requests
import json

from loguru import logger
from langchain_community.llms import Ollama

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
        try:
            self.llm = Ollama(
                model="mistral:latest",  # Use the exact model name from ollama list
                temperature=settings.llm.LLM_TEMPERATURE
            )
            logger.info(f"Successfully initialized Ollama with model: mistral:latest")
        except Exception as e:
            logger.error(f"Error initializing Ollama: {e}")
            # Fallback to a simple mock LLM for testing
            self.llm = None

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

        # Track active sub-agents
        self.active_sub_agents: Dict[str, uuid.UUID] = {}
        # Track sleeping sub-agents
        self.sleeping_sub_agents: Dict[str, uuid.UUID] = {}

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
        # If LLM is not available, use basic keyword matching
        if self.llm is None:
            query_lower = query.lower()
            if "create task" in query_lower or "new task" in query_lower:
                return "create_tasks"
            elif "priorit" in query_lower:
                return "prioritize_tasks"
            elif "assign" in query_lower or "worker" in query_lower:
                return "assign_workers"
            else:
                return "answer_query"
                
        # Create a prompt for the LLM to determine the action
        prompt = f"""
        Based on the user's query, determine which action to take:
        - create_tasks: If the query is about creating new tasks or breaking down requirements
        - prioritize_tasks: If the query is about prioritizing existing tasks
        - assign_workers: If the query is about assigning workers to tasks
        - answer_query: If none of the above apply

        User query: "{query}"
        
        Action (respond with one of: create_tasks, prioritize_tasks, assign_workers, answer_query):
        """

        try:
            # Use direct Ollama API call
            response = self._call_ollama_api(prompt)
            
            # Extract just the action name (in case the LLM adds explanation)
            if "create_tasks" in response.lower():
                return "create_tasks"
            elif "prioritize_tasks" in response.lower():
                return "prioritize_tasks"
            elif "assign_workers" in response.lower():
                return "assign_workers"
            else:
                return "answer_query"
        except Exception as e:
            logger.error(f"Error determining action: {e}")
            # Fallback to basic keyword matching
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

        # First, check if we have a sleeping task creator agent
        task_creator_id = self.sleeping_sub_agents.get("task_creator")
        
        if task_creator_id:
            # Wake up the existing agent
            await self._wake_up_agent(task_creator_id)
            logger.info(f"Woke up existing TaskCreatorAgent: {task_creator_id}")
        else:
            # Check if we have an active task creator
            task_creator_id = self.active_sub_agents.get("task_creator")
            
            if not task_creator_id:
                # Create a new TaskCreatorAgent
                task_creator = TaskCreatorAgent(
                    name="Task Creator",
                    parent_agent_id=self.db_id,
                    model_name=self.model_name
                )
                task_creator_id = task_creator.db_id
                self.active_sub_agents["task_creator"] = task_creator_id
                logger.info(f"Created new TaskCreatorAgent: {task_creator_id}")

        # Get the TaskCreatorAgent instance
        task_creator = await self._get_agent_instance(task_creator_id, TaskCreatorAgent)
        
        # Run the task creator
        try:
            tasks = await task_creator.run(project_id, requirements)
            result = f"Created {len(tasks)} tasks based on requirements."
            
            # Put the agent to sleep after task completion
            await self._put_agent_to_sleep(task_creator_id)
            
            # Move from active to sleeping
            self.active_sub_agents.pop("task_creator", None)
            self.sleeping_sub_agents["task_creator"] = task_creator_id
            
            return result
        except Exception as e:
            logger.error(f"Error creating tasks: {e}")
            return f"Error creating tasks: {str(e)}"

    async def _prioritize_tasks(self, project_id: uuid.UUID) -> str:
        """
        Prioritize tasks for a project by spawning a PrioritizerAgent.

        Args:
            project_id: The ID of the project

        Returns:
            The result of the task prioritization
        """
        logger.info(f"Prioritizing tasks for project: {project_id}")

        # First, check if we have a sleeping prioritizer agent
        prioritizer_id = self.sleeping_sub_agents.get("prioritizer")
        
        if prioritizer_id:
            # Wake up the existing agent
            await self._wake_up_agent(prioritizer_id)
            logger.info(f"Woke up existing PrioritizerAgent: {prioritizer_id}")
        else:
            # Check if we have an active prioritizer
            prioritizer_id = self.active_sub_agents.get("prioritizer")
            
            if not prioritizer_id:
                # Create a new PrioritizerAgent
                prioritizer = PrioritizerAgent(
                    name="Prioritizer",
                    parent_agent_id=self.db_id,
                    model_name=self.model_name
                )
                prioritizer_id = prioritizer.db_id
                self.active_sub_agents["prioritizer"] = prioritizer_id
                logger.info(f"Created new PrioritizerAgent: {prioritizer_id}")

        # Get the PrioritizerAgent instance
        prioritizer = await self._get_agent_instance(prioritizer_id, PrioritizerAgent)
        
        # Run the prioritizer
        try:
            priorities = await prioritizer.run(project_id)
            result = f"Prioritized tasks for project {project_id}."
            
            # Put the agent to sleep after task completion
            await self._put_agent_to_sleep(prioritizer_id)
            
            # Move from active to sleeping
            self.active_sub_agents.pop("prioritizer", None)
            self.sleeping_sub_agents["prioritizer"] = prioritizer_id
            
            return result
        except Exception as e:
            logger.error(f"Error prioritizing tasks: {e}")
            return f"Error prioritizing tasks: {str(e)}"

    async def _assign_workers(self, project_id: uuid.UUID) -> str:
        """
        Assign workers to tasks by spawning a WorkerAssignmentAgent.

        Args:
            project_id: The ID of the project

        Returns:
            The result of the worker assignment
        """
        logger.info(f"Assigning workers for project: {project_id}")

        # First, check if we have a sleeping worker assignment agent
        assigner_id = self.sleeping_sub_agents.get("worker_assigner")
        
        if assigner_id:
            # Wake up the existing agent
            await self._wake_up_agent(assigner_id)
            logger.info(f"Woke up existing WorkerAssignmentAgent: {assigner_id}")
        else:
            # Check if we have an active worker assigner
            assigner_id = self.active_sub_agents.get("worker_assigner")
            
            if not assigner_id:
                # Create a new WorkerAssignmentAgent
                assigner = WorkerAssignmentAgent(
                    name="Worker Assigner",
                    parent_agent_id=self.db_id,
                    model_name=self.model_name
                )
                assigner_id = assigner.db_id
                self.active_sub_agents["worker_assigner"] = assigner_id
                logger.info(f"Created new WorkerAssignmentAgent: {assigner_id}")

        # Get the WorkerAssignmentAgent instance
        assigner = await self._get_agent_instance(assigner_id, WorkerAssignmentAgent)
        
        # Run the worker assigner
        try:
            assignments = await assigner.run(project_id)
            result = f"Assigned workers to tasks for project {project_id}."
            
            # Put the agent to sleep after task completion
            await self._put_agent_to_sleep(assigner_id)
            
            # Move from active to sleeping
            self.active_sub_agents.pop("worker_assigner", None)
            self.sleeping_sub_agents["worker_assigner"] = assigner_id
            
            return result
        except Exception as e:
            logger.error(f"Error assigning workers: {e}")
            return f"Error assigning workers: {str(e)}"

    async def _answer_query(self, query: str) -> str:
        """
        Answer a general query.

        Args:
            query: The user's query

        Returns:
            The response to the query
        """
        # If LLM is not available, return a simple response
        if self.llm is None:
            return (
                "I'm sorry, but I'm currently operating in limited mode without access to the LLM. "
                "I can still help with basic project management tasks, but detailed responses "
                "are not available at the moment."
            )
            
        prompt = f"""
        You are Hopple's Project Management Agent. Answer the following query:
        
        {query}
        """
        
        try:
            # Use direct Ollama API call
            response = self._call_ollama_api(prompt)
            return response
        except Exception as e:
            logger.error(f"Error answering query: {e}")
            return f"I apologize, but I encountered an error processing your query: {str(e)}"

    async def _wake_up_agent(self, agent_id: uuid.UUID) -> None:
        """
        Wake up a sleeping agent.

        Args:
            agent_id: The ID of the agent to wake up
        """
        with db_session() as session:
            agent = session.query(AgentModel).filter(
                AgentModel.id == agent_id
            ).first()
            
            if agent and agent.status == AgentStatus.SLEEPING.value:
                agent.status = AgentStatus.ACTIVE.value
                session.commit()
                logger.info(f"Agent {agent_id} woken up")
            else:
                logger.warning(f"Agent {agent_id} not found or not sleeping")

    async def _put_agent_to_sleep(self, agent_id: uuid.UUID) -> None:
        """
        Put an active agent to sleep.

        Args:
            agent_id: The ID of the agent to put to sleep
        """
        with db_session() as session:
            agent = session.query(AgentModel).filter(
                AgentModel.id == agent_id
            ).first()
            
            if agent and agent.status == AgentStatus.ACTIVE.value:
                agent.status = AgentStatus.SLEEPING.value
                session.commit()
                logger.info(f"Agent {agent_id} put to sleep")
            else:
                logger.warning(f"Agent {agent_id} not found or not active")

    async def _get_agent_instance(self, agent_id: uuid.UUID, agent_class):
        """
        Get an agent instance by ID.

        Args:
            agent_id: The ID of the agent
            agent_class: The class of the agent

        Returns:
            An instance of the agent class
        """
        with db_session() as session:
            agent_record = session.query(AgentModel).filter(
                AgentModel.id == agent_id
            ).first()
            
            if not agent_record:
                raise ValueError(f"Agent {agent_id} not found")
            
            # Create an instance of the agent class with the same ID
            agent_instance = agent_class(
                name=agent_record.name,
                parent_agent_id=agent_record.parent_agent_id,
                model_name=self.model_name
            )
            agent_instance.db_id = agent_id
            
            return agent_instance

    async def terminate_agent(self, agent_id: uuid.UUID) -> None:
        """
        Terminate an agent.

        Args:
            agent_id: The ID of the agent to terminate
        """
        with db_session() as session:
            agent = session.query(AgentModel).filter(
                AgentModel.id == agent_id
            ).first()
            
            if agent:
                agent.status = AgentStatus.TERMINATED.value
                session.commit()
                logger.info(f"Agent {agent_id} terminated")
                
                # Remove from our tracking dictionaries
                for agent_type, aid in list(self.active_sub_agents.items()):
                    if aid == agent_id:
                        self.active_sub_agents.pop(agent_type)
                        
                for agent_type, aid in list(self.sleeping_sub_agents.items()):
                    if aid == agent_id:
                        self.sleeping_sub_agents.pop(agent_type)
            else:
                logger.warning(f"Agent {agent_id} not found")

    def _call_ollama_api(self, prompt: str) -> str:
        """
        Call the Ollama API directly.
        
        Args:
            prompt: The prompt to send to the model
            
        Returns:
            The model's response
        """
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral:latest",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()["response"]
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return ""
        except Exception as e:
            logger.error(f"Error calling Ollama API: {e}")
            return ""
