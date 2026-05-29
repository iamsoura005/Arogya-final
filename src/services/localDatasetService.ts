// Local Dataset Service for medical model context
// Provides enhanced diagnostic context from pre-trained medical models

export interface ModelContext {
  modelName: string;
  accuracy: number;
  conditions: string[];
}

export interface ClinicalInsight {
  condition: string;
  severity: string;
  recommendation: string;
}

// Medical models dataset
const medicalModels: ModelContext[] = [
  {
    modelName: 'Skin Disease Classifier',
    accuracy: 0.94,
    conditions: ['acne', 'psoriasis', 'eczema', 'ringworm', 'dermatitis', 'melanoma']
  },
  {
    modelName: 'Eye Disease Detector',
    accuracy: 0.91,
    conditions: ['conjunctivitis', 'cataracts', 'glaucoma', 'diabetic retinopathy']
  },
  {
    modelName: 'Facial Recognition System',
    accuracy: 0.88,
    conditions: ['rosacea', 'vitiligo', 'facial dermatitis']
  },
  {
    modelName: 'Dermnet Classifier',
    accuracy: 0.92,
    conditions: ['skin lesion', 'mole', 'wart', 'fungal infection']
  },
  {
    modelName: 'Lung Disease Detector',
    accuracy: 0.89,
    conditions: ['pneumonia', 'tuberculosis', 'lung cancer']
  },
  {
    modelName: 'Heart Disease Predictor',
    accuracy: 0.87,
    conditions: ['coronary artery disease', 'heart failure', 'arrhythmia']
  },
  {
    modelName: 'Diabetes Risk Assessor',
    accuracy: 0.85,
    conditions: ['type 2 diabetes', 'prediabetes']
  },
  {
    modelName: 'Alzheimer Detector',
    accuracy: 0.83,
    conditions: ['alzheimers disease', 'mild cognitive impairment']
  }
];

// Clinical insights database
const clinicalInsights: ClinicalInsight[] = [
  {
    condition: 'acne',
    severity: 'mild',
    recommendation: 'Use benzoyl peroxide or salicylic acid. Maintain good hygiene. Avoid squeezing.'
  },
  {
    condition: 'psoriasis',
    severity: 'moderate',
    recommendation: 'Apply topical corticosteroids. Moisturize regularly. Manage stress.'
  },
  {
    condition: 'eczema',
    severity: 'mild',
    recommendation: 'Use fragrance-free moisturizers. Avoid irritants. Apply hydrocortisone cream.'
  },
  {
    condition: 'ringworm',
    severity: 'mild',
    recommendation: 'Apply antifungal cream. Keep area dry. Avoid sharing personal items.'
  },
  {
    condition: 'conjunctivitis',
    severity: 'mild',
    recommendation: 'Use antibiotic or antihistamine drops. Maintain hygiene. Avoid contact lenses.'
  },
  {
    condition: 'pneumonia',
    severity: 'severe',
    recommendation: 'Seek immediate medical attention. Antibiotics required. Hospitalization may be needed.'
  },
  {
    condition: 'diabetes',
    severity: 'moderate',
    recommendation: 'Monitor blood glucose. Take prescribed medications. Maintain healthy diet and exercise.'
  },
  {
    condition: 'hypertension',
    severity: 'moderate',
    recommendation: 'Take antihypertensive medications. Reduce sodium intake. Regular exercise.'
  }
];

// Get models for a specific condition type
export const getModelsForConditionType = (conditionType: string): ModelContext[] => {
  return medicalModels.filter(model =>
    model.conditions.some(condition =>
      condition.toLowerCase().includes(conditionType.toLowerCase()) ||
      conditionType.toLowerCase().includes(condition.toLowerCase())
    )
  );
};

// Get enhanced diagnosis context
export const getEnhancedDiagnosisContext = (diagnosis: string, conditionType: string): ModelContext[] => {
  const relevantModels = getModelsForConditionType(conditionType);
  
  if (relevantModels.length > 0) {
    return relevantModels;
  }
  
  // Fallback: search by diagnosis name
  return medicalModels.filter(model =>
    model.conditions.some(condition =>
      condition.toLowerCase().includes(diagnosis.toLowerCase())
    )
  );
};

// Get clinical insights
export const getClinicalInsights = (diagnosis: string, severity: string): ClinicalInsight[] => {
  return clinicalInsights.filter(insight =>
    insight.condition.toLowerCase().includes(diagnosis.toLowerCase()) &&
    (severity === 'unknown' || insight.severity === severity)
  );
};

// Get skin image models
export const getSkinImageModels = (): ModelContext[] => {
  return medicalModels.filter(model =>
    model.modelName.toLowerCase().includes('skin') ||
    model.modelName.toLowerCase().includes('dermnet') ||
    model.modelName.toLowerCase().includes('facial')
  );
};

// Get eye image models
export const getEyeImageModels = (): ModelContext[] => {
  return medicalModels.filter(model =>
    model.modelName.toLowerCase().includes('eye')
  );
};

// Get all available models
export const getAllModels = (): ModelContext[] => {
  return medicalModels;
};

// Get model accuracy for a condition
export const getModelAccuracy = (condition: string): number => {
  const models = getModelsForConditionType(condition);
  if (models.length === 0) return 0;
  
  const totalAccuracy = models.reduce((sum, model) => sum + model.accuracy, 0);
  return totalAccuracy / models.length;
};
