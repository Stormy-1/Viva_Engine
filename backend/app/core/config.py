"""
app/core/config.py — Pydantic Settings for Viva Engine backend.
Reads all configuration from environment variables (backend/.env).
"""

from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str  # postgresql+asyncpg://...

    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    # ── AI APIs ───────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins, e.g. "http://localhost:5173,http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── App ───────────────────────────────────────────────────────────────────
    APP_TITLE: str = "Viva Engine API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — call get_settings() anywhere in the app."""
    return Settings()
