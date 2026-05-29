# Complete Setup and Run Guide for Arogya Platform with Model Comparison

## Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **PowerShell**: For Windows users
- **Git**: For version control

## Quick Start (5 Minutes)

### Step 1: Navigate to Project Directory

```powershell
cd c:\Users\soura\Downloads\arogya-platform1-main\arogya-platform1-main
```

### Step 2: Create Environment File

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env and add your API keys
notepad .env
```

**Required in `.env`**:
```bash
DATABASE_URL=sqlite:///./arogya.db
GOOGLE_API_KEY=your_actual_gemini_api_key
ARTIFACT_LOCAL_PATH=./backend/artifacts
```

### Step 3: Install Backend Dependencies

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Initialize Database

```powershell
# Still in activated venv
python backend/init_db.py
```

Expected output:
```
Initializing Arogya database...
✅ Database initialized successfully!
   - ModelVersion table created
   - ComparisonRun table created
   - EvaluationResult table created
   - ImagePrediction table created
   - Artifact table created
```

### Step 5: Install Frontend Dependencies

```powershell
# Deactivate venv or open new terminal
npm install
```

### Step 6: Run the Platform

**Option A: Use Provided Scripts (Recommended)**

```powershell
# Run both backend and frontend together
.\START_ALL.ps1
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```powershell
.\venv\Scripts\Activate.ps1
python backend/main.py
```

Terminal 2 - Frontend:
```powershell
npm run dev
```

### Step 7: Access the Platform

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Model Comparison**: Navigate to Dashboard → Model Comparison

---

## Detailed Installation Guide

### 1. Python Environment Setup

```powershell
# Check Python version
python --version  # Should be 3.10+

# Create virtual environment
python -m venv venv

# Activate (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (CMD)
venv\Scripts\activate.bat

# Verify activation
where python  # Should point to venv\Scripts\python.exe
```

### 2. Install Python Packages

```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

# Verify key packages
pip list | Select-String "fastapi|sqlalchemy|numpy"
```

**Key Dependencies**:
- `fastapi==0.104.0` - Web framework
- `sqlalchemy==2.0.0` - ORM for database
- `numpy==1.24.3` - Numerical computations
- `matplotlib==3.7.2` - Chart generation
- `pillow==10.0.0` - Image processing

### 3. Database Initialization

```powershell
# Initialize database tables
python backend/init_db.py

# Verify database file created
Test-Path .\arogya.db  # Should return True
```

**Database Structure**:
- `model_versions` - Registered AI models
- `comparison_runs` - Comparison run metadata
- `evaluation_results` - Model performance metrics
- `image_predictions` - Individual predictions
- `artifacts` - Generated visualizations

### 4. Frontend Setup

```powershell
# Install Node packages
npm install

# Verify installation
npm list --depth=0

# Check critical packages
npm list react axios chart.js
```

### 5. Configuration

Edit `.env` file:

```bash
# Backend API Port
API_PORT=8000

# Frontend API URL (must match backend)
VITE_API_URL=http://localhost:8000

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///./arogya.db

# AI Services (REQUIRED for image analysis)
GOOGLE_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=optional_deepseek_key

# Artifact Storage
ARTIFACT_LOCAL_PATH=./backend/artifacts

# Logging
LOG_LEVEL=INFO
```

**Getting API Keys**:
- **Gemini API**: https://makersuite.google.com/app/apikey
- **DeepSeek API**: https://platform.deepseek.com/

---

## Running the Platform

### Method 1: Automated Script (Recommended)

```powershell
# Start both services
.\START_ALL.ps1
```

This will:
1. Activate Python virtual environment
2. Start FastAPI backend on port 8000
3. Start Vite dev server on port 5173
4. Open browser automatically

### Method 2: Manual Start

**Terminal 1 - Backend**:
```powershell
.\venv\Scripts\Activate.ps1
cd c:\Users\soura\Downloads\arogya-platform1-main\arogya-platform1-main
python backend/main.py
```

Expected output:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Terminal 2 - Frontend**:
```powershell
cd c:\Users\soura\Downloads\arogya-platform1-main\arogya-platform1-main
npm run dev
```

Expected output:
```
VITE v4.4.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Method 3: Production Build

```powershell
# Build frontend
npm run build

# Output will be in dist/ folder

# Serve with backend
# Backend will serve static files from dist/
python backend/main.py
```

---

## Using the Model Comparison Dashboard

### 1. Register Models (API)

```powershell
# Example: Register a skin disease model
curl -X POST http://localhost:8000/api/v2/models/register `
  -H "Content-Type: application/json" `
  -d '{
    "model_name": "SkinNet-ResNet50",
    "version": "1.0.0",
    "config": {
      "architecture": "ResNet50",
      "input_size": [224, 224, 3],
      "num_classes": 10
    },
    "weights_path": "/models/skinnet_v1.pth"
  }'
```

### 2. Access Dashboard

1. Open http://localhost:5173
2. Login (mock authentication, use any email)
3. Click **"Model Comparison"** from dashboard menu
4. Select 2-5 models from the list
5. Choose a dataset (Skin Conditions, Eye Diseases, etc.)
6. Click **"Start Comparison"**

### 3. View Results

- **Metrics Table**: Accuracy, F1 Score, Latency for each model
- **Bar Chart**: Side-by-side performance comparison
- **Radar Chart**: Multi-dimensional performance view
- **Export**: Download results as JSON or CSV

### 4. Monitor Progress

- Running comparisons show progress bar
- Auto-refresh every 3 seconds
- Completed runs are cached for instant retrieval

---

## API Endpoints Reference

### Model Management

```
POST   /api/v2/models/register          Register new model
GET    /api/v2/models                   List all models
```

### Comparison Runs

```
POST   /api/v2/comparison/runs          Create comparison run
GET    /api/v2/comparison/runs          List all runs
GET    /api/v2/comparison/runs/{id}     Get run details
GET    /api/v2/comparison/runs/{id}/results    Get detailed results
GET    /api/v2/comparison/runs/{id}/artifacts  Get artifacts
POST   /api/v2/comparison/runs/{id}/export     Export results
```

### Utilities

```
GET    /api/v2/comparison/cache-stats   Get cache statistics
```

**API Documentation**: http://localhost:8000/docs

---

## Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

```powershell
# Verify venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

**Error**: `Port 8000 already in use`

```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess

# Kill process (replace PID)
Stop-Process -Id <PID> -Force

# Or use different port
$env:API_PORT=8001
python backend/main.py
```

### Frontend Won't Start

**Error**: `npm ERR! missing script: dev`

```powershell
# Verify package.json exists
Test-Path .\package.json

# Reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

**Error**: `EADDRINUSE: Port 5173 already in use`

```powershell
# Kill Node process
Get-Process node | Stop-Process -Force

# Or use different port
npm run dev -- --port 5174
```

### Database Issues

**Error**: `no such table: model_versions`

```powershell
# Reinitialize database
Remove-Item arogya.db -Force
python backend/init_db.py
```

**Error**: `database is locked`

```powershell
# Close all Python processes
Get-Process python | Stop-Process -Force

# Restart backend
python backend/main.py
```

### API Connection Issues

**Error**: Frontend can't reach backend

1. Verify backend is running: http://localhost:8000
2. Check `.env` file: `VITE_API_URL=http://localhost:8000`
3. Check CORS middleware in `backend/main.py`
4. Restart both services

### Model Registration Fails

**Error**: `Model already registered`

This is expected if you register the same model/version twice. Either:
- Use a different version number
- Or delete and recreate the database

---

## Performance Optimization

### Backend

```powershell
# Use Gunicorn for production (install separately)
pip install gunicorn

# Run with multiple workers
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend

```powershell
# Production build with minification
npm run build

# Preview production build
npm run preview
```

### Database

For production, use PostgreSQL:

```bash
# In .env
DATABASE_URL=postgresql://user:password@localhost:5432/arogya_db
```

---

## Testing

### Backend Tests

```powershell
# Install pytest
pip install pytest pytest-asyncio

# Run tests (when implemented)
pytest backend/tests/ -v
```

### Frontend Tests

```powershell
# Install testing libraries (if needed)
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests (when implemented)
npm test
```

---

## Deployment

### Vercel (Frontend)

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_URL production
```

### Docker (Full Stack)

```powershell
# Build and run
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## Support

### Check Logs

**Backend**:
```powershell
# Logs are printed to console
# For file logging, add to main.py:
import logging
logging.basicConfig(filename='app.log', level=logging.INFO)
```

**Frontend**:
```powershell
# Check browser console (F12)
# Vite outputs to terminal
```

### Verify Installation

```powershell
# Backend health check
curl http://localhost:8000

# Should return: {"status":"Arogya API is running","version":"2.0.0"}
```

### Common Commands

```powershell
# Restart everything
Get-Process python,node | Stop-Process -Force
.\START_ALL.ps1

# Clean reinstall
Remove-Item venv -Recurse -Force
Remove-Item node_modules -Recurse -Force
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
npm install

# Reset database
Remove-Item arogya.db -Force
python backend/init_db.py
```

---

## Conclusion

You now have a fully functional Arogya platform with:

✅ **Backend API** running on http://localhost:8000  
✅ **Frontend UI** running on http://localhost:5173  
✅ **Database** initialized with all tables  
✅ **Model Comparison** ready to use  
✅ **API Documentation** available at /docs  

**Next Steps**:
1. Register your first AI model via API
2. Start a comparison run from the dashboard
3. Explore the results and export data
4. Integrate real model inference (replace mock evaluator)
5. Deploy to production

For issues or questions, check the troubleshooting section or review the API docs at http://localhost:8000/docs.
