export interface Scan {
  id: string;
  targetUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface Vulnerability {
  id: string;
  scanId: string;
  type: 'registration' | 'idor' | 'sqli' | 'auth_bypass' | 'xss' | 'csrf';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  parameter?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  proof?: any;
  exploited: boolean;
  createdAt: string;
}

export interface Exploit {
  id: string;
  vulnerabilityId: string;
  exploitType: string;
  payload?: any;
  result?: ExploitResult;
  evidence?: any;
  executedAt: string;
}

export interface ExploitResult {
  success: boolean;
  exploits: any[];
  evidence: any[];
  logs: LogEntry[];
  startedAt: string;
  completedAt: string | null;
  duration: number;
  summary?: {
    totalAttempts?: number;
    successful?: number;
    failed?: number;
    accountsCreated?: number;
    resourcesAccessed?: number;
    sensitiveData?: number;
  };
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  exploited: number;
}
