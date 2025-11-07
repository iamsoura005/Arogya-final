import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Watch,
  Link as LinkIcon,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Activity,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  Download,
  Upload
} from 'lucide-react';
import {
  connectAppleHealth,
  connectGoogleFit,
  disconnectPlatform,
  getSyncStatus,
  exportToAppleHealth,
  exportToGoogleFit,
  SyncStatus
} from '../services/exportService';

interface ExportSettingsProps {
  onBack?: () => void;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({ onBack }) => {
  const [appleSyncStatus, setAppleSyncStatus] = useState<SyncStatus | null>(null);
  const [googleSyncStatus, setGoogleSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState({
    apple: false,
    google: false
  });
  const [dataTypes, setDataTypes] = useState<{
    apple: Set<string>;
    google: Set<string>;
  }>({
    apple: new Set(['heart_rate', 'blood_pressure', 'weight']),
    google: new Set(['heart_rate', 'blood_pressure', 'weight'])
  });

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = () => {
    const appleStatus = getSyncStatus('apple');
    const googleStatus = getSyncStatus('google');
    setAppleSyncStatus(appleStatus);
    setGoogleSyncStatus(googleStatus);
  };

  const handleConnectApple = async () => {
    try {
      await connectAppleHealth();
      loadSyncStatus();
    } catch (error: any) {
      alert(error.message || 'Failed to connect to Apple Health');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      await connectGoogleFit();
      loadSyncStatus();
    } catch (error: any) {
      alert(error.message || 'Failed to connect to Google Fit');
    }
  };

  const handleDisconnect = async (platform: 'apple' | 'google') => {
    if (confirm(`Are you sure you want to disconnect ${platform === 'apple' ? 'Apple Health' : 'Google Fit'}?`)) {
      disconnectPlatform(platform);
      loadSyncStatus();
    }
  };

  const handleSyncNow = async (platform: 'apple' | 'google') => {
    setSyncing(true);
    try {
      // Get biomarkers from localStorage for demo
      const biomarkers = JSON.parse(localStorage.getItem('arogya_biomarkers') || '[]');
      
      if (platform === 'apple') {
        await exportToAppleHealth(userId, biomarkers);
      } else {
        await exportToGoogleFit(userId, biomarkers);
      }
      loadSyncStatus();
      alert('Sync completed successfully!');
    } catch (error: any) {
      alert(error.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const toggleDataType = (platform: 'apple' | 'google', type: string) => {
    setDataTypes(prev => {
      const newTypes = new Set(prev[platform]);
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }
      return { ...prev, [platform]: newTypes };
    });
  };

  const availableDataTypes = [
    { id: 'heart_rate', label: 'Heart Rate', icon: Heart },
    { id: 'blood_pressure', label: 'Blood Pressure', icon: Activity },
    { id: 'weight', label: 'Weight', icon: TrendingUp },
    { id: 'bmi', label: 'BMI', icon: TrendingUp },
    { id: 'glucose', label: 'Blood Glucose', icon: Activity },
    { id: 'spo2', label: 'Oxygen Saturation', icon: Activity },
    { id: 'temperature', label: 'Temperature', icon: Activity },
    { id: 'cholesterol', label: 'Cholesterol', icon: Activity }
  ];

  const renderPlatformCard = (
    platform: 'apple' | 'google',
    name: string,
    icon: React.ReactNode,
    syncStatus: SyncStatus | null,
    onConnect: () => void,
    onDisconnect: () => void,
    onSync: () => void
  ) => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="text-2xl font-bold">{name}</h3>
            {syncStatus && (
              <div className="flex items-center gap-2 mt-1">
                {syncStatus.status === 'connected' && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle size={16} />
                    Connected
                  </span>
                )}
                {syncStatus.status === 'syncing' && (
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <RefreshCw size={16} className="animate-spin" />
                    Syncing
                  </span>
                )}
                {syncStatus.status === 'error' && (
                  <span className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle size={16} />
                    Error
                  </span>
                )}
                {syncStatus.status === 'disconnected' && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <AlertCircle size={16} />
                    Not Connected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {syncStatus?.status === 'connected' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDisconnect}
            className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            <LogOut size={20} />
            Disconnect
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConnect}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg"
          >
            <LinkIcon size={20} />
            Connect
          </motion.button>
        )}
      </div>

      {syncStatus?.status === 'connected' && (
        <>
          {/* Last Sync Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Sync</p>
                <p className="font-medium">
                  {syncStatus.lastSyncDate
                    ? new Date(syncStatus.lastSyncDate).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Records Synced</p>
                <p className="font-medium">{syncStatus.recordsSynced || 0}</p>
              </div>
            </div>
            {syncStatus.error && (
              <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {syncStatus.error}
              </div>
            )}
          </div>

          {/* Data Types */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Sync Data Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {availableDataTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleDataType(platform, type.id)}
                    className={`flex items-center gap-2 border-2 rounded-lg p-3 transition-all ${
                      dataTypes[platform].has(type.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <TypeIcon size={18} className={dataTypes[platform].has(type.id) ? 'text-blue-600' : 'text-gray-400'} />
                    <span className="text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto Sync */}
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Auto Sync</h4>
              <p className="text-sm text-gray-600">Automatically sync data every hour</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync[platform]}
                onChange={(e) => setAutoSync({ ...autoSync, [platform]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSync}
              disabled={syncing}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Export to {name}
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSync}
              disabled={syncing}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Import from {name}
                </>
              )}
            </motion.button>
          </div>
        </>
      )}

      {syncStatus?.status !== 'connected' && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Connect to {name} to sync your health data</p>
          <p className="text-sm">Track metrics across all your devices</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 shadow-lg">
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
            <Smartphone size={32} />
            <h1 className="text-3xl font-bold">Export & Sync Settings</h1>
          </div>
          <p className="text-blue-100">Connect Apple Health & Google Fit for seamless data sync</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Watch className="text-blue-600" />
            Ecosystem Integration
          </h2>
          <p className="text-gray-700 mb-4">
            Sync your health data with Apple Health and Google Fit to track metrics across all your devices.
            All data is encrypted and synced securely.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span>Two-way sync</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span>Encrypted transfer</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={16} />
              <span>Auto sync available</span>
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Apple Health */}
          {renderPlatformCard(
            'apple',
            'Apple Health',
            <div className="text-4xl">🍎</div>,
            appleSyncStatus,
            handleConnectApple,
            () => handleDisconnect('apple'),
            () => handleSyncNow('apple')
          )}

          {/* Google Fit */}
          {renderPlatformCard(
            'google',
            'Google Fit',
            <div className="text-4xl">🏃</div>,
            googleSyncStatus,
            handleConnectGoogle,
            () => handleDisconnect('google'),
            () => handleSyncNow('google')
          )}
        </div>

        {/* Sync History */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            Recent Sync Activity
          </h2>

          <div className="space-y-3">
            {[appleSyncStatus, googleSyncStatus]
              .filter(status => status?.lastSyncDate)
              .map((status, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {status?.platform === 'apple' ? 'Apple Health' : 'Google Fit'} Sync
                      </p>
                      <p className="text-sm text-gray-600">
                        {status?.recordsSynced || 0} records synced
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {status?.lastSyncDate && new Date(status.lastSyncDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

            {!appleSyncStatus?.lastSyncDate && !googleSyncStatus?.lastSyncDate && (
              <p className="text-gray-500 text-center py-8">No sync activity yet</p>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Settings className="text-yellow-600" />
            Setup Instructions
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">Apple Health (iOS only)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open this page on your iPhone</li>
                <li>Click "Connect Apple Health"</li>
                <li>Grant permissions in Health app</li>
                <li>Data will sync automatically</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Google Fit (Android/Web)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Connect Google Fit"</li>
                <li>Sign in with Google account</li>
                <li>Authorize data access</li>
                <li>Configure sync settings</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSettings;
