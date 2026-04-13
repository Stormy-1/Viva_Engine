"""
app/services/question_service.py — Question Generation via Gemini 1.5 Flash

Takes extracted DocumentChunk text and generates flashcards (Q&A pairs)
using Google's Gemini LLM. Uses structured JSON output to ensure conformity.

Prompt patterns lifted from open-source references (quizify_ai / exam-question-generator).
"""

import json
import logging
import uuid
from typing import TypedDict

import google.generativeai as genai

from app.core.config import get_settings
from app.models.document import DocumentChunk
from app.models.question import Question

logger = logging.getLogger(__name__)

# ── Configure Gemini ──────────────────────────────────────────────────────────
settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

_MODEL_NAME = "gemini-1.5-flash"

# ── Generation Prompt ─────────────────────────────────────────────────────────

_GENERATION_PROMPT = """You are an expert educational content creator.
Generate high-quality flashcards (questions and answers) from the provided text chunk.

Focus on key concepts, vocabulary, important dates or formulas.
Keep questions concise and clear. Answers should be accurate and easily spoken aloud.

Return a JSON array of objects with exactly these keys:

[
  {
    "question_text": "<clear, concise question>",
    "answer_text": "<accurate answer>",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Rules:
- Generate 3 to 5 flashcards maximum from this text.
- If the text chunk has very little information, it's okay to generate 1 or 2.
- Output ONLY the JSON array, no markdown fences, no extra text.

Text Chunk:
\"\"\"
{text}
\"\"\"
"""


class GeneratedCard(TypedDict):
    question_text: str
    answer_text: str
    difficulty: str


class QuestionService:
    def __init__(self):
        self.model = genai.GenerativeModel(_MODEL_NAME)

    async def generate_questions_for_chunk(self, chunk: DocumentChunk) -> list[Question]:
        """
        Takes a DocumentChunk, calls Gemini to generate flashcard Q&A pairs,
        and returns a list of unsaved Question model instances.

        Args:
            chunk: A DocumentChunk instance containing `raw_text`

        Returns:
            List of Question objects

        Raises:
            ValueError: If Gemini returns invalid JSON or fails to parse.
            RuntimeError: If Gemini API fails.
        """
        text_to_process = chunk.raw_text or chunk.summary or ""
        if not text_to_process.strip():
            logger.warning(f"Chunk {chunk.id} has no text. Skipping question generation.")
            return []

        prompt = _GENERATION_PROMPT.format(text=text_to_process)

        try:
            # We use synchronous model.generate_content but run it in an async-compatible wrapper
            # For simplicity using the standard call, but generation_config forces json.
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.2,  # Low temp for predictable output
                    response_mime_type="application/json"
                ),
            )
            raw_text = response.text.strip()
            
            # Since response_mime_type="application/json" is provided, Gemini should return valid JSON
            parsed_cards: list[GeneratedCard] = json.loads(raw_text)
            
            questions = []
            for card in parsed_cards:
                q = Question(
                    id=uuid.uuid4(),
                    chunk_id=chunk.id,
                    question_text=card["question_text"],
                    answer_text=card["answer_text"],
                    difficulty=card.get("difficulty", "medium"),
                    # Initialize card_state as empty string or default dict for SM-2
                    card_state=None 
                )
                questions.append(q)
                
            logger.info(f"Generated {len(questions)} questions for chunk {chunk.id}")
            return questions

        except json.JSONDecodeError as exc:
            logger.error(f"Gemini returned non-JSON for chunk {chunk.id}: {exc}")
            raise ValueError(f"Gemini returned invalid JSON for chunk {chunk.id}: {exc}") from exc
        except Exception as exc:
            logger.error(f"Gemini API error on question generation: {exc}")
            raise RuntimeError(f"Gemini API error: {exc}") from exc


# ── Singleton ─────────────────────────────────────────────────────────────────
question_service = QuestionService()
