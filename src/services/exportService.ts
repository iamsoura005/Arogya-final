/**
 * Health Data Export Service
 * Exports data to Apple Health and Google Fit
 */

import { Biomarker } from './healthAnalyticsService';

// ============= TYPES =============

export interface HealthKitData {
  type: string;
  value: number;
  unit: string;
  startDate: string;
  endDate: string;
  metadata?: Record<string, any>;
}

export interface GoogleFitData {
  dataTypeName: string;
  dataSourceId: string;
  maxEndTimeNs: number;
  minStartTimeNs: number;
  point: Array<{
    startTimeNanos: number;
    endTimeNanos: number;
    dataTypeName: string;
    value: Array<{
      fpVal?: number;
      intVal?: number;
      mapVal?: Array<{ key: string; value: { fpVal?: number; intVal?: number } }>;
    }>;
  }>;
}

export interface ExportConfig {
  platform: 'apple' | 'google';
  dataTypes: string[];
  startDate: string;
  endDate: string;
  autoSync: boolean;
}

export interface SyncStatus {
  platform: 'apple' | 'google';
  lastSyncDate?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  recordsSynced?: number;
  error?: string;
}

// ============= APPLE HEALTH EXPORT =============

/**
 * Convert biomarker to HealthKit format
 */
export function convertToHealthKit(biomarker: Biomarker): HealthKitData {
  const healthKitTypes: Record<string, string> = {
    'blood_pressure': 'HKQuantityTypeIdentifierBloodPressure',
    'glucose': 'HKQuantityTypeIdentifierBloodGlucose',
    'heart_rate': 'HKQuantityTypeIdentifierHeartRate',
    'weight': 'HKQuantityTypeIdentifierBodyMass',
    'bmi': 'HKQuantityTypeIdentifierBodyMassIndex',
    'temperature': 'HKQuantityTypeIdentifierBodyTemperature',
    'spo2': 'HKQuantityTypeIdentifierOxygenSaturation',
    'cholesterol': 'HKQuantityTypeIdentifierBloodCholesterol'
  };

  return {
    type: healthKitTypes[biomarker.type] || 'HKQuantityTypeIdentifierOther',
    value: biomarker.value,
    unit: biomarker.unit,
    startDate: biomarker.timestamp,
    endDate: biomarker.timestamp,
    metadata: {
      source: 'Arogya Health',
      dataSource: biomarker.source
    }
  };
}

/**
 * Export data to Apple Health
 */
export async function exportToAppleHealth(
  userId: string,
  biomarkers: Biomarker[]
): Promise<{ success: boolean; recordsExported: number; error?: string }> {
  try {
    // Check if HealthKit is available (iOS only)
    if (!isAppleHealthAvailable()) {
      return {
        success: false,
        recordsExported: 0,
        error: 'Apple Health is only available on iOS devices'
      };
    }

    // Convert biomarkers to HealthKit format
    const healthKitData = biomarkers.map(convertToHealthKit);

    // In production, use HealthKit API
    // For now, create downloadable XML file in Apple Health format
    const xmlData = generateAppleHealthXML(healthKitData, userId);
    
    // Create download
    const blob = new Blob([xmlData], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arogya-health-export-${Date.now()}.xml`;
    link.click();

    // Update sync status
    updateSyncStatus('apple', {
      status: 'connected',
      lastSyncDate: new Date().toISOString(),
      recordsSynced: biomarkers.length
    });

    return {
      success: true,
      recordsExported: biomarkers.length
    };
  } catch (error) {
    return {
      success: false,
      recordsExported: 0,
      error: (error as Error).message
    };
  }
}

/**
 * Check if Apple Health is available
 */
function isAppleHealthAvailable(): boolean {
  // Check if running on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS; // In production, check for HealthKit availability
}

/**
 * Generate Apple Health XML export
 */
function generateAppleHealthXML(data: HealthKitData[], userId: string): string {
  const records = data.map(item => `
    <Record type="${item.type}" 
            sourceName="Arogya Health" 
            sourceVersion="1.0"
            unit="${item.unit}" 
            value="${item.value}"
            startDate="${item.startDate}" 
            endDate="${item.endDate}">
      ${item.metadata ? `
      <MetadataEntry key="source" value="${item.metadata.source}"/>
      <MetadataEntry key="dataSource" value="${item.metadata.dataSource}"/>
      ` : ''}
    </Record>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE HealthData>
<HealthData locale="en_US">
  <ExportDate value="${new Date().toISOString()}"/>
  <Me HKCharacteristicTypeIdentifierBiologicalSex="NotSet" 
      HKCharacteristicTypeIdentifierBloodType="NotSet">
  </Me>
  ${records}
</HealthData>`;
}

// ============= GOOGLE FIT EXPORT =============

/**
 * Convert biomarker to Google Fit format
 */
export function convertToGoogleFit(biomarker: Biomarker): GoogleFitData {
  const fitTypes: Record<string, string> = {
    'blood_pressure': 'com.google.blood_pressure',
    'glucose': 'com.google.blood_glucose',
    'heart_rate': 'com.google.heart_rate.bpm',
    'weight': 'com.google.weight',
    'bmi': 'com.google.body.mass.index',
    'temperature': 'com.google.body.temperature',
    'spo2': 'com.google.oxygen_saturation',
    'cholesterol': 'com.google.cholesterol'
  };

  const startTimeNanos = new Date(biomarker.timestamp).getTime() * 1000000;
  const endTimeNanos = startTimeNanos;

  return {
    dataTypeName: fitTypes[biomarker.type] || 'com.google.other',
    dataSourceId: 'raw:com.arogya.health:',
    maxEndTimeNs: endTimeNanos,
    minStartTimeNs: startTimeNanos,
    point: [{
      startTimeNanos,
      endTimeNanos,
      dataTypeName: fitTypes[biomarker.type] || 'com.google.other',
      value: [{
        fpVal: biomarker.value
      }]
    }]
  };
}

/**
 * Export data to Google Fit
 */
export async function exportToGoogleFit(
  userId: string,
  biomarkers: Biomarker[]
): Promise<{ success: boolean; recordsExported: number; error?: string }> {
  try {
    // Check if Google Fit is available
    if (!isGoogleFitAvailable()) {
      return {
        success: false,
        recordsExported: 0,
        error: 'Google Fit API not configured. Please enable Google Fit integration.'
      };
    }

    // Convert biomarkers to Google Fit format
    const fitData = biomarkers.map(convertToGoogleFit);

    // In production, use Google Fit REST API
    // For now, create downloadable JSON file
    const jsonData = JSON.stringify({
      dataSource: {
        type: 'raw',
        application: {
          name: 'Arogya Health',
          version: '1.0'
        }
      },
      data: fitData
    }, null, 2);

    // Create download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arogya-googlefit-export-${Date.now()}.json`;
    link.click();

    // Update sync status
    updateSyncStatus('google', {
      status: 'connected',
      lastSyncDate: new Date().toISOString(),
      recordsSynced: biomarkers.length
    });

    return {
      success: true,
      recordsExported: biomarkers.length
    };
  } catch (error) {
    return {
      success: false,
      recordsExported: 0,
      error: (error as Error).message
    };
  }
}

/**
 * Check if Google Fit is available
 */
function isGoogleFitAvailable(): boolean {
  // In production, check for Google Fit API configuration
  // For now, return true to allow export
  return true;
}

/**
 * Initialize Google Fit connection
 */
export async function connectGoogleFit(): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, use Google OAuth 2.0
    // const CLIENT_ID = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID;
    // const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.write';
    
    // For demo, simulate connection
    updateSyncStatus('google', {
      status: 'connected',
      lastSyncDate: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Initialize Apple Health connection
 */
export async function connectAppleHealth(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isAppleHealthAvailable()) {
      return {
        success: false,
        error: 'Apple Health is only available on iOS devices'
      };
    }

    // In production, request HealthKit authorization
    // For demo, simulate connection
    updateSyncStatus('apple', {
      status: 'connected',
      lastSyncDate: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ============= SYNC STATUS MANAGEMENT =============

/**
 * Update sync status
 */
function updateSyncStatus(platform: 'apple' | 'google', status: Partial<SyncStatus>): void {
  const key = `arogya_sync_${platform}`;
  const current = getSyncStatus(platform);
  const updated = { ...current, ...status, platform };
  localStorage.setItem(key, JSON.stringify(updated));
}

/**
 * Get sync status
 */
export function getSyncStatus(platform: 'apple' | 'google'): SyncStatus {
  const key = `arogya_sync_${platform}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    platform,
    status: 'disconnected'
  };
}

/**
 * Disconnect platform
 */
export function disconnectPlatform(platform: 'apple' | 'google'): void {
  updateSyncStatus(platform, {
    status: 'disconnected',
    lastSyncDate: undefined,
    recordsSynced: undefined
  });
}

// ============= AUTO-SYNC =============

/**
 * Enable auto-sync
 */
export function enableAutoSync(
  userId: string,
  platform: 'apple' | 'google',
  dataTypes: string[]
): void {
  const config: ExportConfig = {
    platform,
    dataTypes,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    autoSync: true
  };

  localStorage.setItem(`arogya_autosync_${platform}`, JSON.stringify(config));
}

/**
 * Disable auto-sync
 */
export function disableAutoSync(platform: 'apple' | 'google'): void {
  localStorage.removeItem(`arogya_autosync_${platform}`);
}

/**
 * Check if auto-sync is enabled
 */
export function isAutoSyncEnabled(platform: 'apple' | 'google'): boolean {
  const config = localStorage.getItem(`arogya_autosync_${platform}`);
  return config !== null;
}

/**
 * Perform auto-sync (called periodically)
 */
export async function performAutoSync(userId: string): Promise<void> {
  // Get biomarkers from last sync
  const appleSyncStatus = getSyncStatus('apple');
  const googleSyncStatus = getSyncStatus('google');

  // Apple Health
  if (isAutoSyncEnabled('apple') && appleSyncStatus.status === 'connected') {
    const lastSync = appleSyncStatus.lastSyncDate 
      ? new Date(appleSyncStatus.lastSyncDate) 
      : new Date(0);
    
    // Get biomarkers added since last sync
    const biomarkers = JSON.parse(localStorage.getItem('arogya_biomarkers') || '[]')
      .filter((b: Biomarker) => 
        b.userId === userId && 
        new Date(b.timestamp) > lastSync
      );

    if (biomarkers.length > 0) {
      await exportToAppleHealth(userId, biomarkers);
    }
  }

  // Google Fit
  if (isAutoSyncEnabled('google') && googleSyncStatus.status === 'connected') {
    const lastSync = googleSyncStatus.lastSyncDate 
      ? new Date(googleSyncStatus.lastSyncDate) 
      : new Date(0);
    
    const biomarkers = JSON.parse(localStorage.getItem('arogya_biomarkers') || '[]')
      .filter((b: Biomarker) => 
        b.userId === userId && 
        new Date(b.timestamp) > lastSync
      );

    if (biomarkers.length > 0) {
      await exportToGoogleFit(userId, biomarkers);
    }
  }
}

// ============= BULK EXPORT =============

/**
 * Export all health data
 */
export async function exportAllHealthData(
  userId: string,
  platform: 'apple' | 'google'
): Promise<{ success: boolean; recordsExported: number; error?: string }> {
  const biomarkers: Biomarker[] = JSON.parse(localStorage.getItem('arogya_biomarkers') || '[]')
    .filter((b: Biomarker) => b.userId === userId);

  if (platform === 'apple') {
    return exportToAppleHealth(userId, biomarkers);
  } else {
    return exportToGoogleFit(userId, biomarkers);
  }
}

export default {
  convertToHealthKit,
  convertToGoogleFit,
  exportToAppleHealth,
  exportToGoogleFit,
  connectGoogleFit,
  connectAppleHealth,
  getSyncStatus,
  disconnectPlatform,
  enableAutoSync,
  disableAutoSync,
  isAutoSyncEnabled,
  performAutoSync,
  exportAllHealthData
};
