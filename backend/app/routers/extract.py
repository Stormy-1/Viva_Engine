"""
app/routers/extract.py — PDF extraction endpoints.

POST /api/extract/test  — Docling-powered extraction (first 3 pages)
POST /api/extract/full  — Full document extraction (Days 8-9)

Docling handles PDF → text/tables/LaTeX locally, no poppler/API needed.
Falls back to vision-parse (Gemini) if USE_VISION_FALLBACK=true in .env.
"""

import logging
import os

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.services.docling_service import VisionParseService, docling_service
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/extract", tags=["extraction"])
settings = get_settings()

MAX_FILE_SIZE_MB = 10
MAX_TEST_PAGES = 3


@router.post("/test", summary="Extract first 3 pages of a PDF via Docling")
async def test_extraction(file: UploadFile = File(...)):
    """
    Upload a PDF — Docling extracts text, tables, and LaTeX formulas locally.

    Returns per-page content: markdown, raw_text, formulas list.
    Falls back to Gemini vision-parse if USE_VISION_FALLBACK env var is set.
    """
    # ── Validate ──────────────────────────────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted.")

    pdf_bytes = await file.read()
    size_mb = len(pdf_bytes) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(413, f"File too large ({size_mb:.1f} MB). Max is {MAX_FILE_SIZE_MB} MB.")

    logger.info(f"Extracting: {file.filename!r} ({size_mb:.2f} MB)")

    # ── Extract ───────────────────────────────────────────────────────────────
    use_fallback = os.getenv("USE_VISION_FALLBACK", "false").lower() == "true"

    try:
        if use_fallback:
            logger.info("Using vision-parse fallback (Gemini)")
            service = VisionParseService(gemini_api_key=settings.GEMINI_API_KEY)
            result = service.extract_pdf_bytes(
                pdf_bytes, filename=file.filename, max_pages=MAX_TEST_PAGES
            )
        else:
            logger.info("Using Docling (local)")
            result = docling_service.extract_pdf_bytes(
                pdf_bytes, filename=file.filename, max_pages=MAX_TEST_PAGES
            )
    except RuntimeError as exc:
        raise HTTPException(500, str(exc))
    except Exception as exc:
        logger.exception("Extraction failed")
        raise HTTPException(500, f"Extraction error: {exc}")

    result_dict = result.to_dict()
    return JSONResponse(content={
        "filename": result_dict["filename"],
        "pages_extracted": len(result_dict["pages"]),
        "total_pages": result_dict["total_pages"],
        "file_size_mb": round(size_mb, 2),
        "pages": result_dict["pages"],
    })
