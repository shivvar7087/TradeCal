from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import List, Optional, Dict, Any
from app.schemas.trading_entry import TradingEntryOut

class CalendarDayData(BaseModel):
    entry_date: date
    day: int
    net_pnl: float
    gross_pnl: float
    total_charges: float
    trade_count: int
    is_holiday: bool
    holiday_name: Optional[str] = None
    is_weekend: bool
    entries: List[TradingEntryOut] = []

    model_config = ConfigDict(from_attributes=True)

class CalendarMonthResponse(BaseModel):
    month: str  # YYYY-MM
    days: List[CalendarDayData]
    monthly_net_pnl: float
    monthly_charges: float
    monthly_trades: int
    winning_days: int
    losing_days: int

class MonthlyAnalytics(BaseModel):
    month: str  # YYYY-MM
    net_pnl: float
    gross_profit: float
    gross_loss: float
    total_charges: float
    trading_days: int
    winning_days: int
    losing_days: int
    breakeven_days: int
    win_rate: float
    total_trades: int
    avg_daily_pnl: float
    best_day: Optional[Dict[str, Any]] = None
    worst_day: Optional[Dict[str, Any]] = None

class YearlyMonthSummary(BaseModel):
    month: str
    month_name: str
    net_pnl: float
    trades: int
    winning_days: int
    losing_days: int

class YearlyAnalytics(BaseModel):
    year: int
    net_pnl: float
    gross_profit: float
    gross_loss: float
    total_charges: float
    total_trades: int
    trading_days: int
    winning_days: int
    losing_days: int
    win_rate: float
    monthly_breakdown: List[YearlyMonthSummary]

class MarketHolidayOut(BaseModel):
    id: int
    market: str
    holiday_date: date
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
