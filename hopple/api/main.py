"""
Main entry point for the Hopple API server.
"""

import uvicorn
from hopple.config.config import get_settings

def main():
    """Run the API server."""
    settings = get_settings()
    uvicorn.run(
        "hopple.api.app:app",
        host=settings.api.API_HOST,
        port=settings.api.API_PORT,
        reload=settings.api.API_RELOAD
    )

if __name__ == "__main__":
    main() 