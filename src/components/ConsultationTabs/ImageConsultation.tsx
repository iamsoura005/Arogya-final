import { Upload, AlertCircle, Download } from 'lucide-react';
import { useState, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { classifyImageWithMedicalContext } from '../../services/geminiService';
import PrescriptionModal from '../PrescriptionModal';
import { AuthContext } from '../../context/AuthContext';
import { generateImageAnalysisReport } from '../../utils/pdfGenerator';

interface ImageConsultationProps {
  onEndConsultation: (data: any) => void;
}

interface MedicalDiagnosis {
  diagnosis: string;
  confidence: number;
  conditionType: string;
  medicines: Array<{name: string, dosage: string, frequency: string, duration: string}>;
  recommendations: string[];
  severity: string;
  specialistNeeded: string;
  datasetEnhanced?: boolean;
  datasetInsights?: string[];
  errorDetails?: {
    code: string;
    technicalMessage: string;
    userMessage: string;
  };
}

export default function ImageConsultation({ onEndConsultation }: ImageConsultationProps) {
  const { user } = useContext(AuthContext);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<MedicalDiagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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
        setDiagnosis(null);
        analyzeImageAsync(result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file');
    }
  };

  const analyzeImageAsync = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await classifyImageWithMedicalContext(imageData);
      setDiagnosis(result);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Image analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPrescription = () => {
    if (!diagnosis || !user) {
      alert('No diagnosis available or user not logged in');
      return;
    }

    generateImageAnalysisReport({
      user: user,
      date: new Date().toLocaleDateString(),
      reportType: 'Image Analysis',
      diagnosis: diagnosis.diagnosis,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      description: `Condition Type: ${diagnosis.conditionType}. ${diagnosis.datasetInsights?.join(' ') || ''}`,
      treatment: diagnosis.recommendations?.join('. ') || 'No specific recommendations provided.',
      precautions: diagnosis.medicines?.map(m => `${m.name} - ${m.dosage}, ${m.frequency} for ${m.duration}`) || []
    });
  };

  const handleEndConsultation = () => {
    onEndConsultation({
      summary: diagnosis ? `Image Analysis: ${diagnosis.diagnosis}` : 'Image uploaded for analysis',
      diagnosis: diagnosis,
      imageData: uploadedImage ? uploadedImage.substring(0, 100) + '...' : null,
      type: 'image'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-subtle"
        >
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Medical Image Analysis</h2>
          <p className="text-gray-600 mb-6">Upload an image for advanced AI-powered medical analysis</p>

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
              <p className="text-gray-600 mb-4">Supported formats: JPG, PNG</p>
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
                      <p className="text-white font-semibold">Analyzing image...</p>
                    </div>
                  </div>
                )}
              </motion.div>

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
                {!diagnosis && !isAnalyzing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => analyzeImageAsync(uploadedImage!)}
                    className="flex-1 bg-gradient-primary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    Analyze Image
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

        {diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card bg-gradient-primary-light border-l-4 border-primary-500"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Medical Analysis Report</h3>

            {/* Enhanced Error Display */}
            {diagnosis.errorDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900 mb-1">
                      Error {diagnosis.errorDetails.code}
                    </p>
                    <p className="text-sm text-red-800 mb-2">
                      {diagnosis.errorDetails.userMessage}
                    </p>
                    <details className="mb-3">
                      <summary className="text-xs text-red-700 cursor-pointer hover:text-red-900">
                        Technical details
                      </summary>
                      <p className="text-xs text-red-600 mt-1 font-mono bg-red-100 p-2 rounded">
                        {diagnosis.errorDetails.technicalMessage}
                      </p>
                    </details>
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => analyzeImageAsync(uploadedImage!)}
                        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition"
                      >
                        Retry Analysis
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition"
                      >
                        Try Different Image
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Only show diagnosis details if no error */}
            {!diagnosis.errorDetails && (
              <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-primary text-white rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Diagnosis</p>
                <p className="text-lg font-bold">{diagnosis.diagnosis}</p>
              </div>
              <div className="bg-gradient-success text-white rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Confidence</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-bold">{diagnosis.confidence}%</p>
                  <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
                    <div
                      className="bg-white h-full rounded-full"
                      style={{ width: `${diagnosis.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {diagnosis.datasetEnhanced && diagnosis.datasetInsights && diagnosis.datasetInsights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-lg p-4 border-l-4 border-emerald-500"
              >
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <span className="text-emerald-600">📊</span>
                  <span>Clinical Dataset Validation</span>
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {diagnosis.datasetInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {diagnosis.medicines && diagnosis.medicines.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Treatment</h4>
                <div className="space-y-3">
                  {diagnosis.medicines.map((med, idx) => (
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
            </>
            )}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-1"
      >
        <div className="card bg-gradient-primary-light border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-900 mb-3">Image Analysis Tips</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>📸 Clear, well-lit images work best</li>
            <li>⚕️ Focus on the affected area</li>
            <li>✓ Avoid shadows and reflections</li>
            <li>📏 Show full context if possible</li>
            <li>⚡ JPG or PNG format</li>
          </ul>
        </div>

        <div className="card mt-4 bg-gradient-to-br from-emerald-50 to-cyan-50">
          <h3 className="font-semibold text-gray-900 mb-3">Supported Conditions</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Skin conditions</li>
            <li>• Eye issues</li>
            <li>• Oral problems</li>
            <li>• General medical imaging</li>
          </ul>
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
          consultation: diagnosis ? `Image Analysis: ${diagnosis.diagnosis}` : 'Image Analysis',
          date: new Date().toLocaleDateString(),
          medications: diagnosis?.medicines || [{ name: 'Follow Doctor', dosage: 'As prescribed', frequency: 'Follow', duration: 'Follow' }],
          notes: diagnosis ? `Condition: ${diagnosis.diagnosis}
Severity: ${diagnosis.severity}
Specialist: ${diagnosis.specialistNeeded}

Recommendations: ${diagnosis.recommendations.join(', ')}` : 'No diagnosis available'
        }}
      />
    </div>
  );
}
