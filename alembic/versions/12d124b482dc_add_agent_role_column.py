"""add_agent_role_column

Revision ID: 12d124b482dc
Revises: b4343f31163b
Create Date: 2025-03-08 12:58:53.858031

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12d124b482dc'
down_revision: Union[str, None] = 'b4343f31163b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
