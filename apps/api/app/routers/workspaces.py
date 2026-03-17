from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceListOut, WorkspaceOut

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceOut)
def create_workspace(payload: WorkspaceCreate, db: Session = Depends(get_db)):
    ws = Workspace(
        name=payload.name,
        industry=payload.industry,
        countries_json=payload.countries_json,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws


@router.get("/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(workspace_id: UUID, db: Session = Depends(get_db)):
    ws = db.scalar(select(Workspace).where(Workspace.id == workspace_id))
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return ws


@router.get("", response_model=WorkspaceListOut)
def list_workspaces(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    items_stmt = (
        select(Workspace)
        .order_by(desc(Workspace.created_at))
        .limit(limit)
        .offset(offset)
    )
    items = db.execute(items_stmt).scalars().all()

    total_stmt = select(func.count()).select_from(Workspace)
    total_count = db.scalar(total_stmt) or 0

    return {
        "items": items,
        "total": total_count,
        "limit": limit,
        "offset": offset,
    }
