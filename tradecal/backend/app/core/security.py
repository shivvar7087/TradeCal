import datetime
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.datetime.now(datetime.timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except Exception:
        return None

def get_or_create_default_user(db: Session):
    from app.models.user import User
    user = db.query(User).filter(User.email == "trader@local.app").first()
    if not user:
        user = User(
            name="My Trading Journal",
            email="trader@local.app",
            password_hash=get_password_hash("trader123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_current_user_id(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> int:
    """Return the authenticated user id if a valid token is provided;
    otherwise seamlessly fallback to the local default journal user so
    no 'Authentication required' blockers interrupt local use."""
    if token:
        user_id = decode_access_token(token)
        if user_id is not None:
            return user_id
    # Fallback seamlessly to local default user
    default_user = get_or_create_default_user(db)
    return default_user.id

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    from app.models.user import User
    user_id = get_current_user_id(token, db)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = get_or_create_default_user(db)
    return user
