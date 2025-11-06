"""
Model Comparison API Endpoints (v2)
Handles model registration, comparison runs, and artifact retrieval
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import hashlib
import json
import uuid

try:
    from database import get_db
    from models.comparison_models import (
        ModelVersion, ComparisonRun, EvaluationResult, 
        ImagePrediction, Artifact, RunStatus, ArtifactType
    )
except ImportError:
    from backend.database import get_db
    from backend.models.comparison_models import (
        ModelVersion, ComparisonRun, EvaluationResult, 
        ImagePrediction, Artifact, RunStatus, ArtifactType
    )
from .evaluator import ImageComparisonEvaluator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v2", tags=["model-comparison-v2"])


# ============= Request/Response Models =============

class ModelRegistrationRequest(BaseModel):
    model_name: str
    version: str
    config: dict
    weights_path: Optional[str] = None


class ModelResponse(BaseModel):
    id: int
    model_name: str
    version: str
    config: dict
    created_at: datetime

    class Config:
        from_attributes = True


class ComparisonRunRequest(BaseModel):
    model_ids: List[int]
    dataset_id: str
    dataset_name: Optional[str] = None
    config: Optional[dict] = {}
    run_name: Optional[str] = None


class MetricsResponse(BaseModel):
    accuracy: Optional[float]
    f1_score: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    latency_mean_ms: Optional[float]
    throughput_imgs_per_sec: Optional[float]
    memory_peak_mb: Optional[float]


class ModelResultResponse(BaseModel):
    model_id: int
    model_name: str
    version: str
    metrics: MetricsResponse


class ComparisonRunResponse(BaseModel):
    run_id: str
    status: str
    progress_pct: float
    dataset_name: Optional[str]
    models: List[ModelResultResponse]
    artifacts: dict
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============= Endpoints =============

@router.post("/models/register", response_model=ModelResponse)
async def register_model(
    request: ModelRegistrationRequest,
    db: Session = Depends(get_db)
):
    """Register a new model version for comparison"""
    try:
        # Check if model version already exists
        existing = db.query(ModelVersion).filter(
            ModelVersion.model_name == request.model_name,
            ModelVersion.version == request.version
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Model {request.model_name} v{request.version} already registered"
            )
        
        # Create new model version
        model = ModelVersion(
            model_name=request.model_name,
            version=request.version,
            config_json=request.config,
            weights_path=request.weights_path
        )
        
        db.add(model)
        db.commit()
        db.refresh(model)
        
        logger.info(f"Registered model: {model.model_name} v{model.version}")
        
        return ModelResponse(
            id=model.id,
            model_name=model.model_name,
            version=model.version,
            config=model.config_json,
            created_at=model.created_at
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering model: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models", response_model=List[ModelResponse])
async def list_models(
    filter_by_name: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """List all registered models"""
    try:
        query = db.query(ModelVersion)
        
        if filter_by_name:
            query = query.filter(ModelVersion.model_name.contains(filter_by_name))
        
        models = query.order_by(ModelVersion.created_at.desc()).offset(offset).limit(limit).all()
        
        return [
            ModelResponse(
                id=m.id,
                model_name=m.model_name,
                version=m.version,
                config=m.config_json,
                created_at=m.created_at
            )
            for m in models
        ]
    
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comparison/runs", response_model=ComparisonRunResponse)
async def create_comparison_run(
    request: ComparisonRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new comparison run (async processing)"""
    try:
        if len(request.model_ids) < 2:
            raise HTTPException(
                status_code=400,
                detail="At least 2 models required for comparison"
            )
        
        if len(request.model_ids) > 5:
            raise HTTPException(
                status_code=400,
                detail="Maximum 5 models allowed for comparison"
            )
        
        # Verify all models exist
        models = db.query(ModelVersion).filter(
            ModelVersion.id.in_(request.model_ids)
        ).all()
        
        if len(models) != len(request.model_ids):
            raise HTTPException(
                status_code=404,
                detail="One or more model IDs not found"
            )
        
        # Generate config hash for caching
        config_str = json.dumps({
            "model_ids": sorted(request.model_ids),
            "dataset_id": request.dataset_id,
            "config": request.config
        }, sort_keys=True)
        config_hash = hashlib.sha256(config_str.encode()).hexdigest()
        
        # Check for cached run
        cached_run = db.query(ComparisonRun).filter(
            ComparisonRun.config_hash == config_hash,
            ComparisonRun.status == RunStatus.COMPLETED
        ).first()
        
        if cached_run:
            logger.info(f"Cache hit for config hash: {config_hash}")
            return _format_run_response(cached_run, db)
        
        # Create new run
        run_id = f"run_{uuid.uuid4().hex[:12]}"
        comparison_run = ComparisonRun(
            run_id=run_id,
            run_name=request.run_name or f"Comparison {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            dataset_id=request.dataset_id,
            dataset_name=request.dataset_name,
            config_hash=config_hash,
            config_json={
                "model_ids": request.model_ids,
                "dataset_id": request.dataset_id,
                "config": request.config
            },
            status=RunStatus.PENDING
        )
        
        db.add(comparison_run)
        db.commit()
        db.refresh(comparison_run)
        
        # Queue background evaluation task
        background_tasks.add_task(
            run_evaluation_task,
            comparison_run.id,
            request.model_ids,
            request.dataset_id
        )
        
        logger.info(f"Created comparison run: {run_id}")
        
        return _format_run_response(comparison_run, db)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating comparison run: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison/runs", response_model=List[ComparisonRunResponse])
async def list_comparison_runs(
    status: Optional[RunStatus] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """List comparison runs with optional status filter"""
    try:
        query = db.query(ComparisonRun)
        
        if status:
            query = query.filter(ComparisonRun.status == status)
        
        runs = query.order_by(ComparisonRun.created_at.desc()).offset(offset).limit(limit).all()
        
        return [_format_run_response(run, db) for run in runs]
    
    except Exception as e:
        logger.error(f"Error listing runs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison/runs/{run_id}", response_model=ComparisonRunResponse)
async def get_comparison_run(
    run_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed comparison run information"""
    try:
        run = db.query(ComparisonRun).filter(ComparisonRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        return _format_run_response(run, db)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison/runs/{run_id}/results")
async def get_run_results(
    run_id: str,
    include_predictions: bool = Query(False),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """Get detailed results including predictions"""
    try:
        run = db.query(ComparisonRun).filter(ComparisonRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        results = db.query(EvaluationResult).filter(
            EvaluationResult.run_id == run.id
        ).all()
        
        response = {
            "run_id": run_id,
            "status": run.status.value,
            "results": []
        }
        
        for result in results:
            model = result.model_version
            result_data = {
                "model_id": model.id,
                "model_name": model.model_name,
                "version": model.version,
                "metrics": {
                    "accuracy": result.accuracy,
                    "f1_score": result.f1_score,
                    "precision": result.precision,
                    "recall": result.recall,
                    "latency_mean_ms": result.latency_mean_ms,
                    "throughput_imgs_per_sec": result.throughput_imgs_per_sec,
                    "memory_peak_mb": result.memory_peak_mb
                }
            }
            
            if include_predictions:
                predictions = db.query(ImagePrediction).filter(
                    ImagePrediction.result_id == result.id
                ).limit(limit).all()
                
                result_data["predictions"] = [
                    {
                        "image_id": p.image_id,
                        "predicted_class": p.predicted_class,
                        "confidence": p.confidence,
                        "ground_truth": p.ground_truth,
                        "is_correct": bool(p.is_correct) if p.is_correct is not None else None,
                        "inference_time_ms": p.inference_time_ms
                    }
                    for p in predictions
                ]
            
            response["results"].append(result_data)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison/runs/{run_id}/artifacts/{artifact_type}")
async def get_run_artifacts(
    run_id: str,
    artifact_type: ArtifactType,
    db: Session = Depends(get_db)
):
    """Get artifacts for a specific type"""
    try:
        run = db.query(ComparisonRun).filter(ComparisonRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        # Get all artifacts of specified type for this run
        artifacts = db.query(Artifact).join(EvaluationResult).filter(
            EvaluationResult.run_id == run.id,
            Artifact.artifact_type == artifact_type
        ).all()
        
        return {
            "run_id": run_id,
            "artifact_type": artifact_type.value,
            "artifacts": [
                {
                    "id": a.id,
                    "model_name": a.evaluation_result.model_version.model_name,
                    "storage_path": a.storage_path,
                    "metadata": a.metadata_json
                }
                for a in artifacts
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting artifacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comparison/runs/{run_id}/export")
async def export_comparison_results(
    run_id: str,
    format: str = Query("json", regex="^(json|csv|pdf)$"),
    db: Session = Depends(get_db)
):
    """Export comparison results in specified format"""
    try:
        run = db.query(ComparisonRun).filter(ComparisonRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        if run.status != RunStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail="Can only export completed runs"
            )
        
        # Get all results
        results = db.query(EvaluationResult).filter(
            EvaluationResult.run_id == run.id
        ).all()
        
        export_data = {
            "run_id": run_id,
            "run_name": run.run_name,
            "dataset": run.dataset_name or run.dataset_id,
            "created_at": run.created_at.isoformat(),
            "models": []
        }
        
        for result in results:
            model = result.model_version
            export_data["models"].append({
                "model_name": model.model_name,
                "version": model.version,
                "metrics": {
                    "accuracy": result.accuracy,
                    "f1_score": result.f1_score,
                    "precision": result.precision,
                    "recall": result.recall,
                    "latency_mean_ms": result.latency_mean_ms,
                    "throughput_imgs_per_sec": result.throughput_imgs_per_sec,
                    "memory_peak_mb": result.memory_peak_mb
                }
            })
        
        if format == "json":
            return export_data
        elif format == "csv":
            # Convert to CSV format
            csv_lines = ["Model,Version,Accuracy,F1 Score,Precision,Recall,Latency (ms),Throughput (imgs/s),Memory (MB)"]
            for model_data in export_data["models"]:
                metrics = model_data["metrics"]
                csv_lines.append(
                    f"{model_data['model_name']},{model_data['version']},"
                    f"{metrics.get('accuracy', 'N/A')},{metrics.get('f1_score', 'N/A')},"
                    f"{metrics.get('precision', 'N/A')},{metrics.get('recall', 'N/A')},"
                    f"{metrics.get('latency_mean_ms', 'N/A')},{metrics.get('throughput_imgs_per_sec', 'N/A')},"
                    f"{metrics.get('memory_peak_mb', 'N/A')}"
                )
            return {"csv_data": "\n".join(csv_lines)}
        
        return {"message": "PDF export not yet implemented"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison/cache-stats")
async def get_cache_stats(db: Session = Depends(get_db)):
    """Get cache statistics"""
    try:
        total_runs = db.query(ComparisonRun).count()
        completed_runs = db.query(ComparisonRun).filter(
            ComparisonRun.status == RunStatus.COMPLETED
        ).count()
        
        # Count unique config hashes
        unique_configs = db.query(ComparisonRun.config_hash).distinct().count()
        
        cache_hit_rate = 0
        if unique_configs > 0:
            cache_hit_rate = ((completed_runs - unique_configs) / completed_runs * 100) if completed_runs > 0 else 0
        
        return {
            "total_runs": total_runs,
            "completed_runs": completed_runs,
            "unique_configurations": unique_configs,
            "cache_hit_rate_pct": round(cache_hit_rate, 2)
        }
    
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= Helper Functions =============

def _format_run_response(run: ComparisonRun, db: Session) -> ComparisonRunResponse:
    """Format a comparison run for response"""
    results = db.query(EvaluationResult).filter(
        EvaluationResult.run_id == run.id
    ).all()
    
    models_data = []
    for result in results:
        model = result.model_version
        models_data.append(
            ModelResultResponse(
                model_id=model.id,
                model_name=model.model_name,
                version=model.version,
                metrics=MetricsResponse(
                    accuracy=result.accuracy,
                    f1_score=result.f1_score,
                    precision=result.precision,
                    recall=result.recall,
                    latency_mean_ms=result.latency_mean_ms,
                    throughput_imgs_per_sec=result.throughput_imgs_per_sec,
                    memory_peak_mb=result.memory_peak_mb
                )
            )
        )
    
    # Get artifact paths
    artifacts_dict = {}
    for result in results:
        model_name = result.model_version.model_name
        artifacts = db.query(Artifact).filter(
            Artifact.result_id == result.id
        ).all()
        
        for artifact in artifacts:
            artifact_key = f"{model_name}_{artifact.artifact_type.value}"
            artifacts_dict[artifact_key] = artifact.storage_path
    
    return ComparisonRunResponse(
        run_id=run.run_id,
        status=run.status.value,
        progress_pct=run.progress_pct,
        dataset_name=run.dataset_name,
        models=models_data,
        artifacts=artifacts_dict,
        created_at=run.created_at,
        completed_at=run.completed_at
    )


async def run_evaluation_task(run_db_id: int, model_ids: List[int], dataset_id: str):
    """Background task to run evaluation"""
    from backend.database import SessionLocal
    
    db = SessionLocal()
    try:
        run = db.query(ComparisonRun).filter(ComparisonRun.id == run_db_id).first()
        if not run:
            logger.error(f"Run {run_db_id} not found")
            return
        
        # Update status to running
        run.status = RunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()
        
        # Get models
        models = db.query(ModelVersion).filter(ModelVersion.id.in_(model_ids)).all()
        
        # Run evaluation
        evaluator = ImageComparisonEvaluator(models, dataset_id, db)
        await evaluator.run_evaluation(run)
        
        # Update status to completed
        run.status = RunStatus.COMPLETED
        run.completed_at = datetime.utcnow()
        run.progress_pct = 100.0
        db.commit()
        
        logger.info(f"Completed evaluation for run {run.run_id}")
    
    except Exception as e:
        logger.error(f"Error in evaluation task: {e}")
        if run:
            run.status = RunStatus.FAILED
            run.error_message = str(e)
            db.commit()
    finally:
        db.close()
