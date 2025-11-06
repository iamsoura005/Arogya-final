@echo off
REM Start Arogya Frontend Development Server
REM This script starts the Vite development server on port 5173

echo.
echo ========================================
echo   Arogya Platform - Frontend Server
echo ========================================
echo.
echo Starting Vite development server on http://localhost:5173
echo.
echo Press CTRL+C to stop the server
echo.

cd /d "%~dp0"
npm run dev

pause
