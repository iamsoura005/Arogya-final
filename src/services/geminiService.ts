import { GoogleGenerativeAI } from '@google/generative-ai';
import { detectDiseases, getSymptomRecommendations, diseaseDatabase } from './diseaseDatabase';
import { 
  getModelsForConditionType, 
  getEnhancedDiagnosisContext, 
  getClinicalInsights,
  getSkinImageModels,
  getEyeImageModels 
} from './localDatasetService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAl6r2SUEbJziJsRYE8ZcbZrYfjEmQ8AFU';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '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';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const USE_DEEPSEEK = true;

export const getChatResponse = async (userMessage: string, conversationHistory: string = ''): Promise<string> => {
  try {
    if (USE_DEEPSEEK) {
      return await getDeepSeekResponse(userMessage, conversationHistory);
    } else {
      return await getGeminiResponse(userMessage, conversationHistory);
    }
  } catch (error) {
    console.error('Primary API error, trying fallback:', error);
    try {
      return await getGeminiResponse(userMessage, conversationHistory);
    } catch (fallbackError) {
      console.error('Fallback API error:', fallbackError);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }
};

const getDeepSeekResponse = async (userMessage: string, conversationHistory: string = ''): Promise<string> => {
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

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.5,
        max_tokens: 300
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'DeepSeek API error');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
};

const getGeminiResponse = async (userMessage: string, conversationHistory: string = ''): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const systemPrompt = `You are Dr. Arogya. Concise responses only.
Diagnosis:
1. Medicine - dosage, frequency, duration
2. Medicine - dosage, frequency, duration
Care: home care line`;
    
    const prompt = conversationHistory 
      ? `${systemPrompt}

${conversationHistory}

Patient: ${userMessage}`
      : `${systemPrompt}\n\nPatient: ${userMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

export const getVoiceResponse = async (transcript: string): Promise<string> => {
  try {
    if (USE_DEEPSEEK) {
      return await getDeepSeekVoiceResponse(transcript);
    } else {
      return await getGeminiVoiceResponse(transcript);
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return 'Please consult a healthcare professional.';
  }
};

const getDeepSeekVoiceResponse = async (transcript: string): Promise<string> => {
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

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
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
        max_tokens: 80
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'DeepSeek voice error');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek voice error:', error);
    throw error;
  }
};

const getGeminiVoiceResponse = async (transcript: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent(`Brief response: ${transcript}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini voice error:', error);
    throw error;
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
  // Generate request ID for tracking
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting image analysis`);
  
  try {
    // Validate API key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here' || GEMINI_API_KEY.length < 20) {
      console.error(`[${requestId}] Invalid API key configuration`);
      throw new Error('API_003: Gemini API key not configured properly');
    }

    // Validate image data
    if (!imageData || imageData.length < 100) {
      console.error(`[${requestId}] Invalid image data length: ${imageData?.length || 0}`);
      throw new Error('IMG_002: Invalid or empty image data');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Extract and validate base64 data
    let base64Data: string;
    let mimeType: string;
    
    if (imageData.startsWith('data:')) {
      const parts = imageData.split(',');
      if (parts.length !== 2) {
        console.error(`[${requestId}] Invalid data URL format`);
        throw new Error('IMG_002: Invalid data URL format');
      }
      
      // Extract MIME type
      const header = parts[0];
      const mimeMatch = header.match(/data:([^;]+);/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      base64Data = parts[1];
      
      console.log(`[${requestId}] MIME: ${mimeType}, Base64 length: ${base64Data.length}`);
    } else {
      base64Data = imageData;
      mimeType = 'image/jpeg';
      console.log(`[${requestId}] Using raw base64, length: ${base64Data.length}`);
    }

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validMimeTypes.includes(mimeType)) {
      console.error(`[${requestId}] Unsupported MIME type: ${mimeType}`);
      throw new Error(`IMG_002: Unsupported image format: ${mimeType}`);
    }

    console.log(`[${requestId}] Calling Gemini API...`);
    const startTime = Date.now();
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API_001: Request timeout after 30 seconds')), 30000)
    );
    
    // Make API call
    const apiCallPromise = model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
      `ADVANCED MEDICAL IMAGE DIAGNOSTIC WITH CLINICAL DATA AUGMENTATION:

You are analyzing medical images for skin conditions, eye diseases, oral conditions, or general medical imaging.
This analysis is enhanced with clinical data from 20+ pre-trained medical models.

Provide EXTREMELY specific medical diagnosis with medical terminology.

Known conditions from clinical datasets:
Skin: Acne, psoriasis, eczema, fungal infections (ringworm, candidiasis), bacterial infections, chickenpox, scabies, monkeypox, rosacea, vitiligo, melanoma, basal cell carcinoma, warts, dermatitis
Eye: Conjunctivitis, cataracts, glaucoma, macular degeneration, diabetic retinopathy, corneal ulcers
Oral: Thrush, gingivitis, stomatitis, oral herpes
Systemic: Consider diabetes indicators, cardiovascular signs, neurological markers

Important: Use clinical terminology from medical datasets. Provide high-confidence diagnoses based on visual analysis.

Respond with ONLY valid JSON (no markdown, no code blocks, just raw JSON):
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
    ]);
    
    // Race between API call and timeout
    const result = await Promise.race([apiCallPromise, timeoutPromise]) as any;
    
    const latency = Date.now() - startTime;
    console.log(`[${requestId}] API call completed in ${latency}ms`);
    
    const response = await result.response;
    const text = response.text();
    
    console.log(`[${requestId}] Response length: ${text.length} chars`);
    console.log(`[${requestId}] Response preview:`, text.substring(0, 150));
    
    // Enhanced JSON extraction with multiple strategies
    let parsed: any = null;
    
    // Strategy 1: Direct JSON parse
    try {
      parsed = JSON.parse(text);
      console.log(`[${requestId}] ✓ Direct JSON parse succeeded`);
    } catch (e1) {
      console.log(`[${requestId}] Direct parse failed, trying alternatives...`);
      
      // Strategy 2: Extract from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch && !parsed) {
        try {
          parsed = JSON.parse(codeBlockMatch[1]);
          console.log(`[${requestId}] ✓ Code block extraction succeeded`);
        } catch (e2) {
          console.log(`[${requestId}] Code block parse failed`);
        }
      }
      
      // Strategy 3: Find first { to last }
      if (!parsed) {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          try {
            const jsonStr = text.substring(firstBrace, lastBrace + 1);
            parsed = JSON.parse(jsonStr);
            console.log(`[${requestId}] ✓ Brace extraction succeeded`);
          } catch (e3) {
            console.log(`[${requestId}] Brace extraction failed`);
          }
        }
      }
    }
    
    // Validate parsing succeeded
    if (!parsed) {
      console.error(`[${requestId}] ❌ All JSON parsing methods failed`);
      console.error(`[${requestId}] Raw response:`, text);
      throw new Error('MODEL_001: Failed to parse API response as JSON');
    }
    
    // Validate required fields
    if (!parsed.diagnosis || typeof parsed.diagnosis !== 'string') {
      console.error(`[${requestId}] ❌ Missing or invalid diagnosis field`);
      throw new Error('MODEL_001: Response missing required diagnosis field');
    }
    
    const conditionType = parsed.condition_type || 'general';
    
    console.log(`[${requestId}] ✓ Parsed diagnosis: "${parsed.diagnosis}"`);
    
    // Enhance with local dataset insights
    const diagnosisContext = getEnhancedDiagnosisContext(parsed.diagnosis, conditionType);
    const clinicalInsights = getClinicalInsights(parsed.diagnosis, parsed.severity || 'unknown');
    
    // Build dataset-informed recommendations
    const datasetInsights: string[] = [];
    if (diagnosisContext.length > 0) {
      datasetInsights.push(`Analysis supported by: ${diagnosisContext.map(ctx => ctx.modelName).join(', ')}`);
    }
    if (clinicalInsights.length > 0) {
      const topInsight = clinicalInsights[0];
      datasetInsights.push(`Clinical dataset validation: ${topInsight.recommendation}`);
    }
    
    // Enhance recommendations with dataset-backed information
    const enhancedRecommendations = [
      ...(parsed.recommendations || ['Consult a healthcare professional']),
      ...datasetInsights.slice(0, 2)
    ];
    
    console.log(`[${requestId}] ✓ Analysis completed successfully`);
    
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
    console.error(`[${requestId}] ❌ Analysis error:`, error);
    
    // Categorize error and provide detailed response
    let errorCode = 'MODEL_001';
    let userMessage = 'Unable to analyze image';
    let technicalMessage = error.message || 'Unknown error';
    
    if (error.message?.includes('API_003')) {
      errorCode = 'API_003';
      userMessage = 'API authentication failed';
      technicalMessage = 'Gemini API key is invalid or not configured';
    } else if (error.message?.includes('API_001')) {
      errorCode = 'API_001';
      userMessage = 'Analysis timed out';
      technicalMessage = 'Gemini API request exceeded 30 second timeout';
    } else if (error.message?.includes('IMG_002')) {
      errorCode = 'IMG_002';
      userMessage = 'Invalid image format';
      technicalMessage = error.message;
    } else if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorCode = 'API_002';
      userMessage = 'API rate limit exceeded';
      technicalMessage = 'Too many requests to Gemini API. Please wait and try again.';
    } else if (error.message?.includes('MODEL_001')) {
      errorCode = 'MODEL_001';
      userMessage = 'Failed to process API response';
      technicalMessage = error.message;
    }
    
    console.error(`[${requestId}] Error categorized as ${errorCode}: ${userMessage}`);
    
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const symptomList = symptoms.join(', ');
      
      const result = await model.generateContent(`Symptoms: ${symptomList}\nReturn JSON: {"possibleConditions": ["cond1"], "severity": "mild", "recommendations": ["action"]}`);
      
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return {
      possibleConditions: ['Consult doctor'],
      severity: 'unknown',
      recommendations: ['See professional']
    };
  }
};
