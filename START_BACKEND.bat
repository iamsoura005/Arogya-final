@echo off
REM Start Arogya Backend Server
REM This script starts the FastAPI backend on port 8000

echo.
echo ========================================
echo   Arogya Platform - Backend Server
echo ========================================
echo.
echo Starting FastAPI server on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.

cd /d "%~dp0"
python backend/main.py

pause
