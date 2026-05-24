export interface ScoreBreakdown {
  impact: number;       // 0-100
  formatting: number;   // 0-100
  keywords: number;     // 0-100
  style: number;        // 0-100
}

export interface MistakeSolution {
  originalText?: string;
  correctedText: string;
  explanation: string;
}

export type Severity = "critical" | "warning" | "optimization";
export type Category = "formatting" | "impact" | "keywords" | "style";

export interface ResumeMistake {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  explanation: string;
  solutions: MistakeSolution[];
}

export interface ParsedInformation {
  name: string;
  email: string;
  phone: string;
  skillsFound: string[];
  skillsMissing: string[];
}

export interface ATSKeyword {
  keyword: string;
  found: boolean;
  importance: "high" | "medium" | "low";
}

export interface ScoringResult {
  score: number;
  breakdown: ScoreBreakdown;
  summary: string;
  strengths: string[];
  mistakes: ResumeMistake[];
  parsedInfo: ParsedInformation;
  atsKeywords: ATSKeyword[];
  suggestedTemplates?: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  filename: string;
  role: string;
  score: number;
  result: ScoringResult;
}
