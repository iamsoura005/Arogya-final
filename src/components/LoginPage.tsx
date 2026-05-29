import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowLeft, ShieldCheck, Mail, Lock, Sparkles, User, Users } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    sex?: 'male' | 'female' | 'other';
    ageGroup?: string;
  }) => void;
  onBackToLanding: () => void;
}

export default function LoginPage({ onLogin, onBackToLanding }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [ageGroup, setAgeGroup] = useState('20-30');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const ageGroups = [
    '0-10', '10-20', '20-30', '30-40', '40-50', 
    '50-60', '60-70', '70-80', '80-90', '90+'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      setError('Please enter your first and last name');
      return;
    }

    onLogin({
      email,
      password,
      ...(isSignUp && {
        firstName,
        lastName,
        sex,
        ageGroup
      })
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-overlay flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Landing Page</span>
        </motion.button>

        {/* Glassmorphic Container */}
        <div className="glass-card border-slate-800/80 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/10">
              <Stethoscope className="w-6 h-6 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Arogya Consultation Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {isSignUp ? 'Enroll in the medical platform' : 'Enter credentials to access clinical dashboard'}
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-xs flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="premium-input pl-10"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="premium-input"
                      required={isSignUp}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sex" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Biological Sex
                    </label>
                    <select
                      id="sex"
                      value={sex}
                      onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')}
                      className="premium-input bg-slate-900"
                      required={isSignUp}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ageGroup" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      Age Range
                    </label>
                    <select
                      id="ageGroup"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="premium-input bg-slate-900"
                      required={isSignUp}
                    >
                      {ageGroups.map((group) => (
                        <option key={group} value={group}>
                          {group} years
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="premium-input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="premium-input pl-10"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded bg-slate-900 border-slate-800 text-teal-500 focus:ring-teal-500/20" />
                  <span className="text-slate-400">Remember session</span>
                </label>
                <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">
                  Lost credentials?
                </a>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full btn-premium-primary py-3 font-semibold text-sm mt-6"
            >
              {isSignUp ? 'Create Diagnostic Profile' : 'Authenticate Session'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-slate-900"></div>
            <span className="px-3 text-slate-600 text-xs uppercase tracking-wider font-semibold">Demo Sandbox</span>
            <div className="flex-1 border-t border-slate-900"></div>
          </div>

          {/* Quick Demo Access */}
          <div className="space-y-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setEmail('demo@example.com');
                setPassword('demo123');
                setFirstName('Demo');
                setLastName('User');
                setSex('male');
                setAgeGroup('20-30');
              }}
              className="w-full bg-slate-900/60 hover:bg-slate-800 border border-slate-850 text-slate-300 py-2.5 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-teal-400" />
              Pre-load Sandbox Credentials
            </motion.button>
            <p className="text-center text-[10px] text-slate-500">
              {isSignUp ? 'Submit details to activate new account' : 'Accepts any mock address & password for easy demo access'}
            </p>
          </div>

          {/* Toggle Login/Signup */}
          <div className="text-center text-xs border-t border-slate-900 pt-6">
            <span className="text-slate-400">
              {isSignUp ? 'Have a clinical profile?' : "Don't have a diagnostic account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFirstName('');
                setLastName('');
                setSex('male');
                setAgeGroup('20-30');
              }}
              className="ml-1.5 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Authenticate Here' : 'Create One Here'}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-slate-500 mt-6 flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-teal-500/80" />
          <span>Local Session Storage Enforced. Fully Encrypted Client Pipeline.</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
