from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class WorkspaceCreate(BaseModel):
    name: str
    industry: str
    countries_json: dict

class WorkspaceOut(BaseModel):
    id: UUID
    name: str
    industry: str
    countries_json: dict
    created_at: datetime | None

    class Config:
        from_attributes = True

class WorkspaceListOut(BaseModel):
    items: list[WorkspaceOut]
    total: int
    limit: int
    offset: int
