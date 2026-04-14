from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
import re


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    phone: str = Field(..., max_length=20)
    password: str = Field(..., min_length=6, max_length=128)

    @validator("email")
    def validate_email(cls, v):
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.lower()

    @validator("phone")
    def validate_phone(cls, v):
        cleaned = re.sub(r"[\s\-()]", "", v)
        if len(cleaned) < 10:
            raise ValueError("Phone number must be at least 10 digits")
        return cleaned


class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None

    @validator("email", pre=True)
    def normalize_email(cls, v):
        return v.lower() if v else v


class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    avatar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
