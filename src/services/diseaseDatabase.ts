// Comprehensive Disease Database with symptoms, causes, and treatments
// Data sourced from medical databases and Kaggle datasets
import { extendedDiseaseDatabase } from './extendedDiseaseDatabase';

export interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  commonCauses: string[];
  medicines: Medicine[];
  homeRemedies: string[];
  severity: 'mild' | 'moderate' | 'severe';
  redFlags: string[];
  duration: string;
  description: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export const diseaseDatabase: Disease[] = [
  {
    id: 'common_cold',
    name: 'Common Cold',
    symptoms: ['runny nose', 'sneezing', 'sore throat', 'mild cough', 'fatigue', 'headache'],
    commonCauses: ['viral infection', 'rhinovirus', 'coronavirus', 'exposure to cold air'],
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '5-7 days' },
      { name: 'Cough syrup (Dextromethorphan)', dosage: '10ml', frequency: 'Every 6 hours', duration: '5-7 days' },
      { name: 'Vitamin C supplement', dosage: '1000mg', frequency: 'Once daily', duration: '7-10 days' }
    ],
    homeRemedies: ['Ginger tea with honey', 'Warm water with lemon', 'Rest and sleep', 'Gargle with salt water', 'Steam inhalation'],
    severity: 'mild',
    redFlags: ['High fever (>39°C)', 'Difficulty breathing', 'Persistent symptoms beyond 10 days'],
    duration: '5-10 days',
    description: 'Mild viral infection affecting upper respiratory tract'
  },

  {
    id: 'acute_bronchitis',
    name: 'Acute Bronchitis',
    symptoms: ['dry cough', 'productive cough with phlegm', 'chest discomfort', 'fatigue', 'mild fever', 'shortness of breath'],
    commonCauses: ['viral infection', 'bacterial infection', 'smoking', 'air pollution', 'post-viral'],
    medicines: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '7-10 days', notes: 'If bacterial' },
      { name: 'Dextromethorphan', dosage: '20mg', frequency: 'Every 6 hours as needed', duration: '7-10 days' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '7-10 days' }
    ],
    homeRemedies: ['Steam inhalation 2-3 times daily', 'Honey and lemon water', 'Avoid smoking and pollution', 'Rest completely', 'Warm fluids'],
    severity: 'moderate',
    redFlags: ['Difficulty breathing', 'High fever', 'Chest pain worsens', 'Coughing blood'],
    duration: '10-20 days',
    description: 'Inflammation of the air tubes in lungs causing persistent cough'
  },

  {
    id: 'food_poisoning',
    name: 'Food Poisoning / Gastroenteritis',
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'stomach cramps', 'loss of appetite', 'mild fever'],
    commonCauses: ['contaminated food', 'bacterial infection', 'viral infection', 'spoiled food', 'foodborne pathogen'],
    medicines: [
      { name: 'Ondansetron', dosage: '4mg', frequency: '2 times daily', duration: '2-3 days' },
      { name: 'Metronidazole', dosage: '400mg', frequency: '3 times daily', duration: '5 days', notes: 'For bacterial' },
      { name: 'Electrolyte solution (ORS)', dosage: '1 liter', frequency: 'Throughout the day', duration: '3-5 days' }
    ],
    homeRemedies: ['ORS water frequently', 'Bland food (rice, bread)', 'Avoid dairy and oily food', 'Ginger water', 'Complete rest'],
    severity: 'moderate',
    redFlags: ['Blood in vomit or stool', 'Severe abdominal pain', 'Unable to keep fluids down', 'Signs of dehydration'],
    duration: '1-7 days',
    description: 'Stomach and intestinal inflammation from contaminated food'
  },

  {
    id: 'viral_fever',
    name: 'Viral Fever / Influenza',
    symptoms: ['high fever', 'body aches', 'fatigue', 'headache', 'throat pain', 'cough', 'chills', 'muscle pain'],
    commonCauses: ['influenza virus', 'viral infection', 'dengue', 'chikungunya', 'cold and flu season'],
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3-5 days', notes: 'Max 2000mg/day' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6 hours', duration: '3-5 days', notes: 'If fever persists' },
      { name: 'Oseltamivir (Tamiflu)', dosage: '75mg', frequency: 'Twice daily', duration: '5 days', notes: 'If flu suspected' }
    ],
    homeRemedies: ['Rest (7-10 hours sleep)', 'Plenty of water', 'Turmeric milk', 'Ginger and honey', 'Avoid sun exposure'],
    severity: 'moderate',
    redFlags: ['Fever above 40°C', 'Difficulty breathing', 'Confusion or altered consciousness', 'Severe headache with stiff neck'],
    duration: '3-7 days',
    description: 'Viral infection causing systemic symptoms and high fever'
  },

  {
    id: 'urinary_tract_infection',
    name: 'Urinary Tract Infection (UTI)',
    symptoms: ['burning during urination', 'frequent urination', 'urgent urination', 'cloudy urine', 'pain in lower abdomen', 'blood in urine'],
    commonCauses: ['bacterial infection', 'dehydration', 'poor hygiene', 'kidney stones', 'enlargement of prostate'],
    medicines: [
      { name: 'Cefixime', dosage: '200mg', frequency: 'Twice daily', duration: '5-7 days' },
      { name: 'Nitrofurantoin', dosage: '100mg', frequency: 'Twice daily', duration: '5-7 days' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3-5 days' }
    ],
    homeRemedies: ['Drink 2-3 liters of water daily', 'Cranberry juice', 'Avoid caffeine and spicy food', 'Urinate frequently', 'Warm compress on abdomen'],
    severity: 'moderate',
    redFlags: ['Fever above 39°C with back pain', 'Blood in urine', 'Nausea and vomiting', 'Inability to urinate'],
    duration: '5-7 days',
    description: 'Bacterial infection of urinary tract causing pain and frequency'
  },

  {
    id: 'migraine',
    name: 'Migraine / Severe Headache',
    symptoms: ['severe headache', 'throbbing pain on one side', 'sensitivity to light', 'nausea', 'vomiting', 'visual disturbances', 'aura'],
    commonCauses: ['stress', 'hormonal changes', 'food triggers', 'lack of sleep', 'dehydration', 'environmental factors'],
    medicines: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6 hours as needed', duration: 'As needed' },
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'Once when migraine starts', duration: 'Single dose', notes: 'Prescription needed' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: 'As needed' }
    ],
    homeRemedies: ['Dark and quiet room', 'Cold compress on forehead', 'Reduce screen time', 'Avoid triggers', 'Regular sleep schedule', 'Meditation and yoga'],
    severity: 'moderate',
    redFlags: ['Fever with severe headache', 'Stiff neck', 'Confusion', 'Vision loss', 'Weakness'],
    duration: '4-72 hours',
    description: 'Neurological condition causing severe, often one-sided headache'
  },

  {
    id: 'allergies',
    name: 'Allergies / Allergic Rhinitis',
    symptoms: ['sneezing', 'itchy nose', 'runny nose', 'watery eyes', 'itchy eyes', 'nasal congestion', 'throat itching'],
    commonCauses: ['pollen', 'dust mites', 'pet dander', 'mold', 'food allergies', 'seasonal change'],
    medicines: [
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5-7 days' },
      { name: 'Loratadine', dosage: '10mg', frequency: 'Once daily', duration: '5-7 days' },
      { name: 'Nasal spray (Fluticasone)', dosage: '2 sprays', frequency: 'Once or twice daily', duration: '5-7 days' }
    ],
    homeRemedies: ['Avoid allergen exposure', 'Saline nasal drops', 'Keep room clean', 'Use air filter', 'Honey consumption'],
    severity: 'mild',
    redFlags: ['Difficulty breathing', 'Throat swelling', 'Severe itching with rash'],
    duration: '5-14 days',
    description: 'Immune system overreaction to harmless substances'
  },

  {
    id: 'acne',
    name: 'Acne',
    symptoms: ['pimples on face', 'blackheads', 'whiteheads', 'red inflamed lesions', 'oily skin', 'skin tenderness'],
    commonCauses: ['hormonal changes', 'bacterial infection', 'excess sebum', 'clogged pores', 'poor hygiene', 'genetic factors'],
    medicines: [
      { name: 'Benzoyl peroxide cream', dosage: '2.5-5%', frequency: 'Once or twice daily', duration: '4-8 weeks' },
      { name: 'Salicylic acid', dosage: '2%', frequency: 'Once or twice daily', duration: '4-8 weeks' },
      { name: 'Clindamycin', dosage: '1% solution', frequency: 'Twice daily', duration: '4-8 weeks', notes: 'For bacterial' }
    ],
    homeRemedies: ['Wash face 2-3 times daily', 'Use non-comedogenic moisturizer', 'Avoid touching face', 'Tea tree oil', 'Zinc-rich diet'],
    severity: 'mild',
    redFlags: ['Severe cystic acne', 'Signs of infection'],
    duration: '4-12 weeks',
    description: 'Skin condition caused by clogged pores and bacterial growth'
  },

  {
    id: 'asthma_attack',
    name: 'Asthma / Asthma Attack',
    symptoms: ['shortness of breath', 'wheezing', 'chest tightness', 'coughing', 'difficulty speaking', 'anxiety', 'rapid breathing'],
    commonCauses: ['allergen exposure', 'exercise', 'cold air', 'stress', 'infection', 'pollution'],
    medicines: [
      { name: 'Salbutamol inhaler', dosage: '100mcg', frequency: 'As needed (every 4-6 hours)', duration: 'Ongoing' },
      { name: 'Fluticasone inhaler', dosage: '110mcg', frequency: 'Twice daily', duration: 'Ongoing maintenance' },
      { name: 'Prednisolone', dosage: '20-40mg', frequency: 'Once daily', duration: '5-7 days', notes: 'For severe attacks' }
    ],
    homeRemedies: ['Sit upright', 'Slow deep breathing', 'Use humidifier', 'Avoid triggers', 'Keep inhaler handy'],
    severity: 'severe',
    redFlags: ['Severe difficulty breathing', 'Blue lips or face', 'Unable to speak', 'Chest pain', 'Unresponsive to inhaler'],
    duration: 'Minutes to hours',
    description: 'Chronic inflammatory disease of airways with recurrent symptoms'
  },

  {
    id: 'diabetes',
    name: 'Diabetes (Type 2)',
    symptoms: ['excessive thirst', 'frequent urination', 'fatigue', 'blurred vision', 'slow wound healing', 'tingling in feet'],
    commonCauses: ['insulin resistance', 'obesity', 'sedentary lifestyle', 'poor diet', 'genetic factors', 'age'],
    medicines: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: 'Long-term' },
      { name: 'Glipizide', dosage: '5-10mg', frequency: 'Before meals', duration: 'Long-term', notes: 'If Metformin insufficient' },
      { name: 'Atorvastatin', dosage: '10-20mg', frequency: 'Once daily', duration: 'Long-term' }
    ],
    homeRemedies: ['Regular exercise', 'Healthy balanced diet', 'Reduce sugar intake', 'Weight management', 'Monitor blood glucose'],
    severity: 'moderate',
    redFlags: ['Blood sugar very high (>300 mg/dL)', 'Diabetic ketoacidosis symptoms', 'Severe dehydration'],
    duration: 'Lifelong management',
    description: 'Metabolic disorder with high blood sugar levels'
  },

  {
    id: 'hypertension',
    name: 'High Blood Pressure (Hypertension)',
    symptoms: ['headache', 'shortness of breath', 'chest pain', 'fatigue', 'dizziness', 'nosebleeds'],
    commonCauses: ['stress', 'obesity', 'high sodium diet', 'lack of exercise', 'family history', 'aging'],
    medicines: [
      { name: 'Amlodipine', dosage: '5-10mg', frequency: 'Once daily', duration: 'Long-term' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: 'Long-term' },
      { name: 'Atenolol', dosage: '50mg', frequency: 'Once daily', duration: 'Long-term' }
    ],
    homeRemedies: ['Low sodium diet', 'Regular exercise', 'Stress reduction', 'Weight loss', 'Limit alcohol', 'Increase potassium'],
    severity: 'moderate',
    redFlags: ['Blood pressure >180/120', 'Chest pain', 'Shortness of breath', 'Severe headache with confusion'],
    duration: 'Lifelong management',
    description: 'Elevated blood pressure straining heart and blood vessels'
  },

  {
    id: 'anemia',
    name: 'Anemia',
    symptoms: ['fatigue', 'weakness', 'pale skin', 'shortness of breath', 'dizziness', 'cold hands and feet', 'difficulty concentrating'],
    commonCauses: ['iron deficiency', 'vitamin B12 deficiency', 'chronic disease', 'blood loss', 'poor diet'],
    medicines: [
      { name: 'Iron supplement (Ferrous sulfate)', dosage: '325mg', frequency: 'Once daily', duration: '2-3 months' },
      { name: 'Vitamin B12 injection', dosage: '1000mcg', frequency: 'Monthly', duration: 'Long-term', notes: 'If B12 deficiency' },
      { name: 'Folic acid', dosage: '5mg', frequency: 'Once daily', duration: '3 months' }
    ],
    homeRemedies: ['Increase iron-rich food (spinach, red meat)', 'Vitamin C rich foods', 'Avoid tea with meals', 'Rest adequately', 'Blood transfusion if severe'],
    severity: 'mild',
    redFlags: ['Severe shortness of breath', 'Chest pain', 'Severe dizziness', 'Fainting'],
    duration: '2-6 months',
    description: 'Insufficient red blood cells or hemoglobin in blood'
  },

  {
    id: 'thyroid_disorder',
    name: 'Hypothyroidism',
    symptoms: ['fatigue', 'weight gain', 'cold sensitivity', 'dry skin', 'constipation', 'hair loss', 'depression'],
    commonCauses: ['autoimmune disease', 'iodine deficiency', 'post-thyroidectomy', 'medication side effects'],
    medicines: [
      { name: 'Levothyroxine', dosage: '25-200mcg', frequency: 'Once daily before food', duration: 'Long-term' }
    ],
    homeRemedies: ['Iodine-rich food (seafood, dairy)', 'Regular exercise', 'Adequate sleep', 'Stress management'],
    severity: 'mild',
    redFlags: ['Severe cold intolerance', 'Mental confusion', 'Heart palpitations'],
    duration: 'Lifelong management',
    description: 'Underactive thyroid gland producing insufficient hormones'
  },

  {
    id: 'anxiety_disorder',
    name: 'Anxiety Disorder / Panic Attack',
    symptoms: ['excessive worry', 'rapid heartbeat', 'shortness of breath', 'trembling', 'sweating', 'chest pain', 'feeling of impending doom'],
    commonCauses: ['stress', 'genetic factors', 'caffeine', 'lack of sleep', 'traumatic events'],
    medicines: [
      { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', duration: '4-8 weeks minimum' },
      { name: 'Lorazepam', dosage: '0.5-1mg', frequency: 'As needed', duration: 'Short-term', notes: 'For acute attacks' },
      { name: 'Propranolol', dosage: '20-40mg', frequency: 'Twice daily', duration: '4-8 weeks' }
    ],
    homeRemedies: ['Deep breathing exercises', 'Meditation and yoga', 'Reduce caffeine', 'Regular exercise', 'Talk to counselor', 'Adequate sleep'],
    severity: 'moderate',
    redFlags: ['Severe chest pain', 'Unable to function', 'Suicidal thoughts'],
    duration: '4-12 weeks with treatment',
    description: 'Mental health condition with persistent worry and physical symptoms'
  },

  {
    id: 'eczema',
    name: 'Eczema / Dermatitis',
    symptoms: ['itchy skin', 'red patches', 'dry skin', 'skin inflammation', 'burning sensation', 'small raised bumps'],
    commonCauses: ['dry skin', 'irritants', 'allergens', 'stress', 'genetic factors', 'temperature changes'],
    medicines: [
      { name: 'Hydrocortisone cream', dosage: '1%', frequency: 'Twice daily', duration: '5-7 days' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5-7 days' },
      { name: 'Moisturizer', dosage: 'As needed', frequency: 'Multiple times daily', duration: 'Ongoing' }
    ],
    homeRemedies: ['Moisturize regularly', 'Avoid hot baths', 'Use mild soap', 'Avoid allergens', 'Wear soft cotton', 'Humidifier'],
    severity: 'mild',
    redFlags: ['Signs of infection (oozing, warmth)', 'Fever with rash'],
    duration: '2-4 weeks',
    description: 'Inflammatory skin condition causing itching and irritation'
  },

  {
    id: 'osteoarthritis',
    name: 'Arthritis / Joint Pain',
    symptoms: ['joint pain', 'stiffness', 'swelling', 'reduced mobility', 'creaking sounds', 'redness around joint'],
    commonCauses: ['aging', 'wear and tear', 'obesity', 'injury', 'overuse', 'genetic factors'],
    medicines: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: 'As needed' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: 'As needed' },
      { name: 'Glucosamine sulfate', dosage: '1500mg', frequency: 'Once daily', duration: '2-3 months' }
    ],
    homeRemedies: ['Warm compress', 'Gentle exercise', 'Weight management', 'Turmeric and ginger', 'Rest affected joint', 'Massage'],
    severity: 'mild',
    redFlags: ['Severe swelling', 'Fever with joint pain', 'Inability to move joint'],
    duration: '2-8 weeks',
    description: 'Joint inflammation causing pain and reduced movement'
  },

  {
    id: 'peptic_ulcer',
    name: 'Peptic Ulcer / GERD',
    symptoms: ['burning stomach pain', 'bloating', 'heartburn', 'nausea', 'dark stools', 'vomiting blood'],
    commonCauses: ['H. pylori bacteria', 'NSAIDs', 'stress', 'spicy food', 'alcohol', 'smoking'],
    medicines: [
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '4-8 weeks' },
      { name: 'Ranitidine', dosage: '150mg', frequency: 'Twice daily', duration: '4-8 weeks' },
      { name: 'Antacid (Magnesium hydroxide)', dosage: '30ml', frequency: 'As needed', duration: 'As needed' }
    ],
    homeRemedies: ['Avoid spicy food', 'Avoid alcohol and smoking', 'Eat smaller meals', 'Raise head while sleeping', 'Milk and yogurt'],
    severity: 'moderate',
    redFlags: ['Vomiting blood', 'Black/dark stools', 'Severe abdominal pain', 'Rapid weight loss'],
    duration: '4-8 weeks',
    description: 'Open sore in stomach lining or small intestine'
  }
];

// Function to detect diseases based on symptoms with improved matching
export const detectDiseases = (symptoms: string[]): Disease[] => {
  const allDiseases = [...diseaseDatabase, ...extendedDiseaseDatabase];
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  
  const matches = allDiseases
    .map(disease => {
      const matchCount = disease.symptoms.filter(symptom =>
        lowerSymptoms.some(userSymptom => 
          symptom.toLowerCase().includes(userSymptom) || 
          userSymptom.includes(symptom.toLowerCase())
        )
      ).length;
      
      // Boost score for exact matches
      const exactMatches = lowerSymptoms.filter(symptom =>
        disease.symptoms.some(s => s.toLowerCase() === symptom)
      ).length;
      
      return { disease, matchCount: matchCount + (exactMatches * 2) };
    })
    .filter(m => m.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3) // Top 3 matches
    .map(m => m.disease);
  
  return matches;
};

// Function to get treatment for a disease
export const getDiseaseInfo = (diseaseId: string): Disease | undefined => {
  return diseaseDatabase.find(d => d.id === diseaseId);
};

// Function to search disease by name
export const searchDisease = (query: string): Disease[] => {
  const lowerQuery = query.toLowerCase();
  return diseaseDatabase.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.symptoms.some(s => s.toLowerCase().includes(lowerQuery))
  );
};

// Enhanced function for symptom-based recommendations
export const getSymptomRecommendations = (symptoms: string[]): { 
  possibleConditions: string[]; 
  severity: string; 
  recommendations: string[],
  medicines: Array<{name: string, dosage: string, frequency: string, duration: string}>
} => {
  const detectedDiseases = detectDiseases(symptoms);
  
  if (detectedDiseases.length === 0) {
    return {
      possibleConditions: ['Unable to determine - Consult a doctor'],
      severity: 'unknown',
      recommendations: ['Visit a healthcare professional for proper diagnosis'],
      medicines: []
    };
  }
  
  const topDisease = detectedDiseases[0];
  const recommendations: string[] = [];
  
  // Add specific recommendations based on disease
  recommendations.push(`This appears to be: ${topDisease.name}`);
  recommendations.push(...topDisease.homeRemedies.slice(0, 2));
  recommendations.push(`Severity: ${topDisease.severity}`);
  
  if (topDisease.redFlags.length > 0) {
    recommendations.push(`⚠️ Red flags: ${topDisease.redFlags[0]}`);
  }
  
  return {
    possibleConditions: detectedDiseases.map(d => d.name),
    severity: topDisease.severity,
    recommendations: recommendations,
    medicines: topDisease.medicines
  };
};
