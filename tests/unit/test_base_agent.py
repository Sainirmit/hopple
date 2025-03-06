"""
Tests for the BaseAgent class.
"""

import pytest
import uuid
from unittest.mock import patch, MagicMock

from hopple.agents.base.base_agent import BaseAgent
from hopple.database.models.agent import AgentType, AgentStatus


# Create a concrete implementation of BaseAgent for testing
class TestAgent(BaseAgent):
    """Test implementation of BaseAgent."""
    
    def __init__(self, name="Test Agent", **kwargs):
        # Mock the _initialize_db_agent method to avoid DB operations
        with patch.object(BaseAgent, '_initialize_db_agent'):
            super().__init__(name=name, agent_type=AgentType.CUSTOM, **kwargs)
            # Set a test DB ID manually
            self.db_id = uuid.uuid4()
    
    async def run(self, *args, **kwargs):
        """Implement the abstract run method."""
        return "Test result"


@pytest.fixture
def mock_db_session():
    """Mock the db_session context manager."""
    with patch("hopple.agents.base.base_agent.db_session") as mock:
        session = MagicMock()
        mock.return_value.__enter__.return_value = session
        
        # Mock the agent model returned by the query
        agent_model = MagicMock()
        session.query.return_value.filter.return_value.first.return_value = agent_model
        
        yield mock, session, agent_model


class TestBaseAgent:
    """Tests for the BaseAgent class."""
    
    def test_initialization(self, mock_db_session):
        """Test that the agent initializes correctly."""
        mock, session, _ = mock_db_session
        
        # Create a test agent with mocked _initialize_db_agent
        with patch.object(BaseAgent, '_initialize_db_agent'):
            agent = TestAgent()
            # Set a test DB ID manually
            agent.db_id = uuid.uuid4()
        
        # Check that the agent was initialized correctly
        assert agent.name == "Test Agent"
        assert agent.agent_type == AgentType.CUSTOM
        assert agent.db_id is not None
    
    def test_add_message(self):
        """Test adding messages to the agent."""
        with patch("hopple.agents.base.base_agent.db_session"):
            agent = TestAgent()
            
            # Add messages of different types
            agent.add_message("system", "System message")
            agent.add_message("human", "Human message")
            agent.add_message("ai", "AI message")
            
            # Check that the messages were added
            assert len(agent.messages) == 3
            assert agent.messages[0].content == "System message"
            assert agent.messages[1].content == "Human message"
            assert agent.messages[2].content == "AI message"
    
    def test_update_status(self, mock_db_session):
        """Test updating the agent's status."""
        mock, session, agent_model = mock_db_session
        
        # Create a test agent
        agent = TestAgent()
        
        # Update the status
        agent.update_status(AgentStatus.SLEEPING)
        
        # Check that the method was called on the agent model
        # We can't directly check the status value since it's a mock
        # Instead, verify that the query was executed correctly
        session.query.assert_called_once()
        session.query.return_value.filter.assert_called_once()
    
    def test_cache_operations(self, mock_db_session):
        """Test cache operations."""
        mock, session, agent_model = mock_db_session
        
        # Create a test agent
        agent = TestAgent()
        
        # Test update_cache
        agent.update_cache("test_key", "test_value")
        assert agent.cache["test_key"] == "test_value"
        
        # Test get_cache
        assert agent.get_cache("test_key") == "test_value"
        assert agent.get_cache("nonexistent_key", "default") == "default"
        
        # Test clear_cache
        agent.clear_cache()
        assert agent.cache == {}
