from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import case, desc, func, select
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_api_key
from app.models.api_key import ApiKey
from app.models.policy import Policy
from app.models.workspace import Workspace
from app.schemas.route import RoutePreviewRequest, RoutePreviewResponse

router = APIRouter(prefix="/workspaces/{workspace_id}/route", tags=["route"])

ROUTING_DECISION_MAP = {
    "prohibited": "blocked",
    "high": "restricted",
    "medium": "conditional",
    "low": "allowed",
}


def _require_workspace(workspace_id: UUID, db: Session) -> Workspace:
    workspace = db.scalar(select(Workspace).where(Workspace.id == workspace_id))
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("/preview", response_model=RoutePreviewResponse)
def preview_route_decision(
    workspace_id: UUID,
    payload: RoutePreviewRequest,
    db: Session = Depends(get_db),
    auth: ApiKey = Depends(require_api_key),
):
    _require_workspace(workspace_id, db)

    severity_rank = case(
        (Policy.restriction_level == "prohibited", 0),
        (Policy.restriction_level == "high", 1),
        (Policy.restriction_level == "medium", 2),
        (Policy.restriction_level == "low", 3),
        else_=99,
    )
    policy_stmt = (
        select(Policy)
        .where(
            Policy.workspace_id == workspace_id,
            func.lower(Policy.country_code) == payload.country_code.lower(),
            func.lower(Policy.data_type) == payload.data_type.lower(),
        )
        .order_by(severity_rank, desc(Policy.created_at))
        .limit(1)
    )
    policy = db.scalar(policy_stmt)

    if not policy:
        return {
            "workspace_id": str(workspace_id),
            "country_code": payload.country_code,
            "data_type": payload.data_type,
            "restriction_level": "low",
            "routing_decision": "allowed",
            "matched": False,
            "confidence": "unverified",
            "matched_policy_id": None,
            "notes": (
                "No policy found for this combination. "
                "Decision defaults to low restriction. Verify manually before acting on this result."
            ),
        }

    return {
        "workspace_id": str(workspace_id),
        "country_code": payload.country_code,
        "data_type": payload.data_type,
        "restriction_level": policy.restriction_level,
        "routing_decision": ROUTING_DECISION_MAP.get(policy.restriction_level, "conditional"),
        "matched": True,
        "confidence": "verified",
        "matched_policy_id": str(policy.id),
        "notes": policy.notes,
    }
