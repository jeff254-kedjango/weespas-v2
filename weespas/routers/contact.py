from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from core.database import get_db
from schemas.contact import ContactRequest, ContactResponse
from models.contact import ContactSubmission

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post(
    "",
    response_model=ContactResponse,
    status_code=201,
    summary="Submit a contact form inquiry",
)
def submit_contact(data: ContactRequest = Body(...), db: Session = Depends(get_db)):
    submission = ContactSubmission(
        inquiry_purpose=data.inquiry_purpose,
        description=data.description,
        full_name=data.full_name,
        email=data.email,
        organization=data.organization,
        phone=data.phone,
        message=data.message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission
