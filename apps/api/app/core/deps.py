import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)
KEY_PREFIX = "sk_live_"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_api_key() -> tuple[str, str, str]:
    """
    Generate a new API key.

    Returns:
        (raw_key, key_prefix, key_hash)
        - raw_key:    the full key shown to the user once (e.g. sk_live_abc123...)
        - key_prefix: first 16 chars for display (e.g. sk_live_ab)
        - key_hash:   SHA-256 hex digest stored in DB
    """
    token = secrets.token_urlsafe(32)
    raw_key = f"{KEY_PREFIX}{token}"
    key_prefix = raw_key[:16]
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, key_prefix, key_hash


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


def require_api_key(
    x_api_key: str | None = Security(API_KEY_HEADER),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency that validates X-API-Key header.
    Returns the authenticated ApiKey ORM object (with .workspace attached).
    Raises 401 if missing or invalid.
    """
    from app.models.api_key import ApiKey

    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key. Pass X-API-Key header.")

    key_hash = hash_api_key(x_api_key)
    stmt = select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active.is_(True))
    api_key = db.scalar(stmt)

    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or revoked API key.")

    # Update last_used_at without loading the full workspace
    api_key.last_used_at = datetime.now(timezone.utc)
    db.commit()

    return api_key
