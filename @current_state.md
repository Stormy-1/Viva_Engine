# CURRENT PROJECT STATE
← Update this EVERY time before switching IDE or account

## 🎯 Project Goal
Viva Engine is a voice-first RAG study app that ingests PDFs, extracts content via Docling, generates flashcard questions with an LLM, and grades spoken student answers using Whisper + GPT — with SM-2 spaced repetition scheduling to optimize review.

## 📍 Immediate Task
Days 10-11: Voice Grading — implement Whisper-based speech-to-text service
and a grading service that evaluates student's transcribed voice against the flashcard answer.

## ✅ What Is Working
- `/health` endpoint — confirms live Supabase asyncpg connection
- Alembic migrations — `documents` and `document_chunks` tables exist in Supabase with `pgvector` enabled
- `POST /api/extract/test` — accepts a PDF upload, runs Docling locally, returns per-page markdown + LaTeX formulas as JSON
- `FileUpload.tsx` — drag-and-drop frontend component that hits the extract API (interfaces now match Docling response)
- Vite proxy `/api/*` → `http://localhost:8000` working
- `POST /api/ingest` — full pipeline: Docling → Document + DocumentChunk rows → OpenAI embeddings → pgvector storage
- `GET /api/search?q=` — embeds query, runs pgvector `<=>` cosine similarity, returns top-K chunks
- `embedding_service.py` — async OpenAI text-embedding-3-small (1536 dims), single + batch
- `Question` ORM model + `POST /api/questions/generate/{chunk_id}` endpoint (Calls Gemini 1.5 Flash to automatically extract SM-2 suitable flashcards from document chunks).

## 🐛 Known Bugs
- Supabase offline/unavailable (`db.znrlskuhwlejxjdsvrfo.supabase.co` DNS unavailable), hence end-to-end tests relying on pgvector creation currently disabled locally but pure code modules checked out correct.

## 🚫 Do NOT Touch
- `frontend/src/` Lovable-generated base layout and styling — do not redesign or restructure

## 🚀 Next Steps for Agent (in order)
1. Provide a mock for `whisper-fastapi` integration (Days 10-11) or set up `backend/app/services/voice_grading_service.py`.
2. Connect `VoiceRecorder.tsx` components on the front end to backend grading endpoints.
3. Test spacing and DB update loops.
