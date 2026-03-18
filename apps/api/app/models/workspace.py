from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.base import Base

if TYPE_CHECKING:
    from app.models.api_key import ApiKey
    from app.models.policy import Policy


class Workspace(Base):
    """
    Multi-tenant workspace representing an isolated routing context.

    This is a foundational entity for the platform and will be referenced
    by users, policies, resources, findings, and recommendations.
    """

    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(255), nullable=False)

    # JSON representation of countries relevant to this workspace
    # (e.g. list of ISO codes and metadata).
    countries_json: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    policies: Mapped[list["Policy"]] = relationship(
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
    api_keys: Mapped[list["ApiKey"]] = relationship(
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
