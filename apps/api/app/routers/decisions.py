from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_api_key
from app.models.api_key import ApiKey
from app.models.decision_log import DecisionLog
from app.models.workspace import Workspace
from app.schemas.decision_log import DecisionLogOut

router = APIRouter(prefix="/workspaces/{workspace_id}/decisions", tags=["decisions"])


def _require_workspace(workspace_id: UUID, db: Session) -> Workspace:
    workspace = db.scalar(select(Workspace).where(Workspace.id == workspace_id))
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.get("", response_model=list[DecisionLogOut])
def list_decisions(
    workspace_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    auth: ApiKey = Depends(require_api_key),
):
    """
    Return the most recent routing decisions for this workspace.
    Ordered newest first. Max 50 per request.
    """
    _require_workspace(workspace_id, db)

    stmt = (
        select(DecisionLog)
        .where(DecisionLog.workspace_id == workspace_id)
        .order_by(desc(DecisionLog.created_at))
        .limit(min(limit, 50))
    )
    logs = db.execute(stmt).scalars().all()
    return logs
