"""
Benchmarking Dashboard API Endpoints
FastAPI routes for benchmark data and comparisons
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import numpy as np
from .logging_service import BenchmarkLogger
from .statistics_service import StatisticsService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/benchmarks", tags=["benchmarks"])
benchmark_logger = BenchmarkLogger()
stats_service = StatisticsService()


@router.get("/runs")
async def list_runs(
    model_name: Optional[str] = Query(None),
    dataset_name: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0)
):
    """List all benchmark runs with optional filters"""
    try:
        result = benchmark_logger.list_runs(
            model_name=model_name,
            dataset_name=dataset_name,
            limit=limit,
            offset=offset
        )
        
        return {
            'status': 'success',
            'total': result['total'],
            'limit': result['limit'],
            'offset': result['offset'],
            'runs': result['runs']
        }
    except Exception as e:
        logger.error(f"Error listing runs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/runs/{run_id}")
async def get_run(run_id: str):
    """Get detailed run information"""
    try:
        run = benchmark_logger.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        return {
            'status': 'success',
            'run': run
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison")
async def compare_models(
    models: List[str] = Query(...),
    dataset: str = Query(...),
    metrics: List[str] = Query(["accuracy", "f1", "latency_mean"])
):
    """Compare multiple models on a dataset"""
    try:
        comparison_data = {}
        
        for model in models:
            runs = benchmark_logger.query_metrics(
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
                values_array = np.array(values)
                comparison_data[model][metric_name] = {
                    'mean': float(np.mean(values_array)),
                    'std': float(np.std(values_array)),
                    'min': float(np.min(values_array)),
                    'max': float(np.max(values_array)),
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
                        # Get raw values for t-test
                        runs_a = benchmark_logger.query_metrics(
                            model_names=[model_a],
                            dataset_names=[dataset],
                            metric_names=[metric]
                        )
                        runs_b = benchmark_logger.query_metrics(
                            model_names=[model_b],
                            dataset_names=[dataset],
                            metric_names=[metric]
                        )
                        
                        values_a = np.array([r['metric_value'] for r in runs_a])
                        values_b = np.array([r['metric_value'] for r in runs_b])
                        
                        if len(values_a) > 1 and len(values_b) > 1:
                            test_result = stats_service.paired_t_test(values_a, values_b)
                            
                            key = f"{model_a}_vs_{model_b}_{metric}"
                            significance_tests[key] = {
                                'p_value': test_result['p_value'],
                                'significant': test_result['significant'],
                                'cohens_d': test_result['cohens_d']
                            }
        
        return {
            'status': 'success',
            'comparison': comparison_data,
            'significance_tests': significance_tests
        }
    except Exception as e:
        logger.error(f"Error comparing models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/robustness")
async def get_robustness_metrics(
    model_name: str = Query(...),
    dataset_name: str = Query(...),
    augmentation_type: Optional[str] = Query(None)
):
    """Get robustness metrics for a model"""
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
        
        runs = benchmark_logger.query_metrics(
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
            values_array = np.array(values)
            result[metric_name] = {
                'mean': float(np.mean(values_array)),
                'std': float(np.std(values_array)),
                'min': float(np.min(values_array)),
                'max': float(np.max(values_array))
            }
        
        return {
            'status': 'success',
            'model_name': model_name,
            'dataset_name': dataset_name,
            'robustness_metrics': result
        }
    except Exception as e:
        logger.error(f"Error getting robustness metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/runs")
async def create_run(run_data: dict):
    """Create a new benchmark run"""
    try:
        run_id = benchmark_logger.log_run(
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
        logger.error(f"Error creating run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_summary(
    dataset_name: Optional[str] = Query(None)
):
    """Get summary statistics"""
    try:
        runs = benchmark_logger.query_metrics(
            dataset_names=[dataset_name] if dataset_name else None,
            limit=10000
        )
        
        # Group by model
        model_stats = {}
        for run in runs:
            model = run['model_name']
            if model not in model_stats:
                model_stats[model] = {
                    'num_runs': 0,
                    'metrics': {}
                }
            
            model_stats[model]['num_runs'] += 1
            
            metric_name = run['metric_name']
            if metric_name not in model_stats[model]['metrics']:
                model_stats[model]['metrics'][metric_name] = []
            
            model_stats[model]['metrics'][metric_name].append(run['metric_value'])
        
        # Compute averages
        summary = {}
        for model, stats in model_stats.items():
            summary[model] = {
                'num_runs': stats['num_runs'],
                'avg_metrics': {}
            }
            
            for metric_name, values in stats['metrics'].items():
                values_array = np.array(values)
                summary[model]['avg_metrics'][metric_name] = float(np.mean(values_array))
        
        return {
            'status': 'success',
            'summary': summary
        }
    except Exception as e:
        logger.error(f"Error getting summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-model-compare")
async def multi_model_image_analysis(
    image_data: str,
    model_names: List[str],
    analysis_options: Optional[dict] = {}
):
    """Compare multiple models on the same image for enhanced diagnosis"""
    try:
        from datetime import datetime
        import time
        
        comparison_results = {}
        processing_times = {}
        
        for model_name in model_names:
            # Simulate model processing with different characteristics
            start_time = time.time()
            
            # Mock different model responses based on model type
            if 'skin' in model_name.lower():
                mock_result = {
                    'diagnosis': 'Mild Eczema',
                    'confidence': 78 + np.random.uniform(0, 15),
                    'severity': 'mild',
                    'accuracy': 0.94,
                    'condition_type': 'skin',
                    'medicines': [
                        {'name': 'Hydrocortisone cream', 'dosage': '1%', 'frequency': 'Twice daily', 'duration': '2 weeks'},
                        {'name': 'Moisturizer', 'dosage': 'As needed', 'frequency': 'After washing', 'duration': 'Ongoing'}
                    ],
                    'recommendations': ['Avoid known irritants', 'Keep skin moisturized', 'Use mild soaps']
                }
            elif 'eye' in model_name.lower():
                mock_result = {
                    'diagnosis': 'Mild Conjunctivitis',
                    'confidence': 75 + np.random.uniform(0, 18),
                    'severity': 'mild',
                    'accuracy': 0.91,
                    'condition_type': 'eye',
                    'medicines': [
                        {'name': 'Artificial tears', 'dosage': '1-2 drops', 'frequency': 'Every 2 hours', 'duration': 'As needed'}
                    ],
                    'recommendations': ['Practice good hygiene', 'Avoid touching eyes', 'Use clean towels']
                }
            elif 'dermnet' in model_name.lower():
                mock_result = {
                    'diagnosis': 'Contact Dermatitis',
                    'confidence': 82 + np.random.uniform(0, 12),
                    'severity': 'moderate',
                    'accuracy': 0.92,
                    'condition_type': 'skin',
                    'medicines': [
                        {'name': 'Triamcinolone cream', 'dosage': '0.1%', 'frequency': 'Once daily', 'duration': '1 week'},
                        {'name': 'Antihistamine', 'dosage': '10mg', 'frequency': 'At bedtime', 'duration': '1 week'}
                    ],
                    'recommendations': ['Identify and avoid allergens', 'Apply cool compresses', 'Take antihistamines if needed']
                }
            else:
                mock_result = {
                    'diagnosis': 'Normal findings',
                    'confidence': 70 + np.random.uniform(0, 20),
                    'severity': 'mild',
                    'accuracy': 0.85,
                    'condition_type': 'general',
                    'medicines': [],
                    'recommendations': ['Regular monitoring recommended']
                }
            
            processing_time = (time.time() - start_time) * 1000
            processing_times[model_name] = processing_time
            
            comparison_results[model_name] = {
                **mock_result,
                'processing_time': processing_time
            }
        
        # Generate consensus
        consensus = generate_consensus(comparison_results)
        
        return {
            'status': 'success',
            'comparison_results': comparison_results,
            'consensus': consensus,
            'processing_times': processing_times,
            'total_processing_time': sum(processing_times.values()),
            'models_analyzed': len(model_names)
        }
    except Exception as e:
        logger.error(f"Error in multi-model comparison: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_consensus(comparison_results: dict) -> dict:
    """Generate consensus diagnosis from multiple model results"""
    if not comparison_results:
        return None
    
    # Group by similar diagnoses (first word)
    diagnosis_groups = {}
    for model_name, result in comparison_results.items():
        diagnosis_key = result['diagnosis'].lower().split(' ')[0]
        if diagnosis_key not in diagnosis_groups:
            diagnosis_groups[diagnosis_key] = []
        diagnosis_groups[diagnosis_key].append((model_name, result))
    
    # Find most common diagnosis group
    most_common_group = max(diagnosis_groups.items(), key=lambda x: len(x[1]))
    consensus_models = most_common_group[1]
    
    if not consensus_models:
        return None
    
    # Calculate consensus metrics
    total_confidence = sum(result['confidence'] for _, result in consensus_models)
    avg_confidence = total_confidence / len(consensus_models)
    agreement = (len(consensus_models) / len(comparison_results)) * 100
    
    # Determine consensus severity (highest severity wins)
    severity_order = {'mild': 0, 'moderate': 1, 'severe': 2}
    max_severity_model = max(consensus_models, key=lambda x: severity_order[x[1]['severity']])
    consensus_severity = max_severity_model[1]['severity']
    
    # Generate combined recommendations
    all_recommendations = []
    for _, result in consensus_models:
        all_recommendations.extend(result.get('recommendations', []))
    
    # Remove duplicates while preserving order
    unique_recommendations = list(dict.fromkeys(all_recommendations))
    
    return {
        'diagnosis': consensus_models[0][1]['diagnosis'],
        'confidence': avg_confidence,
        'agreement': agreement,
        'severity': consensus_severity,
        'consensus_models': [model_name for model_name, _ in consensus_models],
        'recommendations': unique_recommendations[:5]  # Limit to 5 recommendations
    }


@router.get("/export-comparison")
async def export_comparison_data(
    model_names: str = Query(...),
    format: str = Query("json"),
    dataset: Optional[str] = Query(None)
):
    """Export comparison data in various formats"""
    try:
        from datetime import datetime
        import io
        
        model_list = model_names.split(',')
        
        # Get comparison data
        comparison_response = await compare_models(
            models=model_list,
            dataset=dataset or "general_medical",
            metrics=["accuracy", "f1", "latency_mean", "precision", "recall"]
        )
        
        export_data = {
            'export_timestamp': datetime.now().isoformat(),
            'models': model_list,
            'dataset': dataset,
            'comparison_data': comparison_response['comparison'],
            'statistical_tests': comparison_response.get('significance_tests', {}),
            'summary': {
                'total_models': len(model_list),
                'export_format': format,
                'data_points': len(comparison_response.get('comparison', {}).get(model_list[0], {}))
            }
        }
        
        if format == 'json':
            return {
                'status': 'success',
                'data': export_data,
                'content_type': 'application/json',
                'filename': f'model-comparison-{datetime.now().strftime("%Y%m%d-%H%M%S")}.json'
            }
        elif format == 'csv':
            # Convert to CSV format
            csv_data = convert_comparison_to_csv(export_data)
            return {
                'status': 'success',
                'data': csv_data,
                'content_type': 'text/csv',
                'filename': f'model-comparison-{datetime.now().strftime("%Y%m%d-%H%M%S")}.csv'
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
            
    except Exception as e:
        logger.error(f"Error exporting comparison data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def convert_comparison_to_csv(data: dict) -> str:
    """Convert comparison data to CSV format"""
    import io
    
    output = io.StringIO()
    
    # Write header
    output.write('Model,Metric,Value,Std Dev,Min,Max,Count\n')
    
    # Write data
    for model_name, metrics in data['comparison_data'].items():
        for metric_name, stats in metrics.items():
            output.write(f'{model_name},{metric_name},{stats["mean"]:.4f},{stats["std"]:.4f},{stats["min"]:.4f},{stats["max"]:.4f},{stats["count"]}\n')
    
    return output.getvalue()


@router.get("/benchmark-robustness")
async def get_robustness_benchmark(
    model_names: List[str] = Query(...),
    dataset_name: str = Query(...),
    augmentation_types: Optional[List[str]] = Query(["noise", "blur", "rotation", "brightness", "compression"])
):
    """Get robustness comparison for multiple models"""
    try:
        robustness_data = {}
        
        for model_name in model_names:
            model_robustness = {}
            
            for aug_type in augmentation_types:
                # Simulate robustness metrics
                baseline_accuracy = 0.7 + np.random.uniform(0, 0.25)
                robustness_score = baseline_accuracy - (0.05 + np.random.uniform(0, 0.15))
                
                model_robustness[f'robustness_{aug_type}'] = {
                    'score': robustness_score,
                    'degradation': baseline_accuracy - robustness_score,
                    'baseline': baseline_accuracy
                }
            
            robustness_data[model_name] = model_robustness
        
        return {
            'status': 'success',
            'dataset': dataset_name,
            'robustness_data': robustness_data,
            'augmentation_types': augmentation_types,
            'comparison_summary': generate_robustness_summary(robustness_data)
        }
    except Exception as e:
        logger.error(f"Error getting robustness benchmark: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_robustness_summary(robustness_data: dict) -> dict:
    """Generate summary of robustness comparison"""
    summary = {
        'most_robust_model': None,
        'least_robust_model': None,
        'average_robustness': {},
        'robustness_ranking': []
    }
    
    # Calculate average robustness for each model
    model_scores = {}
    for model_name, data in robustness_data.items():
        scores = [stats['score'] for stats in data.values()]
        avg_score = np.mean(scores)
        model_scores[model_name] = avg_score
    
    # Find most and least robust
    if model_scores:
        most_robust = max(model_scores.items(), key=lambda x: x[1])
        least_robust = min(model_scores.items(), key=lambda x: x[1])
        
        summary['most_robust_model'] = most_robust[0]
        summary['least_robust_model'] = least_robust[0]
        summary['average_robustness'] = model_scores
        summary['robustness_ranking'] = sorted(model_scores.items(), key=lambda x: x[1], reverse=True)
    
    return summary
