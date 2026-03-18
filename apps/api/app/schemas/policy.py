from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class PolicyCreate(BaseModel):
        country_code: str
        data_type: str
        restriction_level: Literal["low", "medium", "high", "prohibited"]
        notes: str | None = None
        source_url: str | None = None
        effective_date: datetime | None = None


class PolicyOut(BaseModel):
        id: UUID
        workspace_id: UUID
        country_code: str
        data_type: str
        restriction_level: Literal["low", "medium", "high", "prohibited"]
        notes: str | None
        source_url: str | None
        effective_date: datetime | None
        created_at: datetime | None

        class Config:
            from_attributes = True
