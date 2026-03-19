# Viva Engine — Project State

## What's been built (as of 2026-03-20)

- **Day 1-2 ✅** — FastAPI backend scaffold
  - `backend/app/main.py`, `config.py`, `db/session.py`
  - `/health` → `{"status":"healthy","database":"connected","version":"0.1.0"}`
  - `frontend/` — Lovable React/Vite app integrated (from grade-my-voice)
  - Vite proxy: `/api/*` → `http://localhost:8000`
  - Git: `phase-1/backend-scaffold` pushed to Viva_Engine repo

- **Days 3-5 ✅** — DB models + early extraction pipeline
  - `Document` + `DocumentChunk` ORM models with `Vector(1536)` (pgvector)
  - Alembic migration ran — tables created in Supabase
  - `POST /api/extract/test` router (PDF → poppler → Gemini Vision → JSON)
  - `FileUpload.tsx` — drag-drop upload component
  - **Blocker hit:** poppler install on Windows proved fragile; switching to Docling

## ⚠️ Strategy Pivot: Use Open Source Libraries

Instead of building all pipeline logic from scratch, we use battle-tested open source packages as drop-in replacements. See Arsenal below.

## Open Source Arsenal & Integration Decisions

### 1. SM-2 Spaced Repetition
| Repo | Decision |
|---|---|
| [sm-2](https://github.com/open-spaced-repetition/sm-2) | ✅ USE — `pip install sm-2` |
| [anki-sm-2](https://github.com/open-spaced-repetition/anki-sm-2) | Reference only |

**Integration:** `from sm_2 import Scheduler, Card, ReviewLog` — replaces writing `sm2_scheduler.py` entirely. API: `scheduler.review_card(card, rating=0–5)` → returns updated card with `card.due` datetime.

---

### 2. PDF Parsing & Formula Extraction
| Repo | Decision |
|---|---|
| [Docling (IBM)](https://github.com/DS4SD/docling) | ✅ PRIMARY — local, no API cost, LaTeX native |
| [vision-parse](https://github.com/iamarunbrahma/vision-parse) | ✅ FALLBACK — wraps Gemini API cleanly |
| [zerox](https://github.com/getomni-ai/zerox) | Reference only |
| [parsemypdf](https://github.com/genieincodebottle/parsemypdf) | Reference only |

**Primary (Docling):**
```python
from docling.document_converter import DocumentConverter
converter = DocumentConverter()
result = converter.convert("textbook.pdf")
markdown_text = result.document.export_to_markdown()
# → gets text + tables + formulas in LaTeX automatically
```
No poppler needed. Local CPU models (EasyOCR + layout model). LangChain/LlamaIndex native.

**Fallback (vision-parse + Gemini):**
```python
from vision_parse import VisionParser
parser = VisionParser(model_name="gemini-2.5-flash", api_key=GEMINI_API_KEY, enable_concurrency=True)
pages = parser.convert_pdf("textbook.pdf")  # returns list of markdown strings per page
```

**Decision:** Use Docling locally. If quality is insufficient on complex diagrams, switch to vision-parse + Gemini.

---

### 3. RAG Backend
| Repo | Decision |
|---|---|
| [rag_api](https://github.com/danny-avila/rag_api) | ✅ REFERENCE — lift embedding + retrieval patterns |
| [NextRag](https://github.com/HamedMP/NextRag) | Reference for frontend API patterns |

**Integration:** Don't fork — use as reference for:
- ID-based document chunking (file_id → embeddings grouping matches our `document_id`)
- Langchain `PGVector` store integration patterns
- Async query/retrieval endpoints

We already have our own FastAPI + pgvector setup. Lift the vector search query pattern only.

---

### 4. Card / Quiz Generation
| Repo | Decision |
|---|---|
| [quizify_ai](https://github.com/fns12/quizify_ai) | ✅ Lift prompt templates |
| [exam-question-generator](https://github.com/alexanderwendt/exam-question-generator) | Lift output schema |
| [Shree-MCQ-Wizard](https://github.com/Shree2604/Shree-MCQ-Wizard) | Reference only |

**Integration:** Study and copy the prompt templates + output JSON schema. No UI code needed (we have our own frontend).

---

### 5. Voice Transcription
| Repo | Decision |
|---|---|
| [whisper-fastapi](https://github.com/heimoshuiyu/whisper-fastapi) | ✅ USE — OpenAI-compatible endpoint |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | ✅ FALLBACK — local, no API cost |

**Integration:** `whisper-fastapi` exposes `POST /v1/audio/transcriptions` — identical to OpenAI's API. Frontend hits this endpoint directly. Can swap between OpenAI Whisper API and local faster-whisper by just changing the base URL.

---

### 6. Frontend Voice Recording
| Repo | Decision |
|---|---|
| [VoiceFlashcards](https://github.com/open-spaced-repetition/VoiceFlashcards) | ✅ Reference for MediaRecorder edge cases |

**Integration:** Study `VoiceRecorder` hook for press-and-hold recording, silence detection, and iOS Safari compatibility. Use as reference for `VoiceRecorder.tsx`.

---

## Running the project locally

### Backend
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
# → http://localhost:8000/health
```

### Frontend
```bash
cd frontend
npm run dev
# → http://localhost:8080
```

## Current blockers
- None (pivot to Docling removes poppler dependency)

## Next immediate task
- **Days 3-5 (redo):** Replace pdf_processor.py + gemini_service.py with Docling
  - `pip install docling`
  - `app/services/docling_service.py` — wraps DocumentConverter
  - Re-test `/api/extract/test` endpoint with Docling output
- **Days 6-7:** Vector search PoC
  - `pip install sm-2` for scheduler
  - OpenAI embeddings → pgvector similarity search

## Branch naming
- Done: `phase-1/backend-scaffold`, `phase-1/vision-extraction`
- Next: `phase-1/docling-extraction`

## Credentials (in backend/.env — never committed)
- `DATABASE_URL` — Supabase asyncpg connection string
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`, `GEMINI_API_KEY`

## GitHub repos
- Main: https://github.com/Stormy-1/Viva_Engine
- Frontend base: https://github.com/Stormy-1/grade-my-voice (already integrated)