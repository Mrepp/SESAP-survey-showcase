export interface LLMModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface Summary {
  id: string;
  summaryText: string;
  category: string;
  confidence: number;
}

export type Term =
  | 'pre_college'
  | 'freshman_fall'
  | 'freshman_winter'
  | 'freshman_spring'
  | 'freshman_summer'
  | 'sophomore_fall'
  | 'sophomore_winter'
  | 'sophomore_spring'
  | 'sophomore_summer'
  | 'junior_fall'
  | 'junior_winter'
  | 'junior_spring'
  | 'junior_summer'
  | 'senior_fall'
  | 'senior_winter'
  | 'senior_spring'
  | 'senior_summer'
  | 'post_college'
  | 'unknown';

export interface TimelinePoint {
  id: string;
  event: string;
  period: string;
  significance: string;
  position?: number;
  term?: Term;
}

export interface Identity {
  label: string;
  confidence: number;
  evidence: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: number;
  impactScore?: number;
  actionable?: boolean;
  relatedQuoteIds: string[];
}

export interface Quote {
  id: string;
  quoteText: string;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  tags: string[];
  themeIds: string[];
  timestamp?: string;
  significanceLevel?: 'high' | 'medium' | 'low';
  timelineEventId?: string;
}

export interface AreaForImprovement {
  id: string;
  area: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title?: string;
  stakeholders?: string[];
  actionItems?: string[];
}

export interface Analysis {
  interviewId: string;
  modelConfig: LLMModelConfig;
  summaries: Summary[];
  timeline: TimelinePoint[];
  themes: Theme[];
  quotes: Quote[];
  areasForImprovement: AreaForImprovement[];
  identities?: Identity[];
  demographics?: Partial<import('./interview').Demographics>;
  generatedAt: string;
  promptVersion?: string;
  promptHash?: string;
  schemaVersion?: string;
}
