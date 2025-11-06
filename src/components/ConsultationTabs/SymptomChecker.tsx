import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertCircle, Pill } from 'lucide-react';
import { useState } from 'react';
import { detectDiseases, getSymptomRecommendations } from '../../services/diseaseDatabase';

interface SymptomCheckerProps {
  onClose: () => void;
}

const SYMPTOM_OPTIONS = [
  'Fever', 'Cough', 'Sore Throat', 'Headache', 'Body Ache', 'Fatigue',
  'Nausea', 'Vomiting', 'Diarrhea', 'Rash', 'Itching', 'Chest Pain',
  'Shortness of Breath', 'Dizziness', 'Loss of Appetite', 'Chills',
  'Sweating', 'Congestion', 'Sneezing', 'Watery Eyes'
];

export default function SymptomChecker({ onClose }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [detectedDiseases, setDetectedDiseases] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyze = () => {
    const diseases = detectDiseases(selectedSymptoms);
    setDetectedDiseases(diseases);
    
    const recs = getSymptomRecommendations(selectedSymptoms);
    setRecommendations(recs);
    
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setShowResults(false);
    setDetectedDiseases([]);
    setRecommendations(null);
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
              {SYMPTOM_OPTIONS.map((symptom) => (
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
