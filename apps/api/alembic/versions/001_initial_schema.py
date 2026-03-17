"""Initial schema - workspaces and policies

Revision ID: 001
Revises: 
Create Date: 2026-03-17

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'workspaces',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('industry', sa.String(255), nullable=False),
        sa.Column('countries_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('workspace_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workspaces.id'), nullable=False, index=True),
        sa.Column('country_code', sa.String(10), nullable=False),
        sa.Column('data_type', sa.String(100), nullable=False),
        sa.Column('restriction_level', sa.String(20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('source_url', sa.String(2048), nullable=True),
        sa.Column('effective_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "restriction_level IN ('low', 'medium', 'high', 'prohibited')",
            name='ck_policies_restriction_level'
        ),
    )


def downgrade() -> None:
    op.drop_table('policies')
    op.drop_table('workspaces')
