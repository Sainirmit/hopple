"""
Main entry point for the Hopple application.
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from hopple.config.config import get_settings, load_config
from hopple.utils.logger import logger
from hopple.database.db_config import init_db


def main():
    """Run the Hopple application."""
    try:
        # Load configuration
        config_file = os.environ.get("HOPPLE_CONFIG", "config.yaml")
        settings = load_config(config_file)
        
        logger.info(f"Starting Hopple in {settings.ENV} mode")
        
        # Initialize the database
        init_db()
        logger.info("Database initialized")
        
        # Run the API server
        logger.info(f"Starting API server at {settings.api.API_HOST}:{settings.api.API_PORT}")
        uvicorn.run(
            "hopple.api.app:app",
            host=settings.api.API_HOST,
            port=settings.api.API_PORT,
            reload=settings.api.API_RELOAD,
            log_level=settings.LOG_LEVEL.lower()
        )
    except Exception as e:
        logger.error(f"Error starting Hopple: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
