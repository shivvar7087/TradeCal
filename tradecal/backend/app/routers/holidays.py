from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.db.session import get_db
from app.models.market_holiday import MarketHoliday
from app.schemas.analytics import MarketHolidayOut

router = APIRouter()

# Seed default market holidays for common years
DEFAULT_HOLIDAYS = [
    # 2026 Sample Market Holidays (NSE / BSE)
    {"market": "NSE", "holiday_date": date(2026, 1, 26), "description": "Republic Day"},
    {"market": "NSE", "holiday_date": date(2026, 3, 6), "description": "Holi"},
    {"market": "NSE", "holiday_date": date(2026, 3, 20), "description": "Id-Ul-Fitr"},
    {"market": "NSE", "holiday_date": date(2026, 4, 3), "description": "Good Friday"},
    {"market": "NSE", "holiday_date": date(2026, 4, 14), "description": "Dr. Ambedkar Jayanti"},
    {"market": "NSE", "holiday_date": date(2026, 5, 1), "description": "Maharashtra Day"},
    {"market": "NSE", "holiday_date": date(2026, 8, 15), "description": "Independence Day"},
    {"market": "NSE", "holiday_date": date(2026, 10, 2), "description": "Mahatma Gandhi Jayanti"},
    {"market": "NSE", "holiday_date": date(2026, 10, 20), "description": "Dussehra"},
    {"market": "NSE", "holiday_date": date(2026, 11, 8), "description": "Diwali Laxmi Pujan"},
    {"market": "NSE", "holiday_date": date(2026, 12, 25), "description": "Christmas"},
]

def seed_holidays_if_empty(db: Session):
    count = db.query(MarketHoliday).count()
    if count == 0:
        for h in DEFAULT_HOLIDAYS:
            db.add(MarketHoliday(**h))
        db.commit()

@router.get("/", response_model=List[MarketHolidayOut])
@router.get("", response_model=List[MarketHolidayOut])
def get_holidays(
    year: int = Query(None, description="Year to filter holidays"),
    db: Session = Depends(get_db)
):
    seed_holidays_if_empty(db)
    query = db.query(MarketHoliday)
    if year:
        start_d = date(year, 1, 1)
        end_d = date(year, 12, 31)
        query = query.filter(MarketHoliday.holiday_date >= start_d, MarketHoliday.holiday_date <= end_d)
    return query.order_by(MarketHoliday.holiday_date.asc()).all()

