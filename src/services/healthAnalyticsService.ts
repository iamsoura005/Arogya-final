/**
 * Advanced Health Analytics Service
 * Handles biomarker tracking, correlations, risk scoring, and FHIR export
 */

// ============= TYPES =============

export interface Biomarker {
  id: string;
  userId: string;
  type: 'blood_pressure' | 'glucose' | 'heart_rate' | 'weight' | 'bmi' | 'temperature' | 'spo2' | 'cholesterol';
  value: number;
  unit: string;
  systolic?: number; // for blood pressure
  diastolic?: number; // for blood pressure
  timestamp: string;
  source: 'manual' | 'device' | 'lab';
  notes?: string;
}

export interface CorrelationAnalysis {
  factor1: string;
  factor2: string;
  correlationCoefficient: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  insights: string[];
  dataPoints: number;
}

export interface RiskScore {
  id: string;
  userId: string;
  riskType: 'cardiovascular' | 'diabetes' | 'stroke' | 'obesity' | 'hypertension';
  score: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  factors: RiskFactor[];
  recommendations: string[];
  calculatedAt: string;
  nextAssessment: string;
}

export interface RiskFactor {
  name: string;
  value: any;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface CohortComparison {
  userId: string;
  age: number;
  gender: string;
  userMetrics: Record<string, number>;
  cohortAverages: Record<string, number>;
  percentiles: Record<string, number>; // where user stands (0-100)
  insights: string[];
}

export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}

// ============= BIOMARKER TRACKING =============

/**
 * Add biomarker reading
 */
export function addBiomarker(
  userId: string,
  biomarkerData: Omit<Biomarker, 'id' | 'userId' | 'timestamp'>
): Biomarker {
  const biomarker: Biomarker = {
    id: `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    timestamp: new Date().toISOString(),
    ...biomarkerData
  };

  const biomarkers = getStoredBiomarkers();
  biomarkers.push(biomarker);
  localStorage.setItem('arogya_biomarkers', JSON.stringify(biomarkers));

  return biomarker;
}

/**
 * Get stored biomarkers
 */
function getStoredBiomarkers(): Biomarker[] {
  const stored = localStorage.getItem('arogya_biomarkers');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's biomarkers
 */
export function getUserBiomarkers(
  userId: string,
  type?: Biomarker['type'],
  days?: number
): Biomarker[] {
  let biomarkers = getStoredBiomarkers().filter(b => b.userId === userId);

  if (type) {
    biomarkers = biomarkers.filter(b => b.type === type);
  }

  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    biomarkers = biomarkers.filter(b => new Date(b.timestamp) >= cutoffDate);
  }

  return biomarkers.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get biomarker trends
 */
export function getBiomarkerTrends(
  userId: string,
  type: Biomarker['type'],
  days: number = 30
): {
  average: number;
  min: number;
  max: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  data: Array<{ date: string; value: number }>;
} {
  const biomarkers = getUserBiomarkers(userId, type, days);
  
  if (biomarkers.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
      changePercent: 0,
      data: []
    };
  }

  const values = biomarkers.map(b => b.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Calculate trend (compare first half vs second half)
  const midpoint = Math.floor(biomarkers.length / 2);
  const firstHalf = biomarkers.slice(midpoint).map(b => b.value);
  const secondHalf = biomarkers.slice(0, midpoint).map(b => b.value);
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
  const trend = changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable';

  const data = biomarkers.reverse().map(b => ({
    date: new Date(b.timestamp).toLocaleDateString(),
    value: b.value
  }));

  return { average, min, max, trend, changePercent, data };
}

// ============= CORRELATION ANALYSIS =============

/**
 * Analyze correlation between two factors
 */
export function analyzeCorrelation(
  userId: string,
  factor1: string,
  factor2: string,
  days: number = 90
): CorrelationAnalysis {
  // Get data for both factors
  const data1 = getFactorData(userId, factor1, days);
  const data2 = getFactorData(userId, factor2, days);

  // Match data points by date
  const pairedData: Array<[number, number]> = [];
  data1.forEach(d1 => {
    const d2 = data2.find(d => d.date === d1.date);
    if (d2) {
      pairedData.push([d1.value, d2.value]);
    }
  });

  const correlationCoefficient = calculatePearsonCorrelation(pairedData);
  const strength = getCorrelationStrength(correlationCoefficient);
  const insights = generateCorrelationInsights(factor1, factor2, correlationCoefficient);

  return {
    factor1,
    factor2,
    correlationCoefficient,
    strength,
    insights,
    dataPoints: pairedData.length
  };
}

/**
 * Get factor data
 */
function getFactorData(userId: string, factor: string, days: number): Array<{ date: string; value: number }> {
  // Check if it's a biomarker
  const biomarkerTypes: Biomarker['type'][] = ['blood_pressure', 'glucose', 'heart_rate', 'weight', 'bmi', 'temperature', 'spo2', 'cholesterol'];
  
  if (biomarkerTypes.includes(factor as any)) {
    const biomarkers = getUserBiomarkers(userId, factor as Biomarker['type'], days);
    return biomarkers.map(b => ({
      date: new Date(b.timestamp).toISOString().split('T')[0],
      value: b.value
    }));
  }

  // Check symptoms or medications (from logs)
  // For demo, return mock data
  return [];
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(data: Array<[number, number]>): number {
  if (data.length < 2) return 0;

  const n = data.length;
  const x = data.map(d => d[0]);
  const y = data.map(d => d[1]);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((sum, [xi, yi]) => sum + xi * yi, 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Get correlation strength
 */
function getCorrelationStrength(coefficient: number): 'strong' | 'moderate' | 'weak' | 'none' {
  const abs = Math.abs(coefficient);
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'none';
}

/**
 * Generate correlation insights
 */
function generateCorrelationInsights(factor1: string, factor2: string, coefficient: number): string[] {
  const insights: string[] = [];
  const abs = Math.abs(coefficient);
  const direction = coefficient > 0 ? 'positive' : 'negative';

  if (abs >= 0.7) {
    insights.push(`Strong ${direction} correlation detected between ${factor1} and ${factor2}.`);
  } else if (abs >= 0.4) {
    insights.push(`Moderate ${direction} correlation found between ${factor1} and ${factor2}.`);
  } else {
    insights.push(`Weak or no significant correlation between ${factor1} and ${factor2}.`);
  }

  // Specific insights
  if (factor1 === 'stress' && factor2 === 'headache' && coefficient > 0.5) {
    insights.push('High stress days appear to trigger more frequent headaches. Consider stress management techniques.');
  }

  if (factor1 === 'glucose' && factor2 === 'weight' && coefficient > 0.4) {
    insights.push('Blood glucose levels correlate with weight. Weight management may help control glucose.');
  }

  return insights;
}

// ============= RISK SCORING =============

/**
 * Calculate cardiovascular risk score (Framingham-inspired)
 */
export function calculateCardiovascularRisk(
  userId: string,
  age: number,
  gender: 'male' | 'female',
  smoker: boolean,
  diabetic: boolean,
  familyHistory: boolean
): RiskScore {
  const factors: RiskFactor[] = [];
  let score = 0;

  // Age factor
  if (age >= 65) {
    score += 30;
    factors.push({ name: 'Age 65+', value: age, impact: 'negative', weight: 30 });
  } else if (age >= 55) {
    score += 20;
    factors.push({ name: 'Age 55-64', value: age, impact: 'negative', weight: 20 });
  } else if (age >= 45) {
    score += 10;
    factors.push({ name: 'Age 45-54', value: age, impact: 'negative', weight: 10 });
  }

  // Get recent biomarkers
  const recentBP = getUserBiomarkers(userId, 'blood_pressure', 30)[0];
  const recentCholesterol = getUserBiomarkers(userId, 'cholesterol', 90)[0];

  // Blood pressure
  if (recentBP) {
    if (recentBP.systolic! >= 140 || recentBP.diastolic! >= 90) {
      score += 20;
      factors.push({ name: 'High Blood Pressure', value: `${recentBP.systolic}/${recentBP.diastolic}`, impact: 'negative', weight: 20 });
    }
  }

  // Cholesterol
  if (recentCholesterol && recentCholesterol.value >= 240) {
    score += 15;
    factors.push({ name: 'High Cholesterol', value: recentCholesterol.value, impact: 'negative', weight: 15 });
  }

  // Smoking
  if (smoker) {
    score += 20;
    factors.push({ name: 'Smoking', value: true, impact: 'negative', weight: 20 });
  }

  // Diabetes
  if (diabetic) {
    score += 15;
    factors.push({ name: 'Diabetes', value: true, impact: 'negative', weight: 15 });
  }

  // Family history
  if (familyHistory) {
    score += 10;
    factors.push({ name: 'Family History', value: true, impact: 'negative', weight: 10 });
  }

  const riskLevel = score >= 70 ? 'very-high' : score >= 50 ? 'high' : score >= 30 ? 'moderate' : 'low';
  const recommendations = generateCardiovascularRecommendations(riskLevel, factors);

  const riskScore: RiskScore = {
    id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    riskType: 'cardiovascular',
    score,
    riskLevel,
    factors,
    recommendations,
    calculatedAt: new Date().toISOString(),
    nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
  };

  // Save risk score
  const scores = getStoredRiskScores();
  scores.push(riskScore);
  localStorage.setItem('arogya_risk_scores', JSON.stringify(scores));

  return riskScore;
}

/**
 * Get stored risk scores
 */
function getStoredRiskScores(): RiskScore[] {
  const stored = localStorage.getItem('arogya_risk_scores');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Generate cardiovascular recommendations
 */
function generateCardiovascularRecommendations(riskLevel: string, factors: RiskFactor[]): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'very-high' || riskLevel === 'high') {
    recommendations.push('🚨 Schedule an appointment with a cardiologist immediately');
    recommendations.push('💊 Discuss medication options with your doctor');
  }

  recommendations.push('🥗 Adopt a heart-healthy diet (Mediterranean or DASH diet)');
  recommendations.push('🏃 Aim for 150 minutes of moderate exercise per week');
  
  if (factors.some(f => f.name === 'Smoking')) {
    recommendations.push('🚭 Quit smoking - consult a smoking cessation program');
  }

  if (factors.some(f => f.name === 'High Blood Pressure')) {
    recommendations.push('📊 Monitor blood pressure daily');
    recommendations.push('🧂 Reduce sodium intake to <2000mg/day');
  }

  if (factors.some(f => f.name === 'High Cholesterol')) {
    recommendations.push('🥑 Increase intake of healthy fats (omega-3, avocados)');
    recommendations.push('🚫 Limit saturated and trans fats');
  }

  recommendations.push('😴 Maintain 7-9 hours of quality sleep');
  recommendations.push('🧘 Practice stress management (meditation, yoga)');

  return recommendations;
}

/**
 * Calculate diabetes risk score
 */
export function calculateDiabetesRisk(
  userId: string,
  age: number,
  bmi: number,
  familyHistory: boolean,
  physicallyActive: boolean
): RiskScore {
  const factors: RiskFactor[] = [];
  let score = 0;

  // Age
  if (age >= 45) {
    score += 15;
    factors.push({ name: 'Age 45+', value: age, impact: 'negative', weight: 15 });
  }

  // BMI
  if (bmi >= 30) {
    score += 30;
    factors.push({ name: 'Obesity (BMI 30+)', value: bmi, impact: 'negative', weight: 30 });
  } else if (bmi >= 25) {
    score += 15;
    factors.push({ name: 'Overweight (BMI 25-30)', value: bmi, impact: 'negative', weight: 15 });
  }

  // Family history
  if (familyHistory) {
    score += 25;
    factors.push({ name: 'Family History of Diabetes', value: true, impact: 'negative', weight: 25 });
  }

  // Physical activity
  if (!physicallyActive) {
    score += 20;
    factors.push({ name: 'Sedentary Lifestyle', value: false, impact: 'negative', weight: 20 });
  } else {
    factors.push({ name: 'Physically Active', value: true, impact: 'positive', weight: -10 });
  }

  // Check glucose levels
  const recentGlucose = getUserBiomarkers(userId, 'glucose', 30)[0];
  if (recentGlucose && recentGlucose.value >= 100) {
    score += 20;
    factors.push({ name: 'Elevated Fasting Glucose', value: recentGlucose.value, impact: 'negative', weight: 20 });
  }

  const riskLevel = score >= 70 ? 'very-high' : score >= 50 ? 'high' : score >= 30 ? 'moderate' : 'low';

  const recommendations = [
    '🥗 Follow a low-glycemic diet',
    '🏃 Engage in regular physical activity (30min/day)',
    '⚖️ Maintain healthy weight (BMI 18.5-24.9)',
    '📊 Monitor blood glucose levels regularly',
    '💧 Stay hydrated with water',
    '😴 Get adequate sleep (7-9 hours)',
    riskLevel === 'high' || riskLevel === 'very-high' 
      ? '👨‍⚕️ Schedule HbA1c test with your doctor' 
      : '✅ Continue healthy lifestyle habits'
  ];

  const riskScore: RiskScore = {
    id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    riskType: 'diabetes',
    score,
    riskLevel,
    factors,
    recommendations,
    calculatedAt: new Date().toISOString(),
    nextAssessment: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
  };

  const scores = getStoredRiskScores();
  scores.push(riskScore);
  localStorage.setItem('arogya_risk_scores', JSON.stringify(scores));

  return riskScore;
}

// ============= COHORT COMPARISON =============

/**
 * Compare user metrics to cohort averages
 */
export function compareToCohort(
  userId: string,
  age: number,
  gender: string
): CohortComparison {
  // Get user's latest metrics
  const userMetrics: Record<string, number> = {};
  
  const latestBP = getUserBiomarkers(userId, 'blood_pressure', 7)[0];
  if (latestBP) userMetrics.blood_pressure = latestBP.systolic!;
  
  const latestGlucose = getUserBiomarkers(userId, 'glucose', 7)[0];
  if (latestGlucose) userMetrics.glucose = latestGlucose.value;
  
  const latestWeight = getUserBiomarkers(userId, 'weight', 7)[0];
  if (latestWeight) userMetrics.weight = latestWeight.value;

  const latestBMI = getUserBiomarkers(userId, 'bmi', 7)[0];
  if (latestBMI) userMetrics.bmi = latestBMI.value;

  // Cohort averages (based on CDC/WHO data for age/gender)
  const cohortAverages = getCohortAverages(age, gender);
  
  // Calculate percentiles
  const percentiles: Record<string, number> = {};
  const insights: string[] = [];

  Object.keys(userMetrics).forEach(metric => {
    const userValue = userMetrics[metric];
    const cohortAvg = cohortAverages[metric];
    
    if (cohortAvg) {
      const percentile = calculatePercentile(userValue, cohortAvg, metric);
      percentiles[metric] = percentile;

      if (percentile < 25) {
        insights.push(`Your ${metric} is in the lower 25% compared to your age/gender group`);
      } else if (percentile > 75) {
        insights.push(`Your ${metric} is in the upper 25% compared to your age/gender group`);
      }
    }
  });

  return {
    userId,
    age,
    gender,
    userMetrics,
    cohortAverages,
    percentiles,
    insights
  };
}

/**
 * Get cohort averages (mock data based on population statistics)
 */
function getCohortAverages(age: number, gender: string): Record<string, number> {
  // Simplified averages - in production, use actual population data
  const averages: Record<string, number> = {};

  if (age < 30) {
    averages.blood_pressure = 120;
    averages.glucose = 90;
    averages.bmi = 24;
    averages.heart_rate = 70;
  } else if (age < 50) {
    averages.blood_pressure = 125;
    averages.glucose = 95;
    averages.bmi = 26;
    averages.heart_rate = 72;
  } else {
    averages.blood_pressure = 130;
    averages.glucose = 100;
    averages.bmi = 27;
    averages.heart_rate = 75;
  }

  // Gender adjustments
  if (gender === 'female') {
    averages.blood_pressure -= 5;
    averages.bmi -= 1;
  }

  return averages;
}

/**
 * Calculate percentile
 */
function calculatePercentile(userValue: number, cohortAvg: number, metric: string): number {
  // Simplified percentile calculation
  // In production, use actual distribution data
  const stdDev = cohortAvg * 0.15; // Assume 15% std deviation
  const zScore = (userValue - cohortAvg) / stdDev;
  
  // Convert z-score to percentile (approximate)
  const percentile = 50 + (zScore * 20);
  return Math.max(0, Math.min(100, percentile));
}

// ============= FHIR EXPORT =============

/**
 * Export user data in FHIR format
 */
export function exportToFHIR(userId: string): FHIRResource[] {
  const resources: FHIRResource[] = [];

  // Patient resource
  const patient: FHIRResource = {
    resourceType: 'Patient',
    id: userId,
    meta: {
      lastUpdated: new Date().toISOString()
    },
    identifier: [{
      system: 'https://arogya.health/patient-id',
      value: userId
    }]
  };
  resources.push(patient);

  // Observations (biomarkers)
  const biomarkers = getUserBiomarkers(userId);
  biomarkers.forEach(bio => {
    const observation: FHIRResource = {
      resourceType: 'Observation',
      id: bio.id,
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: getFHIRCode(bio.type),
          display: bio.type
        }]
      },
      subject: {
        reference: `Patient/${userId}`
      },
      effectiveDateTime: bio.timestamp,
      valueQuantity: {
        value: bio.value,
        unit: bio.unit
      }
    };
    resources.push(observation);
  });

  return resources;
}

/**
 * Get FHIR LOINC code for biomarker type
 */
function getFHIRCode(type: Biomarker['type']): string {
  const codes: Record<string, string> = {
    'blood_pressure': '85354-9',
    'glucose': '2339-0',
    'heart_rate': '8867-4',
    'weight': '29463-7',
    'bmi': '39156-5',
    'temperature': '8310-5',
    'spo2': '59408-5',
    'cholesterol': '2093-3'
  };
  return codes[type] || '00000-0';
}

export default {
  addBiomarker,
  getUserBiomarkers,
  getBiomarkerTrends,
  analyzeCorrelation,
  calculateCardiovascularRisk,
  calculateDiabetesRisk,
  compareToCohort,
  exportToFHIR
};
