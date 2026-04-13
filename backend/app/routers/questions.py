"""
app/routers/questions.py — Question generation endpoints.

POST /api/questions/generate
Takes a DocumentChunk ID, calls Gemini to generate Q&A flashcards,
and stores them as Question rows in the database.
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.document import DocumentChunk
from app.models.question import Question
from app.services.question_service import question_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.post("/generate/{chunk_id}", summary="Generate flashcards from a chunk")
async def generate_questions(
    chunk_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """
    Generate questions (flashcards) from a specific DocumentChunk using Gemini LLM.
    
    1. Fetches the DocumentChunk from DB.
    2. Calls question_service to generate an array of Q&A.
    3. Saves the Question instances to the database.
    
    Response 200:
        {status: "success", generated_count: N, questions: [...]}
    """
    # ── 1. Fetch Chunk ────────────────────────────────────────────────────────
    stmt = select(DocumentChunk).where(DocumentChunk.id == chunk_id)
    result = await db.execute(stmt)
    chunk = result.scalar_one_or_none()
    
    if not chunk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chunk with ID {chunk_id} not found."
        )

    # ── 2. Check if questions already exist (Optional idempotency check) ───────
    # To keep this flexible, we permit re-generating, but we could check here.
    
    # ── 3. Generate Questions ──────────────────────────────────────────────────
    logger.info(f"Generating questions for chunk {chunk_id}")
    try:
        new_questions = await question_service.generate_questions_for_chunk(chunk)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if not new_questions:
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "generated_count": 0,
                "message": "Chunk contained insufficient text to generate flashcards.",
                "questions": [],
            }
        )

    # ── 4. Save to Database ────────────────────────────────────────────────────
    db.add_all(new_questions)
    await db.commit()
    
    # Refresh to grab DB state (created_at etc) not strictly necessary for JSON return
    
    serialized = [
        {
            "id": str(q.id),
            "chunk_id": str(q.chunk_id),
            "question_text": q.question_text,
            "answer_text": q.answer_text,
            "difficulty": q.difficulty
        }
        for q in new_questions
    ]

    return JSONResponse(
        status_code=201,
        content={
            "status": "success",
            "generated_count": len(serialized),
            "questions": serialized
        }
    )
