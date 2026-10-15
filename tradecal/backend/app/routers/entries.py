from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.schemas.trading_entry import TradingEntryCreate, TradingEntryUpdate, TradingEntryOut
from app.services import entry_service

router = APIRouter()

@router.post("", response_model=TradingEntryOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TradingEntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    entry_in: TradingEntryCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    entry = entry_service.create_entry(db, user_id, entry_in)
    return entry

@router.get("", response_model=List[TradingEntryOut])
@router.get("/", response_model=List[TradingEntryOut])
def list_entries(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    entry_date: Optional[date] = Query(None, description="Exact date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return entry_service.get_entries(db, user_id, month=month, entry_date=entry_date)

@router.get("/{entry_id}", response_model=TradingEntryOut)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    entry = entry_service.get_entry(db, user_id, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.put("/{entry_id}", response_model=TradingEntryOut)
def update_entry(
    entry_id: int,
    entry_update: TradingEntryUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    updated = entry_service.update_entry(db, user_id, entry_id, entry_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Entry not found")
    return updated

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    success = entry_service.delete_entry(db, user_id, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return None
