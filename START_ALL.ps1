# Arogya Platform - Start All Services
# PowerShell script to start backend and frontend

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Arogya Platform - Complete Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to project directory
Set-Location $scriptDir

Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server (Port 8000)..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "backend/main.py" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server (Port 5173)..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Services Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Green
Start-Sleep -Seconds 2

# Open browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Close the command windows to stop the services." -ForegroundColor Yellow
Write-Host ""
