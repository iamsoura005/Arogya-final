"""
Model Evaluator for Benchmarking
Comprehensive evaluation of models on test sets with metrics computation
"""

import torch
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, matthews_corrcoef
)
from typing import Dict, List, Tuple
import time
import psutil
import logging
from dataclasses import dataclass, asdict
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

@dataclass
class EvaluationResult:
    """Result of model evaluation"""
    run_id: str
    model_name: str
    dataset_name: str
    metrics: Dict[str, float]
    latencies: List[float]
    memory_usage: Dict[str, float]
    timestamp: datetime
    predictions: List[Dict]
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'run_id': self.run_id,
            'model_name': self.model_name,
            'dataset_name': self.dataset_name,
            'metrics': self.metrics,
            'latencies': self.latencies,
            'memory_usage': self.memory_usage,
            'timestamp': self.timestamp.isoformat(),
            'predictions': self.predictions
        }


class ModelEvaluator:
    """Evaluate models on test sets with comprehensive metrics"""
    
    def __init__(self, model, device='cpu'):
        """
        Initialize evaluator
        
        Args:
            model: PyTorch model
            device: 'cpu' or 'cuda'
        """
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
        Comprehensive evaluation of model on test set
        
        Args:
            test_loader: PyTorch DataLoader with test data
            dataset_name: Name of dataset
            model_name: Name of model
            batch_sizes: Batch sizes for throughput testing
        
        Returns:
            EvaluationResult with all metrics
        """
        
        logger.info(f"Starting evaluation of {model_name} on {dataset_name}")
        
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
            'accuracy': float(accuracy_score(all_labels, all_preds)),
            'precision': float(precision_score(all_labels, all_preds, average='weighted', zero_division=0)),
            'recall': float(recall_score(all_labels, all_preds, average='weighted', zero_division=0)),
            'f1': float(f1_score(all_labels, all_preds, average='weighted', zero_division=0)),
            'mcc': float(matthews_corrcoef(all_labels, all_preds)),
        }
        
        # AUROC (one-vs-rest for multiclass)
        try:
            metrics['auroc'] = float(roc_auc_score(
                all_labels, all_confidences, average='weighted'
            ))
        except:
            metrics['auroc'] = 0.0
        
        # Calibration error
        metrics['calibration_error'] = float(np.mean(
            np.abs(all_confidences - (all_preds == all_labels).astype(float))
        ))
        
        # 2. Latency Metrics
        latencies = np.array(latencies)
        metrics['latency_p50'] = float(np.percentile(latencies, 50))
        metrics['latency_p95'] = float(np.percentile(latencies, 95))
        metrics['latency_p99'] = float(np.percentile(latencies, 99))
        metrics['latency_mean'] = float(np.mean(latencies))
        metrics['latency_std'] = float(np.std(latencies))
        
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
        
        logger.info(f"Evaluation complete. Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1']:.4f}")
        
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
        """Measure throughput at different batch sizes"""
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
            
            throughput[f'throughput_batch_{batch_size}'] = float(total_samples / total_time) if total_time > 0 else 0.0
        
        return throughput
    
    def _measure_memory(self, test_loader) -> Dict[str, float]:
        """Measure CPU and GPU memory usage"""
        memory_usage = {}
        
        # CPU memory
        process = psutil.Process()
        memory_usage['cpu_memory_mb'] = float(process.memory_info().rss / 1024 / 1024)
        
        # GPU memory (if available)
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
            
            self.model.eval()
            with torch.no_grad():
                for images, _ in test_loader:
                    images = images.to(self.device)
                    _ = self.model(images)
            
            memory_usage['gpu_memory_mb'] = float(torch.cuda.max_memory_allocated() / 1024 / 1024)
        
        return memory_usage
    
    def evaluate_robustness(
        self,
        test_loader,
        augmentations: Dict[str, callable]
    ) -> Dict[str, float]:
        """
        Evaluate model robustness to augmentations
        
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
            robustness_metrics[f'robustness_{aug_name}'] = float(baseline_acc - aug_acc)
        
        return robustness_metrics
    
    def _get_accuracy(self, test_loader) -> float:
        """Get accuracy on test loader"""
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
        
        return float(accuracy_score(all_labels, all_preds))
    
    def _apply_augmentation(self, test_loader, aug_func):
        """Apply augmentation to test loader"""
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
    """Dataset wrapper that applies augmentation"""
    
    def __init__(self, dataset, augmentation):
        self.dataset = dataset
        self.augmentation = augmentation
    
    def __len__(self):
        return len(self.dataset)
    
    def __getitem__(self, idx):
        image, label = self.dataset[idx]
        image = self.augmentation(image)
        return image, label
