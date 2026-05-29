// Extended Disease Database with additional conditions
import { Disease } from './diseaseDatabase';

export const extendedDiseaseDatabase: Disease[] = [
  {
    id: 'dengue',
    name: 'Dengue Fever',
    symptoms: ['high fever', 'severe headache', 'body aches', 'joint pain', 'rash', 'nausea', 'vomiting'],
    commonCauses: ['dengue virus', 'mosquito bite', 'aedes mosquito'],
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '5-7 days' },
      { name: 'Platelet transfusion', dosage: 'As needed', frequency: 'As needed', duration: 'As needed', notes: 'If severe' }
    ],
    homeRemedies: ['Rest completely', 'Drink plenty of fluids', 'Avoid NSAIDs', 'Papaya leaf juice', 'Coconut water'],
    severity: 'moderate',
    redFlags: ['Bleeding from gums', 'Black stools', 'Severe abdominal pain', 'Persistent vomiting'],
    duration: '7-10 days',
    description: 'Viral infection transmitted by mosquitoes'
  },

  {
    id: 'chickenpox',
    name: 'Chickenpox',
    symptoms: ['fever', 'rash with blisters', 'itching', 'fatigue', 'headache', 'body aches'],
    commonCauses: ['varicella-zoster virus', 'viral infection', 'contact with infected person'],
    medicines: [
      { name: 'Acyclovir', dosage: '800mg', frequency: '5 times daily', duration: '7-10 days' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '5-7 days' }
    ],
    homeRemedies: ['Oatmeal baths', 'Calamine lotion', 'Keep nails trimmed', 'Avoid scratching', 'Rest'],
    severity: 'mild',
    redFlags: ['Difficulty breathing', 'Severe infection', 'High fever persisting'],
    duration: '7-10 days',
    description: 'Highly contagious viral infection causing characteristic rash'
  },

  {
    id: 'monkeypox',
    name: 'Monkeypox',
    symptoms: ['fever', 'rash', 'body aches', 'swollen lymph nodes', 'fatigue', 'headache'],
    commonCauses: ['monkeypox virus', 'contact with infected person', 'animal contact'],
    medicines: [
      { name: 'Tecovirimat', dosage: '600mg', frequency: 'Twice daily', duration: '14 days' },
      { name: 'Supportive care', dosage: 'As needed', frequency: 'As needed', duration: 'As needed' }
    ],
    homeRemedies: ['Rest', 'Hydration', 'Pain management', 'Isolation from others'],
    severity: 'moderate',
    redFlags: ['Severe rash', 'Difficulty breathing', 'Secondary infection'],
    duration: '2-4 weeks',
    description: 'Viral infection with characteristic pustular rash'
  },

  {
    id: 'psoriasis',
    name: 'Psoriasis',
    symptoms: ['red patches', 'silvery scales', 'itching', 'burning sensation', 'dry skin', 'nail changes'],
    commonCauses: ['autoimmune disorder', 'genetic factors', 'stress', 'skin injury'],
    medicines: [
      { name: 'Topical corticosteroid', dosage: '0.1%', frequency: 'Twice daily', duration: '2-4 weeks' },
      { name: 'Salicylic acid', dosage: '2%', frequency: 'Twice daily', duration: '2-4 weeks' }
    ],
    homeRemedies: ['Moisturize regularly', 'Avoid triggers', 'Stress management', 'Sunlight exposure', 'Avoid smoking'],
    severity: 'mild',
    redFlags: ['Severe skin infection', 'Systemic symptoms'],
    duration: 'Chronic condition',
    description: 'Chronic autoimmune skin condition with scaling and inflammation'
  },

  {
    id: 'ringworm',
    name: 'Ringworm (Fungal Infection)',
    symptoms: ['circular rash', 'itching', 'red patches', 'scaling', 'burning sensation'],
    commonCauses: ['fungal infection', 'poor hygiene', 'warm moist environment', 'contact with infected person'],
    medicines: [
      { name: 'Terbinafine cream', dosage: '1%', frequency: 'Twice daily', duration: '2-4 weeks' },
      { name: 'Miconazole cream', dosage: '2%', frequency: 'Twice daily', duration: '2-4 weeks' }
    ],
    homeRemedies: ['Keep area dry', 'Avoid scratching', 'Wash hands frequently', 'Use antifungal powder', 'Avoid sharing items'],
    severity: 'mild',
    redFlags: ['Widespread infection', 'Signs of secondary infection'],
    duration: '2-4 weeks',
    description: 'Contagious fungal skin infection'
  },

  {
    id: 'conjunctivitis',
    name: 'Conjunctivitis (Pink Eye)',
    symptoms: ['red eyes', 'itching', 'discharge', 'watery eyes', 'light sensitivity', 'swollen eyelids'],
    commonCauses: ['bacterial infection', 'viral infection', 'allergies', 'irritants'],
    medicines: [
      { name: 'Antibiotic eye drops', dosage: '1-2 drops', frequency: '4-6 times daily', duration: '5-7 days' },
      { name: 'Antihistamine eye drops', dosage: '1-2 drops', frequency: 'As needed', duration: '5-7 days' }
    ],
    homeRemedies: ['Warm compress', 'Clean with saline solution', 'Avoid touching eyes', 'Wash hands frequently', 'Use separate towel'],
    severity: 'mild',
    redFlags: ['Vision changes', 'Severe pain', 'Discharge with fever'],
    duration: '5-7 days',
    description: 'Inflammation of the conjunctiva causing redness and discharge'
  },

  {
    id: 'sinusitis',
    name: 'Sinusitis',
    symptoms: ['nasal congestion', 'facial pain', 'headache', 'nasal discharge', 'cough', 'fever'],
    commonCauses: ['bacterial infection', 'viral infection', 'allergies', 'nasal polyps'],
    medicines: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '10-14 days' },
      { name: 'Nasal decongestant', dosage: '2 sprays', frequency: 'Twice daily', duration: '3-5 days' }
    ],
    homeRemedies: ['Steam inhalation', 'Saline nasal drops', 'Warm compress', 'Hydration', 'Elevate head while sleeping'],
    severity: 'mild',
    redFlags: ['Fever above 39°C', 'Vision changes', 'Severe headache'],
    duration: '7-14 days',
    description: 'Inflammation of the sinuses causing congestion and pain'
  },

  {
    id: 'tonsillitis',
    name: 'Tonsillitis',
    symptoms: ['sore throat', 'difficulty swallowing', 'fever', 'swollen tonsils', 'white patches', 'headache'],
    commonCauses: ['bacterial infection', 'viral infection', 'streptococcus'],
    medicines: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '10 days' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '5-7 days' }
    ],
    homeRemedies: ['Throat lozenges', 'Warm salt water gargle', 'Honey and lemon', 'Rest', 'Soft food diet'],
    severity: 'mild',
    redFlags: ['Difficulty breathing', 'Severe swelling', 'High fever'],
    duration: '5-7 days',
    description: 'Inflammation of the tonsils causing sore throat'
  }
];
