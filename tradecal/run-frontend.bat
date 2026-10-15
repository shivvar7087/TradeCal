@echo off
title TradeCal Frontend (React + Vite)
cd /d "%~dp0frontend"
echo ========================================================
echo   Starting TradeCal Frontend on http://localhost:5173
echo ========================================================
if not exist "node_modules" (
    echo Installing node dependencies...
    npm install
)
npm run dev
pause

