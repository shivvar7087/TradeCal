from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.models import user, trading_entry, market_holiday
from app.routers import auth, entries, calendar, analytics, holidays
from app.routers.holidays import seed_holidays_if_empty

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables if they do not exist
    Base.metadata.create_all(bind=engine)
    # Seed default holidays
    db = SessionLocal()
    try:
        seed_holidays_if_empty(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="TradeCal API - Stock Market Trading Calendar & P/L Tracker",
    description="Backend API for TradeCal stock market journal and profit/loss calendar",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(entries.router, prefix="/api/entries", tags=["Trading Entries"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar View"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics & Reports"])
app.include_router(holidays.router, prefix="/api/holidays", tags=["Market Holidays"])

@app.get("/")
def root():
    return {
        "app": "TradeCal API",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
