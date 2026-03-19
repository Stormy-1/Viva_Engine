"""
app/services/pdf_processor.py — Convert PDF pages to PIL Images for Gemini Vision.

Uses pdf2image (wraps poppler's pdftoppm). On Windows, poppler binaries must be
in PATH or passed via the `poppler_path` argument.
"""

import io
import logging
from pathlib import Path
from typing import Optional

from pdf2image import convert_from_bytes, convert_from_path
from PIL import Image

logger = logging.getLogger(__name__)


def pdf_bytes_to_images(
    pdf_bytes: bytes,
    max_pages: Optional[int] = None,
    dpi: int = 150,
) -> list[Image.Image]:
    """
    Convert raw PDF bytes → list of PIL Images (one per page).

    Args:
        pdf_bytes:  Raw bytes of the uploaded PDF file.
        max_pages:  If set, only convert the first N pages (e.g. 3 for validation).
        dpi:        Resolution for rasterisation. 150 is a good balance of
                    quality vs. speed for Gemini Vision.

    Returns:
        List of PIL Image objects, one per page (up to max_pages).

    Raises:
        RuntimeError: If poppler is not installed or conversion fails.
    """
    last_page = max_pages if max_pages else None

    try:
        images = convert_from_bytes(
            pdf_bytes,
            dpi=dpi,
            first_page=1,
            last_page=last_page,
            fmt="jpeg",
            thread_count=2,
        )
        logger.info(f"Converted PDF to {len(images)} image(s) at {dpi} DPI")
        return images

    except Exception as exc:
        logger.error(f"pdf2image conversion failed: {exc}")
        raise RuntimeError(
            f"PDF conversion failed. Ensure poppler is installed. Details: {exc}"
        ) from exc


def image_to_bytes(image: Image.Image, format: str = "JPEG", quality: int = 85) -> bytes:
    """Convert a PIL Image to raw bytes (for sending to Gemini Vision API)."""
    buf = io.BytesIO()
    image.save(buf, format=format, quality=quality)
    return buf.getvalue()
