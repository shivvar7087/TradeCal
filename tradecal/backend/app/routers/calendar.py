from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.schemas.analytics import CalendarMonthResponse
from app.services import analytics_service

router = APIRouter()

@router.get("", response_model=CalendarMonthResponse)
@router.get("/", response_model=CalendarMonthResponse)
def get_month_calendar(
    month: str = Query(None, description="Month in YYYY-MM format, defaults to current month"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    if not month:
        now = datetime.now()
        month = f"{now.year:04d}-{now.month:02d}"
    return analytics_service.get_monthly_calendar(db, user_id, month)
