import requests

def test_connection():
    try:
        # Try the health endpoint
        health_response = requests.get("http://localhost:8000/health")
        print(f"Health endpoint status: {health_response.status_code}")
        if health_response.status_code == 200:
            print(f"Health response: {health_response.json()}")
    except Exception as e:
        print(f"Health endpoint error: {str(e)}")
    
    try:
        # Try the API endpoint
        api_response = requests.get("http://localhost:8000/api/v1/users", params={"email": "test@example.com"})
        print(f"API endpoint status: {api_response.status_code}")
        if api_response.status_code == 200:
            print(f"API response: {api_response.json()}")
    except Exception as e:
        print(f"API endpoint error: {str(e)}")

if __name__ == "__main__":
    test_connection() 