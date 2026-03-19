# VIVA ENGINE — ARCHITECTURAL DECISIONS (ADRs)
**Status:** APPEND-ONLY (Why we chose X over Y)

## 1. PDF Parsing: Docling over pdf2image/Gemini Vision
*   **When:** 2026-03-20
*   **Context:** `pdf2image` relies on `poppler`, which is notoriously difficult to install reliably across different OS environments (especially Windows). Constant "access denied" or path issues slowed development.
*   **Decision:** Replaced custom image-slicing logic with `Docling`.
*   **Why:** Docling is a local, AI-powered document parser from IBM. It natively extracts text with proper structure, tables into markdown, and formulas into LaTeX without requiring external binaries or incurring API costs.
*   **Alternative Kept:** `vision-parse` using Gemini 1.5 Flash was kept as a fallback (`USE_VISION_FALLBACK=true`) for edge cases like handwritten diagrams.

## 2. Spaced Repetition: `sm-2` package over Custom Implementation
*   **When:** 2026-03-20
*   **Context:** Planned to build `sm2_scheduler.py` from scratch.
*   **Decision:** Adopted the open-source `sm-2` Python pip package.
*   **Why:** Re-inventing the SuperMemo-2 algorithm introduces unnecessary risk of math/scheduling bugs. The open-source package is battle-tested.

## 3. Database Driver: `asyncpg` over `psycopg2` (Runtime)
*   **When:** Day 1
*   **Context:** Need high-concurrency database access for a FastAPI app.
*   **Decision:** Use `asyncpg` via SQLAlchemy 2.0 for all API calls. Alembic uses `psycopg2` via a synchronous URL swap in `env.py`.
*   **Why:** `asyncpg` provides the best asynchronous performance for PostgreSQL in Python.

## 4. Voice Transcription: `whisper-fastapi` over Custom OpenAI calls
*   **When:** 2026-03-20
*   **Context:** Need robust audio transcription.
*   **Decision:** Will use the `whisper-fastapi` open-source implementation.
*   **Why:** It provides an OpenAI-compatible `/v1/audio/transcriptions` endpoint out of the box, allowing us to seamlessly swap between local (`faster-whisper`) and cloud OpenAI depending on cost and latency needs.
