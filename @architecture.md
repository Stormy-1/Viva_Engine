# ARCHITECTURE — DO NOT MODIFY WITHOUT HUMAN APPROVAL

## Tech Stack
- Frontend: React + Vite + TailwindCSS + TypeScript
- Backend:  FastAPI + Python 3.10+
- Database: PostgreSQL (Supabase) via SQLAlchemy 2.0 async + pgvector
- AI/ML:    Docling (local PDF parsing), Gemini 1.5 Flash (vision fallback via vision-parse), OpenAI text-embedding-3-small (embeddings), sm-2 (spaced repetition), whisper-fastapi (audio transcription)

## Coding Conventions
- Language: TypeScript strict mode (no `any`)
- File naming: kebab-case for files, PascalCase for components
- Functions: must have docstrings if >10 lines
- Error handling: always use try/catch, never swallow errors silently
- No magic numbers — use named constants

## Database Schema (summary)

### documents
| Column          | Type         | Notes                                          |
|-----------------|--------------|------------------------------------------------|
| id              | UUID (PK)    | Auto-generated                                 |
| title           | VARCHAR(500) |                                                |
| filename        | VARCHAR(500) |                                                |
| file_size_bytes | INTEGER      | Nullable                                       |
| total_pages     | INTEGER      | Nullable                                       |
| status          | VARCHAR(50)  | pending / processing / complete / error        |
| created_at      | TIMESTAMPTZ  | server default now()                           |
| updated_at      | TIMESTAMPTZ  | server default now(), auto-updates             |

### document_chunks
| Column      | Type         | Notes                                              |
|-------------|--------------|---------------------------------------------------|
| id          | UUID (PK)    | Auto-generated                                    |
| document_id | UUID (FK)    | → documents.id ON DELETE CASCADE                  |
| page_number | INTEGER      |                                                   |
| raw_text    | TEXT         | Plain text from Docling                           |
| formulas    | TEXT         | JSON string of LaTeX formulas                     |
| diagrams    | TEXT         | JSON string of diagram descriptions               |
| summary     | TEXT         | LLM-generated summary (filled at question gen)    |
| embedding   | VECTOR(1536) | OpenAI text-embedding-3-small dims                |
| created_at  | TIMESTAMPTZ  | server default now()                              |

## UI Theme
- Colors: Violet/purple primary (`violet-600`, `violet-400`), dark background (`bg-black/5`, `bg-white/5`), emerald for success, red for errors
- Font: System default (Inter via Tailwind base)
- Component library: Custom components + lucide-react for icons + shadcn/ui (from Lovable base)
