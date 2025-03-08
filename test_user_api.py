"""
Test script for user API endpoints.
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

def test_create_user():
    """Test creating a user."""
    print("\n--- Testing User Creation ---")
    
    # Test data
    user_data = {
        "email": "test_user@example.com",
        "name": "Test User",
        "skills": ["Python", "FastAPI", "React"],
        "preferences": {
            "theme": "dark"
        },
        "notificationPreferences": {
            "email": True,
            "inApp": True
        }
    }
    
    # Make request
    url = f"{BASE_URL}/users/"
    print(f"POST {url}")
    response = requests.post(url, json=user_data)
    print_response(response, "Create User Response")
    
    return response.json() if response.status_code < 400 else None

def test_update_user(user_id):
    """Test updating a user."""
    if not user_id:
        print("Skipping user update (no user ID)")
        return
    
    print("\n--- Testing User Update ---")
    
    # Test data
    update_data = {
        "full_name": "Updated Test User",
        "skills_list": ["Python", "FastAPI", "React", "TypeScript"],
        "notificationPreferences": {
            "email": True,
            "inApp": False
        }
    }
    
    # Make request
    url = f"{BASE_URL}/users/{user_id}"
    print(f"PUT {url}")
    response = requests.put(url, json=update_data)
    print_response(response, "Update User Response")

def test_complete_onboarding():
    """Test completing onboarding."""
    print("\n--- Testing Onboarding Completion ---")
    
    # Test data
    onboarding_data = {
        "email": "onboarding_test@example.com",
        "name": "Onboarding User",
        "skills": ["JavaScript", "Next.js", "TypeScript"],
        "notificationPreferences": {
            "email": True,
            "inApp": True
        },
        "title": "Frontend Developer",
        "bio": "Passionate about building great UIs"
    }
    
    # Make request
    url = f"{BASE_URL}/users/onboarding"
    print(f"POST {url}")
    response = requests.post(url, json=onboarding_data)
    print_response(response, "Complete Onboarding Response")

def test_get_current_user():
    """Test getting the current user."""
    print("\n--- Testing Get Current User ---")
    
    # Make request
    url = f"{BASE_URL}/users/me"
    params = {"email": "test_user@example.com"}
    print(f"GET {url}?email={params['email']}")
    response = requests.get(url, params=params)
    print_response(response, "Get Current User Response")

def main():
    """Run the tests."""
    print(f"Testing against {BASE_URL}")
    
    # Run tests
    user_data = test_create_user()
    user_id = user_data.get("id") if user_data else None
    
    if user_id:
        test_update_user(user_id)
    
    test_complete_onboarding()
    test_get_current_user()

if __name__ == "__main__":
    main() 