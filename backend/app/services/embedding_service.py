"""
app/services/embedding_service.py — OpenAI text embeddings for Viva Engine.

Uses text-embedding-3-small (1536 dims) to generate vector representations
of document chunk text for storage in pgvector (document_chunks.embedding).

OSS reference: rag_api (danny-avila/rag_api) — embedding + retrieval patterns.
Install: pip install openai  (already in requirements.txt)
"""

import logging
from typing import Optional

from openai import AsyncOpenAI

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMS = 1536
MAX_CHARS_PER_TEXT = 24_000   # ~6 000 tokens — safe ceiling for 8 192-token model
MAX_BATCH_SIZE = 512          # OpenAI batch limit


class EmbeddingService:
    """
    Generates OpenAI embeddings for document text.

    Lazy-initialises the AsyncOpenAI client so the service can be imported
    without a valid API key (e.g. during testing / cold import).
    """

    def __init__(self) -> None:
        self._client: Optional[AsyncOpenAI] = None

    # ── Private ───────────────────────────────────────────────────────────────
    def _get_client(self) -> AsyncOpenAI:
        """Return (or create) the shared AsyncOpenAI client."""
        if self._client is None:
            settings = get_settings()
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    @staticmethod
    def _clean(text: str) -> str:
        """Strip and truncate text to the safe token ceiling."""
        return text.strip()[:MAX_CHARS_PER_TEXT]

    # ── Public ────────────────────────────────────────────────────────────────
    async def embed_text(self, text: str) -> list[float]:
        """
        Generate a 1536-dim embedding vector for a single text string.

        Args:
            text: Raw or markdown text to embed.

        Returns:
            List of 1536 floats representing the embedding.
        """
        client = self._get_client()
        clean = self._clean(text)

        if not clean:
            logger.warning("embed_text called with empty string — returning zero vector")
            return [0.0] * EMBEDDING_DIMS

        response = await client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=clean,
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for a list of texts in a single API call.

        Handles batching automatically if len(texts) > MAX_BATCH_SIZE.
        Returns embeddings in the same order as the input list.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors, one per input text.
        """
        if not texts:
            return []

        client = self._get_client()
        clean_texts = [self._clean(t) for t in texts]
        all_embeddings: list[list[float]] = []

        # Process in batches to respect OpenAI's per-request limit
        for i in range(0, len(clean_texts), MAX_BATCH_SIZE):
            batch = clean_texts[i : i + MAX_BATCH_SIZE]
            logger.debug(f"Embedding batch {i // MAX_BATCH_SIZE + 1}: {len(batch)} texts")

            response = await client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=batch,
            )

            # OpenAI guarantees order matches input, but sort by index to be safe
            sorted_data = sorted(response.data, key=lambda x: x.index)
            all_embeddings.extend(item.embedding for item in sorted_data)

        return all_embeddings


# ── Singleton ──────────────────────────────────────────────────────────────────
embedding_service = EmbeddingService()
