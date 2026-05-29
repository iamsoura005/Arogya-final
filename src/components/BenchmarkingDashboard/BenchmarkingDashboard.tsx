import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, RefreshCw, TrendingUp, ArrowLeft } from 'lucide-react';
import axios from 'axios';

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
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface BenchmarkingDashboardProps {
  onBack?: () => void;
}

export default function BenchmarkingDashboard({ onBack }: BenchmarkingDashboardProps = {}) {
  const [runs, setRuns] = useState<BenchmarkRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    models: [],
    datasets: [],
    metrics: ['accuracy', 'f1', 'latency_mean']
  });
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch runs
      const runsResponse = await axios.get(`${API_BASE_URL}/api/benchmarks/runs`, {
        params: {
          limit: 100
        }
      });
      setRuns(runsResponse.data.runs || []);

      // Fetch summary
      const summaryResponse = await axios.get(`${API_BASE_URL}/api/benchmarks/summary`);
      setSummary(summaryResponse.data.summary || {});

      // Fetch comparison if models selected
      if (filters.models.length > 1 && filters.datasets.length > 0) {
        const comparisonResponse = await axios.get(
          `${API_BASE_URL}/api/benchmarks/comparison`,
          {
            params: {
              models: filters.models.join(','),
              dataset: filters.datasets[0],
              metrics: filters.metrics.join(',')
            }
          }
        );
        setComparisonData(comparisonResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/benchmarks/export`,
        {
          params: {
            format,
            model_names: filters.models.join(','),
            dataset_names: filters.datasets.join(',')
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `benchmarks.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const getModelStats = (modelName: string) => {
    if (!summary || !summary[modelName]) return null;
    return summary[modelName];
  };

  const topModels = Object.entries(summary || {})
    .sort((a: any, b: any) => {
      const aF1 = a[1].avg_metrics?.f1 || 0;
      const bF1 = b[1].avg_metrics?.f1 || 0;
      return bF1 - aF1;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Benchmarking Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Compare model performance across metrics and datasets
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <p className="text-gray-600 text-sm font-medium">Total Runs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{runs.length}</p>
            <p className="text-green-600 text-sm mt-2">↑ 5 this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <p className="text-gray-600 text-sm font-medium">Models Evaluated</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {Object.keys(summary || {}).length}
            </p>
            <p className="text-gray-600 text-sm mt-2">7 total available</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <p className="text-gray-600 text-sm font-medium">Best Model</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {topModels.length > 0 ? topModels[0][0] : 'N/A'}
            </p>
            {topModels.length > 0 && (
              <p className="text-green-600 text-sm mt-2">
                F1: {((topModels[0][1] as any).avg_metrics?.f1 || 0).toFixed(3)}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <p className="text-gray-600 text-sm font-medium">Datasets</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {new Set(runs.map(r => r.dataset_name)).size}
            </p>
            <p className="text-gray-600 text-sm mt-2">active</p>
          </motion.div>
        </div>

        {/* Model Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Model Performance Summary
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Model</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Runs</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Accuracy</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">F1-Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Latency (ms)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">AUROC</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary || {}).map(([modelName, stats]: any, idx) => (
                  <motion.tr
                    key={modelName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{modelName}</td>
                    <td className="py-3 px-4 text-gray-600">{stats.num_runs}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(stats.avg_metrics?.accuracy || 0) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {(stats.avg_metrics?.accuracy || 0).toFixed(3)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {(stats.avg_metrics?.f1 || 0).toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {(stats.avg_metrics?.latency_mean || 0).toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {(stats.avg_metrics?.auroc || 0).toFixed(3)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {Object.keys(summary || {}).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No benchmark data available. Run evaluations to populate this table.
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-900 mb-2">Dashboard Status</h3>
          <p className="text-blue-800 text-sm">
            {loading ? (
              'Loading benchmark data...'
            ) : (
              <>
                Dashboard is operational. {runs.length} runs logged across{' '}
                {Object.keys(summary || {}).length} models.
              </>
            )}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
