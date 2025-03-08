"""
Task Creator Agent for Hopple.

This agent is responsible for breaking down requirements into tasks.
"""

import json
import uuid
from typing import Dict, List, Any, Optional, TypedDict
import requests  # type: ignore
from datetime import datetime
from sqlalchemy.orm import Session
from loguru import logger

from hopple.database.models.task import Task, TaskPriority, TaskStatus
from hopple.database.models.project import Project
from hopple.database.models.agent import AgentType, AgentRole, AgentStatus
from hopple.agents.base.base_agent import BaseAgent
from hopple.config.config import get_settings

# Get settings
settings = get_settings()

class Message(TypedDict):
    """Message type for conversation history."""
    role: str
    content: str

class TaskCreatorAgent(BaseAgent):
    """
    Task Creator Agent is responsible for breaking down requirements into tasks.
    
    It uses an LLM to analyze requirements and generate structured task data.
    """
    
    def __init__(
        self,
        name: str = "Task Creator",
        parent_agent_id: Optional[uuid.UUID] = None,
        model_name: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """Initialize the task creator agent."""
        super().__init__(
            name=name, 
            agent_type=AgentType.TASK_CREATOR, 
            agent_role=AgentRole.TASK_CREATOR,
            parent_agent_id=parent_agent_id
        )
        
        # Set configuration
        self.configuration = configuration or {}
        
        # Set model name
        self.model_name = model_name or settings.llm.LLM_MODEL
        
        # Initialize conversation history
        self.messages: List[Dict[str, str]] = []
        
        # Add system message
        self.add_message("system", """
        You are an expert project manager assistant specialized in breaking down project requirements 
        into well-defined, actionable tasks. Your job is to create an organized list of tasks from the project 
        requirements with the following fields for each task:
        
        - title: A clear, concise title for the task
        - description: A detailed description of what needs to be done
        - priority: One of "HIGH", "MEDIUM", or "LOW"
        - estimated_effort: Estimated hours to complete (integer)
        - dependencies: List of task titles that this task depends on (can be empty)
        - skills_required: List of skills required to complete this task
        
        Consider logical dependencies between tasks. If task B can only start after task A is complete, make task A a dependency of task B.
        Break down large requirements into smaller, manageable tasks. Aim for tasks that take 4-8 hours to complete.
        Respond with a JSON array of tasks, nothing else.
        """)
        
        # Set LLM API parameters
        self.temperature = self.configuration.get("temperature", settings.llm.LLM_TEMPERATURE)
        self.api_base_url = self.configuration.get("api_base_url", settings.llm.LLM_BASE_URL)
        
        logger.info(f"Task Creator Agent initialized: {self.name}")
    
    async def run(self, project_id: uuid.UUID, requirements: str, session: Optional[Session] = None) -> List[Dict[str, Any]]:
        """
        Process requirements and create tasks.
        
        Args:
            project_id: The project ID to create tasks for
            requirements: The project requirements text
            session: SQLAlchemy database session

        Returns:
            A list of created tasks
        """
        # Validate inputs
        if not requirements or not requirements.strip():
            logger.error("Requirements text is empty")
            return []
        
        # Create conversation
        self.add_message("human", f"Here are the requirements for a project: {requirements}")
        
        # Get database session
        if session is None:
            from hopple.database.db_config import SessionLocal
            session = SessionLocal()
            local_session = True
        else:
            local_session = False
        
        try:
            # Check if project exists
            project = session.query(Project).filter(Project.id == project_id).first()
            if not project:
                logger.error(f"Project with ID {project_id} not found")
                return []
            
            # Call LLM to generate tasks
            logger.info(f"Generating tasks for project: {project.name}")
            tasks_json = self._generate_tasks(requirements)
            
            # Parse and validate tasks
            try:
                tasks = json.loads(tasks_json)
                if not isinstance(tasks, list):
                    logger.error(f"Invalid tasks format, expected list but got: {type(tasks)}")
                    return []
                
                # Log number of tasks
                logger.info(f"Generated {len(tasks)} tasks")
                
                # Validate tasks
                validated_tasks = []
                for task in tasks:
                    if isinstance(task, dict) and "title" in task and "description" in task:
                        # Validate and set defaults
                        priority = task.get("priority", "MEDIUM").upper()
                        if priority not in ["HIGH", "MEDIUM", "LOW"]:
                            priority = "MEDIUM"
                        
                        validated_task = {
                            "title": task["title"],
                            "description": task["description"],
                            "priority": priority,
                            "estimated_effort": int(task.get("estimated_effort", 4)),
                            "skills_required": task.get("skills_required", []),
                            "dependencies": task.get("dependencies", []),
                        }
                        validated_tasks.append(validated_task)
                    else:
                        logger.warning(f"Skipping invalid task: {task}")
                
                # Save tasks to database
                created_tasks = self._create_tasks_in_db(
                    session, 
                    project_id, 
                    validated_tasks,
                    []  # Start with empty list for created tasks
                )
                
                # Update agent status
                self.update_status(AgentStatus.SUCCESS)
                
                return created_tasks
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse tasks JSON: {e}")
                self.update_status(AgentStatus.FAILED)
                return []
        except Exception as e:
            logger.error(f"Error generating tasks: {str(e)}")
            self.update_status(AgentStatus.FAILED)
            return []
        finally:
            # Close local session if created here
            if local_session:
                session.close()
    
    def _create_tasks_in_db(
        self, 
        session: Session, 
        project_id: uuid.UUID, 
        validated_tasks: List[Dict[str, Any]], 
        created_tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Create tasks in the database.
        
        Args:
            session: SQLAlchemy database session
            project_id: Project ID to create tasks for
            validated_tasks: List of validated task data
            created_tasks: List to store created task data
            
        Returns:
            List of created task data
        """
        # Create task objects
        task_objects = []
        dependency_map = {}
        
        # First pass: create all tasks
        for task_data in validated_tasks:
            task = Task(
                title=task_data["title"],
                description=task_data["description"],
                priority=TaskPriority[task_data["priority"]].value,
                status=TaskStatus.TODO.value,
                estimated_effort=task_data["estimated_effort"],
                project_id=project_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_completed=False,
                task_metadata={
                    "skills_required": task_data["skills_required"],
                    "dependencies": task_data["dependencies"],
                    "source": "task_creator_agent"
                }
            )
            session.add(task)
            session.flush()  # Flush to get the task ID
            
            # Store task in map for dependencies
            dependency_map[task_data["title"]] = task.id
            
            # Add to objects list
            task_objects.append(task)
            
            # Add to created tasks list
            created_tasks.append({
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "estimated_effort": task.estimated_effort,
                "skills_required": task_data["skills_required"],
                "dependencies": task_data["dependencies"]
            })
        
        # TODO: Second pass: handle dependencies
        # This would require setting up task dependencies in the database
        
        # Commit changes
        session.commit()
        
        return created_tasks
    
    def _generate_tasks(self, requirements: str) -> str:
        """
        Generate tasks from requirements using LLM.
        
        Args:
            requirements: Project requirements text
            
        Returns:
            JSON string containing generated tasks
        """
        # Add user message
        self.add_message("human", requirements)
        
        # Call LLM API based on provider
        result = self._call_ollama_api(requirements)
        
        # Add response to conversation
        self.add_message("ai", result)
        
        return result
    
    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to the conversation history.
        
        Args:
            role: The role of the message sender (system, human, or ai)
            content: The content of the message
        """
        message: Dict[str, str] = {"role": role, "content": content}
        self.messages.append(message)
    
    def get_messages(self) -> List[Dict[str, str]]:
        """
        Get the conversation history.
        
        Returns:
            A list of messages in the conversation
        """
        return self.messages

    def _call_ollama_api(self, prompt: str) -> str:
        """
        Call the Ollama API directly.
        
        Args:
            prompt: The prompt to send to the LLM
            
        Returns:
            The LLM's response
        """
        try:
            # Format system and conversation context
            system_prompt = next((m["content"] for m in self.messages if m["role"] == "system"), "")
            
            # Call Ollama API
            response = requests.post(
                f"{self.api_base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": f"{system_prompt}\n\nRequirements:\n{prompt}\n\nCreate a JSON array of tasks based on these requirements:",
                    "system": "You are a task creator agent that breaks down project requirements into well-defined tasks. Respond with ONLY a JSON array of tasks.",
                    "temperature": self.temperature
                },
                timeout=60
            )
            
            if response.status_code != 200:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return "[]"
            
            result = response.json()
            
            # Extract response
            response_text = result.get("response", "[]")
            
            # Try to find JSON array in the response
            if not response_text.strip().startswith("["):
                # Try to extract JSON part
                start_idx = response_text.find("[")
                end_idx = response_text.rfind("]") + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    response_text = response_text[start_idx:end_idx]
                else:
                    logger.warning(f"Could not find JSON array in response: {response_text}")
                    return "[]"
            
            # Validate JSON
            try:
                json.loads(response_text)
                return response_text
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON response: {response_text}")
                return "[]"
                
        except Exception as e:
            logger.error(f"Error calling Ollama API: {str(e)}")
            return "[]" 