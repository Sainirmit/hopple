"""
Database configuration module for Hopple.
This module sets up the database connection and sessions.
"""

from contextlib import contextmanager
from typing import Generator, Any, Type, TypeVar, cast

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from hopple.config.config import get_settings

# Create engine and session factory
settings = get_settings()
engine = create_engine(
    settings.database.connection_string,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()
# Type alias for mypy
DeclarativeBase = Type[Base]


def get_db() -> Generator[Session, None, None]:
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def db_session() -> Generator[Session, None, None]:
    """Context manager for database sessions."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db() -> None:
    """Initialize the database by creating all tables."""
    # Import all models here to ensure they are registered with SQLAlchemy
    from hopple.database.models.task import Task  # noqa
    from hopple.database.models.agent import Agent  # noqa
    from hopple.database.models.user import User  # noqa
    from hopple.database.models.project import Project  # noqa
    
    # Create tables
    Base.metadata.create_all(bind=engine)


def create_tables() -> None:
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def drop_tables() -> None:
    """Drop all database tables."""
    Base.metadata.drop_all(bind=engine)
