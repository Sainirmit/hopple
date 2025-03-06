"""
Logging configuration for Hopple.
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path

from loguru import logger

from hopple.config.config import get_settings


def setup_logger():
    """
    Configure the logger for Hopple.
    
    This sets up loguru with appropriate settings based on the environment:
    - In development: Output to console with colors and appropriate format
    - In production: Output to both console and log files
    
    Returns:
        The configured logger instance
    """
    settings = get_settings()
    
    # Remove any existing handlers
    logger.remove()
    
    # Define log format
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    # Add console handler
    logger.add(
        sys.stderr,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=True
    )
    
    # In production, also log to file
    if settings.ENV == "production":
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Log file with date
        log_file = log_dir / f"hopple_{datetime.now().strftime('%Y%m%d')}.log"
        
        # Add file handler
        logger.add(
            log_file,
            format=log_format,
            level=settings.LOG_LEVEL,
            rotation="500 MB",
            retention="10 days",
            compression="zip"
        )
    
    # Configure logging for other libraries
    intercept_standard_logging()
    
    logger.info(f"Logger initialized with level {settings.LOG_LEVEL}")
    return logger


def intercept_standard_logging():
    """
    Intercept standard Python logging and redirect to loguru.
    This helps capture logs from libraries that use standard logging.
    """
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Get corresponding Loguru level if it exists
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno
            
            # Find caller from where the logged message originated
            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1
            
            logger.opt(depth=depth, exception=record.exc_info).log(
                level, record.getMessage()
            )
    
    # Intercept all standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)


# Configure the logger on module import
setup_logger()
