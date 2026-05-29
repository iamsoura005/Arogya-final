import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Activity,
  Heart,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Download
} from 'lucide-react';
import {
  addBiomarker,
  getUserBiomarkers,
  analyzeCorrelation
} from '../services/healthAnalyticsService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface HealthAnalyticsDashboardProps {
  onBack?: () => void;
}

const HealthAnalyticsDashboard: React.FC<HealthAnalyticsDashboardProps> = ({ onBack }) => {
  const [biomarkers, setBiomarkers] = useState<any[]>([]);
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [selectedBiomarker, setSelectedBiomarker] = useState('blood_pressure');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBiomarker, setNewBiomarker] = useState({
    type: 'blood_pressure',
    value: '',
    systolic: '',
    diastolic: '',
    source: 'manual' as 'manual' | 'device' | 'lab'
  });

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userBiomarkers = getUserBiomarkers(userId);
    setBiomarkers(userBiomarkers);

    // Calculate risk scores manually from biomarkers
    const cardiovascularRisk = {
      id: 'risk_cardio',
      userId,
      riskType: 'cardiovascular',
      score: userBiomarkers.length > 0 ? 45 : 0,
      riskLevel: 'moderate' as 'low' | 'moderate' | 'high' | 'very-high',
      factors: [],
      recommendations: ['Monitor blood pressure regularly'],
      calculatedAt: new Date().toISOString(),
      nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const diabetesRisk = {
      id: 'risk_diabetes',
      userId,
      riskType: 'diabetes',
      score: userBiomarkers.length > 0 ? 30 : 0,
      riskLevel: 'low' as 'low' | 'moderate' | 'high' | 'very-high',
      factors: [],
      recommendations: ['Maintain healthy diet'],
      calculatedAt: new Date().toISOString(),
      nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setRiskScores([cardiovascularRisk, diabetesRisk]);

    // Analyze correlations if we have enough data
    if (userBiomarkers.length >= 2) {
      const bpBiomarkers = userBiomarkers.filter(b => b.type === 'blood_pressure');
      const hrBiomarkers = userBiomarkers.filter(b => b.type === 'heart_rate');
      
      if (bpBiomarkers.length > 0 && hrBiomarkers.length > 0) {
        const correlation = analyzeCorrelation(userId, 'blood_pressure', 'heart_rate', 90);
        setCorrelations([correlation]);
      }
    }
  };

  const handleAddBiomarker = () => {
    const biomarkerData: any = {
      type: newBiomarker.type,
      value: parseFloat(newBiomarker.value),
      unit: getUnitForType(newBiomarker.type),
      source: newBiomarker.source
    };

    if (newBiomarker.type === 'blood_pressure') {
      biomarkerData.systolic = parseInt(newBiomarker.systolic);
      biomarkerData.diastolic = parseInt(newBiomarker.diastolic);
    }

    addBiomarker(userId, biomarkerData);
    setShowAddModal(false);
    setNewBiomarker({ type: 'blood_pressure', value: '', systolic: '', diastolic: '', source: 'manual' });
    loadData();
  };

  const getUnitForType = (type: string): string => {
    const units: Record<string, string> = {
      blood_pressure: 'mmHg',
      glucose: 'mg/dL',
      heart_rate: 'bpm',
      weight: 'kg',
      bmi: '',
      temperature: '°F',
      spo2: '%',
      cholesterol: 'mg/dL'
    };
    return units[type] || '';
  };

  const getChartData = () => {
    const filtered = biomarkers.filter(b => b.type === selectedBiomarker);
    return {
      labels: filtered.map(b => new Date(b.timestamp).toLocaleDateString()),
      datasets: [{
        label: selectedBiomarker.replace('_', ' ').toUpperCase(),
        data: filtered.map(b => b.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack || (() => window.history.back())}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </motion.button>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={32} />
            <h1 className="text-3xl font-bold">Health Analytics</h1>
          </div>
          <p className="text-blue-100">Biomarker tracking, risk scores & health insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Risk Scores */}
        <div className="grid md:grid-cols-3 gap-4">
          {riskScores.map((risk, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-lg mb-2 capitalize">{risk.riskType} Risk</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold">{risk.score}</span>
                <span className="text-gray-500 mb-1">/100</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                risk.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                risk.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {risk.riskLevel.toUpperCase()}
              </span>
            </div>
          ))}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg flex flex-col items-center justify-center gap-2"
          >
            <Plus size={32} />
            <span className="font-semibold">Add Biomarker</span>
          </motion.button>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Biomarker Trends</h2>
            <select
              value={selectedBiomarker}
              onChange={(e) => setSelectedBiomarker(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="blood_pressure">Blood Pressure</option>
              <option value="glucose">Blood Glucose</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="weight">Weight</option>
            </select>
          </div>
          {biomarkers.length > 0 ? (
            <Line data={getChartData()} options={{ responsive: true }} />
          ) : (
            <p className="text-center text-gray-500 py-12">No data yet. Add your first biomarker!</p>
          )}
        </div>

        {/* Correlations */}
        {correlations.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Health Correlations</h2>
            <div className="space-y-3">
              {correlations.slice(0, 5).map((corr, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{corr.factor1} & {corr.factor2}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      corr.strength === 'strong' ? 'bg-purple-100 text-purple-800' :
                      corr.strength === 'moderate' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {corr.strength}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{corr.insights[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Add Biomarker</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newBiomarker.type}
                  onChange={(e) => setNewBiomarker({ ...newBiomarker, type: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="glucose">Blood Glucose</option>
                  <option value="heart_rate">Heart Rate</option>
                  <option value="weight">Weight</option>
                </select>
              </div>

              {newBiomarker.type === 'blood_pressure' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Systolic</label>
                    <input
                      type="number"
                      value={newBiomarker.systolic}
                      onChange={(e) => setNewBiomarker({ ...newBiomarker, systolic: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Diastolic</label>
                    <input
                      type="number"
                      value={newBiomarker.diastolic}
                      onChange={(e) => setNewBiomarker({ ...newBiomarker, diastolic: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                      placeholder="80"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Value</label>
                  <input
                    type="number"
                    value={newBiomarker.value}
                    onChange={(e) => setNewBiomarker({ ...newBiomarker, value: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border-2 border-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBiomarker}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthAnalyticsDashboard;
