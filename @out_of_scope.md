# OUT OF SCOPE — AGENT MUST NOT MODIFY THESE

## Frozen Files (do not read or edit)
- `frontend/src/*` (Lovable-generated UI base code, unless wiring a specific API endpoint)
- `backend/.env` (never commit or modify directly in code)
- `backend/bin/` (any system binaries if present)

## Frozen Features (do not refactor or improve)
- The Supabase connection and Fast API `/health` core scaffold are complete and tested — do not touch.
- The Alembic migration configuration and `env.py` async→sync hack are complete and tested — do not touch.

## Frozen Decisions (do not reverse)
- We are NOT writing custom spaced repetition math; use the `sm-2` python package.
- We are NOT writing custom OpenAI `/v1/audio` wrappers; use `whisper-fastapi`.
- We are NOT writing custom PDF bounding box parsers; use `Docling`.
- We are NOT managing system-level OS binaries like `poppler` inside the application code.
