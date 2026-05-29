@echo off
REM Start All Arogya Services
REM This script starts both backend and frontend in separate windows

echo.
echo ========================================
echo   Arogya Platform - Complete Startup
echo ========================================
echo.
echo Starting all services...
echo.

cd /d "%~dp0"

REM Start Backend in new window
echo Starting Backend Server (Port 8000)...
start "Arogya Backend" cmd /k python backend/main.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend in new window
echo Starting Frontend Server (Port 5173)...
start "Arogya Frontend" cmd /k npm run dev

echo.
echo ========================================
echo   Services Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Close the command windows to stop the services.
echo.

pause
