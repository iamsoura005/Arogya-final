/**
 * HIPAA/GDPR Compliance Service
 * Handles encryption, audit logs, data export/deletion, and consent management
 */

import CryptoJS from 'crypto-js';

// ============= TYPES =============

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'ai_analysis' | 'third_party_sharing' | 'marketing' | 'research';
  granted: boolean;
  version: string;
  timestamp: string;
  ipAddress?: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  reason?: string;
  confirmationCode?: string;
}

export interface EncryptionStatus {
  enabled: boolean;
  algorithm: string;
  keyRotationDate?: string;
  lastVerified?: string;
}

export interface PrivacySettings {
  userId: string;
  dataRetentionDays: number;
  allowAnonymousAnalytics: boolean;
  allowPersonalizedAds: boolean;
  allowThirdPartySharing: boolean;
  autoDeleteAfterInactive: boolean;
  inactiveDays: number;
  updatedAt: string;
}

// ============= ENCRYPTION =============

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'arogya_default_key_change_in_production';

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Encrypt object
 */
export function encryptObject<T>(obj: T): string {
  return encryptData(JSON.stringify(obj));
}

/**
 * Decrypt object
 */
export function decryptObject<T>(encryptedData: string): T {
  const decrypted = decryptData(encryptedData);
  return JSON.parse(decrypted);
}

/**
 * Get encryption status
 */
export function getEncryptionStatus(): EncryptionStatus {
  const status = localStorage.getItem('arogya_encryption_status');
  return status ? JSON.parse(status) : {
    enabled: true,
    algorithm: 'AES-256',
    keyRotationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastVerified: new Date().toISOString()
  };
}

// ============= AUDIT LOGGING =============

/**
 * Create audit log entry
 */
export function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
): AuditLog {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    resource,
    resourceId,
    ipAddress: getClientIP(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    details
  };

  const logs = getStoredAuditLogs();
  logs.push(log);
  
  // Keep only last 10,000 logs to prevent storage overflow
  const trimmedLogs = logs.slice(-10000);
  localStorage.setItem('arogya_audit_logs', JSON.stringify(trimmedLogs));

  return log;
}

/**
 * Get stored audit logs
 */
function getStoredAuditLogs(): AuditLog[] {
  const stored = localStorage.getItem('arogya_audit_logs');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's audit logs
 */
export function getUserAuditLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
): AuditLog[] {
  const logs = getStoredAuditLogs();
  return logs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(offset, offset + limit);
}

/**
 * Search audit logs
 */
export function searchAuditLogs(
  userId: string,
  filters: {
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }
): AuditLog[] {
  let logs = getStoredAuditLogs().filter(log => log.userId === userId);

  if (filters.action) {
    logs = logs.filter(log => log.action.includes(filters.action!));
  }

  if (filters.resource) {
    logs = logs.filter(log => log.resource === filters.resource);
  }

  if (filters.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate!));
  }

  if (filters.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate!));
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get client IP (requires backend in production)
 */
function getClientIP(): string {
  // In production, get from backend
  // For demo, return placeholder
  return '127.0.0.1';
}

// ============= CONSENT MANAGEMENT =============

/**
 * Record user consent
 */
export function recordConsent(
  userId: string,
  consentType: ConsentRecord['consentType'],
  granted: boolean,
  version: string = '1.0'
): ConsentRecord {
  const consent: ConsentRecord = {
    id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    consentType,
    granted,
    version,
    timestamp: new Date().toISOString(),
    ipAddress: getClientIP()
  };

  const consents = getStoredConsents();
  consents.push(consent);
  localStorage.setItem('arogya_consents', JSON.stringify(consents));

  // Log audit
  logAudit(userId, granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED', 'consent', consent.id, {
    consentType,
    version
  });

  return consent;
}

/**
 * Get stored consents
 */
function getStoredConsents(): ConsentRecord[] {
  const stored = localStorage.getItem('arogya_consents');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's consent status
 */
export function getConsentStatus(userId: string): Record<string, boolean> {
  const consents = getStoredConsents();
  const userConsents = consents
    .filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const status: Record<string, boolean> = {};
  const consentTypes: ConsentRecord['consentType'][] = [
    'data_processing',
    'ai_analysis',
    'third_party_sharing',
    'marketing',
    'research'
  ];

  consentTypes.forEach(type => {
    const latestConsent = userConsents.find(c => c.consentType === type);
    status[type] = latestConsent?.granted ?? false;
  });

  return status;
}

/**
 * Check if user has granted specific consent
 */
export function hasConsent(userId: string, consentType: ConsentRecord['consentType']): boolean {
  const status = getConsentStatus(userId);
  return status[consentType] ?? false;
}

// ============= DATA EXPORT (GDPR Right to Access) =============

/**
 * Request data export
 */
export function requestDataExport(userId: string): DataExportRequest {
  const request: DataExportRequest = {
    id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  const requests = getStoredExportRequests();
  requests.push(request);
  localStorage.setItem('arogya_export_requests', JSON.stringify(requests));

  // Log audit
  logAudit(userId, 'DATA_EXPORT_REQUESTED', 'export_request', request.id);

  // Process export (async in production)
  setTimeout(() => processDataExport(request.id), 1000);

  return request;
}

/**
 * Get stored export requests
 */
function getStoredExportRequests(): DataExportRequest[] {
  const stored = localStorage.getItem('arogya_export_requests');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Process data export
 */
async function processDataExport(requestId: string): Promise<void> {
  const requests = getStoredExportRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (!request) return;

  // Update status to processing
  request.status = 'processing';
  localStorage.setItem('arogya_export_requests', JSON.stringify(requests));

  try {
    // Collect all user data
    const userData = collectUserData(request.userId);
    
    // Create download blob
    const dataBlob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    // Update request
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.downloadUrl = url;
    request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    localStorage.setItem('arogya_export_requests', JSON.stringify(requests));

    // Log audit
    logAudit(request.userId, 'DATA_EXPORT_COMPLETED', 'export_request', requestId);
  } catch (error) {
    request.status = 'failed';
    localStorage.setItem('arogya_export_requests', JSON.stringify(requests));
    
    logAudit(request.userId, 'DATA_EXPORT_FAILED', 'export_request', requestId, {
      error: (error as Error).message
    });
  }
}

/**
 * Collect all user data for export
 */
function collectUserData(userId: string): any {
  return {
    userId,
    exportDate: new Date().toISOString(),
    personalInfo: JSON.parse(localStorage.getItem('arogya_user_profile') || '{}'),
    appointments: JSON.parse(localStorage.getItem('arogya_appointments') || '[]').filter((a: any) => a.userId === userId),
    medications: JSON.parse(localStorage.getItem('arogya_medication_schedules') || '[]').filter((m: any) => m.userId === userId),
    medicationLogs: JSON.parse(localStorage.getItem('arogya_medication_logs') || '[]').filter((l: any) => l.userId === userId),
    consultations: JSON.parse(localStorage.getItem(`arogya_consultations_${userId}`) || '[]'),
    emergencyContacts: JSON.parse(localStorage.getItem('arogya_emergency_contacts') || '[]').filter((c: any) => c.userId === userId),
    healthRecords: JSON.parse(localStorage.getItem(`arogya_health_records_${userId}`) || '[]'),
    auditLogs: getUserAuditLogs(userId, 1000),
    consents: getStoredConsents().filter(c => c.userId === userId),
    privacySettings: getPrivacySettings(userId)
  };
}

/**
 * Get export request status
 */
export function getExportRequest(requestId: string): DataExportRequest | undefined {
  const requests = getStoredExportRequests();
  return requests.find(r => r.id === requestId);
}

// ============= DATA DELETION (GDPR Right to Erasure) =============

/**
 * Request data deletion
 */
export function requestDataDeletion(userId: string, reason?: string): DataDeletionRequest {
  const confirmationCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const request: DataDeletionRequest = {
    id: `delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    reason,
    confirmationCode
  };

  const requests = getStoredDeletionRequests();
  requests.push(request);
  localStorage.setItem('arogya_deletion_requests', JSON.stringify(requests));

  // Log audit
  logAudit(userId, 'DATA_DELETION_REQUESTED', 'deletion_request', request.id, { reason });

  return request;
}

/**
 * Get stored deletion requests
 */
function getStoredDeletionRequests(): DataDeletionRequest[] {
  const stored = localStorage.getItem('arogya_deletion_requests');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Confirm and process data deletion
 */
export function confirmDataDeletion(requestId: string, confirmationCode: string): boolean {
  const requests = getStoredDeletionRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (!request || request.confirmationCode !== confirmationCode) {
    return false;
  }

  // Update status
  request.status = 'processing';
  localStorage.setItem('arogya_deletion_requests', JSON.stringify(requests));

  // Delete all user data
  try {
    deleteAllUserData(request.userId);
    
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    localStorage.setItem('arogya_deletion_requests', JSON.stringify(requests));

    return true;
  } catch (error) {
    request.status = 'failed';
    localStorage.setItem('arogya_deletion_requests', JSON.stringify(requests));
    return false;
  }
}

/**
 * Delete all user data
 */
function deleteAllUserData(userId: string): void {
  // Remove from all storage locations
  const keysToCheck = Object.keys(localStorage);
  
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (!value) return;

    try {
      const data = JSON.parse(value);
      
      if (Array.isArray(data)) {
        const filtered = data.filter((item: any) => item.userId !== userId);
        if (filtered.length < data.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } else if (data.userId === userId) {
        localStorage.removeItem(key);
      }
    } catch {
      // Not JSON, skip
    }
  });

  // Remove user-specific keys
  localStorage.removeItem(`arogya_consultations_${userId}`);
  localStorage.removeItem(`arogya_health_records_${userId}`);
  
  // Final audit log before user data is gone
  logAudit(userId, 'DATA_DELETED', 'user_account', userId);
}

// ============= PRIVACY SETTINGS =============

/**
 * Update privacy settings
 */
export function updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): PrivacySettings {
  const current = getPrivacySettings(userId);
  const updated: PrivacySettings = {
    ...current,
    ...settings,
    userId,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(`arogya_privacy_settings_${userId}`, JSON.stringify(updated));
  
  logAudit(userId, 'PRIVACY_SETTINGS_UPDATED', 'privacy_settings', userId, settings);
  
  return updated;
}

/**
 * Get privacy settings
 */
export function getPrivacySettings(userId: string): PrivacySettings {
  const stored = localStorage.getItem(`arogya_privacy_settings_${userId}`);
  
  if (stored) {
    return JSON.parse(stored);
  }

  // Default settings
  return {
    userId,
    dataRetentionDays: 365,
    allowAnonymousAnalytics: true,
    allowPersonalizedAds: false,
    allowThirdPartySharing: false,
    autoDeleteAfterInactive: false,
    inactiveDays: 180,
    updatedAt: new Date().toISOString()
  };
}

// ============= HIPAA BUSINESS ASSOCIATE AGREEMENT =============

export interface HIPAACompliance {
  userId: string;
  organizationName?: string;
  agreementSigned: boolean;
  signedDate?: string;
  agreementVersion: string;
  privacyOfficer?: {
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Record HIPAA agreement
 */
export function recordHIPAAAgreement(
  userId: string,
  organizationName: string,
  privacyOfficer: HIPAACompliance['privacyOfficer']
): HIPAACompliance {
  const agreement: HIPAACompliance = {
    userId,
    organizationName,
    agreementSigned: true,
    signedDate: new Date().toISOString(),
    agreementVersion: '1.0',
    privacyOfficer
  };

  localStorage.setItem(`arogya_hipaa_${userId}`, JSON.stringify(agreement));
  
  logAudit(userId, 'HIPAA_AGREEMENT_SIGNED', 'hipaa_compliance', userId, {
    organizationName,
    version: agreement.agreementVersion
  });

  return agreement;
}

/**
 * Get HIPAA compliance status
 */
export function getHIPAACompliance(userId: string): HIPAACompliance | null {
  const stored = localStorage.getItem(`arogya_hipaa_${userId}`);
  return stored ? JSON.parse(stored) : null;
}

export default {
  encryptData,
  decryptData,
  hashData,
  encryptObject,
  decryptObject,
  getEncryptionStatus,
  logAudit,
  getUserAuditLogs,
  searchAuditLogs,
  recordConsent,
  getConsentStatus,
  hasConsent,
  requestDataExport,
  getExportRequest,
  requestDataDeletion,
  confirmDataDeletion,
  updatePrivacySettings,
  getPrivacySettings,
  recordHIPAAAgreement,
  getHIPAACompliance
};
