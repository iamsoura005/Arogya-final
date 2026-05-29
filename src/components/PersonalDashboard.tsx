import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  Heart, 
  AlertCircle,
  BarChart3,
  PieChart,
  Download,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface HealthRecord {
  id: string;
  date: string;
  type: 'symptom' | 'image' | 'chat' | 'voice';
  symptoms?: string[];
  diagnosis?: string;
  severity?: string;
  confidence?: number;
}

interface PersonalDashboardProps {
  onBack?: () => void;
}

export default function PersonalDashboard({ onBack }: PersonalDashboardProps) {
  const { user } = useContext(AuthContext);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'symptom' | 'image' | 'chat' | 'voice'>('all');

  useEffect(() => {
    // Load health records from localStorage
    const storedRecords = localStorage.getItem(`healthRecords_${user?.email}`);
    if (storedRecords) {
      setHealthRecords(JSON.parse(storedRecords));
    } else {
      // Demo data for visualization
      const demoData: HealthRecord[] = [
        {
          id: '1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'symptom',
          symptoms: ['Fever', 'Cough', 'Headache'],
          diagnosis: 'Common Cold',
          severity: 'Moderate',
          confidence: 75
        },
        {
          id: '2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'image',
          diagnosis: 'Skin Rash',
          severity: 'Mild',
          confidence: 82
        },
        {
          id: '3',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'symptom',
          symptoms: ['Nausea', 'Fatigue', 'Dizziness'],
          diagnosis: 'Food Poisoning',
          severity: 'Moderate',
          confidence: 68
        },
        {
          id: '4',
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'chat',
          diagnosis: 'Seasonal Allergies',
          severity: 'Mild',
          confidence: 90
        },
        {
          id: '5',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'symptom',
          symptoms: ['Sore Throat', 'Congestion'],
          diagnosis: 'Upper Respiratory Infection',
          severity: 'Mild',
          confidence: 78
        }
      ];
      setHealthRecords(demoData);
    }
  }, [user]);

  // Filter records by type
  const filteredRecords = selectedFilter === 'all' 
    ? healthRecords 
    : healthRecords.filter(r => r.type === selectedFilter);

  // Get symptom frequency data
  const symptomFrequency = healthRecords
    .filter(r => r.symptoms)
    .flatMap(r => r.symptoms || [])
    .reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get severity distribution
  const severityCount = healthRecords.reduce((acc, r) => {
    if (r.severity) {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get consultation type distribution
  const typeCount = healthRecords.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxSymptomCount = Math.max(...topSymptoms.map(([, count]) => count), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          )}
          <h1 className="text-3xl font-bold bg-gradient-teal bg-clip-text text-transparent mb-2">
            Personal Health Dashboard
          </h1>
          <p className="text-gray-600">Track your health history and insights</p>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <button
            onClick={() => setSelectedTimeframe('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTimeframe === 'week'
                ? 'bg-gradient-teal text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setSelectedTimeframe('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTimeframe === 'month'
                ? 'bg-gradient-teal text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setSelectedTimeframe('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTimeframe === 'year'
                ? 'bg-gradient-teal text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last Year
          </button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-600"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-teal-600" />
              <span className="text-2xl font-bold text-gray-800">{healthRecords.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Consultations</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600"
          >
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-800">
                {healthRecords.filter(r => r.symptoms).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Symptom Checks</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-600"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-pink-600" />
              <span className="text-2xl font-bold text-gray-800">
                {healthRecords.filter(r => r.severity === 'Moderate' || r.severity === 'Severe').length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Moderate+ Severity</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">
                {healthRecords.length > 0 
                  ? Math.round(healthRecords.reduce((sum, r) => sum + (r.confidence || 0), 0) / healthRecords.length)
                  : 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Avg Confidence</h3>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Symptoms Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-6 h-6 text-teal-600 mr-2" />
                Most Common Symptoms
              </h2>
            </div>
            
            <div className="space-y-4">
              {topSymptoms.length > 0 ? (
                topSymptoms.map(([symptom, count], idx) => (
                  <div key={symptom}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{symptom}</span>
                      <span className="text-sm font-bold text-teal-600">{count} times</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxSymptomCount) * 100}%` }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No symptom data available</p>
              )}
            </div>
          </motion.div>

          {/* Severity Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <PieChart className="w-6 h-6 text-purple-600 mr-2" />
                Severity Distribution
              </h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(severityCount).map(([severity, count], idx) => {
                const total = Object.values(severityCount).reduce((a, b) => a + b, 0);
                const percentage = Math.round((count / total) * 100);
                const color = 
                  severity === 'Severe' ? 'from-red-500 to-red-600' :
                  severity === 'Moderate' ? 'from-orange-500 to-orange-600' :
                  'from-green-500 to-green-600';
                
                return (
                  <div key={severity}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{severity}</span>
                      <span className="text-sm font-bold text-purple-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
                        className={`bg-gradient-to-r ${color} h-3 rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Consultation Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Activity className="w-6 h-6 text-pink-600 mr-2" />
              Consultation Types
            </h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(typeCount).map(([type, count]) => {
              const total = Object.values(typeCount).reduce((a, b) => a + b, 0);
              const percentage = Math.round((count / total) * 100);
              const typeLabels: Record<string, string> = {
                symptom: 'Symptom Checker',
                image: 'Image Analysis',
                chat: 'Chat Consultation',
                voice: 'Voice Consultation'
              };
              const typeColors: Record<string, string> = {
                symptom: 'from-purple-500 to-purple-600',
                image: 'from-blue-500 to-blue-600',
                chat: 'from-teal-500 to-teal-600',
                voice: 'from-pink-500 to-pink-600'
              };
              
              return (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r ${typeColors[type]} flex items-center justify-center text-white font-bold text-xl`}>
                    {count}
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">{typeLabels[type]}</p>
                  <p className="text-lg font-bold text-gray-800">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="w-6 h-6 text-teal-600 mr-2" />
              Recent Consultations
            </h2>
            <div className="flex gap-2">
              {(['all', 'symptom', 'image', 'chat', 'voice'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-gradient-teal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        record.type === 'symptom' ? 'bg-purple-100 text-purple-700' :
                        record.type === 'image' ? 'bg-blue-100 text-blue-700' :
                        record.type === 'chat' ? 'bg-teal-100 text-teal-700' :
                        'bg-pink-100 text-pink-700'
                      }`}>
                        {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {record.symptoms && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Symptoms:</strong> {record.symptoms.join(', ')}
                    </p>
                  )}
                  
                  {record.diagnosis && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {record.severity && (
                      <span className={`font-semibold ${
                        record.severity === 'Severe' ? 'text-red-600' :
                        record.severity === 'Moderate' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {record.severity}
                      </span>
                    )}
                    {record.confidence && (
                      <span>Confidence: {record.confidence}%</span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No records found for this filter</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
