export interface ScanCondition {
  name: string;
  confidence: number;
  description: string;
}

export interface ScanRegion {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  severity: "low" | "medium" | "high";
}

export interface ScanExplanation {
  summary: string;
  details: string[];
  reasoning: string;
}

export interface QualityAssessment {
  quality: "Good" | "Acceptable" | "Poor";
  issues: string[];
}

export interface ScanAnalysis {
  scanType: string;
  scanTypeConfidence: number;
  overallResult: "Normal" | "Abnormal";
  overallConfidence: number;
  conditions: ScanCondition[];
  regions: ScanRegion[];
  explanation: ScanExplanation;
  riskLevel: "Low" | "Medium" | "High";
  qualityAssessment: QualityAssessment;
  recommendations: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
