export interface FamilyMember {
  id: string;
  userId: string; // Owner of the family account
  name: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  dateOfBirth: string;
  sex: 'male' | 'female' | 'other';
  bloodGroup?: string;
  photo?: string;
  emergencyContact?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyHealthData {
  memberId: string;
  consultations: any[];
  appointments: any[];
  medications: any[];
  labReports: any[];
  healthMetrics: any[];
}

// Get all family members for a user
export const getFamilyMembers = (userId: string): FamilyMember[] => {
  const stored = localStorage.getItem(`familyMembers_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Add a new family member
export const addFamilyMember = (userId: string, member: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): FamilyMember => {
  const members = getFamilyMembers(userId);
  
  const newMember: FamilyMember = {
    ...member,
    id: `member_${Date.now()}`,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  members.push(newMember);
  localStorage.setItem(`familyMembers_${userId}`, JSON.stringify(members));
  
  return newMember;
};

// Update family member
export const updateFamilyMember = (userId: string, memberId: string, updates: Partial<FamilyMember>): FamilyMember | null => {
  const members = getFamilyMembers(userId);
  const index = members.findIndex(m => m.id === memberId);
  
  if (index === -1) return null;
  
  members[index] = {
    ...members[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(`familyMembers_${userId}`, JSON.stringify(members));
  return members[index];
};

// Delete family member
export const deleteFamilyMember = (userId: string, memberId: string): boolean => {
  const members = getFamilyMembers(userId);
  const filtered = members.filter(m => m.id !== memberId);
  
  if (filtered.length === members.length) return false;
  
  localStorage.setItem(`familyMembers_${userId}`, JSON.stringify(filtered));
  
  // Also clean up member's health data
  localStorage.removeItem(`memberConsultations_${memberId}`);
  localStorage.removeItem(`memberAppointments_${memberId}`);
  localStorage.removeItem(`memberMedications_${memberId}`);
  localStorage.removeItem(`labReports_${memberId}`);
  
  return true;
};

// Get member by ID
export const getFamilyMemberById = (userId: string, memberId: string): FamilyMember | null => {
  const members = getFamilyMembers(userId);
  return members.find(m => m.id === memberId) || null;
};

// Get all health data for a family member
export const getMemberHealthData = (memberId: string): FamilyHealthData => {
  const consultations = localStorage.getItem(`memberConsultations_${memberId}`);
  const appointments = localStorage.getItem(`memberAppointments_${memberId}`);
  const medications = localStorage.getItem(`memberMedications_${memberId}`);
  const labReports = localStorage.getItem(`labReports_${memberId}`);
  const healthMetrics = localStorage.getItem(`healthMetrics_${memberId}`);
  
  return {
    memberId,
    consultations: consultations ? JSON.parse(consultations) : [],
    appointments: appointments ? JSON.parse(appointments) : [],
    medications: medications ? JSON.parse(medications) : [],
    labReports: labReports ? JSON.parse(labReports) : [],
    healthMetrics: healthMetrics ? JSON.parse(healthMetrics) : []
  };
};

// Save consultation for a member
export const saveMemberConsultation = (memberId: string, consultation: any): void => {
  const consultations = getMemberHealthData(memberId).consultations;
  consultations.unshift(consultation);
  localStorage.setItem(`memberConsultations_${memberId}`, JSON.stringify(consultations));
};

// Save appointment for a member
export const saveMemberAppointment = (memberId: string, appointment: any): void => {
  const appointments = getMemberHealthData(memberId).appointments;
  appointments.push(appointment);
  localStorage.setItem(`memberAppointments_${memberId}`, JSON.stringify(appointments));
};

// Save medication for a member
export const saveMemberMedication = (memberId: string, medication: any): void => {
  const medications = getMemberHealthData(memberId).medications;
  medications.push(medication);
  localStorage.setItem(`memberMedications_${memberId}`, JSON.stringify(medications));
};

// Get family health summary
export const getFamilyHealthSummary = (userId: string): any => {
  const members = getFamilyMembers(userId);
  
  const summary = {
    totalMembers: members.length,
    totalConsultations: 0,
    totalAppointments: 0,
    totalMedications: 0,
    upcomingAppointments: 0,
    activeMedications: 0,
    membersSummary: members.map(member => {
      const healthData = getMemberHealthData(member.id);
      return {
        id: member.id,
        name: member.name,
        relationship: member.relationship,
        consultations: healthData.consultations.length,
        appointments: healthData.appointments.length,
        medications: healthData.medications.length,
        lastConsultation: healthData.consultations[0]?.timestamp || null
      };
    })
  };
  
  // Calculate totals
  summary.membersSummary.forEach(m => {
    summary.totalConsultations += m.consultations;
    summary.totalAppointments += m.appointments;
    summary.totalMedications += m.medications;
  });
  
  return summary;
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get relationship display name
export const getRelationshipDisplay = (relationship: FamilyMember['relationship']): string => {
  const displays = {
    self: 'Me',
    spouse: 'Spouse',
    child: 'Child',
    parent: 'Parent',
    sibling: 'Sibling',
    other: 'Other'
  };
  return displays[relationship] || relationship;
};

// Get default avatar based on sex and relationship
export const getDefaultAvatar = (sex: string, relationship: string): string => {
  // This can be replaced with actual avatar images
  const emojis: any = {
    male: {
      self: '👨',
      child: '👦',
      parent: '👨‍🦳',
      sibling: '👨‍🦱',
      spouse: '👨',
      other: '👤'
    },
    female: {
      self: '👩',
      child: '👧',
      parent: '👩‍🦳',
      sibling: '👩‍🦱',
      spouse: '👩',
      other: '👤'
    },
    other: {
      self: '👤',
      child: '🧒',
      parent: '🧓',
      sibling: '👤',
      spouse: '👤',
      other: '👤'
    }
  };
  
  return emojis[sex]?.[relationship] || '👤';
};

// Export family health data
export const exportFamilyHealthData = (userId: string): void => {
  const members = getFamilyMembers(userId);
  const summary = getFamilyHealthSummary(userId);
  
  const exportData = {
    exportDate: new Date().toISOString(),
    userId,
    summary,
    members: members.map(member => ({
      ...member,
      healthData: getMemberHealthData(member.id)
    }))
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family-health-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
