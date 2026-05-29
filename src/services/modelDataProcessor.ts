// Model Data Processor for handling medical model outputs
// Processes and normalizes data from various medical AI models

export interface ProcessedDiagnosis {
  diagnosis: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  redFlags: string[];
}

// Process raw model output into standardized format
export const processModelOutput = (rawOutput: any): ProcessedDiagnosis => {
  return {
    diagnosis: rawOutput.diagnosis || 'Unable to determine',
    confidence: Math.min(100, Math.max(0, rawOutput.confidence || 0)),
    severity: normalizeSeverity(rawOutput.severity),
    recommendations: normalizeRecommendations(rawOutput.recommendations),
    medicines: normalizeMedicines(rawOutput.medicines),
    redFlags: normalizeRedFlags(rawOutput.redFlags)
  };
};

// Normalize severity levels
const normalizeSeverity = (severity: any): 'mild' | 'moderate' | 'severe' => {
  if (!severity) return 'mild';
  
  const severityStr = String(severity).toLowerCase();
  
  if (severityStr.includes('severe') || severityStr.includes('critical') || severityStr.includes('high')) {
    return 'severe';
  }
  if (severityStr.includes('moderate') || severityStr.includes('medium')) {
    return 'moderate';
  }
  
  return 'mild';
};

// Normalize recommendations array
const normalizeRecommendations = (recommendations: any): string[] => {
  if (!recommendations) return [];
  
  if (Array.isArray(recommendations)) {
    return recommendations.map(r => String(r)).filter(r => r.length > 0);
  }
  
  if (typeof recommendations === 'string') {
    return [recommendations];
  }
  
  return [];
};

// Normalize medicines array
const normalizeMedicines = (medicines: any): Array<{
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}> => {
  if (!medicines) return [];
  
  if (!Array.isArray(medicines)) {
    return [];
  }
  
  return medicines
    .filter(med => med && typeof med === 'object')
    .map(med => ({
      name: String(med.name || med.medicine || 'Unknown'),
      dosage: String(med.dosage || med.dose || 'As prescribed'),
      frequency: String(med.frequency || med.freq || 'As directed'),
      duration: String(med.duration || med.period || 'As needed')
    }));
};

// Normalize red flags array
const normalizeRedFlags = (redFlags: any): string[] => {
  if (!redFlags) return [];
  
  if (Array.isArray(redFlags)) {
    return redFlags.map(flag => String(flag)).filter(flag => flag.length > 0);
  }
  
  if (typeof redFlags === 'string') {
    return [redFlags];
  }
  
  return [];
};

// Merge multiple model outputs
export const mergeModelOutputs = (outputs: ProcessedDiagnosis[]): ProcessedDiagnosis => {
  if (outputs.length === 0) {
    return {
      diagnosis: 'Unable to determine',
      confidence: 0,
      severity: 'mild',
      recommendations: [],
      medicines: [],
      redFlags: []
    };
  }
  
  if (outputs.length === 1) {
    return outputs[0];
  }
  
  // Average confidence
  const avgConfidence = outputs.reduce((sum, o) => sum + o.confidence, 0) / outputs.length;
  
  // Merge recommendations (remove duplicates)
  const allRecommendations = outputs.flatMap(o => o.recommendations);
  const uniqueRecommendations = [...new Set(allRecommendations)];
  
  // Merge medicines (remove duplicates by name)
  const medicineMap = new Map();
  outputs.forEach(o => {
    o.medicines.forEach(med => {
      if (!medicineMap.has(med.name)) {
        medicineMap.set(med.name, med);
      }
    });
  });
  
  // Merge red flags (remove duplicates)
  const allRedFlags = outputs.flatMap(o => o.redFlags);
  const uniqueRedFlags = [...new Set(allRedFlags)];
  
  // Determine highest severity
  const severityOrder = { mild: 0, moderate: 1, severe: 2 };
  const maxSeverity = outputs.reduce((max, o) => {
    return severityOrder[o.severity] > severityOrder[max] ? o.severity : max;
  }, 'mild' as 'mild' | 'moderate' | 'severe');
  
  return {
    diagnosis: outputs[0].diagnosis,
    confidence: Math.round(avgConfidence),
    severity: maxSeverity,
    recommendations: uniqueRecommendations,
    medicines: Array.from(medicineMap.values()),
    redFlags: uniqueRedFlags
  };
};

// Validate diagnosis confidence
export const isConfidentDiagnosis = (diagnosis: ProcessedDiagnosis, threshold: number = 70): boolean => {
  return diagnosis.confidence >= threshold;
};

// Get severity color for UI
export const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe'): string => {
  switch (severity) {
    case 'mild':
      return 'bg-green-100 text-green-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'severe':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format diagnosis for display
export const formatDiagnosis = (diagnosis: ProcessedDiagnosis): string => {
  return `${diagnosis.diagnosis} (${diagnosis.confidence}% confidence, ${diagnosis.severity} severity)`;
};
