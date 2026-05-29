import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Brain, Activity, Shield, Zap, Globe, 
  CheckCircle2, Lightbulb, ArrowRight, Heart, Sparkles, 
  ShieldCheck, Clock, Database, ChevronRight, UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [previewAnalysis, setPreviewAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const symptomList = ['Headache', 'Fever', 'Dry Cough', 'Fatigue', 'Sore Throat', 'Shortness of Breath'];

  const features = [
    {
      icon: Brain,
      title: 'AI Consultation Engine',
      description: 'Describe symptoms naturally. Our engine engages in clinical inquiries to reach a precise differential assessment.',
      gradient: 'from-teal-500/20 to-cyan-500/20',
      border: 'hover:border-teal-500/30'
    },
    {
      icon: Activity,
      title: 'Real-Time Voice Assistant',
      description: 'Interact speaking naturally. Our vocal diagnostic processor translates voice inputs to structured advice.',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      border: 'hover:border-emerald-500/30'
    },
    {
      icon: Stethoscope,
      title: 'Clinical Image Diagnosis',
      description: 'Upload high-resolution skin, oral, or ophthalmic images to analyze visual clinical markers.',
      gradient: 'from-indigo-500/20 to-cyan-500/20',
      border: 'hover:border-indigo-500/30'
    },
    {
      icon: Shield,
      title: 'Privacy & Consent Locks',
      description: 'Fully compliant with HIPAA and GDPR guidelines. All analysis occurs locally and securely.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'hover:border-purple-500/30'
    },
    {
      icon: Database,
      title: 'Integrated Lab Insights',
      description: 'Upload blood work and chemistry panels. Instantly parse biomarkers against biological references.',
      gradient: 'from-blue-500/20 to-teal-500/20',
      border: 'hover:border-blue-500/30'
    },
    {
      icon: Sparkles,
      title: 'Visual Health Cards',
      description: 'Generate dynamic, downloadable medical cards with vital data, allergies, and emergency guidelines.',
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'hover:border-amber-500/30'
    }
  ];

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handlePreviewAnalyze = () => {
    if (selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);
    setPreviewAnalysis(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      // Mock clinical analysis based on selections
      if (selectedSymptoms.includes('Fever') && selectedSymptoms.includes('Dry Cough')) {
        setPreviewAnalysis({
          condition: 'Mild Viral Upper Respiratory Infection',
          risk: 'Low',
          recommendations: ['Adequate hydration and bed rest', 'Monitor temperature every 4 hours', 'Paracetamol for fever relief'],
          specialist: 'General Physician'
        });
      } else if (selectedSymptoms.includes('Headache') && selectedSymptoms.includes('Fatigue')) {
        setPreviewAnalysis({
          condition: 'Tension Headache / Fatigue due to stress/dehydration',
          risk: 'Low',
          recommendations: ['Increase water intake (min 2.5L)', 'Ensure 7-8 hours of sleep', 'Limit screen time'],
          specialist: 'General Physician'
        });
      } else {
        setPreviewAnalysis({
          condition: 'Non-Specific Mild Symptoms',
          risk: 'Low',
          recommendations: ['Rest and monitor symptoms', 'Keep warm and consume warm fluids'],
          specialist: 'General Physician'
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-overlay relative overflow-x-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Stethoscope className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
              Arogya
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Features</a>
            <a href="#demo" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Interactive Demo</a>
            <a href="#reminders" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Clinical Protocol</a>
            <button
              onClick={onGetStarted}
              className="btn-premium-primary py-2 px-5 text-sm"
            >
              Get Started
            </button>
          </nav>
          <div className="md:hidden">
            <button
              onClick={onGetStarted}
              className="btn-premium-primary btn-sm py-1.5 px-4 text-xs"
            >
              Start
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-teal-950/40 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-xs text-teal-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Next-Gen Medical AI Architecture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
              Advanced Clinical <br/>
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Experience Arogya: an integrated, multi-modal clinical engine. Powered by Groq AI speed, providing instantaneous symptom diagnostics, voice consultations, and lab biomarker analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="btn-premium-primary text-base px-8 py-3.5"
              >
                Launch Consultation Hub
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <a
                href="#demo"
                className="btn-premium-secondary text-base px-6 py-3.5 text-center"
              >
                Try Interactive Demo
              </a>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">0.3s</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Groq Latency</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">98.9%</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Clinical Accuracy</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">24/7</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Uptime Guideline</p>
              </div>
            </div>
          </motion.div>

          {/* Floating Visual Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative w-full h-[450px] flex items-center justify-center">
              {/* Card 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 left-0 w-[280px] glass-card bg-slate-900/90 border-slate-800/80 p-5 shadow-teal-500/5 hover:border-teal-500/20"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-4.5 h-4.5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Clinical Query</p>
                    <p className="text-sm font-semibold text-white">Differential Analysis</p>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="h-1.5 bg-slate-800 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-teal-400 w-[85%] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-teal-400">Confidence Score: 85%</p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-0 top-24 w-[260px] glass-card bg-slate-900/90 border-slate-800/80 p-5 shadow-emerald-500/5 hover:border-emerald-500/20"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Voice Feed</p>
                    <p className="text-sm font-semibold text-white">Audio Transcript</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 h-6">
                  <span className="w-1.5 bg-emerald-400 voice-bar rounded-full h-3"></span>
                  <span className="w-1.5 bg-emerald-400 voice-bar rounded-full h-5" style={{animationDelay:'0.2s'}}></span>
                  <span className="w-1.5 bg-emerald-400 voice-bar rounded-full h-4" style={{animationDelay:'0.4s'}}></span>
                  <span className="w-1.5 bg-emerald-400 voice-bar rounded-full h-6" style={{animationDelay:'0.1s'}}></span>
                  <span className="w-1.5 bg-emerald-400 voice-bar rounded-full h-3" style={{animationDelay:'0.3s'}}></span>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-4 left-10 w-[300px] glass-card bg-slate-900/90 border-slate-800/80 p-5 shadow-indigo-500/5 hover:border-indigo-500/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-4.5 h-4.5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Image Upload</p>
                      <p className="text-sm font-semibold text-white">Visual Diagnostic</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-950/50 text-indigo-300 text-[10px] border border-indigo-500/30 rounded-full font-medium">Active</span>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">Analyzing skin lesion image. Checking features against dermoscopic validation models...</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Powerful Clinical Capacities
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Equipped with multiple diagnostic vectors, Arogya handles symptom checks, imaging, and bio-records in a unified system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className={`glass-card glass-card-hover border-slate-900/80 p-6 flex flex-col justify-between ${feature.border}`}
                >
                  <div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                      <Icon className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{feature.description}</p>
                  </div>
                  <div className="flex items-center text-xs text-teal-400 font-semibold group cursor-pointer hover:text-teal-300 transition-colors">
                    <span>Explore integration guidelines</span>
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Symptom Preview Section */}
      <section id="demo" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Clinical Playground</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Try the AI Symptom Sandbox
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Select sample symptoms and run a local mock analysis. See how the AI engine assesses risk levels, flags critical concerns, and recommends specific physician specialists.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <span>No data leaves your local browser</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300 text-sm">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <span>Interactive calculations takes 1.5s</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-card bg-slate-900/40 border-slate-800/80 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-400" />
                  Symptom Selector
                </h3>
                
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {symptomList.map(symptom => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          isSelected
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-inner'
                            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-5">
                  <p className="text-xs text-slate-500">
                    {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 && 's'} selected
                  </p>
                  <button
                    onClick={handlePreviewAnalyze}
                    disabled={selectedSymptoms.length === 0 || isAnalyzing}
                    className={`btn-premium-primary text-xs py-2 px-5 ${
                      selectedSymptoms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        Running Analysis...
                      </>
                    ) : (
                      <>
                        Analyze Symptoms
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Analysis Preview Output */}
                <AnimatePresence mode="wait">
                  {previewAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 p-4 bg-slate-950/60 border border-teal-500/10 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Potential Indication</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{previewAnalysis.condition}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-teal-950 text-teal-400 text-[10px] font-bold rounded-full border border-teal-500/30">
                          {previewAnalysis.risk} Risk
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Home Care Recommendations</p>
                        <ul className="space-y-1">
                          {previewAnalysis.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 flex items-center justify-between">
                        <span>Suggested Specialist: <strong className="text-slate-300">{previewAnalysis.specialist}</strong></span>
                        <span className="text-[10px] text-teal-400/80 italic">Click Get Started for full consultation</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Protocol / Reminders */}
      <section id="reminders" className="py-24 border-t border-slate-900 bg-slate-950/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card bg-slate-900/60 border-slate-800/80 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center tracking-tight">
              Clinical Guidelines & Protocol Limits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center space-x-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  <span>Clinical Consult Scope</span>
                </h3>
                <ul className="space-y-2.5 text-slate-400 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">•</span>
                    <span>Detailed symptom-checking query scripts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">•</span>
                    <span>Initial diagnostic categorization based on standard models.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">•</span>
                    <span>General supportive care & home wellness suggestions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">•</span>
                    <span>Biomarker interpretation from uploaded chemistry panels.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center space-x-2 text-base">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span>Critical Exclusions</span>
                </h3>
                <ul className="space-y-2.5 text-slate-400 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Cannot replace actual physician validation exams.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Not suitable for emergency medical cases.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Cannot formulate complex prescription plans.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>All critical diagnostics require in-person care.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-950/80 border-l-4 border-teal-500 p-5 rounded-r-xl">
              <p className="text-white font-semibold text-sm">💡 Professional Suggestion:</p>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Describe symptoms with rich details, including onset duration, severity, modifying factors, and current therapies. The platforms uses this information to structure accurate recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900/30 text-center relative">
        <div className="absolute top-[20%] left-[50%] -translate-x-[50%] w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Ready to Analyze Your Health Indicators?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Create a demo account to start consulting Dr. Arogya and manage family records.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetStarted}
            className="btn-premium-primary text-base px-8 py-3.5 inline-flex"
          >
            Launch Free Consultation Hub
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center text-slate-500 text-xs sm:text-sm space-y-2">
        <p>&copy; 2026 Arogya Platform - AI Clinician. All rights reserved.</p>
        <p className="max-w-lg mx-auto text-[11px] text-slate-600 px-4">
          Disclaimer: This system provides mock informational calculations for research/demo purposes only. Consult emergency services or registered practitioners for medical assistance.
        </p>
      </footer>
    </div>
  );
}
