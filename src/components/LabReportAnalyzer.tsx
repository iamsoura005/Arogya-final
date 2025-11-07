import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Trash2,
  Eye,
  Calendar,
  Activity,
  Beaker,
  Info,
  Key
} from 'lucide-react';
import {
  analyzeLabReport,
  getLabReports,
  deleteLabReport,
  compareLabReports,
  exportLabReportPDF,
  LabResult,
  Biomarker
} from '../services/labReportService';

interface LabReportAnalyzerProps {
  onBack?: () => void;
}

const LabReportAnalyzer: React.FC<LabReportAnalyzerProps> = ({ onBack }) => {
  const [reports, setReports] = useState<LabResult[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareReport1, setCompareReport1] = useState<LabResult | null>(null);
  const [compareReport2, setCompareReport2] = useState<LabResult | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadReports();
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const loadReports = () => {
    const userReports = getLabReports(userId);
    setReports(userReports);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setAnalyzing(true);

    try {
      const result = await analyzeLabReport(file);
      setReports(prev => [result, ...prev]);
      setSelectedReport(result);
      setAnalyzing(false);
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to analyze report. Please try again.');
      setAnalyzing(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteLabReport(userId, reportId);
      loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  const handleCompare = () => {
    if (reports.length < 2) {
      alert('You need at least 2 reports to compare');
      return;
    }
    setCompareMode(true);
    setCompareReport1(reports[0]);
    setCompareReport2(reports[1]);
  };

  const saveApiKey = () => {
    localStorage.setItem('geminiApiKey', apiKey);
    setShowApiKeyModal(false);
    alert('API Key saved! You can now use real AI analysis.');
  };

  const getStatusColor = (status: Biomarker['status']) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'borderline':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'abnormal':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack || (() => window.history.back())}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Beaker size={32} />
                <h1 className="text-3xl font-bold">Lab Report Analyzer</h1>
              </div>
              <p className="text-blue-100">AI-powered medical lab report analysis with Gemini Vision</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowApiKeyModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Key size={20} />
              <span>API Key</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApiKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Key size={24} className="text-blue-600" />
                Configure Gemini API Key
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Enter your Google Gemini API key to enable real AI analysis. Without this, demo data will be shown.
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  onClick={saveApiKey}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Key
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm mt-3 block text-center hover:underline"
              >
                Get API Key from Google AI Studio →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Upload size={24} className="text-blue-600" />
            Upload Lab Report
          </h2>
          <p className="text-gray-600 mb-6">
            Upload your lab report (blood test, lipid panel, metabolic panel, etc.) as an image or PDF
          </p>

          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="lab-report-upload"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="lab-report-upload"
              className="cursor-pointer block"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-lg font-semibold text-blue-600">
                    {analyzing ? 'Analyzing with AI...' : 'Uploading...'}
                  </p>
                </div>
              ) : (
                <>
                  <Upload size={48} className="mx-auto text-blue-600 mb-3" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: JPG, PNG, PDF (Max 10MB)
                  </p>
                </>
              )}
            </label>
          </div>

          {reports.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompare}
              className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
            >
              <Activity size={20} />
              Compare Reports
            </motion.button>
          )}
        </motion.div>

        {/* Selected Report Detail */}
        {selectedReport && !compareMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedReport.reportType}</h2>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportLabReportPDF(selectedReport)}
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                >
                  <Download size={20} />
                  Export
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  Delete
                </motion.button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <span>{new Date(selectedReport.uploadDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={20} />
                <span>{selectedReport.fileName}</span>
              </div>
            </div>

            {/* Risk Level */}
            <div className={`border-2 rounded-xl p-4 mb-6 ${getRiskColor(selectedReport.analysis.overallRisk)}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} />
                <span className="font-bold text-lg">Overall Risk: {selectedReport.analysis.overallRisk.toUpperCase()}</span>
              </div>
              <p>{selectedReport.analysis.summary}</p>
            </div>

            {/* Biomarkers */}
            <h3 className="text-xl font-bold mb-4">Biomarkers</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedReport.biomarkers.map((marker, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-lg p-4 ${getStatusColor(marker.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold">{marker.name}</h4>
                    {marker.status === 'normal' && <CheckCircle size={20} />}
                    {marker.status === 'borderline' && <Info size={20} />}
                    {marker.status === 'abnormal' && <AlertTriangle size={20} />}
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {marker.value} {marker.unit}
                  </p>
                  <p className="text-sm opacity-75">Normal: {marker.normalRange}</p>
                  <p className="text-xs mt-2 opacity-60">{marker.category}</p>
                </motion.div>
              ))}
            </div>

            {/* Concerns */}
            {selectedReport.analysis.concerns.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                  <AlertTriangle size={24} />
                  Health Concerns
                </h3>
                <ul className="space-y-2">
                  {selectedReport.analysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600">
                <CheckCircle size={24} />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {selectedReport.analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Compare Mode */}
        {compareMode && compareReport1 && compareReport2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Compare Reports</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCompareMode(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close Comparison
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <select
                  value={compareReport1.id}
                  onChange={(e) => {
                    const report = reports.find(r => r.id === e.target.value);
                    if (report) setCompareReport1(report);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                >
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.reportType} - {new Date(r.uploadDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={compareReport2.id}
                  onChange={(e) => {
                    const report = reports.find(r => r.id === e.target.value);
                    if (report) setCompareReport2(report);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                >
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.reportType} - {new Date(r.uploadDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(() => {
              const changes = compareLabReports(compareReport1, compareReport2);
              return (
                <div className="space-y-4">
                  {changes.map((change: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">{change.name}</h4>
                        <div className="flex items-center gap-2">
                          {change.trend === 'up' && <TrendingUp className="text-red-600" size={20} />}
                          {change.trend === 'down' && <TrendingDown className="text-green-600" size={20} />}
                          {change.trend === 'stable' && <Minus className="text-gray-600" size={20} />}
                          <span className={`font-bold ${change.trend === 'up' ? 'text-red-600' : change.trend === 'down' ? 'text-green-600' : 'text-gray-600'}`}>
                            {change.percentChange}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Previous</p>
                          <p className="text-xl font-bold">{change.oldValue}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(change.oldStatus)}`}>
                            {change.oldStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current</p>
                          <p className="text-xl font-bold">{change.newValue}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(change.newStatus)}`}>
                            {change.newStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Reports History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Report History</h2>
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reports uploaded yet</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedReport(report);
                    setCompareMode(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{report.reportType}</h3>
                      <p className="text-gray-600 text-sm">{new Date(report.uploadDate).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${getRiskColor(report.analysis.overallRisk)}`}>
                      {report.analysis.overallRisk.toUpperCase()} RISK
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LabReportAnalyzer;
