from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.policy import Policy
from app.models.workspace import Workspace
from app.schemas.policy import PolicyCreate, PolicyOut

router = APIRouter(prefix="/workspaces/{workspace_id}/policies", tags=["policies"])


def _require_workspace(workspace_id: UUID, db: Session) -> Workspace:
    workspace = db.scalar(select(Workspace).where(Workspace.id == workspace_id))
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("", response_model=PolicyOut)
def create_policy(
    workspace_id: UUID,
    payload: PolicyCreate,
    db: Session = Depends(get_db),
):
    workspace = _require_workspace(workspace_id, db)

    policy = Policy(
        workspace_id=workspace.id,
        country_code=payload.country_code,
        data_type=payload.data_type,
        restriction_level=payload.restriction_level,
        notes=payload.notes,
        source_url=payload.source_url,
        effective_date=payload.effective_date,
    )
    db.add(policy)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid policy data")
    db.refresh(policy)
    return {
        "id": str(policy.id),
        "workspace_id": str(policy.workspace_id),
        "country_code": policy.country_code,
        "data_type": policy.data_type,
        "restriction_level": policy.restriction_level,
        "notes": policy.notes,
        "source_url": policy.source_url,
        "effective_date": policy.effective_date.isoformat() if policy.effective_date else None,
        "created_at": policy.created_at.isoformat() if policy.created_at else None,
    }


@router.get("", response_model=list[PolicyOut])
def list_policies(workspace_id: UUID, db: Session = Depends(get_db)):
    _require_workspace(workspace_id, db)

    stmt = (
        select(Policy)
        .where(Policy.workspace_id == workspace_id)
        .order_by(desc(Policy.created_at))
    )
    policies = db.execute(stmt).scalars().all()
    return [
        {
            "id": str(policy.id),
            "workspace_id": str(policy.workspace_id),
            "country_code": policy.country_code,
            "data_type": policy.data_type,
            "restriction_level": policy.restriction_level,
            "notes": policy.notes,
            "source_url": policy.source_url,
            "effective_date": policy.effective_date.isoformat() if policy.effective_date else None,
            "created_at": policy.created_at.isoformat() if policy.created_at else None,
        }
        for policy in policies
    ]
