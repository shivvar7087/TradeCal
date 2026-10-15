from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional

class TradingEntryBase(BaseModel):
    entry_date: date
    symbol: Optional[str] = None
    trade_type: Optional[str] = "Intraday"  # Intraday, Delivery, Options, Futures, Crypto, Forex
    pnl_amount: float = Field(..., description="Profit (+) or loss (-) amount")
    charges: float = Field(default=0.0, description="Brokerage, taxes, exchange fees")
    note: Optional[str] = None

class TradingEntryCreate(TradingEntryBase):
    pass

class TradingEntryUpdate(BaseModel):
    entry_date: Optional[date] = None
    symbol: Optional[str] = None
    trade_type: Optional[str] = None
    pnl_amount: Optional[float] = None
    charges: Optional[float] = None
    note: Optional[str] = None

class TradingEntryOut(TradingEntryBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @property
    def net_amount(self) -> float:
        return round(float(self.pnl_amount) - float(self.charges), 2)

    model_config = ConfigDict(from_attributes=True)
