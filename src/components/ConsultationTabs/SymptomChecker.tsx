import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertCircle, Pill, Activity, CheckCircle, Brain, Heart } from 'lucide-react';
import { detectDiseases, getSymptomRecommendations } from '../../services/diseaseDatabase';
import { 
  analyzeBERTEmotionalContext, 
  generateBERTEnhancedAdvice,
  calculateRecommendationConfidence 
} from '../../services/bertService';

interface SymptomCheckerProps {
  onClose: () => void;
}

const commonSymptoms = [
  'Fever',
  'Cough',
  'Headache',
  'Fatigue',
  'Body Ache',
  'Sore Throat',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Shortness of Breath',
  'Chest Pain',
  'Loss of Appetite',
  'Dizziness',
  'Rash',
  'Itching',
  'Chills',
  'Sneezing',
  'Watery Eyes',
  'Congestion',
  'Severe Headache',
];

export default function SymptomChecker({ onClose }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [detectedDiseases, setDetectedDiseases] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [bertAnalysis, setBertAnalysis] = useState<any>(null);
  const [enhancedAdvice, setEnhancedAdvice] = useState<any>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyze = () => {
    // Traditional disease detection
    const diseases = detectDiseases(selectedSymptoms);
    setDetectedDiseases(diseases);
    
    const recs = getSymptomRecommendations(selectedSymptoms);
    setRecommendations(recs);
    
    // BERT-enhanced emotional and contextual analysis
    const bertResult = analyzeBERTEmotionalContext({ symptoms: selectedSymptoms });
    setBertAnalysis(bertResult);
    
    // Generate emotionally intelligent advice
    const advice = generateBERTEnhancedAdvice(selectedSymptoms, diseases, bertResult);
    setEnhancedAdvice(advice);
    
    // Calculate confidence score
    const confidence = calculateRecommendationConfidence(selectedSymptoms, diseases);
    setConfidenceScore(confidence);
    
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setShowResults(false);
    setDetectedDiseases([]);
    setRecommendations(null);
    setBertAnalysis(null);
    setEnhancedAdvice(null);
    setConfidenceScore(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="card bg-gradient-subtle"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-teal bg-clip-text text-transparent">Symptom Checker</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm text-gray-600 mb-4">Select all symptoms you're experiencing:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-72 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {commonSymptoms.map((symptom) => (
                <motion.button
                  key={symptom}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`p-2 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium ${
                    selectedSymptoms.includes(symptom)
                      ? 'border-teal-600 bg-gradient-teal text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {symptom}
                </motion.button>
              ))}
            </div>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={selectedSymptoms.length > 0 ? { scale: 1.05 } : {}}
                whileTap={selectedSymptoms.length > 0 ? { scale: 0.95 } : {}}
                onClick={handleAnalyze}
                disabled={selectedSymptoms.length === 0}
                className="flex-1 bg-gradient-teal text-white font-semibold py-2 rounded-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                <span>Analyze Symptoms</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-l-4 border-teal-600">
              <h4 className="font-semibold text-teal-900 mb-2 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Analysis Results</span>
              </h4>
              {detectedDiseases.length > 0 ? (
                <div className="text-sm text-teal-800">
                  <p className="mb-2"><strong>Possible Conditions:</strong></p>
                  {detectedDiseases.map((disease, idx) => (
                    <div key={idx} className="ml-2 mb-1">
                      <p className="font-medium">{disease.name}</p>
                      <p className="text-xs">Severity: {disease.severity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-teal-800">Unable to detect specific conditions. Please consult a healthcare professional.</p>
              )}
            </div>

            {/* BERT Analysis - Emotional Intelligence Section */}
            {bertAnalysis && (
              <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300 shadow-sm">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>AI-Powered Contextual Analysis</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Emotional Tone</p>
                    <p className={`font-semibold text-sm ${
                      bertAnalysis.emotionalTone === 'urgent' ? 'text-red-600' :
                      bertAnalysis.emotionalTone === 'anxious' ? 'text-orange-600' :
                      bertAnalysis.emotionalTone === 'concerned' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {bertAnalysis.emotionalTone.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Urgency Level</p>
                    <p className={`font-semibold text-sm ${
                      bertAnalysis.urgencyLevel === 'immediate' ? 'text-red-600' :
                      bertAnalysis.urgencyLevel === 'soon' ? 'text-orange-600' :
                      bertAnalysis.urgencyLevel === 'routine' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {bertAnalysis.urgencyLevel.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Severity Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            bertAnalysis.severityScore >= 8 ? 'bg-red-600' :
                            bertAnalysis.severityScore >= 5 ? 'bg-orange-500' :
                            bertAnalysis.severityScore >= 3 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${bertAnalysis.severityScore * 10}%` }}
                        />
                      </div>
                      <span className="font-semibold text-sm">{bertAnalysis.severityScore}/10</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Confidence</p>
                    <p className="font-semibold text-sm text-purple-600">{confidenceScore}%</p>
                  </div>
                </div>

                {bertAnalysis.contextualInsights && bertAnalysis.contextualInsights.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-purple-200 mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Contextual Insights:</p>
                    <ul className="space-y-1">
                      {bertAnalysis.contextualInsights.map((insight: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Emotionally Intelligent Advice Section */}
            {enhancedAdvice && (
              <div className="mb-6 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-2 border-pink-300 shadow-sm">
                <h4 className="font-bold text-pink-900 mb-3 flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                  <span>Personalized Guidance</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-pink-200">
                    <p className="text-sm text-gray-800 leading-relaxed">{enhancedAdvice.introduction}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-pink-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Emotional Support:</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{enhancedAdvice.emotionalSupport}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-pink-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Recommended Actions:</p>
                    <ul className="space-y-1">
                      {enhancedAdvice.actionSteps.map((step: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-800 flex items-start space-x-2">
                          <span className="text-pink-600 font-bold mt-0.5">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-pink-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Monitoring:</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{enhancedAdvice.monitoringAdvice}</p>
                  </div>

                  <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-3 rounded-lg border-2 border-pink-300">
                    <p className="text-sm font-medium text-pink-900 leading-relaxed">{enhancedAdvice.reassurance}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Response Message */}
            {bertAnalysis && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 leading-relaxed italic">
                  {bertAnalysis.recommendedResponse}
                </p>
              </div>
            )}

            {detectedDiseases.length > 0 && detectedDiseases[0].medicines && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center space-x-2">
                  <Pill className="w-5 h-5" />
                  <span>Recommended Medicines</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detectedDiseases[0].medicines.map((med, idx) => (
                    <div key={idx} className="text-sm bg-white p-2 rounded border-l-2 border-amber-500">
                      <p className="font-semibold text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-600">
                        Dosage: {med.dosage}
                      </p>
                      <p className="text-xs text-gray-600">
                        Frequency: {med.frequency} | Duration: {med.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detectedDiseases.length > 0 && detectedDiseases[0].homeRemedies && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Home Remedies</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  {detectedDiseases[0].homeRemedies.map((remedy, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detectedDiseases.length > 0 && detectedDiseases[0].redFlags && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3">⚠️ Red Flags - Seek Emergency Help If:</h4>
                <ul className="space-y-1 text-sm text-red-800">
                  {detectedDiseases[0].redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-red-600 mt-0.5">!</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex-1 bg-gradient-teal text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Check Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-700 transition-all"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
