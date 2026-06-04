/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VisualElement {
  id: string;
  type: "input" | "button" | "logo" | "text" | "warning_overlay" | "form_field";
  label: string;
  value: string;
  riskLabel: string;
  hazardSeverity: "none" | "low" | "high" | "critical";
  selector?: string;
  placeholder?: string;
}

export interface ThreatAnalysis {
  domainRisk: string;
  credentialHarvest: string;
  urgencyManipulation: string;
  unauthorizedMimicry: string;
}

export interface SystemReport {
  apiCallsDetected: string[];
  redirectChain: string[];
  permissionsRequested: string[];
  apkPayloadDetected: boolean;
  apkPayloadName: string | null;
}

export interface SandboxConsoleLog {
  id: string;
  time: string;
  action: string;
  type: "info" | "success" | "warning" | "danger";
}

export interface VisualMockup {
  backgroundColor: string;
  textColor?: string;
  brandName: string;
  titleText: string;
  subText: string;
  elements: VisualElement[];
  mimicBrandLogo?: string;
}

export interface AnalysisResult {
  id: string;
  url: string;
  timestamp: string;
  isReachable: boolean;
  threatScore: number; // 0 - 100
  verdict: "SAFE" | "MILD_SUSPICION" | "MALICIOUS" | "CRITICAL_THREAT";
  category: "Phishing Card" | "Fake Shopping" | "Account Impersonation" | "Investment Scam" | "Safe / Informational" | "Unknown Suspicious";
  mismatchedBrand: string;
  summary: string;
  threatAnalysis: ThreatAnalysis;
  systemReport: SystemReport;
  sandboxConsoleLogs: SandboxConsoleLog[];
  visualMockup: VisualMockup;
  safetyRecommendations: string[];
}
