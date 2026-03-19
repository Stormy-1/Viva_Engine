"""
app/services/gemini_service.py — Gemini Vision page extraction service.

Calls Gemini 1.5 Flash with a structured prompt to extract:
  - plain text
  - mathematical formulas (LaTeX)
  - diagram/figure descriptions
  - a short summary

Returns a typed PageContent dict per page.
"""

import json
import logging
from typing import TypedDict

import google.generativeai as genai
from PIL import Image

from app.core.config import get_settings
from app.services.pdf_processor import image_to_bytes

logger = logging.getLogger(__name__)

# ── Configure Gemini ──────────────────────────────────────────────────────────
settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

_MODEL_NAME = "gemini-1.5-flash"

# ── Extraction prompt ─────────────────────────────────────────────────────────
_EXTRACTION_PROMPT = """You are an expert academic content extractor. Analyse this textbook page image and extract everything precisely.

Return a JSON object with exactly these keys:

{
  "page_text": "<all readable text on the page, preserving paragraph structure>",
  "formulas": [
    {
      "latex": "<formula in LaTeX notation>",
      "description": "<what this formula represents>"
    }
  ],
  "diagrams": [
    {
      "label": "<figure/diagram label if any>",
      "description": "<detailed description of what the diagram shows>"
    }
  ],
  "summary": "<2-3 sentence summary of the key concepts on this page>",
  "topics": ["<topic 1>", "<topic 2>"]
}

Rules:
- If there are no formulas, return "formulas": []
- If there are no diagrams, return "diagrams": []
- Preserve all mathematical notation in LaTeX (e.g. $E = mc^2$)
- Be thorough with diagram descriptions — include labels, axes, relationships
- Output ONLY the JSON object, no markdown fences, no extra text
"""


# ── TypedDict for return type ─────────────────────────────────────────────────
class FormulaItem(TypedDict):
    latex: str
    description: str


class DiagramItem(TypedDict):
    label: str
    description: str


class PageContent(TypedDict):
    page_number: int
    page_text: str
    formulas: list[FormulaItem]
    diagrams: list[DiagramItem]
    summary: str
    topics: list[str]


# ── Service class ─────────────────────────────────────────────────────────────
class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel(_MODEL_NAME)

    async def extract_page_content(
        self, image: Image.Image, page_number: int
    ) -> PageContent:
        """
        Send a single page image to Gemini Vision and return structured content.

        Args:
            image:       PIL Image of the PDF page.
            page_number: 1-indexed page number (for labelling in output).

        Returns:
            PageContent typed dict.

        Raises:
            ValueError: If the model returns invalid JSON.
            RuntimeError: If the API call fails.
        """
        img_bytes = image_to_bytes(image)

        # Build Gemini Vision parts
        image_part = {"mime_type": "image/jpeg", "data": img_bytes}

        try:
            response = self.model.generate_content(
                [_EXTRACTION_PROMPT, image_part],
                generation_config=genai.GenerationConfig(
                    temperature=0.1,     # low temp = consistent structured output
                    max_output_tokens=4096,
                ),
            )
            raw_text = response.text.strip()

            # Strip any accidental markdown fences
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]

            parsed = json.loads(raw_text)
            parsed["page_number"] = page_number
            logger.info(f"Gemini extracted page {page_number}: {len(parsed.get('page_text',''))} chars")
            return PageContent(**parsed)

        except json.JSONDecodeError as exc:
            logger.error(f"Gemini returned non-JSON for page {page_number}: {exc}")
            raise ValueError(f"Gemini returned invalid JSON on page {page_number}: {exc}") from exc
        except Exception as exc:
            logger.error(f"Gemini API error on page {page_number}: {exc}")
            raise RuntimeError(f"Gemini Vision API error: {exc}") from exc

    async def extract_pages(
        self, images: list[Image.Image]
    ) -> list[PageContent]:
        """Extract content from multiple page images sequentially."""
        results = []
        for i, img in enumerate(images, start=1):
            content = await self.extract_page_content(img, page_number=i)
            results.append(content)
        return results


# ── Singleton ─────────────────────────────────────────────────────────────────
gemini_service = GeminiService()
