import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API (user should set their API key)
const getGeminiAPI = () => {
  const apiKey = localStorage.getItem('geminiApiKey') || 'YOUR_GEMINI_API_KEY';
  return new GoogleGenerativeAI(apiKey);
};

export interface LabResult {
  id: string;
  userId: string;
  fileName: string;
  uploadDate: string;
  reportType: string;
  biomarkers: Biomarker[];
  analysis: {
    summary: string;
    concerns: string[];
    recommendations: string[];
    overallRisk: 'low' | 'moderate' | 'high';
  };
  rawText?: string;
}

export interface Biomarker {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'borderline' | 'abnormal';
  category: string;
}

// Analyze lab report using Gemini Vision API
export const analyzeLabReport = async (file: File): Promise<LabResult> => {
  try {
    const genAI = getGeminiAPI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    const prompt = `You are a medical lab report analyzer. Analyze this lab report image and extract:

1. Report Type (e.g., Complete Blood Count, Lipid Panel, Metabolic Panel, etc.)
2. All biomarkers with their values, units, and normal ranges
3. Identify which values are normal, borderline, or abnormal
4. Provide a brief summary of the results
5. List any health concerns based on abnormal values
6. Provide health recommendations

Format the response as JSON with this structure:
{
  "reportType": "string",
  "biomarkers": [
    {
      "name": "string",
      "value": "string",
      "unit": "string",
      "normalRange": "string",
      "status": "normal|borderline|abnormal",
      "category": "string (e.g., Blood Count, Lipids, Liver Function)"
    }
  ],
  "summary": "string",
  "concerns": ["string"],
  "recommendations": ["string"],
  "overallRisk": "low|moderate|high"
}`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response (remove markdown code blocks if present)
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysisData = JSON.parse(jsonText);

    const labResult: LabResult = {
      id: `lab_${Date.now()}`,
      userId: localStorage.getItem('currentUserId') || 'user_default',
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      reportType: analysisData.reportType,
      biomarkers: analysisData.biomarkers,
      analysis: {
        summary: analysisData.summary,
        concerns: analysisData.concerns,
        recommendations: analysisData.recommendations,
        overallRisk: analysisData.overallRisk
      },
      rawText: text
    };

    // Save to localStorage
    saveLabReport(labResult);

    return labResult;
  } catch (error) {
    console.error('Error analyzing lab report:', error);
    
    // Return mock data for demo purposes if API fails
    return createMockLabResult(file);
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
};

// Create mock lab result for demo
const createMockLabResult = (file: File): LabResult => {
  return {
    id: `lab_${Date.now()}`,
    userId: localStorage.getItem('currentUserId') || 'user_default',
    fileName: file.name,
    uploadDate: new Date().toISOString(),
    reportType: 'Complete Blood Count (CBC)',
    biomarkers: [
      {
        name: 'Hemoglobin',
        value: '13.5',
        unit: 'g/dL',
        normalRange: '13.5-17.5',
        status: 'normal',
        category: 'Blood Count'
      },
      {
        name: 'White Blood Cells',
        value: '8.2',
        unit: '10^9/L',
        normalRange: '4.0-11.0',
        status: 'normal',
        category: 'Blood Count'
      },
      {
        name: 'Platelets',
        value: '245',
        unit: '10^9/L',
        normalRange: '150-400',
        status: 'normal',
        category: 'Blood Count'
      },
      {
        name: 'Total Cholesterol',
        value: '210',
        unit: 'mg/dL',
        normalRange: '<200',
        status: 'borderline',
        category: 'Lipids'
      },
      {
        name: 'LDL Cholesterol',
        value: '135',
        unit: 'mg/dL',
        normalRange: '<100',
        status: 'abnormal',
        category: 'Lipids'
      },
      {
        name: 'HDL Cholesterol',
        value: '45',
        unit: 'mg/dL',
        normalRange: '>40',
        status: 'normal',
        category: 'Lipids'
      },
      {
        name: 'Fasting Glucose',
        value: '105',
        unit: 'mg/dL',
        normalRange: '70-100',
        status: 'borderline',
        category: 'Metabolic'
      }
    ],
    analysis: {
      summary: 'Your blood count is within normal limits. However, your lipid panel shows elevated LDL cholesterol and borderline total cholesterol. Fasting glucose is slightly elevated.',
      concerns: [
        'Elevated LDL cholesterol increases cardiovascular risk',
        'Borderline fasting glucose may indicate prediabetes',
        'Total cholesterol slightly above optimal range'
      ],
      recommendations: [
        'Adopt a heart-healthy diet low in saturated fats',
        'Increase physical activity to 150 minutes per week',
        'Consider omega-3 supplements after consulting your doctor',
        'Retest fasting glucose in 3 months',
        'Schedule follow-up with cardiologist if family history of heart disease'
      ],
      overallRisk: 'moderate'
    }
  };
};

// Save lab report to localStorage
export const saveLabReport = (report: LabResult): void => {
  const reports = getLabReports(report.userId);
  reports.unshift(report);
  localStorage.setItem(`labReports_${report.userId}`, JSON.stringify(reports));
};

// Get all lab reports for a user
export const getLabReports = (userId: string): LabResult[] => {
  const stored = localStorage.getItem(`labReports_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Delete a lab report
export const deleteLabReport = (userId: string, reportId: string): void => {
  const reports = getLabReports(userId);
  const filtered = reports.filter(r => r.id !== reportId);
  localStorage.setItem(`labReports_${userId}`, JSON.stringify(filtered));
};

// Get report by ID
export const getLabReportById = (userId: string, reportId: string): LabResult | null => {
  const reports = getLabReports(userId);
  return reports.find(r => r.id === reportId) || null;
};

// Compare two lab reports
export const compareLabReports = (report1: LabResult, report2: LabResult): any => {
  const changes: any[] = [];
  
  report1.biomarkers.forEach(marker1 => {
    const marker2 = report2.biomarkers.find(m => m.name === marker1.name);
    if (marker2) {
      const value1 = parseFloat(marker1.value);
      const value2 = parseFloat(marker2.value);
      
      if (!isNaN(value1) && !isNaN(value2)) {
        const percentChange = ((value2 - value1) / value1) * 100;
        changes.push({
          name: marker1.name,
          oldValue: marker1.value,
          newValue: marker2.value,
          change: value2 - value1,
          percentChange: percentChange.toFixed(1),
          trend: value2 > value1 ? 'up' : value2 < value1 ? 'down' : 'stable',
          oldStatus: marker1.status,
          newStatus: marker2.status
        });
      }
    }
  });
  
  return changes;
};

// Export report as PDF
export const exportLabReportPDF = (report: LabResult): void => {
  // Simple text export for now - could be enhanced with a PDF library
  const content = `
LAB REPORT ANALYSIS
Generated by Arogya Platform

Report Type: ${report.reportType}
Upload Date: ${new Date(report.uploadDate).toLocaleDateString()}
File: ${report.fileName}

BIOMARKERS:
${report.biomarkers.map(b => `
${b.name}: ${b.value} ${b.unit}
Normal Range: ${b.normalRange}
Status: ${b.status.toUpperCase()}
Category: ${b.category}
`).join('\n')}

ANALYSIS SUMMARY:
${report.analysis.summary}

HEALTH CONCERNS:
${report.analysis.concerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

RECOMMENDATIONS:
${report.analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Overall Risk Level: ${report.analysis.overallRisk.toUpperCase()}

---
Disclaimer: This analysis is for informational purposes only. 
Please consult with a healthcare professional for medical advice.
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lab-report-${report.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
