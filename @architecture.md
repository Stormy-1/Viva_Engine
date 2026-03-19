# VIVA ENGINE — ARCHITECTURE & RULES
**Status:** IMMUTABLE (Update only on major stack shifts)

## 1. Core Stack
*   **Backend:** FastAPI (Python 3.10+), async/await everywhere.
*   **Database:** Supabase (PostgreSQL) + `asyncpg` driver + `pgvector` for vector search.
*   **ORM / Migrations:** SQLAlchemy 2.0 (async) + Alembic.
*   **Frontend:** React + Vite + TypeScript + Tailwind CSS (Integrated from Lovable/grade-my-voice).
*   **Core AI / ML:**
    *   **PDF Parsing:** Docling (Local, IBM Research) for Markdown/LaTeX/tables extraction.
    *   **Fallback Vision:** `vision-parse` (wraps Gemini 1.5 Flash).
    *   **Embeddings & LLM:** OpenAI API (`text-embedding-3-small`, `gpt-4o-mini`).
    *   **Spaced Repetition:** `sm-2` Python package.
    *   **Audio / STT:** `whisper-fastapi` (OpenAI-compatible) or `faster-whisper`.

## 2. Infrastructure & Environments
*   **Local Dev:** `uvicorn app.main:app --reload` (Backend on `:8000`), `npm run dev` (Frontend on `:8080`).
*   **Proxy:** Vite proxies `/api/*` to `http://localhost:8000` to avoid CORS issues locally.
*   **Database URL:** Handled via async SQLAlchemy `postgresql+asyncpg://...` (Alembic environment swaps this to `psycopg2` for synchronous migrations).

## 3. Immutable Development Rules
1.  **Never Commit Secrets:** `backend/.env` is gitignored. Always use `.env.example` to track required keys.
2.  **Strict Branching:** Work only on feature branches (`phase-<N>/<short-desc>`). Never force-push to `main`.
3.  **End-to-End Testing:** Do not merge to `main` until the endpoint works locally with real inputs (e.g., real PDFs, real audio).
4.  **No Poppler/System Binaries:** PDF processing relies strictly on Docling. No custom binary bundling or OS-level dependencies like poppler/Tesseract allowed unless explicitly approved.
5.  **Use Open Source First:** Before writing complex custom logic (like spaced repetition scheduling or advanced RAG chunking), verify if an established open-source package exists and use it as a drop-in replacement.
