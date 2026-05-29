import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Mic, Image, Send, Plus, AlertCircle, FileUp, GitCompare } from 'lucide-react';
import ChatConsultation from './ConsultationTabs/ChatConsultation';
import VoiceConsultation from './ConsultationTabs/VoiceConsultation';
import ImageConsultation from './ConsultationTabs/ImageConsultation';
import ImageConsultationMultiModelComparison from './ConsultationTabs/ImageConsultationMultiModelComparison';
import SymptomChecker from './ConsultationTabs/SymptomChecker';

type ConsultationType = 'chat' | 'voice' | 'image' | 'multi-model' | 'symptom-checker';

interface ConsultationInterfaceProps {
  user: { id: string; email: string; name: string };
  onEndConsultation: (data: any) => void;
  onBack: () => void;
}

export default function ConsultationInterface({ user, onEndConsultation, onBack }: ConsultationInterfaceProps) {
  const [activeTab, setActiveTab] = useState<ConsultationType>('chat');
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);

  const handleEndConsultation = (data: any) => {
    onEndConsultation({
      type: activeTab === 'symptom-checker' ? 'chat' : activeTab,
      ...data
    });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Clinical Consultation Hub</h1>
                <p className="text-xs text-slate-400 mt-0.5">Select a diagnostic method to consult Dr. Arogya</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="px-4 py-2 border border-slate-900 hover:border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-200 transition-all text-xs font-semibold hidden sm:block"
            >
              Exit Hub
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
            <TabButton
              label="Text Chat Consult"
              icon={MessageSquare}
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            />
            <TabButton
              label="Voice Assistant"
              icon={Mic}
              active={activeTab === 'voice'}
              onClick={() => setActiveTab('voice')}
            />
            <TabButton
              label="Image Analysis"
              icon={Image}
              active={activeTab === 'image'}
              onClick={() => setActiveTab('image')}
            />
            <TabButton
              label="Multi-Model Validation"
              icon={GitCompare}
              active={activeTab === 'multi-model'}
              onClick={() => setActiveTab('multi-model')}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSymptomChecker(!showSymptomChecker)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                showSymptomChecker
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-inner'
                  : 'bg-slate-900/60 text-slate-400 border-slate-900 hover:border-slate-800 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Symptom Checker</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="disclaimer-banner rounded-2xl mb-8"
        >
          <div className="flex items-start space-x-3.5">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Medical Disclaimer & Scope</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Consultations are processed as experimental support metrics. No data is stored, and the findings are not official validation diagnostics. Consult emergency departments or licensed clinical practitioners for medical help.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Symptom Checker Panel */}
        <AnimatePresence>
          {showSymptomChecker && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <SymptomChecker onClose={() => setShowSymptomChecker(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'chat' && (
            <ChatConsultation onEndConsultation={handleEndConsultation} />
          )}
          {activeTab === 'voice' && (
            <VoiceConsultation onEndConsultation={handleEndConsultation} />
          )}
          {activeTab === 'image' && (
            <ImageConsultation onEndConsultation={handleEndConsultation} />
          )}
          {activeTab === 'multi-model' && (
            <ImageConsultationMultiModelComparison onEndConsultation={handleEndConsultation} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, active, onClick }: TabButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 border rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
        active
          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-inner'
          : 'bg-slate-900/60 text-slate-400 border-slate-900 hover:border-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </motion.button>
  );
}
