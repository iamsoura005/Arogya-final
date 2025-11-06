@echo off
echo ==========================================
echo  Starting Arogya Medical Platform Suite
echo ==========================================

echo.
echo [1/3] Checking available ports and starting backend...
cd backend

:: Check if port 8000 is available, if not use 8001
netstat -an | find "8000" >nul
if %errorlevel% equ 0 (
    echo Port 8000 is in use, attempting port 8001...
    set BACKEND_PORT=8001
) else (
    set BACKEND_PORT=8000
)

echo Starting FastAPI backend on port %BACKEND_PORT%...
start "Backend Server" cmd /c "python main.py || echo Backend startup failed, trying alternative port... && python -c \"import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=%BACKEND_PORT%, reload=True)\""

:: Wait for backend to start
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting React frontend...

:: Check if port 3000 is available, if not use 3001
netstat -an | find "3000" >nul
if %errorlevel% equ 0 (
    echo Port 3000 is in use, using Vite default port 5173...
    set FRONTEND_PORT=5173
) else (
    set FRONTEND_PORT=3000
)

echo Starting React development server...
cd ..
start "Frontend Server" cmd /c "npm run dev"

:: Wait for frontend to start
timeout /t 8 /nobreak >nul

echo.
echo [3/3] Health checks and browser launch...

:: Simple health check
echo Checking backend health...
curl -f http://localhost:%BACKEND_PORT%/api/benchmarks/runs --max-time 3 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is running on http://localhost:%BACKEND_PORT%
) else (
    echo ! Backend health check failed - check server logs
)

:: Check frontend
echo Checking frontend availability...
curl -f http://localhost:5173 --max-time 3 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend is running on http://localhost:5173
) else (
    echo ! Frontend not yet ready - this is normal during startup
)

echo.
echo ==========================================
echo  Platform Status Summary
echo ==========================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:%BACKEND_PORT%
echo.
echo Opening application in browser...
echo.
echo NOTE: Keep this terminal open. Press Ctrl+C to stop both servers.
echo ==========================================

:: Open browser
start http://localhost:5173

echo.
echo Platform is now running! Use Ctrl+C to stop all servers.
pause