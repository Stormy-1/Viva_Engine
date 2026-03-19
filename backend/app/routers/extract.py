"""
app/routers/extract.py — POST /api/extract/test

Accepts a PDF upload, converts first 3 pages to images via poppler,
calls Gemini Vision on each page, and returns structured JSON.

This is a VALIDATION endpoint — not for production ingestion (that's Days 8-9).
"""

import logging

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.services.gemini_service import gemini_service
from app.services.pdf_processor import pdf_bytes_to_images

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/extract", tags=["extraction"])

MAX_FILE_SIZE_MB = 10
MAX_TEST_PAGES = 3


@router.post("/test", summary="Test PDF → Gemini Vision extraction (first 3 pages)")
async def test_extraction(file: UploadFile = File(...)):
    """
    Upload a PDF and extract content from the first 3 pages via Gemini Vision.

    Returns:
        JSON with extraction results per page including:
        - page_text: raw text
        - formulas: list of {latex, description}
        - diagrams: list of {label, description}
        - summary: 2-3 sentence summary
        - topics: list of key topics
    """
    # ── Validate file type ────────────────────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # ── Read file bytes ───────────────────────────────────────────────────────
    pdf_bytes = await file.read()

    # Check file size
    size_mb = len(pdf_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum is {MAX_FILE_SIZE_MB} MB.",
        )

    logger.info(f"Received PDF: {file.filename!r} ({size_mb:.2f} MB)")

    # ── Convert PDF pages → images ────────────────────────────────────────────
    try:
        images = pdf_bytes_to_images(pdf_bytes, max_pages=MAX_TEST_PAGES, dpi=150)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if not images:
        raise HTTPException(status_code=400, detail="PDF appears to have no pages.")

    logger.info(f"Converted {len(images)} page(s) for extraction")

    # ── Call Gemini Vision ────────────────────────────────────────────────────
    try:
        extracted_pages = await gemini_service.extract_pages(images)
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=502, detail=f"Gemini Vision error: {exc}")

    # ── Return results ────────────────────────────────────────────────────────
    return JSONResponse(
        content={
            "filename": file.filename,
            "pages_extracted": len(extracted_pages),
            "file_size_mb": round(size_mb, 2),
            "pages": extracted_pages,
        }
    )
