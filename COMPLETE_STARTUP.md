# 🚀 Arogya Platform - Complete Startup Instructions

## ⚡ Quick Start (Choose One Method)

### Method 1: Windows - Click to Start (Easiest)
1. **Double-click** `START_ALL.bat`
2. Wait 5 seconds for services to start
3. Browser will open automatically to http://localhost:5173
4. Done! ✅

### Method 2: Windows - PowerShell
1. Right-click `START_ALL.ps1`
2. Select "Run with PowerShell"
3. Wait for services to start
4. Browser will open automatically
5. Done! ✅

### Method 3: Command Prompt (Windows)
```bash
# Terminal 1
python backend/main.py

# Terminal 2 (new window)
npm run dev
```

### Method 4: macOS/Linux Terminal
```bash
# Terminal 1
python backend/main.py

# Terminal 2 (new window)
npm run dev
```

---

## 📋 Prerequisites Check

Before starting, verify you have:

### Node.js & npm
```bash
node --version  # Should be v16+
npm --version   # Should be v8+
```

### Python
```bash
python --version  # Should be 3.8+
pip --version
```

### Dependencies Installed
```bash
# Check if node_modules exists
ls node_modules

# Check if Python packages installed
pip list | grep fastapi
```

If any are missing, run:
```bash
npm install
pip install -r requirements.txt
```

---

## 🎯 What Gets Started

### Backend Server (Port 8000)
```
✅ FastAPI Server
✅ CORS Enabled
✅ SQLite Database
✅ Gemini API Integration
✅ DeepSeek API Integration
✅ Benchmarking API
```

### Frontend Server (Port 5173)
```
✅ React Application
✅ TypeScript Support
✅ Tailwind CSS
✅ Framer Motion Animations
✅ Hot Module Reloading
```

### Services
```
✅ AI Chat (Gemini/DeepSeek)
✅ Voice Consultation (Web Speech API)
✅ Image Analysis (Gemini Vision)
✅ Symptom Checker
✅ Benchmarking Dashboard
```

---

## 🌐 Access Points

Once running, access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend** | http://localhost:8000 | API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/ | Backend status |

---

## 🔐 Test Credentials

Use these to login:
- **Email**: demo@example.com
- **Password**: demo123

---

## 📱 Features to Test

### 1. Dashboard
- View consultation history
- See health status
- Quick-start new consultation

### 2. AI Chat
- Type symptoms
- Get AI responses
- View medical sources

### 3. Voice Consultation
- Click microphone
- Speak symptoms
- Hear AI response

### 4. Image Analysis
- Upload medical image
- Get AI diagnosis
- View confidence score
- Download prescription

### 5. Symptom Checker
- Answer health questions
- Get assessment
- View recommendations

### 6. Benchmarking Dashboard
- View model comparisons
- See performance metrics
- Export results

---

## 🛠️ Troubleshooting

### Services Won't Start

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**Dependencies Missing**
```bash
npm install
pip install -r requirements.txt --upgrade
```

**Python Not Found**
- Ensure Python is in PATH
- Restart terminal after installing Python

**npm Not Found**
- Ensure Node.js is installed
- Restart terminal after installing Node.js

### Frontend Issues

**Blank Page**
- Check browser console (F12)
- Verify backend is running
- Clear browser cache

**API Errors**
- Verify backend is running on port 8000
- Check .env file has API keys
- Check browser console for errors

### Backend Issues

**API Not Responding**
- Check if backend is running
- Verify port 8000 is not blocked
- Check firewall settings

**Database Errors**
```bash
# Reset database
rm arogya_benchmarks.db

# Reinitialize
python -c "from backend.benchmarking.logging_service import BenchmarkLogger; BenchmarkLogger()"
```

---

## 📊 Monitoring

### Check Backend Status
```bash
curl http://localhost:8000/
```

### Check API Documentation
```bash
curl http://localhost:8000/docs
```

### Check Database
```bash
sqlite3 arogya_benchmarks.db ".tables"
```

### Monitor Logs
- Backend: Check console output
- Frontend: Check browser console (F12)
- Database: Check arogya_benchmarks.db

---

## 🔄 Stopping Services

### Windows
- Close the command windows
- Or press CTRL+C in each window

### macOS/Linux
- Press CTRL+C in each terminal

---

## 📁 Project Structure

```
arogya-platform/
├── src/                          # Frontend code
│   ├── components/               # React components
│   ├── services/                 # API services
│   ├── context/                  # React context
│   └── App.tsx                   # Main app
├── backend/                      # Backend code
│   ├── main.py                   # FastAPI server
│   ├── benchmarking/             # Benchmarking module
│   └── requirements.txt          # Python dependencies
├── dataset/                      # Disease models (JSON)
├── package.json                  # npm dependencies
├── START_ALL.bat                 # Windows batch script
├── START_ALL.ps1                 # Windows PowerShell script
├── START_BACKEND.bat             # Backend only
├── START_FRONTEND.bat            # Frontend only
├── STARTUP_GUIDE.md              # Detailed startup guide
├── RUN_ALL.md                    # Complete run guide
└── (Documentation files)
```

---

## 🚀 Advanced Usage

### Run Backend Only
```bash
python backend/main.py
```

### Run Frontend Only
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
python -m pytest
```

### Run Benchmarks
```bash
python backend/run_benchmark.py
```

---

## 📚 Documentation

- **STARTUP_GUIDE.md** - Detailed startup instructions
- **RUN_ALL.md** - Complete platform guide
- **PROJECT_SUMMARY.md** - Project overview
- **BENCHMARKING_DASHBOARD_SPEC.md** - Benchmarking details
- **SETUP_GUIDE.md** - Initial setup guide

---

## 🎯 Next Steps

1. **Start Services** - Use one of the methods above
2. **Login** - Use demo@example.com / demo123
3. **Explore Features** - Test all functionality
4. **Run Benchmarks** - Evaluate models
5. **Export Results** - Download data
6. **Deploy** - Push to production

---

## 💡 Tips

- Keep both backend and frontend running
- Use separate terminals for each service
- Check browser console (F12) for errors
- Monitor backend console for API calls
- Use API documentation at http://localhost:8000/docs

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can login with demo credentials
- [ ] Dashboard loads without errors
- [ ] Can send chat messages
- [ ] Can upload images
- [ ] Can use voice consultation
- [ ] Can complete symptom checker
- [ ] Can view benchmarking dashboard
- [ ] Can export data

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review STARTUP_GUIDE.md
3. Check browser console (F12)
4. Check backend console output
5. Verify all dependencies are installed

---

## 📞 Support

- **Frontend Issues**: Check browser console (F12)
- **Backend Issues**: Check terminal output
- **Database Issues**: Check arogya_benchmarks.db
- **API Issues**: Check http://localhost:8000/docs

---

**Status**: ✅ Ready to Run  
**Version**: 1.0.0  
**Last Updated**: October 2025

**Choose your startup method and get started!** 🚀

---

## Quick Command Reference

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Start backend
python backend/main.py

# Start frontend (new terminal)
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

**That's it! You're ready to go!** 🎉
