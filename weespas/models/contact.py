from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
import uuid
from core.database import Base


class ContactSubmission(Base):
    """Contact form submissions from the website"""
    __tablename__ = "contact_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    inquiry_purpose = Column(String(100), nullable=False, index=True)
    description = Column(String(100), nullable=False)
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    organization = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
