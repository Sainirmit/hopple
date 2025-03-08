"""
Project Manager Agent for Hopple.

This agent coordinates other agents and manages project-related tasks.
"""

import uuid
from typing import Dict, List, Any, Optional
import requests  # type: ignore
from datetime import datetime

from hopple.database.models.agent import Agent, AgentType, AgentStatus
from hopple.database.models.project import Project
from hopple.database.models.task import Task
from hopple.utils.logger import logger
from hopple.database.db_config import db_session

class ProjectManagerAgent:
    """
    Project Manager Agent is the main orchestrator for project management.
    
    It coordinates other specialized agents and provides a conversational
    interface for users to interact with the project management system.
    """
    
    def __init__(self, agent_id: Optional[uuid.UUID] = None):
        """
        Initialize the Project Manager Agent.
        
        Args:
            agent_id: Optional UUID of an existing agent in the database
        """
        self.db_id = agent_id
        self.name = "Project Manager"
        self.agent_type = AgentType.PROJECT_MANAGER
        self.status = AgentStatus.ACTIVE
        self.last_message = ""
        
        # Save or update agent in database
        self._save_agent_to_db()
        
        logger.info(f"Project Manager Agent initialized with ID: {self.db_id}")
    
    async def run(self, project_id: uuid.UUID, query: str) -> str:
        """
        Run the project manager agent with a user query.
        
        This is the main entry point for interacting with the agent.
        
        Args:
            project_id: The UUID of the project to manage
            query: The user's query or request
            
        Returns:
            The agent's response to the query
        """
        logger.info(f"Running Project Manager Agent for project {project_id} with query: {query}")
        
        # Update agent status
        self._update_agent_status(AgentStatus.ACTIVE, "Processing query")
        
        try:
            # Get project details to validate project exists
            with db_session() as session:
                project = session.query(Project).filter(Project.id == project_id).first()
                if not project:
                    raise ValueError(f"Project with ID {project_id} not found")
                
                project_name = project.name
                
                # Count tasks
                tasks = session.query(Task).filter(Task.project_id == project_id).all()
                task_count = len(tasks)
                completed_count = sum(1 for task in tasks if task.is_completed)
            
            # Process query and generate response
            response = f"Project Manager Agent for '{project_name}'\n\n"
            
            # Determine query type and delegate to appropriate handler
            query_lower = query.lower()
            
            if "create tasks" in query_lower or "generate tasks" in query_lower:
                # Delegate to Task Creator Agent
                created_tasks = await self._run_task_creator(project_id, query)
                
                if created_tasks:
                    response += f"✅ Created {len(created_tasks)} tasks for the project.\n\n"
                    response += "Tasks created:\n"
                    for task in created_tasks[:5]:  # Show only first 5 tasks
                        response += f"- {task['title']}\n"
                    
                    if len(created_tasks) > 5:
                        response += f"...and {len(created_tasks) - 5} more tasks.\n"
                else:
                    response += "❌ Failed to create tasks. Please provide more detailed requirements.\n"
            
            elif "prioritize" in query_lower or "rank tasks" in query_lower:
                # Delegate to Prioritization Agent
                prioritized = await self._run_prioritizer(project_id, query)
                
                if prioritized:
                    response += "✅ Tasks have been prioritized based on project goals and dependencies.\n"
                else:
                    response += "❌ Failed to prioritize tasks. Please make sure tasks exist in the project.\n"
            
            elif "assign" in query_lower or "allocate" in query_lower:
                # Delegate to Worker Assignment Agent
                assigned = await self._run_worker_assignment(project_id, query)
                
                if assigned:
                    response += "✅ Tasks have been assigned to team members based on skills and workload.\n"
                else:
                    response += "❌ Failed to assign tasks. Please make sure tasks and team members exist.\n"
            
            else:
                # General project status response
                progress = 0 if task_count == 0 else (completed_count / task_count) * 100
                
                response += f"📊 Project Status:\n"
                response += f"- Tasks: {task_count} total, {completed_count} completed\n"
                response += f"- Progress: {progress:.1f}%\n\n"
                
                response += "I can help you with the following:\n"
                response += "- Create tasks for your project\n"
                response += "- Prioritize existing tasks\n"
                response += "- Assign tasks to team members\n"
                response += "- Provide project status updates\n\n"
                
                response += "Please let me know what you'd like me to do."
            
            # Update agent with successful response
            self._update_agent_status(AgentStatus.SLEEPING, "Completed successfully")
            
            return response
            
        except Exception as e:
            logger.error(f"Error in Project Manager Agent: {str(e)}")
            self._update_agent_status(AgentStatus.FAILED, f"Error: {str(e)}")
            return f"Sorry, I encountered an error: {str(e)}"
    
    async def _run_task_creator(self, project_id: uuid.UUID, requirements: str) -> List[Dict[str, Any]]:
        """
        Run the Task Creator Agent to generate tasks from requirements.
        
        Args:
            project_id: The project ID to create tasks for
            requirements: The requirements text
            
        Returns:
            List of created tasks
        """
        try:
            # Make sure we have a valid db_id
            if self.db_id is None:
                return []
                
            # Get or create agent
            agent_id = self._get_agent_instance(self.db_id, AgentType.TASK_CREATOR)
            if agent_id is None:
                return []
            
            # Import here to avoid circular imports
            from hopple.agents.task_creation.task_creator_agent import TaskCreatorAgent
            
            # Create agent
            task_creator = TaskCreatorAgent(parent_agent_id=agent_id)
            
            # Run agent
            created_tasks = await task_creator.run(
                project_id=project_id,
                requirements=requirements
            )
            
            # Put agent to sleep
            self._put_agent_to_sleep(agent_id)
            
            return created_tasks
            
        except Exception as e:
            logger.error(f"Error running Task Creator Agent: {str(e)}")
            return []
    
    async def _run_prioritizer(self, project_id: uuid.UUID, query: str) -> bool:
        """
        Run the Prioritization Agent to prioritize tasks.
        
        Args:
            project_id: The project ID to prioritize tasks for
            query: The user query with prioritization requirements
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Make sure we have a valid db_id
            if self.db_id is None:
                return False
                
            # Get or create agent
            agent_id = self._get_agent_instance(self.db_id, AgentType.PRIORITIZER)
            if agent_id is None:
                return False
            
            # Import here to avoid circular imports
            from hopple.agents.prioritization.prioritizer_agent import PrioritizerAgent
            
            # Create agent
            prioritizer = PrioritizerAgent(parent_agent_id=agent_id)
            
            # Run agent - note that the prioritizer only takes project_id
            result = await prioritizer.run(
                project_id=project_id
                # query parameter doesn't exist in the prioritizer's run method
            )
            
            # Put agent to sleep
            self._put_agent_to_sleep(agent_id)
            
            # If we get a result dictionary with any entries, consider it successful
            return bool(result)
            
        except Exception as e:
            logger.error(f"Error running Prioritization Agent: {str(e)}")
            return False
    
    async def _run_worker_assignment(self, project_id: uuid.UUID, query: str) -> bool:
        """
        Run the Worker Assignment Agent to assign tasks to workers.
        
        Args:
            project_id: The project ID to assign tasks for
            query: The user query with assignment requirements
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Make sure we have a valid db_id
            if self.db_id is None:
                return False
                
            # Get or create agent
            agent_id = self._get_agent_instance(self.db_id, AgentType.WORKER_ASSIGNMENT)
            if agent_id is None:
                return False
            
            # Import here to avoid circular imports
            from hopple.agents.worker_assignment.worker_assignment_agent import WorkerAssignmentAgent
            
            # Create agent
            worker_assignment = WorkerAssignmentAgent(parent_agent_id=agent_id)
            
            # Run agent - note that the worker assignment only takes project_id
            result = await worker_assignment.run(
                project_id=project_id
                # query parameter doesn't exist in the WorkerAssignmentAgent's run method
            )
            
            # Put agent to sleep
            self._put_agent_to_sleep(agent_id)
            
            # If we get a result dictionary with any entries, consider it successful
            return bool(result)
            
        except Exception as e:
            logger.error(f"Error running Worker Assignment Agent: {str(e)}")
            return False
    
    def _get_agent_instance(self, parent_id: uuid.UUID, agent_type: AgentType) -> Optional[uuid.UUID]:
        """
        Get or create an agent instance of the specified type.
        
        Args:
            parent_id: The parent agent ID
            agent_type: The type of agent to get/create
            
        Returns:
            The UUID of the agent, or None if creation failed
        """
        try:
            with db_session() as session:
                # Check if agent already exists
                agent = session.query(Agent).filter(
                    Agent.parent_agent_id == parent_id,
                    Agent.agent_type == agent_type.value
                ).first()
                
                if agent:
                    agent.status = AgentStatus.ACTIVE.value
                    agent.last_active = datetime.utcnow()
                    session.commit()
                    # Convert from SQLAlchemy UUID to Python UUID
                    return uuid.UUID(str(agent.id)) if agent.id else None
                
                # Create new agent
                new_agent = Agent(
                    name=f"{agent_type.value.title()} Agent",
                    agent_type=agent_type.value,
                    parent_agent_id=parent_id,
                    status=AgentStatus.ACTIVE.value,
                    last_active=datetime.utcnow()
                )
                session.add(new_agent)
                session.commit()
                session.refresh(new_agent)
                
                # Convert from SQLAlchemy UUID to Python UUID
                return uuid.UUID(str(new_agent.id)) if new_agent.id else None
                
        except Exception as e:
            logger.error(f"Error getting/creating agent instance: {str(e)}")
            return None
    
    def _put_agent_to_sleep(self, agent_id: uuid.UUID) -> None:
        """
        Put an agent to sleep (mark as inactive).
        
        Args:
            agent_id: The agent ID to put to sleep
        """
        if agent_id is None:
            return
            
        try:
            with db_session() as session:
                agent = session.query(Agent).filter(Agent.id == agent_id).first()
                if agent:
                    agent.status = AgentStatus.SLEEPING.value
                    session.commit()
        except Exception as e:
            logger.error(f"Error putting agent to sleep: {str(e)}")
    
    def _update_agent_status(self, status: AgentStatus, message: str) -> None:
        """
        Update the status of this agent in the database.
        
        Args:
            status: The new status
            message: Status message
        """
        if self.db_id is None:
            return
            
        try:
            with db_session() as session:
                agent = session.query(Agent).filter(Agent.id == self.db_id).first()
                if agent:
                    agent.status = status.value
                    agent.last_message = message
                    agent.last_active = datetime.utcnow()
                    session.commit()
        except Exception as e:
            logger.error(f"Error updating agent status: {str(e)}")
    
    def _save_agent_to_db(self) -> None:
        """Save or update this agent in the database."""
        try:
            with db_session() as session:
                if self.db_id:
                    # Update existing agent
                    agent = session.query(Agent).filter(Agent.id == self.db_id).first()
                    if agent:
                        agent.name = self.name
                        agent.agent_type = self.agent_type.value
                        agent.status = self.status.value
                        agent.last_active = datetime.utcnow()
                        session.commit()
                        return
                
                # Create new agent
                new_agent = Agent(
                    name=self.name,
                    agent_type=self.agent_type.value,
                    status=self.status.value,
                    last_active=datetime.utcnow()
                )
                session.add(new_agent)
                session.commit()
                session.refresh(new_agent)
                
                # Update instance ID
                self.db_id = new_agent.id
                
        except Exception as e:
            logger.error(f"Error saving agent to database: {str(e)}")
    
    async def terminate_agent(self, agent_id: uuid.UUID) -> bool:
        """
        Terminate a sub-agent.
        
        Args:
            agent_id: The ID of the agent to terminate
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with db_session() as session:
                agent = session.query(Agent).filter(
                    Agent.id == agent_id,
                    Agent.parent_agent_id == self.db_id
                ).first()
                
                if not agent:
                    logger.warning(f"Agent {agent_id} not found or not a sub-agent of this PM agent")
                    return False
                
                # Update status to terminated
                agent.status = AgentStatus.TERMINATED.value
                session.commit()
                
                logger.info(f"Agent {agent_id} terminated successfully")
                return True
                
        except Exception as e:
            logger.error(f"Error terminating agent: {str(e)}")
            return False
