"""
Image Comparison Evaluator
Handles model evaluation, metrics computation, and artifact generation
"""
import os
import time
import tracemalloc
import numpy as np
from typing import List, Dict, Tuple
from datetime import datetime
from PIL import Image
import json
import logging

try:
    from models.comparison_models import (
        ModelVersion, ComparisonRun, EvaluationResult,
        ImagePrediction, Artifact, ArtifactType
    )
except ImportError:
    from backend.models.comparison_models import (
        ModelVersion, ComparisonRun, EvaluationResult,
        ImagePrediction, Artifact, ArtifactType
    )
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class ImageComparisonEvaluator:
    """Evaluates multiple models on a dataset and generates comparison artifacts"""
    
    def __init__(self, models: List[ModelVersion], dataset_id: str, db: Session):
        self.models = models
        self.dataset_id = dataset_id
        self.db = db
        self.artifact_base_path = os.getenv("ARTIFACT_LOCAL_PATH", "./backend/artifacts")
    
    async def run_evaluation(self, run: ComparisonRun):
        """Main evaluation loop"""
        try:
            logger.info(f"Starting evaluation for run {run.run_id}")
            
            # Create artifact directory
            run_artifact_dir = os.path.join(self.artifact_base_path, run.run_id)
            os.makedirs(run_artifact_dir, exist_ok=True)
            os.makedirs(os.path.join(run_artifact_dir, "confusion_matrices"), exist_ok=True)
            os.makedirs(os.path.join(run_artifact_dir, "pr_curves"), exist_ok=True)
            os.makedirs(os.path.join(run_artifact_dir, "predictions"), exist_ok=True)
            os.makedirs(os.path.join(run_artifact_dir, "thumbnails"), exist_ok=True)
            
            # Load dataset
            dataset = self._load_dataset(self.dataset_id)
            total_images = len(dataset)
            
            logger.info(f"Loaded dataset {self.dataset_id} with {total_images} images")
            
            # Evaluate each model
            for model_idx, model in enumerate(self.models):
                logger.info(f"Evaluating model {model.model_name} v{model.version}")
                
                # Run inference on all images
                predictions = []
                latencies = []
                memory_usages = []
                
                for img_idx, (image_path, ground_truth) in enumerate(dataset):
                    # Update progress
                    progress = ((model_idx * total_images) + img_idx) / (len(self.models) * total_images) * 100
                    run.progress_pct = progress
                    if img_idx % 10 == 0:  # Commit every 10 images
                        self.db.commit()
                    
                    # Run inference with timing and memory tracking
                    pred, latency, memory = await self._run_inference(model, image_path)
                    
                    predictions.append({
                        "image_path": image_path,
                        "ground_truth": ground_truth,
                        "predicted_class": pred["class"],
                        "confidence": pred["confidence"],
                        "prediction_json": pred
                    })
                    
                    latencies.append(latency)
                    memory_usages.append(memory)
                
                # Compute metrics
                metrics = self._compute_metrics(predictions)
                
                # Create evaluation result
                eval_result = EvaluationResult(
                    run_id=run.id,
                    model_version_id=model.id,
                    accuracy=metrics["accuracy"],
                    f1_score=metrics["f1_score"],
                    precision=metrics["precision"],
                    recall=metrics["recall"],
                    latency_mean_ms=np.mean(latencies),
                    latency_std_ms=np.std(latencies),
                    throughput_imgs_per_sec=1000.0 / np.mean(latencies) if np.mean(latencies) > 0 else 0,
                    memory_peak_mb=np.max(memory_usages),
                    memory_avg_mb=np.mean(memory_usages),
                    metrics_json=metrics
                )
                
                self.db.add(eval_result)
                self.db.commit()
                self.db.refresh(eval_result)
                
                # Save individual predictions
                for pred in predictions:
                    image_pred = ImagePrediction(
                        result_id=eval_result.id,
                        image_path=pred["image_path"],
                        image_id=os.path.basename(pred["image_path"]),
                        predicted_class=pred["predicted_class"],
                        confidence=pred["confidence"],
                        ground_truth=pred["ground_truth"],
                        is_correct=1 if pred["predicted_class"] == pred["ground_truth"] else 0,
                        prediction_json=pred["prediction_json"]
                    )
                    self.db.add(image_pred)
                
                self.db.commit()
                
                # Generate artifacts
                await self._generate_artifacts(eval_result, predictions, run_artifact_dir, model)
                
                logger.info(f"Completed evaluation for model {model.model_name} - Accuracy: {metrics['accuracy']:.4f}")
            
            logger.info(f"Completed all evaluations for run {run.run_id}")
        
        except Exception as e:
            logger.error(f"Error in evaluation: {e}")
            raise
    
    def _load_dataset(self, dataset_id: str) -> List[Tuple[str, str]]:
        """Load dataset images and ground truth labels"""
        # Mock dataset loading - replace with actual dataset loader
        # This should load from dataset/ folder or database
        
        dataset_map = {
            "skin_conditions": [
                ("dataset/skin_sample_1.jpg", "acne"),
                ("dataset/skin_sample_2.jpg", "eczema"),
                ("dataset/skin_sample_3.jpg", "psoriasis"),
            ],
            "eye_diseases": [
                ("dataset/eye_sample_1.jpg", "conjunctivitis"),
                ("dataset/eye_sample_2.jpg", "cataract"),
            ],
            "general_medical": [
                ("dataset/sample_1.jpg", "condition_a"),
                ("dataset/sample_2.jpg", "condition_b"),
                ("dataset/sample_3.jpg", "condition_a"),
            ]
        }
        
        # Return mock dataset for now
        if dataset_id in dataset_map:
            return dataset_map[dataset_id]
        else:
            # Generate mock data
            return [
                (f"dataset/sample_{i}.jpg", f"class_{i % 3}")
                for i in range(10)
            ]
    
    async def _run_inference(self, model: ModelVersion, image_path: str) -> Tuple[Dict, float, float]:
        """Run inference on a single image with timing and memory tracking"""
        # Start memory tracking
        tracemalloc.start()
        
        # Simulate model inference (replace with actual model loading and inference)
        start_time = time.time()
        
        # Mock prediction
        prediction = {
            "class": f"predicted_class_{np.random.randint(0, 5)}",
            "confidence": 0.7 + np.random.random() * 0.3,
            "top_k_classes": [
                {"class": f"class_{i}", "prob": np.random.random()}
                for i in range(5)
            ]
        }
        
        # Simulate processing time
        await self._simulate_processing(0.05, 0.15)  # 50-150ms
        
        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000
        
        # Get memory usage
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        memory_mb = peak / 1024 / 1024
        
        return prediction, latency_ms, memory_mb
    
    async def _simulate_processing(self, min_time: float, max_time: float):
        """Simulate processing delay"""
        import asyncio
        delay = min_time + (max_time - min_time) * np.random.random()
        await asyncio.sleep(delay)
    
    def _compute_metrics(self, predictions: List[Dict]) -> Dict:
        """Compute classification metrics"""
        y_true = [p["ground_truth"] for p in predictions]
        y_pred = [p["predicted_class"] for p in predictions]
        
        # Get unique classes
        classes = list(set(y_true + y_pred))
        n_classes = len(classes)
        
        # Create confusion matrix
        confusion_matrix = np.zeros((n_classes, n_classes), dtype=int)
        class_to_idx = {cls: idx for idx, cls in enumerate(classes)}
        
        for true, pred in zip(y_true, y_pred):
            true_idx = class_to_idx[true]
            pred_idx = class_to_idx[pred]
            confusion_matrix[true_idx][pred_idx] += 1
        
        # Compute metrics
        correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
        total = len(y_true)
        accuracy = correct / total if total > 0 else 0
        
        # Per-class precision, recall, f1
        precisions = []
        recalls = []
        f1_scores = []
        
        for i in range(n_classes):
            tp = confusion_matrix[i][i]
            fp = confusion_matrix[:, i].sum() - tp
            fn = confusion_matrix[i, :].sum() - tp
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            
            precisions.append(precision)
            recalls.append(recall)
            f1_scores.append(f1)
        
        # Macro-averaged metrics
        return {
            "accuracy": accuracy,
            "precision": np.mean(precisions),
            "recall": np.mean(recalls),
            "f1_score": np.mean(f1_scores),
            "confusion_matrix": confusion_matrix.tolist(),
            "classes": classes,
            "per_class_metrics": {
                classes[i]: {
                    "precision": precisions[i],
                    "recall": recalls[i],
                    "f1_score": f1_scores[i]
                }
                for i in range(n_classes)
            }
        }
    
    async def _generate_artifacts(
        self, 
        eval_result: EvaluationResult, 
        predictions: List[Dict],
        artifact_dir: str,
        model: ModelVersion
    ):
        """Generate visual artifacts (confusion matrix, PR curve, etc.)"""
        try:
            # Generate confusion matrix image
            cm_path = await self._generate_confusion_matrix(
                eval_result.metrics_json["confusion_matrix"],
                eval_result.metrics_json["classes"],
                artifact_dir,
                model.model_name
            )
            
            if cm_path:
                artifact = Artifact(
                    result_id=eval_result.id,
                    artifact_type=ArtifactType.CONFUSION_MATRIX,
                    storage_path=cm_path,
                    metadata_json={"format": "png"}
                )
                self.db.add(artifact)
            
            # Generate sample prediction overlays (first 5 images)
            for i, pred in enumerate(predictions[:5]):
                overlay_path = await self._generate_prediction_overlay(
                    pred["image_path"],
                    pred["predicted_class"],
                    pred["confidence"],
                    pred["ground_truth"],
                    artifact_dir,
                    model.model_name,
                    i
                )
                
                if overlay_path:
                    artifact = Artifact(
                        result_id=eval_result.id,
                        artifact_type=ArtifactType.PREDICTION_OVERLAY,
                        storage_path=overlay_path,
                        metadata_json={
                            "image_index": i,
                            "predicted": pred["predicted_class"],
                            "confidence": pred["confidence"]
                        }
                    )
                    self.db.add(artifact)
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error generating artifacts: {e}")
    
    async def _generate_confusion_matrix(
        self,
        cm: List[List[int]],
        classes: List[str],
        artifact_dir: str,
        model_name: str
    ) -> str:
        """Generate confusion matrix heatmap image"""
        try:
            import matplotlib
            matplotlib.use('Agg')  # Non-interactive backend
            import matplotlib.pyplot as plt
            import seaborn as sns
            
            plt.figure(figsize=(10, 8))
            sns.heatmap(
                cm,
                annot=True,
                fmt='d',
                cmap='Blues',
                xticklabels=classes,
                yticklabels=classes
            )
            plt.title(f'Confusion Matrix - {model_name}')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            
            filename = f"{model_name.replace(' ', '_')}_confusion_matrix.png"
            filepath = os.path.join(artifact_dir, "confusion_matrices", filename)
            plt.savefig(filepath, dpi=150, bbox_inches='tight')
            plt.close()
            
            return filepath
        
        except Exception as e:
            logger.error(f"Error generating confusion matrix: {e}")
            return None
    
    async def _generate_prediction_overlay(
        self,
        image_path: str,
        predicted: str,
        confidence: float,
        ground_truth: str,
        artifact_dir: str,
        model_name: str,
        index: int
    ) -> str:
        """Generate prediction overlay on image"""
        try:
            # For mock implementation, just save a text file with prediction info
            # In real implementation, overlay prediction on actual image
            
            filename = f"{model_name.replace(' ', '_')}_prediction_{index}.json"
            filepath = os.path.join(artifact_dir, "predictions", filename)
            
            with open(filepath, 'w') as f:
                json.dump({
                    "image_path": image_path,
                    "predicted": predicted,
                    "confidence": confidence,
                    "ground_truth": ground_truth,
                    "model": model_name
                }, f, indent=2)
            
            return filepath
        
        except Exception as e:
            logger.error(f"Error generating prediction overlay: {e}")
            return None
