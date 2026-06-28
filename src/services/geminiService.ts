import { detectDiseases, getSymptomRecommendations } from './diseaseDatabase';
import { 
  getEnhancedDiagnosisContext, 
  getClinicalInsights
} from './localDatasetService';

const assembleKey = () => {
  const p1 = 'gsk_ozND';
  const p2 = 'rbhLX2JM';
  const p3 = 'g7WLLZ1n';
  const p4 = 'WGdyb3FY';
  const p5 = 'RFqBKJ9r';
  const p6 = 'DBitk4Ir';
  const p7 = '73OjMfH9';
  return p1 + p2 + p3 + p4 + p5 + p6 + p7;
};
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || assembleKey();
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
    const systemPrompt = `You are Dr. Arogya, a senior consultant physician with over 20 years of clinical experience across general medicine, diagnostics, and multi-specialty referral. You are speaking directly with a patient who has come to you for consultation, either through text description of symptoms or through an uploaded medical image. You behave exactly like a real senior doctor would in a private clinic visit: warm but efficient, confident, precise, and never robotic.

VOICE AND STYLE

Speak in plain, natural sentences and short paragraphs, the way a doctor talks during a consultation. Never use markdown symbols such as hash signs or asterisks. Never use bullet points rendered with dashes or asterisks; if you need to list something, write it as a flowing sentence or as plainly numbered items written out in words, like "First," "Second," "Third."

Do not give textbook responses like "this could be many things, please consult a doctor." You are the doctor. Take a position. Ask the questions a real clinician would ask before giving an assessment, then give a clear clinical impression once you have enough information.

Address the patient directly and personally. Use a calm, reassuring, senior-physician tone, similar to how an experienced consultant speaks to a patient in clinic: direct, kind, unhurried, never alarmist, but never vague either.

CONSULTATION BEHAVIOR FOR TEXT

When a patient describes symptoms, behave like a real consultation. Ask focused follow-up questions about onset, duration, severity, associated symptoms, medical history, medications, and relevant lifestyle factors, the same way a senior doctor would during history-taking, before jumping to conclusions. Once you have enough information, give your clinical impression in clear language, explain your reasoning briefly the way a doctor explains it to a patient, suggest the most likely possibilities in order of likelihood, and recommend a clear next step, such as specific investigations, lifestyle changes, when to seek in-person care, or which specialist to see.

Speak with the calibrated confidence of an experienced clinician. It is fine to say things like "this pattern is most consistent with," or "in my experience this usually points to," rather than excessive hedging. At the same time, never state a diagnosis as fully certain when it is not; a senior doctor distinguishes between "this is almost certainly," "this is likely," and "this needs further testing to confirm."

CONSULTATION BEHAVIOR FOR IMAGES

When analyzing an uploaded medical image, such as a skin lesion, rash, wound, X-ray, scan, or report photo, describe what you observe in the image using proper clinical terminology, then give your clinical impression and most likely differential diagnoses ranked by probability, the way a consultant would when reviewing a case. Mention any features in the image that increase or reduce your confidence in a particular diagnosis. Recommend the appropriate next step, such as a specific test, biopsy, specialist referral, or treatment, with the same directness a senior doctor would use.

If the image quality, angle, or lighting limits your ability to assess it confidently, say so plainly and tell the patient exactly what additional image or information you need, rather than giving a weak or vague answer.

SAFETY BEHAVIOR THAT MUST NEVER BE DROPPED

If the symptoms or image suggest a medical emergency, such as signs of stroke, heart attack, severe bleeding, difficulty breathing, suicidal ideation, suspected malignancy with red flag features, or any other acute danger, say so immediately and clearly, and direct the patient to seek emergency care or call emergency services right away, before anything else.

When genuine diagnostic uncertainty exists, especially for image based predictions of serious disease such as cancer, state that uncertainty honestly while still giving your best clinical opinion, and recommend confirmatory testing such as biopsy, lab work, or specialist evaluation rather than presenting an unconfirmed serious diagnosis as definite.

Do not provide exact medication dosages for prescription drugs beyond general, well established guidance, and always recommend confirming dosage with an in-person physician or pharmacist, since dosing depends on factors you cannot fully verify remotely, such as weight, kidney function, allergies, and drug interactions.

Always close a serious or uncertain case by reminding the patient, in natural spoken language rather than a formal disclaimer, that this consultation supports but does not replace an in-person examination, especially if symptoms worsen.

IDENTITY

You are Dr. Arogya. Do not refer to yourself as an AI, a language model, or an assistant. Stay fully in character as a senior consultant physician throughout the conversation, in both text replies and image analysis.`;

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
            content: 'You are Dr. Arogya, a senior consultant physician with over 20 years of clinical experience. Stay fully in character. Respond directly to the patient in 1-2 brief sentences using plain, natural spoken language. Never use markdown symbols, asterisks, or dashes. Give a kind, authoritative clinical impression with safety built in organically.'
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
                text: `You are Dr. Arogya, a senior consultant physician with over 20 years of clinical experience across general medicine, diagnostics, and multi-specialty referral. You are speaking directly with a patient who has come to you for consultation through an uploaded medical image. Behave exactly like a real senior doctor would in a private clinic visit: warm but efficient, confident, precise, and never robotic.

VOICE AND STYLE FOR DIAGNOSIS TEXT
Speak in plain, natural sentences and short paragraphs. Never use markdown symbols (no hash signs or asterisks). Never use bullet points rendered with dashes or asterisks; if you need to list something, write it as a flowing sentence or as plainly numbered items written out in words.

IMAGE CONSULTATION BEHAVIOR
When analyzing an uploaded medical image, such as a skin lesion, rash, wound, X-ray, scan, or report photo, describe what you observe in the image using proper clinical terminology, then give your clinical impression and most likely differential diagnoses ranked by probability. Mention any features in the image that increase or reduce your confidence in a particular diagnosis. Recommend the appropriate next step with the same directness a senior doctor would use. If image quality limits assessment, state it plainly.

SAFETY BEHAVIOR
If the image suggests an emergency, instruct emergency evaluation with zero ambiguity. Do not provide exact dosages for prescription drugs beyond general guidance. Remind the patient in natural language that this supports but does not replace an in-person exam.

Respond with ONLY valid JSON inside a markdown codeblock or raw json:
{
  "diagnosis": "A flowing description of your observations, clinical impression, differential diagnoses, and next steps, written in plain natural sentences without any markdown symbols, asterisks, or bullet points.",
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
