/**
 * Medication Tracker Service
 * Handles medication schedules, reminders, adherence tracking, and drug interactions
 */

import { Medicine } from './diseaseDatabase';

// ============= TYPES =============

export interface MedicationSchedule {
  id: string;
  userId: string;
  medicine: Medicine;
  medicineName: string;
  dosage: string;
  frequency: string; // e.g., "Every 6 hours", "3 times daily", "Once daily"
  times: string[]; // e.g., ["08:00", "14:00", "20:00"]
  duration: string; // e.g., "7 days", "2 weeks"
  startDate: string;
  endDate: string;
  category: 'prescription' | 'over-the-counter' | 'supplement';
  purpose: string;
  sideEffects?: string[];
  foodInstructions?: string; // e.g., "Take with food", "Take on empty stomach"
  reminderEnabled: boolean;
  refillReminder?: boolean;
  refillDate?: string;
  pillsRemaining?: number;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  scheduleId: string;
  userId: string;
  medicineName: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'taken' | 'missed' | 'skipped' | 'pending';
  notes?: string;
  sideEffectsReported?: string[];
  timestamp: string;
}

export interface DrugInteraction {
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  drugs: string[];
  recommendation: string;
}

export interface AdherenceStats {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  adherenceRate: number; // percentage
  currentStreak: number; // consecutive days
  longestStreak: number;
  byMedicine: Record<string, {
    taken: number;
    missed: number;
    rate: number;
  }>;
}

// ============= DRUG INTERACTIONS DATABASE =============

const drugInteractionsDatabase: Record<string, DrugInteraction[]> = {
  'aspirin': [
    {
      severity: 'major',
      description: 'Increased risk of bleeding when combined with blood thinners',
      drugs: ['warfarin', 'heparin', 'clopidogrel'],
      recommendation: 'Consult doctor before combining. May require dosage adjustment.'
    },
    {
      severity: 'moderate',
      description: 'May reduce effectiveness of blood pressure medications',
      drugs: ['lisinopril', 'enalapril', 'ramipril'],
      recommendation: 'Monitor blood pressure regularly.'
    }
  ],
  'ibuprofen': [
    {
      severity: 'major',
      description: 'Increased risk of stomach bleeding and kidney damage',
      drugs: ['aspirin', 'naproxen', 'alcohol'],
      recommendation: 'Avoid combination. Use alternative pain reliever.'
    },
    {
      severity: 'moderate',
      description: 'May interfere with blood pressure control',
      drugs: ['lisinopril', 'losartan', 'amlodipine'],
      recommendation: 'Monitor blood pressure. Consult doctor for alternatives.'
    }
  ],
  'warfarin': [
    {
      severity: 'major',
      description: 'Severe bleeding risk with NSAIDs and aspirin',
      drugs: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac'],
      recommendation: 'AVOID. Use acetaminophen for pain instead.'
    },
    {
      severity: 'major',
      description: 'Antibiotic interaction affecting INR levels',
      drugs: ['ciprofloxacin', 'azithromycin', 'amoxicillin'],
      recommendation: 'Monitor INR closely. Dosage adjustment may be needed.'
    }
  ],
  'metformin': [
    {
      severity: 'moderate',
      description: 'Increased risk of lactic acidosis with alcohol',
      drugs: ['alcohol'],
      recommendation: 'Limit alcohol consumption. Avoid excessive drinking.'
    }
  ],
  'lisinopril': [
    {
      severity: 'major',
      description: 'Risk of dangerously high potassium levels',
      drugs: ['potassium supplements', 'spironolactone'],
      recommendation: 'Monitor potassium levels. Avoid potassium supplements.'
    }
  ],
  'levothyroxine': [
    {
      severity: 'moderate',
      description: 'Absorption reduced by calcium and iron supplements',
      drugs: ['calcium carbonate', 'iron sulfate'],
      recommendation: 'Take at least 4 hours apart from supplements.'
    }
  ],
  'amoxicillin': [
    {
      severity: 'moderate',
      description: 'May reduce effectiveness of birth control pills',
      drugs: ['oral contraceptives'],
      recommendation: 'Use backup contraception during antibiotic course.'
    }
  ]
};

// ============= SERVICE FUNCTIONS =============

/**
 * Create medication schedule
 */
export function createMedicationSchedule(
  userId: string,
  scheduleData: Omit<MedicationSchedule, 'id' | 'userId' | 'createdAt'>
): MedicationSchedule {
  const schedule: MedicationSchedule = {
    id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...scheduleData,
    createdAt: new Date().toISOString()
  };

  const schedules = getStoredSchedules();
  schedules.push(schedule);
  localStorage.setItem('arogya_medication_schedules', JSON.stringify(schedules));

  // Create initial logs for upcoming doses
  if (schedule.reminderEnabled) {
    createUpcomingLogs(schedule);
  }

  return schedule;
}

/**
 * Get stored medication schedules
 */
function getStoredSchedules(): MedicationSchedule[] {
  const stored = localStorage.getItem('arogya_medication_schedules');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's active medication schedules
 */
export function getUserMedications(userId: string): MedicationSchedule[] {
  const schedules = getStoredSchedules();
  const now = new Date();
  
  return schedules.filter(schedule => 
    schedule.userId === userId &&
    new Date(schedule.endDate) >= now
  );
}

/**
 * Get all medications (including expired)
 */
export function getAllUserMedications(userId: string): MedicationSchedule[] {
  const schedules = getStoredSchedules();
  return schedules.filter(schedule => schedule.userId === userId);
}

/**
 * Update medication schedule
 */
export function updateMedicationSchedule(
  scheduleId: string,
  updates: Partial<MedicationSchedule>
): MedicationSchedule | null {
  const schedules = getStoredSchedules();
  const index = schedules.findIndex(s => s.id === scheduleId);
  
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates };
    localStorage.setItem('arogya_medication_schedules', JSON.stringify(schedules));
    return schedules[index];
  }
  return null;
}

/**
 * Delete medication schedule
 */
export function deleteMedicationSchedule(scheduleId: string): boolean {
  const schedules = getStoredSchedules();
  const filtered = schedules.filter(s => s.id !== scheduleId);
  
  if (filtered.length < schedules.length) {
    localStorage.setItem('arogya_medication_schedules', JSON.stringify(filtered));
    return true;
  }
  return false;
}

// ============= MEDICATION LOGGING =============

/**
 * Create upcoming medication logs
 */
function createUpcomingLogs(schedule: MedicationSchedule): void {
  const logs: MedicationLog[] = [];
  const startDate = new Date(schedule.startDate);
  const endDate = new Date(schedule.endDate);
  const today = new Date();
  
  // Create logs for next 7 days
  for (let d = new Date(today); d <= endDate && d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); d.setDate(d.getDate() + 1)) {
    if (d >= startDate) {
      schedule.times.forEach(time => {
        const logDateTime = `${d.toISOString().split('T')[0]}T${time}`;
        logs.push({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          scheduleId: schedule.id,
          userId: schedule.userId,
          medicineName: schedule.medicineName,
          scheduledTime: logDateTime,
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  const existingLogs = getStoredLogs();
  existingLogs.push(...logs);
  localStorage.setItem('arogya_medication_logs', JSON.stringify(existingLogs));
}

/**
 * Get stored medication logs
 */
function getStoredLogs(): MedicationLog[] {
  const stored = localStorage.getItem('arogya_medication_logs');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Log medication taken
 */
export function logMedicationTaken(
  scheduleId: string,
  scheduledTime: string,
  notes?: string,
  sideEffects?: string[]
): MedicationLog {
  const logs = getStoredLogs();
  const existingLog = logs.find(
    log => log.scheduleId === scheduleId && log.scheduledTime === scheduledTime
  );

  if (existingLog) {
    existingLog.status = 'taken';
    existingLog.actualTime = new Date().toISOString();
    existingLog.notes = notes;
    existingLog.sideEffectsReported = sideEffects;
    localStorage.setItem('arogya_medication_logs', JSON.stringify(logs));
    return existingLog;
  }

  // Create new log if doesn't exist
  const schedule = getStoredSchedules().find(s => s.id === scheduleId);
  const newLog: MedicationLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    scheduleId,
    userId: schedule?.userId || '',
    medicineName: schedule?.medicineName || '',
    scheduledTime,
    actualTime: new Date().toISOString(),
    status: 'taken',
    notes,
    sideEffectsReported: sideEffects,
    timestamp: new Date().toISOString()
  };

  logs.push(newLog);
  localStorage.setItem('arogya_medication_logs', JSON.stringify(logs));
  return newLog;
}

/**
 * Log medication missed
 */
export function logMedicationMissed(scheduleId: string, scheduledTime: string): void {
  const logs = getStoredLogs();
  const log = logs.find(
    l => l.scheduleId === scheduleId && l.scheduledTime === scheduledTime
  );
  
  if (log) {
    log.status = 'missed';
    localStorage.setItem('arogya_medication_logs', JSON.stringify(logs));
  }
}

/**
 * Log medication skipped
 */
export function logMedicationSkipped(
  scheduleId: string, 
  scheduledTime: string, 
  reason?: string
): void {
  const logs = getStoredLogs();
  const log = logs.find(
    l => l.scheduleId === scheduleId && l.scheduledTime === scheduledTime
  );
  
  if (log) {
    log.status = 'skipped';
    log.notes = reason;
    localStorage.setItem('arogya_medication_logs', JSON.stringify(logs));
  }
}

/**
 * Get today's medication schedule
 */
export function getTodaysMedications(userId: string): Array<{
  schedule: MedicationSchedule;
  logs: MedicationLog[];
}> {
  const schedules = getUserMedications(userId);
  const logs = getStoredLogs();
  const today = new Date().toISOString().split('T')[0];

  return schedules.map(schedule => ({
    schedule,
    logs: logs.filter(
      log => 
        log.scheduleId === schedule.id &&
        log.scheduledTime.startsWith(today)
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
  }));
}

/**
 * Get upcoming doses (next 24 hours)
 */
export function getUpcomingDoses(userId: string): MedicationLog[] {
  const logs = getStoredLogs();
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return logs.filter(log => {
    const scheduledTime = new Date(log.scheduledTime);
    return (
      log.userId === userId &&
      log.status === 'pending' &&
      scheduledTime >= now &&
      scheduledTime <= next24h
    );
  }).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

/**
 * Get pending reminders
 */
export function getPendingMedicationReminders(userId: string): MedicationLog[] {
  const logs = getStoredLogs();
  const now = new Date();

  return logs.filter(log => {
    const scheduledTime = new Date(log.scheduledTime);
    const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000); // 15 min before
    
    return (
      log.userId === userId &&
      log.status === 'pending' &&
      now >= reminderTime &&
      now < scheduledTime
    );
  });
}

// ============= ADHERENCE TRACKING =============

/**
 * Calculate adherence statistics
 */
export function calculateAdherence(userId: string, days: number = 30): AdherenceStats {
  const logs = getStoredLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const relevantLogs = logs.filter(
    log => log.userId === userId && new Date(log.scheduledTime) >= cutoffDate
  );

  const stats: AdherenceStats = {
    totalDoses: relevantLogs.length,
    takenDoses: relevantLogs.filter(l => l.status === 'taken').length,
    missedDoses: relevantLogs.filter(l => l.status === 'missed').length,
    skippedDoses: relevantLogs.filter(l => l.status === 'skipped').length,
    adherenceRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    byMedicine: {}
  };

  stats.adherenceRate = stats.totalDoses > 0 
    ? (stats.takenDoses / stats.totalDoses) * 100 
    : 0;

  // Calculate streaks
  const sortedLogs = relevantLogs.sort((a, b) => 
    b.scheduledTime.localeCompare(a.scheduledTime)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  sortedLogs.forEach((log, index) => {
    if (log.status === 'taken') {
      tempStreak++;
      if (index === 0) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (log.status === 'missed') {
      if (index === 0) currentStreak = 0;
      tempStreak = 0;
    }
  });

  stats.currentStreak = currentStreak;
  stats.longestStreak = longestStreak;

  // By medicine statistics
  const medicineMap = new Map<string, MedicationLog[]>();
  relevantLogs.forEach(log => {
    if (!medicineMap.has(log.medicineName)) {
      medicineMap.set(log.medicineName, []);
    }
    medicineMap.get(log.medicineName)!.push(log);
  });

  medicineMap.forEach((medLogs, medicineName) => {
    const taken = medLogs.filter(l => l.status === 'taken').length;
    const missed = medLogs.filter(l => l.status === 'missed').length;
    const total = medLogs.length;
    
    stats.byMedicine[medicineName] = {
      taken,
      missed,
      rate: total > 0 ? (taken / total) * 100 : 0
    };
  });

  return stats;
}

// ============= DRUG INTERACTIONS =============

/**
 * Check for drug interactions
 */
export function checkDrugInteractions(medications: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  const medicationSet = new Set(medications.map(m => m.toLowerCase()));

  medications.forEach(med => {
    const medLower = med.toLowerCase();
    const medInteractions = drugInteractionsDatabase[medLower];
    
    if (medInteractions) {
      medInteractions.forEach(interaction => {
        const hasInteractingDrug = interaction.drugs.some(drug => 
          medicationSet.has(drug.toLowerCase())
        );
        
        if (hasInteractingDrug) {
          interactions.push(interaction);
        }
      });
    }
  });

  return interactions;
}

/**
 * Get drug interaction warnings for user's medications
 */
export function getUserDrugInteractionWarnings(userId: string): DrugInteraction[] {
  const medications = getUserMedications(userId);
  const medicineNames = medications.map(m => m.medicineName);
  return checkDrugInteractions(medicineNames);
}

// ============= REFILL REMINDERS =============

/**
 * Check medications needing refill
 */
export function getMedicationsNeedingRefill(userId: string): MedicationSchedule[] {
  const medications = getUserMedications(userId);
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return medications.filter(med => {
    if (!med.refillReminder || !med.refillDate) return false;
    
    const refillDate = new Date(med.refillDate);
    return refillDate <= sevenDaysFromNow;
  });
}

/**
 * Update pills remaining
 */
export function updatePillsRemaining(scheduleId: string, pillsRemaining: number): void {
  updateMedicationSchedule(scheduleId, { pillsRemaining });
}

/**
 * Calculate refill date based on pills remaining
 */
export function calculateRefillDate(
  pillsRemaining: number,
  dosesPerDay: number
): string {
  const daysRemaining = Math.floor(pillsRemaining / dosesPerDay);
  const refillDate = new Date();
  refillDate.setDate(refillDate.getDate() + daysRemaining);
  return refillDate.toISOString().split('T')[0];
}

// ============= NOTIFICATIONS =============

/**
 * Send medication reminder notification
 */
export function sendMedicationReminder(log: MedicationLog): void {
  const schedule = getStoredSchedules().find(s => s.id === log.scheduleId);
  
  if (!schedule || !schedule.reminderEnabled) return;

  const time = new Date(log.scheduledTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const message = `💊 Medication Reminder\n${log.medicineName} - ${schedule.dosage}\nTime: ${time}${schedule.foodInstructions ? `\n${schedule.foodInstructions}` : ''}`;

  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Medication Reminder', {
      body: message,
      icon: '/pill-icon.png',
      badge: '/pill-badge.png',
      tag: log.id
    });
  }

  console.log('Medication reminder:', message);
}

export default {
  createMedicationSchedule,
  getUserMedications,
  getAllUserMedications,
  updateMedicationSchedule,
  deleteMedicationSchedule,
  logMedicationTaken,
  logMedicationMissed,
  logMedicationSkipped,
  getTodaysMedications,
  getUpcomingDoses,
  getPendingMedicationReminders,
  calculateAdherence,
  checkDrugInteractions,
  getUserDrugInteractionWarnings,
  getMedicationsNeedingRefill,
  updatePillsRemaining,
  calculateRefillDate,
  sendMedicationReminder
};
