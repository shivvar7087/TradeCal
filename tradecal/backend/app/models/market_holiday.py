# app/models/market_holiday.py
from sqlalchemy import Column, Integer, String, Date, Text
from ..db.base import Base

class MarketHoliday(Base):
    __tablename__ = "market_holidays"

    id = Column(Integer, primary_key=True, index=True)
    market = Column(String(10), nullable=False)  # e.g. "NSE" or "BSE"
    holiday_date = Column(Date, nullable=False, index=True)
    description = Column(String(150), nullable=True)
