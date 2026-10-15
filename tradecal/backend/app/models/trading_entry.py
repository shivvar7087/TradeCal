from sqlalchemy import Column, Integer, Date, String, Numeric, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.user import User

class TradingEntry(Base):
    __tablename__ = "trading_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_date = Column(Date, nullable=False, index=True)
    symbol = Column(String(30), nullable=True)
    trade_type = Column(String(30), nullable=True, default="Intraday")
    pnl_amount = Column(Numeric(12, 2), nullable=False)  # profit (+) / loss (-)
    charges = Column(Numeric(12, 2), nullable=False, default=0.00)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship(User, backref="trading_entries")
