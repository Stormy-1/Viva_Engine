# CURRENT PROJECT STATE
← Update this EVERY time before switching IDE or account

## 🎯 Project Goal
Viva Engine is a voice-first RAG study app that ingests PDFs, extracts content via Docling, generates flashcard questions with an LLM, and grades spoken student answers using Whisper + GPT — with SM-2 spaced repetition scheduling to optimize review.

## 📍 Immediate Task
Starting Days 6-7: Vector Search PoC — implementing `app/services/embedding_service.py` to generate OpenAI embeddings for `DocumentChunk` rows and a `GET /api/search?q=` endpoint to test pgvector cosine similarity.

## ✅ What Is Working
- `/health` endpoint — confirms live Supabase asyncpg connection
- Alembic migrations — `documents` and `document_chunks` tables exist in Supabase with `pgvector` enabled
- `POST /api/extract/test` — accepts a PDF upload, runs Docling locally, returns per-page markdown + LaTeX formulas as JSON
- `FileUpload.tsx` — drag-and-drop frontend component that hits the extract API
- Vite proxy `/api/*` → `http://localhost:8000` working

## 🐛 Known Bugs
- None currently active

## 🚫 Do NOT Touch
- `frontend/src/` Lovable-generated base layout and styling — do not redesign or restructure

## 🚀 Next Steps for Agent (in order)
1. Create `backend/app/services/embedding_service.py` — async OpenAI embeddings using `text-embedding-3-small` (1536 dims)
2. Add a `POST /api/ingest` endpoint in `backend/app/routers/ingest.py` — runs Docling extraction then stores chunks + embeddings in `document_chunks`
3. Add a `GET /api/search?q=` endpoint in `backend/app/routers/search.py` — embeds the query and runs pgvector cosine similarity against `document_chunks.embedding`
4. Test end-to-end: upload a PDF → ingest → search with a real query → verify top-5 chunks returned
5. Commit to `phase-1/vector-search` and push to GitHub
