import { detectDiseases, getSymptomRecommendations } from './diseaseDatabase';
import { 
  getEnhancedDiagnosisContext, 
  getClinicalInsights
} from './localDatasetService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_CHAT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Groq API client fetch helper
const callGroqAPI = async (messages: any[], model: string, temperature = 0.5, maxTokens?: number) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: model.includes('vision') ? undefined : { type: 'json_object' } // Groq supports JSON mode for llama models
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API helper error:', error);
    throw error;
  }
};

export const getChatResponse = async (userMessage: string, conversationHistory: string = ''): Promise<string> => {
  try {
    const systemPrompt = `You are Dr. Arogya, a compassionate and experienced physician with 15+ years of practice.

IMPORTANT: Respond EXACTLY like a real doctor talking to a patient - natural, warm, conversational.
NOT formal dialogue. NOT "Doctor: " prefixes. Just natural speech.

EXAMPLES of GOOD responses:
"I see. Fever with body aches usually points to a viral infection. I'd like to know when this started - was it today or did it begin a few days ago?"
"That's helpful information. Let me ask you about the intensity of your pain - would you say it's mild, moderate, or quite severe?"
"Based on what you've told me, this sounds like it could be food poisoning. Here's what I recommend..." 

RULES:
1. Be warm, empathetic, and professional
2. Ask ONE diagnostic question at a time
3. Build on previous answers naturally
4. Use conversational language, not formatted lists in questions
5. When diagnosing: "Based on your symptoms, this appears to be [disease]. Here's what I recommend: [medicines with dosages] - Take [medicine name] [dosage] [frequency]. For home care, [advice]. Important: [red flags]"
6. Never use "Doctor: " or "Patient: " labels
7. Sound like you're having a real conversation`;

    const messages = conversationHistory
      ? [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationHistory + '\n\nPatient: ' + userMessage }
        ]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ];

    // For general chat, we request a standard text completion
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_CHAT_MODEL,
        messages: messages,
        temperature: 0.5,
        max_tokens: 400
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq Chat API error:', error);
    throw new Error('Failed to get response from AI. Please try again.');
  }
};

export const getVoiceResponse = async (transcript: string): Promise<string> => {
  try {
    const symptomKeywords = ['pain', 'ache', 'fever', 'cough', 'rash', 'itchy', 'tired', 'fatigue', 'nausea', 'vomit', 'diarrhea', 'constipation', 'headache', 'sore', 'burning', 'swelling', 'weakness', 'dizzy', 'breathe', 'sneeze', 'discharge', 'bleeding'];
    const foundSymptoms = symptomKeywords.filter(keyword => transcript.toLowerCase().includes(keyword));
    
    let diseaseContext = '';
    if (foundSymptoms.length > 0) {
      const detectedDiseases = detectDiseases(foundSymptoms);
      if (detectedDiseases.length > 0) {
        diseaseContext = `\n\nDetected conditions: ${detectedDiseases.slice(0, 2).map(d => d.name).join(', ')}`;
      }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Dr. Arogya. Very brief voice response (1 sentence max). Be specific about disease if mentioned. Use format: "Sounds like [disease]. Take [medicine name - dosage]. See doctor if [red flag]."'
          },
          {
            role: 'user',
            content: `Patient said: ${transcript}${diseaseContext}`
          }
        ],
        temperature: 0.5,
        max_tokens: 100
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq Voice API error');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq voice error:', error);
    return 'Please consult a healthcare professional.';
  }
};

export const classifyImageWithMedicalContext = async (imageData: string): Promise<{
  diagnosis: string;
  confidence: number;
  conditionType: string;
  medicines: Array<{name: string, dosage: string, frequency: string, duration: string}>;
  recommendations: string[];
  severity: string;
  specialistNeeded: string;
  datasetEnhanced?: boolean;
  datasetInsights?: string[];
  errorDetails?: {
    code: string;
    technicalMessage: string;
    userMessage: string;
  };
}> => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting image analysis via Groq Llama-3.2-Vision`);
  
  try {
    if (!GROQ_API_KEY || GROQ_API_KEY.length < 15) {
      throw new Error('API_003: Groq API key not configured properly');
    }

    if (!imageData || imageData.length < 100) {
      throw new Error('IMG_002: Invalid or empty image data');
    }
    
    // Extract and validate base64 data
    let base64Data: string;
    let mimeType: string;
    
    if (imageData.startsWith('data:')) {
      const parts = imageData.split(',');
      if (parts.length !== 2) {
        throw new Error('IMG_002: Invalid data URL format');
      }
      
      const header = parts[0];
      const mimeMatch = header.match(/data:([^;]+);/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      base64Data = parts[1];
    } else {
      base64Data = imageData;
      mimeType = 'image/jpeg';
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validMimeTypes.includes(mimeType)) {
      throw new Error(`IMG_002: Unsupported image format: ${mimeType}`);
    }

    console.log(`[${requestId}] Calling Groq Vision API...`);
    const startTime = Date.now();
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `ADVANCED MEDICAL IMAGE DIAGNOSTIC WITH CLINICAL DATA AUGMENTATION:

You are analyzing medical images for skin conditions, eye diseases, oral conditions, or general medical imaging.
This analysis is enhanced with clinical data from 20+ pre-trained medical models.

Provide EXTREMELY specific medical diagnosis with medical terminology.

Known conditions from clinical datasets:
Skin: Acne, psoriasis, eczema, fungal infections (ringworm, candidiasis), bacterial infections, chickenpox, scabies, rosacea, vitiligo, melanoma, warts, dermatitis
Eye: Conjunctivitis, cataracts, glaucoma, macular degeneration, diabetic retinopathy, corneal ulcers
Oral: Thrush, gingivitis, stomatitis, oral herpes

Important: Use clinical terminology from medical datasets. Provide high-confidence diagnoses based on visual analysis.

Respond with ONLY valid JSON inside a markdown codeblock or raw json:
{
  "diagnosis": "Specific diagnosis with clinical details",
  "confidence": 85,
  "condition_type": "skin|eye|oral|general",
  "severity": "mild|moderate|severe",
  "medicines": [
    {"name": "drug name", "dosage": "strength", "frequency": "when", "duration": "how long"}
  ],
  "recommendations": ["action 1", "action 2", "Red flag: symptom"],
  "specialist_needed": "dermatologist|ophthalmologist|dentist|general physician"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    const latency = Date.now() - startTime;
    console.log(`[${requestId}] Groq Vision API call completed in ${latency}ms`);
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq Vision API error');
    }
    
    const text = data.choices[0].message.content;
    console.log(`[${requestId}] Response text preview:`, text.substring(0, 150));
    
    let parsed: any = null;
    
    // Attempt multiple parsing strategies
    try {
      parsed = JSON.parse(text.trim());
    } catch (e1) {
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try {
          parsed = JSON.parse(codeBlockMatch[1]);
        } catch (e2) {
          console.error('Code block parsing failed');
        }
      }
      
      if (!parsed) {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          try {
            parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));
          } catch (e3) {
            console.error('Brace extraction parsing failed');
          }
        }
      }
    }
    
    if (!parsed) {
      throw new Error('MODEL_001: Failed to parse API response as JSON');
    }
    
    if (!parsed.diagnosis || typeof parsed.diagnosis !== 'string') {
      throw new Error('MODEL_001: Response missing required diagnosis field');
    }
    
    const conditionType = parsed.condition_type || 'general';
    const diagnosisContext = getEnhancedDiagnosisContext(parsed.diagnosis, conditionType);
    const clinicalInsights = getClinicalInsights(parsed.diagnosis, parsed.severity || 'unknown');
    
    const datasetInsights: string[] = [];
    if (diagnosisContext.length > 0) {
      datasetInsights.push(`Analysis supported by: ${diagnosisContext.map(ctx => ctx.modelName).join(', ')}`);
    }
    if (clinicalInsights.length > 0) {
      datasetInsights.push(`Clinical dataset validation: ${clinicalInsights[0].recommendation}`);
    }
    
    const enhancedRecommendations = [
      ...(parsed.recommendations || ['Consult a healthcare professional']),
      ...datasetInsights.slice(0, 2)
    ];
    
    return {
      diagnosis: parsed.diagnosis,
      confidence: parsed.confidence || 60,
      conditionType: conditionType,
      medicines: parsed.medicines || [],
      recommendations: enhancedRecommendations,
      severity: parsed.severity || 'unknown',
      specialistNeeded: parsed.specialist_needed || 'general physician',
      datasetEnhanced: datasetInsights.length > 0,
      datasetInsights: datasetInsights
    };
    
  } catch (error: any) {
    console.error(`[${requestId}] Groq Vision Error:`, error);
    
    let errorCode = 'MODEL_001';
    let userMessage = 'Unable to analyze image';
    let technicalMessage = error.message || 'Unknown error';
    
    if (error.message?.includes('API_003')) {
      errorCode = 'API_003';
      userMessage = 'API authentication failed';
      technicalMessage = 'Groq API key is invalid or not configured';
    } else if (error.message?.includes('IMG_002')) {
      errorCode = 'IMG_002';
      userMessage = 'Invalid image format';
      technicalMessage = error.message;
    } else if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorCode = 'API_002';
      userMessage = 'API rate limit exceeded';
      technicalMessage = 'Too many requests to Groq API. Please wait and try again.';
    }
    
    return {
      diagnosis: `${userMessage}. Please try again or consult a healthcare professional.`,
      confidence: 0,
      conditionType: 'unknown',
      medicines: [],
      recommendations: [
        'Professional medical evaluation required',
        'If urgent, contact emergency services'
      ],
      severity: 'unknown',
      specialistNeeded: 'general physician',
      datasetEnhanced: false,
      errorDetails: {
        code: errorCode,
        technicalMessage: technicalMessage,
        userMessage: userMessage
      }
    };
  }
};

export const checkSymptoms = async (symptoms: string[]): Promise<{ possibleConditions: string[]; severity: string; recommendations: string[] }> => {
  try {
    const dbRecommendations = getSymptomRecommendations(symptoms);
    
    return {
      possibleConditions: dbRecommendations.possibleConditions,
      severity: dbRecommendations.severity,
      recommendations: dbRecommendations.recommendations
    };
  } catch (error) {
    console.error('Symptom check error:', error);
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_CHAT_MODEL,
          messages: [
            {
              role: 'user',
              content: `Symptoms: ${symptoms.join(', ')}\nReturn JSON: {"possibleConditions": ["cond1"], "severity": "mild", "recommendations": ["action"]}`
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });
      
      const data = await response.json();
      const text = data.choices[0].message.content;
      return JSON.parse(text.trim());
    } catch (fallbackError) {
      console.error('Groq symptom fallback error:', fallbackError);
    }
    
    return {
      possibleConditions: ['Consult doctor'],
      severity: 'unknown',
      recommendations: ['See professional']
    };
  }
};
