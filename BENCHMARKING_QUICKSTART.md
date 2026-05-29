# Benchmarking Dashboard - Quick Start Guide

## Overview

This guide helps you get the benchmarking dashboard up and running quickly. The full specification is in `BENCHMARKING_DASHBOARD_SPEC.md`.

## Prerequisites

```bash
# Python packages
pip install torch torchvision torchaudio
pip install tensorflow keras
pip install opencv-python
pip install ultralytics  # YOLOv8
pip install scikit-learn numpy scipy
pip install fastapi uvicorn
pip install sqlalchemy psycopg2-binary
pip install psutil

# Node packages (already in package.json)
npm install
```

## Phase 1: Quick Setup (30 minutes)

### 1. Initialize Database

```bash
# Create database directory
mkdir -p backend/benchmarking
touch backend/benchmarking/__init__.py

# Database will auto-initialize on first run
python -c "from backend.benchmarking.logging_service import BenchmarkLogger; BenchmarkLogger()"
```

### 2. Copy Backend Files

Files already created:
- `backend/benchmarking/evaluator.py` - Model evaluation logic
- `backend/benchmarking/logging_service.py` - Run logging
- `backend/benchmarking/api.py` - API endpoints
- `backend/benchmarking/statistics_service.py` - Statistical tests

### 3. Copy Frontend Files

Files already created:
- `src/components/BenchmarkingDashboard/BenchmarkingDashboard.tsx` - Dashboard UI

### 4. Update Backend Main

Add to `backend/main.py`:

```python
from benchmarking.api import router as benchmarking_router

# Add to FastAPI app
app.include_router(benchmarking_router)
```

### 5. Start Services

```bash
# Terminal 1: Backend
python backend/main.py

# Terminal 2: Frontend
npm run dev
```

### 6. Access Dashboard

- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

## Phase 2: Run First Evaluation (1 hour)

### 1. Create Evaluation Script

Create `backend/run_benchmark.py`:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from benchmarking.evaluator import ModelEvaluator
from benchmarking.logging_service import BenchmarkLogger
import time

# Create dummy model
class SimpleModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(784, 10)
    
    def forward(self, x):
        x = x.view(x.size(0), -1)
        return self.fc(x)

# Create dummy data
X_test = torch.randn(100, 1, 28, 28)
y_test = torch.randint(0, 10, (100,))
dataset = TensorDataset(X_test, y_test)
loader = DataLoader(dataset, batch_size=32)

# Evaluate
model = SimpleModel()
evaluator = ModelEvaluator(model, device='cpu')

start_time = time.time()
result = evaluator.evaluate(
    loader,
    dataset_name='test_dataset',
    model_name='SimpleModel'
)
duration = time.time() - start_time

# Log results
logger = BenchmarkLogger()
run_id = logger.log_run(
    model_name='SimpleModel',
    dataset_name='test_dataset',
    metrics=result.metrics,
    duration_seconds=duration,
    framework='PyTorch',
    status='success'
)

print(f"Run ID: {run_id}")
print(f"Metrics: {result.metrics}")
```

### 2. Run Evaluation

```bash
cd backend
python run_benchmark.py
```

### 3. View Results

Visit http://localhost:5173 and refresh the dashboard.

## Phase 3: Integrate Real Models (2-3 hours)

### 1. ResNet50 Example

```python
import torchvision.models as models
from torchvision import transforms

# Load pretrained ResNet50
model = models.resnet50(pretrained=True)
model.fc = nn.Linear(2048, 10)  # Adjust for your classes

# Evaluate
evaluator = ModelEvaluator(model, device='cuda' if torch.cuda.is_available() else 'cpu')
result = evaluator.evaluate(test_loader, 'HAM10000', 'ResNet50')
```

### 2. YOLOv8 Example

```python
from ultralytics import YOLO

# Load YOLOv8
model = YOLO('yolov8n.pt')

# For detection, you'll need custom evaluation logic
# See BENCHMARKING_DASHBOARD_SPEC.md Part 7.1 for details
```

### 3. Gemini Integration

```python
import asyncio
from backend.benchmarking.gemini_evaluator import GeminiEvaluator

async def evaluate_gemini():
    evaluator = GeminiEvaluator(api_key='your-api-key')
    
    # Prepare images (base64-encoded)
    images = [...]  # List of base64 images
    labels = [...]  # Ground truth labels
    
    result = await evaluator.evaluate_batch(images, labels)
    return result

# Run async evaluation
result = asyncio.run(evaluate_gemini())
```

## API Endpoints

### List Runs
```bash
curl http://localhost:8000/api/benchmarks/runs?limit=10
```

### Get Run Details
```bash
curl http://localhost:8000/api/benchmarks/runs/{run_id}
```

### Compare Models
```bash
curl "http://localhost:8000/api/benchmarks/comparison?models=ResNet50,YOLOv8&dataset=HAM10000&metrics=accuracy,f1"
```

### Get Robustness Metrics
```bash
curl "http://localhost:8000/api/benchmarks/robustness?model_name=ResNet50&dataset_name=HAM10000"
```

### Create Run
```bash
curl -X POST http://localhost:8000/api/benchmarks/runs \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "ResNet50",
    "dataset_name": "HAM10000",
    "metrics": {"accuracy": 0.92, "f1": 0.91},
    "duration_seconds": 120
  }'
```

## Database Schema

The database automatically creates these tables:

- `runs` - Benchmark run metadata
- `metrics` - Individual metrics per run
- `predictions` - Predictions for error analysis

Query examples:

```python
from backend.benchmarking.logging_service import BenchmarkLogger

logger = BenchmarkLogger()

# List all runs
runs = logger.list_runs(limit=100)

# Get specific run
run = logger.get_run('run_id')

# Query metrics
metrics = logger.query_metrics(
    model_names=['ResNet50'],
    dataset_names=['HAM10000'],
    metric_names=['accuracy', 'f1']
)
```

## Troubleshooting

### Database Issues
```bash
# Reset database
rm arogya_benchmarks.db

# Reinitialize
python -c "from backend.benchmarking.logging_service import BenchmarkLogger; BenchmarkLogger()"
```

### API Not Responding
```bash
# Check if backend is running
curl http://localhost:8000/

# Check logs
tail -f backend.log
```

### Dashboard Not Showing Data
1. Verify backend is running: `curl http://localhost:8000/api/benchmarks/runs`
2. Check browser console for errors (F12)
3. Verify CORS is enabled in FastAPI

### CUDA/GPU Issues
```python
# Force CPU
import torch
torch.cuda.is_available = lambda: False

# Or specify device
evaluator = ModelEvaluator(model, device='cpu')
```

## Next Steps

1. **Download Datasets**: HAM10000, ISIC 2019, EyePACS
2. **Implement Train/Val/Test Split**: See Part 3.2 in spec
3. **Add Robustness Testing**: Implement augmentations
4. **Integrate All 7 Models**: Follow examples above
5. **Add Statistical Tests**: Already implemented in `statistics_service.py`
6. **Deploy Dashboard**: Use Vercel or AWS

## Performance Tips

1. **Batch Processing**: Use batch_size=32 or 64 for throughput
2. **GPU Acceleration**: Use CUDA for faster inference
3. **Caching**: Cache model weights to avoid reloading
4. **Async Evaluation**: Use async queue for Gemini API
5. **Database Indexing**: Already configured for common queries

## Cost Optimization

- **Local Models**: Free (ResNet50, YOLOv8, CNN, Keras, PyTorch, OpenCV)
- **Gemini API**: ~$0.075 per 1M tokens (~1000 images)
- **Recommendation**: Use local models for high-volume testing, Gemini for validation

## Monitoring

Check dashboard health:
```bash
curl http://localhost:8000/api/benchmarks/summary
```

Expected response:
```json
{
  "status": "success",
  "summary": {
    "ResNet50": {
      "num_runs": 5,
      "avg_metrics": {
        "accuracy": 0.92,
        "f1": 0.91,
        "latency_mean": 85.2
      }
    }
  }
}
```

## Support

For detailed information, see:
- Full Specification: `BENCHMARKING_DASHBOARD_SPEC.md`
- Code Examples: `backend/benchmarking/` and `src/components/BenchmarkingDashboard/`
- API Documentation: http://localhost:8000/docs

---

**Status**: Ready to implement  
**Estimated Time**: 4-6 hours for full setup  
**Difficulty**: Intermediate
