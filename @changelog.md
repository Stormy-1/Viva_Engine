# VIVA ENGINE — AGENT CHANGELOG
**Status:** ROLLING (Keep recent 5 actions only)

1. **2026-04-13:** Days 8-9: Question generation — Created `app/models/question.py` with tracking for SM-2 properties natively in PostgreSQL JSON fields, added manual Alembic migration script for `questions` table.
2. **2026-04-13:** Days 8-9: Gemini flashcard extraction — Implemented `app/services/question_service.py` to extract concise Question & Answer structures from document chunks using `gemini-1.5-flash` with prompt pattern lifted from `quizify_ai`. Registered endpoint `POST /api/questions/generate/{chunk_id}` in `main.py`.
3. **2026-04-13:** Fixed `FileUpload.tsx` stale interfaces — removed Gemini-era `FormulaItem`/`DiagramItem`/`topics`, aligned `PageContent` to Docling response shape (`raw_text`, `markdown`, `formulas: string[]`). Fixed button label to "Extract PDF". Committed to `phase-1/docling-extraction`.
4. **2026-04-13:** Created `backend/app/services/embedding_service.py` — async OpenAI `text-embedding-3-small` (1536 dims). Supports `embed_text()` single call and `embed_batch()` with auto-batching up to 512 per request.
5. **2026-04-13:** Created `backend/app/routers/ingest.py` and `search.py` — full pipeline: PDF validation → Docling extraction → batch OpenAI embeddings → pgvector storage. `GET /api/search?q=` embeds query and runs pgvector `<=>` cosine similarity with optional `document_id` filter. Returns top-K hits with similarity scores.

