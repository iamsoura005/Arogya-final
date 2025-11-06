import { motion } from 'framer-motion';
import { Stethoscope, Brain, Activity, Shield, Zap, Globe, CheckCircle2, Lightbulb } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Brain,
      title: 'AI Chatbot Consultation',
      description: 'Describe your symptoms and get preliminary guidance from our advanced AI doctor.'
    },
    {
      icon: Activity,
      title: 'Voice Bot Interface',
      description: 'Speak naturally about your health concerns. We listen and respond with comprehensive advice.'
    },
    {
      icon: Stethoscope,
      title: 'Medical Image Analysis',
      description: 'Upload medical images for AI-powered diagnostic analysis with confidence scores.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with enterprise-grade security.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get quick preliminary assessments 24/7 without appointment delays.'
    },
    {
      icon: Globe,
      title: 'Accessible Anywhere',
      description: 'Available on any device - mobile, tablet, or desktop. Anytime, anywhere.'
    }
  ];

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
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full bg-white bg-opacity-95 backdrop-blur-md z-50 border-b border-neutral-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Arogya
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-700 hover:text-primary-600 transition">Features</a>
              <a href="#about" className="text-neutral-700 hover:text-primary-600 transition">About</a>
              <button
                onClick={onGetStarted}
                className="btn-primary"
              >
                Get Started
              </button>
            </nav>
            <div className="md:hidden">
              <button
                onClick={onGetStarted}
                className="btn-primary btn-sm"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Your AI-Powered <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Health Companion</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-700 mb-8 max-w-2xl mx-auto">
              Experience personalized health consultations powered by advanced AI. Get instant preliminary assessments, voice-based interactions, and medical image analysis in one integrated platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="btn-primary text-lg px-8 py-3 inline-block"
            >
              Start Your Consultation
            </motion.button>
          </motion.div>

          {/* Floating cards animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 relative h-72 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute left-0 top-0 bg-white rounded-xl shadow-xl p-6 w-64"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Chat Consultation</h3>
              <p className="text-neutral-700 text-sm">Real-time conversation with AI doctor</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute right-32 top-20 bg-white rounded-xl shadow-xl p-6 w-64"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Voice Bot</h3>
              <p className="text-neutral-700 text-sm">Speak naturally, get instant response</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute right-0 bottom-0 bg-white rounded-xl shadow-xl p-6 w-64"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Image Analysis</h3>
              <p className="text-neutral-700 text-sm">Upload images for AI diagnosis</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-neutral-700">Everything you need for comprehensive health consultations</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-700">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">How It Works</h2>
            <p className="text-lg text-neutral-700">Get medical guidance in 4 simple steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Describe Your Symptoms',
                description: 'Tell Dr. Arogya about your health concerns, symptoms, and medical history in detail.'
              },
              {
                step: '2',
                title: 'AI Analysis',
                description: 'Our advanced AI doctor analyzes your symptoms and asks targeted clinical questions.'
              },
              {
                step: '3',
                title: 'Get Recommendations',
                description: 'Receive personalized medical recommendations including medications and lifestyle changes.'
              },
              {
                step: '4',
                title: 'Download & Follow Up',
                description: 'Download your prescription and follow the advice. Consult a doctor for persistent issues.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-primary-50 rounded-xl p-6 h-full border border-primary-200">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-neutral-700 text-sm">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-8">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Arogya */}
      <motion.section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Why Choose Arogya?</h2>
            <p className="text-lg text-neutral-700">Experience healthcare reimagined with AI and compassion</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏥',
                title: 'Real Doctor Behavior',
                description: 'Dr. Arogya acts like a real medical professional - asking targeted questions, listening carefully, and providing evidence-based recommendations.'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Powered by DeepSeek AI for ultra-fast responses. Get medical guidance in seconds, not hours.'
              },
              {
                icon: '📋',
                title: 'Prescriptions Included',
                description: 'Download prescriptions in PDF, Text, or HTML format. Share with your pharmacist or keep for records.'
              },
              {
                icon: '🔒',
                title: 'Private & Secure',
                description: 'Your health data is never stored. 100% confidential conversations with enterprise-grade security.'
              },
              {
                icon: '🕐',
                title: 'Available 24/7',
                description: 'No waiting lists, no appointment delays. Get medical guidance anytime, anywhere, on any device.'
              },
              {
                icon: '🏥',
                title: 'Not a Replacement',
                description: 'This is preliminary guidance only. We always recommend consulting with a licensed doctor in person for serious conditions.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-neutral-700 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Before CTA */}
      <motion.section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">What to Expect from Dr. Arogya</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>During Consultation</span>
                </h3>
                <ul className="space-y-2 text-neutral-700 text-sm">
                  <li>• Targeted clinical questions</li>
                  <li>• Careful symptom analysis</li>
                  <li>• Professional medical guidance</li>
                  <li>• Specific medication recommendations</li>
                  <li>• Lifestyle and home care advice</li>
                  <li>• Clear warning signs to watch for</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  <span>Important Reminders</span>
                </h3>
                <ul className="space-y-2 text-neutral-700 text-sm">
                  <li>• Preliminary guidance only</li>
                  <li>• Not a substitute for in-person exam</li>
                  <li>• Emergency symptoms need ER visit</li>
                  <li>• See a doctor for persistent symptoms</li>
                  <li>• Mention all current medications</li>
                  <li>• Be honest about medical history</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded">
              <p className="text-neutral-900 font-medium">💡 Pro Tip:</p>
              <p className="text-neutral-700 text-sm mt-2">Be as detailed as possible when describing your symptoms. The more information you provide, the better Dr. Arogya can help you. Include timing, severity, associated symptoms, and what makes it better or worse.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-primary-100 mb-8">Join thousands of users who trust Arogya for preliminary health consultations.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg"
          >
            Start Free Consultation
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Arogya - AI Doctor & Diagnostic Platform. All rights reserved.</p>
          <p className="mt-2 text-sm">Disclaimer: For informational purposes only. Not a substitute for professional medical advice.</p>
        </div>
      </motion.footer>
    </div>
  );
}
