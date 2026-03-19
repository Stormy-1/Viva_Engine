# VIVA ENGINE — AGENT CHANGELOG
**Status:** ROLLING (Keep recent 5 actions only)

1. **2026-03-20:** Created the Future-Proofing Documentation Protocol (`@architecture.md`, `@current_state.md`, `@decisions.md`, `@out_of_scope.md`, `@structure.txt`, `.cursorrules`, and this changelog) to establish strict guidelines, context, and guardrails for all future AI interactions.
2. **2026-03-20:** Pivot PDF Extraction to Docling. Rewrote `docling_service.py` to use IBM's Docling for parsing, removing `pdf2image` and `poppler` dependencies entirely. Implemented `vision-parse` Gemini fallback.
3. **2026-03-20:** Fixed 500 server error in `/api/extract/test` router. Changed dictionary indexing to model `.to_dict()` for Docling results.  
4. **2026-03-20:** Created `FileUpload.tsx` in frontend. Drag-and-drop UI that successfully hits `/api/extract/test` and renders the extracted markdown and JSON results.
5. **2026-03-20:** Configured Alembic for async stack. Replaced asyncpg URL with psycopg2 specifically for `env.py` migrations. Successfully migrated Supabase to include `pgvector` and `document_chunks`.
