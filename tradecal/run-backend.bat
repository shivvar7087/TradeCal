@echo off
title TradeCal Backend (FastAPI)
cd /d "%~dp0backend"
echo ========================================================
echo   Starting TradeCal Backend on http://127.0.0.1:8000
echo ========================================================
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

