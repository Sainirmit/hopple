"""
Pytest configuration for Hopple tests.
"""

import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from hopple.database.db_config import Base
from hopple.config.config import get_settings, Settings


@pytest.fixture(scope="session")
def test_settings():
    """Get test settings with test database configuration."""
    # Override settings for testing
    os.environ["HOPPLE_ENV"] = "testing"
    os.environ["HOPPLE_DB_NAME"] = "hopple_test"
    
    return get_settings()


@pytest.fixture(scope="session")
def test_db_engine(test_settings):
    """Create a test database engine."""
    # Create a test database engine
    engine = create_engine(
        test_settings.database.connection_string,
        poolclass=NullPool,
        echo=False
    )
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    yield engine
    
    # Drop all tables after tests
    Base.metadata.drop_all(engine)


@pytest.fixture(scope="function")
def test_db_session(test_db_engine):
    """Create a test database session."""
    # Create a session factory
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_db_engine)
    
    # Create a session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()
