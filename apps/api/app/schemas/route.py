from typing import Literal

from pydantic import BaseModel


class RoutePreviewRequest(BaseModel):
    country_code: str
    data_type: str


class RoutePreviewResponse(BaseModel):
    workspace_id: str
    country_code: str
    data_type: str
    restriction_level: Literal["low", "medium", "high", "prohibited"]
    routing_decision: Literal["allowed", "conditional", "restricted", "blocked"]
    matched: bool
    confidence: Literal["verified", "unverified"]
    matched_policy_id: str | None
    notes: str | None
