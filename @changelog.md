# VIVA ENGINE — AGENT CHANGELOG
**Status:** ROLLING (Keep recent 5 actions only)

1. **2026-04-13:** Fixed `FileUpload.tsx` stale interfaces — removed Gemini-era `FormulaItem`/`DiagramItem`/`topics`, aligned `PageContent` to Docling response shape (`raw_text`, `markdown`, `formulas: string[]`). Fixed button label to "Extract PDF". Committed to `phase-1/docling-extraction`.
2. **2026-04-13:** Created `backend/app/services/embedding_service.py` — async OpenAI `text-embedding-3-small` (1536 dims). Supports `embed_text()` single call and `embed_batch()` with auto-batching up to 512 per request.
3. **2026-04-13:** Created `backend/app/routers/ingest.py` — `POST /api/ingest` full pipeline: PDF validation → Docling extraction → `Document` + `DocumentChunk` DB rows → batch OpenAI embeddings → pgvector storage. Fallback to vision-parse if `USE_VISION_FALLBACK=true`.
4. **2026-04-13:** Created `backend/app/routers/search.py` — `GET /api/search?q=` embeds query and runs pgvector `<=>` cosine similarity with optional `document_id` filter. Returns top-K hits with similarity scores.
5. **2026-04-13:** Updated `app/main.py` to register ingest + search routers. Verified all imports and routes (`/api/ingest`, `/api/search`) with Python import check. Committed to `phase-1/vector-search`.

