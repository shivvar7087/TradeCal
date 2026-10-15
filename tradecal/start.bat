@echo off
title Launch TradeCal (Fullstack Without Docker)
echo ========================================================
echo   Launching TradeCal - Stock Market Trading Calendar
echo ========================================================
start "TradeCal Backend" "%~dp0run-backend.bat"
start "TradeCal Frontend" "%~dp0run-frontend.bat"
echo Both services are starting!
echo Backend:  http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo Frontend: http://localhost:5173
timeout /t 3 >nul
start http://localhost:5173
exit

