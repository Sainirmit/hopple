"""
Base service class for Hopple.

This module provides a base service class that implements the repository pattern
for database operations, separating business logic from data access.
"""

from typing import Generic, TypeVar, Type, List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi import HTTPException
import uuid

from hopple.database.db_config import Base
from hopple.utils.logger import logger

# Generic type variables
T = TypeVar('T', bound=Base)  # SQLAlchemy model
P = TypeVar('P', bound=BaseModel)  # Pydantic schema for create
U = TypeVar('U', bound=BaseModel)  # Pydantic schema for update


class BaseService(Generic[T, P, U]):
    """
    Base service class that implements common CRUD operations.
    
    This class uses the repository pattern to separate business logic
    from data access, improving maintainability and testability.
    """
    
    def __init__(self, model: Type[T], db: Session):
        """
        Initialize the service with the model and database session.
        
        Args:
            model: The SQLAlchemy model class
            db: The database session
        """
        self.model = model
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100, **filters) -> List[T]:
        """
        Get all records, with optional pagination and filtering.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            **filters: Optional filters to apply
            
        Returns:
            List of records
        """
        query = self.db.query(self.model)
        
        # Apply filters
        for attr, value in filters.items():
            if hasattr(self.model, attr):
                query = query.filter(getattr(self.model, attr) == value)
        
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, record_id: Union[str, uuid.UUID]) -> Optional[T]:
        """
        Get a record by its ID.
        
        Args:
            record_id: The record ID
            
        Returns:
            The record if found, None otherwise
        """
        if isinstance(record_id, str):
            try:
                record_id = uuid.UUID(record_id)
            except ValueError:
                logger.error(f"Invalid ID format: {record_id}")
                return None
        
        return self.db.query(self.model).filter(self.model.id == record_id).first()
    
    def create(self, create_data: Union[P, Dict[str, Any]]) -> T:
        """
        Create a new record.
        
        Args:
            create_data: Data for the new record
            
        Returns:
            The created record
        """
        # Convert Pydantic model to dict if needed
        data = create_data.dict() if hasattr(create_data, 'dict') else create_data
        
        # Create new record
        db_record = self.model(**data)
        self.db.add(db_record)
        self.db.commit()
        self.db.refresh(db_record)
        return db_record
    
    def update(self, record_id: Union[str, uuid.UUID], update_data: Union[U, Dict[str, Any]]) -> Optional[T]:
        """
        Update an existing record.
        
        Args:
            record_id: The record ID
            update_data: Data to update
            
        Returns:
            The updated record if found, None otherwise
        """
        # Convert to UUID if string
        if isinstance(record_id, str):
            try:
                record_id = uuid.UUID(record_id)
            except ValueError:
                logger.error(f"Invalid ID format: {record_id}")
                raise HTTPException(status_code=400, detail="Invalid ID format")
        
        # Get record
        db_record = self.db.query(self.model).filter(self.model.id == record_id).first()
        if not db_record:
            return None
        
        # Convert Pydantic model to dict if needed
        data = update_data.dict() if hasattr(update_data, 'dict') else update_data
        
        # Update record
        for key, value in data.items():
            if hasattr(db_record, key):
                setattr(db_record, key, value)
        
        self.db.commit()
        self.db.refresh(db_record)
        return db_record
    
    def delete(self, record_id: Union[str, uuid.UUID]) -> bool:
        """
        Delete a record.
        
        Args:
            record_id: The record ID
            
        Returns:
            True if deleted, False otherwise
        """
        # Convert to UUID if string
        if isinstance(record_id, str):
            try:
                record_id = uuid.UUID(record_id)
            except ValueError:
                logger.error(f"Invalid ID format: {record_id}")
                raise HTTPException(status_code=400, detail="Invalid ID format")
        
        # Get record
        db_record = self.db.query(self.model).filter(self.model.id == record_id).first()
        if not db_record:
            return False
        
        self.db.delete(db_record)
        self.db.commit()
        return True 