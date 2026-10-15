from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import calendar

from app.models.trading_entry import TradingEntry
from app.schemas.trading_entry import TradingEntryCreate, TradingEntryUpdate

def create_entry(db: Session, user_id: int, entry_in: TradingEntryCreate) -> TradingEntry:
    db_entry = TradingEntry(
        user_id=user_id,
        entry_date=entry_in.entry_date,
        symbol=entry_in.symbol.upper() if entry_in.symbol else None,
        trade_type=entry_in.trade_type or "Intraday",
        pnl_amount=entry_in.pnl_amount,
        charges=entry_in.charges or 0.0,
        note=entry_in.note,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_entries(db: Session, user_id: int, month: Optional[str] = None, entry_date: Optional[date] = None) -> List[TradingEntry]:
    query = db.query(TradingEntry).filter(TradingEntry.user_id == user_id)
    if entry_date:
        query = query.filter(TradingEntry.entry_date == entry_date)
    elif month:
        # month format: YYYY-MM
        try:
            year, m = map(int, month.split("-"))
            _, last_day = calendar.monthrange(year, m)
            start_d = date(year, m, 1)
            end_d = date(year, m, last_day)
            query = query.filter(TradingEntry.entry_date >= start_d, TradingEntry.entry_date <= end_d)
        except Exception:
            pass
    return query.order_by(TradingEntry.entry_date.desc(), TradingEntry.id.desc()).all()

def get_entry(db: Session, user_id: int, entry_id: int) -> Optional[TradingEntry]:
    return db.query(TradingEntry).filter(
        TradingEntry.id == entry_id,
        TradingEntry.user_id == user_id,
    ).first()

def update_entry(db: Session, user_id: int, entry_id: int, entry_update: TradingEntryUpdate) -> Optional[TradingEntry]:
    db_entry = get_entry(db, user_id, entry_id)
    if not db_entry:
        return None
    update_data = entry_update.model_dump(exclude_unset=True) if hasattr(entry_update, 'model_dump') else entry_update.dict(exclude_unset=True)
    if "symbol" in update_data and update_data["symbol"]:
        update_data["symbol"] = update_data["symbol"].upper()
    for field, value in update_data.items():
        setattr(db_entry, field, value)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def delete_entry(db: Session, user_id: int, entry_id: int) -> bool:
    db_entry = get_entry(db, user_id, entry_id)
    if not db_entry:
        return False
    db.delete(db_entry)
    db.commit()
    return True
