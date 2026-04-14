from datetime import datetime, timedelta, timezone
from typing import Optional
import random
import string

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest, OtpVerifyRequest, UserResponse, AuthResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def _build_auth_response(user: User) -> dict:
    return {
        "token": create_access_token(user.id),
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "avatar": user.avatar,
            "created_at": user.created_at,
        },
    }


def register_user(db: Session, data: RegisterRequest) -> dict:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_auth_response(user)


def login_user(db: Session, data: LoginRequest) -> dict:
    user: Optional[User] = None

    if data.email and data.password:
        user = db.query(User).filter(User.email == data.email.lower(), User.is_active == True).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
    elif data.phone and data.password:
        user = db.query(User).filter(User.phone == data.phone, User.is_active == True).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid phone or password")
    elif data.phone:
        # OTP flow: generate OTP and return message
        user = db.query(User).filter(User.phone == data.phone, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=404, detail="No account found with this phone number")
        otp = "".join(random.choices(string.digits, k=6))
        user.otp_code = otp
        user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        db.commit()
        # In production, send OTP via SMS (e.g., Africa's Talking API)
        return {"message": "OTP sent to your phone", "otp_sent": True}
    else:
        raise HTTPException(status_code=400, detail="Provide email+password, phone+password, or phone for OTP")

    return _build_auth_response(user)


def verify_otp(db: Session, data: OtpVerifyRequest) -> dict:
    user = db.query(User).filter(User.phone == data.phone, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this phone number")

    if not user.otp_code or user.otp_code != data.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP code")

    if user.otp_expires_at and user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="OTP has expired")

    # Clear OTP after successful verification
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    return _build_auth_response(user)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
