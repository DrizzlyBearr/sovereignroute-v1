from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.base import Base

if TYPE_CHECKING:
    from app.models.workspace import Workspace


class DecisionLog(Base):
    """
    Immutable audit record of every routing decision made within a workspace.
    Written once at decision time and never mutated.
    """

    __tablename__ = "decision_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    country_code: Mapped[str] = mapped_column(String(10), nullable=False)
    data_type: Mapped[str] = mapped_column(String(100), nullable=False)
    routing_decision: Mapped[str] = mapped_column(String(50), nullable=False)
    restriction_level: Mapped[str] = mapped_column(String(50), nullable=False)
    matched: Mapped[bool] = mapped_column(Boolean, nullable=False)
    matched_policy_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    confidence: Mapped[str] = mapped_column(String(50), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    workspace: Mapped["Workspace"] = relationship(back_populates="decision_logs")
