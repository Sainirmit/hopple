"""
Configuration module for Hopple.
This module manages loading and accessing configuration from various sources:
- Environment variables
- Configuration files
- Default values
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional

import yaml
from pydantic import BaseSettings, Field, validator


class DatabaseSettings(BaseSettings):
    """Database connection settings."""
    
    DB_HOST: str = Field("localhost", env="HOPPLE_DB_HOST")
    DB_PORT: int = Field(5432, env="HOPPLE_DB_PORT")
    DB_USER: str = Field("postgres", env="HOPPLE_DB_USER")
    DB_PASSWORD: str = Field(..., env="HOPPLE_DB_PASSWORD")
    DB_NAME: str = Field("hopple", env="HOPPLE_DB_NAME")
    
    @property
    def connection_string(self) -> str:
        """Get the database connection string."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        env_file = ".env"


class LLMSettings(BaseSettings):
    """LLM configuration settings."""
    
    LLM_PROVIDER: str = Field("ollama", env="HOPPLE_LLM_PROVIDER")
    LLM_MODEL: str = Field("mistral:7b", env="HOPPLE_LLM_MODEL")
    LLM_API_KEY: Optional[str] = Field(None, env="HOPPLE_LLM_API_KEY")
    LLM_BASE_URL: str = Field("http://localhost:11434", env="HOPPLE_LLM_BASE_URL")
    LLM_TEMPERATURE: float = Field(0.7, env="HOPPLE_LLM_TEMPERATURE")
    
    class Config:
        env_file = ".env"


class APISettings(BaseSettings):
    """API server settings."""
    
    API_HOST: str = Field("0.0.0.0", env="HOPPLE_API_HOST")
    API_PORT: int = Field(8000, env="HOPPLE_API_PORT")
    API_DEBUG: bool = Field(False, env="HOPPLE_API_DEBUG")
    API_RELOAD: bool = Field(False, env="HOPPLE_API_RELOAD")
    
    class Config:
        env_file = ".env"


class Settings(BaseSettings):
    """Main settings container."""
    
    ENV: str = Field("development", env="HOPPLE_ENV")
    DEBUG: bool = Field(False, env="HOPPLE_DEBUG")
    LOG_LEVEL: str = Field("INFO", env="HOPPLE_LOG_LEVEL")
    
    database: DatabaseSettings = DatabaseSettings()
    llm: LLMSettings = LLMSettings()
    api: APISettings = APISettings()
    
    @validator("ENV")
    def validate_env(cls, v: str) -> str:
        """Validate environment name."""
        allowed = {"development", "testing", "production"}
        if v not in allowed:
            raise ValueError(f"ENV must be one of {allowed}")
        return v
    
    @classmethod
    def load_from_file(cls, config_file: str) -> "Settings":
        """Load configuration from a YAML file."""
        if not os.path.exists(config_file):
            return cls()
        
        with open(config_file, "r") as f:
            config_data = yaml.safe_load(f)
        
        return cls.parse_obj(config_data)
    
    class Config:
        env_file = ".env"


# Create a singleton instance
settings = Settings()


def load_config(config_file: Optional[str] = None) -> Settings:
    """Load configuration from environment and optional config file."""
    global settings
    
    if config_file and os.path.exists(config_file):
        settings = Settings.load_from_file(config_file)
    
    return settings


def get_settings() -> Settings:
    """Get the current settings."""
    return settings
