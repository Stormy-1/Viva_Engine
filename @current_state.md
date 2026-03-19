# VIVA ENGINE — CURRENT STATE
**Status:** LIVE (Update frequently)

## Timeline
*   **Phase 1** (Days 1-5): Fast API Scaffold, Supabase Connection, PDF Extraction (Docling) — **Complete**
*   **Phase 1** (Days 6-7): Vector Search PoC — **Next**
*   **Phase 2** (Days 8-14): SM-2 + Quiz Generation + Voice Grading Pipeline — **Pending**
*   **Phase 3** (Days 22-28): Polish, UI, Deploy — **Pending**

## Current Status (2026-03-20)
*   The backend scaffold is built and connected to a remote Supabase instance.
*   Alembic migrations have successfully created the `documents` and `document_chunks` tables (with `pgvector` enabled).
*   The PDF extraction pipeline has been completely rewritten to use **Docling** instead of `pdf2image` + `poppler`. This removes nasty local OS binary dependencies.
*   The `POST /api/extract/test` endpoint functions successfully.
*   The frontend has a working drag-and-drop `FileUpload.tsx` component that hits the API.

## Known Bugs / Issues
*   None currently. Local Docling model download timeout was resolved.

## Immediate Next Steps (For the Agent)
1.  Switch focus to **Days 6-7: Vector Search Proof of Concept**.
2.  Implement `app/services/embedding_service.py` using `AsyncOpenAI`.
3.  Implement document chunking logic (storing chunks in the `document_chunks` table with vectors).
4.  Build a test `GET /api/search?q=` endpoint to verify pgvector cosine similarity.
