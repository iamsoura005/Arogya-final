import { Send, FileText, BookOpen, Download } from 'lucide-react';
import { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getChatResponse } from '../../services/geminiService';
import PrescriptionModal from '../PrescriptionModal';
import { AuthContext } from '../../context/AuthContext';
import { generateChatReport } from '../../utils/pdfGenerator';

interface ChatConsultationProps {
  onEndConsultation: (data: any) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const DOCTOR_AVATARS = [
  { name: 'Dr. Arogya', emoji: '👨‍⚕️', color: 'bg-blue-100' },
  { name: 'Dr. Sarah', emoji: '👩‍⚕️', color: 'bg-pink-100' },
  { name: 'Dr. James', emoji: '🧑‍⚕️', color: 'bg-green-100' },
  { name: 'Dr. Priya', emoji: '👩‍⚕️', color: 'bg-purple-100' }
];

export default function ChatConsultation({ onEndConsultation }: ChatConsultationProps) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      text: "Hello! I'm Dr. Arogya. Tell me, what health concerns bring you in today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [allDoctorResponses, setAllDoctorResponses] = useState<string[]>([]);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [isDiagnosisDone, setIsDiagnosisDone] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(DOCTOR_AVATARS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .map(m => `${m.type === 'user' ? 'Patient' : 'Doctor'}: ${m.text}`)
        .join('\n');
      
      const aiResponse = await getChatResponse(userInput, conversationHistory);
      setAllDoctorResponses(prev => [...prev, aiResponse]);
      
      if (!isDiagnosisDone && questionsAsked < 5) {
        setQuestionsAsked(prev => prev + 1);
      }
      
      // Randomly change doctor on responses
      if (Math.random() > 0.7) {
        setCurrentDoctor(DOCTOR_AVATARS[Math.floor(Math.random() * DOCTOR_AVATARS.length)]);
      }
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'I apologize, I encountered an error. Could you please try again?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEnd = () => {
    const summary = messages
      .filter(m => m.type === 'user')
      .map(m => m.text)
      .join(' | ');

    onEndConsultation({
      summary: summary.substring(0, 100) + (summary.length > 100 ? '...' : ''),
      details: messages,
      type: 'chat'
    });
  };

  const handleEndConsultation = () => {
    setShowEndDialog(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 card p-0 flex flex-col h-[600px]">
          {/* Header with Doctor Name */}
          <div className="border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-primary-100 p-4 flex items-center gap-3">
            <motion.div
              animate={{ scale: 1.1 }}
              className={`w-12 h-12 rounded-full ${currentDoctor.color} flex items-center justify-center text-xl border-2 border-primary-300`}
            >
              {currentDoctor.emoji}
            </motion.div>
            <div>
              <h3 className="font-bold text-gray-900">{currentDoctor.name}</h3>
              <p className="text-xs text-gray-600">Medical Consultant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`w-8 h-8 rounded-full ${currentDoctor.color} flex items-center justify-center flex-shrink-0 text-sm border-2 border-primary-300`}
                  >
                    {currentDoctor.emoji}
                  </motion.div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-neutral-100 text-neutral-900 rounded-bl-none border border-neutral-200'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <motion.div
                  animate={{ scale: 1.1 }}
                  className={`w-8 h-8 rounded-full ${currentDoctor.color} flex items-center justify-center flex-shrink-0 text-sm border-2 border-primary-300`}
                >
                  {currentDoctor.emoji}
                </motion.div>
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {questionsAsked > 0 && !isDiagnosisDone && (
            <div className="border-t border-neutral-200 bg-gray-50 px-6 py-2 text-xs text-gray-600">
              Diagnostic Progress: {questionsAsked}/5
            </div>
          )}

          <div className="border-t border-neutral-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share your symptoms or concerns..."
                className="input-field flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
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
          <div className="card">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <span>Chat Tips</span>
            </h3>
            <ul className="text-sm text-neutral-700 space-y-2">
              <li>🩺 Be specific about symptoms</li>
              <li>⏱️ Mention when it started</li>
              <li>📊 Rate severity level</li>
              <li>💊 List current meds</li>
              <li>📋 Share relevant history</li>
            </ul>
          </div>

          <div className="card border-l-4 border-primary-500">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span>Our Doctors</span>
            </h3>
            <div className="space-y-2">
              {DOCTOR_AVATARS.map((doctor) => (
                <div key={doctor.name} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                  <div className={`w-8 h-8 rounded-full ${doctor.color} flex items-center justify-center text-sm border border-primary-200`}>
                    {doctor.emoji}
                  </div>
                  <span className="text-sm text-neutral-700">{doctor.name}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndConsultation}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <span>End Consultation</span>
          </motion.button>
        </motion.div>
      </div>

      {showEndDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-bold mb-4">End Consultation?</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!user) {
                    alert('User not logged in');
                    return;
                  }
                  
                  const summary = allDoctorResponses.join(' ').substring(0, 200);
                  
                  generateChatReport({
                    user: user,
                    date: new Date().toLocaleDateString(),
                    reportType: 'Chat Consultation',
                    messages: messages.map(msg => ({
                      role: msg.type === 'user' ? 'user' : 'assistant',
                      content: msg.text,
                      timestamp: msg.timestamp.toLocaleTimeString()
                    })),
                    summary: summary || 'Chat consultation completed'
                  });
                  
                  setShowEndDialog(false);
                }}
                className="w-full btn-primary"
              >
                Download Report
              </button>
              <button
                onClick={handleConfirmEnd}
                className="w-full btn-secondary"
              >
                End Without Download
              </button>
              <button
                onClick={() => setShowEndDialog(false)}
                className="w-full btn-outline"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <PrescriptionModal
        isOpen={showPrescription}
        onClose={() => {
          setShowPrescription(false);
          setTimeout(handleConfirmEnd, 300);
        }}
        prescriptionData={{
          patientName: 'Patient',
          consultation: messages.map(m => `${m.type === 'user' ? 'You' : 'Dr. Arogya'}: ${m.text}`).join('\n\n'),
          date: new Date().toLocaleDateString(),
          medications: [
            { name: 'As recommended by AI Doctor', dosage: 'See full consultation', frequency: 'As advised', duration: 'Follow-up' }
          ],
          notes: allDoctorResponses.join('\n\n')
        }}
      />
    </>
  );
}
