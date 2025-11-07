/**
 * Appointment Scheduling Service
 * Handles booking, doctor matching, video consultations, and reminders
 */

import { addDays, addHours, format, parse, isAfter, isBefore, setHours, setMinutes } from 'date-fns';

// ============= TYPES =============

export interface Doctor {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  experience: number; // years
  consultationFee: number;
  availability: DoctorAvailability[];
  languages: string[];
  hospitalAffiliation: string;
  videoEnabled: boolean;
  profileImage?: string;
}

export interface DoctorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDuration: number; // minutes
}

export interface TimeSlot {
  time: string;
  available: boolean;
  doctorId: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  symptoms?: string[];
  aiDiagnosis?: string;
  specialization: string;
  consultationFee: number;
  videoLink?: string;
  notes?: string;
  reminderSent?: boolean;
  followUpDate?: string;
  createdAt: string;
}

export interface AppointmentReminder {
  appointmentId: string;
  type: 'email' | 'sms' | 'push';
  scheduledTime: string;
  sent: boolean;
  message: string;
}

// ============= MOCK DOCTORS DATABASE =============

const doctorsDatabase: Doctor[] = [
  {
    id: 'doc_001',
    name: 'Dr. Sarah Johnson',
    specialization: ['General Medicine', 'Internal Medicine'],
    rating: 4.8,
    experience: 12,
    consultationFee: 50,
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
    ],
    languages: ['English', 'Spanish'],
    hospitalAffiliation: 'City General Hospital',
    videoEnabled: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: 'doc_002',
    name: 'Dr. Michael Chen',
    specialization: ['Cardiology', 'Internal Medicine'],
    rating: 4.9,
    experience: 18,
    consultationFee: 80,
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', slotDuration: 45 },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00', slotDuration: 45 },
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00', slotDuration: 45 },
    ],
    languages: ['English', 'Mandarin'],
    hospitalAffiliation: 'Heart Care Specialists',
    videoEnabled: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
  },
  {
    id: 'doc_003',
    name: 'Dr. Priya Sharma',
    specialization: ['Dermatology', 'Cosmetic Dermatology'],
    rating: 4.7,
    experience: 10,
    consultationFee: 60,
    availability: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '16:00', slotDuration: 30 },
      { dayOfWeek: 4, startTime: '09:00', endTime: '16:00', slotDuration: 30 },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', slotDuration: 30 },
    ],
    languages: ['English', 'Hindi'],
    hospitalAffiliation: 'Skin & Wellness Clinic',
    videoEnabled: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
  },
  {
    id: 'doc_004',
    name: 'Dr. James Rodriguez',
    specialization: ['Pulmonology', 'Respiratory Medicine'],
    rating: 4.6,
    experience: 15,
    consultationFee: 70,
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '14:00', slotDuration: 30 },
      { dayOfWeek: 2, startTime: '08:00', endTime: '14:00', slotDuration: 30 },
      { dayOfWeek: 3, startTime: '08:00', endTime: '14:00', slotDuration: 30 },
      { dayOfWeek: 4, startTime: '08:00', endTime: '14:00', slotDuration: 30 },
    ],
    languages: ['English', 'Spanish'],
    hospitalAffiliation: 'Respiratory Care Center',
    videoEnabled: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
  },
  {
    id: 'doc_005',
    name: 'Dr. Emily Thompson',
    specialization: ['Neurology', 'Headache Medicine'],
    rating: 4.9,
    experience: 20,
    consultationFee: 90,
    availability: [
      { dayOfWeek: 1, startTime: '11:00', endTime: '19:00', slotDuration: 60 },
      { dayOfWeek: 3, startTime: '11:00', endTime: '19:00', slotDuration: 60 },
      { dayOfWeek: 5, startTime: '11:00', endTime: '15:00', slotDuration: 60 },
    ],
    languages: ['English'],
    hospitalAffiliation: 'Neuroscience Institute',
    videoEnabled: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
  },
  {
    id: 'doc_006',
    name: 'Dr. Ahmed Hassan',
    specialization: ['Gastroenterology', 'Hepatology'],
    rating: 4.8,
    experience: 14,
    consultationFee: 75,
    availability: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDuration: 45 },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDuration: 45 },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', slotDuration: 45 },
    ],
    languages: ['English', 'Arabic'],
    hospitalAffiliation: 'Digestive Health Center',
    videoEnabled: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
  }
];

// ============= SPECIALIZATION MATCHING =============

const symptomToSpecialization: Record<string, string[]> = {
  'chest pain': ['Cardiology', 'Internal Medicine'],
  'heart palpitations': ['Cardiology'],
  'high blood pressure': ['Cardiology', 'Internal Medicine'],
  'shortness of breath': ['Pulmonology', 'Cardiology'],
  'cough': ['Pulmonology', 'Internal Medicine'],
  'difficulty breathing': ['Pulmonology', 'Internal Medicine'],
  'asthma': ['Pulmonology'],
  'headache': ['Neurology', 'General Medicine'],
  'migraine': ['Neurology', 'Headache Medicine'],
  'dizziness': ['Neurology', 'Internal Medicine'],
  'seizure': ['Neurology'],
  'rash': ['Dermatology'],
  'skin irritation': ['Dermatology'],
  'acne': ['Dermatology', 'Cosmetic Dermatology'],
  'eczema': ['Dermatology'],
  'psoriasis': ['Dermatology'],
  'stomach pain': ['Gastroenterology', 'Internal Medicine'],
  'nausea': ['Gastroenterology', 'Internal Medicine'],
  'diarrhea': ['Gastroenterology'],
  'constipation': ['Gastroenterology'],
  'acid reflux': ['Gastroenterology'],
  'fever': ['General Medicine', 'Internal Medicine'],
  'fatigue': ['General Medicine', 'Internal Medicine'],
  'weight loss': ['General Medicine', 'Internal Medicine'],
  'joint pain': ['Rheumatology', 'Internal Medicine'],
  'back pain': ['Orthopedics', 'General Medicine'],
};

// ============= SERVICE FUNCTIONS =============

/**
 * Match symptoms to appropriate doctor specializations
 */
export function matchDoctorSpecialization(symptoms: string[], aiDiagnosis?: string): string[] {
  const specializations = new Set<string>();
  
  // Match based on symptoms
  symptoms.forEach(symptom => {
    const symptomLower = symptom.toLowerCase();
    Object.keys(symptomToSpecialization).forEach(key => {
      if (symptomLower.includes(key)) {
        symptomToSpecialization[key].forEach(spec => specializations.add(spec));
      }
    });
  });

  // Match based on AI diagnosis
  if (aiDiagnosis) {
    const diagnosisLower = aiDiagnosis.toLowerCase();
    Object.keys(symptomToSpecialization).forEach(key => {
      if (diagnosisLower.includes(key)) {
        symptomToSpecialization[key].forEach(spec => specializations.add(spec));
      }
    });
  }

  // Default to General Medicine if no match
  if (specializations.size === 0) {
    specializations.add('General Medicine');
    specializations.add('Internal Medicine');
  }

  return Array.from(specializations);
}

/**
 * Get recommended doctors based on symptoms/diagnosis
 */
export function getRecommendedDoctors(symptoms: string[], aiDiagnosis?: string): Doctor[] {
  const recommendedSpecs = matchDoctorSpecialization(symptoms, aiDiagnosis);
  
  return doctorsDatabase
    .filter(doctor => 
      doctor.specialization.some(spec => recommendedSpecs.includes(spec))
    )
    .sort((a, b) => b.rating - a.rating); // Sort by rating
}

/**
 * Get all doctors (optionally filtered by specialization)
 */
export function getAllDoctors(specializationFilter?: string): Doctor[] {
  if (!specializationFilter) {
    return doctorsDatabase;
  }
  return doctorsDatabase.filter(doc => 
    doc.specialization.includes(specializationFilter)
  );
}

/**
 * Get doctor by ID
 */
export function getDoctorById(doctorId: string): Doctor | undefined {
  return doctorsDatabase.find(doc => doc.id === doctorId);
}

/**
 * Generate available time slots for a doctor on a specific date
 */
export function getAvailableSlots(doctorId: string, date: Date): TimeSlot[] {
  const doctor = getDoctorById(doctorId);
  if (!doctor) return [];

  const dayOfWeek = date.getDay();
  const availability = doctor.availability.find(a => a.dayOfWeek === dayOfWeek);
  
  if (!availability) return [];

  // Get existing appointments for this doctor on this date
  const existingAppointments = getAppointmentsByDoctorAndDate(doctorId, format(date, 'yyyy-MM-dd'));
  const bookedTimes = new Set(existingAppointments.map(apt => apt.time));

  // Generate slots
  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);
  
  let currentTime = setMinutes(setHours(date, startHour), startMinute);
  const endTime = setMinutes(setHours(date, endHour), endMinute);

  while (isBefore(currentTime, endTime)) {
    const timeString = format(currentTime, 'HH:mm');
    slots.push({
      time: timeString,
      available: !bookedTimes.has(timeString) && isAfter(currentTime, new Date()),
      doctorId
    });
    currentTime = addHours(currentTime, availability.slotDuration / 60);
  }

  return slots;
}

/**
 * Book an appointment
 */
export function bookAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
  const appointment: Appointment = {
    ...appointmentData,
    id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  const appointments = getStoredAppointments();
  appointments.push(appointment);
  localStorage.setItem('arogya_appointments', JSON.stringify(appointments));

  // Schedule reminder
  scheduleReminders(appointment);

  // Generate video link if video consultation
  if (appointment.type === 'video') {
    appointment.videoLink = generateVideoLink(appointment.id);
  }

  return appointment;
}

/**
 * Get stored appointments from localStorage
 */
function getStoredAppointments(): Appointment[] {
  const stored = localStorage.getItem('arogya_appointments');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get appointments by doctor and date
 */
function getAppointmentsByDoctorAndDate(doctorId: string, date: string): Appointment[] {
  const appointments = getStoredAppointments();
  return appointments.filter(apt => 
    apt.doctorId === doctorId && 
    apt.date === date &&
    apt.status !== 'cancelled'
  );
}

/**
 * Get user's appointments
 */
export function getUserAppointments(userId: string): Appointment[] {
  const appointments = getStoredAppointments();
  return appointments
    .filter(apt => apt.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Cancel appointment
 */
export function cancelAppointment(appointmentId: string): boolean {
  const appointments = getStoredAppointments();
  const index = appointments.findIndex(apt => apt.id === appointmentId);
  
  if (index !== -1) {
    appointments[index].status = 'cancelled';
    localStorage.setItem('arogya_appointments', JSON.stringify(appointments));
    return true;
  }
  return false;
}

/**
 * Reschedule appointment
 */
export function rescheduleAppointment(
  appointmentId: string, 
  newDate: string, 
  newTime: string
): Appointment | null {
  const appointments = getStoredAppointments();
  const index = appointments.findIndex(apt => apt.id === appointmentId);
  
  if (index !== -1) {
    appointments[index].date = newDate;
    appointments[index].time = newTime;
    appointments[index].reminderSent = false;
    localStorage.setItem('arogya_appointments', JSON.stringify(appointments));
    scheduleReminders(appointments[index]);
    return appointments[index];
  }
  return null;
}

/**
 * Schedule follow-up appointment
 */
export function scheduleFollowUp(
  originalAppointmentId: string,
  followUpData: Omit<Appointment, 'id' | 'createdAt' | 'status'>
): Appointment {
  const followUp = bookAppointment(followUpData);
  
  // Link to original appointment
  const appointments = getStoredAppointments();
  const originalIndex = appointments.findIndex(apt => apt.id === originalAppointmentId);
  if (originalIndex !== -1) {
    appointments[originalIndex].followUpDate = followUp.date;
    localStorage.setItem('arogya_appointments', JSON.stringify(appointments));
  }
  
  return followUp;
}

// ============= VIDEO CONSULTATION =============

/**
 * Generate video consultation link (Zoom/Twilio placeholder)
 */
function generateVideoLink(appointmentId: string): string {
  // In production, integrate with Zoom API or Twilio Video
  // For now, generate a mock link
  const roomId = `arogya_${appointmentId}`;
  return `https://meet.arogya.health/${roomId}`;
}

/**
 * Get video consultation details
 */
export function getVideoConsultationLink(appointmentId: string): string | null {
  const appointments = getStoredAppointments();
  const appointment = appointments.find(apt => apt.id === appointmentId);
  return appointment?.videoLink || null;
}

// ============= REMINDERS =============

/**
 * Schedule appointment reminders
 */
function scheduleReminders(appointment: Appointment): void {
  const reminders: AppointmentReminder[] = [];
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
  
  // 24 hours before
  reminders.push({
    appointmentId: appointment.id,
    type: 'email',
    scheduledTime: addHours(appointmentDateTime, -24).toISOString(),
    sent: false,
    message: `Reminder: You have an appointment with ${getDoctorById(appointment.doctorId)?.name} tomorrow at ${appointment.time}`
  });

  // 2 hours before
  reminders.push({
    appointmentId: appointment.id,
    type: 'sms',
    scheduledTime: addHours(appointmentDateTime, -2).toISOString(),
    sent: false,
    message: `Reminder: Your appointment is in 2 hours at ${appointment.time}`
  });

  // 15 minutes before
  reminders.push({
    appointmentId: appointment.id,
    type: 'push',
    scheduledTime: addHours(appointmentDateTime, -0.25).toISOString(),
    sent: false,
    message: `Your appointment starts in 15 minutes. ${appointment.type === 'video' ? `Join here: ${appointment.videoLink}` : ''}`
  });

  // Save reminders
  const storedReminders = getStoredReminders();
  storedReminders.push(...reminders);
  localStorage.setItem('arogya_reminders', JSON.stringify(storedReminders));
}

/**
 * Get stored reminders
 */
function getStoredReminders(): AppointmentReminder[] {
  const stored = localStorage.getItem('arogya_reminders');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get pending reminders (to be sent)
 */
export function getPendingReminders(): AppointmentReminder[] {
  const reminders = getStoredReminders();
  const now = new Date();
  
  return reminders.filter(reminder => 
    !reminder.sent && 
    new Date(reminder.scheduledTime) <= now
  );
}

/**
 * Mark reminder as sent
 */
export function markReminderSent(appointmentId: string, type: string): void {
  const reminders = getStoredReminders();
  const index = reminders.findIndex(r => 
    r.appointmentId === appointmentId && r.type === type
  );
  
  if (index !== -1) {
    reminders[index].sent = true;
    localStorage.setItem('arogya_reminders', JSON.stringify(reminders));
  }
}

/**
 * Send reminder notification (placeholder for actual email/SMS/push)
 */
export function sendReminder(reminder: AppointmentReminder): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`Sending ${reminder.type} reminder:`, reminder.message);
    
    // In production, integrate with:
    // - Email: SendGrid, AWS SES, Mailgun
    // - SMS: Twilio, Vonage
    // - Push: Firebase Cloud Messaging, OneSignal
    
    // For now, show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Appointment Reminder', {
        body: reminder.message,
        icon: '/logo.png'
      });
    }
    
    markReminderSent(reminder.appointmentId, reminder.type);
    resolve(true);
  });
}

/**
 * Request notification permission
 */
export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ============= ANALYTICS =============

/**
 * Get appointment statistics
 */
export interface AppointmentStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  bySpecialization: Record<string, number>;
  byDoctor: Record<string, number>;
}

export function getAppointmentStats(userId: string): AppointmentStats {
  const appointments = getUserAppointments(userId);
  const now = new Date();

  const stats: AppointmentStats = {
    total: appointments.length,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    bySpecialization: {},
    byDoctor: {}
  };

  appointments.forEach(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    
    if (apt.status === 'cancelled') {
      stats.cancelled++;
    } else if (apt.status === 'completed' || aptDate < now) {
      stats.completed++;
    } else {
      stats.upcoming++;
    }

    // By specialization
    stats.bySpecialization[apt.specialization] = 
      (stats.bySpecialization[apt.specialization] || 0) + 1;

    // By doctor
    const doctor = getDoctorById(apt.doctorId);
    if (doctor) {
      stats.byDoctor[doctor.name] = (stats.byDoctor[doctor.name] || 0) + 1;
    }
  });

  return stats;
}

export default {
  matchDoctorSpecialization,
  getRecommendedDoctors,
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
  bookAppointment,
  getUserAppointments,
  cancelAppointment,
  rescheduleAppointment,
  scheduleFollowUp,
  getVideoConsultationLink,
  getPendingReminders,
  sendReminder,
  requestNotificationPermission,
  getAppointmentStats
};
