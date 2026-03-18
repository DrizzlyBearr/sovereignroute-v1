from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.base import Base
from app.core.database import engine
from app.core.deps import get_db
from app.routers.api_keys import router as api_keys_router
from app.routers.policies import router as policies_router
from app.routers.route import router as route_router
from app.routers.workspaces import router as workspaces_router

# Ensure all tables exist on startup (safe to run repeatedly)
import app.models.api_key  # noqa: F401 — register model with Base
import app.models.policy   # noqa: F401
import app.models.workspace  # noqa: F401
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SovereignRoute API", version="0.1.0")


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": True}


app.include_router(workspaces_router)
app.include_router(api_keys_router)
app.include_router(policies_router)
app.include_router(route_router)
