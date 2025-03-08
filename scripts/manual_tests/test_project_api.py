"""
Test script for project API endpoints with user association.
"""

import json
import requests
import sys
from urllib.parse import urljoin

# Set base URL from arguments or use default
if len(sys.argv) > 1:
    BASE_URL = sys.argv[1]
else:
    BASE_URL = "http://localhost:8000/api/v1"

def print_response(response, message="Response"):
    """Print formatted response."""
    try:
        json_response = response.json()
        print(f"{message} ({response.status_code}):")
        print(json.dumps(json_response, indent=2))
    except ValueError:
        print(f"{message} ({response.status_code}):")
        print(response.text)

def create_test_user():
    """Create a test user to associate with projects."""
    print("\n--- Creating Test User ---")
    
    # Test data
    user_data = {
        "email": "project_test_user@example.com",
        "name": "Project Test User",
        "skills": ["Project Management", "Agile", "Scrum"]
    }
    
    # Make request
    url = f"{BASE_URL}/users/"
    print(f"POST {url}")
    response = requests.post(url, json=user_data)
    print_response(response, "Create User Response")
    
    return response.json() if response.status_code < 400 else None

def test_create_project(user_id=None):
    """Test creating a project, optionally associated with a user."""
    print("\n--- Testing Project Creation ---")
    
    # Test data
    project_data = {
        "name": "Test Project",
        "description": "A test project for API testing"
    }
    
    # Add user ID if provided
    if user_id:
        project_data["userId"] = user_id
    
    # Make request
    url = f"{BASE_URL}/projects/"
    print(f"POST {url}")
    response = requests.post(url, json=project_data)
    print_response(response, "Create Project Response")
    
    return response.json() if response.status_code < 400 else None

def test_get_user_projects(user_id):
    """Test retrieving projects for a specific user."""
    if not user_id:
        print("Skipping user projects retrieval (no user ID)")
        return
    
    print("\n--- Testing User Project Retrieval ---")
    
    # Make request
    url = f"{BASE_URL}/projects/"
    params = {"userId": user_id}
    print(f"GET {url}?userId={user_id}")
    response = requests.get(url, params=params)
    print_response(response, "Get User Projects Response")

def test_get_project(project_id):
    """Test retrieving a specific project."""
    if not project_id:
        print("Skipping project retrieval (no project ID)")
        return
    
    print("\n--- Testing Project Retrieval ---")
    
    # Make request
    url = f"{BASE_URL}/projects/{project_id}"
    print(f"GET {url}")
    response = requests.get(url)
    print_response(response, "Get Project Response")

def main():
    """Run the tests."""
    print(f"Testing against {BASE_URL}")
    
    # Create test user
    user_data = create_test_user()
    user_id = user_data.get("id") if user_data else None
    
    # Create project without user association
    project_data = test_create_project()
    project_id = project_data.get("id") if project_data else None
    
    # Create project with user association
    if user_id:
        user_project_data = test_create_project(user_id)
        user_project_id = user_project_data.get("id") if user_project_data else None
    else:
        user_project_id = None
    
    # Get project by ID
    if project_id:
        test_get_project(project_id)
    
    # Get user's projects
    if user_id:
        test_get_user_projects(user_id)

if __name__ == "__main__":
    main() 