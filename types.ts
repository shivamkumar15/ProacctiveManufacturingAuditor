export interface AuditResult {
  anomalyDetection: string;
  rootCauseAnalysis: string;
  prescribedFix: string;
}

export enum AppStatus {
  IDLE = 'idle',
  ANALYZING = 'analyzing',
  SUCCESS = 'success',
  ERROR = 'error',
}
