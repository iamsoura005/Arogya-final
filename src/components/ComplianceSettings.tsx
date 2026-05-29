import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Download,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Globe,
  User,
  Key,
  Database,
  Archive
} from 'lucide-react';
import {
  getPrivacySettings,
  updatePrivacySettings,
  getUserAuditLogs,
  getConsentStatus,
  recordConsent,
  requestDataExport,
  requestDataDeletion,
  encryptData,
  decryptData,
  ConsentRecord
} from '../services/complianceService';

interface ComplianceSettingsProps {
  onBack?: () => void;
}

const ComplianceSettings: React.FC<ComplianceSettingsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'consent' | 'audit' | 'export' | 'delete'>('privacy');
  const [privacySettings, setPrivacySettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [consentRecords, setConsentRecords] = useState<any[]>([]);
  const [exportRequests, setExportRequests] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [testEncryption, setTestEncryption] = useState('');
  const [encryptedText, setEncryptedText] = useState('');

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const settings = getPrivacySettings(userId);
    setPrivacySettings(settings);

    const logs = getUserAuditLogs(userId);
    setAuditLogs(logs);

    // Get consent status and convert to array format
    const consentStatus = getConsentStatus(userId);
    const consentArray = Object.entries(consentStatus).map(([consentType, granted]) => ({
      id: `consent_${consentType}`,
      userId,
      consentType: consentType as ConsentRecord['consentType'],
      granted,
      version: '1.0',
      timestamp: new Date().toISOString()
    }));
    setConsentRecords(consentArray);

    // Load export/deletion requests from localStorage
    const storedExports = localStorage.getItem('arogya_export_requests');
    const exports = storedExports ? JSON.parse(storedExports).filter((r: any) => r.userId === userId) : [];
    setExportRequests(exports);

    const storedDeletions = localStorage.getItem('arogya_deletion_requests');
    const deletions = storedDeletions ? JSON.parse(storedDeletions).filter((r: any) => r.userId === userId) : [];
    setDeletionRequests(deletions);
  };

  const handlePrivacySettingsUpdate = (key: string, value: any) => {
    const updatedSettings = { ...privacySettings, [key]: value };
    const newSettings = updatePrivacySettings(userId, updatedSettings);
    setPrivacySettings(newSettings);
  };

  const handleConsentUpdate = (consentType: string, granted: boolean) => {
    recordConsent(userId, consentType as ConsentRecord['consentType'], granted);
    loadData();
  };

  const handleDataExport = () => {
    const exportRequest = requestDataExport(userId);
    // Update local state
    const storedExports = localStorage.getItem('arogya_export_requests');
    const exports = storedExports ? JSON.parse(storedExports) : [];
    setExportRequests(exports.filter((r: any) => r.userId === userId));
    alert('Data export request submitted! You will receive a download link within 24 hours.');
  };

  const handleDataDeletion = () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    const deletionRequest = requestDataDeletion(userId, deleteReason);
    // Update local state
    const storedDeletions = localStorage.getItem('arogya_deletion_requests');
    const deletions = storedDeletions ? JSON.parse(storedDeletions) : [];
    setDeletionRequests(deletions.filter((r: any) => r.userId === userId));
    setShowDeleteModal(false);
    setDeleteReason('');
    alert(
      `Data deletion request submitted!\n\n` +
      `Confirmation Code: ${deletionRequest.confirmationCode}\n\n` +
      `Your data will be permanently deleted within 30 days.`
    );
  };

  const handleTestEncryption = () => {
    if (testEncryption.trim()) {
      const encrypted = encryptData(testEncryption);
      setEncryptedText(encrypted);
    }
  };

  const handleTestDecryption = () => {
    if (encryptedText.trim()) {
      try {
        const decrypted = decryptData(encryptedText);
        alert(`Decrypted text: ${decrypted}`);
      } catch (error) {
        alert('Decryption failed. Invalid encrypted text.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
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
            <Shield size={32} />
            <h1 className="text-3xl font-bold">Compliance & Privacy</h1>
          </div>
          <p className="text-blue-100">HIPAA/GDPR Compliance, Data Control & Audit Logs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'privacy', label: 'Privacy Settings', icon: Lock },
            { id: 'consent', label: 'Consent Management', icon: CheckCircle },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
            { id: 'export', label: 'Export Data', icon: Download },
            { id: 'delete', label: 'Delete Data', icon: Trash2 }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={20} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'privacy' && privacySettings && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Privacy Settings */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="text-blue-600" />
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  {/* Data Retention */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">Data Retention Period</h3>
                        <p className="text-sm text-gray-600">How long to keep your health data</p>
                      </div>
                      <select
                        value={privacySettings.dataRetentionDays}
                        onChange={(e) => handlePrivacySettingsUpdate('dataRetentionDays', parseInt(e.target.value))}
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                        <option value={-1}>Forever</option>
                      </select>
                    </div>
                  </div>

                  {/* Anonymous Analytics */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">Anonymous Analytics</h3>
                        <p className="text-sm text-gray-600">Help us improve by sharing anonymous usage data</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowAnonymousAnalytics}
                          onChange={(e) => handlePrivacySettingsUpdate('allowAnonymousAnalytics', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Personalized Ads */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">Personalized Ads</h3>
                        <p className="text-sm text-gray-600">Allow personalized health-related advertisements</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowPersonalizedAds}
                          onChange={(e) => handlePrivacySettingsUpdate('allowPersonalizedAds', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Third Party Sharing */}
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">Third-Party Sharing</h3>
                        <p className="text-sm text-gray-600">Share data with research partners (anonymized)</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowThirdPartySharing}
                          onChange={(e) => handlePrivacySettingsUpdate('allowThirdPartySharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Auto Delete */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">Auto-Delete After Inactivity</h3>
                        <p className="text-sm text-gray-600">Automatically delete account after period of no use</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.autoDeleteAfterInactive}
                          onChange={(e) => handlePrivacySettingsUpdate('autoDeleteAfterInactive', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {privacySettings.autoDeleteAfterInactive && (
                      <select
                        value={privacySettings.inactiveDays}
                        onChange={(e) => handlePrivacySettingsUpdate('inactiveDays', parseInt(e.target.value))}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none mt-2"
                      >
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <p className="text-green-800 text-sm flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span><strong>All data is encrypted</strong> with AES-256 encryption at rest and in transit.</span>
                  </p>
                </div>
              </div>

              {/* Encryption Test */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Key className="text-purple-600" />
                  Encryption Test
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Text</label>
                    <input
                      type="text"
                      value={testEncryption}
                      onChange={(e) => setTestEncryption(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter text to encrypt"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTestEncryption}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg"
                  >
                    Encrypt Text
                  </motion.button>
                  
                  {encryptedText && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Encrypted Output</label>
                        <textarea
                          value={encryptedText}
                          readOnly
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 h-24 font-mono text-xs"
                        />
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleTestDecryption}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg"
                      >
                        Decrypt Text
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'consent' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle className="text-green-600" />
                  Consent Management
                </h2>

                <div className="space-y-4">
                  {consentRecords.map((consent, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg capitalize">
                            {consent.consentType.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {consent.granted ? 'Granted' : 'Denied'} on {new Date(consent.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Version: {consent.version}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.granted}
                            onChange={(e) => handleConsentUpdate(consent.consentType, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-700">
                        {consent.consentType === 'data_processing' && 'Allow processing of health data for diagnosis and recommendations'}
                        {consent.consentType === 'ai_analysis' && 'Allow AI models to analyze your health information'}
                        {consent.consentType === 'third_party_sharing' && 'Share anonymized data with research partners'}
                        {consent.consentType === 'marketing' && 'Receive health tips and product recommendations'}
                        {consent.consentType === 'research' && 'Participate in medical research studies'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Audit Logs ({auditLogs.length})
                </h2>

                {auditLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Eye size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No audit logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{log.action}</h3>
                            <p className="text-sm text-gray-600">{log.resource}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {log.details && (
                          <div className="mt-2 bg-white rounded p-2 text-xs font-mono">
                            {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                        
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                          {log.userAgent && <span>Device: {log.userAgent.slice(0, 50)}...</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Download className="text-green-600" />
                  Export Your Data
                </h2>

                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-2">GDPR Right to Data Portability</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    You have the right to receive a copy of all your personal data in a structured,
                    commonly used, and machine-readable format (JSON).
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDataExport}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Download size={20} />
                    Request Data Export
                  </motion.button>
                </div>

                {/* Export Requests */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Export History</h3>
                  
                  {exportRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No export requests yet</p>
                  ) : (
                    <div className="space-y-3">
                      {exportRequests.map((request) => (
                        <div key={request.id} className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Export Request #{request.id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">
                                Requested: {new Date(request.requestedAt).toLocaleString()}
                              </p>
                              {request.completedAt && (
                                <p className="text-sm text-gray-600">
                                  Completed: {new Date(request.completedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          
                          {request.downloadUrl && (
                            <a
                              href={request.downloadUrl}
                              className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Download size={16} />
                              Download Data
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'delete' && (
            <motion.div
              key="delete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Trash2 className="text-red-600" />
                  Delete Your Data
                </h2>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-red-600" />
                    GDPR Right to Erasure
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    You have the right to request deletion of all your personal data.
                    This action is <strong>permanent and cannot be undone</strong>.
                    We will retain minimal data as required by law.
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Trash2 size={20} />
                    Request Data Deletion
                  </motion.button>
                </div>

                {/* Deletion Requests */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Deletion History</h3>
                  
                  {deletionRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No deletion requests</p>
                  ) : (
                    <div className="space-y-3">
                      {deletionRequests.map((request) => (
                        <div key={request.id} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Deletion Request #{request.id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">
                                Requested: {new Date(request.requestedAt).toLocaleString()}
                              </p>
                              {request.completedAt && (
                                <p className="text-sm text-gray-600">
                                  Completed: {new Date(request.completedAt).toLocaleString()}
                                </p>
                              )}
                              {request.confirmationCode && (
                                <p className="text-sm font-mono bg-white px-2 py-1 rounded mt-2">
                                  Code: {request.confirmationCode}
                                </p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === 'completed' ? 'bg-gray-400 text-white' :
                              request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-red-600" size={32} />
                  <h3 className="text-2xl font-bold">Confirm Data Deletion</h3>
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This action will permanently delete:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-800 mt-2">
                    <li>All health consultations & records</li>
                    <li>Medication history & appointments</li>
                    <li>Personal information & preferences</li>
                    <li>AI analysis history</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Reason for deletion (required)
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none h-24"
                    placeholder="Please tell us why you're leaving..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDataDeletion}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded-lg hover:shadow-lg"
                  >
                    Delete My Data
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComplianceSettings;
