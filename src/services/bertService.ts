/**
 * BERT-Enhanced Symptom Analysis Service
 * Provides emotionally intelligent and contextually aware medical responses
 */

interface BERTAnalysisResult {
  emotionalTone: 'anxious' | 'concerned' | 'neutral' | 'urgent';
  severityScore: number; // 0-10
  empathyLevel: 'high' | 'medium' | 'low';
  recommendedResponse: string;
  contextualInsights: string[];
  urgencyLevel: 'immediate' | 'soon' | 'routine' | 'monitor';
}

interface SymptomContext {
  symptoms: string[];
  duration?: string;
  severity?: string;
}

/**
 * BERT-inspired emotional analysis
 * Analyzes symptom patterns to determine emotional context and appropriate response tone
 */
export function analyzeBERTEmotionalContext(context: SymptomContext): BERTAnalysisResult {
  const { symptoms } = context;
  
  // Symptom severity mapping (BERT-like classification)
  const severityKeywords = {
    high: ['chest pain', 'shortness of breath', 'severe', 'intense', 'unbearable', 'blood'],
    medium: ['fever', 'vomiting', 'diarrhea', 'headache', 'dizziness'],
    low: ['fatigue', 'sore throat', 'congestion', 'sneezing', 'itching']
  };
  
  // Emotional tone detection based on symptom combination
  let emotionalTone: BERTAnalysisResult['emotionalTone'] = 'neutral';
  let severityScore = 0;
  let urgencyLevel: BERTAnalysisResult['urgencyLevel'] = 'routine';
  
  // Calculate severity score (0-10)
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    if (severityKeywords.high.some(keyword => lowerSymptom.includes(keyword))) {
      severityScore += 3;
    } else if (severityKeywords.medium.some(keyword => lowerSymptom.includes(keyword))) {
      severityScore += 2;
    } else {
      severityScore += 1;
    }
  });
  
  severityScore = Math.min(severityScore, 10);
  
  // Determine emotional tone based on severity
  if (severityScore >= 8) {
    emotionalTone = 'urgent';
    urgencyLevel = 'immediate';
  } else if (severityScore >= 5) {
    emotionalTone = 'anxious';
    urgencyLevel = 'soon';
  } else if (severityScore >= 3) {
    emotionalTone = 'concerned';
    urgencyLevel = 'routine';
  }
  
  // Determine empathy level
  const empathyLevel: BERTAnalysisResult['empathyLevel'] = 
    emotionalTone === 'urgent' || emotionalTone === 'anxious' ? 'high' : 
    emotionalTone === 'concerned' ? 'medium' : 'low';
  
  // Generate contextual insights using BERT-like understanding
  const contextualInsights = generateContextualInsights(symptoms, emotionalTone, severityScore);
  
  // Generate emotionally appropriate response
  const recommendedResponse = generateEmpathicResponse(emotionalTone, symptoms, severityScore);
  
  return {
    emotionalTone,
    severityScore,
    empathyLevel,
    recommendedResponse,
    contextualInsights,
    urgencyLevel
  };
}

/**
 * Generate contextual insights based on symptom patterns
 */
function generateContextualInsights(symptoms: string[], tone: string, severity: number): string[] {
  const insights: string[] = [];
  
  // Pattern recognition for common symptom clusters
  const respiratorySymptoms = ['cough', 'shortness of breath', 'chest pain', 'congestion'];
  const gastrointestinalSymptoms = ['nausea', 'vomiting', 'diarrhea', 'loss of appetite'];
  const fluSymptoms = ['fever', 'body ache', 'fatigue', 'headache', 'chills'];
  const allergySymptoms = ['sneezing', 'watery eyes', 'itching', 'rash'];
  
  const hasRespiratory = symptoms.some(s => respiratorySymptoms.some(rs => s.toLowerCase().includes(rs.toLowerCase())));
  const hasGI = symptoms.some(s => gastrointestinalSymptoms.some(gi => s.toLowerCase().includes(gi.toLowerCase())));
  const hasFlu = symptoms.some(s => fluSymptoms.some(fs => s.toLowerCase().includes(fs.toLowerCase())));
  const hasAllergy = symptoms.some(s => allergySymptoms.some(as => s.toLowerCase().includes(as.toLowerCase())));
  
  if (hasRespiratory && severity >= 6) {
    insights.push("Your respiratory symptoms require careful attention. Consider seeking medical evaluation.");
  }
  
  if (hasGI && symptoms.length >= 3) {
    insights.push("Multiple gastrointestinal symptoms detected. Stay hydrated and monitor your condition.");
  }
  
  if (hasFlu && symptoms.length >= 4) {
    insights.push("Your symptoms suggest a possible viral infection. Rest and fluids are important.");
  }
  
  if (hasAllergy) {
    insights.push("Allergy-related symptoms identified. Consider environmental factors and antihistamines.");
  }
  
  // Combination warnings
  if (symptoms.includes('Fever') && symptoms.includes('Shortness of Breath')) {
    insights.push("⚠️ The combination of fever and breathing difficulty warrants immediate medical attention.");
  }
  
  if (symptoms.includes('Chest Pain') || symptoms.includes('Severe Headache')) {
    insights.push("⚠️ This symptom can indicate serious conditions. Please consult a healthcare provider urgently.");
  }
  
  return insights.length > 0 ? insights : ["Your symptoms have been analyzed. Please follow the recommendations provided."];
}

/**
 * Generate empathic, emotionally intelligent response
 */
function generateEmpathicResponse(tone: string, symptoms: string[], severity: number): string {
  const symptomsText = symptoms.length === 1 ? 'symptom' : 'symptoms';
  
  switch (tone) {
    case 'urgent':
      return `I understand you're experiencing concerning ${symptomsText}. Your health and safety are the top priority. ` +
             `Based on the severity of your symptoms, I strongly recommend seeking immediate medical attention. ` +
             `These symptoms can indicate conditions that require prompt professional evaluation and treatment. ` +
             `Please don't hesitate to visit an emergency room or call emergency services if symptoms worsen.`;
    
    case 'anxious':
      return `Thank you for sharing your ${symptomsText} with me. I can understand this might be worrying for you. ` +
             `Your symptoms suggest you should schedule a medical consultation within the next 24-48 hours. ` +
             `While you wait, please monitor your condition carefully and seek immediate help if symptoms intensify. ` +
             `Remember, early intervention often leads to better outcomes, so don't delay getting professional care.`;
    
    case 'concerned':
      return `I've carefully reviewed your ${symptomsText}. While these are common complaints, they still deserve attention. ` +
             `I recommend scheduling an appointment with your healthcare provider within the next few days. ` +
             `In the meantime, the home remedies and over-the-counter medications suggested below may help provide relief. ` +
             `Please monitor your symptoms and seek immediate care if they worsen or new symptoms develop.`;
    
    default:
      return `Thank you for using our symptom checker. Based on your ${symptomsText}, ` +
             `you may benefit from some basic self-care measures. ` +
             `However, if symptoms persist for more than a few days, worsen, or if you develop new symptoms, ` +
             `please consult with a healthcare professional for a proper evaluation.`;
  }
}

/**
 * Generate BERT-enhanced medical advice with emotional intelligence
 */
export function generateBERTEnhancedAdvice(
  symptoms: string[],
  detectedDiseases: any[],
  bertAnalysis: BERTAnalysisResult
): {
  introduction: string;
  emotionalSupport: string;
  actionSteps: string[];
  monitoringAdvice: string;
  reassurance: string;
} {
  const { emotionalTone, empathyLevel, urgencyLevel } = bertAnalysis;
  
  // Emotionally intelligent introduction
  let introduction = '';
  if (empathyLevel === 'high') {
    introduction = "I want to acknowledge that dealing with these symptoms can be stressful. Your wellbeing matters, and seeking help is the right step.";
  } else if (empathyLevel === 'medium') {
    introduction = "Thank you for taking the time to check your symptoms. Let's work together to understand what's happening.";
  } else {
    introduction = "Here's what I found based on your symptoms:";
  }
  
  // Emotional support message
  const emotionalSupport = urgencyLevel === 'immediate' 
    ? "Your safety is paramount. Please prioritize getting immediate medical care."
    : urgencyLevel === 'soon'
    ? "While this needs attention, try to stay calm. Medical help is available and can provide relief."
    : "Remember, most conditions are manageable with proper care. You're taking the right steps.";
  
  // Action steps based on urgency
  const actionSteps: string[] = [];
  
  if (urgencyLevel === 'immediate') {
    actionSteps.push("🚨 Seek emergency medical care immediately");
    actionSteps.push("Call emergency services or go to the nearest emergency room");
    actionSteps.push("Do not drive yourself if symptoms are severe");
    actionSteps.push("Inform family members or friends about your condition");
  } else if (urgencyLevel === 'soon') {
    actionSteps.push("📞 Contact your healthcare provider within 24-48 hours");
    actionSteps.push("Explain all your symptoms clearly during the appointment");
    actionSteps.push("Follow the prescribed treatment plan carefully");
    actionSteps.push("Keep a symptom diary to track any changes");
  } else {
    actionSteps.push("📅 Schedule a routine check-up if symptoms persist");
    actionSteps.push("Try the recommended home remedies and over-the-counter medications");
    actionSteps.push("Maintain good hygiene and rest adequately");
    actionSteps.push("Monitor your symptoms for any changes");
  }
  
  // Monitoring advice
  const monitoringAdvice = urgencyLevel === 'immediate'
    ? "Watch for any worsening of symptoms or development of new severe symptoms while seeking care."
    : "Keep track of your symptoms. If they worsen, become more frequent, or new concerning symptoms appear, seek medical attention promptly.";
  
  // Reassurance
  const reassurance = empathyLevel === 'high'
    ? "You're not alone in this. Healthcare professionals are here to help you feel better. Take care of yourself."
    : "With proper care and attention, most conditions improve. Stay positive and follow medical advice.";
  
  return {
    introduction,
    emotionalSupport,
    actionSteps,
    monitoringAdvice,
    reassurance
  };
}

/**
 * Confidence scoring for recommendations (BERT-like classification confidence)
 */
export function calculateRecommendationConfidence(symptoms: string[], detectedDiseases: any[]): number {
  // Base confidence on number of symptoms and disease matches
  const symptomFactor = Math.min(symptoms.length / 5, 1); // Normalize to 0-1
  const diseaseFactor = detectedDiseases.length > 0 ? 0.8 : 0.3;
  
  // Weighted average
  const confidence = (symptomFactor * 0.4 + diseaseFactor * 0.6) * 100;
  
  return Math.round(confidence);
}
