"""
app/services/docling_service.py — PDF extraction via Docling (IBM Research).

Docling handles PDF → structured content locally:
  - Text extraction with reading order
  - LaTeX formula extraction ($$...$$)
  - Table structure → Markdown tables
  - No poppler, no API calls needed

Fallback: vision-parse wraps Gemini if Docling quality is insufficient.

Install: pip install docling vision-parse
"""

import logging
import re
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


# ── Return type ───────────────────────────────────────────────────────────────
class PageContent:
    def __init__(self, page_number: int, markdown: str, raw_text: str,
                 formulas: list, summary: str):
        self.page_number = page_number
        self.markdown = markdown
        self.raw_text = raw_text
        self.formulas = formulas
        self.summary = summary

    def to_dict(self) -> dict:
        return {
            "page_number": self.page_number,
            "markdown": self.markdown,
            "raw_text": self.raw_text,
            "formulas": self.formulas,
            "summary": self.summary,
        }


class ExtractionResult:
    def __init__(self, filename: str, total_pages: int,
                 pages: list, full_markdown: str):
        self.filename = filename
        self.total_pages = total_pages
        self.pages = pages
        self.full_markdown = full_markdown

    def to_dict(self) -> dict:
        return {
            "filename": self.filename,
            "total_pages": self.total_pages,
            "pages": [p.to_dict() for p in self.pages],
            "full_markdown": self.full_markdown,
        }


def _extract_formulas(text: str) -> list:
    """Pull LaTeX formulas from markdown text."""
    return re.findall(r'\$\$[^$]+\$\$|\$[^$\n]+\$', text)


def _strip_markdown(text: str) -> str:
    """Remove markdown syntax to get plain text."""
    text = re.sub(r'\$\$?[^$]+\$\$?', '', text)
    text = re.sub(r'[#*_`|>~\[\]()]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


# ── Docling service ───────────────────────────────────────────────────────────
class DoclingService:
    """PDF → structured content using Docling (local, no API cost)."""

    def __init__(self):
        self._converter = None  # Lazy-load — Docling downloads models on first use

    def _get_converter(self):
        if self._converter is None:
            try:
                from docling.document_converter import DocumentConverter
                self._converter = DocumentConverter()
                logger.info("Docling DocumentConverter ready")
            except ImportError:
                raise RuntimeError("docling not installed — run: pip install docling")
        return self._converter

    def extract_pdf_bytes(
        self,
        pdf_bytes: bytes,
        filename: str = "upload.pdf",
        max_pages: Optional[int] = None,
    ) -> ExtractionResult:
        """
        Convert raw PDF bytes → ExtractionResult with per-page content.

        Docling auto-detects: text, tables, formulas, images.
        max_pages limits conversion to first N pages (for validation/PoC).
        """
        converter = self._get_converter()

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = Path(tmp.name)

        try:
            logger.info(f"Docling: converting {filename} ({len(pdf_bytes)//1024} KB)")
            result = converter.convert(str(tmp_path))
            doc = result.document

            # Export full document as markdown
            full_markdown: str = doc.export_to_markdown()

            # Split into pages by Docling's page separator pattern or newlines
            # Docling groups content by page in the document model
            pages: list[PageContent] = []

            # Iterate Docling document items with page provenance
            page_buckets: dict[int, list[str]] = {}

            for element, _level in doc.iterate_items():
                # Get page number from element provenance
                page_no = 1
                prov = getattr(element, "prov", None)
                if prov and len(prov) > 0:
                    page_no = getattr(prov[0], "page_no", 1)

                if max_pages is not None and page_no > max_pages:
                    continue

                if page_no not in page_buckets:
                    page_buckets[page_no] = []

                # Get text representation of this element
                text = getattr(element, "text", "") or str(element)
                if text:
                    page_buckets[page_no].append(text)

            # If page bucketing returned nothing (e.g. Docling version differences),
            # fall back to treating full_markdown as one chunk
            if not page_buckets:
                logger.warning("Docling page provenance unavailable — using full doc as page 1")
                page_buckets[1] = [full_markdown]

            for page_no in sorted(page_buckets.keys()):
                md = "\n\n".join(page_buckets[page_no])
                pages.append(PageContent(
                    page_number=page_no,
                    markdown=md,
                    raw_text=_strip_markdown(md),
                    formulas=_extract_formulas(md),
                    summary="",  # Filled by LLM in question-generation phase
                ))

            logger.info(f"Docling extracted {len(pages)} pages from {filename}")
            return ExtractionResult(
                filename=filename,
                total_pages=len(pages),
                pages=pages,
                full_markdown=full_markdown,
            )

        finally:
            tmp_path.unlink(missing_ok=True)


# ── Vision-parse fallback ─────────────────────────────────────────────────────
class VisionParseService:
    """
    Fallback extractor: vision-parse + Gemini Vision API.
    Better for complex diagrams, handwritten content, or scanned PDFs.

    Activate via: USE_VISION_FALLBACK=true in backend/.env
    Install: pip install vision-parse
    """

    def __init__(self, gemini_api_key: str):
        self.api_key = gemini_api_key

    def extract_pdf_bytes(
        self,
        pdf_bytes: bytes,
        filename: str = "upload.pdf",
        max_pages: Optional[int] = None,
    ) -> ExtractionResult:
        try:
            from vision_parse import VisionParser
        except ImportError:
            raise RuntimeError("vision-parse not installed — run: pip install vision-parse")

        parser = VisionParser(
            model_name="gemini-1.5-flash",
            api_key=self.api_key,
            temperature=0.1,
            image_mode="base64",
            detailed_extraction=True,
            enable_concurrency=True,
        )

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = Path(tmp.name)

        try:
            page_markdowns: list = parser.convert_pdf(str(tmp_path))
            pages: list[PageContent] = []

            for i, md in enumerate(page_markdowns, start=1):
                if max_pages is not None and i > max_pages:
                    break
                pages.append(PageContent(
                    page_number=i,
                    markdown=md,
                    raw_text=_strip_markdown(md),
                    formulas=_extract_formulas(md),
                    summary="",
                ))

            return ExtractionResult(
                filename=filename,
                total_pages=len(page_markdowns),
                pages=pages,
                full_markdown="\n\n---\n\n".join(p.markdown for p in pages),
            )
        finally:
            tmp_path.unlink(missing_ok=True)


# ── Singletons ────────────────────────────────────────────────────────────────
docling_service = DoclingService()
