"""
app/models/question.py — SQLAlchemy ORM model for generated questions.

Question → represents a single flashcard generated from a DocumentChunk.
Stores SM-2 state natively as JSON.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.document import DocumentChunk


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=False
    )
    
    # Generated content
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium")  # easy/medium/hard
    
    # SM-2 state tracking stored as JSON string (easier compatibility with sm-2 pip module)
    card_state: Mapped[Optional[str]] = mapped_column(Text, nullable=True) 

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    chunk: Mapped["DocumentChunk"] = relationship("DocumentChunk", backref="questions")

    def __repr__(self) -> str:
        return f"<Question id={self.id} chunk_id={self.chunk_id}>"
