# Arogya Platform: Image-Based Disease Analysis Benchmarking Dashboard
## Comprehensive Specification & Implementation Guide

**Version**: 1.0  
**Date**: October 2025  
**Status**: Ready for Implementation  
**Scope**: Incremental benchmarking system for medical image analysis models

---

## Executive Summary

This document specifies a production-ready benchmarking dashboard for the Arogya platform's image-based disease analysis feature. The dashboard will compare 7 model/pipeline options across multiple evaluation metrics, datasets, and disease categories. The implementation is designed to be modular, incremental, and privacy-compliant for healthcare applications.

**Key Objectives:**
- Compare model performance across standardized metrics
- Track inference latency, throughput, and resource utilization
- Enable fair comparison of cloud (Gemini) vs. local models
- Support reproducible experiments with proper train/val/test splits
- Provide actionable insights for model selection and optimization

---

## Part 1: Project Context & Current State

### 1.1 Existing Architecture

**Frontend Stack:**
- React 18 + TypeScript + Vite
- Tailwind CSS for UI
- Framer Motion for animations
- Current image consultation: `ImageConsultation.tsx`

**Backend Stack:**
- FastAPI (Python) with CORS enabled
- Mock endpoints for image diagnosis
- Ready for real model integration

**Current Image Analysis Flow:**
1. User uploads image via drag-and-drop
2. Image converted to base64
3. Sent to Gemini 2.5 Flash API
4. Response parsed as JSON diagnosis
5. Results displayed with confidence, medicines, recommendations

**Existing Models/Services:**
- Gemini 2.5 Flash (cloud, primary)
- DeepSeek API (fallback for chat)
- Local disease database (JSON-based)
- Dataset-enhanced context from `localDatasetService.ts`

### 1.2 Constraints & Assumptions

**Pragmatic Assumptions:**
1. **ResNet50, YOLOv8, CNN, Keras, PyTorch, OpenCV** are treated as:
   - **Frameworks**: Keras, PyTorch, OpenCV (can implement multiple models)
   - **Specific Models**: ResNet50 (CNN architecture), YOLOv8 (object detection)
   - **Pipelines**: Combinations of preprocessing + model + postprocessing

2. **Gemini Image Processing** = Gemini 2.5 Flash API with image input

3. **Baseline Implementations:**
   - ResNet50: Transfer learning on medical images (skin, eye, oral)
   - YOLOv8: Lesion/abnormality detection + classification
   - CNN: Custom 3-layer CNN for binary/multi-class classification
   - Keras: Wrapper for ResNet50 or custom sequential model
   - PyTorch: ResNet50 or custom CNN implementation
   - OpenCV: Classical image processing + ML (SVM/KNN on features)
   - Gemini: API-based multimodal analysis

4. **Privacy & Compliance:**
   - No real PHI stored; use synthetic/public datasets
   - DICOM support optional (focus on JPG/PNG)
   - De-identification: Strip metadata, use anonymized IDs
   - Audit logging for all model predictions
   - HIPAA-ready architecture (not enforced in demo)

---

## Part 2: Model & Pipeline Definitions

### 2.1 Model Taxonomy

| Model/Pipeline | Type | Framework | Input | Output | Latency Profile | Cost |
|---|---|---|---|---|---|---|
| **ResNet50** | CNN (Transfer Learning) | PyTorch/Keras | Image (224×224) | Class + Confidence | ~50-200ms | Free (local) |
| **YOLOv8** | Object Detection | PyTorch | Image (640×640) | Bboxes + Classes | ~30-100ms | Free (local) |
| **CNN** | Custom CNN | PyTorch/Keras | Image (128×128) | Class + Confidence | ~20-80ms | Free (local) |
| **Keras** | Sequential/Functional | Keras/TF | Image (224×224) | Class + Confidence | ~40-150ms | Free (local) |
| **PyTorch** | Custom/Pretrained | PyTorch | Image (224×224) | Class + Confidence | ~30-120ms | Free (local) |
| **OpenCV** | Classical ML | OpenCV + Scikit-learn | Image (any) | Class + Confidence | ~10-50ms | Free (local) |
| **Gemini** | Multimodal LLM | Google Cloud | Image (any size) | Structured JSON | ~500-2000ms | $0.075/1M tokens |

### 2.2 Concrete Baseline Implementations

#### ResNet50 (Transfer Learning)
```
Architecture: ResNet50 pretrained on ImageNet, fine-tuned on medical images
Input: 224×224 RGB image
Output: Softmax probabilities over disease classes
Training: 80% train, 10% val, 10% test
Metrics: Accuracy, F1, AUROC, sensitivity, specificity
```

#### YOLOv8 (Object Detection)
```
Architecture: YOLOv8n (nano) for lesion detection
Input: 640×640 RGB image
Output: Bounding boxes + class labels + confidence
Training: 80% train, 10% val, 10% test
Metrics: mAP@0.5, mAP@0.5:0.95, precision, recall
```

#### CNN (Custom 3-Layer)
```
Architecture:
  Conv2D(32, 3×3) → ReLU → MaxPool(2×2)
  Conv2D(64, 3×3) → ReLU → MaxPool(2×2)
  Conv2D(128, 3×3) → ReLU → GlobalAvgPool
  Dense(256) → ReLU → Dropout(0.5)
  Dense(num_classes) → Softmax
Input: 128×128 RGB image
Output: Class probabilities
Training: 80% train, 10% val, 10% test
Metrics: Accuracy, F1, AUROC
```

#### Keras (Sequential Model)
```
Architecture: Keras Sequential with Functional API option
  Input(224, 224, 3)
  Conv2D(32, 3, activation='relu') → MaxPooling2D(2)
  Conv2D(64, 3, activation='relu') → MaxPooling2D(2)
  Flatten() → Dense(128, activation='relu') → Dropout(0.5)
  Dense(num_classes, activation='softmax')
Input: 224×224 RGB image
Output: Class probabilities
Training: 80% train, 10% val, 10% test
Metrics: Accuracy, F1, AUROC
```

#### PyTorch (Custom CNN)
```
Architecture: Custom PyTorch module
  Conv2d(3, 32, 3) → ReLU → MaxPool2d(2)
  Conv2d(32, 64, 3) → ReLU → MaxPool2d(2)
  Conv2d(64, 128, 3) → ReLU → AdaptiveAvgPool2d(1)
  Linear(128, 256) → ReLU → Dropout(0.5)
  Linear(256, num_classes)
Input: 224×224 RGB image
Output: Logits (softmax applied in loss)
Training: 80% train, 10% val, 10% test
Metrics: Accuracy, F1, AUROC
```

#### OpenCV (Classical ML)
```
Pipeline:
  1. Image preprocessing: Resize to 128×128, normalize
  2. Feature extraction: ORB/SIFT descriptors or HOG
  3. Classification: SVM or KNN on feature vectors
Input: Any size image (resized to 128×128)
Output: Class label + confidence (distance-based)
Training: 80% train, 10% val, 10% test
Metrics: Accuracy, F1, AUROC
```

#### Gemini Image Processing
```
API: Google Generative AI (gemini-2.5-flash)
Input: Base64-encoded image (any size, auto-resized)
Output: Structured JSON with diagnosis, confidence, medicines, recommendations
Latency: ~500-2000ms (includes network)
Cost: ~$0.075 per 1M input tokens (~1000 images)
Rate Limits: 15 requests/min (free tier), 60 requests/min (paid)
Batch Size: 1 (sequential) or async queue for throughput
```

---

## Part 3: Evaluation Metrics & Datasets

### 3.1 Evaluation Metrics

#### Classification Metrics (for all models)
```
1. Accuracy: (TP + TN) / (TP + TN + FP + FN)
2. Precision: TP / (TP + FP)
3. Recall (Sensitivity): TP / (TP + FN)
4. Specificity: TN / (TN + FP)
5. F1-Score: 2 * (Precision * Recall) / (Precision + Recall)
6. AUROC: Area under ROC curve (for binary/one-vs-rest)
7. Calibration Error: |predicted_prob - actual_freq|
8. Matthews Correlation Coefficient (MCC): Balanced metric for imbalanced data
```

#### Performance Metrics (all models)
```
1. Latency (ms): Time from input to output (p50, p95, p99)
2. Throughput (images/sec): Batch size / total time
3. Memory Usage (MB): Peak RAM during inference
4. GPU Memory (MB): VRAM if applicable
5. CPU Utilization (%): Average CPU usage during inference
6. Cost per Inference ($): Model cost / number of inferences
```

#### Robustness Metrics (all models)
```
1. Noise Robustness: Accuracy on Gaussian noise (σ=0.1, 0.2, 0.3)
2. Blur Robustness: Accuracy on Gaussian blur (kernel=3, 5, 7)
3. Rotation Robustness: Accuracy on rotated images (±15°, ±30°)
4. Brightness Robustness: Accuracy on brightness-adjusted images (±20%, ±40%)
5. Compression Robustness: Accuracy on JPEG compressed images (quality=50, 75, 90)
```

#### Detection Metrics (YOLOv8 only)
```
1. mAP@0.5: Mean average precision at IoU=0.5
2. mAP@0.5:0.95: Mean average precision at IoU=0.5 to 0.95
3. Precision: TP / (TP + FP)
4. Recall: TP / (TP + FN)
5. F1-Score: 2 * (Precision * Recall) / (Precision + Recall)
```

### 3.2 Datasets

#### Primary Datasets (Public, De-identified)

| Dataset | Size | Classes | Domain | Format | License |
|---|---|---|---|---|---|
| **HAM10000** | 10,015 images | 7 (skin lesions) | Dermatology | JPG | CC-BY-NC |
| **ISIC 2019** | 25,331 images | 8 (skin cancer) | Dermatology | JPG | CC-BY-NC |
| **EyePACS** | 88,702 images | 5 (diabetic retinopathy) | Ophthalmology | JPEG | CC-BY-NC-SA |
| **Oral Cancer** | 1,000+ images | 2-3 (oral lesions) | Dentistry | JPG | Various |
| **COVID-19 CXR** | 13,975 images | 3 (pneumonia/COVID/normal) | Radiology | PNG | CC0 |
| **Synthetic Medical** | 5,000 images | 10 (mixed conditions) | General | JPG | Generated |

#### Train/Val/Test Split Strategy
```
Total Dataset: 100,000 images (combined)
- Training Set: 80,000 images (80%)
  - Used for model training and hyperparameter tuning
  - Stratified by disease class to maintain distribution
  
- Validation Set: 10,000 images (10%)
  - Used for early stopping and model selection
  - Separate from training to prevent overfitting
  
- Test Set: 10,000 images (10%)
  - Used for final evaluation and benchmarking
  - Never seen during training or validation
  - Stratified by disease class
  
- Temporal Split (optional): If time-series data available
  - Train: Images from 2018-2021
  - Val: Images from 2022
  - Test: Images from 2023-2024
```

#### Data Augmentation (Training Only)
```
Applied to training set to improve robustness:
- Random rotation: ±15°
- Random horizontal flip: 50% probability
- Random brightness: ±20%
- Random contrast: ±20%
- Random Gaussian noise: σ=0.01-0.05
- Random zoom: 0.8-1.2x
- Random crop: 90-100% of image
```

---

## Part 4: Experiment Procedures & Reproducibility

### 4.1 Experiment Workflow

```
1. Data Preparation
   ├─ Download datasets
   ├─ De-identify (remove metadata, anonymize)
   ├─ Normalize (resize, standardize pixel values)
   ├─ Split (80/10/10 stratified)
   └─ Augment (training set only)

2. Model Training
   ├─ Initialize model with fixed random seed
   ├─ Train on training set with validation monitoring
   ├─ Save best model (based on validation F1)
   ├─ Log hyperparameters and training metrics
   └─ Record training time and resource usage

3. Model Evaluation
   ├─ Load best model
   ├─ Evaluate on test set
   ├─ Compute all classification metrics
   ├─ Measure latency (p50, p95, p99)
   ├─ Measure throughput (batch sizes: 1, 8, 32, 64)
   ├─ Measure memory usage
   └─ Log all results to database

4. Robustness Testing
   ├─ Apply augmentations to test set
   ├─ Evaluate on augmented data
   ├─ Compute robustness metrics
   └─ Log results

5. Statistical Significance
   ├─ Compute 95% confidence intervals
   ├─ Perform paired t-tests (model A vs. B)
   ├─ Report p-values
   └─ Identify statistically significant differences
```

### 4.2 Reproducibility Requirements

```
Fixed Random Seeds:
  - NumPy: np.random.seed(42)
  - TensorFlow: tf.random.set_seed(42)
  - PyTorch: torch.manual_seed(42)
  - Python: random.seed(42)

Hardware Specification:
  - CPU: Intel i7-12700K or equivalent
  - GPU: NVIDIA RTX 3090 or equivalent (optional)
  - RAM: 32GB minimum
  - Storage: 500GB SSD

Software Versions:
  - Python: 3.10+
  - PyTorch: 2.0+
  - TensorFlow: 2.13+
  - OpenCV: 4.8+
  - NumPy: 1.24+
  - Scikit-learn: 1.3+

Experiment Tracking:
  - Log all hyperparameters
  - Log all metrics
  - Save model checkpoints
  - Save predictions (for error analysis)
  - Record timestamp and environment info
```

### 4.3 Statistical Significance Testing

```
Paired t-test (Model A vs. Model B):
  H0: μ_A = μ_B (no difference)
  H1: μ_A ≠ μ_B (significant difference)
  
  t = (mean_A - mean_B) / sqrt(var_A/n + var_B/n)
  p-value = 2 * P(T > |t|)
  
  If p-value < 0.05: Reject H0 (significant difference)
  If p-value ≥ 0.05: Fail to reject H0 (no significant difference)

Confidence Intervals (95%):
  CI = mean ± 1.96 * (std / sqrt(n))
  
  Report as: "Model A: 85.2% ± 2.1% (95% CI)"

Multiple Comparisons Correction:
  - Bonferroni: α_corrected = α / number_of_comparisons
  - Benjamini-Hochberg: FDR control
```

---

## Part 5: Data Schema & Storage

### 5.1 Run Logging Schema

```sql
-- Runs table: One row per model evaluation
CREATE TABLE runs (
  run_id UUID PRIMARY KEY,
  model_name VARCHAR(50) NOT NULL,
  model_version VARCHAR(20),
  framework VARCHAR(50),
  dataset_name VARCHAR(100) NOT NULL,
  dataset_version VARCHAR(20),
  split_type VARCHAR(20), -- 'train', 'val', 'test'
  num_samples INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_seconds FLOAT,
  status VARCHAR(20), -- 'success', 'failed', 'running'
  error_message TEXT,
  
  -- Hyperparameters (JSON)
  hyperparameters JSONB,
  
  -- Environment info
  hardware_cpu VARCHAR(100),
  hardware_gpu VARCHAR(100),
  software_versions JSONB,
  
  -- Metadata
  experiment_id UUID,
  notes TEXT,
  
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id)
);

-- Metrics table: One row per metric per run
CREATE TABLE metrics (
  metric_id UUID PRIMARY KEY,
  run_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value FLOAT,
  metric_unit VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);

-- Predictions table: One row per prediction (optional, for error analysis)
CREATE TABLE predictions (
  prediction_id UUID PRIMARY KEY,
  run_id UUID NOT NULL,
  sample_id VARCHAR(100),
  true_label VARCHAR(100),
  predicted_label VARCHAR(100),
  confidence FLOAT,
  latency_ms FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);

-- Experiments table: Groups related runs
CREATE TABLE experiments (
  experiment_id UUID PRIMARY KEY,
  experiment_name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20), -- 'planning', 'running', 'completed', 'archived'
  tags JSONB -- e.g., {"version": "1.0", "focus": "robustness"}
);

-- Models table: Model metadata
CREATE TABLE models (
  model_id UUID PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20),
  framework VARCHAR(50),
  architecture_description TEXT,
  training_dataset VARCHAR(100),
  training_date DATE,
  model_path VARCHAR(500), -- Path to saved model
  model_size_mb FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datasets table: Dataset metadata
CREATE TABLE datasets (
  dataset_id UUID PRIMARY KEY,
  dataset_name VARCHAR(100) NOT NULL,
  dataset_version VARCHAR(20),
  num_samples INT,
  num_classes INT,
  classes JSONB, -- e.g., ["normal", "disease_a", "disease_b"]
  source_url VARCHAR(500),
  license VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Storage Approach

#### Option 1: PostgreSQL (Recommended for Production)
```
Pros:
  - ACID compliance
  - Complex queries
  - Scalable
  - HIPAA-ready with encryption
  
Cons:
  - Requires setup
  - More overhead for small datasets

Setup:
  docker run --name arogya-db \
    -e POSTGRES_PASSWORD=secure_password \
    -e POSTGRES_DB=arogya_benchmarks \
    -p 5432:5432 \
    postgres:15
```

#### Option 2: SQLite (Development/Small Scale)
```
Pros:
  - No setup required
  - File-based
  - Good for prototyping
  
Cons:
  - Limited concurrency
  - Not suitable for production

Setup:
  sqlite3 arogya_benchmarks.db < schema.sql
```

#### Option 3: MongoDB (Flexible Schema)
```
Pros:
  - Flexible schema
  - Good for nested data (JSONB)
  - Horizontal scaling
  
Cons:
  - No ACID transactions (in older versions)
  - Larger storage footprint

Setup:
  docker run --name arogya-mongo \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=password \
    -p 27017:27017 \
    mongo:6
```

#### Option 4: Cloud Storage (Scalable)
```
AWS S3 + DynamoDB:
  - S3: Store model artifacts, predictions CSV
  - DynamoDB: Store metrics and metadata
  
Google Cloud Storage + Firestore:
  - GCS: Store model artifacts
  - Firestore: Store metrics and metadata
  
Cost: ~$0.023/GB/month (S3), ~$1.25/million writes (DynamoDB)
```

### 5.3 Data Retention & Privacy

```
Retention Policy:
  - Raw predictions: 90 days (for error analysis)
  - Aggregated metrics: 2 years
  - Model artifacts: Until superseded
  - Experiment logs: Indefinite

Privacy Measures:
  - No PHI stored (use synthetic data)
  - Anonymize sample IDs
  - Encrypt sensitive fields (hyperparameters, paths)
  - Audit logging for all access
  - GDPR-compliant data deletion
```

---

## Part 6: Dashboard Components & UI

### 6.1 Dashboard Architecture

```
Frontend (React + TypeScript):
  ├─ Pages
  │  ├─ Overview (summary metrics)
  │  ├─ Model Comparison (table + charts)
  │  ├─ Experiment Details (drill-down)
  │  ├─ Robustness Analysis (augmentation results)
  │  └─ Cost Analysis (latency vs. cost)
  │
  ├─ Components
  │  ├─ MetricCard (single metric display)
  │  ├─ ComparisonChart (line/bar chart)
  │  ├─ MetricsTable (sortable, filterable)
  │  ├─ FilterPanel (model, dataset, metric filters)
  │  └─ ExportButton (CSV, JSON, PDF)
  │
  └─ Services
     ├─ dashboardAPI.ts (fetch metrics)
     ├─ chartUtils.ts (format data for charts)
     └─ exportUtils.ts (export functionality)

Backend (FastAPI):
  ├─ Routes
  │  ├─ GET /api/benchmarks/runs (list all runs)
  │  ├─ GET /api/benchmarks/runs/{run_id} (get run details)
  │  ├─ GET /api/benchmarks/metrics (query metrics)
  │  ├─ GET /api/benchmarks/comparison (compare models)
  │  ├─ GET /api/benchmarks/robustness (robustness metrics)
  │  ├─ POST /api/benchmarks/runs (create new run)
  │  └─ POST /api/benchmarks/export (export results)
  │
  └─ Services
     ├─ benchmarkService.py (query logic)
     ├─ statisticsService.py (significance testing)
     └─ exportService.py (CSV/JSON export)
```

### 6.2 Dashboard Pages & Components

#### Page 1: Overview Dashboard
```
Layout:
  ┌─────────────────────────────────────────────────────┐
  │ Benchmarking Dashboard - Overview                    │
  ├─────────────────────────────────────────────────────┤
  │                                                       │
  │  [Filter Panel]                                      │
  │  ├─ Model: [ResNet50 ▼] [YOLOv8 ▼] [Gemini ▼]      │
  │  ├─ Dataset: [HAM10000 ▼] [ISIC 2019 ▼]            │
  │  ├─ Metric: [Accuracy ▼] [F1 ▼] [Latency ▼]        │
  │  └─ Date Range: [From] [To]                         │
  │                                                       │
  │  ┌──────────────┬──────────────┬──────────────┐     │
  │  │ Best Model   │ Avg Latency  │ Total Runs   │     │
  │  │ ResNet50     │ 85.2ms       │ 42           │     │
  │  │ (F1: 0.92)   │ (±5.1ms)     │ (7 days)     │     │
  │  └──────────────┴──────────────┴──────────────┘     │
  │                                                       │
  │  ┌─────────────────────────────────────────────┐    │
  │  │ Model Performance Comparison (F1-Score)     │    │
  │  │                                              │    │
  │  │  ResNet50  ████████████████████ 0.92        │    │
  │  │  YOLOv8    ███████████████████  0.89        │    │
  │  │  Gemini    ██████████████████   0.88        │    │
  │  │  PyTorch   █████████████████    0.87        │    │
  │  │  Keras     ████████████████     0.85        │    │
  │  │  CNN       ███████████████      0.83        │    │
  │  │  OpenCV    ██████████           0.71        │    │
  │  └─────────────────────────────────────────────┘    │
  │                                                       │
  │  ┌──────────────────────────────────────────��──┐    │
  │  │ Latency vs. Accuracy (Pareto Frontier)      │    │
  │  │                                              │    │
  │  │     Accuracy                                 │    │
  │  │     0.95 │                                   │    │
  │  │          │        ● ResNet50                 │    │
  │  │     0.90 │      ● YOLOv8                     │    │
  │  │          │    ● Gemini                       │    │
  │  │     0.85 │  ● PyTorch                        │    │
  │  │          │ ● Keras                           │    │
  │  │     0.80 │● CNN                              │    │
  │  │          │                                   │    │
  │  │          └──────────────────────────────     │    │
  │  │            0    500   1000  1500  2000       │    │
  │  │            Latency (ms)                      │    │
  │  └─────────────────────────────────────────────┘    │
  │                                                       │
  └─────────────────────────────────────────────────────┘
```

#### Page 2: Model Comparison Table
```
Layout:
  ┌─────────────────────────────────────────────────────────────────┐
  │ Model Comparison - Detailed Metrics                             │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                   │
  │ [Sort by: F1 ▼] [Export: CSV ▼] [Statistical Test: t-test ▼]  │
  │                                                                   │
  │ ┌─────────────┬──────────┬──────────┬──────────┬──────────────┐ │
  ��� │ Model       │ Accuracy │ F1-Score │ Latency  │ Confidence   │ │
  │ │             │          │          │ (ms)     │ Interval     │ │
  │ ├─────────────┼──────────┼────────���─┼──────────┼──────────────┤ │
  │ │ ResNet50    │ 0.912    │ 0.920    │ 85.2     │ ±2.1%        │ │
  │ │             │ ±0.021   │ ±0.018   │ ±5.1     │ (95% CI)     │ │
  │ ├─────────────┼──────────┼──────────┼──────────┼──────────────┤ │
  │ │ YOLOv8      │ 0.891    │ 0.889    │ 45.3     │ ±2.3%        │ │
  │ │             │ ±0.023   │ ±0.021   │ ±3.2     │ (95% CI)     │ │
  │ ├─────────────┼──────────┼──────────┼──────────┼──────────────┤ │
  │ │ Gemini      │ 0.883    │ 0.876    │ 1250.0   │ ±2.5%        │ │
  │ │             │ ±0.025   │ ±0.024   │ ±150.0   │ (95% CI)     │ │
  │ └─────────────┴──────────┴──────────┴──────────┴──────────────┘ │
  │                                                                   │
  │ [p-value: ResNet50 vs YOLOv8 = 0.0234 *] (significant)         │
  �� [p-value: ResNet50 vs Gemini = 0.0089 **] (highly significant) │
  │                                                                   │
  └─────────────────────────────────────────────────────────────────┘
```

#### Page 3: Robustness Analysis
```
Layout:
  ┌─────────────────────────────────────────────────────────────────┐
  │ Robustness Analysis - Augmentation Effects                      │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                   │
  │ [Augmentation Type: Noise ▼] [Severity: Low/Med/High ▼]        │
  │                                                                   │
  │ ┌─────────────────────────────────────────────────────────────┐ │
  │ │ Accuracy Drop by Augmentation Type                          │ │
  │ │                                                              │ │
  │ │ Gaussian Noise (σ=0.1)                                      │ │
  │ │  ResNet50  ████████████████████ -2.1%                       │ │
  │ │  YOLOv8    ███████████████████  -3.2%                       │ │
  │ │  Gemini    ██████████████████   -1.8%                       │ │
  │ │                                                              │ │
  │ │ Gaussian Blur (kernel=5)                                    │ │
  │ │  ResNet50  ███████████████████  -4.5%                       │ │
  │ │  YOLOv8    ████████████████████ -5.2%                       │ │
  │ │  Gemini    ██████████████████   -3.1%                       │ │
  │ │                                                              │ │
  │ │ JPEG Compression (quality=50)                               │ │
  │ │  ResNet50  ██████████████████   -6.3%                       │ │
  │ │  YOLOv8    ███████████████████  -7.1%                       │ │
  │ │  Gemini    ████████████████████ -2.4%                       │ │
  │ └─────────────────────────────────────────────────────────────┘ │
  │                                                                   │
  │ Robustness Ranking: Gemini > ResNet50 > YOLOv8                 │
  │                                                                   │
  └─────────────────────────────────────────────────────────────────┘
```

#### Page 4: Cost Analysis
```
Layout:
  ┌─────────────────────────────────────────────────────────────────┐
  │ Cost Analysis - Latency vs. Accuracy vs. Cost                   │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                   │
  │ ┌─────────────────────────────────────────────────────────────┐ │
  │ │ Cost per Inference (1000 images)                            │ │
  │ │                                                              │ │
  │ │ ResNet50   ████████████████████ $0.00 (local)               │ │
  │ │ YOLOv8     ████████████████████ $0.00 (local)               │ │
  │ │ CNN        ████████████████████ $0.00 (local)               │ │
  │ │ Keras      ████████████████████ $0.00 (local)               │ │
  │ │ PyTorch    ████████████████████ $0.00 (local)               │ │
  │ │ OpenCV     ████████████████████ $0.00 (local)               │ │
  │ │ Gemini     ████████████████████ $0.075 (API)                │ │
  │ │                                                              │ │
  │ └────────────────────────────────��────────────────────────────┘ │
  │                                                                   │
  │ ┌─────────────────────────────────────────────────────────────┐ │
  │ │ Throughput (images/sec) at Different Batch Sizes            │ │
  │ │                                                              │ │
  │ │ Batch Size 1:                                               │ │
  │ │  ResNet50  ████████████ 11.7 img/s                          │ │
  │ │  YOLOv8    ████████████████ 22.1 img/s                      │ │
  │ │  Gemini    ██ 0.8 img/s (rate-limited)                      │ │
  │ │                                                              │ │
  │ │ Batch Size 32:                                              │ │
  │ │  ResNet50  ████████████████████ 375.0 img/s                 │ │
  │ │  YOLOv8    ████████████████ 312.5 img/s                     │ │
  │ │  Gemini    ██ 0.8 img/s (no batching)                       │ │
  │ │                                                              │ │
  │ └─────────────────────────────────────────────────────────────┘ │
  │                                                                   │
  │ Recommendation: ResNet50 for production (best accuracy/cost)    │
  │                                                                   │
  └─────────────────────────────────────────────────────────────────┘
```

### 6.3 Filter & Export Functionality

```typescript
// Filter Options
interface FilterOptions {
  models: string[]; // e.g., ["ResNet50", "YOLOv8", "Gemini"]
  datasets: string[]; // e.g., ["HAM10000", "ISIC 2019"]
  metrics: string[]; // e.g., ["accuracy", "f1", "latency"]
  dateRange: {
    from: Date;
    to: Date;
  };
  experimentIds: string[];
  status: 'success' | 'failed' | 'running';
}

// Export Formats
export function exportMetrics(
  data: MetricData[],
  format: 'csv' | 'json' | 'pdf'
): Blob {
  // CSV: Comma-separated values
  // JSON: Structured JSON with metadata
  // PDF: Formatted report with charts
}
```

---

## Part 7: Code Implementation

### 7.1 Backend: Evaluation Loop & Metric Computation

```python
# backend/benchmarking/evaluator.py

import torch
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, matthews_corrcoef
)
from typing import Dict, List, Tuple
import time
import psutil
import GPUtil
from dataclasses import dataclass
from datetime import datetime
import uuid

@dataclass
class EvaluationResult:
    run_id: str
    model_name: str
    dataset_name: str
    metrics: Dict[str, float]
    latencies: List[float]
    memory_usage: Dict[str, float]
    timestamp: datetime
    predictions: List[Dict]

class ModelEvaluator:
    def __init__(self, model, device='cpu'):
        self.model = model
        self.device = device
        self.run_id = str(uuid.uuid4())
    
    def evaluate(
        self,
        test_loader,
        dataset_name: str,
        model_name: str,
        batch_sizes: List[int] = [1, 8, 32, 64]
    ) -> EvaluationResult:
        """
        Comprehensive evaluation of model on test set.
        
        Args:
            test_loader: PyTorch DataLoader with test data
            dataset_name: Name of dataset
            model_name: Name of model
            batch_sizes: Batch sizes for throughput testing
        
        Returns:
            EvaluationResult with all metrics
        """
        
        # 1. Classification Metrics
        all_preds = []
        all_labels = []
        all_confidences = []
        latencies = []
        
        self.model.eval()
        with torch.no_grad():
            for images, labels in test_loader:
                images = images.to(self.device)
                
                # Measure latency
                start_time = time.time()
                outputs = self.model(images)
                latency = (time.time() - start_time) * 1000  # ms
                latencies.append(latency)
                
                # Get predictions
                probs = torch.softmax(outputs, dim=1)
                confidences, preds = torch.max(probs, 1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.numpy())
                all_confidences.extend(confidences.cpu().numpy())
        
        all_preds = np.array(all_preds)
        all_labels = np.array(all_labels)
        all_confidences = np.array(all_confidences)
        
        # Compute classification metrics
        metrics = {
            'accuracy': accuracy_score(all_labels, all_preds),
            'precision': precision_score(all_labels, all_preds, average='weighted', zero_division=0),
            'recall': recall_score(all_labels, all_preds, average='weighted', zero_division=0),
            'f1': f1_score(all_labels, all_preds, average='weighted', zero_division=0),
            'mcc': matthews_corrcoef(all_labels, all_preds),
        }
        
        # AUROC (one-vs-rest for multiclass)
        try:
            metrics['auroc'] = roc_auc_score(
                all_labels, all_confidences, average='weighted'
            )
        except:
            metrics['auroc'] = 0.0
        
        # Calibration error
        metrics['calibration_error'] = np.mean(
            np.abs(all_confidences - (all_preds == all_labels).astype(float))
        )
        
        # 2. Latency Metrics
        latencies = np.array(latencies)
        metrics['latency_p50'] = np.percentile(latencies, 50)
        metrics['latency_p95'] = np.percentile(latencies, 95)
        metrics['latency_p99'] = np.percentile(latencies, 99)
        metrics['latency_mean'] = np.mean(latencies)
        metrics['latency_std'] = np.std(latencies)
        
        # 3. Throughput Metrics
        throughput_results = self._measure_throughput(test_loader, batch_sizes)
        metrics.update(throughput_results)
        
        # 4. Memory Metrics
        memory_usage = self._measure_memory(test_loader)
        
        # 5. Build predictions list for error analysis
        predictions = [
            {
                'true_label': int(all_labels[i]),
                'predicted_label': int(all_preds[i]),
                'confidence': float(all_confidences[i]),
                'correct': bool(all_preds[i] == all_labels[i])
            }
            for i in range(len(all_labels))
        ]
        
        return EvaluationResult(
            run_id=self.run_id,
            model_name=model_name,
            dataset_name=dataset_name,
            metrics=metrics,
            latencies=latencies.tolist(),
            memory_usage=memory_usage,
            timestamp=datetime.now(),
            predictions=predictions
        )
    
    def _measure_throughput(
        self,
        test_loader,
        batch_sizes: List[int]
    ) -> Dict[str, float]:
        """Measure throughput at different batch sizes."""
        throughput = {}
        
        for batch_size in batch_sizes:
            # Create loader with specific batch size
            loader = torch.utils.data.DataLoader(
                test_loader.dataset,
                batch_size=batch_size,
                shuffle=False
            )
            
            total_time = 0
            total_samples = 0
            
            self.model.eval()
            with torch.no_grad():
                for images, _ in loader:
                    images = images.to(self.device)
                    
                    start_time = time.time()
                    _ = self.model(images)
                    total_time += time.time() - start_time
                    
                    total_samples += images.size(0)
            
            throughput[f'throughput_batch_{batch_size}'] = total_samples / total_time
        
        return throughput
    
    def _measure_memory(self, test_loader) -> Dict[str, float]:
        """Measure CPU and GPU memory usage."""
        memory_usage = {}
        
        # CPU memory
        process = psutil.Process()
        memory_usage['cpu_memory_mb'] = process.memory_info().rss / 1024 / 1024
        
        # GPU memory (if available)
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
            
            self.model.eval()
            with torch.no_grad():
                for images, _ in test_loader:
                    images = images.to(self.device)
                    _ = self.model(images)
            
            memory_usage['gpu_memory_mb'] = torch.cuda.max_memory_allocated() / 1024 / 1024
        
        return memory_usage
    
    def evaluate_robustness(
        self,
        test_loader,
        augmentations: Dict[str, callable]
    ) -> Dict[str, float]:
        """
        Evaluate model robustness to augmentations.
        
        Args:
            test_loader: Test data loader
            augmentations: Dict of augmentation name -> function
        
        Returns:
            Dict of robustness metrics
        """
        robustness_metrics = {}
        
        # Baseline accuracy
        baseline_acc = self._get_accuracy(test_loader)
        
        for aug_name, aug_func in augmentations.items():
            # Apply augmentation to test set
            augmented_loader = self._apply_augmentation(test_loader, aug_func)
            
            # Evaluate on augmented data
            aug_acc = self._get_accuracy(augmented_loader)
            
            # Compute robustness metric (accuracy drop)
            robustness_metrics[f'robustness_{aug_name}'] = baseline_acc - aug_acc
        
        return robustness_metrics
    
    def _get_accuracy(self, test_loader) -> float:
        """Get accuracy on test loader."""
        all_preds = []
        all_labels = []
        
        self.model.eval()
        with torch.no_grad():
            for images, labels in test_loader:
                images = images.to(self.device)
                outputs = self.model(images)
                _, preds = torch.max(outputs, 1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.numpy())
        
        return accuracy_score(all_labels, all_preds)
    
    def _apply_augmentation(self, test_loader, aug_func):
        """Apply augmentation to test loader."""
        # Create new dataset with augmentation
        augmented_dataset = AugmentedDataset(
            test_loader.dataset,
            aug_func
        )
        
        return torch.utils.data.DataLoader(
            augmented_dataset,
            batch_size=test_loader.batch_size,
            shuffle=False
        )


class AugmentedDataset(torch.utils.data.Dataset):
    """Dataset wrapper that applies augmentation."""
    
    def __init__(self, dataset, augmentation):
        self.dataset = dataset
        self.augmentation = augmentation
    
    def __len__(self):
        return len(self.dataset)
    
    def __getitem__(self, idx):
        image, label = self.dataset[idx]
        image = self.augmentation(image)
        return image, label
```

### 7.2 Backend: Run Logging Service

```python
# backend/benchmarking/logging_service.py

import json
from datetime import datetime
from typing import Dict, List, Optional
import uuid
from sqlalchemy import create_engine, Column, String, Float, DateTime, JSON, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

class RunLog(Base):
    """SQLAlchemy model for run logs."""
    __tablename__ = 'runs'
    
    run_id = Column(String, primary_key=True)
    model_name = Column(String, nullable=False)
    model_version = Column(String)
    framework = Column(String)
    dataset_name = Column(String, nullable=False)
    dataset_version = Column(String)
    split_type = Column(String)
    num_samples = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Float)
    status = Column(String)
    error_message = Column(String)
    hyperparameters = Column(JSON)
    hardware_cpu = Column(String)
    hardware_gpu = Column(String)
    software_versions = Column(JSON)
    experiment_id = Column(String)
    notes = Column(String)

class MetricLog(Base):
    """SQLAlchemy model for metrics."""
    __tablename__ = 'metrics'
    
    metric_id = Column(String, primary_key=True)
    run_id = Column(String, nullable=False)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float)
    metric_unit = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class BenchmarkLogger:
    def __init__(self, database_url: str = 'sqlite:///arogya_benchmarks.db'):
        """
        Initialize benchmark logger.
        
        Args:
            database_url: SQLAlchemy database URL
        """
        self.engine = create_engine(database_url)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
    
    def log_run(
        self,
        model_name: str,
        dataset_name: str,
        metrics: Dict[str, float],
        duration_seconds: float,
        hyperparameters: Dict = None,
        model_version: str = None,
        framework: str = None,
        status: str = 'success',
        error_message: str = None,
        experiment_id: str = None,
        notes: str = None
    ) -> str:
        """
        Log a complete benchmark run.
        
        Args:
            model_name: Name of model
            dataset_name: Name of dataset
            metrics: Dict of metric_name -> value
            duration_seconds: Total duration
            hyperparameters: Model hyperparameters
            model_version: Model version
            framework: Framework used
            status: 'success', 'failed', 'running'
            error_message: Error message if failed
            experiment_id: Associated experiment ID
            notes: Additional notes
        
        Returns:
            run_id
        """
        run_id = str(uuid.uuid4())
        session = self.Session()
        
        try:
            # Create run log
            run_log = RunLog(
                run_id=run_id,
                model_name=model_name,
                model_version=model_version,
                framework=framework,
                dataset_name=dataset_name,
                num_samples=metrics.get('num_samples', 0),
                timestamp=datetime.utcnow(),
                duration_seconds=duration_seconds,
                status=status,
                error_message=error_message,
                hyperparameters=hyperparameters,
                experiment_id=experiment_id,
                notes=notes
            )
            session.add(run_log)
            
            # Log individual metrics
            for metric_name, metric_value in metrics.items():
                if isinstance(metric_value, (int, float)):
                    metric_log = MetricLog(
                        metric_id=str(uuid.uuid4()),
                        run_id=run_id,
                        metric_name=metric_name,
                        metric_value=float(metric_value),
                        metric_unit=self._get_metric_unit(metric_name)
                    )
                    session.add(metric_log)
            
            session.commit()
            logger.info(f"Logged run {run_id} for {model_name} on {dataset_name}")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error logging run: {e}")
            raise
        finally:
            session.close()
        
        return run_id
    
    def get_run(self, run_id: str) -> Dict:
        """Get run details."""
        session = self.Session()
        try:
            run = session.query(RunLog).filter(RunLog.run_id == run_id).first()
            if not run:
                return None
            
            metrics = session.query(MetricLog).filter(
                MetricLog.run_id == run_id
            ).all()
            
            return {
                'run_id': run.run_id,
                'model_name': run.model_name,
                'dataset_name': run.dataset_name,
                'timestamp': run.timestamp.isoformat(),
                'duration_seconds': run.duration_seconds,
                'status': run.status,
                'metrics': {m.metric_name: m.metric_value for m in metrics},
                'hyperparameters': run.hyperparameters,
                'notes': run.notes
            }
        finally:
            session.close()
    
    def query_metrics(
        self,
        model_names: List[str] = None,
        dataset_names: List[str] = None,
        metric_names: List[str] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """Query metrics with filters."""
        session = self.Session()
        try:
            query = session.query(RunLog, MetricLog).join(
                MetricLog, RunLog.run_id == MetricLog.run_id
            )
            
            if model_names:
                query = query.filter(RunLog.model_name.in_(model_names))
            if dataset_names:
                query = query.filter(RunLog.dataset_name.in_(dataset_names))
            if metric_names:
                query = query.filter(MetricLog.metric_name.in_(metric_names))
            
            results = query.limit(limit).all()
            
            return [
                {
                    'run_id': r[0].run_id,
                    'model_name': r[0].model_name,
                    'dataset_name': r[0].dataset_name,
                    'metric_name': r[1].metric_name,
                    'metric_value': r[1].metric_value,
                    'timestamp': r[0].timestamp.isoformat()
                }
                for r in results
            ]
        finally:
            session.close()
    
    @staticmethod
    def _get_metric_unit(metric_name: str) -> str:
        """Get unit for metric."""
        units = {
            'accuracy': '%',
            'precision': '%',
            'recall': '%',
            'f1': '%',
            'auroc': '%',
            'latency_p50': 'ms',
            'latency_p95': 'ms',
            'latency_p99': 'ms',
            'latency_mean': 'ms',
            'throughput_batch_1': 'img/s',
            'throughput_batch_8': 'img/s',
            'throughput_batch_32': 'img/s',
            'throughput_batch_64': 'img/s',
            'cpu_memory_mb': 'MB',
            'gpu_memory_mb': 'MB',
        }
        return units.get(metric_name, '')
```

### 7.3 Backend: Dashboard API Endpoints

```python
# backend/benchmarking/api.py

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
from .logging_service import BenchmarkLogger
from .statistics_service import StatisticsService
import json

router = APIRouter(prefix="/api/benchmarks", tags=["benchmarks"])
logger = BenchmarkLogger()
stats_service = StatisticsService()

@router.get("/runs")
async def list_runs(
    model_name: Optional[str] = Query(None),
    dataset_name: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0)
):
    """List all benchmark runs with optional filters."""
    try:
        runs = logger.query_metrics(
            model_names=[model_name] if model_name else None,
            dataset_names=[dataset_name] if dataset_name else None,
            limit=limit + offset
        )
        
        # Remove duplicates and paginate
        unique_runs = {}
        for run in runs:
            if run['run_id'] not in unique_runs:
                unique_runs[run['run_id']] = {
                    'run_id': run['run_id'],
                    'model_name': run['model_name'],
                    'dataset_name': run['dataset_name'],
                    'timestamp': run['timestamp'],
                    'metrics': {}
                }
            unique_runs[run['run_id']]['metrics'][run['metric_name']] = run['metric_value']
        
        paginated = list(unique_runs.values())[offset:offset+limit]
        
        return {
            'status': 'success',
            'total': len(unique_runs),
            'limit': limit,
            'offset': offset,
            'runs': paginated
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runs/{run_id}")
async def get_run(run_id: str):
    """Get detailed run information."""
    try:
        run = logger.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        return {
            'status': 'success',
            'run': run
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comparison")
async def compare_models(
    models: List[str] = Query(...),
    dataset: str = Query(...),
    metrics: List[str] = Query(["accuracy", "f1", "latency_mean"])
):
    """Compare multiple models on a dataset."""
    try:
        comparison_data = {}
        
        for model in models:
            runs = logger.query_metrics(
                model_names=[model],
                dataset_names=[dataset],
                metric_names=metrics
            )
            
            # Aggregate metrics
            model_metrics = {}
            for run in runs:
                metric_name = run['metric_name']
                if metric_name not in model_metrics:
                    model_metrics[metric_name] = []
                model_metrics[metric_name].append(run['metric_value'])
            
            # Compute statistics
            comparison_data[model] = {}
            for metric_name, values in model_metrics.items():
                comparison_data[model][metric_name] = {
                    'mean': float(np.mean(values)),
                    'std': float(np.std(values)),
                    'min': float(np.min(values)),
                    'max': float(np.max(values)),
                    'count': len(values)
                }
        
        # Perform statistical significance tests
        significance_tests = {}
        model_list = list(models)
        for i in range(len(model_list)):
            for j in range(i+1, len(model_list)):
                model_a = model_list[i]
                model_b = model_list[j]
                
                for metric in metrics:
                    if metric in comparison_data[model_a] and metric in comparison_data[model_b]:
                        p_value = stats_service.t_test(
                            comparison_data[model_a][metric]['mean'],
                            comparison_data[model_b][metric]['mean'],
                            comparison_data[model_a][metric]['std'],
                            comparison_data[model_b][metric]['std']
                        )
                        
                        key = f"{model_a}_vs_{model_b}_{metric}"
                        significance_tests[key] = {
                            'p_value': p_value,
                            'significant': p_value < 0.05
                        }
        
        return {
            'status': 'success',
            'comparison': comparison_data,
            'significance_tests': significance_tests
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/robustness")
async def get_robustness_metrics(
    model_name: str = Query(...),
    dataset_name: str = Query(...),
    augmentation_type: Optional[str] = Query(None)
):
    """Get robustness metrics for a model."""
    try:
        robustness_metrics = [
            'robustness_noise',
            'robustness_blur',
            'robustness_rotation',
            'robustness_brightness',
            'robustness_compression'
        ]
        
        if augmentation_type:
            robustness_metrics = [f'robustness_{augmentation_type}']
        
        runs = logger.query_metrics(
            model_names=[model_name],
            dataset_names=[dataset_name],
            metric_names=robustness_metrics
        )
        
        # Aggregate by augmentation type
        robustness_data = {}
        for run in runs:
            metric_name = run['metric_name']
            if metric_name not in robustness_data:
                robustness_data[metric_name] = []
            robustness_data[metric_name].append(run['metric_value'])
        
        # Compute statistics
        result = {}
        for metric_name, values in robustness_data.items():
            result[metric_name] = {
                'mean': float(np.mean(values)),
                'std': float(np.std(values)),
                'min': float(np.min(values)),
                'max': float(np.max(values))
            }
        
        return {
            'status': 'success',
            'model_name': model_name,
            'dataset_name': dataset_name,
            'robustness_metrics': result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/runs")
async def create_run(run_data: dict):
    """Create a new benchmark run."""
    try:
        run_id = logger.log_run(
            model_name=run_data['model_name'],
            dataset_name=run_data['dataset_name'],
            metrics=run_data['metrics'],
            duration_seconds=run_data['duration_seconds'],
            hyperparameters=run_data.get('hyperparameters'),
            model_version=run_data.get('model_version'),
            framework=run_data.get('framework'),
            status=run_data.get('status', 'success'),
            error_message=run_data.get('error_message'),
            experiment_id=run_data.get('experiment_id'),
            notes=run_data.get('notes')
        )
        
        return {
            'status': 'success',
            'run_id': run_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
async def export_metrics(
    format: str = Query("csv", regex="^(csv|json|pdf)$"),
    model_names: Optional[List[str]] = Query(None),
    dataset_names: Optional[List[str]] = Query(None)
):
    """Export metrics in specified format."""
    try:
        runs = logger.query_metrics(
            model_names=model_names,
            dataset_names=dataset_names
        )
        
        if format == 'csv':
            return export_to_csv(runs)
        elif format == 'json':
            return export_to_json(runs)
        elif format == 'pdf':
            return export_to_pdf(runs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 7.4 Frontend: Dashboard Components

```typescript
// src/components/BenchmarkingDashboard/BenchmarkingDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart, PieChart } from 'recharts';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { dashboardAPI } from '../../services/dashboardAPI';
import MetricCard from './MetricCard';
import ComparisonChart from './ComparisonChart';
import MetricsTable from './MetricsTable';
import FilterPanel from './FilterPanel';

interface BenchmarkRun {
  run_id: string;
  model_name: string;
  dataset_name: string;
  timestamp: string;
  metrics: Record<string, number>;
}

interface FilterOptions {
  models: string[];
  datasets: string[];
  metrics: string[];
  dateRange: { from: Date; to: Date };
}

export default function BenchmarkingDashboard() {
  const [runs, setRuns] = useState<BenchmarkRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    models: [],
    datasets: [],
    metrics: ['accuracy', 'f1', 'latency_mean'],
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  });
  const [comparisonData, setComparisonData] = useState<any>(null);

  useEffect(() => {
    fetchRuns();
  }, [filters]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.listRuns({
        models: filters.models.length > 0 ? filters.models : undefined,
        datasets: filters.datasets.length > 0 ? filters.datasets : undefined,
        limit: 1000
      });
      setRuns(data.runs);

      // Fetch comparison data if models selected
      if (filters.models.length > 1 && filters.datasets.length > 0) {
        const comparison = await dashboardAPI.compareModels(
          filters.models,
          filters.datasets[0],
          filters.metrics
        );
        setComparisonData(comparison);
      }
    } catch (error) {
      console.error('Error fetching runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await dashboardAPI.exportMetrics(
        format,
        filters.models,
        filters.datasets
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `benchmarks.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Benchmarking Dashboard
          </h1>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchRuns}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Runs"
            value={runs.length}
            unit=""
            trend={5}
          />
          <MetricCard
            title="Best Model"
            value="ResNet50"
            unit="F1: 0.92"
            trend={2}
          />
          <MetricCard
            title="Avg Latency"
            value="85.2"
            unit="ms"
            trend={-3}
          />
          <MetricCard
            title="Datasets"
            value={new Set(runs.map(r => r.dataset_name)).size}
            unit="active"
            trend={0}
          />
        </div>

        {/* Comparison Charts */}
        {comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            <ComparisonChart
              title="Model Comparison - F1 Score"
              data={comparisonData.comparison}
              metric="f1"
              type="bar"
            />
            <ComparisonChart
              title="Latency vs Accuracy"
              data={comparisonData.comparison}
              metric="latency_mean"
              type="scatter"
            />
          </motion.div>
        )}

        {/* Metrics Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Detailed Metrics
          </h2>
          <MetricsTable
            runs={runs}
            loading={loading}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
```

### 7.5 Frontend: Dashboard API Service

```typescript
// src/services/dashboardAPI.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ListRunsParams {
  models?: string[];
  datasets?: string[];
  limit?: number;
  offset?: number;
}

interface ComparisonResult {
  comparison: Record<string, Record<string, any>>;
  significance_tests: Record<string, any>;
}

export const dashboardAPI = {
  async listRuns(params: ListRunsParams) {
    const response = await axios.get(`${API_BASE_URL}/api/benchmarks/runs`, {
      params: {
        model_name: params.models?.[0],
        dataset_name: params.datasets?.[0],
        limit: params.limit || 100,
        offset: params.offset || 0
      }
    });
    return response.data;
  },

  async getRun(runId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/api/benchmarks/runs/${runId}`
    );
    return response.data;
  },

  async compareModels(
    models: string[],
    dataset: string,
    metrics: string[]
  ): Promise<ComparisonResult> {
    const response = await axios.get(
      `${API_BASE_URL}/api/benchmarks/comparison`,
      {
        params: {
          models: models.join(','),
          dataset,
          metrics: metrics.join(',')
        }
      }
    );
    return response.data;
  },

  async getRobustnessMetrics(
    modelName: string,
    datasetName: string,
    augmentationType?: string
  ) {
    const response = await axios.get(
      `${API_BASE_URL}/api/benchmarks/robustness`,
      {
        params: {
          model_name: modelName,
          dataset_name: datasetName,
          augmentation_type: augmentationType
        }
      }
    );
    return response.data;
  },

  async createRun(runData: any) {
    const response = await axios.post(
      `${API_BASE_URL}/api/benchmarks/runs`,
      runData
    );
    return response.data;
  },

  async exportMetrics(
    format: 'csv' | 'json' | 'pdf',
    models?: string[],
    datasets?: string[]
  ): Promise<Blob> {
    const response = await axios.get(
      `${API_BASE_URL}/api/benchmarks/export`,
      {
        params: {
          format,
          model_names: models?.join(','),
          dataset_names: datasets?.join(',')
        },
        responseType: 'blob'
      }
    );
    return response.data;
  }
};
```

---

## Part 8: Gemini Integration & Cloud Model Considerations

### 8.1 Fair Comparison Strategy for Gemini

```python
# backend/benchmarking/gemini_evaluator.py

import asyncio
import time
from typing import List, Dict
import aiohttp
from datetime import datetime, timedelta
import json

class GeminiEvaluator:
    """
    Evaluator for Gemini image processing API.
    Handles rate limiting, batching, and cost tracking.
    """
    
    def __init__(
        self,
        api_key: str,
        rate_limit: int = 15,  # requests per minute (free tier)
        batch_size: int = 1  # Gemini doesn't support batching
    ):
        self.api_key = api_key
        self.rate_limit = rate_limit
        self.batch_size = batch_size
        self.request_times = []
        self.total_cost = 0.0
        self.cost_per_1m_tokens = 0.075  # $0.075 per 1M input tokens
    
    async def evaluate_batch(
        self,
        images: List[str],  # Base64-encoded images
        labels: List[str],
        model_name: str = "gemini-2.5-flash"
    ) -> Dict:
        """
        Evaluate Gemini on a batch of images.
        
        Args:
            images: List of base64-encoded images
            labels: Ground truth labels
            model_name: Gemini model to use
        
        Returns:
            Dict with predictions, latencies, and cost
        """
        
        predictions = []
        latencies = []
        total_tokens = 0
        
        async with aiohttp.ClientSession() as session:
            for i, image_data in enumerate(images):
                # Rate limiting
                await self._rate_limit()
                
                # Make API call
                start_time = time.time()
                try:
                    result = await self._call_gemini_api(
                        session,
                        image_data,
                        model_name
                    )
                    latency = (time.time() - start_time) * 1000  # ms
                    latencies.append(latency)
                    
                    # Parse response
                    prediction = self._parse_gemini_response(result)
                    predictions.append(prediction)
                    
                    # Track tokens for cost
                    total_tokens += result.get('usage', {}).get('prompt_tokens', 0)
                    
                except Exception as e:
                    print(f"Error processing image {i}: {e}")
                    predictions.append({
                        'predicted_label': 'error',
                        'confidence': 0.0
                    })
                    latencies.append(None)
        
        # Calculate cost
        cost = (total_tokens / 1_000_000) * self.cost_per_1m_tokens
        self.total_cost += cost
        
        return {
            'predictions': predictions,
            'latencies': latencies,
            'total_tokens': total_tokens,
            'cost': cost,
            'num_samples': len(images)
        }
    
    async def _rate_limit(self):
        """Enforce rate limiting (15 req/min for free tier)."""
        now = time.time()
        
        # Remove old requests outside the 1-minute window
        self.request_times = [
            t for t in self.request_times
            if now - t < 60
        ]
        
        # If at limit, wait
        if len(self.request_times) >= self.rate_limit:
            sleep_time = 60 - (now - self.request_times[0])
            if sleep_time > 0:
                print(f"Rate limit reached. Sleeping for {sleep_time:.1f}s")
                await asyncio.sleep(sleep_time)
        
        self.request_times.append(now)
    
    async def _call_gemini_api(
        self,
        session: aiohttp.ClientSession,
        image_data: str,
        model_name: str
    ) -> Dict:
        """Call Gemini API with image."""
        
        url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            'contents': [
                {
                    'parts': [
                        {
                            'inlineData': {
                                'mimeType': 'image/jpeg',
                                'data': image_data
                            }
                        },
                        {
                            'text': '''Analyze this medical image and provide:
1. Diagnosis (specific condition)
2. Confidence (0-100)
3. Severity (mild/moderate/severe)
4. Recommended specialist

Respond in JSON format:
{
  "diagnosis": "...",
  "confidence": 85,
  "severity": "moderate",
  "specialist": "dermatologist"
}'''
                        }
                    ]
                }
            ]
        }
        
        params = {'key': self.api_key}
        
        async with session.post(
            url,
            json=payload,
            params=params,
            timeout=aiohttp.ClientTimeout(total=30)
        ) as response:
            if response.status != 200:
                raise Exception(f"API error: {response.status}")
            
            data = await response.json()
            return data
    
    def _parse_gemini_response(self, response: Dict) -> Dict:
        """Parse Gemini API response."""
        try:
            text = response['candidates'][0]['content']['parts'][0]['text']
            
            # Extract JSON from response
            import json
            json_match = text.find('{')
            if json_match != -1:
                json_str = text[json_match:]
                parsed = json.loads(json_str)
                
                return {
                    'predicted_label': parsed.get('diagnosis', 'unknown'),
                    'confidence': parsed.get('confidence', 0) / 100.0,
                    'severity': parsed.get('severity', 'unknown'),
                    'specialist': parsed.get('specialist', 'general')
                }
        except Exception as e:
            print(f"Error parsing response: {e}")
        
        return {
            'predicted_label': 'error',
            'confidence': 0.0
        }
    
    def get_cost_summary(self) -> Dict:
        """Get cost summary for all evaluations."""
        return {
            'total_cost': self.total_cost,
            'cost_per_1m_tokens': self.cost_per_1m_tokens,
            'estimated_cost_per_1000_images': (self.total_cost / self.request_times.__len__()) * 1000 if self.request_times else 0
        }
```

### 8.2 Batch Processing & Async Queue

```python
# backend/benchmarking/async_queue.py

import asyncio
from typing import List, Callable, Any
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class QueuedTask:
    task_id: str
    data: Any
    priority: int = 0
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class AsyncEvaluationQueue:
    """
    Async queue for processing model evaluations.
    Handles rate limiting, retries, and progress tracking.
    """
    
    def __init__(
        self,
        max_concurrent: int = 5,
        max_retries: int = 3,
        timeout_seconds: int = 300
    ):
        self.max_concurrent = max_concurrent
        self.max_retries = max_retries
        self.timeout_seconds = timeout_seconds
        self.queue = asyncio.PriorityQueue()
        self.results = {}
        self.failed_tasks = []
    
    async def add_task(
        self,
        task_id: str,
        data: Any,
        priority: int = 0
    ):
        """Add task to queue."""
        task = QueuedTask(task_id, data, priority)
        await self.queue.put((priority, task_id, task))
        logger.info(f"Added task {task_id} to queue")
    
    async def process_queue(
        self,
        worker_func: Callable
    ):
        """Process all tasks in queue with concurrency limit."""
        
        workers = [
            asyncio.create_task(
                self._worker(worker_func, i)
            )
            for i in range(self.max_concurrent)
        ]
        
        await self.queue.join()
        
        # Cancel workers
        for worker in workers:
            worker.cancel()
        
        await asyncio.gather(*workers, return_exceptions=True)
    
    async def _worker(
        self,
        worker_func: Callable,
        worker_id: int
    ):
        """Worker coroutine."""
        while True:
            try:
                priority, task_id, task = await self.queue.get()
                
                logger.info(f"Worker {worker_id} processing {task_id}")
                
                # Process with retries
                result = await self._process_with_retries(
                    worker_func,
                    task
                )
                
                self.results[task_id] = result
                logger.info(f"Worker {worker_id} completed {task_id}")
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}")
            finally:
                self.queue.task_done()
    
    async def _process_with_retries(
        self,
        worker_func: Callable,
        task: QueuedTask
    ) -> Any:
        """Process task with retries."""
        
        for attempt in range(self.max_retries):
            try:
                result = await asyncio.wait_for(
                    worker_func(task.data),
                    timeout=self.timeout_seconds
                )
                return result
            except asyncio.TimeoutError:
                logger.warning(
                    f"Task {task.task_id} timeout on attempt {attempt + 1}"
                )
                if attempt == self.max_retries - 1:
                    self.failed_tasks.append(task.task_id)
                    raise
            except Exception as e:
                logger.warning(
                    f"Task {task.task_id} error on attempt {attempt + 1}: {e}"
                )
                if attempt == self.max_retries - 1:
                    self.failed_tasks.append(task.task_id)
                    raise
                
                # Exponential backoff
                await asyncio.sleep(2 ** attempt)
```

### 8.3 Cost Tracking & Optimization

```python
# backend/benchmarking/cost_tracker.py

from dataclasses import dataclass
from typing import Dict, List
from datetime import datetime
import json

@dataclass
class CostRecord:
    model_name: str
    dataset_name: str
    num_samples: int
    cost_per_sample: float
    total_cost: float
    timestamp: datetime
    notes: str = ""

class CostTracker:
    """Track and optimize costs for model evaluations."""
    
    # Cost per inference (in USD)
    COST_PER_INFERENCE = {
        'resnet50': 0.0,  # Local
        'yolov8': 0.0,    # Local
        'cnn': 0.0,       # Local
        'keras': 0.0,     # Local
        'pytorch': 0.0,   # Local
        'opencv': 0.0,    # Local
        'gemini': 0.000075  # $0.075 per 1M tokens (~1000 images)
    }
    
    def __init__(self):
        self.records: List[CostRecord] = []
        self.total_cost = 0.0
    
    def record_evaluation(
        self,
        model_name: str,
        dataset_name: str,
        num_samples: int,
        actual_cost: float = None
    ):
        """Record cost of evaluation."""
        
        if actual_cost is None:
            cost_per_sample = self.COST_PER_INFERENCE.get(model_name, 0.0)
            actual_cost = cost_per_sample * num_samples
        else:
            cost_per_sample = actual_cost / num_samples if num_samples > 0 else 0.0
        
        record = CostRecord(
            model_name=model_name,
            dataset_name=dataset_name,
            num_samples=num_samples,
            cost_per_sample=cost_per_sample,
            total_cost=actual_cost,
            timestamp=datetime.now()
        )
        
        self.records.append(record)
        self.total_cost += actual_cost
    
    def get_cost_summary(self) -> Dict:
        """Get cost summary."""
        
        cost_by_model = {}
        for record in self.records:
            if record.model_name not in cost_by_model:
                cost_by_model[record.model_name] = {
                    'total_cost': 0.0,
                    'num_evaluations': 0,
                    'num_samples': 0
                }
            
            cost_by_model[record.model_name]['total_cost'] += record.total_cost
            cost_by_model[record.model_name]['num_evaluations'] += 1
            cost_by_model[record.model_name]['num_samples'] += record.num_samples
        
        return {
            'total_cost': self.total_cost,
            'cost_by_model': cost_by_model,
            'records': [
                {
                    'model_name': r.model_name,
                    'dataset_name': r.dataset_name,
                    'num_samples': r.num_samples,
                    'cost_per_sample': r.cost_per_sample,
                    'total_cost': r.total_cost,
                    'timestamp': r.timestamp.isoformat()
                }
                for r in self.records
            ]
        }
    
    def estimate_cost(
        self,
        model_name: str,
        num_samples: int
    ) -> float:
        """Estimate cost for evaluation."""
        cost_per_sample = self.COST_PER_INFERENCE.get(model_name, 0.0)
        return cost_per_sample * num_samples
    
    def get_cost_optimization_recommendations(self) -> List[str]:
        """Get recommendations for cost optimization."""
        recommendations = []
        
        # Check if Gemini is being overused
        gemini_cost = sum(
            r.total_cost for r in self.records
            if r.model_name == 'gemini'
        )
        
        if gemini_cost > 10.0:  # More than $10
            recommendations.append(
                "Consider using local models (ResNet50, YOLOv8) for high-volume evaluations. "
                "Gemini is better for validation and edge cases."
            )
        
        # Check if batch processing is being used
        if any(r.num_samples < 100 for r in self.records):
            recommendations.append(
                "Batch multiple evaluations together to reduce overhead."
            )
        
        return recommendations
```

---

## Part 9: Privacy, Compliance & Data Curation

### 9.1 Privacy & HIPAA Compliance

```python
# backend/benchmarking/privacy.py

import hashlib
import json
from typing import Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PrivacyManager:
    """Manage privacy and compliance for benchmarking."""
    
    @staticmethod
    def anonymize_sample_id(original_id: str, salt: str = "arogya_salt") -> str:
        """
        Anonymize sample ID using hashing.
        
        Args:
            original_id: Original sample ID
            salt: Salt for hashing
        
        Returns:
            Anonymized ID
        """
        hash_input = f"{original_id}{salt}".encode()
        return hashlib.sha256(hash_input).hexdigest()[:16]
    
    @staticmethod
    def strip_metadata(image_path: str) -> str:
        """
        Strip EXIF and other metadata from image.
        
        Args:
            image_path: Path to image file
        
        Returns:
            Path to cleaned image
        """
        from PIL import Image
        
        try:
            img = Image.open(image_path)
            
            # Remove EXIF data
            data = list(img.getdata())
            image_without_exif = Image.new(img.mode, img.size)
            image_without_exif.putdata(data)
            
            # Save cleaned image
            cleaned_path = image_path.replace('.jpg', '_cleaned.jpg')
            image_without_exif.save(cleaned_path)
            
            logger.info(f"Stripped metadata from {image_path}")
            return cleaned_path
        except Exception as e:
            logger.error(f"Error stripping metadata: {e}")
            return image_path
    
    @staticmethod
    def audit_log(
        action: str,
        user_id: str,
        resource: str,
        details: Dict[str, Any] = None
    ):
        """
        Log audit event for compliance.
        
        Args:
            action: Action performed (e.g., 'view', 'export', 'delete')
            user_id: User performing action
            resource: Resource accessed (e.g., 'run_123')
            details: Additional details
        """
        
        audit_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'action': action,
            'user_id': user_id,
            'resource': resource,
            'details': details or {}
        }
        
        logger.info(f"AUDIT: {json.dumps(audit_entry)}")
    
    @staticmethod
    def get_data_retention_policy() -> Dict[str, int]:
        """
        Get data retention policy (in days).
        
        Returns:
            Dict of data_type -> retention_days
        """
        return {
            'raw_predictions': 90,
            'aggregated_metrics': 730,  # 2 years
            'model_artifacts': 1825,    # 5 years
            'experiment_logs': 3650,    # 10 years
            'audit_logs': 2555          # 7 years
        }
    
    @staticmethod
    def delete_expired_data(database_session):
        """Delete data older than retention policy."""
        from datetime import datetime, timedelta
        
        retention_policy = PrivacyManager.get_data_retention_policy()
        
        for data_type, retention_days in retention_policy.items():
            cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
            
            # Delete based on data type
            if data_type == 'raw_predictions':
                # Delete old predictions
                database_session.query(PredictionLog).filter(
                    PredictionLog.timestamp < cutoff_date
                ).delete()
            
            logger.info(f"Deleted {data_type} older than {cutoff_date}")
```

### 9.2 Dataset Curation & De-identification

```python
# backend/benchmarking/dataset_curator.py

import os
import json
from typing import List, Dict, Tuple
from pathlib import Path
import hashlib
import logging

logger = logging.getLogger(__name__)

class DatasetCurator:
    """Manage dataset curation and de-identification."""
    
    def __init__(self, dataset_root: str):
        self.dataset_root = dataset_root
        self.metadata_file = os.path.join(dataset_root, 'metadata.json')
    
    def curate_dataset(
        self,
        source_path: str,
        target_path: str,
        disease_classes: List[str],
        train_ratio: float = 0.8,
        val_ratio: float = 0.1,
        test_ratio: float = 0.1
    ) -> Dict:
        """
        Curate dataset: organize, de-identify, and split.
        
        Args:
            source_path: Path to raw dataset
            target_path: Path to curated dataset
            disease_classes: List of disease classes
            train_ratio: Training set ratio
            val_ratio: Validation set ratio
            test_ratio: Test set ratio
        
        Returns:
            Dict with curation statistics
        """
        
        os.makedirs(target_path, exist_ok=True)
        
        # Create directory structure
        for split in ['train', 'val', 'test']:
            for disease_class in disease_classes:
                os.makedirs(
                    os.path.join(target_path, split, disease_class),
                    exist_ok=True
                )
        
        # Process images
        stats = {
            'total_images': 0,
            'train_images': 0,
            'val_images': 0,
            'test_images': 0,
            'by_class': {}
        }
        
        for disease_class in disease_classes:
            class_path = os.path.join(source_path, disease_class)
            if not os.path.exists(class_path):
                logger.warning(f"Class path not found: {class_path}")
                continue
            
            images = [f for f in os.listdir(class_path) if f.endswith(('.jpg', '.png'))]
            
            # Shuffle and split
            import random
            random.shuffle(images)
            
            train_count = int(len(images) * train_ratio)
            val_count = int(len(images) * val_ratio)
            
            train_images = images[:train_count]
            val_images = images[train_count:train_count + val_count]
            test_images = images[train_count + val_count:]
            
            # Copy and de-identify
            for split, split_images in [
                ('train', train_images),
                ('val', val_images),
                ('test', test_images)
            ]:
                for i, image_file in enumerate(split_images):
                    source_file = os.path.join(class_path, image_file)
                    
                    # De-identified filename
                    anonymized_name = f"{disease_class}_{hashlib.md5(image_file.encode()).hexdigest()[:8]}.jpg"
                    target_file = os.path.join(
                        target_path, split, disease_class, anonymized_name
                    )
                    
                    # Copy and strip metadata
                    self._copy_and_strip_metadata(source_file, target_file)
                    
                    stats[f'{split}_images'] += 1
            
            stats['total_images'] += len(images)
            stats['by_class'][disease_class] = {
                'train': len(train_images),
                'val': len(val_images),
                'test': len(test_images),
                'total': len(images)
            }
        
        # Save metadata
        self._save_metadata(target_path, stats)
        
        logger.info(f"Dataset curation complete: {stats}")
        return stats
    
    def _copy_and_strip_metadata(self, source: str, target: str):
        """Copy image and strip metadata."""
        try:
            from PIL import Image
            
            img = Image.open(source)
            
            # Remove EXIF data
            data = list(img.getdata())
            image_without_exif = Image.new(img.mode, img.size)
            image_without_exif.putdata(data)
            
            image_without_exif.save(target)
        except Exception as e:
            logger.error(f"Error processing {source}: {e}")
            # Fallback: just copy
            import shutil
            shutil.copy(source, target)
    
    def _save_metadata(self, dataset_path: str, stats: Dict):
        """Save dataset metadata."""
        metadata = {
            'dataset_path': dataset_path,
            'curation_date': datetime.utcnow().isoformat(),
            'statistics': stats,
            'privacy_notes': 'All images de-identified and metadata stripped',
            'license': 'CC-BY-NC (check original dataset license)'
        }
        
        with open(os.path.join(dataset_path, 'metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def validate_dataset(self, dataset_path: str) -> Dict:
        """Validate dataset integrity and balance."""
        
        validation_report = {
            'valid': True,
            'issues': [],
            'class_balance': {},
            'split_balance': {}
        }
        
        # Check class balance
        for split in ['train', 'val', 'test']:
            split_path = os.path.join(dataset_path, split)
            
            for disease_class in os.listdir(split_path):
                class_path = os.path.join(split_path, disease_class)
                if not os.path.isdir(class_path):
                    continue
                
                num_images = len([f for f in os.listdir(class_path) if f.endswith(('.jpg', '.png'))])
                
                if disease_class not in validation_report['class_balance']:
                    validation_report['class_balance'][disease_class] = {}
                
                validation_report['class_balance'][disease_class][split] = num_images
        
        # Check for class imbalance
        for disease_class, splits in validation_report['class_balance'].items():
            train_count = splits.get('train', 0)
            val_count = splits.get('val', 0)
            test_count = splits.get('test', 0)
            
            # Check if ratios are approximately 80/10/10
            total = train_count + val_count + test_count
            if total > 0:
                train_ratio = train_count / total
                val_ratio = val_count / total
                test_ratio = test_count / total
                
                if not (0.75 < train_ratio < 0.85):
                    validation_report['issues'].append(
                        f"Class {disease_class}: train ratio {train_ratio:.2%} not close to 80%"
                    )
                    validation_report['valid'] = False
        
        return validation_report
```

---

## Part 10: Risk Assessment & Validation

### 10.1 Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Model Overfitting** | Inflated metrics on test set | High | Use proper train/val/test splits, cross-validation, regularization |
| **Data Leakage** | Invalid comparisons | Medium | Strict separation of splits, no data augmentation on test set |
| **Gemini Rate Limiting** | Incomplete evaluations | Medium | Implement async queue, exponential backoff, batch processing |
| **Gemini Cost Overruns** | Budget exceeded | Medium | Cost tracking, alerts, use local models for high-volume tests |
| **PHI Exposure** | Privacy violation, legal liability | Low | Use synthetic/public datasets, de-identification, audit logging |
| **Model Bias** | Unfair comparisons | Medium | Stratified sampling, fairness metrics, error analysis by subgroup |
| **Hardware Variability** | Inconsistent latency measurements | Medium | Fixed hardware, multiple runs, report confidence intervals |
| **API Downtime** | Incomplete benchmarks | Low | Fallback to local models, retry logic, monitoring |

### 10.2 Validation Checklist

```
Pre-Evaluation:
  ☐ Verify train/val/test splits are properly separated
  ☐ Check for data leakage (no test data in training)
  ☐ Confirm random seeds are fixed
  ☐ Validate dataset balance (stratified sampling)
  ☐ Review hyperparameters for each model
  ☐ Ensure hardware specs are documented

During Evaluation:
  ☐ Monitor for NaN/Inf values in metrics
  ☐ Check latency measurements are reasonable
  ☐ Verify memory usage is within limits
  ☐ Monitor Gemini API rate limits and costs
  ☐ Log all errors and exceptions
  ☐ Track progress and ETA

Post-Evaluation:
  ☐ Verify all metrics are computed correctly
  ☐ Check for statistical significance
  ☐ Perform error analysis (confusion matrix, misclassifications)
  ☐ Validate robustness metrics
  ☐ Compare against baseline/literature values
  ☐ Generate final report with confidence intervals
  ☐ Archive results and model artifacts
```

### 10.3 Statistical Significance Testing

```python
# backend/benchmarking/statistics_service.py

import numpy as np
from scipy import stats
from typing import Tuple, Dict
import logging

logger = logging.getLogger(__name__)

class StatisticsService:
    """Perform statistical tests on benchmark results."""
    
    @staticmethod
    def paired_t_test(
        model_a_scores: np.ndarray,
        model_b_scores: np.ndarray,
        alpha: float = 0.05
    ) -> Dict:
        """
        Perform paired t-test between two models.
        
        Args:
            model_a_scores: Array of scores for model A
            model_b_scores: Array of scores for model B
            alpha: Significance level
        
        Returns:
            Dict with test results
        """
        
        # Ensure same length
        min_len = min(len(model_a_scores), len(model_b_scores))
        model_a_scores = model_a_scores[:min_len]
        model_b_scores = model_b_scores[:min_len]
        
        # Perform paired t-test
        t_stat, p_value = stats.ttest_rel(model_a_scores, model_b_scores)
        
        # Compute effect size (Cohen's d)
        diff = model_a_scores - model_b_scores
        cohens_d = np.mean(diff) / np.std(diff)
        
        # Compute confidence interval
        mean_diff = np.mean(diff)
        std_diff = np.std(diff)
        se_diff = std_diff / np.sqrt(len(diff))
        ci_lower = mean_diff - 1.96 * se_diff
        ci_upper = mean_diff + 1.96 * se_diff
        
        return {
            't_statistic': float(t_stat),
            'p_value': float(p_value),
            'significant': p_value < alpha,
            'cohens_d': float(cohens_d),
            'mean_difference': float(mean_diff),
            'confidence_interval': (float(ci_lower), float(ci_upper)),
            'sample_size': len(diff)
        }
    
    @staticmethod
    def confidence_interval(
        scores: np.ndarray,
        confidence: float = 0.95
    ) -> Tuple[float, float]:
        """
        Compute confidence interval for scores.
        
        Args:
            scores: Array of scores
            confidence: Confidence level (e.g., 0.95 for 95%)
        
        Returns:
            Tuple of (lower, upper) bounds
        """
        
        mean = np.mean(scores)
        std = np.std(scores)
        se = std / np.sqrt(len(scores))
        
        z_score = stats.norm.ppf((1 + confidence) / 2)
        margin_of_error = z_score * se
        
        return (mean - margin_of_error, mean + margin_of_error)
    
    @staticmethod
    def multiple_comparisons_correction(
        p_values: np.ndarray,
        method: str = 'bonferroni'
    ) -> np.ndarray:
        """
        Apply multiple comparisons correction.
        
        Args:
            p_values: Array of p-values
            method: 'bonferroni' or 'benjamini_hochberg'
        
        Returns:
            Corrected p-values
        """
        
        if method == 'bonferroni':
            return np.minimum(p_values * len(p_values), 1.0)
        elif method == 'benjamini_hochberg':
            # Sort p-values
            sorted_indices = np.argsort(p_values)
            sorted_p = p_values[sorted_indices]
            
            # Compute BH-adjusted p-values
            n = len(p_values)
            bh_adjusted = sorted_p * n / (np.arange(1, n + 1))
            
            # Ensure monotonicity
            for i in range(n - 2, -1, -1):
                bh_adjusted[i] = min(bh_adjusted[i], bh_adjusted[i + 1])
            
            # Unsort
            result = np.empty_like(bh_adjusted)
            result[sorted_indices] = bh_adjusted
            
            return np.minimum(result, 1.0)
        else:
            raise ValueError(f"Unknown method: {method}")
```

---

## Part 11: Implementation Roadmap & Checklist

### 11.1 Phase 1: Foundation (Weeks 1-2)

**Objectives:**
- Set up database and logging infrastructure
- Implement evaluation loop for local models
- Create basic API endpoints

**Tasks:**
- [ ] Set up PostgreSQL database with schema
- [ ] Implement `ModelEvaluator` class
- [ ] Implement `BenchmarkLogger` class
- [ ] Create FastAPI endpoints for run logging
- [ ] Set up test dataset (HAM10000 or ISIC 2019)
- [ ] Implement train/val/test split logic
- [ ] Create basic metrics computation
- [ ] Write unit tests for evaluation loop

**Deliverables:**
- Working evaluation loop for ResNet50 on test dataset
- Database with sample runs logged
- API endpoints for querying runs

### 11.2 Phase 2: Model Integration (Weeks 3-4)

**Objectives:**
- Integrate all 7 models/pipelines
- Implement robustness testing
- Add statistical significance testing

**Tasks:**
- [ ] Implement ResNet50 evaluator (PyTorch)
- [ ] Implement YOLOv8 evaluator
- [ ] Implement CNN evaluator (custom)
- [ ] Implement Keras evaluator
- [ ] Implement PyTorch evaluator
- [ ] Implement OpenCV evaluator
- [ ] Implement Gemini evaluator with rate limiting
- [ ] Add robustness testing (noise, blur, rotation, etc.)
- [ ] Implement statistical significance tests
- [ ] Create comparison API endpoint

**Deliverables:**
- All 7 models evaluated on test dataset
- Robustness metrics computed
- Comparison table with significance tests

### 11.3 Phase 3: Dashboard Frontend (Weeks 5-6)

**Objectives:**
- Build React dashboard components
- Implement filtering and export functionality
- Create visualizations

**Tasks:**
- [ ] Create dashboard layout and navigation
- [ ] Implement filter panel
- [ ] Create metric cards component
- [ ] Implement comparison charts (bar, line, scatter)
- [ ] Create metrics table with sorting/filtering
- [ ] Add export functionality (CSV, JSON, PDF)
- [ ] Implement robustness analysis page
- [ ] Add cost analysis page
- [ ] Create experiment details page
- [ ] Add responsive design for mobile

**Deliverables:**
- Fully functional dashboard
- All pages and components working
- Export functionality tested

### 11.4 Phase 4: Cloud Integration & Optimization (Weeks 7-8)

**Objectives:**
- Optimize Gemini integration
- Implement cost tracking and optimization
- Add privacy and compliance features

**Tasks:**
- [ ] Implement async queue for Gemini
- [ ] Add rate limiting and retry logic
- [ ] Implement cost tracking
- [ ] Add cost optimization recommendations
- [ ] Implement privacy manager (anonymization, audit logging)
- [ ] Add data retention policies
- [ ] Implement dataset curation tools
- [ ] Add HIPAA compliance checks
- [ ] Create monitoring and alerting

**Deliverables:**
- Optimized Gemini integration
- Cost tracking dashboard
- Privacy and compliance features

### 11.5 Phase 5: Testing & Documentation (Weeks 9-10)

**Objectives:**
- Comprehensive testing
- Complete documentation
- Performance optimization

**Tasks:**
- [ ] Write integration tests
- [ ] Perform load testing
- [ ] Optimize database queries
- [ ] Optimize frontend performance
- [ ] Write API documentation
- [ ] Create user guide
- [ ] Create developer guide
- [ ] Document all metrics and formulas
- [ ] Create troubleshooting guide
- [ ] Perform security audit

**Deliverables:**
- Test coverage > 80%
- Complete documentation
- Performance benchmarks

---

## Part 12: Prioritized Next Actions Checklist

### Immediate (This Week)

- [ ] **Create database schema** (PostgreSQL)
  - Run SQL schema from Part 5.1
  - Set up connection pooling
  - Create indexes on frequently queried columns

- [ ] **Implement ModelEvaluator class** (Python)
  - Copy code from Part 7.1
  - Test with ResNet50 on small dataset
  - Verify metrics computation

- [ ] **Set up test dataset**
  - Download HAM10000 or ISIC 2019
  - Implement train/val/test split (80/10/10)
  - Verify dataset balance

- [ ] **Create basic API endpoints** (FastAPI)
  - Implement `/api/benchmarks/runs` (GET, POST)
  - Implement `/api/benchmarks/metrics` (GET)
  - Test with Postman/curl

### Short-term (Next 2 Weeks)

- [ ] **Integrate all 7 models**
  - ResNet50 (PyTorch)
  - YOLOv8 (PyTorch)
  - Custom CNN (PyTorch)
  - Keras Sequential
  - PyTorch custom
  - OpenCV + SVM
  - Gemini API

- [ ] **Implement robustness testing**
  - Gaussian noise augmentation
  - Blur augmentation
  - Rotation augmentation
  - Brightness augmentation
  - JPEG compression augmentation

- [ ] **Add statistical significance testing**
  - Paired t-tests
  - Confidence intervals
  - Multiple comparisons correction

- [ ] **Create dashboard frontend**
  - Overview page with summary cards
  - Model comparison table
  - Comparison charts
  - Filter panel

### Medium-term (Next 4 Weeks)

- [ ] **Optimize Gemini integration**
  - Implement async queue
  - Add rate limiting
  - Add cost tracking
  - Add retry logic

- [ ] **Add privacy & compliance**
  - Implement anonymization
  - Add audit logging
  - Implement data retention policies
  - Add HIPAA compliance checks

- [ ] **Complete dashboard**
  - Robustness analysis page
  - Cost analysis page
  - Experiment details page
  - Export functionality

- [ ] **Performance optimization**
  - Database query optimization
  - Frontend performance optimization
  - Caching strategy
  - Load testing

### Long-term (Next 8 Weeks)

- [ ] **Comprehensive testing**
  - Unit tests (>80% coverage)
  - Integration tests
  - Load testing
  - Security audit

- [ ] **Complete documentation**
  - API documentation
  - User guide
  - Developer guide
  - Troubleshooting guide

- [ ] **Production deployment**
  - Set up CI/CD pipeline
  - Deploy to cloud (AWS/GCP)
  - Set up monitoring and alerting
  - Create runbooks

- [ ] **Advanced features**
  - Multi-dataset comparison
  - Hyperparameter optimization
  - Model ensemble evaluation
  - Fairness metrics

---

## Appendix A: Key Formulas & Definitions

### Classification Metrics

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)

Precision = TP / (TP + FP)

Recall (Sensitivity) = TP / (TP + FN)

Specificity = TN / (TN + FP)

F1-Score = 2 * (Precision * Recall) / (Precision + Recall)

AUROC = Area under ROC curve (0 to 1, higher is better)

Matthews Correlation Coefficient (MCC) = 
  (TP*TN - FP*FN) / sqrt((TP+FP)(TP+FN)(TN+FP)(TN+FN))

Calibration Error = |predicted_probability - actual_frequency|
```

### Performance Metrics

```
Latency (ms) = Time from input to output

Throughput (images/sec) = Batch size / Total time

Memory Usage (MB) = Peak RAM during inference

GPU Memory (MB) = Peak VRAM during inference

Cost per Inference ($) = Total cost / Number of inferences
```

### Robustness Metrics

```
Robustness Score = 1 - (Accuracy_clean - Accuracy_augmented) / Accuracy_clean

Noise Robustness = Accuracy on Gaussian noise (σ=0.1, 0.2, 0.3)

Blur Robustness = Accuracy on Gaussian blur (kernel=3, 5, 7)

Rotation Robustness = Accuracy on rotated images (±15°, ±30°)

Brightness Robustness = Accuracy on brightness-adjusted images (±20%, ±40%)

Compression Robustness = Accuracy on JPEG compressed images (quality=50, 75, 90)
```

### Statistical Tests

```
Paired t-test:
  t = (mean_A - mean_B) / sqrt(var_A/n + var_B/n)
  p-value = 2 * P(T > |t|)
  Significant if p-value < 0.05

Confidence Interval (95%):
  CI = mean ± 1.96 * (std / sqrt(n))

Bonferroni Correction:
  α_corrected = α / number_of_comparisons

Benjamini-Hochberg FDR Control:
  Adjusted p-value = p * n / rank
```

---

## Appendix B: Useful Resources

### Datasets
- HAM10000: https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
- ISIC 2019: https://www.isic-archive.com/
- EyePACS: https://www.kaggle.com/datasets/mariaherrerot/eyepacs
- COVID-19 CXR: https://github.com/ieee8023/covid-chestxray-dataset

### Libraries
- PyTorch: https://pytorch.org/
- TensorFlow/Keras: https://www.tensorflow.org/
- OpenCV: https://opencv.org/
- YOLOv8: https://github.com/ultralytics/ultralytics
- Scikit-learn: https://scikit-learn.org/
- Recharts: https://recharts.org/

### References
- AUROC: https://en.wikipedia.org/wiki/Receiver_operating_characteristic
- F1-Score: https://en.wikipedia.org/wiki/F-score
- Statistical Significance: https://en.wikipedia.org/wiki/Statistical_significance
- HIPAA Compliance: https://www.hhs.gov/hipaa/

---

## Conclusion

This specification provides a complete, production-ready framework for benchmarking image-based disease analysis models in the Arogya platform. The implementation is modular, incremental, and designed to be privacy-compliant and cost-effective.

**Key Takeaways:**
1. **Modular Design**: Each component (evaluation, logging, API, dashboard) can be developed independently
2. **Fair Comparison**: Proper train/val/test splits, statistical significance testing, and robustness metrics
3. **Privacy-First**: De-identification, audit logging, and HIPAA-ready architecture
4. **Cost-Aware**: Tracking and optimization for cloud models like Gemini
5. **Production-Ready**: Comprehensive error handling, monitoring, and documentation

**Success Criteria:**
- All 7 models evaluated with consistent metrics
- Dashboard showing clear model comparisons
- Statistical significance tests validating differences
- Cost tracking and optimization recommendations
- Privacy and compliance requirements met
- >80% test coverage
- Complete documentation

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 completion
