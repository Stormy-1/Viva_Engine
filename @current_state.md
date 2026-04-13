# CURRENT PROJECT STATE
← Update this EVERY time before switching IDE or account

## 🎯 Project Goal
Viva Engine is a voice-first RAG study app that ingests PDFs, extracts content via Docling, generates flashcard questions with an LLM, and grades spoken student answers using Whisper + GPT — with SM-2 spaced repetition scheduling to optimize review.

## 📍 Immediate Task
Days 8-9: Question Generation — implement `app/services/question_service.py` to
call Gemini with chunk text and produce flashcard Q&A pairs stored in a new
`questions` table, plus `POST /api/questions/generate` endpoint.

## ✅ What Is Working
- `/health` endpoint — confirms live Supabase asyncpg connection
- Alembic migrations — `documents` and `document_chunks` tables exist in Supabase with `pgvector` enabled
- `POST /api/extract/test` — accepts a PDF upload, runs Docling locally, returns per-page markdown + LaTeX formulas as JSON
- `FileUpload.tsx` — drag-and-drop frontend component that hits the extract API (interfaces now match Docling response)
- Vite proxy `/api/*` → `http://localhost:8000` working
- `POST /api/ingest` — full pipeline: Docling → Document + DocumentChunk rows → OpenAI embeddings → pgvector storage
- `GET /api/search?q=` — embeds query, runs pgvector `<=>` cosine similarity, returns top-K chunks
- `embedding_service.py` — async OpenAI text-embedding-3-small (1536 dims), single + batch

## 🐛 Known Bugs
- None currently active

## 🚫 Do NOT Touch
- `frontend/src/` Lovable-generated base layout and styling — do not redesign or restructure

## 🚀 Next Steps for Agent (in order)
1. Create `backend/app/models/question.py` — `Question` ORM model (id, chunk_id, question_text, answer_text, difficulty, card_state JSON for SM-2)
2. Write Alembic migration for `questions` table
3. Create `backend/app/services/question_service.py` — calls Gemini 1.5 Flash with chunk text, returns structured Q&A pairs (lift prompt template from `quizify_ai` OSS ref)
4. Add `POST /api/questions/generate` endpoint in `backend/app/routers/questions.py`
5. End-to-end test: ingest PDF → search → generate questions from top chunk → verify DB row created
6. Commit to `phase-1/question-generation` and push to GitHub
