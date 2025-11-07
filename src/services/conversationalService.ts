/**
 * Conversational AI Service
 * Handles NLP symptom parsing, follow-up questions, multilingual support
 */

// ============= TYPES =============

export interface ExtractedSymptom {
  symptom: string;
  duration?: string;
  severity?: string;
  frequency?: string;
  location?: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  symptom: string;
  type: 'duration' | 'severity' | 'frequency' | 'location' | 'associated' | 'triggers';
  language: string;
}

export interface ConversationContext {
  extractedSymptoms: ExtractedSymptom[];
  missingDetails: string[];
  followUpAsked: string[];
  completeness: number; // 0-100
}

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  hi: 'Hindi',
  zh: 'Mandarin'
};

// ============= SYMPTOM EXTRACTION =============

/**
 * Extract symptoms from natural language using NLP patterns
 */
export function extractSymptomsFromText(text: string, language: string = 'en'): ExtractedSymptom[] {
  const symptoms: ExtractedSymptom[] = [];
  const textLower = text.toLowerCase();

  // Common symptom patterns
  const symptomPatterns: Record<string, RegExp[]> = {
    // Duration patterns
    duration: [
      /for (\d+) (day|days|week|weeks|month|months|year|years)/gi,
      /since (yesterday|last week|last month)/gi,
      /(\d+) (hour|hours) ago/gi
    ],
    // Severity patterns
    severity: [
      /(mild|moderate|severe|intense|sharp|dull|throbbing)/gi,
      /(getting worse|getting better|constant)/gi
    ],
    // Frequency patterns
    frequency: [
      /(constant|intermittent|occasional|frequent)/gi,
      /(every \d+ (hour|hours|minute|minutes))/gi,
      /(once|twice|several times) (a|per) (day|hour)/gi
    ],
    // Location patterns
    location: [
      /(left|right) (side|arm|leg|chest)/gi,
      /(upper|lower) (abdomen|back)/gi,
      /(front|back) of (head|chest)/gi
    ]
  };

  // Common symptoms dictionary
  const commonSymptoms = [
    'headache', 'fever', 'cough', 'cold', 'sore throat', 'nausea', 'vomiting',
    'diarrhea', 'constipation', 'fatigue', 'dizziness', 'chest pain', 'shortness of breath',
    'stomach pain', 'back pain', 'joint pain', 'rash', 'itching', 'swelling',
    'numbness', 'weakness', 'confusion', 'blurred vision', 'ear pain'
  ];

  // Extract symptoms
  commonSymptoms.forEach(symptom => {
    if (textLower.includes(symptom)) {
      const extractedSymptom: ExtractedSymptom = {
        symptom
      };

      // Extract duration
      symptomPatterns.duration.forEach(pattern => {
        const match = textLower.match(pattern);
        if (match) {
          extractedSymptom.duration = match[0];
        }
      });

      // Extract severity
      symptomPatterns.severity.forEach(pattern => {
        const match = textLower.match(pattern);
        if (match) {
          extractedSymptom.severity = match[0];
        }
      });

      // Extract frequency
      symptomPatterns.frequency.forEach(pattern => {
        const match = textLower.match(pattern);
        if (match) {
          extractedSymptom.frequency = match[0];
        }
      });

      // Extract location
      symptomPatterns.location.forEach(pattern => {
        const match = textLower.match(pattern);
        if (match) {
          extractedSymptom.location = match[0];
        }
      });

      symptoms.push(extractedSymptom);
    }
  });

  return symptoms;
}

// ============= FOLLOW-UP QUESTIONS =============

/**
 * Generate follow-up questions based on extracted symptoms
 */
export function generateFollowUpQuestions(
  extractedSymptoms: ExtractedSymptom[],
  language: string = 'en'
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];

  extractedSymptoms.forEach(symptom => {
    // Duration question
    if (!symptom.duration) {
      questions.push({
        id: `${symptom.symptom}_duration`,
        question: translateQuestion('How long have you had this symptom?', language, symptom.symptom),
        symptom: symptom.symptom,
        type: 'duration',
        language
      });
    }

    // Severity question
    if (!symptom.severity) {
      questions.push({
        id: `${symptom.symptom}_severity`,
        question: translateQuestion('How severe is the symptom? (mild, moderate, or severe)', language, symptom.symptom),
        symptom: symptom.symptom,
        type: 'severity',
        language
      });
    }

    // Symptom-specific questions
    if (symptom.symptom === 'headache') {
      questions.push({
        id: `${symptom.symptom}_type`,
        question: translateQuestion('Is it a throbbing pain, sharp pain, or dull ache?', language, symptom.symptom),
        symptom: symptom.symptom,
        type: 'associated',
        language
      });
    }

    if (symptom.symptom === 'chest pain') {
      questions.push({
        id: `${symptom.symptom}_radiation`,
        question: translateQuestion('Does the pain radiate to your arms, jaw, or back?', language, symptom.symptom),
        symptom: symptom.symptom,
        type: 'location',
        language
      });
    }

    if (symptom.symptom === 'cough') {
      questions.push({
        id: `${symptom.symptom}_productive`,
        question: translateQuestion('Is it a dry cough or are you coughing up phlegm?', language, symptom.symptom),
        symptom: symptom.symptom,
        type: 'associated',
        language
      });
    }
  });

  return questions.slice(0, 3); // Limit to 3 follow-ups to avoid overwhelming
}

/**
 * Translate questions to different languages
 */
function translateQuestion(question: string, language: string, symptom: string): string {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'How long have you had this symptom?': `¿Cuánto tiempo ha tenido este síntoma (${symptom})?`,
      'How severe is the symptom? (mild, moderate, or severe)': `¿Qué tan grave es el síntoma? (leve, moderado o grave)`,
      'Is it a throbbing pain, sharp pain, or dull ache?': '¿Es un dolor pulsante, agudo o sordo?',
      'Does the pain radiate to your arms, jaw, or back?': '¿El dolor se irradia a los brazos, la mandíbula o la espalda?',
      'Is it a dry cough or are you coughing up phlegm?': '¿Es una tos seca o está tosiendo flema?'
    },
    hi: {
      'How long have you had this symptom?': `आपको यह लक्षण (${symptom}) कब से है?`,
      'How severe is the symptom? (mild, moderate, or severe)': 'लक्षण कितना गंभीर है? (हल्का, मध्यम, या गंभीर)',
      'Is it a throbbing pain, sharp pain, or dull ache?': 'क्या यह धड़कता दर्द, तीव्र दर्द, या सुस्त दर्द है?',
      'Does the pain radiate to your arms, jaw, or back?': 'क्या दर्द आपकी बाहों, जबड़े या पीठ तक फैलता है?',
      'Is it a dry cough or are you coughing up phlegm?': 'क्या यह सूखी खांसी है या आप बलगम खांस रहे हैं?'
    },
    zh: {
      'How long have you had this symptom?': `您有这个症状 (${symptom}) 多久了？`,
      'How severe is the symptom? (mild, moderate, or severe)': '症状有多严重？（轻度、中度或重度）',
      'Is it a throbbing pain, sharp pain, or dull ache?': '是跳动的疼痛、尖锐的疼痛还是隐痛？',
      'Does the pain radiate to your arms, jaw, or back?': '疼痛是否辐射到您的手臂、下巴或背部？',
      'Is it a dry cough or are you coughing up phlegm?': '是干咳还是咳痰？'
    }
  };

  if (language === 'en') return question;
  return translations[language]?.[question] || question;
}

// ============= CONVERSATION CONTEXT =============

/**
 * Analyze conversation completeness
 */
export function analyzeConversationContext(messages: string[]): ConversationContext {
  const allText = messages.join(' ');
  const extractedSymptoms = extractSymptomsFromText(allText);
  
  const missingDetails: string[] = [];
  let totalDetails = 0;
  let providedDetails = 0;

  extractedSymptoms.forEach(symptom => {
    totalDetails += 4; // duration, severity, frequency, location
    
    if (symptom.duration) providedDetails++;
    else missingDetails.push(`${symptom.symptom} duration`);
    
    if (symptom.severity) providedDetails++;
    else missingDetails.push(`${symptom.symptom} severity`);
    
    if (symptom.frequency) providedDetails++;
    if (symptom.location) providedDetails++;
  });

  const completeness = totalDetails > 0 ? (providedDetails / totalDetails) * 100 : 0;

  return {
    extractedSymptoms,
    missingDetails,
    followUpAsked: [],
    completeness
  };
}

// ============= VOICE BIOMARKER ANALYSIS =============

/**
 * Analyze cough sound for respiratory patterns
 * (Requires Web Audio API and ML model in production)
 */
export interface VoiceBiomarker {
  type: 'cough' | 'breathing' | 'speech_pattern';
  detected: boolean;
  confidence: number;
  characteristics: string[];
  insights: string[];
}

/**
 * Analyze voice for biomarkers (mock implementation)
 */
export function analyzeVoiceBiomarkers(audioData: AudioBuffer): VoiceBiomarker[] {
  // In production, use ML model for cough detection
  // For now, return mock data
  return [
    {
      type: 'cough',
      detected: false,
      confidence: 0,
      characteristics: [],
      insights: []
    }
  ];
}

/**
 * Detect cough in audio
 */
export function detectCoughInAudio(audioData: Blob): Promise<boolean> {
  return new Promise((resolve) => {
    // In production, use ML model
    // For demo, resolve false
    setTimeout(() => resolve(false), 100);
  });
}

// ============= LANGUAGE DETECTION =============

/**
 * Detect language from text
 */
export function detectLanguage(text: string): string {
  // Simple language detection based on character sets
  const hasHindi = /[\u0900-\u097F]/.test(text);
  const hasChinese = /[\u4E00-\u9FFF]/.test(text);
  const hasSpanish = /[áéíóúñ¿¡]/i.test(text);

  if (hasHindi) return 'hi';
  if (hasChinese) return 'zh';
  if (hasSpanish) return 'es';
  return 'en';
}

/**
 * Set speech recognition language
 */
export function setSpeechRecognitionLanguage(
  recognition: any,
  language: string
): void {
  const langCodes: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    hi: 'hi-IN',
    zh: 'zh-CN'
  };

  recognition.lang = langCodes[language] || 'en-US';
}

// ============= ACCENT HANDLING =============

/**
 * Normalize text for different accents/dialects
 */
export function normalizeAccentedText(text: string, language: string): string {
  // Handle common accent-based misrecognitions
  const replacements: Record<string, Array<[RegExp, string]>> = {
    en: [
      [/feber/gi, 'fever'],
      [/cof/gi, 'cough'],
      [/stomac/gi, 'stomach'],
      [/hed ache/gi, 'headache']
    ],
    es: [
      [/fiebre/gi, 'fever'],
      [/tos/gi, 'cough'],
      [/dolor/gi, 'pain']
    ],
    hi: [
      [/bukhar/gi, 'fever'],
      [/khasi/gi, 'cough'],
      [/dard/gi, 'pain']
    ],
    zh: [
      [/发烧/gi, 'fever'],
      [/咳嗽/gi, 'cough'],
      [/疼痛/gi, 'pain']
    ]
  };

  let normalized = text;
  const patterns = replacements[language] || [];
  
  patterns.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement);
  });

  return normalized;
}

/**
 * Get greeting in different languages
 */
export function getGreeting(language: string): string {
  const greetings: Record<string, string> = {
    en: 'Hello! I am your AI health assistant. Please describe your symptoms.',
    es: '¡Hola! Soy tu asistente de salud con IA. Por favor, describe tus síntomas.',
    hi: 'नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। कृपया अपने लक्षण बताएं।',
    zh: '你好！我是您的人工智能健康助手。请描述您的症状。'
  };

  return greetings[language] || greetings.en;
}

/**
 * Generate conversational response with follow-ups
 */
export function generateConversationalResponse(
  symptoms: ExtractedSymptom[],
  context: ConversationContext,
  language: string = 'en'
): { response: string; followUp?: string } {
  const symptomsFound = symptoms.length;
  
  if (symptomsFound === 0) {
    return {
      response: translate('I understand. Can you describe your symptoms in more detail?', language),
      followUp: translate('What specific symptoms are you experiencing?', language)
    };
  }

  const primarySymptom = symptoms[0].symptom;
  let response = translate(`I understand you're experiencing ${primarySymptom}.`, language);

  // Add empathy
  if (symptoms[0].severity === 'severe' || primarySymptom.includes('pain')) {
    response += ' ' + translate('I\'m sorry to hear that.', language);
  }

  // Generate follow-up
  const followUps = generateFollowUpQuestions(symptoms, language);
  const followUp = followUps[0]?.question;

  return { response, followUp };
}

/**
 * Simple translation helper
 */
function translate(text: string, language: string): string {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'I understand. Can you describe your symptoms in more detail?': 'Entiendo. ¿Puedes describir tus síntomas con más detalle?',
      'What specific symptoms are you experiencing?': '¿Qué síntomas específicos estás experimentando?',
      'I\'m sorry to hear that.': 'Lamento escuchar eso.'
    },
    hi: {
      'I understand. Can you describe your symptoms in more detail?': 'मैं समझता हूं। क्या आप अपने लक्षणों का अधिक विस्तार से वर्णन कर सकते हैं?',
      'What specific symptoms are you experiencing?': 'आप किन विशिष्ट लक्षणों का अनुभव कर रहे हैं?',
      'I\'m sorry to hear that.': 'यह सुनकर मुझे दुख हुआ।'
    },
    zh: {
      'I understand. Can you describe your symptoms in more detail?': '我明白了。您能更详细地描述您的症状吗？',
      'What specific symptoms are you experiencing?': '您正在经历哪些具体症状？',
      'I\'m sorry to hear that.': '听到这个消息我很抱歉。'
    }
  };

  if (language === 'en') return text;
  
  // Replace placeholders like ${symptom}
  const symptomatic = text.match(/\$\{(\w+)\}/);
  if (symptomatic) {
    return text; // Return as is for template strings
  }

  return translations[language]?.[text] || text;
}

export default {
  extractSymptomsFromText,
  generateFollowUpQuestions,
  analyzeConversationContext,
  detectLanguage,
  setSpeechRecognitionLanguage,
  normalizeAccentedText,
  getGreeting,
  generateConversationalResponse,
  analyzeVoiceBiomarkers,
  detectCoughInAudio
};
