from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DecisionLogOut(BaseModel):
    id: UUID
    workspace_id: UUID
    country_code: str
    data_type: str
    routing_decision: str
    restriction_level: str
    matched: bool
    matched_policy_id: UUID | None = None
    confidence: str
    created_at: datetime

    model_config = {"from_attributes": True}
