"""
Test script for Project Manager Agent API.
"""

import asyncio
import json
import uuid
import httpx

API_BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 60.0  # 60 seconds timeout


async def create_project():
    """Create a new project."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT)) as client:
        response = await client.post(
            f"{API_BASE_URL}/projects/",
            json={
                "name": "Test Project",
                "description": "A test project for the PM Agent"
            }
        )
        
        if response.status_code == 200:
            project_data = response.json()
            print(f"Created project: {project_data}")
            return project_data["id"]
        else:
            print(f"Error creating project: {response.text}")
            return None


async def query_pm_agent(project_id, query):
    """Send a query to the PM agent."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT)) as client:
        response = await client.post(
            f"{API_BASE_URL}/agents/pm/{project_id}/query",
            json={"query": query}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"PM Agent response: {result['response']}")
            return result
        else:
            print(f"Error querying PM agent: {response.text}")
            return None


async def get_agents():
    """Get all agents."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT)) as client:
        response = await client.get(f"{API_BASE_URL}/agents")
        
        if response.status_code == 200:
            agents = response.json()
            print(f"Found {len(agents)} agents:")
            for agent in agents:
                print(f"  - {agent['name']} ({agent['type']}): {agent['status']}")
            return agents
        else:
            print(f"Error getting agents: {response.text}")
            return None


async def get_pm_sub_agents(pm_agent_id):
    """Get sub-agents of a PM agent."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT)) as client:
        response = await client.get(
            f"{API_BASE_URL}/agents/pm/{pm_agent_id}/sub-agents"
        )
        
        if response.status_code == 200:
            result = response.json()
            print("Sub-agents:")
            print(f"  Active: {len(result['sub_agents']['active'])}")
            print(f"  Sleeping: {len(result['sub_agents']['sleeping'])}")
            print(f"  Other: {len(result['sub_agents']['other'])}")
            return result
        else:
            print(f"Error getting sub-agents: {response.text}")
            return None


async def main():
    # Create a project
    project_id = await create_project()
    if not project_id:
        return
    
    # Send queries to the PM agent
    await query_pm_agent(project_id, "Create tasks for a web application with user authentication")
    
    # Get all agents
    agents = await get_agents()
    if not agents:
        return
    
    # Find the PM agent
    pm_agent = next((a for a in agents if a["type"] == "project_manager"), None)
    if not pm_agent:
        print("No PM agent found")
        return
    
    # Get sub-agents of the PM agent
    await get_pm_sub_agents(pm_agent["id"])
    
    # Send another query
    await query_pm_agent(project_id, "Prioritize the tasks")
    
    # Check sub-agents again
    await get_pm_sub_agents(pm_agent["id"])
    
    # Send another query
    await query_pm_agent(project_id, "Assign workers to the tasks")
    
    # Check sub-agents again
    await get_pm_sub_agents(pm_agent["id"])


if __name__ == "__main__":
    asyncio.run(main()) 