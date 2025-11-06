"""
Benchmark Logging Service
Log and query benchmark runs and metrics
"""

import json
from datetime import datetime
from typing import Dict, List, Optional
import uuid
import logging
import sqlite3
from pathlib import Path

logger = logging.getLogger(__name__)


class BenchmarkLogger:
    """Log and query benchmark runs"""
    
    def __init__(self, database_path: str = 'arogya_benchmarks.db'):
        """
        Initialize benchmark logger
        
        Args:
            database_path: Path to SQLite database
        """
        self.database_path = database_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database schema"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Runs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                model_name TEXT NOT NULL,
                model_version TEXT,
                framework TEXT,
                dataset_name TEXT NOT NULL,
                dataset_version TEXT,
                split_type TEXT,
                num_samples INTEGER,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                duration_seconds REAL,
                status TEXT,
                error_message TEXT,
                hyperparameters TEXT,
                hardware_cpu TEXT,
                hardware_gpu TEXT,
                software_versions TEXT,
                experiment_id TEXT,
                notes TEXT
            )
        ''')
        
        # Metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS metrics (
                metric_id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                metric_name TEXT NOT NULL,
                metric_value REAL,
                metric_unit TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (run_id) REFERENCES runs(run_id)
            )
        ''')
        
        # Predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                prediction_id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                sample_id TEXT,
                true_label TEXT,
                predicted_label TEXT,
                confidence REAL,
                latency_ms REAL,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (run_id) REFERENCES runs(run_id)
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_runs_model ON runs(model_name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_runs_dataset ON runs(dataset_name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_run ON metrics(run_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name)')
        
        conn.commit()
        conn.close()
        
        logger.info(f"Database initialized: {self.database_path}")
    
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
        Log a complete benchmark run
        
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
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        try:
            # Insert run
            cursor.execute('''
                INSERT INTO runs (
                    run_id, model_name, model_version, framework,
                    dataset_name, num_samples, timestamp, duration_seconds,
                    status, error_message, hyperparameters, experiment_id, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                run_id, model_name, model_version, framework,
                dataset_name, metrics.get('num_samples', 0),
                datetime.utcnow().isoformat(), duration_seconds,
                status, error_message,
                json.dumps(hyperparameters) if hyperparameters else None,
                experiment_id, notes
            ))
            
            # Insert metrics
            for metric_name, metric_value in metrics.items():
                if isinstance(metric_value, (int, float)):
                    metric_id = str(uuid.uuid4())
                    metric_unit = self._get_metric_unit(metric_name)
                    
                    cursor.execute('''
                        INSERT INTO metrics (
                            metric_id, run_id, metric_name, metric_value, metric_unit, timestamp
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        metric_id, run_id, metric_name, float(metric_value),
                        metric_unit, datetime.utcnow().isoformat()
                    ))
            
            conn.commit()
            logger.info(f"Logged run {run_id} for {model_name} on {dataset_name}")
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error logging run: {e}")
            raise
        finally:
            conn.close()
        
        return run_id
    
    def get_run(self, run_id: str) -> Optional[Dict]:
        """Get run details"""
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM runs WHERE run_id = ?', (run_id,))
            run = cursor.fetchone()
            
            if not run:
                return None
            
            cursor.execute('SELECT metric_name, metric_value FROM metrics WHERE run_id = ?', (run_id,))
            metrics = {row['metric_name']: row['metric_value'] for row in cursor.fetchall()}
            
            return {
                'run_id': run['run_id'],
                'model_name': run['model_name'],
                'dataset_name': run['dataset_name'],
                'timestamp': run['timestamp'],
                'duration_seconds': run['duration_seconds'],
                'status': run['status'],
                'metrics': metrics,
                'hyperparameters': json.loads(run['hyperparameters']) if run['hyperparameters'] else None,
                'notes': run['notes']
            }
        finally:
            conn.close()
    
    def query_metrics(
        self,
        model_names: List[str] = None,
        dataset_names: List[str] = None,
        metric_names: List[str] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """Query metrics with filters"""
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            query = '''
                SELECT r.run_id, r.model_name, r.dataset_name, r.timestamp,
                       m.metric_name, m.metric_value
                FROM runs r
                JOIN metrics m ON r.run_id = m.run_id
                WHERE 1=1
            '''
            params = []
            
            if model_names:
                placeholders = ','.join('?' * len(model_names))
                query += f' AND r.model_name IN ({placeholders})'
                params.extend(model_names)
            
            if dataset_names:
                placeholders = ','.join('?' * len(dataset_names))
                query += f' AND r.dataset_name IN ({placeholders})'
                params.extend(dataset_names)
            
            if metric_names:
                placeholders = ','.join('?' * len(metric_names))
                query += f' AND m.metric_name IN ({placeholders})'
                params.extend(metric_names)
            
            query += f' LIMIT {limit}'
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            return [
                {
                    'run_id': row['run_id'],
                    'model_name': row['model_name'],
                    'dataset_name': row['dataset_name'],
                    'metric_name': row['metric_name'],
                    'metric_value': row['metric_value'],
                    'timestamp': row['timestamp']
                }
                for row in results
            ]
        finally:
            conn.close()
    
    def list_runs(
        self,
        model_name: str = None,
        dataset_name: str = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict:
        """List runs with pagination"""
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            # Get total count
            count_query = 'SELECT COUNT(*) as count FROM runs WHERE 1=1'
            count_params = []
            
            if model_name:
                count_query += ' AND model_name = ?'
                count_params.append(model_name)
            
            if dataset_name:
                count_query += ' AND dataset_name = ?'
                count_params.append(dataset_name)
            
            cursor.execute(count_query, count_params)
            total = cursor.fetchone()['count']
            
            # Get paginated results
            query = 'SELECT * FROM runs WHERE 1=1'
            params = []
            
            if model_name:
                query += ' AND model_name = ?'
                params.append(model_name)
            
            if dataset_name:
                query += ' AND dataset_name = ?'
                params.append(dataset_name)
            
            query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            runs = cursor.fetchall()
            
            # Get metrics for each run
            run_list = []
            for run in runs:
                cursor.execute(
                    'SELECT metric_name, metric_value FROM metrics WHERE run_id = ?',
                    (run['run_id'],)
                )
                metrics = {row['metric_name']: row['metric_value'] for row in cursor.fetchall()}
                
                run_list.append({
                    'run_id': run['run_id'],
                    'model_name': run['model_name'],
                    'dataset_name': run['dataset_name'],
                    'timestamp': run['timestamp'],
                    'duration_seconds': run['duration_seconds'],
                    'status': run['status'],
                    'metrics': metrics
                })
            
            return {
                'total': total,
                'limit': limit,
                'offset': offset,
                'runs': run_list
            }
        finally:
            conn.close()
    
    @staticmethod
    def _get_metric_unit(metric_name: str) -> str:
        """Get unit for metric"""
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
            'latency_std': 'ms',
            'throughput_batch_1': 'img/s',
            'throughput_batch_8': 'img/s',
            'throughput_batch_32': 'img/s',
            'throughput_batch_64': 'img/s',
            'cpu_memory_mb': 'MB',
            'gpu_memory_mb': 'MB',
        }
        return units.get(metric_name, '')
