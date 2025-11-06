# 🚀 QUICK START - Model Comparison Dashboard

## ⚡ 5-Minute Setup

```powershell
# 1. Navigate to project
cd c:\Users\soura\Downloads\arogya-platform1-main\arogya-platform1-main

# 2. Setup environment
Copy-Item .env.example .env
# Edit .env - add your GOOGLE_API_KEY

# 3. Backend setup
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python backend/init_db.py

# 4. Frontend setup
npm install

# 5. Run everything
.\START_ALL.ps1
```

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📋 Quick Commands

### Register a Model (API)
```powershell
curl -X POST http://localhost:8000/api/v2/models/register `
  -H "Content-Type: application/json" `
  -d '{
    "model_name": "MyModel",
    "version": "1.0.0",
    "config": {"architecture": "ResNet50"},
    "weights_path": "/path/to/model.pth"
  }'
```

### List Models
```powershell
curl http://localhost:8000/api/v2/models
```

### Start Comparison
```powershell
curl -X POST http://localhost:8000/api/v2/comparison/runs `
  -H "Content-Type: application/json" `
  -d '{
    "model_ids": [1, 2],
    "dataset_id": "skin_conditions",
    "run_name": "Test Comparison"
  }'
```

## 🎯 Dashboard Usage

1. **Login** at http://localhost:5173 (use any email)
2. **Navigate** to "Model Comparison" from dashboard
3. **Select** 2-5 models from the list
4. **Choose** dataset (Skin Conditions, Eye Diseases, etc.)
5. **Click** "Start Comparison"
6. **Watch** progress bar update automatically
7. **View** results: metrics table, charts, export

## 🔧 Troubleshooting

### Backend Issues
```powershell
# Verify venv is activated
.\venv\Scripts\Activate.ps1

# Check if running
curl http://localhost:8000

# Restart
Get-Process python | Stop-Process -Force
python backend/main.py
```

### Frontend Issues
```powershell
# Check if running
curl http://localhost:5173

# Restart
Get-Process node | Stop-Process -Force
npm run dev
```

### Database Issues
```powershell
# Reset database
Remove-Item arogya.db -Force
python backend/init_db.py
```

## 📁 Key Files

### Backend
- `backend/main.py` - Main API server
- `backend/comparison/api.py` - Comparison endpoints
- `backend/comparison/evaluator.py` - Evaluation logic
- `backend/models/comparison_models.py` - Database models
- `backend/init_db.py` - DB initialization

### Frontend
- `src/App.tsx` - Main app (integrated V2 dashboard)
- `src/components/ModelComparison/ModelComparisonDashboardV2.tsx` - Main UI
- `src/hooks/useModelComparison.ts` - React hook
- `src/services/comparisonApi.ts` - API client

### Configuration
- `.env` - Environment variables
- `requirements.txt` - Python dependencies
- `package.json` - Node dependencies

## 📊 API Endpoints

```
POST   /api/v2/models/register
GET    /api/v2/models
POST   /api/v2/comparison/runs
GET    /api/v2/comparison/runs
GET    /api/v2/comparison/runs/{id}
GET    /api/v2/comparison/runs/{id}/results
GET    /api/v2/comparison/runs/{id}/artifacts/{type}
POST   /api/v2/comparison/runs/{id}/export
GET    /api/v2/comparison/cache-stats
```

## 🎨 Features

✅ Model registration and management  
✅ Multi-model comparison (2-5 models)  
✅ Dataset selection  
✅ Real-time progress tracking  
✅ Metrics: accuracy, F1, precision, recall, latency, memory  
✅ Interactive charts (Bar, Radar)  
✅ Export to JSON/CSV  
✅ Caching for instant re-runs  
✅ Recent runs history  
✅ Responsive design  

## 📚 Full Documentation

- **Technical Spec**: `MODEL_COMPARISON_IMPLEMENTATION.md`
- **Complete Setup**: `COMPLETE_RUN_GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

## 💡 Next Steps

1. Register your first model via API
2. Start a comparison from the dashboard
3. Explore results and export data
4. Replace mock evaluator with real model inference
5. Deploy to production

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] Can login to dashboard
- [ ] Model Comparison menu item visible
- [ ] Can access /docs for API reference
- [ ] Database file `arogya.db` exists
- [ ] `.env` file configured with API key

## 🆘 Getting Help

- Check `COMPLETE_RUN_GUIDE.md` for detailed troubleshooting
- Review API docs at http://localhost:8000/docs
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors

---

**Status**: ✅ Ready to use!  
**Version**: 2.0.0  
**Last Updated**: 2025-11-06
