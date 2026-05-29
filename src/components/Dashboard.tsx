import { motion } from 'framer-motion';
import { 
  LogOut, Plus, Calendar, FileText, MessageSquare, Mic, 
  Image, AlertCircle, TrendingUp, Download, BarChart3, 
  Activity, Pill, AlertTriangle, Shield, Sparkles, 
  Smartphone, Beaker, Users, ChevronRight, User, Settings
} from 'lucide-react';
import { useState } from 'react';
import PrescriptionModal from './PrescriptionModal';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  user: { id: string; email: string; name: string; firstName?: string };
  consultations: any[];
  onLogout: () => void;
  onStartConsultation: () => void;
  onViewBenchmarking: () => void;
  onViewModelComparison: () => void;
  onViewPersonalDashboard?: () => void;
  onViewAppointments?: () => void;
  onViewMedications?: () => void;
  onViewEmergency?: () => void;
  onViewCompliance?: () => void;
  onViewHealthCards?: () => void;
  onViewExport?: () => void;
  onViewAnalytics?: () => void;
  onViewLabReports?: () => void;
  onViewFamilyHub?: () => void;
}

export default function Dashboard({ 
  user, consultations, onLogout, onStartConsultation, 
  onViewBenchmarking, onViewModelComparison, onViewPersonalDashboard, 
  onViewAppointments, onViewMedications, onViewEmergency, 
  onViewCompliance, onViewHealthCards, onViewExport, 
  onViewAnalytics, onViewLabReports, onViewFamilyHub 
}: DashboardProps) {
  const { t } = useLanguage();
  const [showPrescription, setShowPrescription] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-teal-400" />;
      case 'voice':
        return <Mic className="w-4 h-4 text-emerald-400" />;
      case 'image':
        return <Image className="w-4 h-4 text-indigo-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'chat':
        return 'Text Consultation';
      case 'voice':
        return 'Vocal Diagnosis';
      case 'image':
        return 'Dermoscopic / Ophthalmic Imaging';
      default:
        return 'Clinical Assessment';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-overlay relative pb-20">
      {/* Background Orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-slate-950 font-bold text-base">{user.name[0].toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {t.dashboard.welcomeBack}, {user.firstName || user.name}!
              </h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Indicators grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Clinical Consults</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">{consultations.length}</p>
            </div>
            <div className="w-11 h-11 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Vitals Status</p>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1.5 flex items-center gap-2">
                Stable
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card medical-card border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Last Interaction</p>
              <p className="text-lg font-bold text-white mt-2">
                {consultations.length > 0 ? formatDate(consultations[0].timestamp) : 'None Recorded'}
              </p>
            </div>
            <div className="w-11 h-11 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Clinical CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 rounded-2xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Live Consult Sandbox
              </span>
              <h2 className="text-2xl font-bold text-white mb-2">{t.dashboard.checkSymptoms}</h2>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">{t.symptomChecker.subtitle}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartConsultation}
              className="btn-premium-primary whitespace-nowrap text-sm px-6 py-3"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Begin AI Consultation</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Section Title */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">Clinical Modules & Utilities</h3>

        {/* Features Modules Cockpit Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
        >
          {/* Beaker Lab report */}
          {onViewLabReports && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewLabReports}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Lab Report AI Analyzer</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Parse chem panels & blood works</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Access module</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Family Health Hub */}
          {onViewFamilyHub && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewFamilyHub}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Family Health Hub</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Manage records for dependents</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-pink-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Access module</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Personal Health Metrics */}
          {onViewPersonalDashboard && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewPersonalDashboard}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Clinical Health Metrics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Track sleep, logs, & weight</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-teal-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Access dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Appts */}
          {onViewAppointments && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewAppointments}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t.dashboard.bookAppointment}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Schedule clinical practitioners</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-blue-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Schedule appointment</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Meds */}
          {onViewMedications && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewMedications}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                  <Pill className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t.dashboard.trackMedications}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Adherence logs & reminders</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-purple-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>View scheduler</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Health Analytics */}
          {onViewAnalytics && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewAnalytics}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Advanced Health Analytics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Visualize longitudinal telemetry</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Open Analytics</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Emergency Response */}
          {onViewEmergency && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewEmergency}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between bg-red-950/10 hover:border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Emergency Dispatch</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Locate nearest hospitals & alert contacts</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-red-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Initialize dispatch</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Privacy & Compliance */}
          {onViewCompliance && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewCompliance}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-500/10 border border-slate-800 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Privacy & Compliance Settings</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Manage GDPR/HIPAA options & consent</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>View locks</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Health Cards */}
          {onViewHealthCards && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewHealthCards}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Health Card Generator</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Downloadable vital pass cards</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Generate pass</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Export Settings */}
          {onViewExport && (
            <motion.div
              whileHover={{ y: -3 }}
              onClick={onViewExport}
              className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Sync & Health Connect</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Export records to JSON/CSV/PDF</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-sky-400 font-semibold pt-4 mt-4 border-t border-slate-900">
                <span>Open Export</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Benchmarking */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={onViewBenchmarking}
            className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                <Beaker className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">LLM Benchmarks</h4>
                <p className="text-xs text-slate-400 mt-0.5">Compare model response metrics</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-teal-400 font-semibold pt-4 mt-4 border-t border-slate-900">
              <span>View Benchmarks</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Model Comparison */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={onViewModelComparison}
            className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Side-by-Side Validation</h4>
                <p className="text-xs text-slate-400 mt-0.5">Evaluate diagnostic alignments</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-blue-400 font-semibold pt-4 mt-4 border-t border-slate-900">
              <span>Compare Models</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Download Prescription */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setShowPrescription(true)}
            className="glass-card glass-card-hover border-slate-800/80 p-5 cursor-pointer flex flex-col justify-between bg-emerald-950/10 hover:border-emerald-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Prescription Portal</h4>
                <p className="text-xs text-slate-400 mt-0.5">Download prescription records</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-4 mt-4 border-t border-slate-900">
              <span>Download PDF / Text</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        </motion.div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="disclaimer-banner rounded-2xl mb-8"
        >
          <div className="flex items-start space-x-3.5">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Clinician Safety Notice</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Arogya calculations are experimental support metrics only and do not replace physical diagnosis. Always seek licensed medical consultations in person. Call emergency services in urgent scenarios.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Consultation History */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">Clinical Consult Log</h3>

          {consultations.length > 0 ? (
            <div className="space-y-3">
              {consultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  className="glass-card border-slate-900/80 p-4 hover:border-slate-800 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getConsultationIcon(consultation.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {getConsultationTypeLabel(consultation.type)}
                      </p>
                      <p className="text-sm font-semibold text-white truncate mt-0.5">
                        {consultation.summary || 'Clinical inquiry consultation'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(consultation.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl whitespace-nowrap">
                    Completed
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card text-center py-12 border-slate-900/80"
            >
              <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No consultations recorded</p>
              <p className="text-slate-500 text-xs mt-1">Submit your first inquiry above to populate log</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal isOpen={showPrescription} onClose={() => setShowPrescription(false)} />
    </div>
  );
}
