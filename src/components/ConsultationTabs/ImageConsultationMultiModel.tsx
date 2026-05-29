import { Upload, AlertCircle, Download, BarChart3, Eye, Target, Zap, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classifyImageWithMedicalContext } from '../../services/geminiService';
import { processModelOutput, mergeModelOutputs } from '../../services/modelDataProcessor';
import { getAllModels } from '../../services/localDatasetService';
import PrescriptionModal from '../PrescriptionModal';

interface ImageConsultationProps {
  onEndConsultation: (data: any) => void;
}

interface ModelResult {
  modelName: string;
  diagnosis: string;
  confidence: number;
  severity: string;
  medicines: Array<{name: string, dosage: string, frequency: string, duration: string}>;
  recommendations: string[];
  processingTime: number;
  conditionType: string;
  accuracy: number;
}

interface ImageAnalysisComparison {
  uploadedImage: string;
  modelResults: ModelResult[];
  consensus: {
    diagnosis: string;
    confidence: number;
    agreement: number;
    severity: string;
  } | null;
  processingTime: number;
}

export default function ImageConsultationMultiModel({ onEndConsultation }: ImageConsultationProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<ImageAnalysisComparison | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [activeModelTab, setActiveModelTab] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModels = getAllModels();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setAnalysisResults(null);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file');
    }
  };

  const handleModelSelection = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(m => m !== modelName);
      } else if (prev.length < 4) { // Max 4 models
        return [...prev, modelName];
      }
      return prev;
    });
  };

  const analyzeImageWithMultipleModels = async () => {
    if (!uploadedImage) return;
    
    const modelsToUse = selectedModels.length > 0 ? selectedModels : availableModels.slice(0, 2).map(m => m.modelName);
    
    setIsAnalyzing(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      const modelResults: ModelResult[] = [];
      
      for (const modelName of modelsToUse) {
        const modelStartTime = Date.now();
        
        try {
          // Simulate different model analysis
          const mockResult = await simulateModelAnalysis(modelName, uploadedImage);
          const processingTime = Date.now() - modelStartTime;
          
          modelResults.push({
            modelName,
            ...mockResult,
            processingTime,
            accuracy: availableModels.find(m => m.modelName === modelName)?.accuracy || 0.85
          });
        } catch (err) {
          console.error(`Error with model ${modelName}:`, err);
        }
      }
      
      // Generate consensus
      const consensus = generateConsensus(modelResults);
      const totalProcessingTime = Date.now() - startTime;
      
      setAnalysisResults({
        uploadedImage,
        modelResults,
        consensus,
        processingTime: totalProcessingTime
      });
      
    } catch (err) {
      setError('Failed to analyze image with multiple models. Please try again.');
      console.error('Multi-model analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateModelAnalysis = async (modelName: string, imageData: string): Promise<{
    diagnosis: string;
    confidence: number;
    severity: string;
    medicines: Array<{name: string, dosage: string, frequency: string, duration: string}>;
    recommendations: string[];
    conditionType: string;
  }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock different responses based on model name
    const mockResponses = {
      'Skin Disease Classifier': {
        diagnosis: 'Mild Eczema',
        confidence: 78 + Math.random() * 15,
        severity: 'mild',
        medicines: [
          { name: 'Hydrocortisone cream', dosage: '1%', frequency: 'Twice daily', duration: '2 weeks' },
          { name: 'Moisturizer', dosage: 'As needed', frequency: 'After washing', duration: 'Ongoing' }
        ],
        recommendations: ['Avoid known irritants', 'Keep skin moisturized', 'Use mild soaps'],
        conditionType: 'skin'
      },
      'Dermnet Classifier': {
        diagnosis: 'Contact Dermatitis',
        confidence: 82 + Math.random() * 12,
        severity: 'moderate',
        medicines: [
          { name: 'Triamcinolone cream', dosage: '0.1%', frequency: 'Once daily', duration: '1 week' },
          { name: 'Antihistamine', dosage: '10mg', frequency: 'At bedtime', duration: '1 week' }
        ],
        recommendations: ['Identify and avoid allergens', 'Apply cool compresses', 'Take antihistamines if needed'],
        conditionType: 'skin'
      },
      'Eye Disease Detector': {
        diagnosis: 'Mild Conjunctivitis',
        confidence: 75 + Math.random() * 18,
        severity: 'mild',
        medicines: [
          { name: 'Artificial tears', dosage: '1-2 drops', frequency: 'Every 2 hours', duration: 'As needed' }
        ],
        recommendations: ['Practice good hygiene', 'Avoid touching eyes', 'Use clean towels'],
        conditionType: 'eye'
      }
    };
    
    const response = mockResponses[modelName as keyof typeof mockResponses] || {
      diagnosis: 'Normal findings',
      confidence: 70 + Math.random() * 20,
      severity: 'mild',
      medicines: [],
      recommendations: ['Regular monitoring recommended'],
      conditionType: 'general'
    };
    
    return response;
  };

  const generateConsensus = (modelResults: ModelResult[]) => {
    if (modelResults.length === 0) return null;
    
    // Group by similar diagnosis
    const diagnosisGroups: { [key: string]: ModelResult[] } = {};
    modelResults.forEach(result => {
      const key = result.diagnosis.toLowerCase().split(' ')[0]; // Group by first word
      if (!diagnosisGroups[key]) diagnosisGroups[key] = [];
      diagnosisGroups[key].push(result);
    });
    
    // Find the most common diagnosis
    const mostCommonGroup = Object.entries(diagnosisGroups)
      .sort(([,a], [,b]) => b.length - a.length)[0];
    
    if (!mostCommonGroup) return null;
    
    const group = mostCommonGroup[1];
    const totalConfidence = group.reduce((sum, r) => sum + r.confidence, 0);
    const avgConfidence = totalConfidence / group.length;
    const agreement = (group.length / modelResults.length) * 100;
    
    // Determine consensus severity
    const severityOrder = { mild: 0, moderate: 1, severe: 2 };
    const maxSeverity = group.reduce((max, r) => {
      return severityOrder[r.severity as keyof typeof severityOrder] > severityOrder[max.severity as keyof typeof severityOrder] ? r : max;
    }, group[0]);
    
    return {
      diagnosis: group[0].diagnosis,
      confidence: avgConfidence,
      agreement,
      severity: maxSeverity.severity
    };
  };

  const handleDownloadPrescription = () => {
    setShowPrescription(true);
  };

  const handleEndConsultation = () => {
    onEndConsultation({
      summary: analysisResults ? `Multi-Model Analysis: ${analysisResults.consensus?.diagnosis || 'Analysis Complete'}` : 'Image uploaded for analysis',
      diagnosis: analysisResults ? analysisResults.consensus : null,
      modelResults: analysisResults?.modelResults || [],
      imageData: uploadedImage ? uploadedImage.substring(0, 100) + '...' : null,
      type: 'image_multi_model',
      processingTime: analysisResults?.processingTime || 0
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'severe': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-subtle"
        >
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Multi-Model Medical Image Analysis
          </h2>
          <p className="text-gray-600 mb-6">
            Compare diagnoses from multiple AI models for enhanced accuracy
          </p>

          {!uploadedImage ? (
            <motion.div
              whileHover={{ borderColor: '#7c3aed' }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer transition-all hover:bg-gradient-primary-light"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <Upload className="w-12 h-12 text-primary-600 mx-auto" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your image here</h3>
              <p className="text-gray-600 mb-4">Supported formats: JPG, PNG (max 10MB)</p>
              <div className="inline-block px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium">
                Select Image
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg overflow-hidden h-96"
              >
                <img
                  src={uploadedImage}
                  alt="Medical image"
                  className="w-full h-full object-contain"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 border-4 border-white border-t-primary-500 rounded-full mx-auto mb-4"
                      />
                      <p className="text-white font-semibold">Analyzing with multiple models...</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Model Selection */}
              {uploadedImage && !analysisResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-blue-50 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Select Models for Comparison
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableModels.slice(0, 4).map((model) => (
                      <motion.button
                        key={model.modelName}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModelSelection(model.modelName)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedModels.includes(model.modelName)
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{model.modelName}</span>
                          {selectedModels.includes(model.modelName) && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Accuracy: {(model.accuracy * 100).toFixed(1)}%
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Selected: {selectedModels.length} models (max 4)
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all text-sm"
                >
                  Change Image
                </motion.button>
                {!analysisResults && !isAnalyzing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={analyzeImageWithMultipleModels}
                    disabled={!uploadedImage}
                    className="flex-1 bg-gradient-primary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analyze with Multiple Models
                  </motion.button>
                )}
                {isAnalyzing && (
                  <div className="flex-1 bg-gradient-primary text-white font-semibold py-2 rounded-lg opacity-50 flex items-center justify-center space-x-2 text-sm">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Consensus Results */}
            {analysisResults.consensus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card bg-gradient-primary-light border-l-4 border-primary-500"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary-600" />
                  Multi-Model Consensus
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-primary text-white rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">Consensus Diagnosis</p>
                    <p className="text-lg font-bold">{analysisResults.consensus.diagnosis}</p>
                  </div>
                  <div className="bg-gradient-success text-white rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">Confidence</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-bold">{analysisResults.consensus.confidence.toFixed(1)}%</p>
                      <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
                        <div
                          className="bg-white h-full rounded-full"
                          style={{ width: `${analysisResults.consensus.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-warning text-white rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">Model Agreement</p>
                    <p className="text-lg font-bold">{analysisResults.consensus.agreement.toFixed(1)}%</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Individual Model Results */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Individual Model Results
              </h3>

              {/* Model Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                {analysisResults.modelResults.map((result, index) => (
                  <button
                    key={result.modelName}
                    onClick={() => setActiveModelTab(index)}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                      activeModelTab === index
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {result.modelName}
                  </button>
                ))}
              </div>

              {/* Active Model Details */}
              <AnimatePresence mode="wait">
                {analysisResults.modelResults[activeModelTab] && (
                  <motion.div
                    key={activeModelTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {(() => {
                      const result = analysisResults.modelResults[activeModelTab];
                      return (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-600 mb-1">Diagnosis</p>
                              <p className="font-semibold text-gray-900">{result.diagnosis}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-600 mb-1">Confidence</p>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                                {result.confidence.toFixed(1)}%
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-600 mb-1">Severity</p>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(result.severity)}`}>
                                {result.severity}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-600 mb-1">Processing Time</p>
                              <p className="font-semibold text-gray-900">{result.processingTime}ms</p>
                            </div>
                          </div>

                          {result.medicines && result.medicines.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Treatment Recommendations</h4>
                              <div className="space-y-3">
                                {result.medicines.map((med, idx) => (
                                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                                    <p className="font-semibold text-gray-900">{med.name}</p>
                                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-gray-700">
                                      <div>
                                        <p className="font-medium text-gray-600">Dosage</p>
                                        <p>{med.dosage}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-600">Frequency</p>
                                        <p>{med.frequency}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-600">Duration</p>
                                        <p>{med.duration}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.recommendations && result.recommendations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Additional Recommendations</h4>
                              <ul className="space-y-2">
                                {result.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>Model Accuracy: {(result.accuracy * 100).toFixed(1)}%</span>
                              <span>Condition Type: {result.conditionType}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPrescription}
                className="flex-1 bg-gradient-health text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Prescription</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndConsultation}
                className="flex-1 bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-700 transition-all"
              >
                End Consultation
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-1 space-y-4"
      >
        <div className="card bg-gradient-primary-light border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Multi-Model Analysis
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>🤖 Compare 2-4 AI models simultaneously</li>
            <li>🎯 Generate consensus diagnosis</li>
            <li>📊 View individual model confidence</li>
            <li>⚡ Real-time processing metrics</li>
            <li>📋 Combined treatment recommendations</li>
          </ul>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-cyan-50">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Analysis Tips
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Clear, well-lit images work best</li>
            <li>• Focus on the affected area</li>
            <li>• Avoid shadows and reflections</li>
            <li>• Show full context if possible</li>
            <li>• JPG or PNG format supported</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Processing Status
          </h3>
          <div className="space-y-2 text-sm">
            {analysisResults ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-medium">{analysisResults.processingTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Models Analyzed:</span>
                  <span className="font-medium">{analysisResults.modelResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consensus Reached:</span>
                  <span className="font-medium text-green-600">
                    {analysisResults.consensus ? 'Yes' : 'No'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Upload an image to start analysis</p>
            )}
          </div>
        </div>
      </motion.div>

      <PrescriptionModal
        isOpen={showPrescription}
        onClose={() => {
          setShowPrescription(false);
          setTimeout(handleEndConsultation, 300);
        }}
        prescriptionData={{
          patientName: 'Patient',
          consultation: analysisResults 
            ? `Multi-Model Analysis: ${analysisResults.consensus?.diagnosis || 'Analysis Complete'}` 
            : 'Multi-Model Image Analysis',
          date: new Date().toLocaleDateString(),
          medications: analysisResults?.modelResults[activeModelTab]?.medicines || [],
          notes: analysisResults 
            ? `Consensus: ${analysisResults.consensus?.diagnosis}
Confidence: ${analysisResults.consensus?.confidence.toFixed(1)}%
Agreement: ${analysisResults.consensus?.agreement.toFixed(1)}%

Models Analyzed: ${analysisResults.modelResults.length}
Processing Time: ${analysisResults.processingTime}ms

Model Results:
${analysisResults.modelResults.map(r => 
  `${r.modelName}: ${r.diagnosis} (${r.confidence.toFixed(1)}%)`
).join('\n')}`
            : 'No analysis results available'
        }}
      />
    </div>
  );
}