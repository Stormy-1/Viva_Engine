# DECISION LOG
← Why key choices were made. Prevents agents from undoing good decisions.

## PDF Parsing: Docling over pdf2image/poppler — 2026-03-20
- Chose: Docling (IBM Research document parser)
- Rejected: pdf2image + poppler binaries
- Why: `poppler` is a system-level HTTP/C++ binary that is notoriously difficult to install and manage consistently across different OS environments (especially Windows). Constant "access denied" or nested PATH issues broke the pipeline. Docling runs entirely locally in Python, understands native layout, and extracts LaTeX formulas perfectly without any system dependencies.
- Fallback Chosen: `vision-parse` (wraps Gemini 1.5 API) for cases where extreme OCR/handwriting quality beats Docling's local models.

## Spaced Repetition: sm-2 pip package over Custom Logic — 2026-03-20
- Chose: `sm-2` Python package
- Rejected: Writing a custom `sm2_scheduler.py` from scratch
- Why: Re-inventing the SuperMemo-2 math introduces unnecessary complexity and risk of scheduling bugs. The `sm-2` package is battle-tested open source and acts as a pure drop-in replacement (`scheduler.review_card(rating)`).

## Database Driver: asyncpg over psycopg2 — 2026-03-19
- Chose: `asyncpg` (FastAPI runtime)
- Rejected: `psycopg2` (for runtime)
- Why: `asyncpg` offers vastly superior asynchronous performance for FastAPI applications. However, Alembic migrations don't natively support `asyncpg` seamlessly, so `psycopg2` string replacements were kept localized to `alembic/env.py` exclusively for sync schema migrations.

## Voice Transcription: whisper-fastapi over Custom Implementation — 2026-03-20
- Chose: `whisper-fastapi`
- Rejected: Writing a custom FastAPI wrapper for the OpenAI client
- Why: It provides an exact replica of OpenAI's `/v1/audio/transcriptions` endpoint out of the box. This means frontend code (`VoiceRecorder.tsx`) can point to the local instance or seamlessly swap URL base strings if we get rate-limited, without rewriting standard API request logic.
