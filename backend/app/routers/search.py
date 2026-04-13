"""
app/routers/search.py — pgvector semantic search endpoint.

GET /api/search?q=<query>&top_k=<int>&document_id=<uuid>

Pipeline:
  1. Embed the query string via text-embedding-3-small
  2. Run pgvector <=> (cosine distance) ORDER BY against document_chunks
  3. Optionally filter by document_id
  4. Return top-K chunks with similarity scores

OSS reference: rag_api (danny-avila/rag_api) — async pgvector retrieval pattern.
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/search", tags=["search"])

# ── Constants ──────────────────────────────────────────────────────────────────
DEFAULT_TOP_K = 5
MAX_RAW_TEXT_CHARS = 500   # Truncate chunk preview in response to keep payload small


@router.get("", summary="Semantic search over ingested document chunks")
async def search_chunks(
    q: str = Query(..., min_length=2, description="Natural-language search query"),
    top_k: int = Query(DEFAULT_TOP_K, ge=1, le=20, description="Number of results"),
    document_id: Optional[UUID] = Query(
        None, description="Restrict search to a single document (optional)"
    ),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Embed the query and run pgvector cosine similarity search.

    - Uses the <=> operator (cosine distance) for fast ANN retrieval.
    - Similarity score = 1 − cosine_distance  (1.0 = identical, 0.0 = orthogonal).
    - Filters out chunks with no embedding (not yet processed).
    - Optional document_id filter to search within a single document.

    Response 200:
        {query, top_k, document_id, hits: [{chunk_id, document_id, filename,
         title, page_number, similarity, raw_text, summary}]}
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        # ── Embed query ───────────────────────────────────────────────────────
        logger.info(f"Search: embedding query {q!r}")
        query_embedding = await embedding_service.embed_text(q)

        # Format as postgres vector literal: '[0.1, 0.2, ...]'
        vec_literal = "[" + ",".join(str(v) for v in query_embedding) + "]"

        # ── Build SQL — use raw text for pgvector <=> operator ────────────────
        # CAST is required because SQLAlchemy passes the parameter as a plain string
        if document_id is not None:
            sql = text("""
                SELECT
                    dc.id,
                    dc.document_id,
                    dc.page_number,
                    dc.raw_text,
                    dc.summary,
                    d.filename,
                    d.title,
                    1 - (dc.embedding <=> CAST(:vec AS vector)) AS similarity
                FROM document_chunks dc
                JOIN documents d ON d.id = dc.document_id
                WHERE dc.embedding IS NOT NULL
                  AND dc.document_id = CAST(:doc_id AS uuid)
                ORDER BY dc.embedding <=> CAST(:vec AS vector)
                LIMIT :top_k
            """)
            result = await db.execute(
                sql,
                {"vec": vec_literal, "top_k": top_k, "doc_id": str(document_id)},
            )
        else:
            sql = text("""
                SELECT
                    dc.id,
                    dc.document_id,
                    dc.page_number,
                    dc.raw_text,
                    dc.summary,
                    d.filename,
                    d.title,
                    1 - (dc.embedding <=> CAST(:vec AS vector)) AS similarity
                FROM document_chunks dc
                JOIN documents d ON d.id = dc.document_id
                WHERE dc.embedding IS NOT NULL
                ORDER BY dc.embedding <=> CAST(:vec AS vector)
                LIMIT :top_k
            """)
            result = await db.execute(
                sql,
                {"vec": vec_literal, "top_k": top_k},
            )

        rows = result.fetchall()
        logger.info(f"Search: {len(rows)} hits for {q!r}")

        # ── Format response ───────────────────────────────────────────────────
        hits = [
            {
                "chunk_id": str(row.id),
                "document_id": str(row.document_id),
                "filename": row.filename,
                "title": row.title,
                "page_number": row.page_number,
                "similarity": round(float(row.similarity), 4),
                # Truncate raw_text preview — full text is in DB if needed
                "raw_text": (row.raw_text or "")[:MAX_RAW_TEXT_CHARS],
                "summary": row.summary or "",
            }
            for row in rows
        ]

        return {
            "query": q,
            "top_k": top_k,
            "document_id": str(document_id) if document_id else None,
            "hits": hits,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Search failed")
        raise HTTPException(status_code=500, detail=f"Search error: {exc}")
