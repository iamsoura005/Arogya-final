import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Eye, 
  Download, 
  RefreshCw, 
  Plus, 
  X,
  CheckCircle,
  AlertTriangle,
  Target,
  Clock,
  Cpu,
  MemoryStick,
  ArrowLeft,
  Play
} from 'lucide-react';
import { Line, Bar, Radar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { getAllModels, getSkinImageModels, getEyeImageModels } from '../../services/localDatasetService';
import useModelComparison from '../../hooks/useModelComparison';
import { ComparisonRun } from '../../services/comparisonApi';

// Register Chart.js components
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

export default function ModelComparisonDashboard({ onBack }: ModelComparisonDashboardProps) {
  const {
    models,
    runs,
    activeRun,
    loading,
    error,
    fetchModels,
    fetchRuns,
    startComparison,
    fetchRunDetails,
    exportResults,
    setActiveRun,
    clearError
  } = useModelComparison({ autoRefresh: true, refreshInterval: 3000 });

  const [selectedModelIds, setSelectedModelIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'performance' | 'images' | 'artifacts'>('performance');
  const [selectedDataset, setSelectedDataset] = useState('skin_conditions');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [runName, setRunName] = useState('');

  const datasets = [
    { value: 'general_medical', label: 'General Medical' },
    { value: 'skin_conditions', label: 'Skin Conditions' },
    { value: 'eye_diseases', label: 'Eye Diseases' },
    { value: 'cardiovascular', label: 'Cardiovascular' },
    { value: 'respiratory', label: 'Respiratory' },
    { value: 'neurological', label: 'Neurological' }
  ];

  useEffect(() => {
    fetchModels();
    fetchRuns();
  }, [fetchModels, fetchRuns]);

  const handleModelSelection = (modelId: number) => {
    setSelectedModelIds(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else if (prev.length < 5) { // Max 5 models for comparison
        return [...prev, modelId];
      }
      return prev;
    });
  };

  const runComparison = async () => {
    if (selectedModels.length < 2) {
      alert('Please select at least 2 models for comparison');
      return;
    }

    setIsComparing(true);
    try {
      // Simulate API call for model comparison
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockComparison = {
        models: selectedModels.map((modelName, index) => ({
          modelName,
          accuracy: 0.7 + Math.random() * 0.25,
          f1Score: 0.65 + Math.random() * 0.3,
          precision: 0.6 + Math.random() * 0.35,
          recall: 0.6 + Math.random() * 0.35,
          latency: 50 + Math.random() * 200,
          throughput: 10 + Math.random() * 90,
          memoryUsage: 100 + Math.random() * 900,
          robustness: 0.7 + Math.random() * 0.25,
          confidence: 75 + Math.random() * 20,
          datasetUsed: selectedDataset,
          timestamp: new Date().toISOString()
        })),
        metrics: ['accuracy', 'f1Score', 'precision', 'recall', 'latency', 'throughput', 'memoryUsage', 'robustness', 'confidence'],
        bestPerforming: {
          accuracy: selectedModels[0],
          f1Score: selectedModels[0],
          latency: selectedModels[0]
        },
        statisticalSignificance: {
          'model1_vs_model2_accuracy': {
            pValue: Math.random() * 0.05,
            significant: Math.random() > 0.5,
            effectSize: Math.random() * 2
          }
        }
      };

      setComparisonData(mockComparison);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const exportResults = async () => {
    if (!comparisonData) return;

    try {
      const exportData = {
        comparison: comparisonData,
        imageAnalyses: imageComparisons,
        timestamp: new Date().toISOString(),
        modelsAnalyzed: selectedModels,
        dataset: selectedDataset
      };

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `model-comparison-${Date.now()}.json`;
        a.click();
      } else if (exportFormat === 'csv') {
        const csvData = convertToCSV(exportData);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `model-comparison-${Date.now()}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertToCSV = (data: any) => {
    const headers = ['Model', 'Accuracy', 'F1-Score', 'Precision', 'Recall', 'Latency', 'Throughput', 'Memory'];
    const rows = data.comparison.models.map((model: any) => [
      model.modelName,
      model.accuracy.toFixed(4),
      model.f1Score.toFixed(4),
      model.precision.toFixed(4),
      model.recall.toFixed(4),
      model.latency.toFixed(2),
      model.throughput.toFixed(2),
      model.memoryUsage.toFixed(2)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getPerformanceColor = (value: number, metric: string) => {
    if (metric === 'latency' || metric === 'memoryUsage') {
      // Lower is better for latency and memory
      if (value < 100) return 'text-green-600 bg-green-100';
      if (value < 200) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    } else {
      // Higher is better for other metrics
      if (value > 0.8) return 'text-green-600 bg-green-100';
      if (value > 0.6) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
  };

  const renderPerformanceChart = () => {
    if (!comparisonData) return null;

    const data = {
      labels: comparisonData.models.map((m: any) => m.modelName),
      datasets: [
        {
          label: 'Accuracy',
          data: comparisonData.models.map((m: any) => m.accuracy * 100),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        },
        {
          label: 'F1-Score',
          data: comparisonData.models.map((m: any) => m.f1Score * 100),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2
        }
      ]
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Model Performance Comparison</h3>
        <Bar 
          data={data} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Accuracy and F1-Score Comparison'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }} 
        />
      </div>
    );
  };

  const renderLatencyChart = () => {
    if (!comparisonData) return null;

    const data = {
      labels: comparisonData.models.map((m: any) => m.modelName),
      datasets: [
        {
          label: 'Latency (ms)',
          data: comparisonData.models.map((m: any) => m.latency),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2
        }
      ]
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Latency Comparison</h3>
        <Bar 
          data={data} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} 
        />
      </div>
    );
  };

  const renderRadarChart = () => {
    if (!comparisonData) return null;

    const colors = ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)', 'rgb(139, 92, 246)'];

    const data = {
      labels: ['Accuracy', 'F1-Score', 'Precision', 'Recall', 'Robustness'],
      datasets: comparisonData.models.map((model: any, index: number) => ({
        label: model.modelName,
        data: [
          model.accuracy,
          model.f1Score,
          model.precision,
          model.recall,
          model.robustness
        ],
        backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)'),
        borderColor: colors[index % colors.length],
        borderWidth: 2
      }))
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Multi-Metric Radar Comparison</h3>
        <Radar 
          data={data} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              }
            },
            scales: {
              r: {
                angleLines: {
                  display: true
                },
                suggestedMin: 0,
                suggestedMax: 1
              }
            }
          }} 
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
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
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-blue-600" />
                Model Comparison Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Compare multiple AI models across performance metrics and image analysis
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runComparison}
              disabled={isComparing || selectedModels.length < 2}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isComparing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Target className="w-5 h-5" />
              )}
              {isComparing ? 'Comparing...' : 'Run Comparison'}
            </motion.button>
            
            {comparisonData && (
              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-5 h-5" />
                  Export
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Model Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600" />
            Select Models for Comparison
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {availableModels.map((model) => (
              <motion.div
                key={model}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModelSelection(model)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModels.includes(model)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{model}</span>
                  {selectedModels.includes(model) && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Max 5 models • {selectedModels.length}/5 selected
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {datasets.map((dataset) => (
                  <option key={dataset.value} value={dataset.value}>
                    {dataset.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Selected: {selectedModels.length} models
              {selectedModels.length > 0 && (
                <div className="mt-1">
                  {selectedModels.join(', ')}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'performance'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Performance Comparison
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'images'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Image Analysis Comparison
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {comparisonData ? (
                <div className="space-y-8">
                  {/* Performance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {comparisonData.models.map((model: any, index: number) => (
                      <motion.div
                        key={model.modelName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-lg p-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {model.modelName}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Accuracy</span>
                            <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(model.accuracy, 'accuracy')}`}>
                              {(model.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">F1-Score</span>
                            <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(model.f1Score, 'f1Score')}`}>
                              {(model.f1Score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Latency</span>
                            <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(model.latency, 'latency')}`}>
                              {model.latency.toFixed(0)}ms
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Memory</span>
                            <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(model.memoryUsage, 'memoryUsage')}`}>
                              {(model.memoryUsage / 1024).toFixed(1)}GB
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderPerformanceChart()}
                    {renderLatencyChart()}
                  </div>
                  
                  {renderRadarChart()}

                  {/* Detailed Metrics Table */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Detailed Metrics</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Model
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Accuracy
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              F1-Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Precision
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Recall
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Latency
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Throughput
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {comparisonData.models.map((model: any) => (
                            <tr key={model.modelName} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {model.modelName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(model.accuracy * 100).toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(model.f1Score * 100).toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(model.precision * 100).toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(model.recall * 100).toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {model.latency.toFixed(0)}ms
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {model.throughput.toFixed(1)}/s
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Comparison Data Yet
                  </h3>
                  <p className="text-gray-600">
                    Select models and run a comparison to see performance metrics and visualizations.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'images' && (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Image Analysis Comparison
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload medical images to compare diagnosis results across multiple models.
                </p>
                
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Drag and drop medical images here, or click to browse
                  </p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Select Images
                  </button>
                </div>
              </div>

              {/* Image Comparison Results */}
              {imageComparisons.length > 0 && (
                <div className="space-y-6">
                  {imageComparisons.map((comparison) => (
                    <div key={comparison.imageId} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start gap-6">
                        <img
                          src={comparison.imagePreview}
                          alt="Medical scan"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Image Analysis Results
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(comparison.modelResults).map(([modelName, result]: [string, any]) => (
                              <div key={modelName} className="border border-gray-200 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-2">{modelName}</h5>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Diagnosis:</span>
                                    <span className="ml-2">{result.diagnosis}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Confidence:</span>
                                    <span className="ml-2">{result.confidence.toFixed(1)}%</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Severity:</span>
                                    <span className="ml-2">{result.severity}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Processing Time:</span>
                                    <span className="ml-2">{result.processingTime.toFixed(0)}ms</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {comparison.consensus && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h5 className="font-semibold text-blue-900 mb-2">Consensus Diagnosis</h5>
                              <p className="text-blue-800">{comparison.consensus.diagnosis}</p>
                              <p className="text-sm text-blue-600 mt-1">
                                Confidence: {comparison.consensus.confidence.toFixed(1)}% • 
                                Model Agreement: {comparison.consensus.agreement.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}