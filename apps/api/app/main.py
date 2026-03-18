from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import engine
from app.core.base import Base
from app.core.deps import get_db
from app.routers.api_keys import router as api_keys_router
from app.routers.policies import router as policies_router
from app.routers.route import router as route_router
from app.routers.workspaces import router as workspaces_router

app = FastAPI(title="SovereignRoute API", version="0.1.0")


# Create tables on startup (temporary for V1 scaffolding; later we'll use Alembic migrations)
@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": True}


app.include_router(workspaces_router)
app.include_router(api_keys_router)
app.include_router(policies_router)
app.include_router(route_router)
