# 🚀 Arogya Platform - Complete Startup Guide

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
pip install -r requirements.txt
```

### Step 2: Start Backend
```bash
python backend/main.py
```
- Runs on: **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**

### Step 3: Start Frontend (New Terminal)
```bash
npm run dev
```
- Runs on: **http://localhost:5173**

---

## Windows Users - Easy Startup

### Option A: Click to Start All Services
1. Double-click `START_ALL.bat`
2. Two windows will open automatically
3. Wait 5 seconds for services to start
4. Open http://localhost:5173 in browser

### Option B: Start Services Separately
1. Double-click `START_BACKEND.bat` (Backend on port 8000)
2. Double-click `START_FRONTEND.bat` (Frontend on port 5173)
3. Open http://localhost:5173 in browser

### Option C: Manual Start (Command Prompt)
```bash
# Terminal 1
python backend/main.py

# Terminal 2 (new window)
npm run dev
```

---

## macOS/Linux Users - Terminal Commands

### Terminal 1: Start Backend
```bash
python backend/main.py
```

### Terminal 2: Start Frontend
```bash
npm run dev
```

### Terminal 3 (Optional): Monitor Logs
```bash
# Watch for errors
tail -f backend.log
```

---

## Accessing the Platform

### Frontend Application
- **URL**: http://localhost:5173
- **Features**:
  - Landing page
  - User login/registration
  - Dashboard
  - AI Chat consultation
  - Voice consultation
  - Medical image analysis
  - Symptom checker
  - Benchmarking dashboard

### Backend API
- **URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

### Test Credentials
- **Email**: demo@example.com
- **Password**: demo123

---

## What's Running

### Backend (Port 8000)
```
FastAPI Server
├── Authentication (Login/Register)
├── Consultations (Chat, Voice, Image)
├── AI Services (Gemini, DeepSeek)
├── Health Records
├── Benchmarking API
└── Database (SQLite)
```

### Frontend (Port 5173)
```
React Application
├── Landing Page
├── Authentication
├── Dashboard
├── Consultation Interface
│   ├── Chat Consultation
│   ├─��� Voice Consultation
│   ├── Image Consultation
│   └── Symptom Checker
├── Benchmarking Dashboard
└── Prescription Modal
```

### Services
```
AI Services
├── Gemini API (Image Analysis, Chat)
├── DeepSeek API (Chat Fallback)
└── Local Models (Ready for Benchmarking)

Database
├── SQLite (arogya_benchmarks.db)
├── Runs Table
├── Metrics Table
└── Predictions Table
```

---

## Testing the Features

### 1. Test Frontend
1. Open http://localhost:5173
2. Click "Get Started"
3. Login with demo credentials
4. Explore features:
   - **Dashboard**: View consultation history
   - **Chat**: Talk to AI doctor
   - **Voice**: Speak to AI doctor
   - **Image**: Upload medical image
   - **Symptoms**: Answer health questions

### 2. Test Backend API
```bash
# Health check
curl http://localhost:8000/

# Get API documentation
curl http://localhost:8000/docs

# Test chat
curl -X POST "http://localhost:8000/ai/chat?user_id=user_123&message=I%20have%20a%20headache"

# Test image diagnosis
curl -X POST http://localhost:8000/ai/image-diagnosis \
  -F "file=@path/to/image.jpg"
```

### 3. Test Benchmarking
```bash
# Get benchmark runs
curl http://localhost:8000/api/benchmarks/runs

# Get summary
curl http://localhost:8000/api/benchmarks/summary
```

---

## Troubleshooting

### Frontend Won't Start

**Error**: Port 5173 already in use
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

**Error**: Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error**: Build errors
```bash
npm run build
```

### Backend Won't Start

**Error**: Port 8000 already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**Error**: Python dependencies missing
```bash
pip install -r requirements.txt --upgrade
```

**Error**: API key issues
- Check `.env` file has `VITE_GEMINI_API_KEY`
- Check `.env` file has `VITE_DEEPSEEK_API_KEY`

### Database Issues

**Error**: Database locked
```bash
rm arogya_benchmarks.db
python -c "from backend.benchmarking.logging_service import BenchmarkLogger; BenchmarkLogger()"
```

**Error**: Check database
```bash
sqlite3 arogya_benchmarks.db ".tables"
sqlite3 arogya_benchmarks.db "SELECT COUNT(*) FROM runs;"
```

---

## Performance Monitoring

### Frontend Performance
- Open DevTools (F12)
- Check Network tab for API response times
- Monitor Console for errors
- Check Application tab for storage

### Backend Performance
- Monitor console output
- Check API response times
- Watch for errors and warnings
- Monitor CPU and memory usage

### Database Performance
- Monitor query execution time
- Check connection status
- Verify data integrity

---

## Environment Variables

### Frontend (.env)
```
VITE_GEMINI_API_KEY=AIzaSyDuECi0yeF3XtgFodMTYcJZYm0I7ByOEho
VITE_DEEPSEEK_API_KEY=sk-22cdb76c73f449f3a90d7e7f2e2dd6c2
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=sqlite:///arogya_benchmarks.db
GEMINI_API_KEY=AIzaSyDuECi0yeF3XtgFodMTYcJZYm0I7ByOEho
DEEPSEEK_API_KEY=sk-22cdb76c73f449f3a90d7e7f2e2dd6c2
```

---

## Available Commands

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend
```bash
python backend/main.py              # Start server
python backend/run_benchmark.py     # Run benchmarks
python -m pytest                    # Run tests
```

### Database
```bash
sqlite3 arogya_benchmarks.db        # Open database
python -c "from backend.benchmarking.logging_service import BenchmarkLogger; BenchmarkLogger()"  # Initialize
```

---

## Project Structure

```
arogya-platform/
├── src/
│   ├── components/
│   │   ├─�� LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ConsultationInterface.tsx
│   │   ├── ConsultationTabs/
│   │   │   ├── ChatConsultation.tsx
│   │   │   ├── VoiceConsultation.tsx
│   │   │   ├── ImageConsultation.tsx
│   │   │   └── SymptomChecker.tsx
│   │   ├── BenchmarkingDashboard/
│   │   │   └── BenchmarkingDashboard.tsx
│   │   └── PrescriptionModal.tsx
│   ├── services/
│   │   ├── geminiService.ts
│   │   ├── diseaseDatabase.ts
│   │   ├── localDatasetService.ts
│   │   └── modelDataProcessor.ts
│   ├── context/
│   │   └── AuthContext.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── backend/
│   ├── main.py
│   ├── benchmarking/
│   │   ├── evaluator.py
│   │   ├── logging_service.py
│   │   ├── api.py
│   │   └── statistics_service.py
│   └── requirements.txt
├── dataset/
│   └── (18 disease model JSON files)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── START_ALL.bat
├── START_BACKEND.bat
├── START_FRONTEND.bat
├─�� RUN_ALL.md
├── STARTUP_GUIDE.md
└── (Documentation files)
```

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Consultations
- `GET /consultations/{user_id}` - Get consultations
- `POST /consultations/save` - Save consultation

### AI Services
- `POST /ai/chat` - Chat with AI
- `POST /ai/voice` - Voice consultation
- `POST /ai/image-diagnosis` - Image analysis

### Health Records
- `GET /health-records/{user_id}` - Get health records

### Benchmarking
- `GET /api/benchmarks/runs` - List runs
- `GET /api/benchmarks/runs/{run_id}` - Get run details
- `GET /api/benchmarks/comparison` - Compare models
- `GET /api/benchmarks/robustness` - Get robustness metrics
- `POST /api/benchmarks/runs` - Create run
- `GET /api/benchmarks/summary` - Get summary

---

## Features Overview

### 1. AI Chatbot Consultation
- Real-time text-based conversation
- Context-aware responses
- Medical information from trusted sources
- Typing indicators and loading states

### 2. Voice Bot (ASR/TTS)
- Speech-to-text input
- Text-to-speech responses
- Waveform visualization
- Noise handling

### 3. Medical Image Analysis
- Drag-and-drop image upload
- AI-powered diagnosis
- Confidence scores
- Prescription generation

### 4. Symptom Checker
- Interactive flow-based questions
- Progress tracking
- Personalized recommendations
- Results summary

### 5. User Dashboard
- Consultation history
- Health status overview
- Quick-start consultations
- Profile management

### 6. Benchmarking Dashboard
- Model performance comparison
- Robustness analysis
- Cost analysis
- Export functionality

---

## Next Steps

1. **Explore Features**: Test all features in the dashboard
2. **Run Benchmarks**: Execute model evaluations
3. **Analyze Results**: View comparison charts
4. **Export Data**: Download results in CSV/JSON
5. **Deploy**: Push to production (Vercel/AWS)

---

## Support & Documentation

- **Project Summary**: `PROJECT_SUMMARY.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Benchmarking Spec**: `BENCHMARKING_DASHBOARD_SPEC.md`
- **Quick Start**: `BENCHMARKING_QUICKSTART.md`
- **Implementation Checklist**: `IMPLEMENTATION_CHECKLIST.md`
- **Run All Guide**: `RUN_ALL.md`

---

## Quick Reference

### Windows
```bash
# Start all services
START_ALL.bat

# Or start separately
START_BACKEND.bat
START_FRONTEND.bat
```

### macOS/Linux
```bash
# Terminal 1
python backend/main.py

# Terminal 2
npm run dev
```

### Access Platform
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

**Status**: ✅ Ready to Run  
**Version**: 1.0.0  
**Last Updated**: October 2025

**Choose your startup method above and get started!** 🚀
