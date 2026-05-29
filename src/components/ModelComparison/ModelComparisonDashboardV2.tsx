/**
 * Enhanced Model Comparison Dashboard
 * Integrated with backend API for real-time model evaluation
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  ArrowLeft,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader
} from 'lucide-react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import useModelComparison from '../../hooks/useModelComparison';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ModelComparisonDashboardProps {
  onBack?: () => void;
}

export default function ModelComparisonDashboardV2({ onBack }: ModelComparisonDashboardProps) {
  const {
    models,
    runs,
    activeRun,
    loading,
    error,
    fetchModels,
    fetchRuns,
    startComparison,
    exportResults,
    clearError
  } = useModelComparison({ autoRefresh: true, refreshInterval: 3000 });

  const [selectedModelIds, setSelectedModelIds] = useState<number[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('skin_conditions');
  const [runName, setRunName] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const datasets = [
    { value: 'skin_conditions', label: 'Skin Conditions' },
    { value: 'eye_diseases', label: 'Eye Diseases' },
    { value: 'general_medical', label: 'General Medical' },
  ];

  useEffect(() => {
    fetchModels();
    fetchRuns();
  }, []);

  const handleModelSelection = (modelId: number) => {
    setSelectedModelIds(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else if (prev.length < 5) {
        return [...prev, modelId];
      }
      return prev;
    });
  };

  const handleRunComparison = async () => {
    if (selectedModelIds.length < 2) {
      alert('Please select at least 2 models for comparison');
      return;
    }

    const result = await startComparison({
      model_ids: selectedModelIds,
      dataset_id: selectedDataset,
      dataset_name: datasets.find(d => d.value === selectedDataset)?.label,
      run_name: runName || undefined,
      config: {}
    });

    if (result) {
      alert(`Comparison started! Run ID: ${result.run_id}`);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (!activeRun) {
      alert('No active run to export');
      return;
    }
    await exportResults(activeRun.run_id, format);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'running': return <Loader className="w-5 h-5 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // Generate chart data for active run
  const generateMetricsChart = () => {
    if (!activeRun || !activeRun.models || activeRun.models.length === 0) return null;

    return {
      labels: activeRun.models.map(m => `${m.model_name} v${m.version}`),
      datasets: [
        {
          label: 'Accuracy',
          data: activeRun.models.map(m => (m.metrics.accuracy || 0) * 100),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
        },
        {
          label: 'F1 Score',
          data: activeRun.models.map(m => (m.metrics.f1_score || 0) * 100),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
        },
      ]
    };
  };

  const generateRadarChart = () => {
    if (!activeRun || !activeRun.models || activeRun.models.length === 0) return null;

    const firstModel = activeRun.models[0];
    const secondModel = activeRun.models[1] || activeRun.models[0];

    return {
      labels: ['Accuracy', 'F1 Score', 'Precision', 'Recall', 'Speed'],
      datasets: [
        {
          label: `${firstModel.model_name}`,
          data: [
            (firstModel.metrics.accuracy || 0) * 100,
            (firstModel.metrics.f1_score || 0) * 100,
            (firstModel.metrics.precision || 0) * 100,
            (firstModel.metrics.recall || 0) * 100,
            Math.min(((firstModel.metrics.throughput_imgs_per_sec || 0) / 100) * 100, 100)
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
        {
          label: `${secondModel.model_name}`,
          data: [
            (secondModel.metrics.accuracy || 0) * 100,
            (secondModel.metrics.f1_score || 0) * 100,
            (secondModel.metrics.precision || 0) * 100,
            (secondModel.metrics.recall || 0) * 100,
            Math.min(((secondModel.metrics.throughput_imgs_per_sec || 0) / 100) * 100, 100)
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
        }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Model Comparison Dashboard</h1>
              <p className="text-gray-600 mt-1">Compare multiple AI models on medical datasets</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { fetchModels(); fetchRuns(); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Model & Dataset Selection */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration</h2>
            
            {/* Dataset Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {datasets.map(dataset => (
                  <option key={dataset.value} value={dataset.value}>
                    {dataset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Run Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Run Name (Optional)
              </label>
              <input
                type="text"
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                placeholder="My Comparison Run"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Models (2-5)
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {models.map(model => (
                  <label
                    key={model.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModelIds.includes(model.id)}
                      onChange={() => handleModelSelection(model.id)}
                      disabled={!selectedModelIds.includes(model.id) && selectedModelIds.length >= 5}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{model.model_name}</div>
                      <div className="text-xs text-gray-500">v{model.version}</div>
                    </div>
                  </label>
                ))}
              </div>
              {models.length === 0 && (
                <p className="text-sm text-gray-500 italic">No models registered yet</p>
              )}
            </div>

            {/* Run Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunComparison}
              disabled={loading || selectedModelIds.length < 2}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Start Comparison
            </motion.button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              {selectedModelIds.length} models selected
            </p>
          </motion.div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Run Status */}
          {activeRun && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeRun.dataset_name || 'Current Run'}
                  </h2>
                  <p className="text-sm text-gray-500">Run ID: {activeRun.run_id}</p>
                </div>
                
                <div className={`flex items-center gap-2 ${getStatusColor(activeRun.status)}`}>
                  {getStatusIcon(activeRun.status)}
                  <span className="font-semibold capitalize">{activeRun.status}</span>
                </div>
              </div>

              {activeRun.status === 'running' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{activeRun.progress_pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activeRun.progress_pct}%` }}
                      className="bg-blue-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )}

              {activeRun.status === 'completed' && activeRun.models.length > 0 && (
                <>
                  {/* Metrics Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Model</th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-700">Accuracy</th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-700">F1</th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-700">Latency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRun.models.map((model, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium">{model.model_name}</td>
                            <td className="text-right py-2 px-3">
                              {((model.metrics.accuracy || 0) * 100).toFixed(2)}%
                            </td>
                            <td className="text-right py-2 px-3">
                              {((model.metrics.f1_score || 0) * 100).toFixed(2)}%
                            </td>
                            <td className="text-right py-2 px-3">
                              {(model.metrics.latency_mean_ms || 0).toFixed(1)}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Metrics Comparison</h3>
                      {generateMetricsChart() && (
                        <Bar
                          data={generateMetricsChart()!}
                          options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom' } },
                            scales: { y: { beginAtZero: true, max: 100 } }
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Radar</h3>
                      {generateRadarChart() && (
                        <Radar
                          data={generateRadarChart()!}
                          options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom' } },
                            scales: { r: { beginAtZero: true, max: 100 } }
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExport('json')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Export JSON
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExport('csv')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Recent Runs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Runs</h2>
            
            <div className="space-y-2">
              {runs.slice(0, 10).map((run) => (
                <motion.div
                  key={run.run_id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => { /* Set as active run */ }}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {run.dataset_name || run.run_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {run.models.length} models • {new Date(run.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${getStatusColor(run.status)}`}>
                    {getStatusIcon(run.status)}
                    <span className="text-sm font-medium capitalize">{run.status}</span>
                  </div>
                </motion.div>
              ))}
              
              {runs.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No comparison runs yet. Start your first comparison above!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
