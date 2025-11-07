/**
 * Emergency Response Service
 * Handles emergency contacts, hospital location, red flags, and first aid
 */

// ============= TYPES =============

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface EmergencyHotline {
  country: string;
  countryCode: string;
  emergency: string;
  ambulance: string;
  police: string;
  fire: string;
  poisonControl?: string;
  mentalHealth?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number; // in km
  hasEmergency: boolean;
  specialties: string[];
  rating: number;
  lat: number;
  lng: number;
}

export interface RedFlagSymptom {
  symptom: string;
  severity: 'critical' | 'urgent';
  action: string;
  keywords: string[];
}

export interface FirstAidResource {
  id: string;
  title: string;
  condition: string;
  category: string;
  steps: string[];
  warnings: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'symptom' | 'manual' | 'auto';
  severity: 'critical' | 'urgent' | 'moderate';
  symptoms: string[];
  location?: {
    lat: number;
    lng: number;
  };
  contactsNotified: string[];
  timestamp: string;
  resolved: boolean;
}

// ============= EMERGENCY HOTLINES =============

export const emergencyHotlines: EmergencyHotline[] = [
  {
    country: 'United States',
    countryCode: 'US',
    emergency: '911',
    ambulance: '911',
    police: '911',
    fire: '911',
    poisonControl: '1-800-222-1222',
    mentalHealth: '988'
  },
  {
    country: 'India',
    countryCode: 'IN',
    emergency: '112',
    ambulance: '108',
    police: '100',
    fire: '101',
    mentalHealth: '9152987821'
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    emergency: '999',
    ambulance: '999',
    police: '999',
    fire: '999',
    mentalHealth: '116 123'
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    emergency: '911',
    ambulance: '911',
    police: '911',
    fire: '911',
    poisonControl: '1-800-268-9017'
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    emergency: '000',
    ambulance: '000',
    police: '000',
    fire: '000',
    mentalHealth: '13 11 14'
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    emergency: '112',
    ambulance: '112',
    police: '110',
    fire: '112',
    poisonControl: '030 19240'
  },
  {
    country: 'France',
    countryCode: 'FR',
    emergency: '112',
    ambulance: '15',
    police: '17',
    fire: '18'
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    emergency: '110',
    ambulance: '119',
    police: '110',
    fire: '119'
  },
  {
    country: 'China',
    countryCode: 'CN',
    emergency: '110',
    ambulance: '120',
    police: '110',
    fire: '119'
  },
  {
    country: 'Brazil',
    countryCode: 'BR',
    emergency: '190',
    ambulance: '192',
    police: '190',
    fire: '193'
  }
];

// ============= RED FLAG SYMPTOMS =============

export const redFlagSymptoms: RedFlagSymptom[] = [
  {
    symptom: 'Chest Pain',
    severity: 'critical',
    action: 'Call emergency services immediately. May indicate heart attack.',
    keywords: ['chest pain', 'heart pain', 'chest pressure', 'crushing pain', 'tightness in chest']
  },
  {
    symptom: 'Difficulty Breathing',
    severity: 'critical',
    action: 'Call emergency services immediately. May indicate respiratory emergency.',
    keywords: ['cant breathe', 'difficulty breathing', 'shortness of breath', 'gasping', 'choking']
  },
  {
    symptom: 'Stroke Symptoms',
    severity: 'critical',
    action: 'Call emergency services immediately. Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911.',
    keywords: ['face drooping', 'arm weakness', 'slurred speech', 'sudden confusion', 'sudden numbness', 'sudden vision loss']
  },
  {
    symptom: 'Severe Allergic Reaction',
    severity: 'critical',
    action: 'Use EpiPen if available and call emergency services. May be anaphylaxis.',
    keywords: ['swelling throat', 'difficulty swallowing', 'hives all over', 'face swelling', 'anaphylaxis']
  },
  {
    symptom: 'Severe Bleeding',
    severity: 'critical',
    action: 'Apply pressure to wound and call emergency services immediately.',
    keywords: ['heavy bleeding', 'uncontrolled bleeding', 'spurting blood', 'severe bleeding']
  },
  {
    symptom: 'Severe Head Injury',
    severity: 'critical',
    action: 'Do not move person. Call emergency services immediately.',
    keywords: ['head injury', 'unconscious', 'loss of consciousness', 'severe headache after injury', 'confused after head injury']
  },
  {
    symptom: 'Suicidal Thoughts',
    severity: 'critical',
    action: 'Call mental health crisis line or emergency services immediately.',
    keywords: ['suicidal', 'want to die', 'end my life', 'kill myself', 'self harm']
  },
  {
    symptom: 'Severe Abdominal Pain',
    severity: 'urgent',
    action: 'Seek immediate medical attention. May indicate appendicitis or other serious condition.',
    keywords: ['severe stomach pain', 'severe abdominal pain', 'appendix pain', 'sharp stomach pain']
  },
  {
    symptom: 'High Fever with Rash',
    severity: 'urgent',
    action: 'Seek immediate medical attention. May indicate meningitis.',
    keywords: ['high fever and rash', 'stiff neck and fever', 'meningitis symptoms']
  },
  {
    symptom: 'Severe Dehydration',
    severity: 'urgent',
    action: 'Seek immediate medical attention if unable to keep fluids down.',
    keywords: ['severe dehydration', 'cant keep fluids down', 'no urine', 'very dizzy']
  },
  {
    symptom: 'Diabetic Emergency',
    severity: 'urgent',
    action: 'Check blood sugar. If very high/low, seek immediate medical attention.',
    keywords: ['diabetic shock', 'very high blood sugar', 'very low blood sugar', 'diabetic ketoacidosis']
  }
];

// ============= FIRST AID RESOURCES =============

export const firstAidResources: FirstAidResource[] = [
  {
    id: 'fa_cpr',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    condition: 'Cardiac Arrest',
    category: 'Life-Saving',
    steps: [
      'Call emergency services immediately',
      'Place person on firm, flat surface',
      'Position hands in center of chest',
      'Push hard and fast: 100-120 compressions per minute',
      'Push down at least 2 inches',
      'Allow chest to return to normal position after each compression',
      'Continue until help arrives or person starts breathing'
    ],
    warnings: [
      'Only perform if trained',
      'Do not stop compressions unless person shows signs of life',
      'Use AED if available'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=B8W_t1NE7Yg'
  },
  {
    id: 'fa_choking',
    title: 'Choking Relief (Heimlich Maneuver)',
    condition: 'Choking',
    category: 'Life-Saving',
    steps: [
      'Ask "Are you choking?" - if cannot speak, person is choking',
      'Stand behind the person',
      'Make a fist and place it above the navel',
      'Grasp fist with other hand',
      'Give quick, upward thrusts',
      'Repeat until object is expelled',
      'Call emergency services if unsuccessful'
    ],
    warnings: [
      'Do not perform on infants - use back blows',
      'Be careful with pregnant women or obese individuals',
      'Seek medical attention even if successful'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Iz8M0UTkvHU'
  },
  {
    id: 'fa_bleeding',
    title: 'Severe Bleeding Control',
    condition: 'Heavy Bleeding',
    category: 'Emergency',
    steps: [
      'Call emergency services',
      'Have person lie down',
      'Remove any obvious debris from wound',
      'Apply firm, direct pressure with clean cloth',
      'Maintain pressure for at least 20 minutes',
      'Add more cloth if blood soaks through - do not remove original',
      'Elevate injured area above heart if possible',
      'Apply pressure to nearby artery if bleeding continues'
    ],
    warnings: [
      'Do not remove embedded objects',
      'Do not peek at wound - maintain pressure',
      'Watch for signs of shock'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=lnKLp0c-R6Q'
  },
  {
    id: 'fa_burns',
    title: 'Burn Treatment',
    condition: 'Burns',
    category: 'Injury',
    steps: [
      'Remove person from heat source',
      'Cool the burn with cool (not ice cold) water for 10-20 minutes',
      'Remove jewelry and tight clothing before swelling',
      'Cover with sterile, non-stick bandage',
      'Take over-the-counter pain reliever',
      'Seek medical attention for large or severe burns'
    ],
    warnings: [
      'Do not apply ice directly',
      'Do not apply butter, oil, or ointments',
      'Do not break blisters',
      'Seek immediate help for burns to face, hands, feet, or genitals'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=hMaxJJNw62w'
  },
  {
    id: 'fa_seizure',
    title: 'Seizure Response',
    condition: 'Seizure',
    category: 'Neurological',
    steps: [
      'Stay calm and time the seizure',
      'Clear area around person',
      'Turn person on their side',
      'Place something soft under head',
      'Do not restrain the person',
      'Do not put anything in their mouth',
      'Stay with person until fully conscious',
      'Call emergency if seizure lasts more than 5 minutes'
    ],
    warnings: [
      'Never put objects in mouth',
      'Do not restrain movements',
      'Call emergency if first seizure, lasts >5 min, or person is injured'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=1Kf3OqTfDuY'
  },
  {
    id: 'fa_shock',
    title: 'Shock Management',
    condition: 'Medical Shock',
    category: 'Emergency',
    steps: [
      'Call emergency services immediately',
      'Have person lie down',
      'Elevate legs about 12 inches (unless head, neck, or back injury)',
      'Keep person warm with blanket',
      'Do not give anything to eat or drink',
      'Monitor breathing and pulse',
      'Turn on side if vomiting'
    ],
    warnings: [
      'Do not elevate legs if suspected head/neck/back injury',
      'Do not move if injury suspected',
      'Do not give fluids'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=JRYsOsHUmVo'
  },
  {
    id: 'fa_allergic',
    title: 'Allergic Reaction',
    condition: 'Severe Allergy',
    category: 'Emergency',
    steps: [
      'Call emergency services if severe reaction',
      'Help person use EpiPen if available',
      'Have person lie down and elevate legs',
      'Keep airway open',
      'Monitor breathing',
      'Be prepared to perform CPR if necessary'
    ],
    warnings: [
      'Use EpiPen immediately if available',
      'Call emergency even if EpiPen is used',
      'Second reaction may occur - stay with person'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=I7-PgKgVs6k'
  },
  {
    id: 'fa_fracture',
    title: 'Fracture/Broken Bone',
    condition: 'Fracture',
    category: 'Injury',
    steps: [
      'Do not move injured area',
      'Immobilize the injured limb',
      'Apply ice pack wrapped in cloth',
      'Treat for shock if necessary',
      'Seek medical attention',
      'Do not try to realign bone'
    ],
    warnings: [
      'Do not move if spine injury suspected',
      'Do not apply ice directly to skin',
      'Seek immediate help for open fractures'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=t0PqSc3BKLE'
  }
];

// ============= SERVICE FUNCTIONS =============

/**
 * Detect red flag symptoms from text
 */
export function detectRedFlags(symptoms: string[], severityScore?: number): RedFlagSymptom[] {
  const detectedFlags: RedFlagSymptom[] = [];
  const symptomsText = symptoms.join(' ').toLowerCase();

  // Check severity score (from BERT analysis)
  if (severityScore && severityScore >= 8) {
    redFlagSymptoms.forEach(flag => {
      flag.keywords.forEach(keyword => {
        if (symptomsText.includes(keyword.toLowerCase())) {
          if (!detectedFlags.find(f => f.symptom === flag.symptom)) {
            detectedFlags.push(flag);
          }
        }
      });
    });
  }

  // Always check for critical symptoms
  redFlagSymptoms.filter(f => f.severity === 'critical').forEach(flag => {
    flag.keywords.forEach(keyword => {
      if (symptomsText.includes(keyword.toLowerCase())) {
        if (!detectedFlags.find(f => f.symptom === flag.symptom)) {
          detectedFlags.push(flag);
        }
      }
    });
  });

  return detectedFlags.sort((a, b) => 
    a.severity === 'critical' ? -1 : b.severity === 'critical' ? 1 : 0
  );
}

/**
 * Get emergency hotline for user's country
 */
export function getEmergencyHotline(countryCode: string = 'US'): EmergencyHotline {
  return emergencyHotlines.find(h => h.countryCode === countryCode) || emergencyHotlines[0];
}

/**
 * Get user's country code from browser/IP
 */
export async function detectUserCountry(): Promise<string> {
  try {
    // Try to get from browser's timezone/locale
    const locale = navigator.language;
    if (locale.includes('en-US')) return 'US';
    if (locale.includes('en-GB')) return 'GB';
    if (locale.includes('en-IN')) return 'IN';
    if (locale.includes('en-CA')) return 'CA';
    if (locale.includes('en-AU')) return 'AU';
    
    // In production, use IP geolocation API
    // const response = await fetch('https://ipapi.co/json/');
    // const data = await response.json();
    // return data.country_code;
    
    return 'US'; // Default
  } catch (error) {
    return 'US';
  }
}

// ============= EMERGENCY CONTACTS =============

/**
 * Add emergency contact
 */
export function addEmergencyContact(
  userId: string,
  contactData: Omit<EmergencyContact, 'id' | 'userId' | 'createdAt'>
): EmergencyContact {
  const contact: EmergencyContact = {
    id: `ec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...contactData,
    createdAt: new Date().toISOString()
  };

  const contacts = getStoredContacts();
  
  // If setting as primary, remove primary from others
  if (contact.isPrimary) {
    contacts.forEach(c => {
      if (c.userId === userId) {
        c.isPrimary = false;
      }
    });
  }

  contacts.push(contact);
  localStorage.setItem('arogya_emergency_contacts', JSON.stringify(contacts));
  return contact;
}

/**
 * Get stored emergency contacts
 */
function getStoredContacts(): EmergencyContact[] {
  const stored = localStorage.getItem('arogya_emergency_contacts');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's emergency contacts
 */
export function getEmergencyContacts(userId: string): EmergencyContact[] {
  const contacts = getStoredContacts();
  return contacts.filter(c => c.userId === userId)
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
}

/**
 * Delete emergency contact
 */
export function deleteEmergencyContact(contactId: string): boolean {
  const contacts = getStoredContacts();
  const filtered = contacts.filter(c => c.id !== contactId);
  
  if (filtered.length < contacts.length) {
    localStorage.setItem('arogya_emergency_contacts', JSON.stringify(filtered));
    return true;
  }
  return false;
}

// ============= EMERGENCY ALERTS =============

/**
 * Create emergency alert
 */
export function createEmergencyAlert(
  userId: string,
  alertData: Omit<EmergencyAlert, 'id' | 'userId' | 'timestamp' | 'resolved'>
): EmergencyAlert {
  const alert: EmergencyAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...alertData,
    timestamp: new Date().toISOString(),
    resolved: false
  };

  const alerts = getStoredAlerts();
  alerts.push(alert);
  localStorage.setItem('arogya_emergency_alerts', JSON.stringify(alerts));

  // Notify emergency contacts
  if (alert.severity === 'critical') {
    notifyEmergencyContacts(userId, alert);
  }

  return alert;
}

/**
 * Get stored alerts
 */
function getStoredAlerts(): EmergencyAlert[] {
  const stored = localStorage.getItem('arogya_emergency_alerts');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Notify emergency contacts
 */
async function notifyEmergencyContacts(userId: string, alert: EmergencyAlert): Promise<void> {
  const contacts = getEmergencyContacts(userId);
  
  const message = `EMERGENCY ALERT\n${alert.symptoms.join(', ')}\nTime: ${new Date(alert.timestamp).toLocaleString()}${alert.location ? `\nLocation: ${alert.location.lat}, ${alert.location.lng}` : ''}`;

  // In production, use Twilio for SMS or SendGrid for email
  contacts.forEach(contact => {
    console.log(`Notifying ${contact.name} (${contact.phone}):`, message);
    // sendSMS(contact.phone, message);
    // sendEmail(contact.email, 'Emergency Alert', message);
  });
}

// ============= HOSPITAL LOCATOR =============

/**
 * Find nearby hospitals using Google Maps API
 */
export async function findNearbyHospitals(
  latitude: number,
  longitude: number,
  radius: number = 10000 // meters
): Promise<Hospital[]> {
  // In production, use Google Maps Places API
  // const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  // const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${apiKey}`;
  
  // Mock data for demonstration
  const mockHospitals: Hospital[] = [
    {
      id: 'hosp_1',
      name: 'City General Hospital',
      address: '123 Main St, City, State 12345',
      phone: '+1-555-0101',
      distance: 2.5,
      hasEmergency: true,
      specialties: ['Emergency', 'Cardiology', 'Surgery'],
      rating: 4.5,
      lat: latitude + 0.02,
      lng: longitude + 0.02
    },
    {
      id: 'hosp_2',
      name: 'Memorial Medical Center',
      address: '456 Oak Ave, City, State 12345',
      phone: '+1-555-0102',
      distance: 4.1,
      hasEmergency: true,
      specialties: ['Emergency', 'Trauma', 'Neurology'],
      rating: 4.7,
      lat: latitude + 0.03,
      lng: longitude - 0.02
    },
    {
      id: 'hosp_3',
      name: 'St. Mary\'s Hospital',
      address: '789 Pine Rd, City, State 12345',
      phone: '+1-555-0103',
      distance: 6.3,
      hasEmergency: true,
      specialties: ['Emergency', 'Pediatrics', 'Maternity'],
      rating: 4.4,
      lat: latitude - 0.04,
      lng: longitude + 0.03
    }
  ];

  return mockHospitals.sort((a, b) => a.distance - b.distance);
}

/**
 * Get user's current location
 */
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      error => {
        reject(error);
      }
    );
  });
}

/**
 * Get first aid resource by condition
 */
export function getFirstAidResource(condition: string): FirstAidResource | undefined {
  return firstAidResources.find(
    r => r.condition.toLowerCase().includes(condition.toLowerCase()) ||
         r.title.toLowerCase().includes(condition.toLowerCase())
  );
}

/**
 * Search first aid resources
 */
export function searchFirstAid(query: string): FirstAidResource[] {
  const queryLower = query.toLowerCase();
  return firstAidResources.filter(
    r => r.title.toLowerCase().includes(queryLower) ||
         r.condition.toLowerCase().includes(queryLower) ||
         r.category.toLowerCase().includes(queryLower)
  );
}

export default {
  detectRedFlags,
  getEmergencyHotline,
  detectUserCountry,
  addEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact,
  createEmergencyAlert,
  findNearbyHospitals,
  getUserLocation,
  getFirstAidResource,
  searchFirstAid,
  firstAidResources,
  redFlagSymptoms,
  emergencyHotlines
};
