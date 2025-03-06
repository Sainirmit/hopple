"""
Configuration module for Hopple.
This module manages loading and accessing configuration from various sources:
- Environment variables
- Configuration files
- Default values
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional, Set

import yaml
from pydantic import BaseModel, Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """Database connection settings."""
    
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=5432)
    DB_USER: str = Field(default="postgres")
    DB_PASSWORD: str = Field(default="postgres")
    DB_NAME: str = Field(default="hopple")
    
    @property
    def connection_string(self) -> str:
        """Get the database connection string."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="HOPPLE_",
        extra="allow"
    )


class LLMSettings(BaseSettings):
    """LLM configuration settings."""
    
    LLM_PROVIDER: str = Field(default="ollama")
    LLM_MODEL: str = Field(default="mistral:7b")
    LLM_API_KEY: Optional[str] = Field(default=None)
    LLM_BASE_URL: str = Field(default="http://localhost:11434")
    LLM_TEMPERATURE: float = Field(default=0.7)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="HOPPLE_",
        extra="allow"
    )


class APISettings(BaseSettings):
    """API server settings."""
    
    API_HOST: str = Field(default="0.0.0.0")
    API_PORT: int = Field(default=8000)
    API_DEBUG: bool = Field(default=False)
    API_RELOAD: bool = Field(default=False)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="HOPPLE_",
        extra="allow"
    )


class Settings(BaseSettings):
    """Main settings container."""
    
    ENV: str = Field(default="development")
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")
    
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    llm: LLMSettings = Field(default_factory=LLMSettings)
    api: APISettings = Field(default_factory=APISettings)
    
    @field_validator("ENV")
    @classmethod
    def validate_env(cls, v: str) -> str:
        """Validate environment name."""
        allowed: Set[str] = {"development", "testing", "production"}
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
        
        return cls.model_validate(config_data)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="HOPPLE_",
        extra="allow"
    )


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
