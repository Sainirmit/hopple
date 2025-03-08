# Scripts Directory

This directory contains utility scripts and manual tests for the Hopple project.

## Manual Tests

The `manual_tests` directory contains scripts that can be run to manually test different parts of the application:

- `test_api_connection.py` - Tests connectivity to the API endpoints
- `test_pm_agent.py` - Tests the project management agent functionality
- `test_project_api.py` - Tests the project API endpoints
- `test_user_api.py` - Tests the user API endpoints

These are standalone Python scripts that can be run directly (not through pytest).

To run a script:

```bash
python scripts/manual_tests/test_api_connection.py
```

Note: Make sure the API server is running before executing these scripts.
