import { Mic, StopCircle, Send, Download, Globe } from 'lucide-react';
import { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getChatResponse } from '../../services/geminiService';
import PrescriptionModal from '../PrescriptionModal';
import { AuthContext } from '../../context/AuthContext';
import { generateVoiceReport } from '../../utils/pdfGenerator';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  voiceLanguages, 
  getSpeechRecognitionConfig, 
  speak, 
  stopSpeaking,
  voiceConsultationResponses 
} from '../../utils/multilingualVoice';
import { chatbotResponses, getRandomResponse, Language as ChatLanguage } from '../../utils/multilingualChatbot';

interface VoiceConsultationProps {
  onEndConsultation: (data: any) => void;
}

interface VoiceMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

const DOCTOR_AVATARS = [
  { name: 'Dr. Arogya', emoji: '👨‍⚕️', color: 'bg-blue-100' },
  { name: 'Dr. Sarah', emoji: '👩‍⚕️', color: 'bg-pink-100' },
  { name: 'Dr. James', emoji: '🧑‍⚕️', color: 'bg-green-100' },
  { name: 'Dr. Priya', emoji: '👩‍⚕️', color: 'bg-purple-100' }
];

export default function VoiceConsultation({ onEndConsultation }: VoiceConsultationProps) {
  const { user } = useContext(AuthContext);
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: '1',
      type: 'bot',
      text: getRandomResponse(chatbotResponses[language as ChatLanguage].greeting)
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState(DOCTOR_AVATARS[0]);
  const [allResponses, setAllResponses] = useState<string[]>([]);
  const [showPrescription, setShowPrescription] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const config = getSpeechRecognitionConfig(language as 'en' | 'hi' | 'bn');
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = config.lang;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSendMessage = async () => {
    if (!transcript.trim()) return;

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: transcript
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);

    try {
      const conversationHistory = messages
        .map(m => `${m.type === 'user' ? 'Patient' : 'Doctor'}: ${m.text}`)
        .join('\n');

      const aiResponse = await getChatResponse(transcript, conversationHistory);
      
      const botMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: aiResponse
      };

      setMessages(prev => [...prev, botMessage]);
      setAllResponses(prev => [...prev, aiResponse]);
      
      setCurrentAvatar(DOCTOR_AVATARS[Math.floor(Math.random() * DOCTOR_AVATARS.length)]);
      
      // Use multilingual text-to-speech
      speak(aiResponse, language as 'en' | 'hi' | 'bn');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: voiceConsultationResponses[language as 'en' | 'hi' | 'bn'].errorOccurred
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndConsultation = () => {
    const summary = messages
      .filter(m => m.type === 'user')
      .map(m => m.text)
      .join(' | ');

    onEndConsultation({
      summary: summary.substring(0, 100),
      details: messages,
      type: 'voice'
    });
  };

  const handleDownloadPrescription = () => {
    if (!user) {
      alert('User not logged in');
      return;
    }
    
    const summary = messages
      .filter(m => m.type === 'bot')
      .map(m => m.text)
      .join(' ')
      .substring(0, 200);
    
    generateVoiceReport({
      user: user,
      date: new Date().toLocaleDateString(),
      reportType: 'Voice Consultation',
      messages: messages.map((msg, index) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text,
        timestamp: new Date().toLocaleTimeString()
      })),
      summary: summary || 'Voice consultation completed'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <div className="card bg-gradient-subtle">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">{t.voiceConsultation.title}</h2>
            <p className="text-gray-600 mb-2">{t.voiceConsultation.subtitle}</p>
            
            {/* Language Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <Globe className="w-4 h-4" />
              <span>{t.voiceConsultation.language}: {voiceLanguages[language as 'en' | 'hi' | 'bn'].nativeName}</span>
            </div>

            <motion.div
              animate={{ scale: isListening ? 1.1 : 1 }}
              className={`w-24 h-24 rounded-full ${currentAvatar.color} flex items-center justify-center mx-auto mb-4 border-4 border-primary-500 shadow-lg`}
            >
              <span className="text-4xl">{currentAvatar.emoji}</span>
            </motion.div>
            <p className="text-sm font-semibold text-gray-700 mb-6">{currentAvatar.name}</p>

            <div className="flex justify-center mb-6">
              <motion.button
                whileHover={!isListening && !isProcessing ? { scale: 1.1 } : {}}
                whileTap={!isListening && !isProcessing ? { scale: 0.95 } : {}}
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-lg ${
                  isListening
                    ? 'bg-gradient-warm animate-pulse'
                    : 'bg-gradient-primary hover:shadow-xl'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? (
                  <StopCircle className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </motion.button>
            </div>

            {isListening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold text-red-600 mb-4"
              >
                🎤 Listening... Speak now
              </motion.p>
            )}

            {isProcessing && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold text-primary-600 mb-4"
              >
                ⏳ Processing...
              </motion.p>
            )}

            {transcript && !isListening && (
              <div className="bg-gradient-primary-light rounded-lg p-4 mb-4 text-left border border-primary-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">You said:</p>
                <p className="text-gray-800">{transcript}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!transcript.trim() || isProcessing}
                  className="mt-4 bg-gradient-primary text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </motion.button>
              </div>
            )}
          </motion.div>

          <div className="max-h-80 overflow-y-auto space-y-4 p-4 bg-white rounded-lg border border-gray-100">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-sm px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-primary text-white'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col space-y-3 mt-6 sm:flex-row sm:space-y-0 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPrescription}
              disabled={allResponses.length === 0}
              className="flex-1 bg-gradient-health text-white font-semibold py-3 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
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
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-1 space-y-4"
      >
        <div className="card bg-gradient-primary-light border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-900 mb-3">Voice Tips</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>🎤 Speak clearly</li>
            <li>🗣️ Describe symptoms fully</li>
            <li>⏱️ Mention when started</li>
            <li>📍 Note location of pain</li>
            <li>🚨 Mention severity level</li>
          </ul>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
          <h3 className="font-semibold text-gray-900 mb-3">Available Doctors</h3>
          <div className="space-y-2">
            {DOCTOR_AVATARS.map((avatar) => (
              <div key={avatar.name} className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                <div className={`w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center border border-primary-300`}>
                  <span>{avatar.emoji}</span>
                </div>
                <span className="text-sm text-gray-700">{avatar.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <PrescriptionModal
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
        prescriptionData={{
          patientName: 'Patient',
          consultation: allResponses[allResponses.length - 1] || 'Voice Consultation',
          date: new Date().toLocaleDateString(),
          medications: [
            { name: 'Follow Doctor', dosage: 'As prescribed', frequency: 'Follow', duration: 'Follow' }
          ],
          notes: allResponses.join('\n\n')
        }}
      />
    </div>
  );
}
