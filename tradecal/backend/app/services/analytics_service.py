from sqlalchemy.orm import Session
from datetime import date, datetime
import calendar
from typing import List, Dict, Optional, Any

from app.models.trading_entry import TradingEntry
from app.models.market_holiday import MarketHoliday
from app.schemas.analytics import (
    CalendarDayData,
    CalendarMonthResponse,
    MonthlyAnalytics,
    YearlyAnalytics,
    YearlyMonthSummary,
)
from app.schemas.trading_entry import TradingEntryOut

def get_monthly_calendar(db: Session, user_id: int, month_str: str) -> CalendarMonthResponse:
    year, m = map(int, month_str.split("-"))
    _, num_days = calendar.monthrange(year, m)
    start_date = date(year, m, 1)
    end_date = date(year, m, num_days)

    # Fetch entries for the user in this month
    entries = db.query(TradingEntry).filter(
        TradingEntry.user_id == user_id,
        TradingEntry.entry_date >= start_date,
        TradingEntry.entry_date <= end_date
    ).order_by(TradingEntry.id.asc()).all()

    # Group entries by date
    entries_by_date: Dict[date, List[TradingEntry]] = {}
    for e in entries:
        entries_by_date.setdefault(e.entry_date, []).append(e)

    # Fetch holidays in this month
    holidays = db.query(MarketHoliday).filter(
        MarketHoliday.holiday_date >= start_date,
        MarketHoliday.holiday_date <= end_date
    ).all()
    holiday_map = {h.holiday_date: h.description for h in holidays}

    calendar_days: List[CalendarDayData] = []
    total_net = 0.0
    total_charges = 0.0
    total_trades = 0
    winning_days = 0
    losing_days = 0

    for day in range(1, num_days + 1):
        cur_date = date(year, m, day)
        day_entries = entries_by_date.get(cur_date, [])
        is_weekend = cur_date.weekday() in (5, 6)
        is_holiday = cur_date in holiday_map

        gross = sum(float(e.pnl_amount) for e in day_entries)
        charges = sum(float(e.charges) for e in day_entries)
        net = round(gross - charges, 2)
        count = len(day_entries)

        if count > 0:
            total_net += net
            total_charges += charges
            total_trades += count
            if net > 0:
                winning_days += 1
            elif net < 0:
                losing_days += 1

        calendar_days.append(CalendarDayData(
            entry_date=cur_date,
            day=day,
            net_pnl=net,
            gross_pnl=round(gross, 2),
            total_charges=round(charges, 2),
            trade_count=count,
            is_holiday=is_holiday,
            holiday_name=holiday_map.get(cur_date),
            is_weekend=is_weekend,
            entries=[TradingEntryOut.model_validate(e) for e in day_entries]
        ))

    return CalendarMonthResponse(
        month=month_str,
        days=calendar_days,
        monthly_net_pnl=round(total_net, 2),
        monthly_charges=round(total_charges, 2),
        monthly_trades=total_trades,
        winning_days=winning_days,
        losing_days=losing_days,
    )

def get_monthly_analytics(db: Session, user_id: int, month_str: str) -> MonthlyAnalytics:
    month_data = get_monthly_calendar(db, user_id, month_str)
    trading_days_list = [d for d in month_data.days if d.trade_count > 0]
    trading_days = len(trading_days_list)

    winning_days = 0
    losing_days = 0
    breakeven_days = 0
    gross_profit = 0.0
    gross_loss = 0.0
    total_charges = 0.0
    best_day: Optional[Dict[str, Any]] = None
    worst_day: Optional[Dict[str, Any]] = None

    for d in trading_days_list:
        total_charges += d.total_charges
        if d.net_pnl > 0:
            winning_days += 1
            gross_profit += d.net_pnl
        elif d.net_pnl < 0:
            losing_days += 1
            gross_loss += abs(d.net_pnl)
        else:
            breakeven_days += 1

        if best_day is None or d.net_pnl > best_day["amount"]:
            best_day = {"date": d.entry_date.isoformat(), "amount": d.net_pnl}
        if worst_day is None or d.net_pnl < worst_day["amount"]:
            worst_day = {"date": d.entry_date.isoformat(), "amount": d.net_pnl}

    win_rate = round((winning_days / trading_days * 100), 1) if trading_days > 0 else 0.0
    avg_daily_pnl = round(month_data.monthly_net_pnl / trading_days, 2) if trading_days > 0 else 0.0

    return MonthlyAnalytics(
        month=month_str,
        net_pnl=month_data.monthly_net_pnl,
        gross_profit=round(gross_profit, 2),
        gross_loss=round(gross_loss, 2),
        total_charges=round(total_charges, 2),
        trading_days=trading_days,
        winning_days=winning_days,
        losing_days=losing_days,
        breakeven_days=breakeven_days,
        win_rate=win_rate,
        total_trades=month_data.monthly_trades,
        avg_daily_pnl=avg_daily_pnl,
        best_day=best_day,
        worst_day=worst_day,
    )

def get_yearly_analytics(db: Session, user_id: int, year: int) -> YearlyAnalytics:
    monthly_breakdown: List[YearlyMonthSummary] = []
    total_net = 0.0
    total_charges = 0.0
    total_trades = 0
    total_winning_days = 0
    total_losing_days = 0
    total_trading_days = 0
    gross_profit = 0.0
    gross_loss = 0.0

    for m in range(1, 13):
        m_str = f"{year:04d}-{m:02d}"
        m_resp = get_monthly_calendar(db, user_id, m_str)
        month_name = calendar.month_name[m]

        t_days = [d for d in m_resp.days if d.trade_count > 0]
        total_trading_days += len(t_days)
        total_net += m_resp.monthly_net_pnl
        total_charges += m_resp.monthly_charges
        total_trades += m_resp.monthly_trades
        total_winning_days += m_resp.winning_days
        total_losing_days += m_resp.losing_days

        for d in t_days:
            if d.net_pnl > 0:
                gross_profit += d.net_pnl
            elif d.net_pnl < 0:
                gross_loss += abs(d.net_pnl)

        monthly_breakdown.append(YearlyMonthSummary(
            month=m_str,
            month_name=month_name,
            net_pnl=m_resp.monthly_net_pnl,
            trades=m_resp.monthly_trades,
            winning_days=m_resp.winning_days,
            losing_days=m_resp.losing_days,
        ))

    win_rate = round((total_winning_days / total_trading_days * 100), 1) if total_trading_days > 0 else 0.0

    return YearlyAnalytics(
        year=year,
        net_pnl=round(total_net, 2),
        gross_profit=round(gross_profit, 2),
        gross_loss=round(gross_loss, 2),
        total_charges=round(total_charges, 2),
        total_trades=total_trades,
        trading_days=total_trading_days,
        winning_days=total_winning_days,
        losing_days=total_losing_days,
        win_rate=win_rate,
        monthly_breakdown=monthly_breakdown,
    )

