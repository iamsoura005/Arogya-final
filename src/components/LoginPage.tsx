import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowLeft } from 'lucide-react';

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

  // Generate age group options
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
      setError('Please enter a valid email');
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        {/* Card */}
        <div className="card">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Arogya</h1>
            <p className="text-neutral-600">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-neutral-900 mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="input-field"
                      required={isSignUp}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-neutral-900 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="input-field"
                      required={isSignUp}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sex" className="block text-sm font-medium text-neutral-900 mb-2">
                      Sex
                    </label>
                    <select
                      id="sex"
                      value={sex}
                      onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')}
                      className="input-field"
                      required={isSignUp}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-neutral-900 mb-2">
                      Age Group
                    </label>
                    <select
                      id="ageGroup"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="input-field"
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
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-300" />
                  <span className="text-neutral-700">Remember me</span>
                </label>
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  Forgot password?
                </a>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full btn-primary py-2.5 font-medium"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEmail('demo@example.com');
                setPassword('demo123');
                setFirstName('Demo');
                setLastName('User');
                setSex('male');
                setAgeGroup('20-30');
              }}
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Demo Account (demo@example.com)
            </motion.button>
            <p className="text-center text-xs text-neutral-600">
              {isSignUp ? 'Fill all fields to create account' : 'Use any email/password (min 6 chars) to sign in'}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm">
            <span className="text-neutral-700">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
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
              className="ml-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-neutral-600 mt-8"
        >
          This is a demo application for testing purposes. No real medical data is stored.
        </motion.p>
      </motion.div>
    </div>
  );
}
