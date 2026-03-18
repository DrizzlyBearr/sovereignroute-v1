from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import generate_api_key, get_db
from app.models.api_key import ApiKey
from app.models.workspace import Workspace
from app.schemas.api_key import ApiKeyCreate, ApiKeyCreated, ApiKeyOut

router = APIRouter(prefix="/workspaces/{workspace_id}/api-keys", tags=["api-keys"])


def _require_workspace(workspace_id: UUID, db: Session) -> Workspace:
    workspace = db.scalar(select(Workspace).where(Workspace.id == workspace_id))
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("", response_model=ApiKeyCreated, status_code=201)
def create_api_key(
    workspace_id: UUID,
    payload: ApiKeyCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new API key for a workspace.
    The raw key is returned ONCE — store it securely, it cannot be retrieved again.
    """
    workspace = _require_workspace(workspace_id, db)

    raw_key, key_prefix, key_hash = generate_api_key()

    api_key = ApiKey(
        workspace_id=workspace.id,
        name=payload.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return ApiKeyCreated(
        id=api_key.id,
        workspace_id=api_key.workspace_id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        last_used_at=api_key.last_used_at,
        raw_key=raw_key,
    )


@router.get("", response_model=list[ApiKeyOut])
def list_api_keys(
    workspace_id: UUID,
    db: Session = Depends(get_db),
):
    """List all API keys for a workspace (raw key never returned)."""
    _require_workspace(workspace_id, db)

    stmt = select(ApiKey).where(ApiKey.workspace_id == workspace_id)
    keys = db.execute(stmt).scalars().all()
    return keys


@router.delete("/{key_id}", status_code=204)
def revoke_api_key(
    workspace_id: UUID,
    key_id: UUID,
    db: Session = Depends(get_db),
):
    """Revoke (deactivate) an API key. This cannot be undone."""
    _require_workspace(workspace_id, db)

    stmt = select(ApiKey).where(ApiKey.id == key_id, ApiKey.workspace_id == workspace_id)
    api_key = db.scalar(stmt)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    db.commit()
