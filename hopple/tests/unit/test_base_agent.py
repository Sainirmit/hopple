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
        super().__init__(name=name, agent_type=AgentType.CUSTOM, **kwargs)
    
    async def run(self, *args, **kwargs):
        """Implement the abstract run method."""
        return "Test result"


@pytest.fixture
def mock_db_session():
    """Mock the db_session context manager."""
    with patch("hopple.agents.base.base_agent.db_session") as mock:
        session = MagicMock()
        mock.return_value.__enter__.return_value = session
        yield mock, session


class TestBaseAgent:
    """Tests for the BaseAgent class."""
    
    def test_initialization(self, mock_db_session):
        """Test that the agent initializes correctly."""
        mock, session = mock_db_session
        
        # Create a test agent
        agent = TestAgent()
        
        # Check that the agent was initialized correctly
        assert agent.name == "Test Agent"
        assert agent.agent_type == AgentType.CUSTOM
        assert agent.db_id is not None
        
        # Check that the agent was added to the database
        assert session.add.called
        assert session.commit.called
    
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
        mock, session = mock_db_session
        
        # Mock the query result
        agent_model = MagicMock()
        session.query.return_value.filter.return_value.first.return_value = agent_model
        
        # Create a test agent
        agent = TestAgent()
        
        # Update the status
        agent.update_status(AgentStatus.SLEEPING)
        
        # Check that the status was updated in the database
        assert agent_model.update_status.called
        agent_model.update_status.assert_called_with(AgentStatus.SLEEPING)
    
    def test_cache_operations(self, mock_db_session):
        """Test cache operations."""
        mock, session = mock_db_session
        
        # Mock the query result
        agent_model = MagicMock()
        session.query.return_value.filter.return_value.first.return_value = agent_model
        
        # Create a test agent
        agent = TestAgent()
        
        # Test update_cache
        agent.update_cache("test_key", "test_value")
        assert agent.cache["test_key"] == "test_value"
        assert agent_model.update_cache.called
        
        # Test get_cache
        assert agent.get_cache("test_key") == "test_value"
        assert agent.get_cache("nonexistent_key", "default") == "default"
        
        # Test clear_cache
        agent.clear_cache()
        assert agent.cache == {}
        assert agent_model.clear_cache.called
