"""
app/main.py — FastAPI application entry point for Viva Engine.

Endpoints:
    GET /health  — liveness + Supabase DB connectivity check
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.routers import extract as extract_router
from app.routers import ingest as ingest_router
from app.routers import search as search_router

settings = get_settings()


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks (extend here later for model loading etc.)."""
    print(f"🚀  Viva Engine API starting — {settings.APP_VERSION}")
    yield
    print("🛑  Viva Engine API shutting down")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(extract_router.router)
app.include_router(ingest_router.router)
app.include_router(search_router.router)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health_check():
    """
    Liveness + Supabase DB connectivity check.
    Returns 200 {"status": "healthy", "database": "connected"} on success.
    Returns 200 {"status": "degraded", "database": "error", "detail": "..."} on DB failure.
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        return {
            "status": "degraded",
            "database": "error",
            "detail": str(exc),
        }

    return {
        "status": "healthy",
        "database": db_status,
        "version": settings.APP_VERSION,
    }
