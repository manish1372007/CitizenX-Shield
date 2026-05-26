export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  userId: string;
  userName: string;
  phoneNumber: string; // 10 digits
  scamType: string;
  description: string;
  createdAt: string;
}

export interface VerificationResult {
  _id: string;
  userId: string;
  userName: string;
  fileName: string;
  aadhaarNumber: string;
  extractedText: string;
  issuesFound: string[];
  score: number;
  result: "Likely Genuine" | "Suspicious" | "Likely Fake";
  confidence: string;
  createdAt: string;
}

export interface DeepfakeDetectionResult {
  _id: string;
  userId: string;
  userName: string;
  fileName: string;
  metadataPresent: boolean;
  textureScore: number;
  patternScore: number;
  edgeScore: number;
  totalScore: number;
  result: "Highly Suspicious" | "Suspicious" | "Low Risk";
  createdAt: string;
}

export interface Stats {
  totalReports: number;
  highRiskCount: number;
  totalVerifications: number;
  deepfakesDetected: number;
}
