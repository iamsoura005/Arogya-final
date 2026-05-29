import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Download,
  Trophy,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
  ArrowLeft,
  Copy,
  Check,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Sparkles
} from 'lucide-react';
import {
  createHealthCard,
  getUserHealthCards,
  cardTemplates,
  HealthCard
} from '../services/healthCardService';
import html2canvas from 'html2canvas';

interface HealthCardGeneratorProps {
  onBack?: () => void;
}

const HealthCardGenerator: React.FC<HealthCardGeneratorProps> = ({ onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<HealthCard['type']>('achievement');
  const [cardData, setCardData] = useState<any>({});
  const [selectedTheme, setSelectedTheme] = useState<HealthCard['theme']>('gradient-purple');
  const [myCards, setMyCards] = useState<HealthCard[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<HealthCard | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadMyCards();
  }, []);

  const loadMyCards = () => {
    const cards = getUserHealthCards(userId);
    setMyCards(cards);
  };

  const themeClasses = {
    'gradient-purple': 'bg-gradient-to-br from-purple-600 via-pink-500 to-red-500',
    'gradient-blue': 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500',
    'gradient-green': 'bg-gradient-to-br from-green-600 via-emerald-500 to-lime-500',
    'gradient-pink': 'bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500',
    'solid-medical': 'bg-gradient-to-br from-blue-700 to-blue-900'
  };

  const handleGenerateCard = () => {
    const template = cardTemplates.find(t => t.type === selectedTemplate);
    if (!template) return;

    // Validate required data
    const missingFields = template.requiredData.filter(field => !cardData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    const card = createHealthCard(userId, {
      type: selectedTemplate,
      title: getCardTitle(),
      subtitle: getCardSubtitle(),
      data: cardData,
      theme: selectedTheme
    });

    setGeneratedCard(card);
    setShowPreview(true);
    loadMyCards();
  };

  const getCardTitle = (): string => {
    switch (selectedTemplate) {
      case 'achievement':
        return cardData.achievement || 'Health Achievement';
      case 'summary':
        return 'Weekly Health Summary';
      case 'milestone':
        return cardData.milestone || 'Health Milestone';
      case 'streak':
        return `${cardData.days || 0} Day Streak`;
      case 'vitals':
        return 'My Vital Signs';
      default:
        return 'Health Card';
    }
  };

  const getCardSubtitle = (): string => {
    const date = new Date().toLocaleDateString();
    switch (selectedTemplate) {
      case 'achievement':
        return `Achieved on ${date}`;
      case 'summary':
        return `Week of ${date}`;
      case 'milestone':
        return `Milestone reached ${date}`;
      case 'streak':
        return `${cardData.percentage || 100}% Adherence`;
      case 'vitals':
        return `Recorded on ${date}`;
      default:
        return date;
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2
      });

      const link = document.createElement('a');
      link.download = `arogya-health-card-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download card. Please try again.');
    }
  };

  const handleShareCard = async (platform: string) => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], 'health-card.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'My Health Achievement',
            text: 'Check out my health progress on Arogya!'
          });
        } else {
          // Fallback: copy share link
          const shareText = `Check out my health progress on Arogya! 🏥💪 #HealthJourney #ArogyaHealth`;
          navigator.clipboard.writeText(shareText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const renderCardPreview = () => {
    if (!generatedCard) return null;

    return (
      <div
        ref={cardRef}
        className={`${themeClasses[generatedCard.theme]} text-white rounded-2xl p-8 shadow-2xl w-full max-w-md aspect-square flex flex-col justify-between relative overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="fill-white" size={24} />
              <span className="font-bold text-lg">Arogya Health</span>
            </div>
            {generatedCard.type === 'achievement' && <Trophy size={32} className="fill-yellow-300 text-yellow-300" />}
            {generatedCard.type === 'streak' && <Zap size={32} className="fill-yellow-300 text-yellow-300" />}
            {generatedCard.type === 'vitals' && <Activity size={32} />}
          </div>

          <h2 className="text-4xl font-bold mb-2">{generatedCard.title}</h2>
          <p className="text-white/80 text-lg mb-6">{generatedCard.subtitle}</p>

          {/* Card Type Specific Content */}
          {generatedCard.type === 'achievement' && (
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm uppercase tracking-wide mb-1">Achievement</p>
                <p className="text-2xl font-bold">{generatedCard.data.achievement}</p>
              </div>
            </div>
          )}

          {generatedCard.type === 'streak' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm uppercase tracking-wide mb-1">Days</p>
                <p className="text-3xl font-bold">{generatedCard.data.days}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm uppercase tracking-wide mb-1">Adherence</p>
                <p className="text-3xl font-bold">{generatedCard.data.percentage}%</p>
              </div>
            </div>
          )}

          {generatedCard.type === 'summary' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{generatedCard.data.consultations || 0}</p>
                <p className="text-xs uppercase">Consults</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{generatedCard.data.medications || 0}</p>
                <p className="text-xs uppercase">Meds</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{generatedCard.data.biomarkers || 0}</p>
                <p className="text-xs uppercase">Vitals</p>
              </div>
            </div>
          )}

          {generatedCard.type === 'milestone' && (
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <p className="text-sm uppercase tracking-wide mb-2">Milestone</p>
              <p className="text-2xl font-bold mb-2">{generatedCard.data.milestone}</p>
              <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full"
                  style={{ width: `${generatedCard.data.progress || 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {generatedCard.type === 'vitals' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide mb-1">BP</p>
                <p className="text-xl font-bold">{generatedCard.data.bloodPressure || 'N/A'}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide mb-1">Heart Rate</p>
                <p className="text-xl font-bold">{generatedCard.data.heartRate || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-white/60 text-sm">
          <span>#{new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <Sparkles size={16} />
            Powered by AI
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack || (() => window.history.back())}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>

          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={32} />
            <h1 className="text-3xl font-bold">Health Card Generator</h1>
          </div>
          <p className="text-purple-100">Create shareable Instagram-style health cards</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Generator */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">1. Choose Template</h2>
              <div className="grid grid-cols-2 gap-3">
                {cardTemplates.map((template) => (
                  <motion.button
                    key={template.type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTemplate(template.type);
                      setCardData({});
                    }}
                    className={`border-2 rounded-lg p-4 text-left transition-all ${
                      selectedTemplate === template.type
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{template.title}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">2. Choose Theme</h2>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(themeClasses).map(([theme, className]) => (
                  <motion.button
                    key={theme}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTheme(theme as HealthCard['theme'])}
                    className={`${className} rounded-lg aspect-square ${
                      selectedTheme === theme ? 'ring-4 ring-purple-600' : ''
                    }`}
                  ></motion.button>
                ))}
              </div>
            </div>

            {/* Data Input */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">3. Enter Details</h2>
              <div className="space-y-4">
                {selectedTemplate === 'achievement' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Achievement *</label>
                      <input
                        type="text"
                        value={cardData.achievement || ''}
                        onChange={(e) => setCardData({ ...cardData, achievement: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="30-Day Medication Streak"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Icon</label>
                      <select
                        value={cardData.icon || 'trophy'}
                        onChange={(e) => setCardData({ ...cardData, icon: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="trophy">Trophy</option>
                        <option value="heart">Heart</option>
                        <option value="star">Star</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedTemplate === 'streak' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Days *</label>
                      <input
                        type="number"
                        value={cardData.days || ''}
                        onChange={(e) => setCardData({ ...cardData, days: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Percentage *</label>
                      <input
                        type="number"
                        value={cardData.percentage || ''}
                        onChange={(e) => setCardData({ ...cardData, percentage: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="95"
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Medicine Name</label>
                      <input
                        type="text"
                        value={cardData.medicine || ''}
                        onChange={(e) => setCardData({ ...cardData, medicine: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="Blood Pressure Medication"
                      />
                    </div>
                  </>
                )}

                {selectedTemplate === 'summary' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Consultations</label>
                      <input
                        type="number"
                        value={cardData.consultations || ''}
                        onChange={(e) => setCardData({ ...cardData, consultations: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Medications Taken</label>
                      <input
                        type="number"
                        value={cardData.medications || ''}
                        onChange={(e) => setCardData({ ...cardData, medications: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="28"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Biomarkers Recorded</label>
                      <input
                        type="number"
                        value={cardData.biomarkers || ''}
                        onChange={(e) => setCardData({ ...cardData, biomarkers: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="14"
                      />
                    </div>
                  </>
                )}

                {selectedTemplate === 'milestone' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Milestone *</label>
                      <input
                        type="text"
                        value={cardData.milestone || ''}
                        onChange={(e) => setCardData({ ...cardData, milestone: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="Lost 10 lbs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Progress %</label>
                      <input
                        type="number"
                        value={cardData.progress || ''}
                        onChange={(e) => setCardData({ ...cardData, progress: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="75"
                        max={100}
                      />
                    </div>
                  </>
                )}

                {selectedTemplate === 'vitals' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Blood Pressure</label>
                      <input
                        type="text"
                        value={cardData.bloodPressure || ''}
                        onChange={(e) => setCardData({ ...cardData, bloodPressure: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="120/80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
                      <input
                        type="text"
                        value={cardData.heartRate || ''}
                        onChange={(e) => setCardData({ ...cardData, heartRate: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Temperature (°F)</label>
                      <input
                        type="text"
                        value={cardData.temperature || ''}
                        onChange={(e) => setCardData({ ...cardData, temperature: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                        placeholder="98.6"
                      />
                    </div>
                  </>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateCard}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg"
              >
                Generate Card
              </motion.button>
            </div>
          </div>

          {/* Right: Preview & Actions */}
          <div className="space-y-6">
            {showPreview && generatedCard ? (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Preview & Share</h2>
                
                <div className="flex justify-center mb-6">
                  {renderCardPreview()}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadCard}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium"
                  >
                    <Download size={20} />
                    Download
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShareCard('general')}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium"
                  >
                    {copied ? <Check size={20} /> : <Share2 size={20} />}
                    {copied ? 'Copied!' : 'Share'}
                  </motion.button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">Share to:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Instagram, label: 'Instagram', color: 'bg-pink-600' },
                      { icon: Twitter, label: 'Twitter', color: 'bg-blue-400' },
                      { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
                      { icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-700' }
                    ].map((platform) => (
                      <motion.button
                        key={platform.label}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShareCard(platform.label)}
                        className={`${platform.color} text-white p-3 rounded-lg flex items-center justify-center`}
                      >
                        <platform.icon size={20} />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center text-gray-400">
                <Sparkles size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Your card preview will appear here</p>
              </div>
            )}

            {/* My Cards */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">My Cards ({myCards.length})</h2>
              
              {myCards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No cards created yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myCards.slice(0, 4).map((card) => (
                    <div key={card.id} className="border-2 border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-all cursor-pointer">
                      <p className="font-medium text-sm mb-1">{card.title}</p>
                      <p className="text-xs text-gray-600">{new Date(card.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCardGenerator;
