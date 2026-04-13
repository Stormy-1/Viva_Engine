"""
app/routers/ingest.py — Full PDF ingest pipeline endpoint.

POST /api/ingest
  1. Validate PDF upload (≤50 MB)
  2. Create Document row (status: processing)
  3. Run Docling extraction → per-page text + formulas
  4. Create DocumentChunk rows per page
  5. Batch-embed all chunk texts via OpenAI text-embedding-3-small
  6. Store embeddings in pgvector (document_chunks.embedding)
  7. Mark Document status → complete

OSS reference: rag_api (danny-avila/rag_api) — document_id-based chunk grouping.
"""

import json
import logging
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.models.document import Document, DocumentChunk
from app.services.docling_service import VisionParseService, docling_service
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ingest", tags=["ingest"])
settings = get_settings()

MAX_FILE_SIZE_MB = 50


@router.post("", summary="Ingest a PDF: extract → store chunks → embed in pgvector")
async def ingest_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """
    Full ingest pipeline for a single PDF file.

    - Runs Docling locally (or vision-parse if USE_VISION_FALLBACK=true).
    - Stores one DocumentChunk row per page with raw_text + formulas.
    - Generates OpenAI embeddings in a single batch call.
    - Returns document_id so the frontend can reference it for search.

    Response 200:
        {document_id, filename, total_pages, chunks_stored, status}
    """
    # ── Validate ──────────────────────────────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()
    size_mb = len(pdf_bytes) / (1024 * 1024)
    size_bytes = len(pdf_bytes)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max is {MAX_FILE_SIZE_MB} MB.",
        )

    logger.info(f"Ingest: {file.filename!r} ({size_mb:.2f} MB)")

    # ── Create Document row (status: processing) ──────────────────────────────
    doc = Document(
        id=uuid.uuid4(),
        title=file.filename.removesuffix(".pdf").replace("_", " ").replace("-", " ").title(),
        filename=file.filename,
        file_size_bytes=size_bytes,
        status="processing",
    )
    db.add(doc)
    await db.flush()   # Flush to assign PK without committing — needed for FK in chunks

    try:
        # ── Extract ───────────────────────────────────────────────────────────
        use_fallback = os.getenv("USE_VISION_FALLBACK", "false").lower() == "true"

        if use_fallback:
            logger.info("Ingest: using vision-parse fallback (Gemini)")
            service = VisionParseService(gemini_api_key=settings.GEMINI_API_KEY)
            extraction = service.extract_pdf_bytes(pdf_bytes, filename=file.filename)
        else:
            logger.info("Ingest: using Docling (local)")
            extraction = docling_service.extract_pdf_bytes(pdf_bytes, filename=file.filename)

        doc.total_pages = extraction.total_pages
        logger.info(f"Ingest: extracted {extraction.total_pages} pages from {file.filename!r}")

        # ── Build chunks + collect texts for batch embedding ──────────────────
        chunks: list[DocumentChunk] = []
        texts_for_embedding: list[str] = []

        for page in extraction.pages:
            # Prefer raw_text for embedding; fall back to markdown
            embed_text = page.raw_text or page.markdown or ""
            texts_for_embedding.append(embed_text)

            chunk = DocumentChunk(
                id=uuid.uuid4(),
                document_id=doc.id,
                page_number=page.page_number,
                raw_text=page.raw_text,
                formulas=json.dumps(page.formulas),   # Store as JSON string
                diagrams=json.dumps([]),               # Populated by later vision step
                summary=page.summary or "",
            )
            chunks.append(chunk)

        # ── Batch embed (single OpenAI API call) ──────────────────────────────
        logger.info(f"Ingest: generating embeddings for {len(chunks)} chunks")
        embeddings = await embedding_service.embed_batch(texts_for_embedding)

        if len(embeddings) != len(chunks):
            raise ValueError(
                f"Embedding count mismatch: got {len(embeddings)}, expected {len(chunks)}"
            )

        for chunk, embedding in zip(chunks, embeddings):
            chunk.embedding = embedding
            db.add(chunk)

        # ── Finalise ──────────────────────────────────────────────────────────
        doc.status = "complete"
        await db.commit()

        logger.info(f"Ingest complete: doc_id={doc.id}, chunks={len(chunks)}")
        return JSONResponse(
            status_code=200,
            content={
                "document_id": str(doc.id),
                "filename": file.filename,
                "total_pages": extraction.total_pages,
                "chunks_stored": len(chunks),
                "status": "complete",
            },
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Ingest pipeline failed")
        doc.status = "error"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Ingest failed: {exc}")
