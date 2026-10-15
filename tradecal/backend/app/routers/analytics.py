from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.schemas.analytics import MonthlyAnalytics, YearlyAnalytics
from app.services import analytics_service

router = APIRouter()

@router.get("/monthly", response_model=MonthlyAnalytics)
def get_monthly_analytics(
    month: str = Query(None, description="Month in YYYY-MM format, defaults to current month"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    if not month:
        now = datetime.now()
        month = f"{now.year:04d}-{now.month:02d}"
    return analytics_service.get_monthly_analytics(db, user_id, month)

@router.get("/yearly", response_model=YearlyAnalytics)
def get_yearly_analytics(
    year: int = Query(None, description="Year, defaults to current year"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    if not year:
        year = datetime.now().year
    return analytics_service.get_yearly_analytics(db, user_id, year)

