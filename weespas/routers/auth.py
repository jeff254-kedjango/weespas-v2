from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from core.database import get_db
from schemas.auth import RegisterRequest, LoginRequest, OtpVerifyRequest, AuthResponse, UserResponse
from services.auth_service import register_user, login_user, verify_otp, get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
    summary="Register a new user",
)
def register(data: RegisterRequest = Body(...), db: Session = Depends(get_db)):
    return register_user(db, data)


@router.post(
    "/login",
    summary="Login with email/password, phone/password, or request OTP",
)
def login(data: LoginRequest = Body(...), db: Session = Depends(get_db)):
    return login_user(db, data)


@router.post(
    "/verify-otp",
    response_model=AuthResponse,
    summary="Verify OTP code sent to phone",
)
def otp_verify(data: OtpVerifyRequest = Body(...), db: Session = Depends(get_db)):
    return verify_otp(db, data)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def me(current_user: User = Depends(get_current_user)):
    return current_user
