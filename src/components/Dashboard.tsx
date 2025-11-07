import { motion } from 'framer-motion';
import { LogOut, Plus, Calendar, FileText, MessageSquare, Mic, Image, AlertCircle, TrendingUp, Download, BarChart3, Activity, Pill } from 'lucide-react';
import { useState } from 'react';
import PrescriptionModal from './PrescriptionModal';

interface DashboardProps {
  user: { id: string; email: string; name: string };
  consultations: any[];
  onLogout: () => void;
  onStartConsultation: () => void;
  onViewBenchmarking: () => void;
  onViewModelComparison: () => void;
  onViewPersonalDashboard?: () => void;
  onViewAppointments?: () => void;
  onViewMedications?: () => void;
}

export default function Dashboard({ user, consultations, onLogout, onStartConsultation, onViewBenchmarking, onViewModelComparison, onViewPersonalDashboard, onViewAppointments, onViewMedications }: DashboardProps) {
  const [showPrescription, setShowPrescription] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-5 h-5" />;
      case 'voice':
        return <Mic className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'chat':
        return 'Text Chat';
      case 'voice':
        return 'Voice Call';
      case 'image':
        return 'Image Analysis';
      default:
        return 'Consultation';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white border-b border-neutral-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Welcome, {user.name}!</h1>
                <p className="text-sm text-neutral-600">{user.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Status Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-700 font-medium">Total Consultations</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{consultations.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-700 font-medium">Health Status</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">Good</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card medical-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-700 font-medium">Last Consultation</p>
                <p className="text-lg font-bold text-neutral-900 mt-1">
                  {consultations.length > 0 ? formatDate(consultations[0].timestamp) : 'None'}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 mb-8 text-white"
        >
          <div className="flex items-center justify-between flex-col sm:flex-row space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold mb-2">Start a New Consultation</h2>
              <p className="text-primary-100">Chat with our AI doctor, use voice, or upload medical images for analysis</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartConsultation}
              className="flex items-center space-x-2 bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>New Consultation</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
        >
          {onViewAppointments && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewAppointments}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Appointment</span>
            </motion.button>
          )}
          
          {onViewMedications && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewMedications}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Pill className="w-5 h-5" />
              <span>Track Medications</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPrescription(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Prescription</span>
          </motion.button>
          
          {onViewPersonalDashboard && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewPersonalDashboard}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Activity className="w-5 h-5" />
              <span>Health Dashboard</span>
            </motion.button>
          )}
        </motion.div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="disclaimer-banner rounded-lg mb-8"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Medical Disclaimer</h3>
              <p className="text-neutral-800 text-sm">
                Arogya provides informational support only and is NOT a substitute for professional medical advice. Always consult a certified doctor for diagnosis and treatment. Emergency cases require immediate medical attention.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Consultation History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Recent Consultations</h2>

          {consultations.length > 0 ? (
            <div className="space-y-4">
              {consultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="card hover:shadow-md transition-shadow duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between flex-col sm:flex-row space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4 w-full">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="text-primary-600">
                          {getConsultationIcon(consultation.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700">
                          {getConsultationTypeLabel(consultation.type)}
                        </p>
                        <p className="text-lg font-semibold text-neutral-900 truncate">
                          {consultation.summary || 'General health consultation'}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                          {formatDate(consultation.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                      Completed
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="card text-center py-12"
            >
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-700 font-medium">No consultations yet</p>
              <p className="text-neutral-600 text-sm mt-1">Start your first consultation to see history here</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal isOpen={showPrescription} onClose={() => setShowPrescription(false)} />
    </div>
  );
}
