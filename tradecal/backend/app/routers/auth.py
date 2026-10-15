from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.trading_entry import TradingEntry
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

def migrate_local_entries_to_user(db: Session, target_user_id: int):
    """Automatically attach any entries created in local/guest mode to the user's account upon login/register."""
    default_user = db.query(User).filter(User.email == "trader@local.app").first()
    if default_user and default_user.id != target_user_id:
        db.query(TradingEntry).filter(TradingEntry.user_id == default_user.id).update(
            {"user_id": target_user_id}
        )
        db.commit()

@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    migrate_local_entries_to_user(db, new_user.id)
    token = create_access_token({"sub": str(new_user.id)})
    return {
        "user": UserOut.model_validate(new_user),
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/login")
def login(form: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.email).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    migrate_local_entries_to_user(db, user.id)
    token = create_access_token({"sub": str(user.id)})
    return {
        "user": UserOut.model_validate(user),
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
