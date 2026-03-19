# VIVA ENGINE — AGENT CHANGELOG
**Status:** ROLLING (Keep recent 5 actions only)

1.  **2026-03-20:** Pivot PDF Extraction to Docling. Rewrote `docling_service.py` to use IBM's Docling for parsing, removing `pdf2image` and `poppler` dependencies entirely. Implemented `vision-parse` Gemini fallback.
2.  **2026-03-20:** Fixed 500 server error in `/api/extract/test` router. Changed dictionary indexing to model `.to_dict()` for Docling results.
3.  **2026-03-20:** Created `FileUpload.tsx` in frontend. Drag-and-drop UI that successfully hits `/api/extract/test` and renders the extracted markdown and JSON results.
4.  **2026-03-20:** Configured Alembic for async stack. Replaced asyncpg URL with psycopg2 specifically for `env.py` migrations. Successfully migrated Supabase to include `pgvector` and `document_chunks`.
5.  **2026-03-19:** Scaffolded FastAPI app. Configured `get_db` async generator, loaded Pydantic `.env` settings, verified remote Supabase connectivity via `/health`.
