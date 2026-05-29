# 🚀 Arogya Platform - Complete Startup Guide

## Quick Start (All Services)

This guide will help you run the complete Arogya platform with:
- ✅ Frontend (React + TypeScript + Vite)
- ✅ Backend (FastAPI + Python)
- ✅ ML Services (Gemini API + DeepSeek)
- ✅ Database (SQLite)

---

## Prerequisites

### 1. Check Node.js Installation
```bash
node --version  # Should be v16+
npm --version   # Should be v8+
```

### 2. Check Python Installation
```bash
python --version  # Should be 3.8+
pip --version
```

### 3. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
pip install -r requirements.txt
```

---

## Running the Platform

### Option 1: Run Everything in Separate Terminals (Recommended)

#### Terminal 1: Backend Server
```bash
python backend/main.py
```
- Runs on: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/

#### Terminal 2: Frontend Development Server
```bash
npm run dev
```
- Runs on: http://localhost:5173
- Auto-reload on file changes

#### Terminal 3: Monitor Logs (Optional)
```bash
# Watch backend logs
tail -f backend.log

# Or check database
sqlite3 arogya_benchmarks.db ".tables"
```

---

## Accessing the Platform

### Frontend
- **URL**: http://localhost:5173
- **Features**:
  - Landing page with features overview
  - User authentication (demo mode)
  - Dashboard with consultation history
  - AI Chat consultation
  - Voice consultation
  - Medical image analysis
  - Symptom checker

### Backend API
- **URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Key Endpoints**:
  - `GET /` - Health check
  - `POST /auth/register` - Register user
  - `POST /auth/login` - Login user
  - `GET /consultations/{user_id}` - Get consultations
  - `POST /ai/chat` - Chat with AI
  - `POST /ai/image-diagnosis` - Analyze medical image
  - `GET /api/benchmarks/runs` - Get benchmark runs

---

## Testing the Features

### 1. Test Frontend
1. Open http://localhost:5173
2. Click "Get Started" or "Login"
3. Use demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123`
4. Explore features:
   - Dashboard
   - Chat consultation
   - Voice consultation
   - Image analysis
   - Symptom checker

### 2. Test Backend API
```bash
# Health check
curl http://localhost:8000/

# Get API documentation
curl http://localhost:8000/docs

# Test chat endpoint
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_123", "message": "I have a headache"}'

# Test image diagnosis
curl -X POST http://localhost:8000/ai/image-diagnosis \
  -F "file=@path/to/image.jpg"
```

### 3. Test ML Services
- **Gemini API**: Integrated for image analysis and chat
- **DeepSeek API**: Fallback for chat responses
- **Local Models**: Ready for benchmarking

---

## Project Structure

```
arogya-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ConsultationInterface.tsx
│   │   │   ├── ConsultationTabs/
│   │   │   │   ├── ChatConsultation.tsx
│   │   │   │   ├── VoiceConsultation.tsx
│   │   │   │   ├── ImageConsultation.tsx
│   │   │   │   └── SymptomChecker.tsx
│   │   │   ├── BenchmarkingDashboard/
│   │   │   │   └── BenchmarkingDashboard.tsx
│   │   │   └── PrescriptionModal.tsx
│   │   ├── services/
│   │   │   ├── geminiService.ts
│   │   │   ├── diseaseDatabase.ts
│   │   │   ├── localDatasetService.ts
│   │   │   └── modelDataProcessor.ts
│   │   ├── context/
│   │   │   └── AuthContext.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── backend/
│   ├── main.py (FastAPI server)
│   ├── benchmarking/
│   │   ├── evaluator.py
│   │   ├── logging_service.py
│   │   ├── api.py
│   │   └── statistics_service.py
│   └── requirements.txt
│
├── dataset/
│   ├── Acne Recognization.json
│   ├── alzheimer_model.json
│   ├── chronic kidney diseases.json
│   ├── dengue_model.json
│   ├── dermatology_model_config.json
│   ├── dermnet_model.json
│   ├── diabetes json.json
│   ├── epileptic seizure json.json
│   ├── eye_disease_model.json
│   ├── facial_skin_disease_model.json
│   ├── heart_disease_model.json
│   ├── lung cancer json.json
│   ├── mental_health_model.json
│   ├── monkeypox_model.json
│   ├── multiple_disease_model.json
│   ├── ocular_disease_model.json
│   ├── skin_cancer_model.json
│   └── skin_lesion_model.json
│
└── Documentation/
    ├── BENCHMARKING_DASHBOARD_SPEC.md
    ├── BENCHMARKING_QUICKSTART.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── NEXT_ACTIONS.md
    ├── PROJECT_SUMMARY.md
    ├── SETUP_GUIDE.md
    └── README.md
```

---

## Troubleshooting

### Frontend Issues

#### Port 5173 Already in Use
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

#### Dependencies Not Installed
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
npm run build
```

### Backend Issues

#### Port 8000 Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

#### Python Dependencies Missing
```bash
pip install -r requirements.txt --upgrade
```

#### API Key Issues
- Check `.env` file has valid `VITE_GEMINI_API_KEY`
- Check `.env` file has valid `VITE_DEEPSEEK_API_KEY`

### Database Issues

#### Database Locked
```bash
# Remove old database
rm arogya_benchmarks.db

# Reinitialize
python -c "from backend.benchmarking.logging_service import BenchmarkLogger; BenchmarkLogger()"
```

#### Check Database
```bash
sqlite3 arogya_benchmarks.db ".tables"
sqlite3 arogya_benchmarks.db "SELECT COUNT(*) FROM runs;"
```

---

## Performance Tips

### Frontend
- Use Chrome DevTools for performance profiling
- Check Network tab for API response times
- Monitor Console for errors

### Backend
- Monitor CPU and memory usage
- Check API response times in logs
- Use `uvicorn --reload` for development

### Database
- Add indexes for frequently queried columns
- Monitor query performance
- Clean up old data regularly

---

## Environment Variables

### Frontend (.env)
```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=sqlite:///arogya_benchmarks.db
GEMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
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

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Consultations
- `GET /consultations/{user_id}` - Get user consultations
- `POST /consultations/save` - Save consultation

### AI Services
- `POST /ai/chat` - Chat with AI
- `POST /ai/voice` - Voice consultation
- `POST /ai/image-diagnosis` - Image analysis

### Health Records
- `GET /health-records/{user_id}` - Get health records

### Benchmarking
- `GET /api/benchmarks/runs` - List benchmark runs
- `GET /api/benchmarks/runs/{run_id}` - Get run details
- `GET /api/benchmarks/comparison` - Compare models
- `GET /api/benchmarks/robustness` - Get robustness metrics
- `POST /api/benchmarks/runs` - Create new run
- `GET /api/benchmarks/summary` - Get summary statistics

---

## Monitoring & Logs

### Frontend Logs
- Browser Console (F12)
- Network tab for API calls
- Application tab for storage

### Backend Logs
- Console output
- Check for errors and warnings
- Monitor API response times

### Database Logs
- Query execution time
- Connection status
- Data integrity

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

---

## Quick Commands Summary

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Start backend (Terminal 1)
python backend/main.py

# Start frontend (Terminal 2)
npm run dev

# Access platform
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs

# Test API
curl http://localhost:8000/

# Check database
sqlite3 arogya_benchmarks.db ".tables"
```

---

**Status**: ✅ Ready to Run  
**Version**: 1.0.0  
**Last Updated**: October 2025

**Start with Terminal 1 (Backend), then Terminal 2 (Frontend)!** 🚀
