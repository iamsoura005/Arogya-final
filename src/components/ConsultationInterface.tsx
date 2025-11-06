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
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white border-b border-neutral-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Consultation</h1>
                <p className="text-sm text-gray-500">Choose your consultation method below</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium hidden sm:block"
            >
              Exit
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <TabButton
              label="Chat Consultation"
              icon={MessageSquare}
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            />
            <TabButton
              label="Voice Bot"
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
              label="Multi-Model Comparison"
              icon={GitCompare}
              active={activeTab === 'multi-model'}
              onClick={() => setActiveTab('multi-model')}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSymptomChecker(!showSymptomChecker)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                showSymptomChecker
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Symptom Checker</span>
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
          className="disclaimer-banner rounded-lg mb-8"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Medical Disclaimer</h3>
              <p className="text-amber-800 text-sm mt-1">
                This platform provides informational support only and is NOT a substitute for professional medical advice. Always consult a certified doctor for diagnosis and treatment. For emergencies, call 911 or seek immediate medical attention.
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-primary-100 text-primary-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
