"""
Task Creator Agent for Hopple.

This agent is responsible for creating tasks based on project requirements.
"""

import uuid
from typing import Dict, Any, List, Optional, Tuple, cast
import json
import requests

from loguru import logger
from langchain_community.llms import Ollama
from sqlalchemy.orm import Session

from hopple.agents.base.base_agent import BaseAgent
from hopple.database.models import Agent as AgentModel, AgentType, AgentStatus
from hopple.database.models import Task, TaskPriority, TaskStatus, TaskDependency
from hopple.database.models import Project
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
        
        # Initialize messages list for conversation history
        self.messages = []
        
        # System prompt for the agent
        self.system_prompt = """
        You are Hopple's Task Creator Agent, responsible for analyzing project requirements
        and creating well-defined tasks. Your goal is to break down complex requirements
        into manageable tasks with clear descriptions, effort estimates, and dependencies.
        
        For each task, you should provide:
        1. Title: A concise, descriptive title
        2. Description: A clear explanation of what needs to be done
        3. Estimated Effort: A numeric value (1-10) representing the relative effort
        4. Priority: One of [HIGH, MEDIUM, LOW]
        5. Dependencies: List of other task titles this task depends on
        6. Skills: List of skills required to complete the task
        
        Always ensure tasks are atomic, well-defined, and have clear acceptance criteria.
        """
        
        self.add_message("system", self.system_prompt)
        
        logger.info(f"Task Creator Agent initialized: {self.name}")
    
    async def run(self, project_id: uuid.UUID, requirements: str, session: Optional[Session] = None) -> List[Dict[str, Any]]:
        """
        Run the Task Creator Agent to generate tasks from project requirements.
        
        Args:
            project_id: The ID of the project
            requirements: The project requirements
            session: Optional SQLAlchemy session to use
            
        Returns:
            A list of created tasks
        """
        logger.info(f"Task Creator Agent running for project: {project_id}")
        
        # Add the requirements to messages
        prompt = f"""
        Given the following project requirements, create a list of well-defined tasks.
        For each task, provide:
        1. A clear, concise title
        2. A detailed description
        3. Estimated effort in hours
        4. Priority level (LOW, MEDIUM, HIGH, CRITICAL)
        5. Required skills
        6. Dependencies on other tasks (if any)

        Requirements:
        {requirements}

        Format your response as a JSON array of tasks, where each task has the following structure:
        {{
            "title": "string",
            "description": "string",
            "estimated_effort": number,
            "priority": "LOW|MEDIUM|HIGH|CRITICAL",
            "skills": ["skill1", "skill2", ...],
            "dependencies": ["task_title1", "task_title2", ...]
        }}

        Ensure tasks are:
        - Specific and actionable
        - Properly sized (not too big or too small)
        - Logically ordered with clear dependencies
        - Aligned with project goals
        
        IMPORTANT: Your response must be valid JSON. Do not include any explanations or text outside the JSON array.
        """
        
        self.add_message("human", prompt)
        
        # Call the LLM to analyze requirements and generate tasks
        try:
            # Use direct Ollama API call
            response_text = self._call_ollama_api(prompt)
            
            # Try to extract JSON from the response
            try:
                # Find the first [ and last ] to extract the JSON array
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    tasks_data = json.loads(json_str)
                else:
                    # Try to parse the entire response as JSON
                    tasks_data = json.loads(response_text)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from response: {response_text}")
                # Provide a fallback response with a default task
                tasks_data = [
                    {
                        "title": "Analyze Project Requirements",
                        "description": "Review and analyze the project requirements to understand the scope and objectives.",
                        "estimated_effort": 4,
                        "priority": "HIGH",
                        "skills": ["Analysis", "Project Management"],
                        "dependencies": []
                    }
                ]
                logger.info("Using fallback task data due to JSON parsing error")
            
            # Validate and clean up the response
            validated_tasks = []
            for task_data in tasks_data:
                try:
                    # Ensure required fields are present
                    title = task_data["title"]
                    description = task_data["description"]
                    estimated_effort = int(task_data["estimated_effort"])
                    priority = TaskPriority(task_data["priority"].lower())
                    skills = task_data.get("skills", [])
                    dependencies = task_data.get("dependencies", [])
                    
                    validated_tasks.append({
                        "title": title,
                        "description": description,
                        "estimated_effort": estimated_effort,
                        "priority": priority,
                        "skills": skills,
                        "dependencies": dependencies
                    })
                except (KeyError, ValueError, TypeError) as e:
                    logger.warning(f"Invalid task data: {task_data}. Error: {str(e)}")
                    continue
            
            # Store tasks in the database
            created_tasks: List[Dict[str, Any]] = []
            db_sess = session
            if db_sess is None:
                with db_session() as db_sess:
                    return self._create_tasks_in_db(db_sess, project_id, validated_tasks, created_tasks)
            else:
                return self._create_tasks_in_db(db_sess, project_id, validated_tasks, created_tasks)
            
        except Exception as e:
            logger.error(f"Error creating tasks: {str(e)}")
            self.update_metrics(success=False)
            raise 

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
            session: SQLAlchemy session
            project_id: The ID of the project
            validated_tasks: List of validated task data
            created_tasks: List to store created tasks
            
        Returns:
            List of created tasks
        """
        # Check if project exists
        project = session.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error(f"Project {project_id} not found")
            raise ValueError(f"Project {project_id} not found")

        # Create tasks first
        task_map = {}  # Map of title to task object for dependency resolution
        for task_data in validated_tasks:
            task = Task(
                title=task_data["title"],
                description=task_data["description"],
                estimated_effort=task_data["estimated_effort"],
                priority=task_data["priority"],
                project_id=project_id,
                created_by_agent_id=self.db_id,
                task_metadata={
                    "skills": task_data["skills"],
                    "original_dependencies": task_data["dependencies"]
                }
            )
            session.add(task)
            session.flush()  # Flush to get the task ID
            task_map[task_data["title"]] = task
            created_tasks.append(task_data)
        
        # Now create task dependencies
        for task_data in validated_tasks:
            task = task_map[task_data["title"]]
            for dep_title in task_data["dependencies"]:
                if dep_title in task_map:
                    dep_task = task_map[dep_title]
                    # Create dependency relationship
                    task_dependency = TaskDependency(
                        task_id=task.id,
                        depends_on_id=dep_task.id
                    )
                    session.add(task_dependency)
        
        session.commit()
        
        # Generate summary for the conversation
        tasks_summary = "\n".join([
            f"- {task['title']}: {task['description']} "
            f"(Priority: {task['priority']}, Effort: {task['estimated_effort']}h)"
            for task in created_tasks
        ])
        response = f"I've analyzed the requirements and created the following tasks:\n\n{tasks_summary}"
        
        self.add_message("ai", response)
        
        # Update metrics
        self.update_metrics(success=True)
        
        # After creating tasks, put the agent to sleep
        self.sleep()
        
        return created_tasks

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