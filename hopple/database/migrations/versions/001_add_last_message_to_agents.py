"""Migration to add last_message column to agents table."""

from sqlalchemy import Column, Text
from alembic import op


def upgrade():
    """Add last_message column to agents table."""
    op.add_column('agents', Column('last_message', Text, nullable=True))


def downgrade():
    """Remove last_message column from agents table."""
    op.drop_column('agents', 'last_message') 