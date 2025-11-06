"""
Database models for model comparison and evaluation
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
try:
    from database import Base
except ImportError:
    from backend.database import Base


class RunStatus(str, enum.Enum):
    """Status of a comparison run"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ArtifactType(str, enum.Enum):
    """Types of artifacts generated"""
    CONFUSION_MATRIX = "confusion_matrix"
    PR_CURVE = "pr_curve"
    PREDICTION_OVERLAY = "prediction_overlay"
    THUMBNAIL = "thumbnail"
    SAMPLE_GRID = "sample_grid"
    METRICS_REPORT = "metrics_report"


class ModelVersion(Base):
    """Registered model versions for comparison"""
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(255), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    config_json = Column(JSON, nullable=False)  # Architecture, hyperparams, etc.
    weights_path = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    evaluation_results = relationship("EvaluationResult", back_populates="model_version")

    def __repr__(self):
        return f"<ModelVersion {self.model_name} v{self.version}>"


class ComparisonRun(Base):
    """A comparison run across multiple models and a dataset"""
    __tablename__ = "comparison_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(100), unique=True, nullable=False, index=True)
    run_name = Column(String(255), nullable=True)
    dataset_id = Column(String(100), nullable=False, index=True)
    dataset_name = Column(String(255), nullable=True)
    config_hash = Column(String(64), nullable=False, index=True)  # For caching
    config_json = Column(JSON, nullable=False)  # Run configuration
    status = Column(SQLEnum(RunStatus), default=RunStatus.PENDING, nullable=False)
    error_message = Column(Text, nullable=True)
    progress_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    evaluation_results = relationship("EvaluationResult", back_populates="comparison_run")

    def __repr__(self):
        return f"<ComparisonRun {self.run_id} - {self.status}>"


class EvaluationResult(Base):
    """Evaluation results for one model in a comparison run"""
    __tablename__ = "evaluation_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("comparison_runs.id"), nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    
    # Metrics
    accuracy = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    
    # Performance metrics
    latency_mean_ms = Column(Float, nullable=True)
    latency_std_ms = Column(Float, nullable=True)
    throughput_imgs_per_sec = Column(Float, nullable=True)
    memory_peak_mb = Column(Float, nullable=True)
    memory_avg_mb = Column(Float, nullable=True)
    
    # Additional metrics
    metrics_json = Column(JSON, nullable=True)  # Additional custom metrics
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    comparison_run = relationship("ComparisonRun", back_populates="evaluation_results")
    model_version = relationship("ModelVersion", back_populates="evaluation_results")
    image_predictions = relationship("ImagePrediction", back_populates="evaluation_result")
    artifacts = relationship("Artifact", back_populates="evaluation_result")

    def __repr__(self):
        return f"<EvaluationResult run={self.run_id} model={self.model_version_id}>"


class ImagePrediction(Base):
    """Individual image prediction from a model"""
    __tablename__ = "image_predictions"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("evaluation_results.id"), nullable=False)
    image_path = Column(String(512), nullable=False)
    image_id = Column(String(100), nullable=True, index=True)
    
    predicted_class = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    ground_truth = Column(String(100), nullable=True)
    is_correct = Column(Integer, nullable=True)  # 1 if correct, 0 if wrong, NULL if no ground truth
    
    inference_time_ms = Column(Float, nullable=True)
    prediction_json = Column(JSON, nullable=True)  # Full prediction details (top-k, probabilities, etc.)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    evaluation_result = relationship("EvaluationResult", back_populates="image_predictions")

    def __repr__(self):
        return f"<ImagePrediction {self.image_id} -> {self.predicted_class} ({self.confidence:.2f})>"


class Artifact(Base):
    """Artifacts generated during evaluation (confusion matrices, overlays, etc.)"""
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("evaluation_results.id"), nullable=False)
    artifact_type = Column(SQLEnum(ArtifactType), nullable=False)
    storage_path = Column(String(512), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    metadata_json = Column(JSON, nullable=True)  # Additional metadata (dimensions, format, etc.)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    evaluation_result = relationship("EvaluationResult", back_populates="artifacts")

    def __repr__(self):
        return f"<Artifact {self.artifact_type} at {self.storage_path}>"
