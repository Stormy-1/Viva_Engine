# 🎙️ Viva Engine

> A voice-first RAG study application — answer with your voice, get graded instantly.

## Project Structure

```
Viva_Engine/
├── backend/          # FastAPI (Python) — RAG pipeline, voice grading, scheduling
├── frontend/         # React/Vite — UI built with Lovable
├── .gitignore
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env      # Fill in your secrets
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Health Check
```bash
curl http://localhost:8000/health
# {"status": "healthy", "database": "connected"}
```

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | FastAPI (async Python) |
| Database | Supabase PostgreSQL + pgvector |
| AI | Gemini Vision + OpenAI Whisper |
| Scheduling | SM-2 Algorithm |
